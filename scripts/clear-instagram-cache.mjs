// Clears the current Instagram avatars and bios from Supabase, so that
// scripts/scrape-instagram.mjs can be run fresh.
//
// Removes the stored avatar images from the `avatars` bucket and nulls out
// instagram_avatar_url / instagram_bio / instagram_synced_at. The manually set
// `bio` and `profile_image_url` columns are never touched.
//
// Usage: pnpm clear:instagram
//        pnpm clear:instagram -- --dry-run   # show what would be cleared

import { BUCKET, createServiceClient } from './supabase-client.mjs';

const dryRun = process.argv.slice(2).includes('--dry-run');

async function main() {
  const supabase = createServiceClient({ requireWrite: !dryRun });

  const { data: members, error } = await supabase
    .from('team_members')
    .select('id, full_name, instagram_avatar_url, instagram_bio')
    .or('instagram_avatar_url.not.is.null,instagram_bio.not.is.null,instagram_synced_at.not.is.null');
  if (error) throw error;

  if (members.length === 0) {
    console.log('Nothing to clear — no cached Instagram data.');
    return;
  }

  console.log(`${members.length} member(s) with cached data${dryRun ? ' (dry run)' : ''}:`);
  for (const m of members) {
    const has = [m.instagram_avatar_url && 'avatar', m.instagram_bio && 'bio'].filter(Boolean);
    console.log(`- ${m.full_name}: ${has.join(' + ') || 'timestamp only'}`);
  }

  if (dryRun) {
    console.log('\nDry run — nothing was changed.');
    return;
  }

  // Storage first: if this fails, the rows still point at the images rather
  // than being orphaned from them.
  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove(members.map((m) => `${m.id}.jpg`));
  if (removeError) throw removeError;

  const { data: cleared, error: updateError } = await supabase
    .from('team_members')
    .update({
      instagram_avatar_url: null,
      instagram_bio: null,
      instagram_synced_at: null,
    })
    .in(
      'id',
      members.map((m) => m.id)
    )
    .select('id');
  if (updateError) throw updateError;

  console.log(
    `\nCleared ${cleared.length} row(s) and removed ${members.length} image(s) from the ` +
      `${BUCKET} bucket.\nRun \`pnpm sync:instagram\` to repopulate.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
