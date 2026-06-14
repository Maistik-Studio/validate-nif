/**
 * validate-nif
 *
 * Zero-dependency, isomorphic (Node & browser) validator for Spanish fiscal
 * identifiers:
 *
 *   - DNI / NIF — natural persons, residents (8 digits + control letter)
 *   - NIE       — natural persons, foreigners (X/Y/Z + 7 digits + control letter)
 *   - CIF       — legal entities / organizations (letter + 7 digits + control)
 *
 * The control-character algorithms follow the official AEAT specification.
 */

/** The kind of a valid Spanish fiscal identifier. */
export type NifType = 'DNI' | 'NIE' | 'CIF'

/** The organization type encoded in the first letter of a CIF. */
export interface CifOrganizationType {
  /** The CIF leading letter (e.g. `'A'`). */
  code: string
  /** Human-readable description of the organization type (in Spanish). */
  description: string
}

/** Structured result describing a parsed identifier. */
export interface NifInfo {
  /** Whether the value is a valid DNI, NIE or CIF. */
  valid: boolean
  /** The detected type, or `null` when invalid. */
  type: NifType | null
  /** The normalized (upper-cased, separator-free) value. */
  normalized: string
  /** The organization details, only present for a valid CIF. */
  organization: CifOrganizationType | null
}

/** Options for {@link format}. */
export interface FormatOptions {
  /** Separator inserted before the control character (e.g. `'-'`). */
  separator?: string
}

/**
 * Numeric result codes returned by {@link validateNif}.
 * Negative values mean invalid; values `>= 0` mean valid.
 */
export const ValidationResult = {
  /** Unknown or malformed value. */
  ERROR: -1,
  /** Valid DNI / NIF (Spanish resident). */
  DNI: 1,
  /** Valid NIE (foreigner). */
  NIE: 4,
  /** Valid CIF (organization). */
  CIF: 20,
} as const

export type ValidationResultCode =
  (typeof ValidationResult)[keyof typeof ValidationResult]

// Control letter table for DNI / NIE, indexed by `number % 23`.
const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE'

// Control letter table for letter-type CIFs, indexed by the control digit.
const CIF_LETTERS = 'JABCDEFGHI'

// CIF first letters whose control character MUST be a letter.
const CIF_LETTER_CONTROL = 'NPQRSW'

// CIF first letters whose control character MUST be a digit.
const CIF_DIGIT_CONTROL = 'ABEH'

const NIE_PREFIX: Record<string, string> = { X: '0', Y: '1', Z: '2' }

// Organization type encoded in the leading letter of a CIF (per AEAT).
const CIF_ORGANIZATION_TYPES: Record<string, string> = {
  A: 'Sociedad anónima',
  B: 'Sociedad de responsabilidad limitada',
  C: 'Sociedad colectiva',
  D: 'Sociedad comanditaria',
  E: 'Comunidad de bienes y herencias yacentes',
  F: 'Sociedad cooperativa',
  G: 'Asociación o fundación',
  H: 'Comunidad de propietarios en régimen de propiedad horizontal',
  J: 'Sociedad civil',
  N: 'Entidad extranjera',
  P: 'Corporación local',
  Q: 'Organismo público',
  R: 'Congregación o institución religiosa',
  S: 'Órgano de la Administración del Estado o comunidad autónoma',
  U: 'Unión temporal de empresas',
  V: 'Otro tipo de entidad sin personalidad jurídica',
  W: 'Establecimiento permanente de entidad no residente',
}

const DNI_RE = /^\d{8}[A-Z]$/
const NIE_RE = /^[XYZ]\d{7}[A-Z]$/
const CIF_RE = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/

/**
 * Normalize any input into an upper-cased string with the common separators
 * (spaces, dots, hyphens, underscores) removed. Non-string and nullish values
 * are coerced safely, so the public API never throws.
 */
export function normalize(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  const str = typeof value === 'string' ? value : String(value)
  return str.toUpperCase().replace(/[\s.\-_]/g, '')
}

/** Compute the control letter for an 8-digit DNI / NIE number. */
export function controlLetterFor(num: number): string {
  return DNI_LETTERS[num % 23]
}

/** Validate a Spanish DNI / NIF (8 digits + control letter). */
export function isValidDNI(value: unknown): boolean {
  const v = normalize(value)
  if (!DNI_RE.test(v)) {
    return false
  }
  const num = parseInt(v.slice(0, 8), 10)
  return v[8] === controlLetterFor(num)
}

/** Validate a Spanish NIE (X/Y/Z + 7 digits + control letter). */
export function isValidNIE(value: unknown): boolean {
  const v = normalize(value)
  if (!NIE_RE.test(v)) {
    return false
  }
  const num = parseInt(NIE_PREFIX[v[0]] + v.slice(1, 8), 10)
  return v[8] === controlLetterFor(num)
}

/** Validate a Spanish CIF (letter + 7 digits + control digit/letter). */
export function isValidCIF(value: unknown): boolean {
  const v = normalize(value)
  if (!CIF_RE.test(v)) {
    return false
  }

  const firstLetter = v[0]
  const digits = v.slice(1, 8)
  const control = v[8]

  let sum = 0
  for (let i = 0; i < digits.length; i += 1) {
    let n = parseInt(digits[i], 10)
    // Odd positions (1-based: index 0, 2, 4, 6) are doubled.
    if (i % 2 === 0) {
      n *= 2
      if (n > 9) {
        n -= 9
      }
    }
    sum += n
  }

  const controlDigit = (10 - (sum % 10)) % 10
  const controlLetter = CIF_LETTERS[controlDigit]

  if (CIF_LETTER_CONTROL.includes(firstLetter)) {
    return control === controlLetter
  }
  if (CIF_DIGIT_CONTROL.includes(firstLetter)) {
    return control === String(controlDigit)
  }
  // Remaining entities accept either a digit or a letter control character.
  return control === String(controlDigit) || control === controlLetter
}

/** Validate a NIF for a natural person (DNI or NIE). */
export function isValidNIF(value: unknown): boolean {
  return isValidDNI(value) || isValidNIE(value)
}

/** Validate any supported Spanish fiscal identifier (DNI, NIE or CIF). */
export function isValid(value: unknown): boolean {
  return isValidDNI(value) || isValidNIE(value) || isValidCIF(value)
}

/** Detect the type of a valid identifier, or `null` when it is invalid. */
export function getType(value: unknown): NifType | null {
  if (isValidDNI(value)) {
    return 'DNI'
  }
  if (isValidNIE(value)) {
    return 'NIE'
  }
  if (isValidCIF(value)) {
    return 'CIF'
  }
  return null
}

/**
 * Resolve the organization type for a valid CIF from its leading letter, or
 * `null` when the value is not a valid CIF.
 */
export function getCifOrganizationType(
  value: unknown,
): CifOrganizationType | null {
  if (!isValidCIF(value)) {
    return null
  }
  const code = normalize(value)[0]
  return { code, description: CIF_ORGANIZATION_TYPES[code] }
}

/**
 * Parse a value into a structured {@link NifInfo} object describing its
 * validity, type, normalized form and (for CIFs) organization details.
 */
export function parse(value: unknown): NifInfo {
  const normalized = normalize(value)
  const type = getType(value)
  return {
    valid: type !== null,
    type,
    normalized,
    organization: type === 'CIF' ? getCifOrganizationType(value) : null,
  }
}

/**
 * Return the canonical (normalized, upper-cased) representation of an
 * identifier. When a `separator` is provided it is inserted before the control
 * character — e.g. `format('12345678z', { separator: '-' })` → `'12345678-Z'`.
 * Invalid values are returned normalized without a separator.
 */
export function format(value: unknown, options: FormatOptions = {}): string {
  const v = normalize(value)
  const separator = options.separator ?? ''
  if (!separator || !isValid(v)) {
    return v
  }
  return `${v.slice(0, -1)}${separator}${v.slice(-1)}`
}

/**
 * Backwards-compatible validator returning a numeric {@link ValidationResult}
 * code. Negative values mean invalid; values `>= 0` mean valid.
 */
export function validateNif(value: unknown): ValidationResultCode {
  if (isValidDNI(value)) {
    return ValidationResult.DNI
  }
  if (isValidNIE(value)) {
    return ValidationResult.NIE
  }
  if (isValidCIF(value)) {
    return ValidationResult.CIF
  }
  return ValidationResult.ERROR
}

export default validateNif
