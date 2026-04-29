import * as Crypto from 'expo-crypto';

/**
 * Hash a raw PIN string using SHA-256.
 * Always store the hash — NEVER the raw PIN.
 */
export async function hashPin(pin: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin
  );
}

/**
 * Compare a raw entered PIN against a stored SHA-256 hash.
 * Timing-safe via SHA-256 comparison (both sides hashed).
 */
export async function verifyPin(enteredPin: string, storedHash: string): Promise<boolean> {
  const enteredHash = await hashPin(enteredPin);
  return enteredHash === storedHash;
}
