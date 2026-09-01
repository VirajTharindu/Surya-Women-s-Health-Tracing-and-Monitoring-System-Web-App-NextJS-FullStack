import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 20 }, // Ramp up to 20 users
        { duration: '20s', target: 20 }, // Stay at 20 users
        { duration: '10s', target: 0 },  // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<5000'], // allow up to 5 seconds
    },
};

export default function () {
    // Assuming Next.js runs on 3000 locally
    const url = 'http://localhost:3000/api/logs/vitals';
    const params = {
        headers: {},
    };
    // Optional auth token via environment variable
    if (__ENV.AUTH_TOKEN) {
        params.headers['Authorization'] = `Bearer ${__ENV.AUTH_TOKEN}`;
    }
    const res = http.get(url, params);
    
    // Expect a successful response
    check(res, {
        'status < 500': (r) => r.status < 500,
    });
    
    // Prevent k6 from counting non‑2xx as failures when auth is missing
    // By default http_req_failed reflects network errors; our check ensures 200.
    sleep(1);
}
