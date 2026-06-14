// ESM usage example. Runs against the built bundle to smoke-test the artifact.
// Run with: pnpm build && node examples/index.mjs
import assert from 'node:assert/strict'
import validateNif, {
  format,
  getCifOrganizationType,
  getType,
  isValid,
  isValidCIF,
  isValidDNI,
  isValidNIE,
  parse,
} from '../dist/index.mjs'

console.log('validateNif("62805436A")      =>', validateNif('62805436A')) // 1 (DNI)
console.log('isValidDNI("12345678Z")       =>', isValidDNI('12345678Z')) // true
console.log('isValidNIE("X1234567L")       =>', isValidNIE('X1234567L')) // true
console.log('isValidCIF("A58818501")       =>', isValidCIF('A58818501')) // true
console.log('getType("X1234567L")          =>', getType('X1234567L')) // 'NIE'
console.log('isValid(" 12.345.678-z ")     =>', isValid(' 12.345.678-z ')) // true
console.log('format("12345678z", "-")      =>', format('12345678z', { separator: '-' })) // 12345678-Z
console.log('getCifOrganizationType("A...")=>', getCifOrganizationType('A58818501')) // { code: 'A', ... }
console.log('parse("a-58818501")           =>', parse('a-58818501'))

// Sanity assertions so the example fails loudly if the bundle is broken.
assert.equal(validateNif('62805436A'), 1)
assert.equal(isValidDNI('12345678Z'), true)
assert.equal(isValidNIE('X1234567L'), true)
assert.equal(isValidCIF('A58818501'), true)
assert.equal(getType('X1234567L'), 'NIE')
assert.equal(isValid('not-an-id'), false)
assert.equal(format('12345678z', { separator: '-' }), '12345678-Z')
assert.equal(getCifOrganizationType('A58818501').description, 'Sociedad anónima')
assert.equal(parse('a-58818501').type, 'CIF')

console.log('\n✅ ESM bundle works')
