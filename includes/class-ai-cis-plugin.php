<?php
/**
 * Main plugin bootstrap.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Wires modules together. Only lightweight hooks are registered on frontend
 * requests; admin UI, providers and bulk logic load on demand.
 */
final class AI_CIS_Plugin {

	/**
	 * Singleton instance.
	 *
	 * @var AI_CIS_Plugin|null
	 */
	private static $instance = null;

	/**
	 * Returns the instance.
	 *
	 * @return AI_CIS_Plugin
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		// Background queue hooks (cron/Action Scheduler) and new-upload automation.
		AI_CIS_Queue::init();

		add_action( 'init', array( $this, 'on_init' ) );
		add_action( 'rest_api_init', array( 'AI_CIS_REST_API', 'register_routes' ) );

		if ( is_admin() ) {
			AI_CIS_Admin::init();
			AI_CIS_Media_Library::init();
		}

		/**
		 * Fires after the plugin has loaded.
		 *
		 * @param AI_CIS_Plugin $plugin Plugin instance.
		 */
		do_action( 'ai_cis_loaded', $this );
	}

	/**
	 * Init-time setup.
	 *
	 * @return void
	 */
	public function on_init() {
		AI_CIS_SEO_Integration::init();

		if ( AI_CIS_WooCommerce::is_active() ) {
			AI_CIS_WooCommerce::init();
			AI_CIS_Review_Summary::init();
		}
	}

	/**
	 * Activation: create options (not autoloaded) and request onboarding.
	 *
	 * @return void
	 */
	public static function activate() {
		add_option( AI_CIS_Settings::OPTION, array(), '', false );
		add_option( AI_CIS_Settings::KEYS, array(), '', false );
		add_option( 'ai_cis_version', AI_CIS_VERSION, '', false );

		if ( ! AI_CIS_Settings::get( 'onboarding_complete', false ) ) {
			set_transient( 'ai_cis_activation_redirect', 1, 60 );
		}
	}

	/**
	 * Deactivation: stop background work. Settings and data are kept.
	 *
	 * @return void
	 */
	public static function deactivate() {
		AI_CIS_Queue::unschedule( AI_CIS_Queue::BULK_HOOK );
		AI_CIS_Queue::unschedule( AI_CIS_Queue::AUTO_HOOK );
		delete_transient( AI_CIS_Queue::LOCK );
		delete_transient( AI_CIS_Queue::AUTO_LOCK );
	}
}
