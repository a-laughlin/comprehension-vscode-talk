/* eslint-disable @typescript-eslint/no-require-imports */

const esbuild = require('esbuild');
async function main() {
  console.log('NODE_ENV',process.env.NODE_ENV);
  const ctx = await esbuild.context({
    /* options for all environments - development overwrites at bottom */
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: true,
    packages: 'bundle',

    sourcemap: true,
    sourcesContent: false,
    platform: 'node',
    treeShaking: true,
    outfile: 'out/extension.js',
    external: [
      "vscode",
      "node:child_process",
      "node:fs/promises",
      "node:util",
      "node:os",
      "node:fs",
      "node:path",
    ],
    logLevel: 'silent',
    plugins: [
      /* should be the last plugin ... and they all say that */
      esbuildProblemMatcherPlugin,
    ],

    /* development options */
    ...(process.env.NODE_ENV==='development' && {
        sourcemap: 'inline',
        minify:false,
        outfile:undefined,
        treeShaking:false,
        bundle:false,
        external:[],
        outdir: 'out',
        entryPoints: ['src/**/*.ts'],
    })
  });

  await ctx.rebuild();
  await ctx.dispose();
}

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.log('esbuild started');
      console.time('esbuild');
    });
    build.onEnd(result => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ esbuild-problem-matcher [ERROR] ${text}`);
        console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });
      console.log('esbuild finished');
      console.timeEnd('esbuild');
    });
  }
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});

/* eslint-enable @typescript-eslint/no-require-imports */
