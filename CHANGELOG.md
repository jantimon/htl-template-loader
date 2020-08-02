# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [5.0.0](https://github.com/jantimon/htl-template-loader/compare/v4.0.0...v5.0.0) (2020-08-02)

### ⚠ BREAKING CHANGES

- the new template engine requires @adobe/htlengine 5.1 or newer

### Features

- use pure template loader to increase performance ([50faa52](https://github.com/jantimon/htl-template-loader/commit/50faa520b745e610a4c6e8799d137cfeb72fdde2))

## [4.0.0](https://github.com/jantimon/htl-template-loader/compare/v3.1.5...v4.0.0) (2020-07-22)

### ⚠ BREAKING CHANGES

- Drop support for @adobe/htlengine older than ^4.6.2

### Features

- define template-api to be side-effect free ([70d4063](https://github.com/jantimon/htl-template-loader/commit/70d40633ee06efc8a605c9a13f25b93d211aa577))

### Bug Fixes

- remove a work around to reset the internal runtime buffer ([579476c](https://github.com/jantimon/htl-template-loader/commit/579476c492dac5b9e715fe81429ac6055a29176f))

### [3.1.5](https://github.com/jantimon/htl-template-loader/compare/v3.1.4...v3.1.5) (2020-07-15)

### Bug Fixes

- allow to access globals inside templates ([3746b20](https://github.com/jantimon/htl-template-loader/commit/3746b20c470f770060cdcbfcc24c24dcae065608))

### [3.1.4](https://github.com/jantimon/htl-template-loader/compare/v3.1.3...v3.1.4) (2020-07-14)

### Bug Fixes

- update standard-version ([fea963c](https://github.com/jantimon/htl-template-loader/commit/fea963c5260994e54cd561ca304af46d4306866c))

### [3.1.3](https://github.com/jantimon/htl-loader/compare/v3.1.2...v3.1.3) (2020-07-12)

### Bug Fixes

- add support for module path minification ([252e169](https://github.com/jantimon/htl-loader/commit/252e16972a8982548f6f7d71dd261b82053f0f46))

### [3.1.2](https://github.com/jantimon/htl-loader/compare/v3.1.1...v3.1.2) (2020-07-01)

### Bug Fixes

- remove globrex ([0037f1b](https://github.com/jantimon/htl-loader/commit/0037f1b1922d3202bc39498aa94e859d3d6725fd))

### [3.1.1](https://github.com/jantimon/htl-loader/compare/v3.1.0...v3.1.1) (2020-07-01)

### Bug Fixes

- publish correct runtime filename ([71f79b1](https://github.com/jantimon/htl-loader/commit/71f79b1bdd4c174a0ed3cff70e7af986877342de))

## [3.1.0](https://github.com/jantimon/htl-loader/compare/v3.0.0...v3.1.0) (2020-07-01)

### Features

- add automatic resource loading from resourceRoot ([440baac](https://github.com/jantimon/htl-loader/commit/440baac62c89f8ac6d617fa3914929d7ea8f8700))

## [3.0.0](https://github.com/jantimon/htl-loader/compare/v2.1.0...v3.0.0) (2020-06-30)

### ⚠ BREAKING CHANGES

- merge models and globals into

### Features

- add support for subcomponents ([9ec9ee0](https://github.com/jantimon/htl-loader/commit/9ec9ee0de0ff4150ae64257b194178fd59fc0c69))

## [2.1.0](https://github.com/jantimon/htl-loader/compare/v2.0.0...v2.1.0) (2020-06-29)

### Features

- mock global htl objects ([2ca7104](https://github.com/jantimon/htl-loader/commit/2ca710490b8fd4d09fa927699d296227fffc4bd5))

## [2.0.0](https://github.com/jantimon/htl-loader/compare/v1.9.0...v2.0.0) (2020-06-29)

### ⚠ BREAKING CHANGES

- the default export is now exporting the render function which renders the entire file

### Features

- export main render function ([0ff6bc1](https://github.com/jantimon/htl-loader/commit/0ff6bc1dd8f4302227014233c563576eae8f3f57))

## [1.9.0](https://github.com/jantimon/htl-loader/compare/v1.8.0...v1.9.0) (2020-06-26)

### Features

- Allow to define models for the templates ([74bf5d9](https://github.com/jantimon/htl-loader/commit/74bf5d9ecf34746ee031ecd03f9fa0f97be863f5))

## [1.8.0](https://github.com/jantimon/htl-loader/compare/v1.7.1...v1.8.0) (2020-06-26)

### Features

- Add templateRoot option ([5a6b0a7](https://github.com/jantimon/htl-loader/commit/5a6b0a7526ecdf117719ee0f6accaf4dd361df65))

### [1.7.1](https://github.com/jantimon/htl-loader/compare/v1.7.0...v1.7.1) (2020-06-25)

### Bug Fixes

- adjust configuration order to enforce template loader execution ([1885274](https://github.com/jantimon/htl-loader/commit/18852748a5549fc5bb4605782444614a5d8800d1))

## [1.7.0](https://github.com/jantimon/htl-loader/compare/v1.6.0...v1.7.0) (2020-06-25)

### Features

- remove template cache ([9dab266](https://github.com/jantimon/htl-loader/commit/9dab2664603febf40a96b90aae5a18cf717fc034))

## [1.6.0](https://github.com/jantimon/htl-loader/compare/v1.5.0...v1.6.0) (2020-06-25)

### Features

- track included templates ([d13d9ab](https://github.com/jantimon/htl-loader/commit/d13d9ab56d0ab75488884da3b237d705950c2ade))

## [1.5.0](https://github.com/jantimon/htl-loader/compare/v1.3.0...v1.5.0) (2020-06-25)

### Features

- cache templates ([5f38c77](https://github.com/jantimon/htl-loader/commit/5f38c772403884bc3d5fd313761e3814d4398a8f))

## [1.3.0](https://github.com/jantimon/htl-loader/compare/v1.2.0...v1.3.0) (2020-06-24)

### Features

- add getTemplate to create typed template function ([2856364](https://github.com/jantimon/htl-loader/commit/285636447f2cd7e7d05af24a5919d44fa849091f))

## [1.2.0](https://github.com/jantimon/htl-loader/compare/v1.1.0...v1.2.0) (2020-06-18)

### Features

- export typings ([0a5d0d7](https://github.com/jantimon/htl-loader/commit/0a5d0d79529ef27685f14c7d62c6f85a5c438e9a))

## 1.1.0 (2020-06-18)

### Features

- Make template name optional ([745204b](https://github.com/jantimon/htl-loader/commit/745204b13c176dc8fc38367aa29deec168b88a86))
