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
        endpoint: 'https://appserver.getqpay.com:9090/AppServerSwapnil/event/details',
        details: JSON.stringify({
          eventId: id,
          currentUrl: `https://campus.hellorubric.com/?s=7805`,
          device: 'web_portal',
          version: 4,
          timestamp: Date.now(),
        }),
      }),
    });

    if (!res.ok) throw new Error('Failed to fetch event details');
    const data = await res.json();

    if (!data.success) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    return Response.json({
      description: data.eventDetails.eventDescription,
    });
  } catch (err) {
    console.error('Error fetching event details:', err);
    return Response.json({ error: 'Failed to load event details' }, { status: 500 });
  }
}
