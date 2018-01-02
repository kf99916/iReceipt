import pkg from '../package.json';
import minify from 'rollup-plugin-babel-minify';
import babel from 'rollup-plugin-babel';

const year = new Date().getFullYear();
let filename = 'ireceipt.js',
    plugins = [
        babel({
            exclude: 'node_modules/**'
        })
    ];
if (process.env.NODE_ENV === 'production') {
    filename = 'ireceipt.min.js';
    plugins = [minify()];
}

export default {
    input: 'src/js/receipt.js',
    output: {
        file: 'dist/js/' + filename,
        format: 'umd'
    },
    plugins: plugins,
    name: 'ireceipt',
    external: Object.keys(pkg.dependencies),
    banner: `/*!
    * Ireceipt v${pkg.version} (${pkg.homepage})
    * Copyright ${year} ${pkg.author}
    * Licensed under MIT (https://github.com/kf99916/iReceipt/blob/master/LICENSE)
    */`
};
