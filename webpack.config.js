const path = require('path');
const webpack = require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const WebpackAssetsManifest = require('webpack-assets-manifest');

module.exports = (env, argv) => {

    isProd = env.production === true || argv.mode == 'production';

    let manifest = new WebpackAssetsManifest({
        transform(assets, manifest) {
            assets["version"] = require('./package.json').version;
            assets["created"] = new Date().toISOString().replace('T', ' ').replace(/\..+/, '');
        },
    });

    /**
     * generic webpack config (both dev and prod)
     */
    const webpack_export = {
        entry: {
            main: './src/js/index.js',
        },

        output: {
            path: path.resolve(process.cwd(), 'dist'),
            filename: 'js/[name].[contenthash].js'
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ['@babel/preset-env'],
                        }
                    }
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    include: /inline.*\.(sa|sc|c)ss$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'sass-loader',
                    ]
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    exclude: /inline.*\.(sa|sc|c)ss$/,
                    use: [
                        {
                            loader: isProd ? MiniCssExtractPlugin.loader : "style-loader",
                            options: isProd ? {
                                publicPath: '../'
                            } : {}
                        },
                        'css-loader',
                        'sass-loader',
                    ]
                },
                {
                    test: /\.(webp|heif|avif|png|jpg|jpeg|gif|svg)$/,
                    type: 'asset',
                    generator: {
                        filename: 'img/[name].[contenthash][ext]',
                    },
                    parser: {
                        dataUrlCondition: {
                            maxSize: 4 * 1024 // 4kb
                        }
                    },
                },
                {
                    test: /\.(webm|mp4|m4v|mov|mkv|avchd|wmv|avi|mp3|wav|aac|flac|ogg|aiff|m4a|wma|dsd|amr)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'media/[name].[contenthash][ext]',
                    },
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'font/[name].[contenthash][ext]',
                    },
                },
            ]
        },

        plugins: [
            new webpack.ProgressPlugin(),

            new CleanWebpackPlugin(),

            new HtmlWebpackPlugin({ 
                template: './src/index.html',
                minify: {
                    collapseWhitespace: isProd,
                    removeComments: isProd,
                    removeRedundantAttributes: isProd,
                    useShortDoctype: isProd,
                    removeEmptyAttributes: isProd,
                    removeStyleLinkTypeAttributes: isProd,
                    keepClosingSlash: isProd,
                    minifyJS: isProd,
                    minifyCSS: isProd,
                    minifyURLs: isProd,
                }, 
            }),

            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(process.cwd(), './src/static/'),
                        to: path.resolve(process.cwd(), './dist/')
                    },
                ],
            }),

            manifest,
        ],

        resolve: {
            modules: [
                path.resolve('./src'),
                path.resolve('./node_modules')
            ]
        },

    };

    /**
     * dev additions
     */
    if (!isProd) {
        webpack_export.devtool = 'inline-source-map';

        webpack_export.devServer = {
            static: {
                directory: path.join(process.cwd(), 'public'),
            },
            watchFiles: ['src/**/*'],
            compress: true,
            port: 9000,
            open: true,
        };
    }

    /**
     * prod additions
     */
    else {
        webpack_export.optimization = {
            minimize: true,
            minimizer: [new TerserPlugin({
                extractComments: true,
                terserOptions: {
                    compress: {
                        drop_console: true
                    }
                }
            })],
            moduleIds: "deterministic",
        };

        webpack_export.plugins.unshift(

            new MiniCssExtractPlugin({
                filename: 'css/[name].[contenthash].css',
                chunkFilename: 'css/[id].[contenthash].css',
            })

        );
    }

    return webpack_export;
};
