
import '@tiptap/core';
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    calloutBox: { toggleCalloutBox: () => ReturnType; };
    keyTakeaway: { toggleKeyTakeaway: () => ReturnType; };
    smallCaps: { toggleSmallCaps: () => ReturnType; };
  }
}
import { Node, mergeAttributes, Mark } from '@tiptap/core';

export const CalloutBox = Node.create({
  name: 'calloutBox',
  group: 'block',
  content: 'block+',
  defining: true,
  parseHTML() { return [{ tag: 'div[data-type="callout"]' }]; },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout' }), 0]; },
  addCommands() {
    return {
      toggleCalloutBox: () => ({ commands }) => commands.toggleWrap('calloutBox'),
    };
  },
});

export const KeyTakeaway = Node.create({
  name: 'keyTakeaway',
  group: 'block',
  content: 'block+',
  defining: true,
  parseHTML() { return [{ tag: 'div[data-type="takeaway"]' }]; },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'takeaway' }), 0]; },
  addCommands() {
    return {
      toggleKeyTakeaway: () => ({ commands }) => commands.toggleWrap('keyTakeaway'),
    };
  },
});

export const SmallCaps = Mark.create({
  name: 'smallCaps',
  parseHTML() { return [{ tag: 'span', getAttrs: (node) => (node as HTMLElement).style.fontVariant === 'small-caps' && null }]; },
  renderHTML({ HTMLAttributes }) { return ['span', mergeAttributes(HTMLAttributes, { style: 'font-variant: small-caps;' }), 0]; },
  addCommands() { return { toggleSmallCaps: () => ({ commands }) => commands.toggleMark('smallCaps') }; }
});
