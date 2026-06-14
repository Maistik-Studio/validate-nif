import { describe, it, expect } from 'vitest'
import validateNif, {
  ValidationResult,
  controlLetterFor,
  format,
  getCifOrganizationType,
  getType,
  isValid,
  isValidCIF,
  isValidDNI,
  isValidNIE,
  isValidNIF,
  normalize,
  parse,
  validateNif as namedValidateNif,
} from '../src/index'

describe('normalize', () => {
  it('returns an empty string for nullish values', () => {
    expect(normalize(null)).toBe('')
    expect(normalize(undefined)).toBe('')
  })

  it('coerces non-string values to a string', () => {
    expect(normalize(12345678)).toBe('12345678')
  })

  it('upper-cases and strips spaces, dots, hyphens and underscores', () => {
    expect(normalize('  12.345-678_z ')).toBe('12345678Z')
  })
})

describe('controlLetterFor', () => {
  it('maps a number to its DNI control letter', () => {
    expect(controlLetterFor(12345678)).toBe('Z')
    expect(controlLetterFor(0)).toBe('T')
  })
})

describe('isValidDNI', () => {
  it('accepts valid DNIs', () => {
    expect(isValidDNI('12345678Z')).toBe(true)
    expect(isValidDNI('62805436A')).toBe(true)
  })

  it('accepts loosely formatted input', () => {
    expect(isValidDNI(' 12345678-z ')).toBe(true)
  })

  it('rejects a wrong control letter', () => {
    expect(isValidDNI('12345678A')).toBe(false)
  })

  it('rejects malformed values', () => {
    expect(isValidDNI('1234567Z')).toBe(false)
    expect(isValidDNI('X1234567L')).toBe(false)
    expect(isValidDNI('')).toBe(false)
  })
})

describe('isValidNIE', () => {
  it('accepts valid X/Y/Z NIEs', () => {
    expect(isValidNIE('X1234567L')).toBe(true)
    expect(isValidNIE('Y1234567X')).toBe(true)
    expect(isValidNIE('Z1234567R')).toBe(true)
  })

  it('rejects a wrong control letter', () => {
    expect(isValidNIE('X1234567A')).toBe(false)
  })

  it('rejects malformed values', () => {
    expect(isValidNIE('12345678Z')).toBe(false)
    expect(isValidNIE('A1234567L')).toBe(false)
  })
})

describe('isValidCIF', () => {
  it('accepts digit-control entities (A/B/E/H)', () => {
    expect(isValidCIF('A58818501')).toBe(true)
  })

  it('rejects a wrong digit-control', () => {
    expect(isValidCIF('A58818502')).toBe(false)
  })

  it('accepts letter-control entities (N/P/Q/R/S/W)', () => {
    expect(isValidCIF('P1234567D')).toBe(true)
  })

  it('rejects a wrong letter-control', () => {
    expect(isValidCIF('P1234567E')).toBe(false)
    // For P the control must be a letter, never a digit.
    expect(isValidCIF('P12345674')).toBe(false)
  })

  it('accepts either digit or letter for the remaining entities', () => {
    expect(isValidCIF('J12345674')).toBe(true)
    expect(isValidCIF('J1234567D')).toBe(true)
  })

  it('rejects when neither digit nor letter control matches', () => {
    expect(isValidCIF('J12345675')).toBe(false)
  })

  it('rejects malformed values', () => {
    expect(isValidCIF('12345678Z')).toBe(false)
    expect(isValidCIF('I1234567D')).toBe(false)
  })
})

describe('isValidNIF', () => {
  it('is true for a DNI or a NIE', () => {
    expect(isValidNIF('12345678Z')).toBe(true)
    expect(isValidNIF('X1234567L')).toBe(true)
  })

  it('is false for a CIF or garbage', () => {
    expect(isValidNIF('A58818501')).toBe(false)
    expect(isValidNIF('nope')).toBe(false)
  })
})

describe('isValid', () => {
  it('is true for any supported identifier', () => {
    expect(isValid('12345678Z')).toBe(true)
    expect(isValid('X1234567L')).toBe(true)
    expect(isValid('A58818501')).toBe(true)
  })

  it('is false for unsupported values', () => {
    expect(isValid('hello')).toBe(false)
    expect(isValid(null)).toBe(false)
  })
})

describe('getType', () => {
  it('detects the identifier type', () => {
    expect(getType('12345678Z')).toBe('DNI')
    expect(getType('X1234567L')).toBe('NIE')
    expect(getType('A58818501')).toBe('CIF')
  })

  it('returns null for invalid values', () => {
    expect(getType('not-an-id')).toBeNull()
  })
})

describe('validateNif', () => {
  it('returns the matching ValidationResult code', () => {
    expect(validateNif('12345678Z')).toBe(ValidationResult.DNI)
    expect(validateNif('X1234567L')).toBe(ValidationResult.NIE)
    expect(validateNif('A58818501')).toBe(ValidationResult.CIF)
  })

  it('returns ERROR for invalid values', () => {
    expect(validateNif('12345678A')).toBe(ValidationResult.ERROR)
    expect(validateNif(null)).toBe(ValidationResult.ERROR)
  })

  it('keeps the legacy sign contract (valid >= 0, invalid < 0)', () => {
    expect(validateNif('62805436A')).toBeGreaterThanOrEqual(0)
    expect(validateNif('62805436X')).toBeLessThan(0)
  })

  it('is exported both as default and named', () => {
    expect(namedValidateNif).toBe(validateNif)
  })
})

describe('getCifOrganizationType', () => {
  it('returns the organization type for a valid CIF', () => {
    expect(getCifOrganizationType('A58818501')).toEqual({
      code: 'A',
      description: 'Sociedad anónima',
    })
  })

  it('returns null for non-CIF values', () => {
    expect(getCifOrganizationType('12345678Z')).toBeNull()
  })
})

describe('parse', () => {
  it('describes a DNI', () => {
    expect(parse('12345678Z')).toEqual({
      valid: true,
      type: 'DNI',
      normalized: '12345678Z',
      organization: null,
    })
  })

  it('describes a CIF with its organization', () => {
    expect(parse('a-58818501')).toEqual({
      valid: true,
      type: 'CIF',
      normalized: 'A58818501',
      organization: { code: 'A', description: 'Sociedad anónima' },
    })
  })

  it('describes an invalid value', () => {
    expect(parse('nope')).toEqual({
      valid: false,
      type: null,
      normalized: 'NOPE',
      organization: null,
    })
  })
})

describe('format', () => {
  it('returns the normalized value by default', () => {
    expect(format(' 12345678-z ')).toBe('12345678Z')
  })

  it('inserts a separator before the control character', () => {
    expect(format('12345678z', { separator: '-' })).toBe('12345678-Z')
  })

  it('returns invalid values normalized, without a separator', () => {
    expect(format('nope', { separator: '-' })).toBe('NOPE')
  })
})

describe('ValidationResult', () => {
  it('exposes the documented numeric codes', () => {
    expect(ValidationResult).toEqual({ ERROR: -1, DNI: 1, NIE: 4, CIF: 20 })
  })
})
