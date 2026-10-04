<?php
/**
 * Admin menus, asset loading and onboarding redirect.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin controller.
 */
final class AI_CIS_Admin {

	const SLUG = 'ai-content-image-seo';

	/**
	 * Hook suffixes of plugin pages.
	 *
	 * @var string[]
	 */
	private static $hooks = array();

	/**
	 * Bundles already enqueued.
	 *
	 * @var array
	 */
	private static $enqueued = array();

	/**
	 * Registers admin hooks.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_pages' ) );
		add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'enqueue_editor' ) );
		add_action( 'admin_init', array( __CLASS__, 'maybe_redirect_to_setup' ) );
		add_action( 'admin_init', array( __CLASS__, 'privacy_policy_content' ) );
		add_filter( 'plugin_action_links_' . AI_CIS_BASENAME, array( __CLASS__, 'action_links' ) );
	}

	/**
	 * Page definitions.
	 *
	 * @return array slug => array( title, capability, view ).
	 */
	public static function pages() {
		$pages = array(
			self::SLUG           => array(
				'title' => __( 'Dashboard', 'ai-content-image-seo' ),
				'cap'   => 'edit_posts',
				'view'  => 'dashboard',
			),
			'ai-cis-content'     => array(
				'title' => __( 'Content AI', 'ai-content-image-seo' ),
				'cap'   => 'edit_posts',
				'view'  => 'content',
			),
			'ai-cis-image'       => array(
				'title' => __( 'Image AI', 'ai-content-image-seo' ),
				'cap'   => 'upload_files',
				'view'  => 'image',
			),
			'ai-cis-seo'         => array(
				'title' => __( 'SEO Assistant', 'ai-content-image-seo' ),
				'cap'   => 'edit_posts',
				'view'  => 'seo',
			),
			'ai-cis-woocommerce' => array(
				'title' => __( 'WooCommerce', 'ai-content-image-seo' ),
				'cap'   => 'edit_products',
				'view'  => 'woocommerce',
			),
			'ai-cis-usage'       => array(
				'title' => __( 'Usage', 'ai-content-image-seo' ),
				'cap'   => 'edit_posts',
				'view'  => 'usage',
			),
			'ai-cis-settings'    => array(
				'title' => __( 'Settings', 'ai-content-image-seo' ),
				'cap'   => 'manage_options',
				'view'  => 'settings',
			),
		);

		if ( ! AI_CIS_WooCommerce::is_active() ) {
			unset( $pages['ai-cis-woocommerce'] );
		}

		return $pages;
	}

	/**
	 * Registers the menu.
	 *
	 * @return void
	 */
	public static function register_menu() {
		self::$hooks[] = add_menu_page(
			__( 'AI Content & Image SEO', 'ai-content-image-seo' ),
			__( 'AI Content & SEO', 'ai-content-image-seo' ),
			'edit_posts',
			self::SLUG,
			array( __CLASS__, 'render' ),
			'dashicons-superhero-alt',
			58
		);

		foreach ( self::pages() as $slug => $page ) {
			self::$hooks[] = add_submenu_page(
				self::SLUG,
				$page['title'] . ' ‹ ' . __( 'AI Content & Image SEO', 'ai-content-image-seo' ),
				$page['title'],
				$page['cap'],
				$slug,
				array( __CLASS__, 'render' )
			);
		}
	}

	/**
	 * Current plugin page slug.
	 *
	 * @return string
	 */
	private static function current_page() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Routing only.
		return isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';
	}

	/**
	 * Renders the React mount point.
	 *
	 * @return void
	 */
	public static function render() {
		$pages = self::pages();
		$slug  = self::current_page();
		$view  = isset( $pages[ $slug ] ) ? $pages[ $slug ]['view'] : 'dashboard';
		?>
		<div class="wrap ai-cis-wrap">
			<h1 class="screen-reader-text"><?php echo esc_html( isset( $pages[ $slug ] ) ? $pages[ $slug ]['title'] : __( 'AI Content & Image SEO', 'ai-content-image-seo' ) ); ?></h1>
			<div id="ai-cis-admin-root" data-view="<?php echo esc_attr( $view ); ?>">
				<p><?php esc_html_e( 'Loading…', 'ai-content-image-seo' ); ?></p>
			</div>
			<noscript><p><?php esc_html_e( 'AI Content & Image SEO requires JavaScript to be enabled.', 'ai-content-image-seo' ); ?></p></noscript>
		</div>
		<?php
	}

	/**
	 * Enqueues the admin app on plugin pages only.
	 *
	 * @param string $hook Hook suffix.
	 * @return void
	 */
	public static function enqueue_pages( $hook ) {
		if ( ! in_array( $hook, self::$hooks, true ) ) {
			return;
		}
		wp_enqueue_media();
		self::enqueue_bundle( 'admin' );
	}

	/**
	 * Enqueues the block editor sidebar for post types that use the block editor.
	 *
	 * @return void
	 */
	public static function enqueue_editor() {
		if ( ! is_admin() || ! current_user_can( 'edit_posts' ) ) {
			return;
		}
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( $screen && ( 'post' !== $screen->base || ! post_type_supports( $screen->post_type, 'editor' ) ) ) {
			return;
		}
		self::enqueue_bundle( 'editor' );
	}

	/**
	 * Enqueues a compiled bundle from /build with its dependencies.
	 *
	 * @param string $name Bundle name: admin, editor, media, product.
	 * @return void
	 */
	public static function enqueue_bundle( $name ) {
		if ( isset( self::$enqueued[ $name ] ) ) {
			return;
		}

		$asset_file = AI_CIS_PATH . 'build/' . $name . '.asset.php';
		if ( ! is_readable( $asset_file ) ) {
			return;
		}
		$asset  = require $asset_file;
		$handle = 'ai-cis-' . $name;

		wp_enqueue_script( $handle, AI_CIS_URL . 'build/' . $name . '.js', $asset['dependencies'], $asset['version'], true );
		wp_set_script_translations( $handle, 'ai-content-image-seo', AI_CIS_PATH . 'languages' );

		if ( is_readable( AI_CIS_PATH . 'build/' . $name . '.css' ) ) {
			wp_enqueue_style( $handle, AI_CIS_URL . 'build/' . $name . '.css', array( 'wp-components' ), $asset['version'] );
			wp_style_add_data( $handle, 'rtl', 'replace' );
		} else {
			wp_enqueue_style( 'wp-components' );
		}

		if ( empty( self::$enqueued ) ) {
			wp_add_inline_script( $handle, 'window.aiCisData = ' . wp_json_encode( self::bootstrap_data() ) . ';', 'before' );
		} else {
			wp_add_inline_script( $handle, 'window.aiCisData = window.aiCisData || ' . wp_json_encode( self::bootstrap_data() ) . ';', 'before' );
		}

		self::$enqueued[ $name ] = true;
	}

	/**
	 * Options as value/label lists for selects.
	 *
	 * @param array $map Map.
	 * @return array
	 */
	private static function options( $map ) {
		$out = array();
		foreach ( $map as $value => $label ) {
			$out[] = array(
				'value' => (string) $value,
				'label' => is_array( $label ) ? $label['label'] : $label,
			);
		}
		return $out;
	}

	/**
	 * Data passed to JavaScript. Never contains secrets.
	 *
	 * @return array
	 */
	private static function bootstrap_data() {
		$page_urls = array();
		foreach ( self::pages() as $slug => $page ) {
			$page_urls[ $page['view'] ] = admin_url( 'admin.php?page=' . $slug );
		}

		$is_manager = current_user_can( 'manage_options' );

		$data = array(
			'version'        => AI_CIS_VERSION,
			'pages'          => $page_urls,
			'adminUrl'       => admin_url(),
			'mediaUrl'       => admin_url( 'upload.php' ),
			'newPostUrl'     => admin_url( 'post-new.php' ),
			'connectorsUrl'  => admin_url( 'options-connectors.php' ),
			'isWooActive'    => AI_CIS_WooCommerce::is_active(),
			'seoPlugin'      => AI_CIS_SEO_Integration::detect(),
			'seoPluginLabel' => AI_CIS_SEO_Integration::label(),
			'providerReady'  => AI_CIS_AI_Manager::is_ready(),
			'isManager'      => $is_manager,
			'canBulk'        => current_user_can( AI_CIS_REST_API::bulk_capability() ),
			'canUpload'      => current_user_can( 'upload_files' ),
			'onboarding'     => $is_manager && ! AI_CIS_Settings::get( 'onboarding_complete', false ),
			'defaults'       => array(
				'language'     => (string) AI_CIS_Settings::get( 'default_language', 'English' ),
				'tone'         => (string) AI_CIS_Settings::get( 'default_tone', 'professional' ),
				'altStyle'     => (string) AI_CIS_Settings::get( 'alt_text_style', 'balanced' ),
				'imageFields'  => (array) AI_CIS_Settings::get( 'image_default_fields', array( 'alt', 'title' ) ),
				'autoOptimize' => (bool) AI_CIS_Settings::get( 'auto_optimize', false ),
			),
			'options'        => array(
				'languages'      => self::options( AI_CIS_Settings::languages() ),
				'tones'          => self::options( AI_CIS_Prompts::tones() ),
				'contentTypes'   => self::options( AI_CIS_Prompts::content_types() ),
				'lengths'        => self::options( AI_CIS_Prompts::lengths() ),
				'rewriteActions' => self::options( AI_CIS_Prompts::rewrite_actions() ),
				'imageFields'    => self::options( AI_CIS_Image_Optimizer::fields() ),
				'imageFilters'   => self::options( AI_CIS_Image_Optimizer::filters() ),
				'productFields'  => self::options( AI_CIS_WooCommerce::fields() ),
			),
		);

		/**
		 * Filters data passed to the admin JavaScript. Never add secrets here.
		 *
		 * @param array $data Data.
		 */
		return apply_filters( 'ai_cis_admin_data', $data );
	}

	/**
	 * Redirects to the setup screen once after activation.
	 *
	 * @return void
	 */
	public static function maybe_redirect_to_setup() {
		if ( ! get_transient( 'ai_cis_activation_redirect' ) ) {
			return;
		}
		delete_transient( 'ai_cis_activation_redirect' );

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Checking core's bulk activation flag only.
		if ( wp_doing_ajax() || is_network_admin() || isset( $_GET['activate-multi'] ) || ! current_user_can( 'manage_options' ) ) {
			return;
		}
		if ( AI_CIS_Settings::get( 'onboarding_complete', false ) ) {
			return;
		}

		wp_safe_redirect( admin_url( 'admin.php?page=' . self::SLUG ) );
		exit;
	}

	/**
	 * Adds a Settings link on the Plugins screen.
	 *
	 * @param array $links Links.
	 * @return array
	 */
	public static function action_links( $links ) {
		if ( current_user_can( 'manage_options' ) ) {
			array_unshift(
				$links,
				'<a href="' . esc_url( admin_url( 'admin.php?page=ai-cis-settings' ) ) . '">' . esc_html__( 'Settings', 'ai-content-image-seo' ) . '</a>'
			);
		}
		return $links;
	}

	/**
	 * Suggested privacy policy text.
	 *
	 * @return void
	 */
	public static function privacy_policy_content() {
		if ( ! function_exists( 'wp_add_privacy_policy_content' ) ) {
			return;
		}
		$content = '<p>' . esc_html__( 'This site uses the AI Content & Image SEO Assistant plugin. When an editor uses an AI feature, or when automatic image optimization is enabled, the selected content (for example post text, image files and image context, product details, or the text and star ratings of product reviews) is sent to the AI provider configured by the site administrator to generate suggestions.', 'ai-content-image-seo' ) . '</p>'
			. '<p>' . esc_html__( 'Reviewer names, email addresses, IP addresses, customer accounts, passwords and payment information are never sent. No data is sent to the plugin author.', 'ai-content-image-seo' ) . '</p>';

		wp_add_privacy_policy_content( __( 'AI Content & Image SEO Assistant', 'ai-content-image-seo' ), wp_kses_post( $content ) );
	}
}
