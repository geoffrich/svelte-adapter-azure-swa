import { app } from '@azure/functions';
import { installPolyfills } from '@sveltejs/kit/node/polyfills';
import { debug } from 'ENV';
import { manifest } from 'MANIFEST';
import { Server } from 'SERVER';
import { Headers as HeadersUndici, Request as RequestUndici } from 'undici';
import {
	getClientIPFromHeaders,
	getClientPrincipalFromHeaders,
	splitCookiesFromHeaders
} from './headers';

installPolyfills();

const server = new Server(manifest);
const initialized = server.init({ env: process.env });

/**
 * @typedef {import('@azure/functions').InvocationContext} InvocationContext
 * @typedef {import('@azure/functions').HttpRequest} HttpRequest
 * @typedef {import('@azure/functions').HttpResponseInit} HttpResponseInit
 * @typedef {import('undici').BodyInit} ResponseBodyInitUndici
 * @typedef {import('undici').HeadersInit} ResponseHeadersInitUndici
 */

app.setup({
	enableHttpStream: true
});

app.http('sk_render', {
	methods: ['HEAD', 'GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
	/**
	 *
	 * @param {HttpRequest} httpRequest
	 * @param {InvocationContext} context
	 */
	handler: async (httpRequest, context) => {
		if (debug) {
			context.log(
				'Starting request',
				httpRequest.method,
				httpRequest.headers.get('x-ms-original-url')
			);
			context.log(`Request: ${JSON.stringify(httpRequest)}`);
		}

		const request = toRequest(httpRequest);

		const ipAddress = getClientIPFromHeaders(request.headers);
		const clientPrincipal = getClientPrincipalFromHeaders(request.headers);

		await initialized;
		const rendered = await server.respond(request, {
			getClientAddress() {
				return ipAddress;
			},
			platform: {
				user: httpRequest.user,
				clientPrincipal,
				context
			}
		});

		if (debug) {
			/** @type {Record<string, string>} */
			const headers = {};
			rendered.headers.forEach((value, key) => {
				headers[key] = value;
			});
			context.log(`SK headers: ${JSON.stringify(headers)}`);
			context.log(`Response: ${JSON.stringify(rendered)}`);
		}

		return toResponseInit(rendered);
	}
});

/**
 * @param {HttpRequest} httpRequest
 * @returns {Request}
 */
function toRequest(httpRequest) {
	// because we proxy all requests to the render function, the original URL in the request is /api/sk_render
	// this header contains the URL the user requested
	const originalUrl = httpRequest.headers.get('x-ms-original-url');

	const headers = new HeadersUndici();
	httpRequest.headers.forEach((value, key) => {
		if (key !== 'x-ms-original-url') {
			headers.set(key, value);
		}
	});

	// SWA strips content-type headers from empty POST requests, but SK form actions require the header
	// https://github.com/geoffrich/svelte-adapter-azure-swa/issues/178
	if (
		httpRequest.method === 'POST' &&
		!httpRequest.body &&
		!httpRequest.headers.get('content-type')
	) {
		headers.set('content-type', 'application/x-www-form-urlencoded');
	}

	/** @type any */
	const request = new RequestUndici(originalUrl, {
		method: httpRequest.method,
		headers,
		body: httpRequest.body,
		duplex: 'half'
	});
	return request;
}

/**
 * Converts a ReadableStream<Uint8Array> to an AsyncIterable<Uint8Array>.
 * @param {ReadableStream<Uint8Array>} stream
 * @returns {AsyncIterable<Uint8Array>}
 */
function readableStreamToAsyncIterable(stream) {
	const reader = stream.getReader();
	return {
		[Symbol.asyncIterator]() {
			return {
				async next() {
					const { done, value } = await reader.read();
					return { done, value };
				}
			};
		}
	};
}

/**
 * @param {Response} rendered
 * @returns {HttpResponseInit}
 */
function toResponseInit(rendered) {
	const { headers, cookies } = splitCookiesFromHeaders(rendered.headers);

	/** @type ResponseBodyInitUndici */
	const bodyInit = rendered.body ? readableStreamToAsyncIterable(rendered.body) : undefined;
	/** @type ResponseHeadersInitUndici */
	const headersInit = {};
	headers.forEach((value, key) => {
		if (key !== 'set-cookie') {
			headersInit[key] = value;
		}
	});

	return {
		status: rendered.status,
		body: bodyInit,
		headers: headersInit,
		cookies,
		enableContentNegotiation: false
	};
}
