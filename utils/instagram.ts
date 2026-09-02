export function extractInstagramUsername(url: string): string | null {
  try {
    const path = new URL(url).pathname;
    const segment = path.split('/').filter(Boolean)[0];
    return segment || null;
  } catch {
    return null;
  }
}

export function instagramProfileUrl(username: string) {
  return `/api/instagram?username=${encodeURIComponent(username)}`;
}

export function instagramAvatarUrl(username: string) {
  return `${instagramProfileUrl(username)}&avatar=1`;
}
