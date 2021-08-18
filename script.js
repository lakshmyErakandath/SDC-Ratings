import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 1000,
  duration: '30s',
};
export default function () {
  http.get('http://localhost:3000/reviews/meta?product_id=1');
  sleep(1);
}
