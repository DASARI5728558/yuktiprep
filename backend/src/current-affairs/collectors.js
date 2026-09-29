import axios from 'axios';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { DateTime } from 'luxon';
import { HEADERS, REQUEST_TIMEOUT } from './config.js';
import { RawItem, Source } from './models.js';

// Global SSL bypass, mimicking Python's verify=False and disabling InsecureRequestWarning
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

const parser = new Parser({
  timeout: REQUEST_TIMEOUT * 1000,
});

const DATE_PATTERNS = [
  /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i,
  /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/i,
  /\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/,
  /\b\d{4}-\d{2}-\d{2}\b/,
];

export function cleanText(value) {
  if (!value) return '';
  const $ = cheerio.load(value);
  const text = $.root().text().replace(/\s+/g, ' ').trim();
  return text;
}

export function hostname(url) {
  try {
    const u = new URL(url);
    return (u.hostname || '').toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function allowedUrl(url, source) {
  const host = hostname(url);
  for (const domain of source.allowed_domains) {
    const normalized = domain.toLowerCase().replace(/^www\./, '');
    if (host === normalized || host.endsWith(`.${normalized}`)) {
      return true;
    }
  }
  return false;
}

export function canonicalUrl(url) {
  try {
    const u = new URL(url);
    const remove = new Set([
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
    ]);

    const query = u.searchParams
      .toString()
      .split('&')
      .filter((pair) => {
        const [key] = pair.split('=');
        return !remove.has(key.toLowerCase());
      })
      .join('&');

    u.search = query;
    u.hash = '';

    let result = u.toString();
    if (result.endsWith('?') || result.endsWith('&')) {
      result = result.replace(/[?&]+$/, '');
    }
    return result;
  } catch {
    return url;
  }
}

export function parseDate(value) {
  if (!value) return null;

  try {
    const dt = DateTime.fromISO(value, { zone: 'utc' });
    if (dt.isValid) {
      return dt.toUTC().toISO();
    }

    const formats = [
      'dd LLLL yyyy',
      'd LLLL yyyy',
      'dd MMM yyyy',
      'd MMM yyyy',
      'dd-MM-yyyy',
      'd-M-yyyy',
      'yyyy-MM-dd',
    ];

    for (const fmt of formats) {
      const parsed = DateTime.fromFormat(value, fmt, { zone: 'utc' });
      if (parsed.isValid) {
        return parsed.toUTC().toISO();
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function extractDate(text) {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const dt = parseDate(match[0]);
      if (dt) return dt;
    }
  }
  return null;
}

export function validateDate(dt) {
  if (!dt) return false;
  const date = DateTime.fromISO(dt, { zone: 'utc' });
  if (!date.isValid) return false;

  const now = DateTime.now().setZone('utc');
  if (date > now.plus({ days: 2 })) return false;
  if (date < now.minus({ days: 730 })) return false;
  return true;
}

import https from 'https';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function fetchWithRetry(url, options = {}, retries = 1) {
  const retryCodes = new Set([408, 425, 429, 500, 502, 503, 504]);
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await axios.get(url, {
        headers: HEADERS,
        timeout: REQUEST_TIMEOUT * 1000,
        maxRedirects: 5,
        httpsAgent,
        ...options,
      });
      return response;
    } catch (err) {
      const status = err.response?.status;
      const shouldRetry = i < retries && (
        ['ECONNABORTED', 'ETIMEDOUT'].includes(err.code) ||
        (status && retryCodes.has(status)) ||
        err.message.includes('network')
      );
      if (!shouldRetry) throw err;
      await new Promise(r => setTimeout(r, 1200));
    }
  }
}

export async function collectRss(source, feedUrl) {
  const url = feedUrl || source.url;

  const response = await fetchWithRetry(url);

  const feed = await parser.parseString(response.data);

  const results = [];

  for (const entry of feed.items.slice(0, 120)) {
    const title = cleanText(entry.title || entry.contentSnippet || '');
    const itemUrl = canonicalUrl(entry.link || entry.url || '');

    if (!title || !itemUrl) continue;
    if (itemUrl.toLowerCase().endsWith('.pdf') || itemUrl.toLowerCase().includes('.pdf?')) continue;
    if (title.toLowerCase().includes('download (') && title.toLowerCase().includes('kb)')) continue;
    if (!allowedUrl(itemUrl, source)) continue;

    const summary = cleanText(entry.contentSnippet || entry.summary || '');
    const published = parseDate(entry.pubDate || entry.isoDate || entry.date);

    if (!validateDate(published)) continue;

    results.push(
      new RawItem({
        title,
        summary,
        url: itemUrl,
        published_at: published,
      })
    );
  }

  return results;
}

export async function collectRssIndex(source) {
  const response = await fetchWithRetry(source.url);

  const $ = cheerio.load(response.data);
  const candidateFeeds = [];

  $('a[href]').each((_, el) => {
    const rawHref = $(el).attr('href');
    if (!rawHref) return;

    const href = canonicalUrl(new URL(rawHref, response.request.res.responseUrl || source.url).href);
    const marker = `${href} ${$(el).text().toLowerCase()}`;

    if (
      marker.includes('rss') ||
      marker.includes('feed') ||
      href.toLowerCase().endsWith('.xml')
    ) {
      if (allowedUrl(href, source)) {
        candidateFeeds.push(href);
      }
    }
  });

  const unique = [...new Set(candidateFeeds)].slice(0, 20);

  const results = [];
  for (const feedUrl of unique) {
    try {
      const items = await collectRss(source, feedUrl);
      results.push(...items);
    } catch {
      // ignore individual feed failures
    }
  }

  return results;
}

export async function collectHtml(source) {
  const response = await fetchWithRetry(source.url);

  const $ = cheerio.load(response.data);
  const results = [];
  const seen = new Set();

  $('a[href]').each((_, el) => {
    const title = cleanText($(el).text());
    if (title.length < 22 || title.length > 320) return;

    const rawHref = $(el).attr('href');
    if (!rawHref) return;

    const itemUrl = canonicalUrl(
      new URL(rawHref, response.request.res.responseUrl || source.url).href
    );

    if (itemUrl.toLowerCase().endsWith('.pdf') || itemUrl.toLowerCase().includes('.pdf?')) return;
    if (title.toLowerCase().includes('download (') && (title.toLowerCase().includes('kb)') || title.toLowerCase().includes('mb)'))) return;

    if (seen.has(itemUrl)) return;
    if (!allowedUrl(itemUrl, source)) return;

    const node =
      $(el)
        .closest(
          'article, li, tr, section, div, main, header, footer, aside, nav'
        )
        .get(0) || el.parent;

    const context = cleanText($(node).text() || title);
    let published = extractDate(context);

    if (!published && ['yojana', 'kurukshetra', 'employment_news', 'epw', 'science_reporter'].includes(source.key)) {
      published = new Date().toISOString();
    }

    if (!validateDate(published)) return;

    seen.add(itemUrl);
    results.push(
      new RawItem({
        title,
        summary: context.slice(0, 1600),
        url: itemUrl,
        published_at: published,
      })
    );

    if (results.length >= 100) return false;
  });

  return results;
}

export async function collect(source) {
  if (source.mode === 'rss') return collectRss(source);
  if (source.mode === 'rss_index') return collectRssIndex(source);
  if (source.mode === 'html') return collectHtml(source);
  throw new Error(`Unsupported source mode: ${source.mode}`);
}
