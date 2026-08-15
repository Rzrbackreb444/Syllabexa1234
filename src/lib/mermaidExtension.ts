import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MermaidNodeView from '../components/MermaidNodeView';

export const MermaidNode = Node.create({
  name: 'mermaid',
  group: 'block',
  atom: true, // It is a leaf node, doesn't contain editable paragraph nodes
  draggable: true,

  addAttributes() {
    return {
      code: {
        default: 'graph TD\n  A[Start Audit] --> B(Verify Meter)\n  B --> C{Water Ratio OK?}\n  C -- Yes --> D[Proceed to LOI]\n  C -- No --> E[Reprogram Controller]',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="mermaid"]',
        getAttrs: (element) => ({
          code: (element as HTMLElement).getAttribute('data-code') || (element as HTMLElement).textContent,
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'mermaid',
        'data-code': HTMLAttributes.code,
        class: 'mermaid-block-container',
      }),
      HTMLAttributes.code,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidNodeView);
  },
});