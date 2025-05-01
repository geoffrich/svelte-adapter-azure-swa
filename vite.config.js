import { configDefaults, defineConfig } from 'vitest/config';

const testsAppDir = './tests/demo';

export default defineConfig({
	test: {
		exclude: [...configDefaults.exclude, `${testsAppDir}/**`, './tests/unit/json.js'],
		coverage: {
			provider: 'istanbul',
			exclude: [
				...configDefaults.exclude,
				`${testsAppDir}/**`,
				'./tests/**',
				'./entry/index.js',
				'./tests/unit/json.js'
			],
			reporter: ['text', 'html', 'clover', 'json', 'lcov']
		}
	}
});
