// Bundled to admin/lib/editor.js. Exposes window.WriteEditor.create(el, markdown, opts).
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import { Markdown } from 'tiptap-markdown';

const create = (el, markdown, { placeholder = '', assetBase = '', onChange = () => {}, onState = () => {} } = {}) => {
  // Show repo images from GitHub raw so freshly uploaded ones appear before the site redeploys; markdown keeps the site path.
  const SiteImage = Image.extend({
    renderHTML({ HTMLAttributes }) {
      const src = String(HTMLAttributes.src || '');
      return ['img', { ...HTMLAttributes, src: assetBase && src.startsWith('/assets/') ? assetBase + src : src }];
    },
  });
  const editor = new Editor({
    element: el,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] }, link: { openOnClick: false, autolink: true } }),
      SiteImage.configure({ inline: false }),
      TableKit,
      Placeholder.configure({ placeholder }),
      Markdown.configure({ html: true, tightLists: true, breaks: false, linkify: false, transformPastedText: true }),
    ],
    content: markdown,
    editorProps: { attributes: { class: 'prose', spellcheck: 'false', autocapitalize: 'sentences' } },
    onUpdate: () => onChange(),
    onTransaction: () => onState(),
  });
  return {
    editor,
    markdown: () => editor.storage.markdown.getMarkdown(),
    text: () => editor.getText(),
    roundtrip: (md) => { editor.commands.setContent(md); return editor.storage.markdown.getMarkdown(); },
  };
};

window.WriteEditor = { create };
