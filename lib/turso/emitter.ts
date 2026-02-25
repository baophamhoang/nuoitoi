import { EventEmitter } from 'events';
import type { DonationRow } from './types';

// Module-level singleton — shared across all requests in the same Node.js process
const emitter = new EventEmitter();
emitter.setMaxListeners(100); // Allow many concurrent SSE clients

export const DONATION_EVENT = 'new_donation';

export function emitNewDonation(donation: DonationRow): void {
  emitter.emit(DONATION_EVENT, donation);
}

export function onNewDonation(listener: (donation: DonationRow) => void): () => void {
  emitter.on(DONATION_EVENT, listener);
  return () => emitter.off(DONATION_EVENT, listener);
}
