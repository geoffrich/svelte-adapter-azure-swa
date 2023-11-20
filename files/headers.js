import * as set_cookie_parser from 'set-cookie-parser';

/**
 * Splits 'set-cookie' headers into individual cookies
 * @param {Headers} headers
 * @returns {{
 *   headers: Record<string, string>,
 *   cookies: set_cookie_parser.Cookie[]
 * }}
 */
export function splitCookiesFromHeaders(headers) {
	/** @type {Record<string, string>} */
	const resHeaders = {};

	/** @type {set_cookie_parser.Cookie[]} */
	const resCookies = [];

	headers.forEach((value, key) => {
		if (key === 'set-cookie') {
			const cookieStrings = set_cookie_parser.splitCookiesString(value);
			resCookies.push(...set_cookie_parser.parse(cookieStrings));
		} else {
			resHeaders[key] = value;
		}
	});

	return { headers: resHeaders, cookies: resCookies };
}

/**
 * Gets client IP from 'x-forwarded-for' header, ignoring socket and intermediate proxies.
 * @param {Headers} headers
 * @returns {string} Client IP
 */
export function getClientIPFromHeaders(headers) {
	/** @type {string} */
	const resHeader = headers.get('x-forwarded-for') ?? '127.0.0.1';
	const [origin] = resHeader.split(', ');
	const [ipAddress] = origin.split(':');

	return ipAddress;
}

/**
 * Gets the client principal from `x-ms-client-principal` header.
 * @param {Headers} headers
 * @returns {import('../types/swa').ClientPrincipal | undefined} The client principal
 */
export function getClientPrincipalFromHeaders(headers) {
	// Code adapted from the official SWA documentation
	// https://learn.microsoft.com/en-us/azure/static-web-apps/user-information?tabs=javascript#api-functions
	const header = headers.get('x-ms-client-principal');
	if (!header) {
		return undefined;
	}

	try {
		const encoded = Buffer.from(header, 'base64');
		const decoded = encoded.toString('ascii');
		const clientPrincipal = JSON.parse(decoded);

		return clientPrincipal;
	} catch (e) {
		console.log('Unable to parse client principal:', e);
		return undefined;
	}
}
