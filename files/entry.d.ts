declare module 'SERVER' {
	// Declared independently of '@sveltejs/kit' rather than re-exported: in
	// SvelteKit 2.x, `Server` is a concrete, constructable class, but SvelteKit
	// 3's public types expose it only as a non-constructable interface (see
	// MANIFEST/SERVER_INSTANCE for the current API). This legacy shape mirrors
	// what SvelteKit 2.x actually exports at runtime.
	export class Server {
		constructor(manifest: import('@sveltejs/kit').SSRManifest);
		init(options: { env: Record<string, string> }): Promise<void>;
		respond(request: Request, options: Record<string, unknown>): Promise<Response>;
	}
}

declare module 'MANIFEST' {
	import { SSRManifest } from '@sveltejs/kit';
	export const manifest: SSRManifest;
}

declare module 'SERVER_INSTANCE' {
	import { Server } from '@sveltejs/kit';
	export const server: InstanceType<typeof Server>;
}
