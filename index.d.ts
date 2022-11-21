import { Adapter } from '@sveltejs/kit';
import { CustomStaticWebAppConfig } from './types/swa';
import esbuild from 'esbuild';

type Options = {
	debug?: boolean;
	customStaticWebAppConfig?: CustomStaticWebAppConfig;
	esbuildOptions?: Pick<esbuild.BuildOptions, 'external'>;
	apiDir?: string;
};

export default function plugin(options?: Options): Adapter;
