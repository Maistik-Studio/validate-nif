// CommonJS usage example. Runs against the built bundle to smoke-test the artifact.
// Run with: pnpm build && node examples/index.cjs
const assert = require('node:assert/strict')
const { validateNif, isValidDNI, isValidCIF, getType } = require('../dist/index.cjs')

console.log('validateNif("62805436A") =>', validateNif('62805436A')) // 1 (DNI)
console.log('isValidDNI("12345678Z")  =>', isValidDNI('12345678Z')) // true
console.log('isValidCIF("A58818501")  =>', isValidCIF('A58818501')) // true
console.log('getType("A58818501")     =>', getType('A58818501')) // 'CIF'

assert.equal(validateNif('62805436A'), 1)
assert.equal(isValidDNI('12345678Z'), true)
assert.equal(isValidCIF('A58818501'), true)
assert.equal(getType('A58818501'), 'CIF')

console.log('\n✅ CJS bundle works')
