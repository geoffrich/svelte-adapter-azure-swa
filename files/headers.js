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
