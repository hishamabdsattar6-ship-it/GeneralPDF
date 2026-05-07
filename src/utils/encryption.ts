/**
 * AES-256-GCM Encryption Utility using Web Crypto API
 */

export async function encryptFile(fileBuffer: ArrayBuffer, password: string): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedContent = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    fileBuffer
  );

  // Combine Salt + IV + EncryptedData
  const result = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encryptedContent), salt.length + iv.length);

  return result.buffer;
}

export async function decryptFile(encryptedBuffer: ArrayBuffer, password: string): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const data = new Uint8Array(encryptedBuffer);
  
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const encryptedContent = data.slice(28);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decryptedContent = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encryptedContent
  );

  return decryptedContent;
}
