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
	const request = toRequest(context);

	if (debug) {
		context.log(`Request: ${JSON.stringify(request)}`);
	}

	const rendered = await app.render(request);
	const response = await toResponse(rendered);

	if (debug) {
		context.log(`Response: ${JSON.stringify(response)}`);
	}

	context.res = response;
}

/**
 * @param {Context} context
 * @returns {Request}
 * */
function toRequest(context) {
	const { method, headers, rawBody: body } = context.req;
	// because we proxy all requests to the render function, the original URL in the request is /api/__render
	// this header contains the URL the user requested
	const originalUrl = headers['x-ms-original-url'];

	/** @type {RequestInit} */
	const init = {
		method,
		headers: new Headers(headers)
	};

	if (method !== 'GET' && method !== 'HEAD') {
		init.body = typeof body === 'string' ? Buffer.from(body, 'utf-8') : body;
	}

	return new Request(originalUrl, init);
}

/**
 * @param {Response} rendered
 * @returns {Promise<Record<string, any>>}
 */
async function toResponse(rendered) {
	const { status } = rendered;
	const resBody = new Uint8Array(await rendered.arrayBuffer());

	/** @type {Record<string, string>} */
	const resHeaders = {};
	rendered.headers.forEach((value, key) => {
		resHeaders[key] = value;
	});

	return {
		status,
		body: resBody,
		headers: resHeaders,
		isRaw: true
	};
}
