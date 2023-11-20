import adapter from 'svelte-adapter-azure-swa';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			apiDir: './func'
		})
	}
};

export default config;
