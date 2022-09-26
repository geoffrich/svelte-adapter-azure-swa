import { writeFileSync, existsSync } from 'fs';
import { join, posix } from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 */

const ssrFunctionRoute = '/api/__render';
// These are the methods that don't have to be SSR if they were pre-rendered.
const staticMethods = ['GET', 'HEAD', 'OPTIONS'];
// These are the methods that must always be SSR.
const ssrMethods = ['CONNECT', 'DELETE', 'PATCH', 'POST', 'PUT', 'TRACE'];
// This is the phrase that will be replaced with ssrFunctionRoute in custom configurations that use it.
const ssrTrigger = 'ssr';

/** @type {import('.').default} */
export default function ({
	debug = false,
	customStaticWebAppConfig = {},
	esbuildOptions = {}
} = {}) {
	return {
		name: 'adapter-azure-swa',

		async adapt(builder) {
			if (!existsSync(join('api', 'package.json'))) {
				throw new Error(
					'You need to create a package.json in your `api` directory. See the adapter README for details.'
				);
			}

			const tmp = builder.getBuildDirectory('azure-tmp');
			const publish = 'build';
			const staticDir = join(publish, 'static');
			const apiDir = join('api', 'render');
			const entry = `${tmp}/entry.js`;
			builder.log.minor(`Publishing to "${publish}"`);

			builder.rimraf(tmp);
			builder.rimraf(publish);
			builder.rimraf(apiDir);

			const files = fileURLToPath(new URL('./files', import.meta.url));

			builder.log.minor('Generating serverless function...');

			// use posix because of https://github.com/sveltejs/kit/pull/3200
			const relativePath = posix.relative(tmp, builder.getServerDirectory());

			builder.copy(join(files, 'entry.js'), entry, {
				replace: {
					SERVER: `${relativePath}/index.js`,
					MANIFEST: './manifest.js',
					DEBUG: debug.toString()
				}
			});

			writeFileSync(
				`${tmp}/manifest.js`,
				`export const manifest = ${builder.generateManifest({
					relativePath
				})};\n`
			);

			builder.copy(join(files, 'api'), apiDir);

			/** @type {BuildOptions} */
			const default_options = {
				entryPoints: [entry],
				outfile: join(apiDir, 'index.js'),
				bundle: true,
				platform: 'node',
				target: 'node16',
				external: esbuildOptions.external
			};

			await esbuild.build(default_options);

			builder.log.minor('Copying assets...');
			builder.writeClient(staticDir);
			builder.writePrerendered(staticDir);

			let ssrRoot = false;
			if (!builder.prerendered.paths.includes('/')) {
				// Azure SWA requires an index.html to be present
				// If the root was not pre-rendered, add a placeholder index.html
				// Route all requests for the index to the SSR function
				writeFileSync(`${staticDir}/index.html`, '');

				ssrRoot = true;
			}

			const swaConfig = generateConfig(
				customStaticWebAppConfig,
				builder.config.kit.appDir,
				ssrRoot
			);

			writeFileSync(`${publish}/staticwebapp.config.json`, JSON.stringify(swaConfig));
		}
	};
}

/**
 * @param {import('./types/swa').CustomStaticWebAppConfig} customStaticWebAppConfig Custom configuration
 * @param {string} appDir Path of App directory
 * @param {boolean} ssrRoot True if path '/' was not pre-rendered
 * @returns {import('./types/swa').StaticWebAppConfig}
 */
export function generateConfig(customStaticWebAppConfig, appDir, ssrRoot) {

  customStaticWebAppConfig = customStaticWebAppConfig || [];

	/** @type {import('./types/swa').StaticWebAppConfig} */
	const swaConfig = {
		...customStaticWebAppConfig,
		navigationFallback: {
			rewrite: ssrFunctionRoute,
			...customStaticWebAppConfig.navigationFallback
		},
		platform: {
			...customStaticWebAppConfig.platform,
			apiRuntime: 'node:16'
		},
		routes: []
	};

	if (swaConfig.navigationFallback.rewrite === ssrTrigger) {
		swaConfig.navigationFallback.rewrite = ssrFunctionRoute;
	}

	if (swaConfig.navigationFallback.rewrite !== ssrFunctionRoute) {
		builder.log.warn(
			`Setting navigationFallback.rewrite to a value other than '${ssrTrigger}' will prevent SSR!`
		);
	}
	/** @type {Record<string,import('./types/swa').HttpMethod[]>} */
	let handledRoutes = {
		'*': [],
		'/': [],
		'/index.html': []
	};
	/** @type {import('./types/swa').Route} */
	let wildcardRoute = {
		route: '*'
	};

	for (const route of customStaticWebAppConfig.routes || []) {
		if (route.route === undefined || !route.route.length) {
			throw new Error(
				'A route pattern is required for each route. https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#routes'
			);
		}
		route.methods = route.methods || [...staticMethods, ...ssrMethods];
		if (handledRoutes[route.route] && handledRoutes[route.route].some((i) => methods.includes(i))) {
			throw new Error(
				'There is a route that conflicts with another route. https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#routes'
			);
		}
		handledRoutes[route.route] = [...(handledRoutes[route.route] || []), ...route.methods];
		if (route.rewrite === ssrTrigger) {
			route.rewrite = ssrFunctionRoute;
		}
		if (['/*', '*'].includes(route.route)) {
			route.route = '*';
			wildcardRoute = route;
		}
		if (route.methods.length === staticMethods.length + ssrMethods.length) {
			// Either method isn't specified in this route, or all methods are.
			if (['/index.html', '/'].includes(route.route) && !builder.prerendered.paths.includes('/')) {
				// The root route must be fully SSR because it was not rendered. No need to split the route.
				swaConfig.routes.push({
					rewrite: route.redirect ? route.rewrite : ssrFunctionRoute,
					...route
				});
			} else {
				// This route catches all methods, but we don't want to force SSR for all methods, so will split the rule.
				swaConfig.routes.push({
					...route,
					methods: staticMethods
				});
				swaConfig.routes.push({
					rewrite: route.redirect ? route.rewrite : ssrFunctionRoute,
					...route,
					methods: ssrMethods
				});
			}
		} else if (route.methods.some((r) => ssrMethods.includes(r))) {
			const routeSSRMethods = methods.filter((m) => ssrMethods.includes(m));
			if (routeSSRMethods.length === methods.length) {
				// This route is only for SSR methods, so we'll rewrite the single rule.
				swaConfig.routes.push({
					rewrite: route.redirect ? route.rewrite : ssrFunctionRoute,
					...route
				});
			} else {
				if (
					['/index.html', '/'].includes(route.route) &&
					!builder.prerendered.paths.includes('/')
				) {
					// This special route must be SSR because it was not pre-rendered.
					swaConfig.routes.push({
						rewrite: route.redirect ? route.rewrite : ssrFunctionRoute,
						...route
					});
				} else {
					// This route is for some methods that must be SSR, but not all. We'll split it.
					swaConfig.routes.push({
						rewrite: route.redirect ? route.rewrite : ssrFunctionRoute,
						...route,
						methods: routeSSRMethods
					});
					swaConfig.routes.push({
						...route,
						methods: methods.filter((m) => staticMethods.includes(m))
					});
				}
			}
		} else {
			if (['/index.html', '/'].includes(route.route) && ssrRoot) {
				// This special route must be SSR because it was not pre-rendered.
				swaConfig.routes.push({
					rewrite: route.redirect ? route.rewrite : ssrFunctionRoute,
					...route
				});
			} else {
				// None of the methods in this route must be SSR, so accept it as-is.
				swaConfig.routes.push({ ...route });
			}
		}
	}

	// Make sure the wildcard is there for each SSR method.
	const missingWildcardMethods = ssrMethods.filter(
		(i) => !(wildcardRoute.methods || []).includes(i)
	);
	if (missingWildcardMethods.length > 0) {
		handledRoutes['*'] = missingWildcardMethods;
		swaConfig.routes.push({
			rewrite: ssrFunctionRoute,
			...wildcardRoute,
			methods: missingWildcardMethods
		});
	}

	// Make sure the fallback rewrite matches the custom config or wildcard route, if present.
	if ((customStaticWebAppConfig.navigationFallback || []).hasOwnProperty('rewrite')) {
		swaConfig.navigationFallback.rewrite = customStaticWebAppConfig.navigationFallback.rewrite;
	} else if (wildcardRoute.hasOwnProperty('rewrite')) {
		swaConfig.navigationFallback.rewrite = wildcardRoute.rewrite;
	}

	handledRoutes[`/${appDir}/immutable/*`] = [...staticMethods, ...ssrMethods];
	swaConfig.routes.push({
		...wildcardRoute,
		route: `/${appDir}/immutable/*`,
		headers: {
			'cache-control': 'public, immutable, max-age=31536000'
		},
		methods: undefined
	});
	if (ssrRoot) {
		if (!staticMethods.every((i) => handledRoutes['/index.html'].includes(i))) {
			swaConfig.routes.push({
				rewrite: wildcardRoute.redirect ? wildcardRoute.rewrite : ssrFunctionRoute,
				...wildcardRoute,
				route: '/index.html',
				methods: undefined
			});
		}
		if (!staticMethods.every((i) => handledRoutes['/'].includes(i))) {
			swaConfig.routes.push({
				rewrite: wildcardRoute.redirect ? wildcardRoute.rewrite : ssrFunctionRoute,
				...wildcardRoute,
				route: '/',
				methods: undefined
			});
		}
	}

	return swaConfig;
}
