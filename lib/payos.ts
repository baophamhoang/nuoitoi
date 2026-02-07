import { PayOS } from '@payos/node';

let payosInstance: PayOS | null = null;

export function getPayOS(): PayOS {
  if (!payosInstance) {
    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

    if (!clientId || !apiKey || !checksumKey) {
      throw new Error(
        'PayOS credentials not configured. Set PAYOS_CLIENT_ID, PAYOS_API_KEY, and PAYOS_CHECKSUM_KEY environment variables.'
      );
    }

    payosInstance = new PayOS({
      clientId,
      apiKey,
      checksumKey,
    });
  }

  return payosInstance;
}

export function isPayOSConfigured(): boolean {
  return !!(
    process.env.PAYOS_CLIENT_ID &&
    process.env.PAYOS_API_KEY &&
    process.env.PAYOS_CHECKSUM_KEY
  );
}
