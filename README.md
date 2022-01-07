# svelte-adapter-azure-swa

> :warning: WARNING: this project is considered to be in BETA until SvelteKit is available for general use and the Adapter API is stable. Please report any issues you encounter.

Adapter for Svelte apps that creates an Azure Static Web App, using an Azure function for dynamic server rendering. If your app is purely static, you may be able to use [adapter-static](https://www.npmjs.com/package/@sveltejs/adapter-static) instead.

## Usage

See the [demo repo](https://github.com/geoffrich/sveltekit-azure-swa-demo) for an example integration with the SvelteKit demo app.

Run `npm install -D svelte-adapter-azure-swa`.

Then in your `svelte.config.js`:

```js
import azure from 'svelte-adapter-azure-swa';

export default {
	kit: {
		...
		adapter: azure()
	}
};
```

You will need to create an `api/` folder in your project root containing a [`host.json`](https://docs.microsoft.com/en-us/azure/azure-functions/functions-host-json) (see sample below). The adapter will output the `render` Azure function for SSR in that folder. The `api` folder needs to be in your repo so that Azure can recognize the API at build time. However, you can add `api/render` to your .gitignore so that the generated function is not in source control.

### Sample `host.json`

```json
{
	"version": "2.0",
	"extensionBundle": {
		"id": "Microsoft.Azure.Functions.ExtensionBundle",
		"version": "[2.*, 3.0.0)"
	}
}
```

## Azure configuration

When deploying to Azure, you will need to properly [configure your build](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=github-actions) so that both the static files and API are deployed.

| property          | value          |
| ----------------- | -------------- |
| `app_location`    | `./`           |
| `api_location`    | `api`          |
| `output_location` | `build/static` |

## Running locally with the Azure SWA CLI

You can debug using the [Azure Static Web Apps CLI](https://github.com/Azure/static-web-apps-cli). Note that the CLI is currently in preview and you may encounter issues.

To run the CLI, install `@azure/static-web-apps-cli` and the [Azure Functions Core Tools](https://github.com/Azure/static-web-apps-cli#serve-both-the-static-app-and-api) and add a `swa-cli.config.json` to your project (see sample below). Run `npm run build` to build your project and `swa start` to start the emulator. See the [CLI docs](https://github.com/Azure/static-web-apps-cli) for more information on usage.

### Sample `swa-cli.config.json`

```json
{
	"configurations": {
		"app": {
			"context": "./build/static",
			"apiLocation": "./api"
		}
	}
}
```
