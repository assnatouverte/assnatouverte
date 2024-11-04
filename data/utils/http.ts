/**
 * Module pour être responsable dans notre utilisation du site web de l'Assemblée nationale.
 * On s'assure d'un délair entre les requêtes et on s'identifie dans l'user-agent.
 */

import ky from "ky";

// Constants
const USER_AGENT = "assnatouverte <info@assnatouverte.ca>";
const TIMEOUT_MS = 5_000;
const MIN_DELAY_MS = 1000;
const MIN_DELAY_NS = BigInt(MIN_DELAY_MS) * 1_000_000n;

// Rate limiting
let nextRequestTime: bigint | null = null;

async function beforeRequest() {
  const now = process.hrtime.bigint();

  if (nextRequestTime && now < nextRequestTime) {
    const delay = nextRequestTime - now;
    const delayNumber = Number(delay / 1_000_000n);
    nextRequestTime = nextRequestTime + MIN_DELAY_NS;
    await new Promise((done) => setTimeout(done, delayNumber));
  } else {
    nextRequestTime = now + MIN_DELAY_NS;
  }
}

export const http = ky.create({
  headers: {
    "user-agent": USER_AGENT,
  },
  timeout: TIMEOUT_MS,
  hooks: {
    beforeRequest: [beforeRequest],
    beforeRetry: [beforeRequest],
  },
});
