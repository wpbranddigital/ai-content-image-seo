<?php
/**
 * REST API (namespace ai-cis/v1).
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers secure REST endpoints. Every route has a permission callback,
 * argument validation and sanitization. API keys are never returned.
 */
final class AI_CIS_REST_API {

	const NAMESPACE_V1 = 'ai-cis/v1';

	/**
	 * Capability required to run bulk jobs.
	 *
	 * @return string
	 */
	public static function bulk_capability() {
		/**
		 * Filters the capability required to run bulk image optimization.
		 *
		 * @param string $capability Capability. Default edit_others_posts.
		 */
		return (string) apply_filters( 'ai_cis_bulk_capability', 'edit_others_posts' );
	}

	/**
	 * Common argument definitions.
	 *
	 * @return array
	 */
	private static function common_args() {
		return array(
			'language'   => array(
				'type'              => 'string',
				'default'           => '',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'request_id' => array(
				'type'              => 'string',
				'default'           => '',
				'sanitize_callback' => 'sanitize_text_field',
			),
		);
	}

	/**
	 * Positive integer argument.
	 *
	 * @param bool $required Whether required.
	 * @return array
	 */
	private static function id_arg( $required = true ) {
		return array(
			'type'              => 'integer',
			'required'          => $required,
			'minimum'           => $required ? 1 : 0,
			'sanitize_callback' => 'absint',
		);
	}

	/**
	 * String argument.
	 *
	 * @param bool   $textarea Use textarea sanitization.
	 * @param string $fallback Default.
	 * @return array
	 */
	private static function string_arg( $textarea = false, $fallback = '' ) {
		return array(
			'type'              => 'string',
			'default'           => $fallback,
			'sanitize_callback' => $textarea ? 'sanitize_textarea_field' : 'sanitize_text_field',
		);
	}

	/**
	 * HTML content argument (kept as post-safe HTML).
	 *
	 * @param bool $required Whether required.
	 * @return array
	 */
	private static function html_arg( $required = false ) {
		return array(
			'type'              => 'string',
			'required'          => $required,
			'default'           => '',
			'sanitize_callback' => 'wp_kses_post',
		);
	}

	/**
	 * Enum argument.
	 *
	 * @param array  $values   Allowed values.
	 * @param string $fallback Default.
	 * @return array
	 */
	private static function enum_arg( $values, $fallback ) {
		return array(
			'type'    => 'string',
			'enum'    => array_values( $values ),
			'default' => $fallback,
		);
	}

	/**
	 * Image field list argument.
	 *
	 * @return array
	 */
	private static function fields_arg() {
		return array(
			'type'              => 'array',
			'items'             => array(
				'type' => 'string',
				'enum' => array_keys( AI_CIS_Image_Optimizer::fields() ),
			),
			'default'           => array( 'alt', 'title' ),
			'sanitize_callback' => array( 'AI_CIS_Image_Optimizer', 'sanitize_fields' ),
		);
	}

	/**
	 * Registers all routes.
	 *
	 * @return void
	 */
	public static function register_routes() {
		$ns = self::NAMESPACE_V1;

		// Usage.
		register_rest_route(
			$ns,
			'/usage',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'get_usage' ),
				'permission_callback' => array( __CLASS__, 'can_edit_posts' ),
			)
		);
		register_rest_route(
			$ns,
			'/usage/reset',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'reset_usage' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
			)
		);

		// Settings & providers.
		register_rest_route(
			$ns,
			'/settings',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_settings' ),
					'permission_callback' => array( __CLASS__, 'can_manage' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'update_settings' ),
					'permission_callback' => array( __CLASS__, 'can_manage' ),
					'args'                => array(
						'settings' => array(
							'type'     => 'object',
							'required' => true,
						),
					),
				),
			)
		);
		register_rest_route(
			$ns,
			'/onboarding',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'complete_onboarding' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'args'                => array(
					'settings' => array(
						'type'    => 'object',
						'default' => array(),
					),
					'skip'     => array(
						'type'    => 'boolean',
						'default' => false,
					),
				),
			)
		);
		register_rest_route(
			$ns,
			'/provider/test',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'test_provider' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'args'                => array(
					'provider' => self::enum_arg( array_keys( AI_CIS_AI_Manager::provider_classes() ), 'wp_ai_connector' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/provider/models',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'refresh_models' ),
				'permission_callback' => array( __CLASS__, 'can_manage' ),
				'args'                => array(
					'provider' => self::enum_arg( array_keys( AI_CIS_AI_Manager::provider_classes() ), 'wp_ai_connector' ),
				),
			)
		);

		// Content AI.
		register_rest_route(
			$ns,
			'/generate-content',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'generate_content' ),
				'permission_callback' => array( __CLASS__, 'can_edit_posts' ),
				'args'                => array_merge(
					self::common_args(),
					array(
						'topic'        => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_textarea_field',
							'validate_callback' => array( __CLASS__, 'validate_non_empty' ),
						),
						'content_type' => self::enum_arg( array_keys( AI_CIS_Prompts::content_types() ), 'blog_post' ),
						'tone'         => self::enum_arg( array_keys( AI_CIS_Prompts::tones() ), 'professional' ),
						'length'       => self::enum_arg( array_keys( AI_CIS_Prompts::lengths() ), 'medium' ),
						'keywords'     => self::string_arg(),
						'instructions' => self::string_arg( true ),
						'post_type'    => self::enum_arg( array( 'post', 'page' ), 'post' ),
					)
				),
			)
		);
		register_rest_route(
			$ns,
			'/rewrite',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'rewrite' ),
				'permission_callback' => array( __CLASS__, 'can_edit_posts' ),
				'args'                => array_merge(
					self::common_args(),
					array(
						'content' => self::html_arg( true ),
						'action'  => self::enum_arg( array_keys( AI_CIS_Prompts::rewrite_actions() ), 'improve' ),
					)
				),
			)
		);
		register_rest_route(
			$ns,
			'/generate-field',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'generate_field' ),
				'permission_callback' => array( __CLASS__, 'can_edit_optional_post' ),
				'args'                => array_merge(
					self::common_args(),
					array(
						'field'    => self::enum_arg( array( 'title', 'excerpt', 'seo_title', 'meta_description', 'keywords' ), 'title' ),
						'title'    => self::string_arg(),
						'content'  => self::html_arg(),
						'keywords' => self::string_arg(),
						'post_id'  => self::id_arg( false ),
					)
				),
			)
		);
		register_rest_route(
			$ns,
			'/create-draft',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'create_draft' ),
				'permission_callback' => array( __CLASS__, 'can_edit_posts' ),
				'args'                => array(
					'title'            => self::string_arg(),
					'content'          => self::html_arg( true ),
					'excerpt'          => self::string_arg( true ),
					'post_type'        => self::enum_arg( array( 'post', 'page' ), 'post' ),
					'seo_title'        => self::string_arg(),
					'meta_description' => self::string_arg( true ),
					'focus_keyword'    => self::string_arg(),
				),
			)
		);

		// Existing content (rewriter + SEO assistant).
		register_rest_route(
			$ns,
			'/items',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'list_items' ),
				'permission_callback' => array( __CLASS__, 'can_edit_posts' ),
				'args'                => array(
					'type'   => self::enum_arg( array( 'any', 'post', 'page', 'product' ), 'any' ),
					'search' => self::string_arg(),
					'page'   => array(
						'type'              => 'integer',
						'default'           => 1,
						'minimum'           => 1,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);
		register_rest_route(
			$ns,
			'/items/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_item' ),
					'permission_callback' => array( __CLASS__, 'can_edit_route_post' ),
					'args'                => array( 'id' => self::id_arg() ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'update_item' ),
					'permission_callback' => array( __CLASS__, 'can_edit_route_post' ),
					'args'                => array(
						'id'    => self::id_arg(),
						'field' => self::enum_arg( array( 'content', 'title', 'excerpt' ), 'content' ),
						'value' => self::html_arg( true ),
						'mode'  => self::enum_arg( array( 'replace', 'append' ), 'replace' ),
					),
				),
			)
		);

		// SEO.
		register_rest_route(
			$ns,
			'/seo/status',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'seo_status' ),
				'permission_callback' => array( __CLASS__, 'can_edit_posts' ),
			)
		);
		register_rest_route(
			$ns,
			'/seo/generate',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'seo_generate' ),
				'permission_callback' => array( __CLASS__, 'can_edit_optional_post' ),
				'args'                => array_merge(
					self::common_args(),
					array(
						'post_id' => self::id_arg( false ),
						'title'   => self::string_arg(),
						'content' => self::html_arg(),
						'keyword' => self::string_arg(),
					)
				),
			)
		);
		register_rest_route(
			$ns,
			'/seo/analyze',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'seo_analyze' ),
				'permission_callback' => array( __CLASS__, 'can_edit_optional_post' ),
				'args'                => array_merge(
					self::common_args(),
					array(
						'post_id' => self::id_arg( false ),
						'title'   => self::string_arg(),
						'content' => self::html_arg(),
						'keyword' => self::string_arg(),
					)
				),
			)
		);
		register_rest_route(
			$ns,
			'/seo/save',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'seo_save' ),
				'permission_callback' => array( __CLASS__, 'can_edit_body_post' ),
				'args'                => array(
					'post_id'          => self::id_arg(),
					'seo_title'        => self::string_arg(),
					'meta_description' => self::string_arg( true ),
					'focus_keyword'    => self::string_arg(),
				),
			)
		);

		// Image AI.
		register_rest_route(
			$ns,
			'/generate-image-metadata',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'generate_image_metadata' ),
				'permission_callback' => array( __CLASS__, 'can_edit_attachment' ),
				'args'                => array_merge(
					self::common_args(),
					array(
						'attachment_id' => self::id_arg(),
						'fields'        => self::fields_arg(),
						'image_type'    => self::enum_arg( array( 'informative', 'decorative', 'unsure' ), 'informative' ),
						'style'         => self::enum_arg( array( 'balanced', 'accessibility', 'seo' ), (string) AI_CIS_Settings::get( 'alt_text_style', 'balanced' ) ),
					)
				),
			)
		);
		register_rest_route(
			$ns,
			'/apply-image-metadata',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'apply_image_metadata' ),
				'permission_callback' => array( __CLASS__, 'can_edit_attachment' ),
				'args'                => array(
					'attachment_id' => self::id_arg(),
					'fields'        => self::fields_arg(),
					'values'        => array(
						'type'     => 'object',
						'required' => true,
					),
					'overwrite'     => array(
						'type'    => 'boolean',
						'default' => false,
					),
					'image_type'    => self::enum_arg( array( 'informative', 'decorative', 'unsure' ), 'informative' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/images',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'list_images' ),
				'permission_callback' => array( __CLASS__, 'can_upload' ),
				'args'                => array(
					'filter'   => self::enum_arg( array( 'all', 'missing_alt', 'missing_metadata', 'recent', 'woocommerce', 'post_images', 'failed' ), 'all' ),
					'search'   => self::string_arg(),
					'page'     => array(
						'type'              => 'integer',
						'default'           => 1,
						'minimum'           => 1,
						'sanitize_callback' => 'absint',
					),
					'per_page' => array(
						'type'              => 'integer',
						'default'           => 20,
						'minimum'           => 1,
						'maximum'           => 100,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);
		register_rest_route(
			$ns,
			'/images/stats',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'image_stats' ),
				'permission_callback' => array( __CLASS__, 'can_upload' ),
			)
		);
		register_rest_route(
			$ns,
			'/images/(?P<id>\d+)',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'get_image' ),
				'permission_callback' => array( __CLASS__, 'can_edit_route_post' ),
				'args'                => array( 'id' => self::id_arg() ),
			)
		);

		// Bulk queue.
		register_rest_route(
			$ns,
			'/bulk/start',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'bulk_start' ),
				'permission_callback' => array( __CLASS__, 'can_bulk' ),
				'args'                => array(
					'ids'       => array(
						'type'    => 'array',
						'items'   => array( 'type' => 'integer' ),
						'default' => array(),
					),
					'filter'    => self::string_arg(),
					'fields'    => self::fields_arg(),
					'overwrite' => array(
						'type'    => 'boolean',
						'default' => false,
					),
				),
			)
		);
		register_rest_route(
			$ns,
			'/bulk/status',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'bulk_status' ),
				'permission_callback' => array( __CLASS__, 'can_bulk' ),
			)
		);
		register_rest_route(
			$ns,
			'/bulk/step',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'bulk_step' ),
				'permission_callback' => array( __CLASS__, 'can_bulk' ),
			)
		);
		register_rest_route(
			$ns,
			'/bulk/(?P<action>pause|resume|cancel)',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'bulk_control' ),
				'permission_callback' => array( __CLASS__, 'can_bulk' ),
			)
		);

		// WooCommerce.
		register_rest_route(
			$ns,
			'/products',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'list_products' ),
				'permission_callback' => array( __CLASS__, 'can_edit_products' ),
				'args'                => array(
					'search' => self::string_arg(),
					'page'   => array(
						'type'              => 'integer',
						'default'           => 1,
						'minimum'           => 1,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);
		register_rest_route(
			$ns,
			'/generate-product-content',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'generate_product_content' ),
				'permission_callback' => array( __CLASS__, 'can_edit_body_product' ),
				'args'                => array_merge(
					self::common_args(),
					array(
						'product_id' => self::id_arg(),
						'field'      => self::enum_arg( array_keys( AI_CIS_WooCommerce::fields() ), 'description' ),
						'tone'       => self::enum_arg( array_keys( AI_CIS_Prompts::tones() ), 'professional' ),
						'overrides'  => array(
							'type'    => 'object',
							'default' => array(),
						),
					)
				),
			)
		);
		register_rest_route(
			$ns,
			'/apply-product-content',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'apply_product_content' ),
				'permission_callback' => array( __CLASS__, 'can_edit_body_product' ),
				'args'                => array(
					'product_id' => self::id_arg(),
					'field'      => self::enum_arg( array_keys( AI_CIS_WooCommerce::fields() ), 'description' ),
					'value'      => array( 'required' => true ),
					'mode'       => self::enum_arg( array( 'append', 'replace' ), 'append' ),
				),
			)
		);
		register_rest_route(
			$ns,
			'/review-summary',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'review_summary' ),
				'permission_callback' => array( __CLASS__, 'can_edit_body_product' ),
				'args'                => array_merge( self::common_args(), array( 'product_id' => self::id_arg() ) ),
			)
		);
		register_rest_route(
			$ns,
			'/review-summary/(?P<product_id>\d+)',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'review_summary_get' ),
				'permission_callback' => array( __CLASS__, 'can_edit_body_product' ),
				'args'                => array( 'product_id' => self::id_arg() ),
			)
		);
		register_rest_route(
			$ns,
			'/review-summary/save',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( __CLASS__, 'review_summary_save' ),
				'permission_callback' => array( __CLASS__, 'can_edit_body_product' ),
				'args'                => array(
					'product_id'   => self::id_arg(),
					'summary'      => self::string_arg( true ),
					'pros'         => array(
						'type'    => 'array',
						'items'   => array( 'type' => 'string' ),
						'default' => array(),
					),
					'cons'         => array(
						'type'    => 'array',
						'items'   => array( 'type' => 'string' ),
						'default' => array(),
					),
					'review_count' => array(
						'type'    => 'integer',
						'default' => 0,
					),
				),
			)
		);
	}

	// Permission callbacks.

	/**
	 * Settings and administration.
	 *
	 * @return bool
	 */
	public static function can_manage() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Content generation.
	 *
	 * @return bool
	 */
	public static function can_edit_posts() {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Media access.
	 *
	 * @return bool
	 */
	public static function can_upload() {
		return current_user_can( 'upload_files' );
	}

	/**
	 * Bulk jobs.
	 *
	 * @return bool
	 */
	public static function can_bulk() {
		return current_user_can( 'upload_files' ) && current_user_can( self::bulk_capability() );
	}

	/**
	 * Product list access.
	 *
	 * @return bool
	 */
	public static function can_edit_products() {
		return AI_CIS_WooCommerce::is_active() ? current_user_can( 'edit_products' ) : current_user_can( 'edit_posts' );
	}

	/**
	 * Edit access to the post in the route (/items/{id}).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return bool
	 */
	public static function can_edit_route_post( $request ) {
		$id = absint( $request['id'] );
		return $id > 0 && get_post( $id ) && current_user_can( 'edit_post', $id );
	}

	/**
	 * Edit access to post_id in the body.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return bool
	 */
	public static function can_edit_body_post( $request ) {
		$id = absint( $request['post_id'] );
		return $id > 0 && get_post( $id ) && current_user_can( 'edit_post', $id );
	}

	/**
	 * Edit access to an optional post_id (falls back to edit_posts).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return bool
	 */
	public static function can_edit_optional_post( $request ) {
		$id = absint( $request['post_id'] );
		if ( $id > 0 ) {
			return get_post( $id ) && current_user_can( 'edit_post', $id );
		}
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Edit access to an attachment.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return bool
	 */
	public static function can_edit_attachment( $request ) {
		$id = absint( $request['attachment_id'] );
		return current_user_can( 'upload_files' ) && $id > 0 && 'attachment' === get_post_type( $id ) && current_user_can( 'edit_post', $id );
	}

	/**
	 * Edit access to product_id. Falls back to edit_posts when WooCommerce is
	 * inactive so the callback can return a clear "WooCommerce inactive" error.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return bool
	 */
	public static function can_edit_body_product( $request ) {
		if ( ! AI_CIS_WooCommerce::is_active() ) {
			return current_user_can( 'edit_posts' );
		}
		$id = absint( $request['product_id'] );
		return $id > 0 && 'product' === get_post_type( $id ) && current_user_can( 'edit_post', $id );
	}

	/**
	 * Validates a non-empty string.
	 *
	 * @param mixed $value Value.
	 * @return bool|WP_Error
	 */
	public static function validate_non_empty( $value ) {
		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return new WP_Error( 'rest_invalid_param', __( 'This field is required.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}
		return true;
	}

	// Callbacks.

	/**
	 * GET /usage.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_usage() {
		$report                   = AI_CIS_Usage_Manager::get_report();
		$report['auto_queue']     = AI_CIS_Queue::auto_queue_count();
		$report['auto_limit_hit'] = AI_CIS_Queue::auto_limit_hit();
		$report['provider_ready'] = AI_CIS_AI_Manager::is_ready();
		return rest_ensure_response( $report );
	}

	/**
	 * POST /usage/reset.
	 *
	 * @return WP_REST_Response
	 */
	public static function reset_usage() {
		AI_CIS_Usage_Manager::reset_current();
		delete_option( AI_CIS_Queue::LIMIT_OPTION );
		return self::get_usage();
	}

	/**
	 * GET /settings.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_settings() {
		return rest_ensure_response(
			array(
				'settings' => AI_CIS_Settings::get_public(),
				'status'   => AI_CIS_AI_Manager::get_status(),
			)
		);
	}

	/**
	 * POST /settings.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function update_settings( $request ) {
		$input = $request->get_param( 'settings' );
		AI_CIS_Settings::update( is_array( $input ) ? $input : array() );
		return self::get_settings();
	}

	/**
	 * POST /onboarding.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function complete_onboarding( $request ) {
		$input = $request->get_param( 'skip' ) ? array() : (array) $request->get_param( 'settings' );

		$input['onboarding_complete'] = true;
		AI_CIS_Settings::update( $input );
		return self::get_settings();
	}

	/**
	 * POST /provider/test. Does not count toward usage.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function test_provider( $request ) {
		$provider = AI_CIS_AI_Manager::get_provider( (string) $request->get_param( 'provider' ) );
		if ( ! $provider || ! $provider->is_available() ) {
			return AI_CIS_AI_Manager::error( 'ai_cis_no_provider' );
		}

		$models = AI_CIS_Settings::get( 'provider_models', array() );
		$result = $provider->generate(
			'Reply with the single word: OK',
			array(
				'max_tokens'  => 50,
				'temperature' => 0,
				'model'       => isset( $models[ $provider->get_id() ] ) ? $models[ $provider->get_id() ] : 'auto',
				'timeout'     => 30,
			)
		);

		if ( is_wp_error( $result ) ) {
			return AI_CIS_AI_Manager::error( $result->get_error_code(), $result->get_error_data() );
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'message' => __( 'Connection successful. The AI provider responded.', 'wbd-content-image-seo-assistant' ),
				'reply'   => substr( sanitize_text_field( $result ), 0, 100 ),
			)
		);
	}

	/**
	 * POST /provider/models.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function refresh_models( $request ) {
		$provider = AI_CIS_AI_Manager::get_provider( (string) $request->get_param( 'provider' ) );
		if ( ! $provider instanceof AI_CIS_Provider_Base ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'This provider does not support model listing.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}
		$models = $provider->refresh_models();
		if ( is_wp_error( $models ) ) {
			return 'ai_cis_no_provider' === $models->get_error_code()
				? new WP_Error( 'ai_cis_no_provider', $models->get_error_message(), array( 'status' => 400 ) )
				: AI_CIS_AI_Manager::error( $models->get_error_code(), $models->get_error_data() );
		}
		return rest_ensure_response( array( 'models' => $models ) );
	}

	/**
	 * POST /generate-content.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function generate_content( $request ) {
		$result = AI_CIS_Content_Generator::generate(
			array(
				'topic'        => $request->get_param( 'topic' ),
				'content_type' => $request->get_param( 'content_type' ),
				'tone'         => $request->get_param( 'tone' ),
				'length'       => $request->get_param( 'length' ),
				'language'     => $request->get_param( 'language' ),
				'keywords'     => $request->get_param( 'keywords' ),
				'instructions' => $request->get_param( 'instructions' ),
				'post_type'    => $request->get_param( 'post_type' ),
				'request_id'   => $request->get_param( 'request_id' ),
			)
		);
		return rest_ensure_response( $result );
	}

	/**
	 * POST /rewrite.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rewrite( $request ) {
		return rest_ensure_response(
			AI_CIS_Content_Generator::rewrite(
				(string) $request->get_param( 'content' ),
				(string) $request->get_param( 'action' ),
				(string) $request->get_param( 'language' ),
				(string) $request->get_param( 'request_id' )
			)
		);
	}

	/**
	 * POST /generate-field.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function generate_field( $request ) {
		$context = array(
			'title'    => $request->get_param( 'title' ),
			'content'  => $request->get_param( 'content' ),
			'keywords' => $request->get_param( 'keywords' ),
		);

		$post_id = absint( $request->get_param( 'post_id' ) );
		if ( $post_id && '' === trim( (string) $context['content'] ) ) {
			$post               = get_post( $post_id );
			$context['content'] = $post ? $post->post_content : '';
			$context['title']   = '' === $context['title'] && $post ? $post->post_title : $context['title'];
		}

		return rest_ensure_response(
			AI_CIS_Content_Generator::field(
				(string) $request->get_param( 'field' ),
				$context,
				(string) $request->get_param( 'language' ),
				(string) $request->get_param( 'request_id' )
			)
		);
	}

	/**
	 * POST /create-draft.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_draft( $request ) {
		return rest_ensure_response(
			AI_CIS_Content_Generator::create_draft(
				array(
					'title'            => $request->get_param( 'title' ),
					'content'          => $request->get_param( 'content' ),
					'excerpt'          => $request->get_param( 'excerpt' ),
					'post_type'        => $request->get_param( 'post_type' ),
					'seo_title'        => $request->get_param( 'seo_title' ),
					'meta_description' => $request->get_param( 'meta_description' ),
					'focus_keyword'    => $request->get_param( 'focus_keyword' ),
				)
			)
		);
	}

	/**
	 * GET /items.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function list_items( $request ) {
		$type  = (string) $request->get_param( 'type' );
		$types = array( 'post', 'page' );
		if ( AI_CIS_WooCommerce::is_active() ) {
			$types[] = 'product';
		}
		$post_types = 'any' === $type ? $types : array_intersect( $types, array( $type ) );

		$query = new WP_Query(
			array(
				'post_type'      => $post_types ? array_values( $post_types ) : array( 'post' ),
				'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
				'posts_per_page' => 20,
				'paged'          => max( 1, (int) $request->get_param( 'page' ) ),
				's'              => (string) $request->get_param( 'search' ),
				'orderby'        => 'modified',
				'order'          => 'DESC',
				'perm'           => 'editable',
			)
		);

		$items = array();
		foreach ( $query->posts as $post ) {
			if ( ! current_user_can( 'edit_post', $post->ID ) ) {
				continue;
			}
			$items[] = array(
				'id'       => $post->ID,
				'title'    => '' !== $post->post_title ? $post->post_title : __( '(no title)', 'wbd-content-image-seo-assistant' ),
				'type'     => $post->post_type,
				'status'   => $post->post_status,
				'modified' => $post->post_modified,
				'seo'      => AI_CIS_SEO_Integration::get( $post->ID ),
			);
		}

		return rest_ensure_response(
			array(
				'items'       => $items,
				'total'       => (int) $query->found_posts,
				'total_pages' => (int) $query->max_num_pages,
			)
		);
	}

	/**
	 * GET /items/{id}.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function get_item( $request ) {
		$post = get_post( absint( $request['id'] ) );
		return rest_ensure_response(
			array(
				'id'        => $post->ID,
				'title'     => $post->post_title,
				'content'   => $post->post_content,
				'excerpt'   => $post->post_excerpt,
				'type'      => $post->post_type,
				'status'    => $post->post_status,
				'link'      => get_permalink( $post ),
				'edit_link' => html_entity_decode( (string) get_edit_post_link( $post->ID, 'raw' ) ),
				'seo'       => AI_CIS_SEO_Integration::get( $post->ID ),
				'images'    => AI_CIS_SEO_Integration::image_report( $post->ID ),
			)
		);
	}

	/**
	 * POST /items/{id}: saves a confirmed AI result into the post.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_item( $request ) {
		$post  = get_post( absint( $request['id'] ) );
		$field = (string) $request->get_param( 'field' );
		$value = (string) $request->get_param( 'value' );
		$data  = array( 'ID' => $post->ID );

		switch ( $field ) {
			case 'title':
				$data['post_title'] = sanitize_text_field( $value );
				break;
			case 'excerpt':
				$data['post_excerpt'] = sanitize_textarea_field( $value );
				break;
			default:
				$data['post_content'] = 'append' === $request->get_param( 'mode' ) ? $post->post_content . "\n\n" . $value : $value;
		}

		$result = wp_update_post( wp_slash( $data ), true );
		if ( is_wp_error( $result ) ) {
			return new WP_Error( 'ai_cis_save_failed', __( 'The content could not be saved.', 'wbd-content-image-seo-assistant' ), array( 'status' => 500 ) );
		}

		return rest_ensure_response( array( 'saved' => true ) );
	}

	/**
	 * GET /seo/status.
	 *
	 * @return WP_REST_Response
	 */
	public static function seo_status() {
		return rest_ensure_response(
			array(
				'plugin' => AI_CIS_SEO_Integration::detect(),
				'label'  => AI_CIS_SEO_Integration::label(),
			)
		);
	}

	/**
	 * Builds SEO context from a request.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return array
	 */
	private static function seo_context( $request ) {
		$post_id = absint( $request->get_param( 'post_id' ) );
		$context = array(
			'title'   => (string) $request->get_param( 'title' ),
			'content' => (string) $request->get_param( 'content' ),
			'keyword' => (string) $request->get_param( 'keyword' ),
			'type'    => 'post',
		);
		if ( $post_id ) {
			$post = get_post( $post_id );
			if ( $post ) {
				$context['type']    = $post->post_type;
				$context['title']   = '' !== $context['title'] ? $context['title'] : $post->post_title;
				$context['content'] = '' !== $context['content'] ? $context['content'] : $post->post_content;
				if ( 'product' === $post->post_type && '' !== $post->post_excerpt ) {
					$context['content'] .= "\n\n" . $post->post_excerpt;
				}
				if ( '' === $context['keyword'] ) {
					$seo                = AI_CIS_SEO_Integration::get( $post_id );
					$context['keyword'] = $seo['focus_keyword'];
				}
			}
		}
		return $context;
	}

	/**
	 * POST /seo/generate.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function seo_generate( $request ) {
		return rest_ensure_response(
			AI_CIS_SEO_Integration::generate(
				self::seo_context( $request ),
				(string) $request->get_param( 'language' ),
				(string) $request->get_param( 'request_id' )
			)
		);
	}

	/**
	 * POST /seo/analyze.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function seo_analyze( $request ) {
		return rest_ensure_response(
			AI_CIS_SEO_Integration::analyze(
				self::seo_context( $request ),
				(string) $request->get_param( 'language' ),
				(string) $request->get_param( 'request_id' )
			)
		);
	}

	/**
	 * POST /seo/save.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function seo_save( $request ) {
		$post_id = absint( $request->get_param( 'post_id' ) );
		AI_CIS_SEO_Integration::save(
			$post_id,
			array(
				'seo_title'        => $request->get_param( 'seo_title' ),
				'meta_description' => $request->get_param( 'meta_description' ),
				'focus_keyword'    => $request->get_param( 'focus_keyword' ),
			)
		);
		return rest_ensure_response(
			array(
				'saved'  => true,
				'target' => AI_CIS_SEO_Integration::label(),
				'seo'    => AI_CIS_SEO_Integration::get( $post_id ),
			)
		);
	}

	/**
	 * POST /generate-image-metadata.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function generate_image_metadata( $request ) {
		$id     = absint( $request->get_param( 'attachment_id' ) );
		$result = AI_CIS_Image_Optimizer::generate(
			$id,
			array(
				'fields'     => $request->get_param( 'fields' ),
				'image_type' => $request->get_param( 'image_type' ),
				'style'      => $request->get_param( 'style' ),
				'language'   => $request->get_param( 'language' ),
				'request_id' => $request->get_param( 'request_id' ),
			)
		);
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		$result['current'] = AI_CIS_Image_Optimizer::get_current( $id );
		return rest_ensure_response( $result );
	}

	/**
	 * POST /apply-image-metadata.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function apply_image_metadata( $request ) {
		$id = absint( $request->get_param( 'attachment_id' ) );
		if ( ! AI_CIS_Image_Optimizer::is_image( $id ) ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'This file is not an image.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}

		$raw    = (array) $request->get_param( 'values' );
		$values = array();
		foreach ( array_keys( AI_CIS_Image_Optimizer::fields() ) as $field ) {
			if ( isset( $raw[ $field ] ) && is_scalar( $raw[ $field ] ) ) {
				$values[ $field ] = sanitize_textarea_field( (string) $raw[ $field ] );
			}
		}

		return rest_ensure_response(
			AI_CIS_Image_Optimizer::apply(
				$id,
				$values,
				$request->get_param( 'fields' ),
				(bool) $request->get_param( 'overwrite' ),
				(string) $request->get_param( 'image_type' )
			)
		);
	}

	/**
	 * GET /images.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function list_images( $request ) {
		return rest_ensure_response(
			AI_CIS_Image_Optimizer::query(
				(string) $request->get_param( 'filter' ),
				(int) $request->get_param( 'page' ),
				(int) $request->get_param( 'per_page' ),
				(string) $request->get_param( 'search' )
			)
		);
	}

	/**
	 * GET /images/stats.
	 *
	 * @return WP_REST_Response
	 */
	public static function image_stats() {
		return rest_ensure_response( AI_CIS_Image_Optimizer::stats() );
	}

	/**
	 * GET /images/{id}.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_image( $request ) {
		$id = absint( $request['id'] );
		if ( ! AI_CIS_Image_Optimizer::is_image( $id ) ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'This file is not an image.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}
		return rest_ensure_response( AI_CIS_Image_Optimizer::item( $id ) );
	}

	/**
	 * POST /bulk/start.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function bulk_start( $request ) {
		$ids    = array_map( 'absint', (array) $request->get_param( 'ids' ) );
		$filter = sanitize_key( (string) $request->get_param( 'filter' ) );

		if ( empty( $ids ) && '' !== $filter ) {
			$ids = AI_CIS_Image_Optimizer::query_ids( $filter );
		}

		return rest_ensure_response(
			AI_CIS_Queue::start( $ids, $request->get_param( 'fields' ), (bool) $request->get_param( 'overwrite' ) )
		);
	}

	/**
	 * GET /bulk/status.
	 *
	 * @return WP_REST_Response
	 */
	public static function bulk_status() {
		return rest_ensure_response( AI_CIS_Queue::status() );
	}

	/**
	 * POST /bulk/step: advances the queue while the admin page is open.
	 *
	 * @return WP_REST_Response
	 */
	public static function bulk_step() {
		return rest_ensure_response( AI_CIS_Queue::process_bulk( false ) );
	}

	/**
	 * POST /bulk/{pause|resume|cancel}.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function bulk_control( $request ) {
		return rest_ensure_response( AI_CIS_Queue::control( (string) $request['action'] ) );
	}

	/**
	 * Error when WooCommerce is missing.
	 *
	 * @return WP_Error
	 */
	private static function woocommerce_inactive() {
		return new WP_Error( 'ai_cis_woocommerce_inactive', __( 'WooCommerce is not active. Install and activate WooCommerce to use product features.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
	}

	/**
	 * GET /products.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function list_products( $request ) {
		if ( ! AI_CIS_WooCommerce::is_active() ) {
			return self::woocommerce_inactive();
		}
		return rest_ensure_response( AI_CIS_WooCommerce::list_products( (string) $request->get_param( 'search' ), (int) $request->get_param( 'page' ) ) );
	}

	/**
	 * POST /generate-product-content.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function generate_product_content( $request ) {
		if ( ! AI_CIS_WooCommerce::is_active() ) {
			return self::woocommerce_inactive();
		}

		$overrides = array();
		foreach ( (array) $request->get_param( 'overrides' ) as $key => $value ) {
			if ( in_array( $key, array( 'name', 'description', 'short_description' ), true ) && is_string( $value ) ) {
				$overrides[ $key ] = 'name' === $key ? sanitize_text_field( $value ) : wp_kses_post( $value );
			}
		}

		return rest_ensure_response(
			AI_CIS_WooCommerce::generate(
				absint( $request->get_param( 'product_id' ) ),
				(string) $request->get_param( 'field' ),
				array(
					'tone'       => $request->get_param( 'tone' ),
					'language'   => $request->get_param( 'language' ),
					'request_id' => $request->get_param( 'request_id' ),
					'overrides'  => $overrides,
				)
			)
		);
	}

	/**
	 * POST /apply-product-content.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function apply_product_content( $request ) {
		if ( ! AI_CIS_WooCommerce::is_active() ) {
			return self::woocommerce_inactive();
		}

		$field = (string) $request->get_param( 'field' );
		$raw   = $request->get_param( 'value' );

		if ( 'seo' === $field ) {
			$raw   = is_array( $raw ) ? $raw : array();
			$value = array(
				'seo_title'        => isset( $raw['seo_title'] ) ? sanitize_text_field( $raw['seo_title'] ) : '',
				'meta_description' => isset( $raw['meta_description'] ) ? sanitize_textarea_field( $raw['meta_description'] ) : '',
				'focus_keyword'    => isset( $raw['focus_keyword'] ) ? sanitize_text_field( $raw['focus_keyword'] ) : '',
			);
		} elseif ( in_array( $field, array( 'tags', 'categories' ), true ) ) {
			$value = array_map( 'sanitize_text_field', array_map( 'strval', is_array( $raw ) ? $raw : array( $raw ) ) );
		} elseif ( is_scalar( $raw ) ) {
			$value = 'title' === $field ? sanitize_text_field( (string) $raw ) : wp_kses_post( (string) $raw );
		} else {
			return new WP_Error( 'rest_invalid_param', __( 'Invalid value.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}

		return rest_ensure_response(
			AI_CIS_WooCommerce::apply(
				absint( $request->get_param( 'product_id' ) ),
				$field,
				$value,
				array( 'mode' => $request->get_param( 'mode' ) )
			)
		);
	}

	/**
	 * POST /review-summary.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function review_summary( $request ) {
		if ( ! AI_CIS_WooCommerce::is_active() ) {
			return self::woocommerce_inactive();
		}
		$product_id = absint( $request->get_param( 'product_id' ) );
		$result     = AI_CIS_Review_Summary::generate( $product_id, (string) $request->get_param( 'language' ), (string) $request->get_param( 'request_id' ) );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		$result['saved'] = AI_CIS_Review_Summary::get( $product_id );
		return rest_ensure_response( $result );
	}

	/**
	 * GET /review-summary/{product_id}: stored summary and review count.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function review_summary_get( $request ) {
		if ( ! AI_CIS_WooCommerce::is_active() ) {
			return self::woocommerce_inactive();
		}
		$product_id = absint( $request['product_id'] );
		$product    = wc_get_product( $product_id );
		return rest_ensure_response(
			array(
				'saved'        => AI_CIS_Review_Summary::get( $product_id ),
				'review_count' => $product ? (int) $product->get_review_count() : 0,
				'display'      => (bool) AI_CIS_Settings::get( 'review_summary_display', false ),
			)
		);
	}

	/**
	 * POST /review-summary/save.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function review_summary_save( $request ) {
		if ( ! AI_CIS_WooCommerce::is_active() ) {
			return self::woocommerce_inactive();
		}
		return rest_ensure_response(
			AI_CIS_Review_Summary::save(
				absint( $request->get_param( 'product_id' ) ),
				array(
					'summary'      => $request->get_param( 'summary' ),
					'pros'         => $request->get_param( 'pros' ),
					'cons'         => $request->get_param( 'cons' ),
					'review_count' => $request->get_param( 'review_count' ),
				)
			)
		);
	}
}
