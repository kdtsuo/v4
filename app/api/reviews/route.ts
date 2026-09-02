export async function GET() {
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
          desiredLevel: 'society',
          societyId: 7805,
          currentUrl: 'https://campus.hellorubric.com/?fromsite=true',
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
      totalReviews: data.numberOfRatings ?? 0,
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
