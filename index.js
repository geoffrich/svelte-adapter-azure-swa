import { writeFileSync, existsSync } from 'fs';
import { join, posix } from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 */

const ssrFunctionRoute = '/api/sk_render';

/**
 * Validate the static web app configuration does not override the minimum config for the adapter to work correctly.
 * @param config {import('./types/swa').CustomStaticWebAppConfig}
 * */
function validateCustomConfig(config) {
	if (config) {
		if ('navigationFallback' in config) {
			throw new Error('customStaticWebAppConfig cannot override navigationFallback.');
		}
		if (config.routes && config.routes.find((route) => route.route === '*')) {
			throw new Error(`customStaticWebAppConfig cannot override '*' route.`);
		}
	}
}

/** @type {import('.').default} */
export default function ({
	debug = false,
	customStaticWebAppConfig = {},
	esbuildOptions = {},
	apiDir: customApiDir = '',
	staticDir: customStaticDir = '',
	allowReservedSwaRoutes = false
} = {}) {
	return {
		name: 'adapter-azure-swa',

		async adapt(builder) {
			// TODO: remove for 1.0
			if (!customApiDir && existsSync(join('api', 'render'))) {
				builder.log.warn(
					`Warning: you have an api/render folder but this adapter now uses the build/server folder for API functions. You may need to update your build configuration. Failing to do so could break your deployed site.
Please see the PR for migration instructions: https://github.com/geoffrich/svelte-adapter-azure-swa/pull/92`
				);
			}

			const conflictingRoutes =
				builder.routes?.map((route) => route.id).filter((routeId) => routeId.startsWith('/api')) ??
				[];
			if (!allowReservedSwaRoutes && conflictingRoutes.length > 0) {
				builder.log.error(
					`Error: the following routes conflict with Azure SWA's reserved /api route: ${conflictingRoutes.join(
						', '
					)}. Requests to these routes in production will return 404 instead of hitting your SvelteKit app.

To resolve this error, move the conflicting routes so they do not start with /api. For example, move /api/blog to /blog.
If you want to suppress this error, set allowReservedSwaRoutes to true in your adapter options.
					`
				);

				throw new Error('Conflicting routes detected. Please rename the routes listed above.');
			}

			// SvelteKit 3 flattened `config.kit.*` onto `config.*`. Check the flattened location
			// first so SvelteKit 3 builds never touch the deprecated `config.kit` accessor (which
			// logs an `adapter_config_kit_deprecated` warning even when just read defensively).
			const appDir =
				builder.config.appDir ??
				/** @type {{ kit?: { appDir?: string } }} */ (builder.config).kit?.appDir;
			const swaConfig = generateConfig(customStaticWebAppConfig, appDir);

			const tmp = builder.getBuildDirectory('azure-tmp');
			const publish = 'build';
			const staticDir = customStaticDir || join(publish, 'static');
			const apiDir = customApiDir || join(publish, 'server');
			const functionDir = join(apiDir, 'sk_render');
			const entry = `${tmp}/entry.js`;
			builder.log.minor(`Publishing to "${publish}"`);

			builder.rimraf(tmp);
			builder.rimraf(publish);

			const files = fileURLToPath(new URL('./files', import.meta.url));

			builder.log.minor('Generating serverless function...');

			builder.copy(files, tmp, {
				replace: {
					SERVER_INSTANCE: './server-instance.js',
					DEBUG: debug.toString()
				}
			});

			if (customApiDir) {
				checkForMissingFiles();
			} else {
				// if the user specified a custom API directory, assume they are creating the required function files themselves
				builder.copy(join(files, 'api'), apiDir);
			}

			// `builder.generateServerInstance` (SvelteKit 3+) writes a module that exports a ready-made
			// `server` instance. On SvelteKit 2.x it doesn't exist, so fall back to `generateManifest`
			// and construct the `Server` ourselves.
			if (typeof builder.generateServerInstance === 'function') {
				builder.generateServerInstance(`${tmp}/server-instance.js`);
			} else {
				// use posix because of https://github.com/sveltejs/kit/pull/3200
				const relativePath = posix.relative(tmp, builder.getServerDirectory());

				if (!builder.generateManifest) {
					// Unreachable in practice: `generateServerInstance` and `generateManifest` are
					// mutually exclusive across SvelteKit 2.x/3.x, but the type is optional either way.
					throw new Error('builder.generateManifest is not available');
				}

				builder.copy(join(files, 'server-instance-legacy.js'), `${tmp}/server-instance.js`, {
					replace: {
						SERVER: `${relativePath}/index.js`,
						MANIFEST: './manifest.js'
					}
				});

				writeFileSync(
					`${tmp}/manifest.js`,
					`export const manifest = ${builder.generateManifest({
						relativePath
					})};\n`
				);
			}

			// add @azure/functions to esbuildOptions.external if not already set - this is needed by the Azure Functiions v4 runtime
			if (!esbuildOptions.external?.includes('@azure/functions')) {
				esbuildOptions.external = [...(esbuildOptions.external || []), '@azure/functions'];
			}

			/** @type {BuildOptions} */
			const default_options = {
				entryPoints: [entry],
				outfile: join(functionDir, 'index.js'),
				bundle: true,
				platform: 'node',
				target: 'node20',
				sourcemap: 'linked',
				external: esbuildOptions.external,
				keepNames: esbuildOptions.keepNames,
				loader: esbuildOptions.loader
			};

			await esbuild.build(default_options);

			builder.log.minor('Copying assets...');
			builder.writeClient(staticDir);
			builder.writePrerendered(staticDir);

			if (!builder.prerendered.paths.includes('/')) {
				// Azure SWA requires an index.html to be present
				// If the root was not pre-rendered, add a placeholder index.html
				// Route all requests for the index to the SSR function
				writeFileSync(`${staticDir}/index.html`, '');
				// `generateConfig` always populates `routes` (see above), but the type keeps it optional.
				swaConfig.routes?.push(
					{
						route: '/index.html',
						rewrite: ssrFunctionRoute
					},
					{
						route: '/',
						rewrite: ssrFunctionRoute
					}
				);
			}

			writeFileSync(`${publish}/staticwebapp.config.json`, JSON.stringify(swaConfig, null, 2));

			/**
			 * Check for missing files when a custom API directory is provided.
			 */
			function checkForMissingFiles() {
				const requiredFiles = ['host.json', 'package.json'];
				for (const file of requiredFiles) {
					if (!existsSync(join(customApiDir, file))) {
						builder.log.warn(
							`Warning: apiDir set but ${file} does not exist. You will need to create this file yourself. See the docs for more information: https://github.com/geoffrich/svelte-adapter-azure-swa#apidir`
						);
					}
				}
			}
		}
	};
}

/**
 * @param {import('./types/swa').CustomStaticWebAppConfig} customStaticWebAppConfig
 * @param {string} appDir
 * @returns {import('./types/swa').StaticWebAppConfig}
 */
export function generateConfig(customStaticWebAppConfig, appDir) {
	validateCustomConfig(customStaticWebAppConfig);

	if (!customStaticWebAppConfig.routes) {
		customStaticWebAppConfig.routes = [];
	}

	/** @type {import('./types/swa').StaticWebAppConfig} */
	const swaConfig = {
		...customStaticWebAppConfig,
		routes: [
			...customStaticWebAppConfig.routes,
			{
				route: '/api/*'
			},
			{
				route: '/data-api/*'
			},
			{
				route: '*',
				methods: ['POST', 'PUT', 'DELETE', 'PATCH'],
				rewrite: ssrFunctionRoute
			},
			{
				route: `/${appDir}/immutable/*`,
				headers: {
					'cache-control': 'public, immutable, max-age=31536000'
				}
			}
		],
		navigationFallback: {
			rewrite: ssrFunctionRoute
		},
		platform: {
			apiRuntime: 'node:20',
			...customStaticWebAppConfig.platform
		}
	};

	return swaConfig;
}
