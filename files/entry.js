// TODO hardcoding the relative location makes this brittle
// Update once https://github.com/sveltejs/kit/pull/2579 merged
import { init, render } from '../output/server/app.js';

init();

/**
 * @typedef {import('@azure/functions').AzureFunction} AzureFunction
 * @typedef {import('@azure/functions').Context} Context
 * @typedef {import('@azure/functions').HttpRequest} HttpRequest
 */

/**
 * @param {Context} context
 */
export async function index(context) {
	const { method, headers, rawBody: body } = context.req;
	// because we proxy all requests to the render function, the original URL in the request is /api/__render
	// this header contains the URL the user requested
	const originalUrl = headers['x-ms-original-url'];
	const { pathname, searchParams } = new URL(originalUrl);

	const encoding = headers['content-encoding'] || 'utf-8';
	const rawBody = typeof body === 'string' ? Buffer.from(body, encoding) : body;

	const rendered = await render({
		method,
		headers,
		path: pathname,
		query: searchParams,
		rawBody
	});

	const { status, headers: resHeaders, body: resBody } = rendered;

	context.res = {
		status,
		body: resBody,
		headers: resHeaders,
		rawBody
	};
}
