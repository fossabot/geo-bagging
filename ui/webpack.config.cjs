const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
	mode: 'production',
	devtool: 'source-map',
	entry: {
		main: './src/js/entry/app.js',
		mini: './src/js/entry/mini.js',
		integration: './src/js/entry/integration.js',
		test: './test/suite/suite.js'
	},
	output: {
		filename: '[name].[contenthash].js'
	},
	resolve: {
		alias: {
			VendorWrappers: path.resolve(__dirname, 'src/js/vendor-wrappers'),
			leaflet: path.resolve(__dirname, 'node_modules/leaflet') //force everything to use the same version of leaflet
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'GeoBagging',
			template: './src/templates/index.html.ejs',
			chunks: ['main'],
			templateParameters: {
				baseUrl: undefined
			}
		}),
		new HtmlWebpackPlugin({
			title: 'GeoBagging',
			filename: 'examples/mini.html',
			template: './src/templates/index.html.ejs',
			chunks: ['mini'],
			templateParameters: {
				baseUrl: '../'
			}
		}),
		new HtmlWebpackPlugin({
			title: 'GeoBaggingTests',
			filename: 'test.html',
			chunks: ['test']
		}),
		new HtmlWebpackPlugin({
			filename: 'integration/trigpointing.js',
			template: './src/templates/integration.js.ejs',
			inject: false,
			chunks: ['integration'],
			minify: false
		}),
		new webpack.ProvidePlugin({
			L: 'leaflet'
		}),
		new CopyPlugin({
			patterns: [
				{from: 'bundles/**/*.json', context: 'src/js'},
				{from: 'bundles/**/*.json.meta', context: 'src/js'},
				{from: 'bundles/**/*.geojson', context: 'src/js'},
				{from: 'bundles/**/*.geojson.meta', context: 'src/js'},
				{from: 'src/includes'}
			]
		}),
		new MiniCssExtractPlugin(),
		//replace the 'current directory' context (which won't exist in the browser) with something that doesn't exist now. It may still break, but at least webpack won't keep telling us about mocha.
		new webpack.ContextReplacementPlugin(/^\.$/, context => {
			if (/\/node_modules\/mocha\/lib/.test(context.context)) {
				//ensure we're only doing this for modules we know about
				context.regExp = /this_should_never_exist/
				for (const d of context.dependencies) {
					if (d.critical) d.critical = false
				}
			}
		})
	],
	optimization: {
		moduleIds: 'hashed',
		runtimeChunk: 'single',
		splitChunks: {
			//maxSize: 500*1024,//breaks css ordering - see https://github.com/webpack-contrib/mini-css-extract-plugin/issues/548
			chunks: 'all',
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all'
				}
			}
		},
		minimizer: [
			new TerserPlugin({
				sourceMap: true
			}),
			new OptimizeCssAssetsPlugin({})
		]
	},
	module: {
		rules: [
			{
				test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'url-loader?limit=10000&mimetype=application/font-woff'
			},
			{
				test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'file-loader'
			},
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, 'css-loader']
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					MiniCssExtractPlugin.loader,
					// Translates CSS into CommonJS
					'css-loader',
					// Compiles Sass to CSS
					'sass-loader'
				]
			},
			{
				test: /\.(png|jpg|gif)$/i,
				use: [
					{
						loader: 'file-loader'
					}
				]
			},
			{
				test: require.resolve('./node_modules/leaflet-plugins/layer/tile/Bing.js'),
				use: 'exports-loader?exports=default|L.BingLayer'
			},
			{
				test: require.resolve('./node_modules/leaflet-mouse-position/src/L.Control.MousePosition.js'),
				use: 'exports-loader?exports=default|L.Control.MousePosition'
			},
			{
				test: require.resolve('./node_modules/Leaflet.MapCenterCoord/src/L.Control.MapCenterCoord.js'),
				use: 'exports-loader?exports=default|L.Control.MapCenterCoord'
			},
			{
				test: require.resolve('./node_modules/leaflet-control-hider/src/hider.js'),
				use: 'exports-loader?exports=default|L.Control.ControlHider'
			},
			{
				test: require.resolve('./node_modules/leaflet-geosearch/src/js/l.control.geosearch.js'),
				use: 'exports-loader?exports=default|L.Control.GeoSearch'
			},
			{
				test: require.resolve('./node_modules/leaflet-geosearch/src/js/l.geosearch.provider.bing.js'),
				use: 'exports-loader?exports=default|L.GeoSearch.Provider.Bing'
			},
			{
				test: require.resolve('./node_modules/sidebar-v2/js/leaflet-sidebar.js'),
				use: 'exports-loader?exports=default|L.Control.Sidebar'
			},
			{
				test: require.resolve('./node_modules/leaflet.featuregroup.subgroup/dist/leaflet.featuregroup.subgroup-src.js'),
				use: 'exports-loader?type=commonjs&exports=single|L.FeatureGroup.SubGroup'
			},
			{
				test: require.resolve('./node_modules/mocha/browser-entry.js'),
				use: 'exports-loader?type=commonjs&exports=single|window'
			}
		]
	}
}
