# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## ...master


### 🚀 Enhancements

- ⚠️  Rewrite as isomorphic TypeScript package under @maistik scope ([eed3984](https://github.com/Maistik-Studio/validate-nif/commit/eed3984))

### 🩹 Fixes

- **ci:** Robust npm auth + working toolchain on latest majors ([c781550](https://github.com/Maistik-Studio/validate-nif/commit/c781550))
- **ci:** Test only on Node 22/24 (pnpm 11 requires Node >=22.13) ([49db44e](https://github.com/Maistik-Studio/validate-nif/commit/49db44e))
- **ci:** Write npm token to the config file npm actually reads ([453d9b0](https://github.com/Maistik-Studio/validate-nif/commit/453d9b0))

#### ⚠️ Breaking Changes

- ⚠️  Rewrite as isomorphic TypeScript package under @maistik scope ([eed3984](https://github.com/Maistik-Studio/validate-nif/commit/eed3984))

### ❤️ Contributors

- Marcos Sanz Latorre ([@marsanla](https://github.com/marsanla))

## v2.0.0

Full rewrite and republish under the `@maistik` scope.

### ⚠️ Breaking changes

- Package renamed from `@willowi/validate-nif` to **`@maistik/validate-nif`**.
- Dropped the legacy Babel `lib/` build. The package now ships a dual
  **ESM (`.mjs`) + CommonJS (`.cjs`)** bundle with bundled type declarations.
- `validateNif` now returns clean numeric codes (`1` DNI, `4` NIE, `20` CIF,
  `-1` invalid). The `>= 0` = valid / `< 0` = invalid contract is preserved.

### Added

- **TypeScript source** with bundled `.d.ts` declarations — consumers get full
  typings automatically, no `@types` package required.
- **Isomorphic** build (zero dependencies, no Node APIs) — works in Node.js and
  the browser.
- New validation helpers: `isValid`, `isValidNIF`, `isValidDNI`, `isValidNIE`,
  `isValidCIF`, `getType`.
- `getCifOrganizationType()` — resolves a CIF's organization type from its
  leading letter (full AEAT set).
- `parse()` — structured `{ valid, type, normalized, organization }` result.
- `format()` — canonical output with an optional separator before the control
  character.
- Exported types: `NifType`, `NifInfo`, `CifOrganizationType`, `FormatOptions`,
  `ValidationResultCode`, and the `ValidationResult` code map.
- **100% test coverage** enforced via Vitest thresholds.
- GitHub Actions CI / Release / Publish workflow (Node 18/20/22/24 matrix,
  lint, typecheck, coverage, automated semver bump and npm publish).

### Fixed

- Replaced leftover Java (`Integer.parseInt`, `(int)` casts) that threw
  `ReferenceError` on K/L/M identifiers.
- Fixed the CIF check-digit comparison, which used a stale loop variable instead
  of the actual control character.
- The public API no longer throws on `null`, `undefined` or non-string input.

### Removed

- Babel, Travis CI, istanbul and other legacy tooling.
