import { writeFileSync } from 'fs';
import { join } from 'path';
import { staticClientDir } from './rollup-client.js';
import { apiFunctionDir } from './rollup-server.js';

/**
 * @typedef {import('@sveltejs/kit').Builder} Builder
 * @typedef {import('rollup').RollupOptions} RollupOptions
 * @typedef {import('.').Options} Options
 */

const ssrFunctionRoute = `/api/${apiFunctionDir}`;

/**
 * Validate the static web app configuration does not override the minimum config for the adapter to work correctly.
 * @param {import('./types/swa').CustomStaticWebAppConfig} config
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
				methods: ['POST', 'PUT', 'DELETE'],
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

/**
 *
 * @param {Builder} builder
 * @param {string} outputDir
 * @param {string} tmpDir
 * @param {Options} options
 */
export async function buildConfig(builder, outputDir, tmpDir, options) {
	const _outputDir = options.staticDir || join(outputDir, staticClientDir);
	builder.log(`Writing staticwebapp.config.json to ${_outputDir}`);

	let swaConfig = options.customStaticWebAppConfig || {};
	swaConfig = generateConfig(swaConfig, builder.config.kit.appDir);

	if (!builder.prerendered.paths.includes('/')) {
		// Azure SWA requires an index.html to be present
		// If the root was not pre-rendered, add a placeholder index.html
		// Route all requests for the index to the SSR function
		writeFileSync(`${_outputDir}/index.html`, '');
		swaConfig.routes.push(
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

	writeFileSync(`${outputDir}/staticwebapp.config.json`, JSON.stringify(swaConfig, null, 2));
}
