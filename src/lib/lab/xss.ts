// Matches markup that runs script when rendered: script tags or inline event handlers.
const EXECUTABLE_MARKUP = /<script\b|<[a-z][^>]*\son[a-z]+\s*=/i;

export function hasExecutableMarkup(text: string): boolean {
  return EXECUTABLE_MARKUP.test(text);
}
