import { sveltekit } from '@sveltejs/kit/vite';

const swaPlugin = () => ({
	name: 'configure-swa-proxy',
	/**
	 * @param {import('vite').ViteDevServer} server
	 */
	configureServer(server) {
		server.middlewares.use((req, res, next) => {
			if (req.url === '/api/__render') {
				const originalUrl = req.headers['x-ms-original-url'];
				const parsedUrl = new URL(originalUrl);
				const rewrittenUrl = parsedUrl.pathname + parsedUrl.search;
				console.log({ rewrittenUrl });
				req.url = rewrittenUrl;
				req.originalUrl = rewrittenUrl;
			}
			next();
		});
	}
});

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [swaPlugin(), sveltekit()]
};

export default config;
