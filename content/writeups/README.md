# Writeups

Every `.mdx` file in this folder becomes a page at `/writeups/<filename>`.

## Adding one

1. Copy `_TEMPLATE.mdx.txt`
2. Rename it to `your-slug.mdx` (the filename becomes the URL)
3. Fill in the frontmatter, write the body in Markdown
4. Commit and push — Vercel rebuilds and it appears

## Frontmatter fields

| Field        | Required | Notes                                            |
| ------------ | -------- | ------------------------------------------------ |
| `title`      | yes      | Shown as the page heading                        |
| `summary`    | yes      | One or two sentences, shown on the index         |
| `date`       | yes      | `YYYY-MM-DD` — used for sorting, newest first    |
| `platform`   | no       | e.g. TryHackMe, HackTheBox, Notes                |
| `difficulty` | no       | `easy` \| `medium` \| `hard` \| `insane`         |
| `tags`       | no       | Array of strings, shown as chips                 |
| `draft`      | no       | `true` hides it in production, visible in dev    |

Files starting with `_` are ignored, which is why the template is safe here.

Code blocks support syntax highlighting and an optional title:

    ```bash title="nmap"
    nmap -sV 10.10.10.10
    ```
