# @maistik/validate-nif

[![CI](https://github.com/Maistik-Studio/validate-nif/actions/workflows/ci.yml/badge.svg)](https://github.com/Maistik-Studio/validate-nif/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@maistik/validate-nif.svg)](https://www.npmjs.com/package/@maistik/validate-nif)
[![license](https://img.shields.io/npm/l/@maistik/validate-nif.svg)](./LICENSE)

Zero-dependency, **isomorphic** (Node.js & browser) validator for Spanish fiscal
identifiers, written in TypeScript with full type definitions included.

- ✅ **DNI / NIF** — natural persons, residents (`12345678Z`)
- ✅ **NIE** — natural persons, foreigners (`X1234567L`)
- ✅ **CIF** — legal entities / organizations (`A58818501`)
- 🧮 Official AEAT control-character algorithms
- 🪶 No dependencies, tree-shakeable, ESM + CommonJS builds
- 🛡️ Never throws — any input (including `null`/`undefined`/numbers) is handled
- 🧪 100% test coverage

## Installation

```bash
# npm
npm install @maistik/validate-nif

# pnpm
pnpm add @maistik/validate-nif

# yarn
yarn add @maistik/validate-nif
```

## Usage

### ESM / TypeScript

```ts
import { isValid, isValidDNI, isValidNIE, isValidCIF, getType } from '@maistik/validate-nif'

isValidDNI('12345678Z')   // true
isValidNIE('X1234567L')   // true
isValidCIF('A58818501')   // true

isValid('12345678Z')      // true (any supported type)
getType('X1234567L')      // 'NIE'

// Loosely formatted input is normalized automatically.
isValid(' 12.345.678-z ') // true
```

### CommonJS

```js
const { validateNif, isValid } = require('@maistik/validate-nif')

isValid('A58818501') // true
```

### Browser

The package ships an ESM build with no Node.js dependencies, so it works
directly in the browser via any bundler (Vite, webpack, Rollup, esbuild) or
straight from a CDN:

```html
<script type="module">
  import { isValid } from 'https://esm.sh/@maistik/validate-nif'
  console.log(isValid('12345678Z')) // true
</script>
```

## API

All functions accept `unknown` input and never throw.

| Function | Returns | Description |
| --- | --- | --- |
| `isValid(value)` | `boolean` | `true` for a valid DNI, NIE **or** CIF. |
| `isValidNIF(value)` | `boolean` | `true` for a valid DNI **or** NIE (natural person). |
| `isValidDNI(value)` | `boolean` | `true` for a valid DNI / NIF. |
| `isValidNIE(value)` | `boolean` | `true` for a valid NIE. |
| `isValidCIF(value)` | `boolean` | `true` for a valid CIF. |
| `getType(value)` | `'DNI' \| 'NIE' \| 'CIF' \| null` | The detected type, or `null` if invalid. |
| `getCifOrganizationType(value)` | `{ code, description } \| null` | The organization type for a valid CIF, or `null`. |
| `parse(value)` | `NifInfo` | Structured info: `{ valid, type, normalized, organization }`. |
| `format(value, options?)` | `string` | Canonical form; `options.separator` inserts a separator before the control char. |
| `normalize(value)` | `string` | Upper-cases and strips spaces, dots, hyphens and underscores. |
| `controlLetterFor(num)` | `string` | The DNI/NIE control letter for an 8-digit number. |
| `validateNif(value)` | `number` | Legacy numeric code (see below). |

### Parsing & organization types

```ts
import { parse, getCifOrganizationType, format } from '@maistik/validate-nif'

parse('a-58818501')
// {
//   valid: true,
//   type: 'CIF',
//   normalized: 'A58818501',
//   organization: { code: 'A', description: 'Sociedad anónima' },
// }

getCifOrganizationType('G12345678') // { code: 'G', description: 'Asociación o fundación' }

format('12345678z', { separator: '-' }) // '12345678-Z'
```

A CIF's leading letter is mapped to its Spanish organization type (Sociedad
anónima, Sociedad de responsabilidad limitada, Cooperativa, Asociación,
Corporación local, and so on — the full AEAT set is supported).

### `validateNif` result codes

`validateNif` is kept for backwards compatibility. It returns a numeric code:
negative means **invalid**, `>= 0` means **valid**.

| Code | Constant | Meaning |
| --- | --- | --- |
| `-1` | `ValidationResult.ERROR` | Invalid / unknown value |
| `1` | `ValidationResult.DNI` | Valid DNI / NIF |
| `4` | `ValidationResult.NIE` | Valid NIE |
| `20` | `ValidationResult.CIF` | Valid CIF |

```ts
import { validateNif, ValidationResult } from '@maistik/validate-nif'

validateNif('62805436A') // 1  (>= 0 → valid)
validateNif('62805436X') // -1 (< 0 → invalid)
validateNif('A58818501') === ValidationResult.CIF // true
```

## Types

Type declarations (`.d.ts`) are bundled and exposed automatically — no
`@types/*` package is required. The package also exports the `NifType`,
`NifInfo`, `CifOrganizationType`, `FormatOptions` and `ValidationResultCode`
helper types.

## Development

```bash
pnpm install
pnpm test:coverage   # tests with 100% coverage enforcement
pnpm lint            # eslint
pnpm typecheck       # tsc --noEmit
pnpm build           # build dist/ (ESM + CJS + .d.ts)
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full contribution guide.

## License

[MIT](./LICENSE) © Maistik Studio
