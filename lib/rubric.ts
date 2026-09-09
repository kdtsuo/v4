import { unstable_cache } from 'next/cache';

const SOCIETY_ID = '7805';
const SOCIETY_URL = `https://campus.hellorubric.com/?s=${SOCIETY_ID}`;
const RUBRIC_REVALIDATE_SECONDS = 60 * 60;

type RubricDetails = Record<string, unknown>;

async function postRubric(endpoint: string, details: RubricDetails) {
  const res = await fetch('https://api.hellorubric.com/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: new URLSearchParams({
      endpoint,
      details: JSON.stringify({
        ...details,
        device: 'web_portal',
        version: 4,
        timestamp: Date.now(),
      }),
    }),
  });

  if (!res.ok) {
    throw new Error(`Rubric request failed (${endpoint}): ${res.status}`);
  }

  return res.json();
}

const getCachedClubLandingPage = unstable_cache(
  async () =>
    postRubric('getSocietyLandingPage', {
      societyid: SOCIETY_ID,
      domain: 'campus.hellorubric.com',
      currentUrl: SOCIETY_URL,
    }),
  ['rubric-club-landing', SOCIETY_ID],
  { revalidate: RUBRIC_REVALIDATE_SECONDS }
);

const getCachedEventDetails = unstable_cache(
  async (eventId: string) =>
    postRubric('https://appserver.getqpay.com:9090/AppServerSwapnil/event/details', {
      eventId,
      currentUrl: SOCIETY_URL,
    }),
  ['rubric-event-details'],
  { revalidate: RUBRIC_REVALIDATE_SECONDS }
);

export async function fetchClubLandingPage() {
  return getCachedClubLandingPage();
}

export async function fetchEventDetails(eventId: string) {
  return getCachedEventDetails(eventId);
}
