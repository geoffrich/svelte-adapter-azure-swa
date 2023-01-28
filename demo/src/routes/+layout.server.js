/** @type {import('./$types').LayoutServerLoad} */
export const load = (event) => {
	return {
		user: event.platform?.clientPrincipal
	};
};
