import { writeFileSync } from 'fs';
import { join, posix } from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 */

const ssrFunctionRoute = '/api/__render';

/** @type {import('.')} */
export default function ({ debug = false } = {}) {
	return {
		name: 'adapter-azure-swa',

		async adapt(builder) {
			/** @type {import('./types/swa').StaticWebAppConfig} */
			const swaConfig = {
				routes: [
					{
						route: '*',
						methods: ['POST', 'PUT', 'DELETE'],
						rewrite: ssrFunctionRoute
					}
				],
				navigationFallback: {
					rewrite: ssrFunctionRoute
				}
			};

			const tmp = builder.getBuildDirectory('azure-tmp');
			const publish = 'build';
			const staticDir = join(publish, 'static');
			const apiDir = join('api', 'render');
			const entry = `${tmp}/entry.js`;
			builder.log.minor(`Publishing to "${publish}"`);

			builder.rimraf(tmp);
			builder.rimraf(publish);
			builder.rimraf(apiDir);

			builder.log.minor('Prerendering static pages...');
			const prerendered = await builder.prerender({
				dest: staticDir
			});

			if (!prerendered.paths.includes('/')) {
				// Azure SWA requires an index.html to be present
				// If the root was not pre-rendered, add a placeholder index.html
				// Route all requests for the index to the SSR function
				writeFileSync(`${staticDir}/index.html`, '');
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

			const files = fileURLToPath(new URL('./files', import.meta.url));

			builder.log.minor('Generating serverless function...');

			// use posix because of https://github.com/sveltejs/kit/pull/3200
			const relativePath = posix.relative(tmp, builder.getServerDirectory());

			builder.copy(join(files, 'entry.js'), entry, {
				replace: {
					APP: `${relativePath}/app.js`,
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

			writeFileSync(`${publish}/staticwebapp.config.json`, JSON.stringify(swaConfig));

			builder.copy(join(files, 'api'), apiDir);

			/** @type {BuildOptions} */
			const default_options = {
				entryPoints: [entry],
				outfile: join(apiDir, 'index.js'),
				bundle: true,
				platform: 'node',
				target: 'node12'
			};

			await esbuild.build(default_options);

			builder.log.minor('Copying assets...');
			builder.writeStatic(staticDir);
			builder.writeClient(staticDir);
		}
	};
}
