'use server'

import { deliverLead } from '@/lib/leads'
import { initialContactState, type ContactFormState } from '@/lib/contact-form'

import { headers } from 'next/headers'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// In-memory rate limiting: 5 requests per minute per IP
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60 * 1000
const MAX_REQUESTS = 5

function str(formData: FormData, key: string): string {
  const v = formData.get(key)
  return typeof v === 'string' ? v.trim() : ''
}

/**
 * Server Action backing the site-wide contact form. Validates server-side,
 * drops obvious bots via a honeypot, then hands off to `deliverLead`. Returns a
 * typed state consumed by <WannaChatSection> on the client.
 */
export async function submitContactForm(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const name = str(formData, 'name')
  const email = str(formData, 'email')
  const phone = str(formData, 'phone')
  const values = { name, email, phone }

  // Rate Limiting Check
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || '127.0.0.1'
    const now = Date.now()
    const timestamps = rateLimitMap.get(ip) || []
    const recentTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
    
    if (recentTimestamps.length >= MAX_REQUESTS) {
      return {
        status: 'error',
        message: 'Too many requests. Please try again in a minute.',
        errors: {},
        values,
      }
    }
    
    recentTimestamps.push(now)
    rateLimitMap.set(ip, recentTimestamps)
  } catch (e) {
    // Fail-safe if headers() throws outside request context
    console.error('Rate limit error:', e)
  }

  // Honeypot: real users never fill the hidden "company" field. Acknowledge
  // silently so bots don't learn they were caught.
  if (str(formData, 'company')) {
    return { ...initialContactState, status: 'sent' }
  }

  const errors: ContactFormState['errors'] = {}
  if (!name) errors.name = 'Please enter your name.'
  if (!email) errors.email = 'Please enter your email.'
  else if (!EMAIL_RE.test(email)) errors.email = 'That email doesn’t look right.'

  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: null, errors, values }
  }

  const result = await deliverLead({ name, email, phone })

  // No provider wired up yet → tell the client to offer a direct-email
  // fallback rather than fake a success.
  if (!result.configured) {
    return { status: 'unconfigured', message: null, errors: {}, values }
  }

  if (!result.ok) {
    return {
      status: 'error',
      message: 'Something went wrong sending your message. Please try again, or email us directly.',
      errors: {},
      values,
    }
  }

  return {
    status: 'sent',
    message: null,
    errors: {},
    values: { name: '', email: '', phone: '' },
  }
}
