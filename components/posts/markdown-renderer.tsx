import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span || []), "style"],
    mark: [...(defaultSchema.attributes?.mark || []), "style"],
    div: [...(defaultSchema.attributes?.div || []), "style"],
    p: [...(defaultSchema.attributes?.p || []), "style"],
    strong: [...(defaultSchema.attributes?.strong || []), "style"],
    em: [...(defaultSchema.attributes?.em || []), "style"],
    code: [...(defaultSchema.attributes?.code || []), "style"],
    pre: [...(defaultSchema.attributes?.pre || []), "style"],
    a: [...(defaultSchema.attributes?.a || []), "style"],
    h1: [...(defaultSchema.attributes?.h1 || []), "style"],
    h2: [...(defaultSchema.attributes?.h2 || []), "style"],
    h3: [...(defaultSchema.attributes?.h3 || []), "style"],
    h4: [...(defaultSchema.attributes?.h4 || []), "style"],
  },
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, sanitizeSchema],
          rehypeHighlight,
          rehypeSlug,
        ]}
        components={{
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
