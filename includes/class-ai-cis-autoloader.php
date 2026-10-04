<?php
/**
 * Lightweight autoloader for plugin classes.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Maps AI_CIS_* class names to files following WordPress naming conventions.
 *
 * Example: AI_CIS_Usage_Manager => includes/class-ai-cis-usage-manager.php
 */
final class AI_CIS_Autoloader {

	/**
	 * Directories (relative to the plugin root) searched for classes.
	 *
	 * @var string[]
	 */
	private static $directories = array(
		'includes/',
		'includes/providers/',
		'includes/integrations/',
		'admin/',
	);

	/**
	 * File name prefixes tried for each class.
	 *
	 * @var string[]
	 */
	private static $prefixes = array( 'class-', 'interface-' );

	/**
	 * Registers the autoloader.
	 *
	 * @return void
	 */
	public static function register() {
		spl_autoload_register( array( __CLASS__, 'autoload' ) );
	}

	/**
	 * Loads a class file when the class belongs to this plugin.
	 *
	 * @param string $class_name Class name being requested.
	 * @return void
	 */
	public static function autoload( $class_name ) {
		if ( 0 !== strpos( $class_name, 'AI_CIS_' ) ) {
			return;
		}

		$slug = strtolower( str_replace( '_', '-', $class_name ) );

		foreach ( self::$directories as $directory ) {
			foreach ( self::$prefixes as $prefix ) {
				$file = AI_CIS_PATH . $directory . $prefix . $slug . '.php';
				if ( is_readable( $file ) ) {
					require_once $file;
					return;
				}
			}
		}
	}
}
