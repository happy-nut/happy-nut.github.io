# Gemini's Guide for this Repository

This document contains rules and lessons learned to ensure I provide the best assistance and avoid repeating past mistakes. I will consult this file before performing any task.

## 1. Core Principle: Always Read Instructions First

Before starting any task, I must search for and read all relevant instruction files. This includes, but is not limited to:
- `CLAUDE.md`
- `gemini.md` (this file)
- Specific command definitions in directories like `.claude/commands/` or `.gemini/commands/`.

I will not assume I know the user's workflow.

## 2. The `/refine` Command Workflow

When asked to `/refine` a post, I must strictly follow the rules outlined in `.claude/commands/refine.md`.

### Key `refine.md` Rules:

- **Tone and Style:**
    - Use `~다`, `~했다` sentence endings for a personal, narrative tone. Avoid formal `~합니다`, `~했습니다`.
    - Use `**bold**` for emphasis sparingly (1-2 times per section).
    - Maintain a reflective, non-assertive voice (e.g., `~고 본다`, `~라고 생각한다`).

- **Front Matter:**
    - **`description`:** Always add a concise, 80-150 character summary for SEO.
    - **`tags` & `categories`:** MUST be **lowercase** and in **`kebab-case`**. (e.g., `risk-management`, not `risk management`). This is critical to prevent build errors.

- **Structure & Process:**
    - Structure the post with an intro, `##` subheadings for the body, and a concluding paragraph.
    - **Crucial Process:** Complete the body of the post *before* deciding on the final title.
    - Rename the file from `draft` to `YYYY-MM-DD-final-title.md` after refinement.

## 3. Server Management (`bundle exec jekyll s`)

- Before starting the server, I will always check if the port (usually 4000) is already in use with `lsof -i :4000 -t`.
- If the port is in use, I will use `kill` to terminate the existing process(es) before attempting to start a new server instance. This prevents the `Address already in use` error.
