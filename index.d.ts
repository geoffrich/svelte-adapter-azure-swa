import { Adapter } from '@sveltejs/kit';
import { ExtendStaticWebAppConfig } from './types/swa';

declare function plugin(opts?: {
	debug?: boolean;
	extendStaticWebAppConfig?: ExtendStaticWebAppConfig;
}): Adapter;
export = plugin;
