/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: process.env.CI
		? undefined
		: {
				command: 'npm run build && npm run preview',
				port: 4173
			}
};

export default config;
