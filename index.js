import { clientRollup } from './rollup-client.js';
import { serverRollup } from './rollup-server.js';
import { buildConfig } from './swa-config.js';

/** @type {import('.').default} */
export default function (options = {}) {
	return {
		name: 'adapter-azure-swa',

		async adapt(builder) {
			const { allowReservedSwaRoutes = false } = options;

			const conflictingRoutes =
				builder.routes?.map((route) => route.id).filter((routeId) => routeId.startsWith('/api')) ??
				[];
			if (!allowReservedSwaRoutes && conflictingRoutes.length > 0) {
				builder.log.error(
					`Error: the following routes conflict with Azure SWA's reserved /api route: ${conflictingRoutes.join(
						', '
					)}. Requests to these routes in production will return 404 instead of hitting your SvelteKit app.

To resolve this error, move the conflicting routes so they do not start with /api. For example, move /api/blog to /blog.
If you want to suppress this error, set allowReservedSwaRoutes to true in your adapter options.
					`
				);

				throw new Error('Conflicting routes detected. Please rename the routes listed above.');
			}

			const tmpDir = builder.getBuildDirectory('adapter-azure-swa');
			const outputDir = 'build';
			builder.rimraf(tmpDir);
			builder.rimraf(outputDir);
			await serverRollup(builder, outputDir, tmpDir, options);
			await clientRollup(builder, outputDir, tmpDir, options);
			await buildConfig(builder, outputDir, tmpDir, options);
		}
	};
}
