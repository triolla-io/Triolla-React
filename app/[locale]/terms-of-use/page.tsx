import type { Metadata } from 'next'
import { client } from '@/lib/apollo-client'
import { GET_CONTENT_PAGE } from '@/lib/queries'
import { gql } from '@apollo/client'
import { notFound } from 'next/navigation'
import { LegalArticle } from '@/components/LegalArticle'
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'

async function getPage(uri: string) {
  try {
    const { data } = await client.query<{
      page: { title: string | null; content: string | null } | null
    }>({
      query: gql`
        ${GET_CONTENT_PAGE}
      `,
      variables: { uri },
    })
    return data?.page ?? null
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(PAGE_URI.termsOfUse.en)
  return { title: page?.title ? `${page.title} | Triolla` : 'Terms of Use | Triolla' }
}

export default async function TermsOfUsePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const page = await getPage(PAGE_URI.termsOfUse[loc])
  if (!page || (!page.title && !page.content)) notFound()

  return <LegalArticle title={page.title} content={page.content} eyebrow="Legal" />
}
