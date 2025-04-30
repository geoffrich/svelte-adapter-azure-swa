import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { writeFileSync } from 'fs';
import _ from 'lodash';
import { join, posix } from 'path';
import { rollup } from 'rollup';
import sourcemaps from 'rollup-plugin-sourcemaps2';
import { fileURLToPath } from 'url';

/**
 * @typedef {import('@sveltejs/kit').Builder} Builder
 * @typedef {import('rollup').RollupOptions} RollupOptions
 * @typedef {import('.').Options} Options
 */

/** @returns {RollupOptions} */
function defaultRollupOptions() {
	return {
		external: ['@azure/functions'],
		output: {
			inlineDynamicImports: true,
			format: 'cjs',
			sourcemap: true
		},
		plugins: [
			sourcemaps(),
			nodeResolve({
				preferBuiltins: true,
				browser: false
			}),
			commonjs()
		]
	};
}

const apiServerDir = 'server';
export const apiFunctionDir = 'sk_render';
const apiFunctionFile = 'index.js';

/**
 *
 * @param {string} outputDir
 * @param {string} tmpDir
 * @param {Options} options
 * @returns {RollupOptions}
 */
function prepareRollupOptions(outputDir, tmpDir, options) {
	const _apiServerDir = options.apiDir || join(outputDir, apiServerDir);
	const outFile = join(_apiServerDir, apiFunctionDir, apiFunctionFile);
	const entry = `${tmpDir}/entry.js`;
	/** @type RollupOptions */
	let _options = {
		input: entry,
		output: {
			file: outFile
		}
	};
	_options = _.merge(defaultRollupOptions(), _options);

	// add @azure/functions to options.external if not already set - this is needed by the Azure Functiions v4 runtime
	// We only check strings, if the user is using something else, we assume they know what they are doing
	if (_options.external === undefined) {
		_options.external = ['@azure/functions'];
	} else if (Array.isArray(_options.external) && !_options.external.includes('@azure/functions')) {
		_options.external.push('@azure/functions');
	}

	return _options;
}

/**
 *
 * @param {Builder} builder
 * @param {string} outputDir
 * @param {string} tmpDir
 * @param {Options} options
 */
export async function serverRollup(builder, outputDir, tmpDir, options) {
	builder.log(`Preparing serverless function in ${tmpDir}`);

	const _outputApiServerDir = options.apiDir || join(outputDir, apiServerDir);
	const files = fileURLToPath(new URL('./files', import.meta.url));
	// use posix because of https://github.com/sveltejs/kit/pull/3200
	const relativePath = posix.relative(tmpDir, builder.getServerDirectory());
	const debug = options.debug || false;

	builder.copy(files, tmpDir, {
		replace: {
			SERVER: `${relativePath}/index.js`,
			MANIFEST: './manifest.js',
			DEBUG: debug.toString()
		}
	});

	const rollupOptions = prepareRollupOptions(outputDir, tmpDir, options);
	const isStandardOutput = options.apiDir === undefined;

	if (!isStandardOutput) {
		builder.log.warn(
			'If you override the apiDir location, make sure that it is a valid Azure Functions location.'
		);
	} else {
		/** @type any */
		const output = rollupOptions.output;
		builder.log(`Using standard output location for Azure Functions: ${output.file}`);
		builder.copy(join(files, 'api'), _outputApiServerDir);
	}

	writeFileSync(
		`${tmpDir}/manifest.js`,
		`export const manifest = ${builder.generateManifest({
			relativePath
		})};\n`
	);

	builder.log(`Building serverless function to ${_outputApiServerDir}`);
	const bundle = await rollup(rollupOptions);
	if (Array.isArray(rollupOptions.output)) {
		for (const output of rollupOptions.output) {
			await bundle.write(output);
		}
	} else {
		await bundle.write(rollupOptions.output);
	}
}
