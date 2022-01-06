import { Adapter } from '@sveltejs/kit';

declare function plugin(opts?: { debug?: boolean }): Adapter;
export = plugin;
