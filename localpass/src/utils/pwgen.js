const AMBIGUOUS = new Set(['l','I','1','O','0','o','S','5','B','8']);

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = "!@#$%^&*()-_=+[]{};:'\",.<>/?`~|";

function getRandomInt(maxExclusive) {
  if (!globalThis.crypto || !globalThis.crypto.getRandomValues) {
    throw new Error('Secure RNG not available');
  }
  const array = new Uint32Array(1);
  const maxUint = 0xFFFFFFFF;
  const limit = Math.floor((maxUint + 1) / maxExclusive) * maxExclusive;
  while (true) {
    globalThis.crypto.getRandomValues(array);
    const value = array[0];
    if (value < limit) return value % maxExclusive;
  }
}

function pick(charset) {
  const idx = getRandomInt(charset.length);
  return charset[idx];
}

function buildCharset(options) {
  let charset = '';
  if (options.lowercase) charset += LOWERCASE;
  if (options.uppercase) charset += UPPERCASE;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;
  if (options.avoidAmbiguous) {
    charset = [...charset].filter(c => !AMBIGUOUS.has(c)).join('');
  }
  return charset;
}

export function generatePassword(options) {
  const {
    length = 16,
    lowercase = true,
    uppercase = true,
    numbers = true,
    symbols = false,
    avoidAmbiguous = true,
    pronounceable = false,
  } = options || {};

  const len = Math.min(64, Math.max(8, length|0));

  if (pronounceable) {
    const vowels = 'aeiou';
    const consonants = [...LOWERCASE].filter(c => !vowels.includes(c));
    const vset = avoidAmbiguous ? vowels : vowels;
    const cset = avoidAmbiguous ? consonants.filter(c => !AMBIGUOUS.has(c)) : consonants;
    let out = '';
    for (let i = 0; i < len; i++) {
      const isConsonant = i % 2 === 0;
      const pool = isConsonant ? cset : vset;
      out += pool[getRandomInt(pool.length)];
    }
    return out;
  }

  const charset = buildCharset({ lowercase, uppercase, numbers, symbols, avoidAmbiguous });
  if (charset.length === 0) {
    throw new Error('At least one character set must be selected');
  }

  // Ensure at least one of each selected type appears
  const requiredPools = [];
  if (lowercase) requiredPools.push(avoidAmbiguous ? [...LOWERCASE].filter(c=>!AMBIGUOUS.has(c)).join('') : LOWERCASE);
  if (uppercase) requiredPools.push(avoidAmbiguous ? [...UPPERCASE].filter(c=>!AMBIGUOUS.has(c)).join('') : UPPERCASE);
  if (numbers) requiredPools.push(avoidAmbiguous ? [...NUMBERS].filter(c=>!AMBIGUOUS.has(c)).join('') : NUMBERS);
  if (symbols) requiredPools.push(avoidAmbiguous ? [...SYMBOLS].filter(c=>!AMBIGUOUS.has(c)).join('') : SYMBOLS);

  const result = [];
  // place required characters first
  for (const pool of requiredPools) {
    result.push(pool[getRandomInt(pool.length)]);
  }
  while (result.length < len) {
    result.push(pick(charset));
  }
  // Shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.join('');
}

export function estimateStrength(password, options) {
  const {
    lowercase = true,
    uppercase = true,
    numbers = true,
    symbols = false,
    avoidAmbiguous = true,
    pronounceable = false,
  } = options || {};

  let charsetSize = 0;
  if (pronounceable) {
    // approx: consonant set ~21, vowel set 5, average ~13 per char due to alternation
    charsetSize = 13;
  } else {
    if (lowercase) charsetSize += (avoidAmbiguous ? [...LOWERCASE].filter(c=>!AMBIGUOUS.has(c)).length : LOWERCASE.length);
    if (uppercase) charsetSize += (avoidAmbiguous ? [...UPPERCASE].filter(c=>!AMBIGUOUS.has(c)).length : UPPERCASE.length);
    if (numbers) charsetSize += (avoidAmbiguous ? [...NUMBERS].filter(c=>!AMBIGUOUS.has(c)).length : NUMBERS.length);
    if (symbols) charsetSize += (avoidAmbiguous ? [...SYMBOLS].filter(c=>!AMBIGUOUS.has(c)).length : SYMBOLS.length);
    if (charsetSize === 0) charsetSize = 1;
  }

  const entropy = password.length * Math.log2(charsetSize);
  let label = 'Weak';
  if (entropy >= 80) label = 'Strong';
  else if (entropy >= 60) label = 'Good';
  else if (entropy >= 40) label = 'Fair';

  const normalized = Math.max(0, Math.min(1, entropy / 100));
  return { entropy, label, normalized };
}


