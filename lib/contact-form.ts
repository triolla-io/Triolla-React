// Plain (non-"use server") module: types + initial state shared by the contact
// Server Action and its client consumer. A "use server" file may only export
// async functions, so these live here instead.

export type ContactStatus = 'idle' | 'sent' | 'error' | 'unconfigured'

export interface ContactFormState {
  status: ContactStatus
  /** General message (delivery failure, etc.). Null when not applicable. */
  message: string | null
  /** Per-field validation messages. */
  errors: Partial<Record<'name' | 'email' | 'phone', string>>
  /** Echoed back so the client can keep / reuse the entered values
   *  (e.g. to build a mailto fallback when delivery isn't configured). */
  values: { name: string; email: string; phone: string }
}

export const initialContactState: ContactFormState = {
  status: 'idle',
  message: null,
  errors: {},
  values: { name: '', email: '', phone: '' },
}
