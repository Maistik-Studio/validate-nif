# Contributing

Thanks for your interest in improving `@maistik/validate-nif`!

## Reporting issues

Before opening an issue, please search the
[issue tracker](https://github.com/Maistik-Studio/validate-nif/issues) to make
sure it hasn't already been reported. When filing a bug, include the input value
you validated and the result you expected.

## Development setup

This project uses [pnpm](https://pnpm.io) and Node.js >= 18.

```bash
pnpm install        # install dependencies
pnpm test           # run the test suite
pnpm test:coverage  # run tests with 100% coverage enforcement
pnpm lint           # lint the source
pnpm typecheck      # type-check without emitting
pnpm build          # build the dual ESM/CJS bundle into dist/
```

## Sending a pull request

For non-trivial changes, open an issue first so we can agree on the approach
before you invest time in the work.

The contribution workflow:

1. Fork the repo and create a feature branch off `master`.
2. Make your change. New behaviour must keep **100% test coverage** — the
   `test:coverage` script enforces this.
3. Make sure `pnpm lint`, `pnpm typecheck` and `pnpm test:coverage` all pass.
4. Use [Conventional Commits](https://www.conventionalcommits.org) for your
   commit messages (`feat:`, `fix:`, `docs:`, …). The release workflow derives
   the semver bump from them.
5. Open a pull request, referencing any issues it addresses, and keep it
   focused in scope.

Thank you for contributing!
