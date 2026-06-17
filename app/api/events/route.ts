import { NextResponse } from 'next/server';
import { chromium } from 'playwright';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate cache every hour

interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  day: string;
  month: string;
  price: string;
  image: string;
  link: string;
  isPast?: boolean;
}

interface EventsResponse {
  upcomingEvents: Event[];
  pastEvents: Event[];
}

// In-memory cache
let cachedData: EventsResponse | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function GET() {
  // Check if cache is still valid
  const now = Date.now();
  if (cachedData && now - cacheTimestamp < CACHE_DURATION) {
    console.log('Returning cached events data');
    return NextResponse.json(cachedData);
  }

  let browser = null;

  try {
    console.log('Fetching fresh events data from Rubric...');
    // Launch headless browser
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the Rubric page
    await page.goto('https://campus.hellorubric.com/?eid=51375', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for event cards to load
    await page.waitForSelector('a[eventid]', { timeout: 10000 });

    // Extract all events from the page
    const events = await page.evaluate(() => {
      const eventElements = document.querySelectorAll('a[eventid]');
      const extractedEvents: any[] = [];

      eventElements.forEach((element) => {
        const eventId = element.getAttribute('eventid') || '';
        const link =
          element.getAttribute('href') ||
          `https://campus.hellorubric.com/?eid=${eventId}`;
        const image = element.querySelector('img.cardimage')?.getAttribute('src') || '';
        const title = element.querySelector('#cardtitle')?.textContent?.trim() || '';
        const location = element.querySelector('#carddesc')?.textContent?.trim() || '';
        const date = element.querySelector('#cardeventdate')?.textContent?.trim() || '';
        const price = element.querySelector('#cardinfo')?.textContent?.trim() || '';
        const day = element.querySelector('.eventDay')?.textContent?.trim() || '';
        const month = element.querySelector('.eventMonth')?.textContent?.trim() || '';
        const dateTag = element.querySelector('.date-tag');
        const isPast = dateTag?.classList.contains('d-none');

        if (eventId && title) {
          extractedEvents.push({
            id: eventId,
            title,
            location,
            date,
            day,
            month,
            price,
            image,
            link,
            isPast,
          });
        }
      });

      return extractedEvents;
    });

    // Separate into upcoming and past events
    const upcomingEvents = events.filter((e) => !e.isPast);
    const currentYear = new Date().getFullYear();

    // Filter past events to only include events from current year
    const pastEvents = events.filter((e) => {
      if (!e.isPast) return false;

      try {
        // Try to parse the date string to extract the year
        const dateStr = e.date;
        const yearMatch = dateStr.match(/\b(20\d{2})\b/); // Match 4-digit year starting with 20

        if (yearMatch) {
          const eventYear = parseInt(yearMatch[1]);
          return eventYear === currentYear;
        }

        // If we can't determine the year, include the event
        return true;
      } catch {
        // If parsing fails, include the event
        return true;
      }
    });

    const data: EventsResponse = {
      upcomingEvents,
      pastEvents,
    };

    // Update cache
    cachedData = data;
    cacheTimestamp = Date.now();
    console.log('Events data cached successfully');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching events:', error);

    // If fetch fails but we have cached data, return it
    if (cachedData) {
      console.log('Returning stale cached data due to error');
      return NextResponse.json(cachedData);
    }

    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
