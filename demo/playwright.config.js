/** @type {import('@playwright/test').PlaywrightTestConfig['webServer']} */
let webServer = undefined;
if (process.env.SWA) {
	webServer = {
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
};

export default config;
