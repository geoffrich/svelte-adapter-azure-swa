import adapter from 'svelte-adapter-azure-swa';
const [major] = process.versions.node.split('.').map(Number);
let NODE_API_RUNTIME = (process.env.NODE_API_RUNTIME || '').trim();
console.warn('#'.repeat(100));
if (
	NODE_API_RUNTIME.length === 0 ||
	!NODE_API_RUNTIME.startsWith('node:') ||
	NODE_API_RUNTIME.split(':')[1] === ''
) {
	console.warn(
		`NODE_API_RUNTIME is not set or not set properly ('${NODE_API_RUNTIME}'). Defaulting to Node.js node:${major} runtime.`
	);
	NODE_API_RUNTIME = `node:${major}`;
}
console.warn(`Using API runtime: ${NODE_API_RUNTIME}`);
console.warn('#'.repeat(100));
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			apiDir: './func',
			customStaticWebAppConfig: {
				platform: {
					apiRuntime: NODE_API_RUNTIME
				}
			}
		})
	}
};

export default config;
