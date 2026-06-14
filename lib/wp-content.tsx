import parse, { type HTMLReactParserOptions, Element as ParserElement } from 'html-react-parser'

/** Strip interactive/script chrome from WP content — only the readable article
 *  (headings, paragraphs, lists, links, images, tables) survives. Shared by the
 *  legal pages and the blog article body. */
export const DROP_TAGS = new Set(['script', 'style', 'form', 'input', 'button', 'textarea', 'select', 'iframe', 'noscript'])

export const wpParseOptions: HTMLReactParserOptions = {
  replace: (node) => {
    if (node instanceof ParserElement && DROP_TAGS.has(node.name)) {
      return <></>
    }
    return undefined
  },
}

/** Parse trusted, sanitized WP HTML into React nodes. */
export function renderWpContent(html: string) {
  return parse(html, wpParseOptions)
}
