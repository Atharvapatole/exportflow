import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Returns a 32-byte master encryption key derived from environment secrets.
 */
function getMasterKey(): Buffer {
  const secret =
    process.env.ENCRYPTION_MASTER_KEY ||
    process.env.SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'exportflow_default_master_encryption_key_benzwell_2026';

  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a sensitive string using AES-256-GCM.
 * Output format: enc_v1:ivHex:authTagHex:ciphertextHex
 */
export function encryptSecret(plaintext: string): string {
  if (!plaintext || plaintext.trim() === '') return '';
  // If already encrypted, don't re-encrypt
  if (plaintext.startsWith('enc_v1:')) return plaintext;

  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `enc_v1:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a sensitive string previously encrypted with encryptSecret.
 * If string is unencrypted or empty, returns as is.
 */
export function decryptSecret(encryptedStr: string): string {
  if (!encryptedStr || encryptedStr.trim() === '') return '';
  if (!encryptedStr.startsWith('enc_v1:')) {
    // Return unencrypted plaintext directly for backward compatibility
    return encryptedStr;
  }

  try {
    const parts = encryptedStr.split(':');
    if (parts.length !== 4) return encryptedStr;

    const [, ivHex, tagHex, cipherHex] = parts;
    const key = getMasterKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err: any) {
    console.error('[CRYPTO] Failed to decrypt secret:', err.message);
    return '';
  }
}

/**
 * Safely masks a secret for frontend display:
 * Shows at most the last 4 characters, preceded by bullets.
 */
export function maskSensitiveValue(value: string | undefined | null): string {
  if (!value || value.trim() === '') return '';
  const plain = decryptSecret(value);
  if (!plain || plain.length === 0) return '';
  if (plain.length <= 4) return '••••';
  return '••••••••' + plain.slice(-4);
}
