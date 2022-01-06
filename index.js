import { writeFileSync } from 'fs';
import { join, posix } from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 */

/** @type {import('.')} */
export default function ({ debug = false } = {}) {
	return {
		name: 'adapter-azure-swa',

		// implementation based on the vercel adapter
		async adapt(builder) {
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
			await builder.prerender({
				dest: staticDir
			});

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

			builder.copy(
				join(files, 'staticwebapp.config.json'),
				join(publish, 'staticwebapp.config.json')
			);

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
