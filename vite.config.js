import { configDefaults, defineConfig } from 'vitest/config';

const testsAppDir = './tests/demo';

export default defineConfig({
	test: {
		exclude: [...configDefaults.exclude, `${testsAppDir}/**`],
		coverage: {
			provider: 'istanbul',
			// exclude: [...configDefaults.exclude, `${testsAppsDir}/**`],
			exclude: [...configDefaults.exclude, './tests/**', './files/entry.js', './tests/unit/**'],
			reporter: ['text', 'html', 'clover', 'json', 'lcov']
		}
	}
});
