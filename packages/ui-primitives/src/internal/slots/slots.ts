export const hasSlotContent = (host: Element, name: string) => {
  const elements = Array.from(host.children).filter(
    (element) => element.getAttribute("slot") === name,
  );
  if (elements.length === 0) return false;
  return elements.some((element) => {
    const text = element.textContent;
    if (text && text.trim().length > 0) return true;
    return element.childElementCount > 0;
  });
};

export const buildDescribedBy = (...ids: (string | null | undefined)[]) => {
  const value = ids.filter(Boolean).join(" ");
  return value.length > 0 ? value : undefined;
};
