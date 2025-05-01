import alias from '@rollup/plugin-alias';
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
const files = fileURLToPath(new URL('./files', import.meta.url));
const entry = fileURLToPath(new URL('./entry/index.js', import.meta.url));

/**
 *
 * @param {Builder} builder
 * @param {string} outDir
 * @param {string} tmpDir
 * @returns {{
 *   serverPath: string,
 *   serverFile: string,
 *   serverRelativePath: string,
 *   manifestFile: string,
 *   envFile: string
 * }}
 */
function getPaths(builder, outDir, tmpDir) {
	// use posix because of https://github.com/sveltejs/kit/pull/3200
	const serverPath = builder.getServerDirectory();
	const serverFile = join(serverPath, 'index.js');
	const serverRelativePath = posix.relative(tmpDir, builder.getServerDirectory());
	const manifestFile = join(tmpDir, 'manifest.js');
	const envFile = join(tmpDir, 'env.js');
	return {
		serverPath,
		serverFile,
		serverRelativePath,
		manifestFile,
		envFile
	};
}
/**
 *
 * @param {Builder} builder
 * @param {string} outDir
 * @param {string} tmpDir
 * @param {Options} options
 * @returns {RollupOptions}
 */
function prepareRollupOptions(builder, outDir, tmpDir, options) {
	const _apiServerDir = options.apiDir || join(outDir, apiServerDir);
	const outFile = join(_apiServerDir, apiFunctionDir, apiFunctionFile);
	const { serverFile, manifestFile, envFile } = getPaths(builder, outDir, tmpDir);

	/** @type RollupOptions */
	let _options = {
		input: entry,
		output: {
			file: outFile
		},
		plugins: [
			alias({
				entries: [
					{
						find: 'ENV',
						replacement: envFile
					},
					{
						find: 'MANIFEST',
						replacement: manifestFile
					},
					{
						find: 'SERVER',
						replacement: serverFile
					}
				]
			})
		]
	};
	_options = _.mergeWith(defaultRollupOptions(), _options, (objValue, srcValue) => {
		if (Array.isArray(objValue) && Array.isArray(srcValue)) {
			return objValue.concat(srcValue);
		}
	});

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
 * @param {string} outDir
 * @param {string} tmpDir
 * @param {Options} options
 */
export async function serverRollup(builder, outDir, tmpDir, options) {
	builder.log(`Preparing serverless function in ${tmpDir}`);

	const _outputApiServerDir = options.apiDir || join(outDir, apiServerDir);
	const { serverRelativePath, manifestFile, envFile } = getPaths(builder, outDir, tmpDir);

	const debug = options.debug || false;

	builder.copy(files, tmpDir);

	const rollupOptions = prepareRollupOptions(builder, outDir, tmpDir, options);
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

	// Write manifest
	writeFileSync(
		manifestFile,
		`export const manifest = ${builder.generateManifest({
			relativePath: serverRelativePath
		})};\n`
	);
	// Write environment
	writeFileSync(envFile, `export const debug = ${debug.toString()};\n`);

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
