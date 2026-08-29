export async function GET() {
  try {
    const res = await fetch('https://api.hellorubric.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: new URLSearchParams({
        endpoint: 'getSocietyLandingPage',
        details: JSON.stringify({
          societyid: '7805',
          domain: 'campus.hellorubric.com',
          currentUrl: 'https://campus.hellorubric.com/?s=7805',
          device: 'web_portal',
          version: 4,
          timestamp: Date.now(),
        }),
      }),
    });

    if (!res.ok) throw new Error('Failed to fetch from Rubric');
    const data = await res.json();

    const eventsSection = data.sections?.find((s: any) => s.sectionname === 'Events');
    const rawEvents = eventsSection?.array ?? [];

    const mapped = rawEvents.map((e: any) => ({
      id: String(e.eventid),
      title: e.title,
      location: e.subtitle,
      date: e.formatteddate,
      day: e.day,
      month: e.month,
      price: e.info,
      image: e.image,
      link: e.destination,
      isPast: e.upcoming === 0,
    }));

    return Response.json({
      upcomingEvents: mapped.filter((e: any) => !e.isPast),
      pastEvents: mapped.filter((e: any) => e.isPast),
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    return Response.json({ error: 'Failed to load events' }, { status: 500 });
  }
}
