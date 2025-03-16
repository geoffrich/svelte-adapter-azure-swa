import adapter from 'svelte-adapter-azure-swa-experimental';

const [major, minor, patch] = process.versions.node.split('.').map(Number);
const apiRuntime = process.env.NODE_API_RUNTIME || `node:${major}`;
console.warn('#'.repeat(100));
console.warn(`Using API runtime: ${apiRuntime}`);
console.warn('#'.repeat(100));
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			apiDir: './func',
			customStaticWebAppConfig: {
				platform: {
					apiRuntime
				}
			}
		})
	}
};

export default config;
