import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "b", "i", "em", "strong", "a", "ul", "ol", "li", "h1", "h2", "h3", 
      "blockquote", "img", "br", "div", "span"
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "target", "class", "style"],
  });
}
