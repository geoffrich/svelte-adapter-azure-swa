import adapter from 'svelte-adapter-azure-swa';
const [major] = process.versions.node.split('.').map(Number);
const NODE_API_RUNTIME =
	process.env.NODE_API_RUNTIME && process.env.NODE_API_RUNTIME.length > 0
		? process.env.NODE_API_RUNTIME
		: major;
console.warn('#'.repeat(100));
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
