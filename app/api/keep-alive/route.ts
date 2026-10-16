import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Pinged by a Vercel cron (see vercel.json) so the Supabase project isn't paused for inactivity.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase.from('links').select('id').limit(1);

  if (error) {
    console.error('Keep-alive query failed:', error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, timestamp: new Date().toISOString() });
}
