import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		exclude: [...configDefaults.exclude, 'demo/**'],
		coverage: {
			provider: 'istanbul',
			exclude: [...configDefaults.exclude, 'demo/**'],
			reporter: ['text', 'html', 'clover', 'json', 'lcov']
		}
	},
});
