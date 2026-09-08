import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
};

const TOURNAMENT_ID = __ENV.TOURNAMENT_ID || '1';
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const endpoints = [
  { name: 'page_home', url: `${BASE_URL}/`, weight: 5 },
  { name: 'page_tournament', url: `${BASE_URL}/tournament/${TOURNAMENT_ID}`, weight: 5 },
  { name: 'page_schedule', url: `${BASE_URL}/tournament/${TOURNAMENT_ID}/schedule`, weight: 5 },
  { name: 'page_bracket', url: `${BASE_URL}/tournament/${TOURNAMENT_ID}/bracket`, weight: 5 },
  { name: 'api_health', url: `${BASE_URL}/api/health`, weight: 10 },
  { name: 'api_bank_accounts', url: `${BASE_URL}/api/public/bank-accounts`, weight: 10 },
  { name: 'api_payment_methods', url: `${BASE_URL}/api/public/payment-methods`, weight: 10 },
  { name: 'api_tournament', url: `${BASE_URL}/api/tournaments/${TOURNAMENT_ID}`, weight: 20 },
  { name: 'api_pools', url: `${BASE_URL}/api/tournaments/${TOURNAMENT_ID}/pools`, weight: 15 },
  { name: 'api_brackets', url: `${BASE_URL}/api/tournaments/${TOURNAMENT_ID}/brackets`, weight: 15 },
];

const totalWeight = endpoints.reduce((sum, e) => sum + e.weight, 0);

function pickEndpoint() {
  let r = Math.random() * totalWeight;
  for (const e of endpoints) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return endpoints[endpoints.length - 1];
}

function isPage(ep) {
  return ep.name.startsWith('page_');
}

export default function () {
  const ep = pickEndpoint();
  const res = http.get(ep.url, { tags: { name: ep.name } });

  const ok = check(res, {
    [`${ep.name} status 200`]: (r) => r.status === 200,
    [`${ep.name} < 300ms`]: (r) => r.timings.duration < 300,
  });

  errorRate.add(!ok);

  sleep(isPage(ep) ? Math.random() * 3 : Math.random());
}