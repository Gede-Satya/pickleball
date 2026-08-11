import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 500 },
    { duration: '1m', target: 1000 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

const TOURNAMENT_ID = '1'; // ganti sesuai ID turnamen yang ada di database kamu
const BASE_URL = 'http://localhost:3000';

export default function () {
  const pages = [
    { name: 'homepage', url: `${BASE_URL}/` },
    { name: 'tournament_detail', url: `${BASE_URL}/tournament/${TOURNAMENT_ID}` },
    { name: 'jadwal', url: `${BASE_URL}/tournament/${TOURNAMENT_ID}/jadwal` },
    { name: 'bagan', url: `${BASE_URL}/tournament/${TOURNAMENT_ID}/bracket` },
  ];

  const page = pages[Math.floor(Math.random() * pages.length)];
  const res = http.get(page.url, { tags: { name: page.name } });

  check(res, {
    [`${page.name} status 200`]: (r) => r.status === 200,
    [`${page.name} < 2s`]: (r) => r.timings.duration < 2000,
  });

  sleep(Math.random() * 3);
}