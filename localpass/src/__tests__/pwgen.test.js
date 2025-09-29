import { describe, it, expect } from 'vitest'
import { generatePassword } from '../utils/pwgen.js'

function hasAny(str, set) { return [...str].some(c => set.includes(c)) }

describe('generatePassword', () => {
  it('generates with correct length', () => {
    const pw = generatePassword({ length: 24 })
    expect(pw.length).toBe(24)
  })

  it('includes selected character types', () => {
    const pw = generatePassword({ length: 24, lowercase: true, uppercase: true, numbers: true, symbols: true, avoidAmbiguous: false })
    expect(hasAny(pw, 'abcdefghijklmnopqrstuvwxyz')).toBe(true)
    expect(hasAny(pw, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(true)
    expect(hasAny(pw, '0123456789')).toBe(true)
    expect(hasAny(pw, "!@#$%^&*()-_=+[]{};:'\",.<>/?`~|" )).toBe(true)
  })

  it('pronounceable mode produces only letters', () => {
    const pw = generatePassword({ length: 20, pronounceable: true, lowercase: true, uppercase: false, numbers: false, symbols: false })
    expect(/^[a-z]+$/.test(pw)).toBe(true)
  })
})


