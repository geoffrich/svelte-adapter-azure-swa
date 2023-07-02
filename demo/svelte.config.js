import adapter from 'svelte-adapter-azure-swa';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			customStaticWebAppConfig: {
				platform: {
					apiRuntime: 'node:18'
				}
			}
		})
	}
};

export default config;
