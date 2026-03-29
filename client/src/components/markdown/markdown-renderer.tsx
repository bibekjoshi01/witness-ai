'use client'

import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import 'katex/dist/katex.min.css'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

type Props = {
  content?: string
  className?: string
  compact?: boolean
}

const TEST = `
This is a **comprehensive \`test.md\`** file that tests:

* All heading levels
* Paragraph spacing
* Lists
* Blockquotes
* Tables with column separators
* Code blocks (multiple languages)
* Inline code
* Images
* Horizontal rule
* Links
* Mathematical equations (inline and block)

---

# H1 Heading

This is a paragraph to test spacing and typography under H1.

## H2 Heading

This is a paragraph to test spacing and typography under H2.

### H3 Heading

This is a paragraph to test spacing and typography under H3.

---

## Lists

### Unordered List

- Item 1
- Item 2
  - Nested Item
  - Nested Item 2
- Item 3

### Ordered List

1. First
2. Second
    1. Nested First
    2. Nested Second
3. Third

---

## Blockquote

> This is a blockquote.
> It should have a visible left border, light background and proper spacing.

---

## Inline Code

Use \`const x = 10;\` inside a sentence.

---

## Code Blocks

### JavaScript

\`\`\`javascript
function greet(name) {
  console.log("Hello " + name)
}

greet("World")
\`\`\`\`

### Python

\`\`\`python
def greet(name):
    print("Hello", name)

greet("World")
\`\`\`

---

## Table Test

| Name    | Age | Role      |
| ------- | --- | --------- |
| Alice   | 25  | Developer |
| Bob     | 30  | Designer  |
| Charlie | 28  | Engineer  |

---

## Image Test

![Test Image](https://imgs.search.brave.com/-4iNfhJQGpwcWH4WS2hZmE9F7_vc8qXaDowXI_bBmHc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jb250/ZW50LnBleGVscy5j/b20vaW1hZ2VzL2Nh/bnZhL2FpLWdlbmVy/YXRlZC1hZC9vZmYt/dGhlbWUvaGlnaF9h/bHRpdHVkZV9hZXJp/YWxfdmlld19hYm92/ZV9jb3R0b25fc29m/dF9jbG91ZF90b3Bz/X2dsb3dpbmdfaW5f/Z29sZGVuX2hvdXJf/bGlnaHQtZnVsbC5q/cGc)

---

## Links

* [OpenAI](https://openai.com)
* [GitHub](https://github.com)

---

## Horizontal Rule

---

## Math Equations

### Inline Math

Inline example:
$E = mc^2$

Another inline:
$\\alpha + \\beta = \\gamma$

---

### Basic Block Equations

$$
x^2
$$

$$
\\frac{1}{2}
$$

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

$$
\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

---

### Nested Fractions

$$
\\frac{1}{1 + \\frac{1}{2}}
$$

---

### Powers & Roots

$$
e^{i\\pi} + 1 = 0
$$

$$
\\sqrt{a^2 + b^2}
$$

$$
\\sqrt[3]{x}
$$

---

### Limits

$$
\\lim_{x \\to 0} \\frac{\\sin x}{x}
$$

---

### Summation & Product

$$
\\sum_{n=1}^{\\infty} \\frac{1}{n^2}
$$

$$
\\prod_{i=1}^{n} i = n!
$$

---

### Matrices

$$
\\begin{bmatrix}
1 & 2 \\\\
3 & 4
\\end{bmatrix}
$$

---

### Trigonometry

$$
\\sin^2\\theta + \\cos^2\\theta = 1
$$

---

### Piecewise Function

$$
f(x) =
\\begin{cases}
x^2 & x \\ge 0 \\\\
-x   & x < 0
\\end{cases}
$$

---


End of test document.
`

const MarkdownRenderer: React.FC<Props> = ({ content = '', className, compact = false }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  // const cleaned = content?.replace(/^\s+/gm, '')

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedCode(text)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div
      className={cn(
        'w-full text-foreground',
        compact
          ? 'max-w-none mx-0 px-0 text-sm leading-6'
          : 'max-w-4xl mx-auto px-6 text-base leading-7',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
        rehypePlugins={[rehypeKatex]}
        components={{
          /* Headings */
          h1: ({ ...props }) => (
            <h1
              className="mt-10 mb-6 text-3xl font-semibold tracking-tight leading-tight"
              {...props}
            />
          ),

          h2: ({ ...props }) => (
            <h2
              className="mt-8 mb-4 text-2xl font-semibold tracking-tight leading-snug"
              {...props}
            />
          ),

          h3: ({ ...props }) => (
            <h3 className="mt-6 mb-2 text-xl font-medium leading-snug" {...props} />
          ),

          /* Paragraph  */
          p: ({ ...props }) => (
            <p
              className={cn(
                'text-foreground/90',
                compact ? 'mb-2 text-sm leading-6' : 'mb-6 text-base leading-8'
              )}
              {...props}
            />
          ),

          /* Links */
          a: ({ ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:opacity-80 transition"
            />
          ),

          table: ({ ...props }) => (
            <div className="w-full overflow-x-auto my-8 border border-border rounded-lg">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),

          thead: ({ ...props }) => <thead className="bg-muted" {...props} />,

          tbody: ({ ...props }) => <tbody {...props} />,

          tr: ({ ...props }) => (
            <tr
              className="border-b border-border last:border-b-0 hover:bg-muted/40 transition"
              {...props}
            />
          ),

          th: ({ ...props }) => (
            <th
              className="px-5 py-3 text-left font-semibold border-r border-border last:border-r-0 whitespace-nowrap"
              {...props}
            />
          ),

          td: ({ ...props }) => (
            <td
              className="px-5 py-3 border-r border-border last:border-r-0 text-foreground/80"
              {...props}
            />
          ),

          /* Code */
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const code = String(children).replace(/\n$/, '')

            if (!inline) {
              const isCopied = copiedCode === code
              const languageLabel = match?.[1] || 'code'

              return (
                <div className="group relative my-8 rounded-xl overflow-hidden text-sm border border-zinc-700">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-2 bg-[#282c34] border-b border-zinc-700">
                    <span className="text-xs uppercase tracking-wide text-zinc-400">
                      {languageLabel}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopy(code)}
                      className="h-7 w-7 cursor-pointer text-zinc-400 hover:text-white transition"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <pre className="m-0 overflow-x-auto bg-[#1e1e1e] p-4 text-zinc-100">
                    <code className={className} {...props}>
                      {code}
                    </code>
                  </pre>
                </div>
              )
            }

            return (
              <code
                className="px-1.5 py-0.5 rounded-md bg-muted/60 text-sm font-mono border border-border"
                {...props}
              >
                {children}
              </code>
            )
          },

          /* Blockquote */
          blockquote: ({ ...props }) => (
            <blockquote
              className="my-6 border-l-4 border-border bg-muted/50 pl-4 py-2 rounded-r-md text-foreground/80"
              {...props}
            />
          ),

          /* Lists */
          ul: ({ ...props }) => (
            <ul
              className={cn(
                'list-disc ml-6 text-foreground/85',
                compact ? 'my-2 space-y-1' : 'my-6 space-y-2'
              )}
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className={cn('list-decimal ml-6', compact ? 'my-2 space-y-1' : 'my-4 space-y-1.5')}
              {...props}
            />
          ),
          li: ({ ...props }) => <li className="leading-relaxed" {...props} />,

          /* Images */
          img: ({ ...props }) => (
            <img {...props} className="rounded-lg border border-border my-6 max-w-full" />
          ),

          /* Horizontal Rule */
          hr: () => <hr className="my-8 border-border/60" />,
        }}
      >
        {content || 'No content available.'}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer
