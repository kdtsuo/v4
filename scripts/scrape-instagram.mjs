// Caches committee members' Instagram avatars and bios into Supabase.
//
// Instagram's JSON API (web_profile_info) returns 401 `require_login` for any
// unauthenticated caller, but the profile page itself still renders logged-out
// in a real browser, so this drives headless Chrome and reads the page instead.
// Private accounts serve an empty og:image and are skipped.
//
// Must be run from a residential connection. Instagram serves datacenter IPs
// (CI runners, cloud hosts) a login wall rather than the profile, so this
// cannot run in GitHub Actions or on Vercel; the script aborts if it sees one.
//
// Usage: pnpm sync:instagram
//        pnpm sync:instagram -- --dry-run [--only=username,...]
//
// To wipe what it wrote and start over, see scripts/clear-instagram-cache.mjs.

import puppeteer from 'puppeteer-core';
import { BUCKET, createServiceClient } from './supabase-client.mjs';

// Time for Instagram's client-side render to populate the page.
const RENDER_WAIT_MS = 4000;
// Instagram rate limits aggressively; pace requests between profiles.
const BETWEEN_PROFILES_MS = 2000;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyArg = args.find((a) => a.startsWith('--only='));
const only = onlyArg ? onlyArg.slice('--only='.length).split(',').filter(Boolean) : null;

class BlockedError extends Error {
  constructor(title) {
    super(
      `Instagram served a login wall instead of a profile (page title: "${title}").\n` +
        'This IP is blocked — datacenter ranges such as CI runners always are.\n' +
        'Run this from a residential connection instead. Nothing was written.'
    );
    this.name = 'BlockedError';
  }
}

function chromePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }
  return '/usr/bin/google-chrome';
}

export function extractInstagramUsername(url) {
  try {
    const segment = new URL(url).pathname.split('/').filter(Boolean)[0];
    return segment || null;
  } catch {
    return null;
  }
}

// Profile fields live in the JSON blobs Instagram inlines into the document.
// They are JSON string literals, so JSON.parse handles the escaping (bios are
// full of emoji surrogate pairs and newlines).
function extractJsonString(html, key) {
  const match = html.match(new RegExp(`"${key}":\\s*("(?:[^"\\\\]|\\\\.)*")`));
  if (!match) return null;
  try {
    return JSON.parse(match[1]).trim() || null;
  } catch {
    return null;
  }
}

async function scrapeProfile(page, username) {
  const res = await page.goto(`https://www.instagram.com/${username}/`, {
    waitUntil: 'domcontentloaded',
    timeout: 45000,
  });

  if (res && res.status() === 404) return { status: 'not-found' };

  await new Promise((resolve) => setTimeout(resolve, RENDER_WAIT_MS));

  const title = await page.title();
  if (/Profile isn't available|Page Not Found/i.test(title)) {
    return { status: 'not-found' };
  }

  // A real profile page is titled "Name (@username) • Instagram photos and
  // videos". Anything else is the login wall, which Instagram serves to IPs it
  // doesn't like (datacenter ranges especially). That page still carries a
  // generic og:image and no biography, so without this check it reads as a
  // successful scrape and overwrites everyone with the same placeholder.
  if (!title.includes(`(@${username})`)) {
    return { status: 'blocked', title };
  }

  const html = await page.content();
  const bio = extractJsonString(html, 'biography');

  // Read the avatar from the inlined JSON rather than og:image: private
  // accounts blank out the meta tag but still expose profile_pic_url, which
  // matches what Instagram itself shows for a private profile.
  const avatarUrl =
    extractJsonString(html, 'profile_pic_url') ||
    (await page.evaluate(
      () => document.querySelector('meta[property="og:image"]')?.content || null
    ));

  if (!avatarUrl) return { status: 'no-avatar', bio };

  return { status: 'ok', avatarUrl, bio };
}

async function uploadAvatar(supabase, memberId, avatarUrl) {
  const res = await fetch(avatarUrl);
  if (!res.ok) throw new Error(`avatar download failed: ${res.status}`);

  const contentType = res.headers.get('content-type') ?? 'image/jpeg';
  const path = `${memberId}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, Buffer.from(await res.arrayBuffer()), { contentType, upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Bust any CDN/browser cache of the previous avatar at this same path.
  return `${data.publicUrl}?v=${Date.now()}`;
}

async function main() {
  const supabase = createServiceClient({ requireWrite: !dryRun });

  const { data: members, error } = await supabase
    .from('team_members')
    .select('id, full_name, instagram_url')
    .eq('is_archived', false)
    .not('instagram_url', 'is', null);
  if (error) throw error;

  const targets = members
    .map((m) => ({ ...m, username: extractInstagramUsername(m.instagram_url ?? '') }))
    .filter((m) => m.username)
    .filter((m) => !only || only.includes(m.username));

  console.log(`Scraping ${targets.length} profile(s)${dryRun ? ' (dry run)' : ''}\n`);

  const browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  const counts = { ok: 0, 'no-avatar': 0, 'not-found': 0, failed: 0 };

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    for (const member of targets) {
      const label = `${member.full_name} (@${member.username})`;
      try {
        const result = await scrapeProfile(page, member.username);

        // Being served the login wall is about this machine's IP, not this
        // member, so every remaining profile would fail the same way. Stop
        // rather than march through the list writing placeholder data.
        if (result.status === 'blocked') {
          throw new BlockedError(result.title);
        }

        if (result.status !== 'ok') {
          counts[result.status]++;
          console.log(`- ${label}: ${result.status}`);
        } else if (dryRun) {
          counts.ok++;
          console.log(`- ${label}: ok — bio=${result.bio ? 'yes' : 'none'}, avatar found`);
        } else {
          const publicUrl = await uploadAvatar(supabase, member.id, result.avatarUrl);
          const { data: updated, error: updateError } = await supabase
            .from('team_members')
            .update({
              instagram_avatar_url: publicUrl,
              instagram_bio: result.bio,
              instagram_synced_at: new Date().toISOString(),
            })
            .eq('id', member.id)
            .select('id');
          if (updateError) throw updateError;
          // An update blocked by RLS reports no error, it just matches no rows —
          // which is exactly what happens with the anon key instead of the
          // service role key. Without this check the sync looks like it worked.
          if (!updated || updated.length === 0) {
            throw new Error('update affected 0 rows (is SUPABASE_SERVICE_ROLE_KEY set?)');
          }

          counts.ok++;
          console.log(`- ${label}: synced — bio=${result.bio ? 'yes' : 'none'}`);
        }
      } catch (err) {
        if (err instanceof BlockedError) throw err;
        counts.failed++;
        console.log(`- ${label}: FAILED — ${err.message}`);
      }

      await new Promise((resolve) => setTimeout(resolve, BETWEEN_PROFILES_MS));
    }
  } finally {
    await browser.close();
  }

  console.log(
    `\nsynced=${counts.ok} private/no-avatar=${counts['no-avatar']} ` +
      `missing=${counts['not-found']} failed=${counts.failed}`
  );

  // A profile going private or being renamed is expected drift, not a build
  // failure; only genuine errors should fail the job.
  if (counts.failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
