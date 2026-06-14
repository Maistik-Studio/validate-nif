import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  // Generate .d.ts type declarations alongside the JS bundles.
  declaration: true,
  // Single entry produces both ESM (.mjs) and CJS (.cjs) outputs.
  entries: ['src/index'],
  rollup: {
    emitCJS: true,
  },
  // Pure logic, no dependencies — fail loudly on any unexpected externals.
  externals: [],
  failOnWarn: true,
})
