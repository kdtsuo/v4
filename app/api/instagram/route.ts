import { instagramAvatarUrl } from '@/utils';

const commonHeaders = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

// Instagram's public web endpoint backs both the bio and the avatar, so a single
// upstream call serves either shape of response this route returns.
async function fetchWebProfile(username: string) {
  const res = await fetch(
    `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
    {
      headers: {
        ...commonHeaders,
        'x-ig-app-id': '936619743392459',
        'Referer': `https://www.instagram.com/${username}/`,
        'Accept': '*/*',
        'Sec-Fetch-Site': 'same-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
      },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data?.data?.user ?? null;
}

// Falls back to scraping og:image when the JSON endpoint is rate limited or shaped
// differently than expected.
async function fetchAvatarUrlFromHtml(username: string) {
  const res = await fetch(`https://www.instagram.com/${username}/`, {
    headers: commonHeaders,
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;

  const html = await res.text();
  const match = html.match(/<meta property="og:image" content="([^"]+)"/);
  return match?.[1]?.replace(/&amp;/g, '&') ?? null;
}

// Proxy the actual image bytes through our own domain, so:
// - next/image never needs Instagram's dynamic CDN hostnames whitelisted
// - the browser never touches Instagram's signed URL directly (avoids hotlink/CORS issues)
// - we always fetch fresh, so the signed URL's expiry (`oe=` param) is a non-issue
async function respondWithAvatar(username: string) {
  const user = await fetchWebProfile(username);
  const imageUrl =
    user?.profile_pic_url_hd ??
    user?.profile_pic_url ??
    (await fetchAvatarUrlFromHtml(username));

  if (!imageUrl) {
    return Response.json({ error: 'Profile picture not found' }, { status: 404 });
  }

  const imageRes = await fetch(imageUrl, { headers: commonHeaders });
  if (!imageRes.ok) {
    return Response.json({ error: 'Failed to fetch image' }, { status: 502 });
  }

  return new Response(await imageRes.arrayBuffer(), {
    headers: {
      'Content-Type': imageRes.headers.get('content-type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return Response.json({ error: 'Missing username' }, { status: 400 });
  }

  try {
    if (searchParams.get('avatar')) {
      return await respondWithAvatar(username);
    }

    const user = await fetchWebProfile(username);
    if (!user) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    return Response.json({
      username,
      bio: user.biography ?? null,
      avatarUrl: instagramAvatarUrl(username),
    });
  } catch (err) {
    console.error('Error fetching Instagram profile:', err);
    return Response.json({ error: 'Failed to load Instagram profile' }, { status: 500 });
  }
}
