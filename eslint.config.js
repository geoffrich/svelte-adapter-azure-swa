import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import { fileURLToPath } from 'node:url';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));
const demoGitignorePath = fileURLToPath(new URL('./demo/.gitignore', import.meta.url));

export default [
	includeIgnoreFile(gitignorePath),
	includeIgnoreFile(demoGitignorePath),
	js.configs.recommended,
	prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		}
	},
	globalIgnores(['demo/build', 'demo/.svelte-kit'])
];
