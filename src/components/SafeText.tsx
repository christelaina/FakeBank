/**
 * Renders user-controlled text safely as a text node.
 * Never uses dangerouslySetInnerHTML.
 */
export function SafeText({
  value,
  as: Tag = "span",
  className,
}: {
  value: string;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3";
  className?: string;
}) {
  return <Tag className={className}>{value}</Tag>;
}
