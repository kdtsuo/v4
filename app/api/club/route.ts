import { fetchClubLandingPage } from '@/lib/rubric';

export async function GET() {
  try {
    const data = await fetchClubLandingPage();

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

    const merchSection = data.sections?.find((s: any) => s.sectionname === 'Merchandise');
    const rawMerch = merchSection?.array ?? [];

    const merchandise = rawMerch.map((m: any) => ({
      id: String(m.itemid),
      title: m.title,
      description: m.subtitle,
      price: m.info,
      image: m.image,
      link: m.destination,
      preOrder: !!m.preOrder,
    }));

    return Response.json({
      upcomingEvents: mapped.filter((e: any) => !e.isPast),
      pastEvents: mapped.filter((e: any) => e.isPast),
      merchandise,
    });
  } catch (err) {
    console.error('Error fetching club data:', err);
    return Response.json({ error: 'Failed to load club data' }, { status: 500 });
  }
}
