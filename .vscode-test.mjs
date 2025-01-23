import { defineConfig } from '@vscode/test-cli';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

export default defineConfig({
	files: 'out/**/*.test.js',
	launchArgs: [
		'--disable-extensions',
		"--skip-welcome",
		"--disable-extensions",
		"--skip-release-notes",
		"--headless"
		// "--enable-proposed-api",
	],
	mocha: {
		ui: 'tdd',
		timeout: 3000,
		bail: false,
		// parallel:true
	},
	version: 'insiders',
	workspaceFolder:`${dirname(fileURLToPath(import.meta.url))}/src/test_fixtures/test.code-workspace`
});
