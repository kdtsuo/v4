import { createClient } from '@supabase/supabase-js';

export const BUCKET = 'avatars';

// Supabase keys are JWTs whose payload carries the Postgres role they assume.
function keyRole(key) {
  try {
    return JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString()).role ?? null;
  } catch {
    return null;
  }
}

// Writes to team_members are blocked by RLS for anon, and a blocked update
// reports no error — it just matches no rows. Checking the key up front turns
// that silent no-op into an obvious failure.
export function createServiceClient({ requireWrite = true } = {}) {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (requireWrite && keyRole(key) !== 'service_role') {
    console.error(
      `SUPABASE_SERVICE_ROLE_KEY looks like a "${keyRole(key) ?? 'unknown'}" key, ` +
        'not service_role.\nGet it from Supabase → Project Settings → API → service_role.'
    );
    process.exit(1);
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
