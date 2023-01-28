/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	event.platform = {
		clientPrincipal: getClientPrincipalFromHeaders(event.request.headers)
	};
	const response = await resolve(event);
	return response;
}

/**
 * Gets the client principal from `x-ms-client-principal` header.
 * @param {Headers} headers
 */
export function getClientPrincipalFromHeaders(headers) {
	// Code adapted from the official SWA documentation
	// https://learn.microsoft.com/en-us/azure/static-web-apps/user-information?tabs=javascript#api-functions
	const header = headers.get('x-ms-client-principal');
	if (!header) {
		return undefined;
	}

	const encoded = Buffer.from(header, 'base64');
	const decoded = encoded.toString('ascii');
	const clientPrincipal = JSON.parse(decoded);

	return clientPrincipal;
}
