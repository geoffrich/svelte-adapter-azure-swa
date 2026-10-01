import adapter from 'svelte-adapter-azure-swa';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter({
				apiDir: './func'
			}),
			// $lib was removed in SvelteKit 3 in favor of #lib subpath imports, but demo
			// assets are imported by path (not as JS/TS modules), so keep $lib via alias.
			alias: { $lib: 'src/lib' }
		})
	]
});
