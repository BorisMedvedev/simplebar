import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import license from 'rollup-plugin-license';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const licence = {
  banner: `
        ${pkg.title || pkg.name} - v${pkg.version}
        ${pkg.description}
        ${pkg.homepage}

        Made by ${pkg.author}
        Under ${pkg.license} License
      `,
};

const externals = (id) => {
  if (
    Object.keys(pkg.dependencies).find(
      (dep) => id === dep && id !== 'simplebar-core'
    ) ||
    id.match(/(core-js).+/)
  ) {
    return true;
  }

  return false;
};

const builds = [
  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/index.js',
    external: externals,
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      resolve(), // so Rollup can find dependencies
      commonjs(), // so Rollup can convert dependencies to an ES module
      babel({
        exclude: ['/**/node_modules/**'],
        babelHelpers: 'runtime',
        plugins: [['@babel/plugin-transform-runtime', { useESModules: true }]],
      }),
      license(licence),
    ],
  },
];

if (process.env.BUILD !== 'development') {
  // browser-friendly UMD build
  builds.push({
    input: 'src/index.js',
    external: externals,
    output: {
      name: 'SimpleBar',
      file: pkg.main,
      format: 'umd',
      globals: {
        'can-use-dom': 'canUseDOM',
      },
    },
    plugins: [
      resolve(), // so Rollup can find dependencies
      commonjs(), // so Rollup can convert dependencies to an ES module
      babel({
        exclude: ['/**/node_modules/**'],
        babelHelpers: 'runtime',
        plugins: ['@babel/plugin-transform-runtime'],
      }),
      terser(),
      license(licence),
    ],
  });

  builds.push(
    // browser-friendly, non-minified UMD build
    {
      input: 'src/index.js',
      external: externals,
      output: {
        name: 'SimpleBar',
        file: 'dist/simplebar.js',
        format: 'umd',
        globals: {
          'can-use-dom': 'canUseDOM',
        },
      },
      plugins: [
        resolve(), // so Rollup can find dependencies
        commonjs(), // so Rollup can convert dependencies to an ES module
        babel({
          exclude: ['/**/node_modules/**'],
          babelHelpers: 'runtime',
          plugins: ['@babel/plugin-transform-runtime'],
        }),
        license(licence),
      ],
    }
  );
}

export default builds;
