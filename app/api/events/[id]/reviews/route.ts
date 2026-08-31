export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await fetch('https://api.hellorubric.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: new URLSearchParams({
        endpoint: 'getRatingsAndReviews',
        details: JSON.stringify({
          offset: 0,
          limit: 10,
          sortType: 'rating',
          sortDirection: 'desc',
          reviewsRequired: true,
          desiredLevel: 'category',
          societyId: 7805,
          category: 'event',
          currentUrl: `https://campus.hellorubric.com/?eid=${id}&fromsite=true`,
          device: 'web_portal',
          version: 4,
          timestamp: Date.now(),
        }),
      }),
    });
    if (!res.ok) throw new Error('Failed to fetch reviews');
    const data = await res.json();
    if (!data.success) {
      return Response.json({ error: 'Reviews not found' }, { status: 404 });
    }
    return Response.json({
      avgRating: data.avgRating ?? 0,
      totalReviews: data.totalReviews ?? 0,
      reviews: (data.reviews ?? []).map((r: any) => ({
        displayName: r.displayName,
        rating: r.rating,
        review: r.review,
        ratingDate: r.ratingDate,
      })),
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return Response.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}
