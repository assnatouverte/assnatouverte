/**
 * Module pour être responsable dans notre utilisation du site web de l'Assemblée nationale.
 * On s'assure d'un délair entre les requêtes et on s'identifie dans l'user-agent.
 */

import ky from "ky";
import { hrtime } from "node:process";

// Constants
const USER_AGENT = "assnatouverte <info@assnatouverte.ca>";
const TIMEOUT_MS = 20_000;
const MAX_CONCURRENT_REQUESTS = 1;
const MIN_DELAY_MS = 1000;
const MIN_DELAY_NS = BigInt(MIN_DELAY_MS) * 1_000_000n;

// Rate limiting
let nextRequestTime: bigint | null = null;
let numActiveRequests: number = 0;
const pendingRequests: { (): void }[] = [];

async function beforeRequest() {
  // Check if too many active requests
  if (numActiveRequests >= MAX_CONCURRENT_REQUESTS) {
    const promise = new Promise<void>((done) => pendingRequests.push(done));
    await promise; // wait until a request finishes
  }

  numActiveRequests++;
  const now = hrtime.bigint();

  if (nextRequestTime && now < nextRequestTime) {
    // Delay if necessary
    const delay = nextRequestTime - now;
    const delayNumber = Number(delay / 1_000_000n);
    nextRequestTime = nextRequestTime + MIN_DELAY_NS;
    await new Promise((done) => setTimeout(done, delayNumber));
  } else {
    nextRequestTime = now + MIN_DELAY_NS;
  }
}

function afterResponse() {
  numActiveRequests--;

  // Schedule pending requests
  if (pendingRequests.length > 0) {
    const nextRequest = pendingRequests.shift()!;
    nextRequest();
  }
}

export const http = ky.create({
  headers: {
    "user-agent": USER_AGENT,
  },
  retry: 3,
  timeout: TIMEOUT_MS,
  hooks: {
    beforeRequest: [beforeRequest],
    beforeRetry: [beforeRequest],
    afterResponse: [afterResponse],
    beforeError: [(err) => {
      afterResponse();
      return err;
    }],
  },
});
