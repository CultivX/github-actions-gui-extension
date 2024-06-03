const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
    mode: "development",
    devtool: 'cheap-module-source-map',
    entry: {
        popup: path.resolve('./src/popup/popup.tsx'),
        contentScript: path.resolve('./src/workflow/index.tsx'),
        iconScript: path.resolve('./src/iconScript/iconScript.tsx'),
        service_worker: path.resolve('./src/service_worker/service_worker.ts')
    },
    module: {
        rules: [
            {
                use: "ts-loader",
                test: /\.tsx$/,
                exclude: /node_modules/
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader', {
                    loader: 'postcss-loader',
                    options: {
                        postcssOptions: {
                            ident: 'postcss',
                            plugins: [tailwindcss, autoprefixer],
                        }
                    }
                }],
            },
            {
                test: /\.(png|jpg|jpeg|gif|woff|woff2|tff|eot|svg)$/,
                type: 'asset/resource',
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve('src/static/manifest.json'), 
                    to: path.resolve('dist')
                },
                {
                    from: path.resolve('src/static/actions-icon.png'), 
                    to: path.resolve('dist')
                },
                {
                    from: path.resolve('src/static/workflow.svg'), 
                    to: path.resolve('dist')
                },
                {
                    from: path.resolve('src/static/actions.svg'), 
                    to: path.resolve('dist')
                },
            ]
        }),
        ...getHtmlPlugins([
            'popup',
        ])
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: "[name].js",
        assetModuleFilename: '[name][text]'
    },
    optimization: {
        splitChunks: {
            chunks(chunk) {
                return chunk.name !== 'contentScript' && chunk.name !== 'iconScript';
            }
        }
    }
}

function getHtmlPlugins(chunks) {
    return chunks.map(chunk => new HtmlPlugin({
        title: 'My extension',
        filename: `${chunk}.html`,
        chunks: [chunk]
    }))
}
