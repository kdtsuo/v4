export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return Response.json({ error: 'Missing username' }, { status: 400 });
  }

  const commonHeaders = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  try {
    const apiRes = await fetch(
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

    let imageUrl: string | null = null;

    if (apiRes.ok) {
      const data = await apiRes.json();
      imageUrl =
        data?.data?.user?.profile_pic_url_hd ??
        data?.data?.user?.profile_pic_url ??
        null;
    }

    if (!imageUrl) {
      const htmlRes = await fetch(`https://www.instagram.com/${username}/`, {
        headers: commonHeaders,
        next: { revalidate: 3600 },
      });
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const match = html.match(/<meta property="og:image" content="([^"]+)"/);
        imageUrl = match?.[1]?.replace(/&amp;/g, '&') ?? null;
      }
    }

    if (!imageUrl) {
      return Response.json({ error: 'Profile picture not found' }, { status: 404 });
    }

    // Proxy the actual image bytes through our own domain, so:
    // - next/image never needs Instagram's dynamic CDN hostnames whitelisted
    // - the browser never touches Instagram's signed URL directly (avoids hotlink/CORS issues)
    // - we always fetch fresh, so the signed URL's expiry (`oe=` param) is a non-issue
    const imageRes = await fetch(imageUrl, { headers: commonHeaders });
    if (!imageRes.ok) {
      return Response.json({ error: 'Failed to fetch image' }, { status: 502 });
    }

    const imageBuffer = await imageRes.arrayBuffer();
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': imageRes.headers.get('content-type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Error fetching Instagram avatar:', err);
    return Response.json({ error: 'Failed to load Instagram avatar' }, { status: 500 });
  }
}
