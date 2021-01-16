const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;





const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`;

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev
const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }
    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetsPlugin(),
            new TerserPlugin()
        ]
    }
    return config
}
const plugins = () => {

    const base = [
        new HTMLWebpackPlugin({
            template: 'index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),

        new MiniCssExtractPlugin({
            filename: filename('css'),
        }),
        new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
        // new ImageminWebpack({
        //     severityError: 'warning', // Ignore errors on corrupted images
        //     minimizerOptions: {
        //         plugins: ['gifsicle'],
        //     },
        //     // Disable `loader`
        //     loader: false,
        // }),
    ]
    if (isProd) {
        base.push(new BundleAnalyzerPlugin())

    }

    return base
}

const cssLoader = (extensions) => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                esModule: true,
                modules: {
                    namedExport: true,
                },
            },

        },
        'css-loader',

    ]
    if (extensions) {
        loaders.push(extensions)
    }
    return loaders
}

module.exports = {
    context: path.resolve(__dirname, 'src'), //с какой папкой работаем
    entry: {
        main: ['@babel/polyfill', './js/script.js']
    },
    mode: 'development',
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: optimization(),
    devServer: {
        port: 3000,
        hot: isDev
    },
    devtool: isDev ? 'source-map' : '',
    resolve: {
        extensions: ['.js', '.css', '.png'], //чтоб не писать окончания для файлов

    },

    plugins: plugins(),

    module: { //модуль который помогает работать с файлами с которомы изнаально вебпак не работает
        rules: [
            {
                test: /\.css$/i,
                use: cssLoader()
            },
            {
                test: /\.s[ac]ss$/i,
                use: cssLoader('sass-loader')
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts'
                        }
                    }
                ]
            },
            {
                test: /.*\.(gif|png|jpe?g|svg|bmp|webp)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'src/img/',
                            name: '[name].[ext]',
                        }
                    }
                ]
            },

            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-proposal-class-properties'],
                    }
                }
            }

        ]
    }


};


