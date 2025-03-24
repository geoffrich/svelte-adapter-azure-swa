![CI](https://github.com/ktarmyshov/svelte-adapter-azure-swa/actions/workflows/ci.yml/badge.svg?branch=main)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ktarmyshov_svelte-adapter-azure-swa&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ktarmyshov_svelte-adapter-azure-swa)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=ktarmyshov_svelte-adapter-azure-swa&metric=bugs)](https://sonarcloud.io/summary/new_code?id=ktarmyshov_svelte-adapter-azure-swa)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=ktarmyshov_svelte-adapter-azure-swa&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=ktarmyshov_svelte-adapter-azure-swa)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=ktarmyshov_svelte-adapter-azure-swa&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=ktarmyshov_svelte-adapter-azure-swa)

# svelte-adapter-azure-swa-experimental

The experimental fork of the official adapter repo (see below)

# svelte-adapter-azure-swa

Adapter for Svelte apps that creates an Azure Static Web App, using an Azure function for dynamic server rendering. If your app is purely static, you may be able to use [adapter-static](https://www.npmjs.com/package/@sveltejs/adapter-static) instead.

See the [demo folder](https://github.com/geoffrich/svelte-adapter-azure-swa/tree/main/demo) for an example integration with the SvelteKit demo app. The demo is automatically deployed to [Azure SWA](https://polite-desert-00b80111e.2.azurestaticapps.net/) on every commit to the main branch.

## Usage

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

And, if you use TypeScript, add this to the top of your `src/app.d.ts`:

```ts
/// <reference types="svelte-adapter-azure-swa" />
```

:warning: **IMPORTANT**: you also need to configure your build so that your SvelteKit site deploys properly. Failing to do so will prevent the project from building and deploying. See the next section for instructions.

## Azure configuration

When deploying to Azure, you will need to properly [configure your build](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=github-actions) so that both the static files and API are deployed.

| property          | value          |
| ----------------- | -------------- |
| `app_location`    | `./`           |
| `api_location`    | `build/server` |
| `output_location` | `build/static` |

If you use a custom API directory (see [below](#apiDir)), your `api_location` will be the same as the value you pass to `apiDir`.

If your `app_location` is in a subfolder (e.g. `./my_app_location`), then your `api_location` should include the path to that subfolder (e.g. `my_app_location/build/server`.) `output_location` should still be `build/static`.

### Building with the correct version of Node

Oryx, Azure's build system, may attempt to build your application with an EOL version of Node that SvelteKit doesn't support. If you get an error like "Unsupported engine - Not compatible with your version of node/npm", you can force Oryx to use the correct version by setting an `engines` field in your app's `package.json`:

```js
"engines": {
	"node": ">=18.13 <19"
}
```

### CUSTOM_BUILD_COMMAND considerations

If you are setting a [`CUSTOM_BUILD_COMMAND`](https://github.com/microsoft/Oryx/blob/main/doc/configuration.md) in your build pipeline to customize how the API is built (e.g. to run `npm ci` instead of `npm install`), make sure to run `npm install` inside the API directory to install production dependencies. Otherwise, the SvelteKit render function will not be able to start up.

```yaml
	...
	env:
		CUSTOM_BUILD_COMMAND: "npm ci && npm run build && npm install --prefix ./build/server --omit=dev"
	with:
		skip_api_build: true
		...
```

## Running locally with the Azure SWA CLI

You can debug using the [Azure Static Web Apps CLI](https://github.com/Azure/static-web-apps-cli). Note that the CLI is currently in preview and you may encounter issues.

To run the CLI, install `@azure/static-web-apps-cli` and the [Azure Functions Core Tools](https://github.com/Azure/static-web-apps-cli#serve-both-the-static-app-and-api) and add a `swa-cli.config.json` to your project (see sample below). Run `npm run build` to build your project and `swa start` to start the emulator. See the [CLI docs](https://github.com/Azure/static-web-apps-cli) for more information on usage.

### Sample `swa-cli.config.json`

```json
{
	"configurations": {
		"app": {
			"outputLocation": "./build/static",
			"apiLocation": "./build/server",
			"host": "127.0.0.1"
		}
	}
}
```

## Options

### apiDir

The directory where the `sk_render` Azure function for SSR will be placed. Most of the time, you shouldn't need to set this.

By default, the adapter will output the `sk_render` Azure function for SSR in the `build/server` folder. If you want to output it to a different directory instead (e.g. if you have additional Azure functions to deploy), you can set this option.

**Note:** since the `sk_render` function is written using the [v4 Node.js programming model](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node?tabs=javascript%2Cwindows%2Cazure-cli&pivots=nodejs-model-v4), any other Azure functions you deploy with your Static Web App [need to also be written using v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-node-upgrade-v4?tabs=v4&pivots=programming-language-javascript).

```js
import azure from 'svelte-adapter-azure-swa';

export default {
	kit: {
		...
		adapter: azure({
			apiDir: 'custom/api'
		})
	}
};
```

If you set this option, you will also need to create a `host.json` and `package.json` in your API directory. The adapter normally generates these files by default, but skips them when a custom API directory is provided to prevent overwriting any existing files. You can see the default files the adapter generates in [this directory](https://github.com/geoffrich/svelte-adapter-azure-swa/tree/main/files/api).

For instance, by default the adapter outputs these files...

```
build/
└── server/
    ├── sk_render/
    │   └── index.js
    ├── host.json
    ├── local.settings.json
    └── package.json
```

... but only outputs these files when a custom API directory is provided:

```
custom/
└── api/
    └── sk_render/
        └── index.js
```

The `main` field in your `package.json` [needs to use a glob pattern](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node?tabs=javascript%2Cwindows%2Cazure-cli&pivots=nodejs-model-v4#registering-a-function) that includes both the `sk_render/index.js` entrypoint as well as the entrypoints for your other Azure functions. Example `package.json`:

```json
{
	"main": "**/index.js",
	"dependencies": {
		"@azure/functions": "^4"
	}
}
```

Also note that the adapter reserves the folder prefix `sk_render` and API route prefix `sk_render` for Azure functions generated by the adapter. So, if you use a custom API directory, you cannot have any other folder starting with `sk_render` or functions available at the `sk_render` route, since these will conflict with the adapter's Azure functions.

### staticDir

The directory where the static assets will be placed. Most of the time, you shouldn't need to set this.

By default, the adapter will output the static JS, CSS and HTML files to the `build/static` folder. If you want to output it to a different directory instead you can set this option.

```js
import azure from 'svelte-adapter-azure-swa';

export default {
	kit: {
		...
		adapter: azure({
			staticDir: 'custom/static'
		})
	}
};
```

### customStaticWebAppConfig

An object containing additional Azure SWA [configuration options](https://docs.microsoft.com/en-us/azure/static-web-apps/configuration). This will be merged with the `staticwebapp.config.json` generated by the adapter.

Attempting to override the default catch-all route (`route: '*'`) or the `navigationFallback` options will throw an error, since they are critical for server-side rendering.

**Note:** customizing this config (especially `routes`) has the potential to break how SvelteKit handles the request. Make sure to test any modifications thoroughly.

```js
import azure from 'svelte-adapter-azure-swa';

export default {
	kit: {
		...
		adapter: azure({
			customStaticWebAppConfig: {
				routes: [
					{
						route: '/login',
						allowedRoles: ['admin']
					}
				],
				globalHeaders: {
					'X-Content-Type-Options': 'nosniff',
					'X-Frame-Options': 'DENY',
					'Content-Security-Policy': "default-src https: 'unsafe-eval' 'unsafe-inline'; object-src 'none'",
				},
				mimeTypes: {
					'.json': 'text/json'
				},
				responseOverrides: {
					'401': {
						'redirect': '/login',
						'statusCode': 302
					}
				},
				platform: {
					apiRuntime: 'node:20'
				}
			}
		})
	}
};
```

### allowReservedSwaRoutes

In production, Azure SWA will route any requests to `/api` or `/api/*` to the SWA [API backend](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-overview). If you also define SvelteKit routes beginning with `/api`, those requests will work in dev, but return a 404 in production since the request will be routed to the SWA API. Because of this, the adapter will throw an error at build time if it detects any routes beginning with `/api`.

If you want to disable this check, you can set `allowReservedSwaRoutes` to true. However, this will not start routing `/api` requests to your SvelteKit app. SWA does not allow configuring the `/api` route.

```js
import azure from 'svelte-adapter-azure-swa';

export default {
	kit: {
		...
		adapter: azure({
			allowReservedSwaRoutes: true
		})
	}
};
```

### esbuildOptions

An object containing additional [esbuild options](https://esbuild.github.io/api/#build-api). Currently only supports [external](https://esbuild.github.io/api/#external), [keepNames](https://esbuild.github.io/api/#keep-names), and [loader](https://esbuild.github.io/api/#loader). If you require additional options to be exposed, please [open an issue](https://github.com/geoffrich/svelte-adapter-azure-swa/issues).

```js
import azure from 'svelte-adapter-azure-swa';

export default {
	kit: {
		...
		adapter: azure({
			esbuildOptions: {
				external: ['fsevents'],
				keepNames: true
			}
		})
	}
};
```

## Platform-specific context

SWA provides some information to the backend functions that this adapter makes available as [platform-specific context](https://kit.svelte.dev/docs/adapters#platform-specific-context). This is available in hooks and server routes through the `platform` property on the `RequestEvent`.

To get typings for the `platform` property, reference this adapter in your `src/app.d.ts` as described in the [usage section](#usage).

### `clientPrincipal`

This contains the client principal as parsed from the `x-ms-client-principal` request header. See the [official SWA documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/user-information?tabs=javascript#api-functions) or [the types](index.d.ts) for further details.

This is currently only available when running in production on SWA. In addition, it is only available in certain circumstances in production - see [this adapter issue](https://github.com/geoffrich/svelte-adapter-azure-swa/issues/102) for more details. Please report any issues you encounter.

### `context`

All server requests to your SvelteKit app are handled by an Azure function. This property contains that Azure function's [request context](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node#context-object).

### `user`

The `user` property of the Azure function's [HTTP request](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node?tabs=javascript%2Cwindows%2Cazure-cli&pivots=nodejs-model-v4#http-request).

## Monorepo support

If you're deploying your app from a monorepo, here's what you need to know.

The build currently fails if you use `pnpm` as a package manager. You can track [this issue](https://github.com/geoffrich/svelte-adapter-azure-swa/issues/135) for updates. For now, you can work around the issue by using `npm` instead.

Also, since your SvelteKit app is in a subfolder of the monorepo, you will need to update your deployment workflow.

For instance, if you have the following folder structure:

```
apps/
	├── sveltekit-app
	└── other-app
```

The `app_location` and `api_location` in your deployment configuration need to point to the `apps/sveltekit-app` subfolder. `output_location` should remain the same. Here's how that would look for an Azure SWA GitHub workflow:

```diff
steps:
	 - uses: actions/checkout@v2
        with:
          submodules: true
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_ORANGE_GRASS_0778C6300 }}
          repo_token: ${{ secrets.GITHUB_TOKEN }} # Used for Github integrations (i.e. PR comments)
          action: "upload"
          ###### Repository/Build Configurations - These values can be configured to match your app requirements. ######
          # For more information regarding Static Web App workflow configurations, please visit: https://aka.ms/swaworkflowconfig
-         app_location: "./" # App source code path
-         api_location: "build/server" # Api source code path - optional
+         app_location: "./apps/sveltekit-app" # App source code path
+         api_location: "apps/sveltekit-app/build/server" # Api source code path - optional
          output_location: "build/static" # Built app content directory - optional
          ###### End of Repository/Build Configurations ######
```

## Gotchas

Azure has its share of surprising or quirky behaviors. Here is an evolving list of things to look out for:

> [!CAUTION]
> Azure silently strips the `content-type` header from requests that have no body.
>
> [SvelteKit form actions](https://kit.svelte.dev/docs/form-actions) are valid with no parameters, which can lead to `POST` requests that have an empty body. Unfortunately, [Azure deletes the `content-type` header when the request has an empty body](https://github.com/geoffrich/svelte-adapter-azure-swa/issues/178), which breaks SvelteKit's logic for handling form actions. Until [this is addressed by Azure](https://github.com/Azure/static-web-apps/issues/1512), update to [verson 0.20.1](https://github.com/geoffrich/svelte-adapter-azure-swa/releases/tag/v0.20.1) which contains a workaround for this behavior.
