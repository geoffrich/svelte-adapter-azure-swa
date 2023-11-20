import { installPolyfills } from '@sveltejs/kit/node/polyfills';
import { app } from '@azure/functions';
import { Server } from 'SERVER';
import { manifest } from 'MANIFEST';
import {
	getClientIPFromHeaders,
	getClientPrincipalFromHeaders,
	splitCookiesFromHeaders
} from './headers';

// replaced at build time
// @ts-expect-error
const debug = DEBUG;

installPolyfills();

const server = new Server(manifest);
const initialized = server.init({ env: process.env });

app.http('__render', {
	handler: async (originalRequest, context) => {
		const request = await toRequest(originalRequest);

		if (debug) {
			context.log(`Request: ${JSON.stringify(request)}`);
		}

		const ipAddress = getClientIPFromHeaders(request.headers);
		const clientPrincipal = getClientPrincipalFromHeaders(request.headers);

		await initialized;
		const rendered = await server.respond(request, {
			getClientAddress() {
				return ipAddress;
			},
			platform: {
				clientPrincipal,
				context
			}
		});

		const response = await toResponse(rendered);

		if (debug) {
			context.log(`Response: ${JSON.stringify(response)}`);
		}

		return response;
	}
})

/**
 * @typedef {import('@azure/functions').HttpRequest} AzureFunctionHttpRequest
 */

/**
 * @param {AzureFunctionHttpRequest} originalRequest
 * @returns {Promise<Request>}
 * */
async function toRequest(originalRequest) {
	const { method, headers, arrayBuffer  } = originalRequest;
	// because we proxy all requests to the render function, the original URL in the request is /api/__render
	// this header contains the URL the user requested
	const originalUrl = headers.get('x-ms-original-url');

	/** @type {[string, string][]} */
	const headerEntries = [];
	for (const header of headers.entries()) {
		headerEntries.push(header);
	}

	/** @type {RequestInit} */
	const init = {
		method,
		headers: headerEntries
	};

	if (method !== 'GET' && method !== 'HEAD') {
		init.body = await arrayBuffer();
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

	const { headers, cookies } = splitCookiesFromHeaders(rendered.headers);

	return {
		status,
		body: resBody,
		headers,
		cookies,
		isRaw: true
	};
}
