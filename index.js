import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 */

/** @type {import('.')} */
export default function (options) {
	return {
		name: 'adapter-azure-swa',

		async adapt({ utils }) {
			const publish = 'build';
			const staticDir = join(publish, 'static');
			const apiDir = join('api', 'render');
			const entry = '.svelte-kit/azure-swa/entry.js';

			utils.log.minor(`Publishing to "${publish}"`);

			utils.rimraf(publish);
			utils.rimraf(apiDir);

			const files = fileURLToPath(new URL('./files', import.meta.url));

			utils.log.minor('Generating serverless function...');
			utils.copy(join(files, 'entry.js'), entry);
			utils.copy(
				join(files, 'staticwebapp.config.json'),
				join(publish, 'staticwebapp.config.json')
			);
			utils.copy(join(files, 'api'), apiDir);

			/** @type {BuildOptions} */
			const default_options = {
				entryPoints: [entry],
				outfile: join(apiDir, 'index.js'),
				bundle: true,
				inject: [join(files, 'shims.js')],
				platform: 'node',
				target: 'node12'
			};

			const build_options =
				options && options.esbuild ? await options.esbuild(default_options) : default_options;

			await esbuild.build(build_options);

			utils.log.minor('Prerendering static pages...');
			await utils.prerender({
				dest: staticDir
			});

			utils.log.minor('Copying assets...');
			utils.copy_static_files(staticDir);
			utils.copy_client_files(staticDir);
		}
	};
}
