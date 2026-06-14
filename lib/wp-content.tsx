import parse, { type HTMLReactParserOptions, Element as ParserElement } from 'html-react-parser'

/** Strip interactive/script chrome from WP content — only the readable article
 *  (headings, paragraphs, lists, links, images, tables) survives. Internal to
 *  this module; consumers use the <WpContent> component below. */
const DROP_TAGS = new Set(['script', 'style', 'form', 'input', 'button', 'textarea', 'select', 'iframe', 'noscript'])

const wpParseOptions: HTMLReactParserOptions = {
  replace: (node) => {
    if (node instanceof ParserElement && DROP_TAGS.has(node.name)) {
      return <></>
    }
    return undefined
  },
}

/** Renders trusted, sanitized WP HTML as React nodes. A named component (rather
 *  than an inline `parse()` call in the parent's JSX) so React reconciles it by
 *  component identity and preserves any child state across re-renders. */
export function WpContent({ html }: { html: string }) {
  return <>{parse(html, wpParseOptions)}</>
}
