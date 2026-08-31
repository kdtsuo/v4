export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return Response.json({ error: 'Missing username' }, { status: 400 });
  }

  try {
    const apiRes = await fetch(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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

    if (!apiRes.ok) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const data = await apiRes.json();
    const bio = data?.data?.user?.biography ?? null;

    if (!bio) {
      return Response.json({ error: 'Bio not found' }, { status: 404 });
    }

    return Response.json({ bio });
  } catch (err) {
    console.error('Error fetching Instagram bio:', err);
    return Response.json({ error: 'Failed to load Instagram bio' }, { status: 500 });
  }
}
