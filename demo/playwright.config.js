/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: process.env.SWA
		? {
			command: 'npm run build && npm run swa -- --verbose=silly',
			port: 4280
		}
		: {
			command: 'npm run build && npm run preview',
			port: 4173
		}
};

export default config;
