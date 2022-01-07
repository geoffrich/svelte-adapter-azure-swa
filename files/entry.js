import { __fetch_polyfill } from '@sveltejs/kit/install-fetch';
import { App } from 'APP';
import { manifest } from 'MANIFEST';

// replaced at build time
const debug = DEBUG;

__fetch_polyfill();

/** @type {import('@sveltejs/kit').App} */
const app = new App(manifest);

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
	const url = new URL(originalUrl);

	const rawBody = typeof body === 'string' ? Buffer.from(body, 'utf-8') : body;
	const request = {
		url,
		method,
		headers,
		rawBody
	};

	if (debug) {
		context.log(`Request: ${JSON.stringify(request)}`);
	}

	const rendered = await app.render(request);

	const { status, headers: resHeaders, body: resBody } = rendered;

	const response = {
		status,
		body: resBody,
		headers: resHeaders,
		rawBody
	};

	if (debug) {
		context.log(`Response: ${JSON.stringify(response)}`);
	}

	context.res = response;
}
