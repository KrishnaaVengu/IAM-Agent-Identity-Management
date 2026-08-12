import { runExpirySweep } from '../engine/expiryEngine.js';

export function startExpirySweepJob(): void {
  setInterval(() => {
    const revoked = runExpirySweep();
    if (revoked.length > 0) {
      console.log(`[ExpiryJob] Auto-revoked ${revoked.length} agent(s):`, revoked);
    }
  }, 30_000); // every 30 seconds
}
