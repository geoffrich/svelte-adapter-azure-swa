# Changelog

### [0.19.1](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.19.0...v0.19.1) (2023-11-20)


### Bug Fixes

* do not rewrite /api and /data-api requests to SvelteKit ([#162](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/162)) ([aa36771](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/aa3677133d404cf7bb396ea3f4c41ea026598ce7))
* do not throw on parsing client principal ([#160](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/160)) ([0fe3eaa](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/0fe3eaa593e3f58044b230957e190cb3011ea4d5))

## [0.19.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.18.0...v0.19.0) (2023-08-17)


### Features

* add `loader` to `esbuildOptions` ([#153](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/153)) ([f1f4ec6](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/f1f4ec6800a3d90e8002207c0609939fa1ccc049))

## [0.18.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.17.0...v0.18.0) (2023-08-03)


### Features

* add `keepNames` to `esbuildOptions` ([#150](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/150)) ([dbe44ba](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/dbe44ba4d239a4bc1db238b909fd8a5f55b5baf4))

## [0.17.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.16.0...v0.17.0) (2023-07-02)


### Features

* allow overriding `platform.apiRuntime` ([#144](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/144)) ([fd8241a](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/fd8241a7a02846d846fc291cb4c74a966d00db14))
* throw error if /api routes defined ([#142](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/142)) ([036cf64](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/036cf64fbedc3f4ec95271be03f75ada66eb7f2e))

## [0.16.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.15.0...v0.16.0) (2023-05-12)


### Features

* add `staticDir` setting ([#117](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/117)) ([4f2ff41](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/4f2ff41a8355ce070fc96f7d9c709806a74a2341))

## [0.15.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.14.0...v0.15.0) (2023-03-18)


### Features

* add context to the platform object ([#127](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/127)) ([e597d0c](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/e597d0cbd54a0e486a6bedc93d6b8071bb25f2b8))


### Bug Fixes

* await server init ([#128](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/128)) ([4900a35](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/4900a351ee78fcecf3050cf0a28696548646cd1a))

## [0.14.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.13.0...v0.14.0) (2023-03-15)


### Features

* expose client principal through platform ([#107](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/107)) ([e41f89c](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/e41f89cde57858b76df61a7ba6316f5ac0a4498d))


### Bug Fixes

* binary body is incorrectly parsed as UTF-8 ([#123](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/123)) ([4869959](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/48699595be4cabe355f070250780492bba5a1fdb))

## [0.13.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.12.0...v0.13.0) (2023-01-23)


### Features

* bump deps to SvelteKit 1.0 ([d050933](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/d050933b237530b6064351fe619c6f36bbee66d2))

## [0.12.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.11.0...v0.12.0) (2022-11-21)


### Features

* auto-create required function files ([#92](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/92)) ([c682164](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/c682164dfcc35045fbb66cc1ea31f3a8e253a411))
* implement getClientAddress ([#71](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/71)) ([56b5380](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/56b5380c8ebb29c2678bb83ea3cbf9189dd09ee6))

## [0.11.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.10.0...v0.11.0) (2022-10-18)


### Features

* generate sourcemaps ([#75](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/75)) ([90e19bd](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/90e19bdbec8dbc7833d54246bf61bbf3d9c93d89))


### Bug Fixes

* copy over necessary files ([#84](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/84)) ([f503556](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/f5035567c923f1583fd2c3c9330e7668c9334239))
* handle multiple Set-Cookie headers ([#74](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/74)) ([5a6a64f](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/5a6a64f42349aad0da2d61b11e63189130eaf1dd))

## [0.10.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.9.0...v0.10.0) (2022-08-23)


### Features

* initialize `env` ([#58](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/58)) ([88df929](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/88df929f215e588e94fbaa984e78f98e0b3a4278))

## [0.9.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.8.0...v0.9.0) (2022-08-17)


### Features

* add `esbuildOptions` to config ([#51](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/51)) ([c076f04](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/c076f0485b1d14c778111eb74ab4eea87ca8c2b2))

## [0.8.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.7.0...v0.8.0) (2022-07-25)


### Features

* remove call to writeStatic ([0d88a6f](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/0d88a6f2ee6e8a039bc3fc8ae799b40131d3d147))

## [0.7.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.6.1...v0.7.0) (2022-06-11)


### Features

* handle polyfill breaking change ([51baba9](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/51baba98416687b0a1436e644ec67dd3d18fcf92))
* target node 16 ([4b1b68f](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/4b1b68fb87f4a4fb534d69a65f8940a1f83c0de9))
* throw error if API package.json does not exist ([fd60cb2](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/fd60cb276e2c847a46fe5f02cf9f42c9be723c7b))
* update immutable directory ([b729d3b](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/b729d3bea0ba32d955fc3d1a60f3fd61ebbbbcc6))


### Bug Fixes

* update types to support ESNext ([4cd7535](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/4cd7535fb1c162f19bb5df71fea70302a6402562))

### [0.6.1](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.6.0...v0.6.1) (2022-03-11)


### Bug Fixes

* prevent file not found error when index not prerendered ([#39](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/39)) ([0e7960a](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/0e7960ac8f8dd2f4df8bb14afb627c79f7c68714))

## [0.6.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.5.0...v0.6.0) (2022-03-09)


### Features

* support SvelteKit 1.0.0-next.292 ([db1ffc6](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/db1ffc65ed362708627819cb7e627b268d007e8a))

## [0.5.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.4.0...v0.5.0) (2022-02-26)


### Features

* support SvelteKit 1.0.0-next.287 ([#33](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/33)) ([b79ab95](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/b79ab95e20f9be2c231b5492cfc975b19222f935))


### Bug Fixes

* allow returning binary responses from endpoints ([#32](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/32)) ([e0070cb](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/e0070cb802539c46235cd81edfe949a3de8e9edd))

## [0.4.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.3.0...v0.4.0) (2022-02-03)


### Features

* add customStaticWebAppConfig option ([#28](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/28)) ([70702ff](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/70702ff00842b6ddf53a6a44a1c6dc56c6e3371b))
* add immutable cache headers to hashed assets ([66e4cc4](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/66e4cc4f520dabeb57050db805073dd98b482c2e))
* support SvelteKit 1.0.0-next.234 ([#29](https://www.github.com/geoffrich/svelte-adapter-azure-swa/issues/29)) ([61c374d](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/61c374d7deb2ce0af2a503b6cdaaab9aa762b3c3))

## [0.3.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.2.0...v0.3.0) (2022-01-07)


### Features

* add debug setting to log request info ([581bdf3](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/581bdf3b2955b0906f6c18fe0c1ef0cba925c8d0))
* allow index.html to be dynamic ([1a089e1](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/1a089e1e51797ea906263bdbdf50b41a05d3fd8d))

## [0.2.0](https://www.github.com/geoffrich/svelte-adapter-azure-swa/compare/v0.1.0...v0.2.0) (2022-01-05)


### Features

* support SK next-208 ([2a8a5f9](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/2a8a5f9726dc7204050788b6c6d806636c762d18))

## 0.1.0 (2021-12-23)


### Features

* initial commit ([5f4492b](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/5f4492b9f73b2871c9a62c5f19f11a45b8bffece))


### Bug Fixes

* transpile output for Node 12 ([edb7153](https://www.github.com/geoffrich/svelte-adapter-azure-swa/commit/edb715336c7891381b0e3f90e247f398cd16692e))
