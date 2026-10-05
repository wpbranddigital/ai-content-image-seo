<?php
/**
 * Plugin Name:       WBD Content & Image SEO Assistant
 * Description:       AI-powered content generation, image metadata optimization, SEO assistance, and accessibility tools for WordPress and WooCommerce.
 * Version:           1.0.1
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            WPBrand Digital
 * Author URI:        https://wpbranddigital.org
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wbd-content-image-seo-assistant
 * Domain Path:       /languages
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'AI_CIS_VERSION', '1.0.1' );
define( 'AI_CIS_FILE', __FILE__ );
define( 'AI_CIS_PATH', plugin_dir_path( __FILE__ ) );
define( 'AI_CIS_URL', plugin_dir_url( __FILE__ ) );
define( 'AI_CIS_BASENAME', plugin_basename( __FILE__ ) );

require_once AI_CIS_PATH . 'includes/class-ai-cis-autoloader.php';
AI_CIS_Autoloader::register();

register_activation_hook( __FILE__, array( 'AI_CIS_Plugin', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'AI_CIS_Plugin', 'deactivate' ) );

add_action( 'plugins_loaded', array( 'AI_CIS_Plugin', 'instance' ) );
