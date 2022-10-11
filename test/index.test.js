import { expect, describe, test, vi } from 'vitest';
import azureAdapter, { generateConfig } from '../index';
import { writeFileSync, existsSync } from 'fs';
import { jsonMatching, toMatchJSON } from './json';
import esbuild from 'esbuild';

expect.extend({ jsonMatching, toMatchJSON });

vi.mock('fs', () => ({
	writeFileSync: vi.fn(),
	existsSync: vi.fn(() => true)
}));

vi.mock('esbuild', () => ({
	default: {
		build: vi.fn(() => Promise.resolve())
	}
}));

describe('generateConfig', () => {
	test('no custom config with static root', () => {
		const builder = getMockBuilder();
		const result = generateConfig(builder, {});
		expect(result).toEqual({
			navigationFallback: {
				rewrite: '/api/__render'
			},
			platform: {
				apiRuntime: 'node:16'
			},
			routes: [
				{
					methods: ['CONNECT', 'DELETE', 'PATCH', 'POST', 'PUT', 'TRACE'],
					rewrite: '/api/__render',
					route: '*'
				},
				{
					headers: {
						'cache-control': 'public, immutable, max-age=31536000'
					},
					route: '/appDir/immutable/*'
				}
			]
		});
	});

	test('no custom config without static root', () => {
		const builder = getMockBuilder();
		builder.prerendered.paths = [];
		const result = generateConfig(builder, {});
		expect(result).toEqual({
			navigationFallback: {
				rewrite: '/api/__render'
			},
			platform: {
				apiRuntime: 'node:16'
			},
			routes: [
				{
					methods: ['CONNECT', 'DELETE', 'PATCH', 'POST', 'PUT', 'TRACE'],
					rewrite: '/api/__render',
					route: '*'
				},
				{
					headers: {
						'cache-control': 'public, immutable, max-age=31536000'
					},
					route: '/appDir/immutable/*'
				},
				{
					rewrite: '/api/__render',
					route: '/index.html'
				},
				{
					rewrite: '/api/__render',
					route: '/'
				}
			]
		});
	});

	test('accepts custom config', () => {
		const builder = getMockBuilder();
		const result = generateConfig(builder, {
			globalHeaders: { 'X-Foo': 'bar' }
		});
		expect(result.globalHeaders).toStrictEqual({ 'X-Foo': 'bar' });
	});

	test('allowedRoles in custom wildcard route spreads to all routes', () => {
		const builder = getMockBuilder();
		const result = generateConfig(builder, {
			routes: [
				{
					route: '*',
					allowedRoles: ['authenticated']
				}
			]
		});
		expect(result.routes.every((r) => r.allowedRoles[0] === 'authenticated')).toBeTruthy();
	});

	test('rewrite ssr in wildcard route forces SSR rewriting', () => {
		const builder = getMockBuilder();
		const result = generateConfig(builder, {
			routes: [
				{
					route: '*',
					rewrite: 'ssr'
				}
			]
		});
		expect(result.routes.every((r) => r.rewrite === '/api/__render')).toBeTruthy();
	});

	test('rewrite undefined in wildcard route disables SSR rewriting and warns about it', () => {
		const builder = getMockBuilder();
		const result = generateConfig(builder, {
			routes: [
				{
					route: '*',
					rewrite: undefined
				}
			]
		});
		expect(result.routes.every((r) => r.rewrite === undefined)).toBeTruthy();
		expect(result.navigationFallback.rewrite).toBeUndefined();
		expect(builder.log.warn).toHaveBeenCalledOnce();
	});

	test('exclude folder from SSR rewriting', () => {
		const builder = getMockBuilder();
		const result = generateConfig(builder, {
			navigationFallback: {
				exclude: ['images/*.{png,jpg,gif}', '/css/*']
			}
		});
		expect(result.navigationFallback).toEqual({
			rewrite: '/api/__render',
			exclude: ['images/*.{png,jpg,gif}', '/css/*']
		});
	});

	test('custom route does not accidentally override rewriting of SSR methods', () => {
		const builder = getMockBuilder();
		const result = generateConfig(builder, {
			routes: [
				{
					route: '/api',
					allowedRoles: ['authenticated']
				}
			]
		});
		const apiRoutes = result.routes.filter((r) => r.route === '/api');
		expect(apiRoutes).toEqual([
			{
				route: '/api',
				allowedRoles: ['authenticated'],
				methods: ['GET', 'HEAD', 'OPTIONS']
			},
			{
				rewrite: '/api/__render',
				route: '/api',
				allowedRoles: ['authenticated'],
				methods: ['CONNECT', 'DELETE', 'PATCH', 'POST', 'PUT', 'TRACE']
			}
		]);
	});

	test('setting navigationFallback.rewrite reports a warning', () => {
		const builder = getMockBuilder();
		const result = generateConfig(builder, { navigationFallback: { rewrite: 'index.html' } });
		expect(builder.log.warn).toHaveBeenCalledOnce();
	});
});

describe('adapt', () => {
	test('runs', async () => {
		const adapter = azureAdapter();
		const builder = getMockBuilder();
		await adapter.adapt(builder);
		expect(builder.writePrerendered).toBeCalled();
		expect(builder.writeClient).toBeCalled();
	});

	test('throws error when no package.json', async () => {
		existsSync.mockImplementationOnce(() => false);

		const adapter = azureAdapter();
		const builder = getMockBuilder();
		await expect(adapter.adapt(builder)).rejects.toThrowError('You need to create a package.json');
	});

	test('throws error for invalid platform.apiRuntime', async () => {
		const adapter = azureAdapter({
			customStaticWebAppConfig: {
				platform: {
					apiRuntime: 'dotnet:3.1'
				}
			}
		});
		const builder = getMockBuilder();
		await expect(adapter.adapt(builder)).rejects.toThrowError(
			`The configuration key platform.apiRuntime, if included, must be a supported Node version such as 'node:16'. It is currently 'dotnet:3.1'.`
		);
	});

	test('throws error for invalid node version', async () => {
		const adapter = azureAdapter({
			customStaticWebAppConfig: {
				platform: {
					apiRuntime: 'node:15'
				}
			}
		});
		const builder = getMockBuilder();
		await expect(adapter.adapt(builder)).rejects.toThrowError(
			`The minimum node version supported by SvelteKit is 16, please change configuration key platform.runTime from 'node:15' to a supported version like 'node:16' or remove it entirely.`
		);
	});

	test('changes target for valid node version', async () => {
		vi.clearAllMocks();
		const adapter = azureAdapter({
			customStaticWebAppConfig: {
				platform: {
					apiRuntime: 'node:17'
				}
			}
		});
		const builder = getMockBuilder();
		await adapter.adapt(builder);

		expect(esbuild.build).toHaveBeenCalledWith(
			expect.objectContaining({
				target: 'node17'
			})
		);
		expect(writeFileSync).toHaveBeenCalledWith(
			expect.stringContaining('staticwebapp.config.json'),
			expect.jsonMatching(
				expect.objectContaining({
					platform: expect.objectContaining({
						apiRuntime: 'node:17'
					})
				})
			)
		);
	});

	test('adds index.html when root not prerendered', async () => {
		const adapter = azureAdapter();
		const builder = getMockBuilder();
		builder.prerendered.paths = [];
		await adapter.adapt(builder);

		expect(writeFileSync).toBeCalledWith(expect.stringContaining('index.html'), '');
		expect(writeFileSync).toBeCalledWith(
			expect.stringContaining('staticwebapp.config.json'),
			expect.jsonMatching(
				expect.objectContaining({
					routes: expect.arrayContaining([
						{
							route: '/index.html',
							rewrite: '/api/__render'
						},
						{
							route: '/',
							rewrite: '/api/__render'
						}
					])
				})
			)
		);
	});
});

/** @returns {import('@sveltejs/kit').Builder} */
function getMockBuilder() {
	return {
		config: {
			kit: {
				appDir: 'appDir'
			}
		},
		log: {
			minor: vi.fn(),
			warn: vi.fn()
		},
		prerendered: {
			paths: ['/']
		},
		copy: vi.fn(),
		generateManifest: vi.fn(),
		getBuildDirectory: vi.fn((x) => x),
		getServerDirectory: vi.fn(() => 'server'),
		rimraf: vi.fn(),
		writeClient: vi.fn(),
		writePrerendered: vi.fn()
	};
}
