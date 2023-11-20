import { installPolyfills } from '@sveltejs/kit/node/polyfills';
import { expect, describe, test } from 'vitest';
import {
	splitCookiesFromHeaders,
	getClientIPFromHeaders,
	getClientPrincipalFromHeaders
} from '../files/headers';

installPolyfills();

describe('header processing', () => {
	test('no cookies', () => {
		const headers = new Headers();
		headers.append('Location', '/');
		headers.append('Content-Type', 'application/json');

		const cookies = splitCookiesFromHeaders(headers);

		expect(cookies).toEqual({
			cookies: [],
			headers: {
				'content-type': 'application/json',
				location: '/'
			}
		});
	});

	test('multiple cookies', () => {
		const headers = new Headers();

		// https://httpwg.org/specs/rfc7231.html#http.date
		const exp1 = 'Sun, 06 Nov 1994 08:49:37 GMT';
		const exp2 = 'Sunday, 06-Nov-94 08:49:37 GMT';
		const exp3 = 'Sun Nov  6 08:49:37 1994 GMT';

		headers.append('Set-Cookie', `key1=val1; Expires=${exp1}`);
		headers.append('Set-Cookie', `key2=val2; Expires=${exp2}`);
		headers.append('Set-Cookie', `key3=val3; Expires=${exp3}`);

		const cookies = splitCookiesFromHeaders(headers);

		expect(cookies).toStrictEqual({
			headers: {},
			cookies: [
				{
					expires: new Date('1994-11-06T08:49:37.000Z'),
					name: 'key1',
					value: 'val1'
				},
				{
					expires: new Date('1994-11-06T08:49:37.000Z'),
					name: 'key2',
					value: 'val2'
				},
				{
					expires: new Date('1994-11-06T08:49:37.000Z'),
					name: 'key3',
					value: 'val3'
				}
			]
		});
	});
});

describe('client ip address detection', () => {
	test('no header', () => {
		const headers = new Headers();
		headers.append('Location', '/');
		headers.append('Content-Type', 'application/json');

		const ipAddress = getClientIPFromHeaders(headers);

		expect(ipAddress).toBe('127.0.0.1');
	});

	test('regular header', () => {
		const headers = new Headers();
		headers.append('Location', '/');
		headers.append('Content-Type', 'application/json');
		headers.append(
			'X-Forwarded-For',
			'8.23.191.142:52987, [fd00::d63d:e0b8:bc35:12be:2e17:f3af]:64909'
		);

		const ipAddress = getClientIPFromHeaders(headers);

		expect(ipAddress).toBe('8.23.191.142');
	});

	test('no port header', () => {
		const headers = new Headers();
		headers.append('Location', '/');
		headers.append('Content-Type', 'application/json');
		headers.append('X-Forwarded-For', '8.23.191.142, [fd00::d63d:e0b8:bc35:12be:2e17:f3af]');

		const ipAddress = getClientIPFromHeaders(headers);

		expect(ipAddress).toBe('8.23.191.142');
	});
});

describe('client principal parsing', () => {
	test('parses client principal correctly', () => {
		const original = {
			identityProvider: 'aad',
			userId: '1234',
			userDetails: 'user@example.net',
			userRoles: ['authenticated']
		};

		const headers = new Headers({
			'x-ms-client-principal': Buffer.from(JSON.stringify(original)).toString('base64')
		});

		expect(getClientPrincipalFromHeaders(headers)).toStrictEqual(original);
	});

	test('returns undefined when there is no client principal', () => {
		expect(getClientPrincipalFromHeaders(new Headers())).toBeUndefined();
	});

	test('returns undefined if unable to parse', () => {
		const headers = new Headers({
			'x-ms-client-principal': 'boom'
		});

		expect(getClientPrincipalFromHeaders(headers)).toBeUndefined();
	});
});
