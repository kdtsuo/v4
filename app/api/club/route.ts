import { fetchClubLandingPage } from '@/lib/rubric';

interface RubricEvent {
  eventid: number | string;
  title: string;
  subtitle: string;
  formatteddate: string;
  day: string;
  month: string;
  info: string;
  image: string;
  destination: string;
  upcoming: number;
}

interface RubricMerchItem {
  itemid: number | string;
  title: string;
  subtitle: string;
  info: string;
  image: string;
  destination: string;
  preOrder?: boolean | number;
}

interface RubricSection {
  sectionname: string;
  array?: RubricEvent[] | RubricMerchItem[];
}

interface MappedEvent {
  id: string;
  title: string;
  location: string;
  date: string;
  day: string;
  month: string;
  price: string;
  image: string;
  link: string;
  isPast: boolean;
}

export async function GET() {
  try {
    const data = (await fetchClubLandingPage()) as { sections?: RubricSection[] };

    const eventsSection = data.sections?.find((s) => s.sectionname === 'Events');
    const rawEvents = (eventsSection?.array ?? []) as RubricEvent[];

    const mapped: MappedEvent[] = rawEvents.map((e) => ({
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

    const merchSection = data.sections?.find((s) => s.sectionname === 'Merchandise');
    const rawMerch = (merchSection?.array ?? []) as RubricMerchItem[];

    const merchandise = rawMerch.map((m) => ({
      id: String(m.itemid),
      title: m.title,
      description: m.subtitle,
      price: m.info,
      image: m.image,
      link: m.destination,
      preOrder: !!m.preOrder,
    }));

    return Response.json({
      upcomingEvents: mapped.filter((e) => !e.isPast),
      pastEvents: mapped.filter((e) => e.isPast),
      merchandise,
    });
  } catch (err) {
    console.error('Error fetching club data:', err);
    return Response.json({ error: 'Failed to load club data' }, { status: 500 });
  }
}
