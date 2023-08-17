import { Adapter } from '@sveltejs/kit';
import { ClientPrincipal, CustomStaticWebAppConfig } from './types/swa';
import { Context } from '@azure/functions';
import esbuild from 'esbuild';

export * from './types/swa';

export type Options = {
	debug?: boolean;
	customStaticWebAppConfig?: CustomStaticWebAppConfig;
	esbuildOptions?: Pick<esbuild.BuildOptions, 'external' | 'keepNames' | 'loader'>;
	apiDir?: string;
	staticDir?: string;
	allowReservedSwaRoutes?: boolean;
};

export default function plugin(options?: Options): Adapter;

declare global {
	namespace App {
		export interface Platform {
			/**
			 * Client Principal as passed from Azure
			 *
			 * @remarks
			 *
			 * Due to a possible in bug in SWA, the client principal is only passed
			 * to the render function on routes specifically designated as
			 * protected. Protected in this case means that the `allowedRoles`
			 * field is populated and does not contain the `anonymous` role.
			 *
			 * @see The {@link https://learn.microsoft.com/en-us/azure/static-web-apps/user-information?tabs=javascript#api-functions SWA documentation}
			 */

			/**
			 * The Azure function request context.
			 *
			 * @see The {@link https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node#context-object Azure function documentation}
			 */
			clientPrincipal?: ClientPrincipal;
			context: Context;
		}
	}
}
