import { installPolyfills } from '@sveltejs/kit/node/polyfills';
import { expect, describe, test } from 'vitest';
import { splitCookiesFromHeaders } from '../files/headers';

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
