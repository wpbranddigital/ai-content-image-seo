/**
 * Extends the default @wordpress/scripts config with one entry per bundle.
 */
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		admin: path.resolve( __dirname, 'src/admin/index.js' ),
		editor: path.resolve( __dirname, 'src/editor/index.js' ),
		media: path.resolve( __dirname, 'src/media/index.js' ),
		product: path.resolve( __dirname, 'src/product/index.js' ),
	},
	output: {
		...defaultConfig.output,
		path: path.resolve( __dirname, 'build' ),
	},
};
