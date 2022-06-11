import { Adapter } from '@sveltejs/kit';
import { CustomStaticWebAppConfig } from './types/swa';

type Options = {
	debug?: boolean;
	customStaticWebAppConfig?: CustomStaticWebAppConfig;
};

export default function plugin(options?: Options): Adapter;
