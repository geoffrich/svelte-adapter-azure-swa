/** @type {import('@playwright/test').PlaywrightTestConfig['webServer']} */
let webServer;
if (process.env.SWA) {
	webServer = {
		timeout: 120 * 1000,
		command: 'npm run build && npm run swa -- --verbose=silly',
		port: 4280
	};
} else if (process.env.CI) {
	webServer = undefined;
} else {
	webServer = {
		command: 'npm run build && npm run preview',
		port: 4173
	};
}
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer
	// outputDir: '../demo-test-results'
};

export default config;
