import fs from 'node:fs';
import { build } from 'esbuild';

const outbase = 'src/handlers';

build({
  outdir: 'dist/lambda',
  outbase,
  entryPoints: [`${outbase}/**/*.ts`],
  entryNames: '[dir]/[name]/[name]' as const,

  platform: 'node' as const,
  format: 'esm' as const,
  target: 'es2024' as const,
  bundle: true,

  outExtension: { '.js': '.mjs' as const },
  mainFields: ['module', 'main'] as const,
  banner: {
    js: [
      "import { createRequire } from 'node:module';",
      "import __nodeUrl from 'node:url';",
      "import __nodePath from 'node:path';",
      'const require = createRequire(import.meta.url);',
      'const __filename = __nodeUrl.fileURLToPath(import.meta.url);',
      'const __dirname = __nodePath.dirname(__filename);',
    ].join('\n'),
  },

  plugins: [
    {
      name: 'cleanup',
      setup(build): void {
        build.onStart(() => {
          const { outdir } = build.initialOptions;

          if (!outdir) {
            throw new Error('Missing outdir option');
          }

          if (fs.existsSync(outdir)) {
            fs.rmSync(outdir, { recursive: true });
          }
        });
      },
    },
    {
      name: 'copy',
      setup(build): void {
        build.onEnd(() => {
          const { outdir } = build.initialOptions;

          if (!outdir) {
            throw new Error('Missing outdir option');
          }

          if (!fs.existsSync(outdir)) {
            throw new Error('Missing outdir');
          }

          const target = `${outdir}/run-migrations`;
          const source = 'src/drizzle/migrations';
          const dest = `${target}/migrations`;

          if (!fs.existsSync(`./${target}`)) {
            throw new Error(`Missing target: ./${target}`);
          }

          if (!fs.existsSync(`./${source}`)) {
            throw new Error(`Missing source: ./${source}`);
          }

          fs.cpSync(`./${source}`, `./${dest}`, {
            recursive: true,
          });
        });
      },
    },
  ],
});
