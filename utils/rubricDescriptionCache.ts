const descriptionCache = new Map<string, string | null>();

export function getCachedRubricDescription(id: string): string | null | undefined {
  if (!descriptionCache.has(id)) return undefined;
  return descriptionCache.get(id) ?? null;
}

export function setCachedRubricDescription(id: string, description: string | null) {
  descriptionCache.set(id, description);
}
