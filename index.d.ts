import { Adapter } from '@sveltejs/kit';
import { StaticWebAppConfig } from './types/swa';
import esbuild from 'esbuild';

type Options = {
	debug?: boolean;
	customStaticWebAppConfig?: StaticWebAppConfig;
	esbuildOptions?: Pick<esbuild.BuildOptions, 'external'>;
};

export default function plugin(options?: Options): Adapter;
