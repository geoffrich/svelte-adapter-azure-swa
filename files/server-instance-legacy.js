// SvelteKit 2.x compatibility shim.
//
// SvelteKit 3+ generates this module for us via `builder.generateServerInstance`,
// which exports a ready-made `server` instance. SvelteKit 2.x has no such API, so
// we construct the `Server` ourselves from the manifest produced by the (now
// removed in 3.0) `builder.generateManifest`.
import { Server } from 'SERVER';
import { manifest } from 'MANIFEST';

export const server = new Server(manifest);
