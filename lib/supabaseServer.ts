import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const createSupabaseServer = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};

export function withSupabase(
  handler: (req: Request, supabase: SupabaseClient) => Promise<Response | NextResponse>
) {
  return async (req: Request) => {
    const supabase = createSupabaseServer();
    if (!supabase) {
      return NextResponse.json(
        {
          error:
            'Server Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
        },
        { status: 500 }
      );
    }
    try {
      return await handler(req, supabase);
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
  };
}
