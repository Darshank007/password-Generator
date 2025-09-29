const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

export async function deriveKeyFromPassword(password, salt, iterations = 200000) {
  const passKey = await crypto.subtle.importKey(
    'raw',
    TEXT_ENCODER.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    passKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data, password, iterations = 200000) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassword(password, salt, iterations);
  const plaintext = TEXT_ENCODER.encode(JSON.stringify(data));
  const ctBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return {
    v: 1,
    iter: iterations,
    salt: Array.from(salt),
    iv: Array.from(iv),
    ct: Array.from(new Uint8Array(ctBuffer)),
  };
}

export async function decryptData(payload, password) {
  if (!payload || payload.v !== 1) throw new Error('Unsupported payload');
  const salt = new Uint8Array(payload.salt);
  const iv = new Uint8Array(payload.iv);
  const ct = new Uint8Array(payload.ct);
  const iterations = payload.iter || 200000;
  const key = await deriveKeyFromPassword(password, salt, iterations);
  const ptBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return JSON.parse(TEXT_DECODER.decode(ptBuffer));
}


