import { fetchEventDetails } from '@/lib/rubric';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const data = await fetchEventDetails(id);

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
