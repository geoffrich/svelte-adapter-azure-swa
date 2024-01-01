import { installPolyfills } from '@sveltejs/kit/node/polyfills';
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
		context.log(`SK headers: ${JSON.stringify(Object.fromEntries(rendered.headers.entries()))}`);
		context.log(`Response: ${JSON.stringify(response)}`);
	}

	context.res = response;
}

/**
 * @param {Context} context
 * @returns {Request}
 * */
function toRequest(context) {
	const { method, headers, rawBody, body } = context.req;
	// because we proxy all requests to the render function, the original URL in the request is /api/__render
	// this header contains the URL the user requested
	const originalUrl = headers['x-ms-original-url'];

	/** @type {RequestInit} */
	const init = {
		method,
		headers: new Headers(headers)
	};

	if (method !== 'GET' && method !== 'HEAD') {
		init.body = Buffer.isBuffer(body)
			? body
			: typeof rawBody === 'string'
				? Buffer.from(rawBody, 'utf-8')
				: rawBody;
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
