import { TTLCache } from '@isaacs/ttlcache';

interface PaymentData {
  name: string;
  message: string;
}

const cache = new TTLCache<number, PaymentData>({
  max: 1000,
  ttl: 30 * 60 * 1000, // 30 minutes
});

export function setPaymentData(orderCode: number, data: PaymentData) {
  cache.set(orderCode, data);
}

export function getPaymentData(orderCode: number): PaymentData | undefined {
  const entry = cache.get(orderCode);
  if (!entry) return undefined;
  cache.delete(orderCode);
  return entry;
}
