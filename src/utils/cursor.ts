// Shared cursor positioning utilities for contentEditable elements

export const getCursorOffset = (element: HTMLElement): number => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;

  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  return preCaretRange.toString().length;
};

export const setCursorOffset = (element: HTMLElement, offset: number): void => {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  const textNodes: Node[] = [];
  const walk = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node: Node | null;
  while ((node = walk.nextNode())) {
    textNodes.push(node);
  }

  let currentOffset = 0;
  for (const node of textNodes) {
    const nodeLength = node.textContent?.length || 0;
    if (currentOffset + nodeLength >= offset) {
      range.setStart(node, Math.min(offset - currentOffset, nodeLength));
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    currentOffset += nodeLength;
  }

  // Fallback: put at end
  if (textNodes.length > 0) {
    const lastNode = textNodes[textNodes.length - 1];
    range.setStart(lastNode, lastNode.textContent?.length || 0);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};
