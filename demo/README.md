# SvelteKit Azure SWA demo

This is a repo demonstrating how to use [svelte-adapter-azure-swa](https://www.npmjs.com/package/svelte-adapter-azure-swa) with [SvelteKit](https://kit.svelte.dev/).

This demo uses the local version of the adapter to make testing unreleased changes easier. In your app, you should install `svelte-adapter-azure-swa` from npm.

This demo also uses a custom Azure function to make testing that integration easier. If you do not need a custom Azure function, you do not need the `func/` folder or need to set the `apiDir` option in `svelte.config.js`.

[Deployed demo](https://polite-desert-00b80111e.2.azurestaticapps.net/)

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
