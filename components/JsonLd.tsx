// Injects a JSON-LD <script> for Schema.org structured data. LLMs and search
// engines parse this for reliable, machine-readable facts about a page instead
// of inferring them from prose. Content is trusted (built from our own WP data
// + known site constants), so embedding JSON is safe here.
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Escape '<' to avoid prematurely closing the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
