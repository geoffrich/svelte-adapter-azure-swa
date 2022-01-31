import { Adapter } from '@sveltejs/kit';
import { CustomStaticWebAppConfig } from './types/swa';

declare function plugin(opts?: {
	debug?: boolean;
	customStaticWebAppConfig?: CustomStaticWebAppConfig;
}): Adapter;
export = plugin;
