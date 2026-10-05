<?php
/**
 * Media Library integration.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Adds "Generate AI Metadata" to the attachment details, list row actions and bulk actions.
 */
final class AI_CIS_Media_Library {

	/**
	 * Registers admin hooks.
	 *
	 * @return void
	 */
	public static function init() {
		add_filter( 'attachment_fields_to_edit', array( __CLASS__, 'attachment_field' ), 20, 2 );
		add_filter( 'media_row_actions', array( __CLASS__, 'row_action' ), 10, 2 );
		add_filter( 'bulk_actions-upload', array( __CLASS__, 'register_bulk_action' ) );
		add_filter( 'handle_bulk_actions-upload', array( __CLASS__, 'handle_bulk_action' ), 10, 3 );
		add_action( 'wp_enqueue_media', array( __CLASS__, 'enqueue' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_on_library' ) );
		add_action( 'admin_notices', array( __CLASS__, 'bulk_notice' ) );
	}

	/**
	 * Adds the AI button to attachment details (modal and edit screen).
	 *
	 * @param array   $fields Fields.
	 * @param WP_Post $post   Attachment.
	 * @return array
	 */
	public static function attachment_field( $fields, $post ) {
		if ( ! wp_attachment_is_image( $post->ID ) || ! current_user_can( 'upload_files' ) || ! current_user_can( 'edit_post', $post->ID ) ) {
			return $fields;
		}

		$fields['ai_cis_generate'] = array(
			'label' => __( 'AI Metadata', 'wbd-content-image-seo-assistant' ),
			'input' => 'html',
			'html'  => '<button type="button" class="button ai-cis-media-generate" data-attachment-id="' . esc_attr( (string) $post->ID ) . '">'
				. esc_html__( 'Generate AI Metadata', 'wbd-content-image-seo-assistant' ) . '</button>',
			'helps' => __( 'Generate alt text, title, caption and description. You review everything before it is saved.', 'wbd-content-image-seo-assistant' ),
		);

		return $fields;
	}

	/**
	 * Adds a row action in list mode.
	 *
	 * @param array   $actions Actions.
	 * @param WP_Post $post    Attachment.
	 * @return array
	 */
	public static function row_action( $actions, $post ) {
		if ( wp_attachment_is_image( $post->ID ) && current_user_can( 'edit_post', $post->ID ) ) {
			$url = add_query_arg(
				array(
					'page'       => 'ai-cis-image',
					'attachment' => $post->ID,
				),
				admin_url( 'admin.php' )
			);

			$actions['ai_cis_generate'] = '<a href="' . esc_url( $url ) . '" class="ai-cis-media-generate" data-attachment-id="' . esc_attr( (string) $post->ID ) . '">'
				. esc_html__( 'Generate AI Metadata', 'wbd-content-image-seo-assistant' ) . '</a>';
		}
		return $actions;
	}

	/**
	 * Registers the bulk action.
	 *
	 * @param array $actions Bulk actions.
	 * @return array
	 */
	public static function register_bulk_action( $actions ) {
		if ( current_user_can( AI_CIS_REST_API::bulk_capability() ) ) {
			$actions['ai_cis_optimize'] = __( 'Generate AI metadata (missing fields)', 'wbd-content-image-seo-assistant' );
		}
		return $actions;
	}

	/**
	 * Handles the bulk action. Core verifies the bulk-media nonce before this runs;
	 * it is checked again here for defense in depth.
	 *
	 * @param string $redirect Redirect URL.
	 * @param string $action   Action.
	 * @param int[]  $ids      Attachment IDs.
	 * @return string
	 */
	public static function handle_bulk_action( $redirect, $action, $ids ) {
		if ( 'ai_cis_optimize' !== $action ) {
			return $redirect;
		}
		check_admin_referer( 'bulk-media' );

		if ( ! current_user_can( AI_CIS_REST_API::bulk_capability() ) ) {
			return $redirect;
		}

		$result = AI_CIS_Queue::start( array_map( 'absint', (array) $ids ), AI_CIS_Settings::get( 'image_default_fields', array( 'alt', 'title' ) ), false );

		$args = array( 'page' => 'ai-cis-image' );
		if ( is_wp_error( $result ) ) {
			$args['ai_cis_error'] = rawurlencode( $result->get_error_code() );
		} else {
			$args['tab'] = 'bulk';
		}

		return add_query_arg( $args, admin_url( 'admin.php' ) );
	}

	/**
	 * Enqueues the media integration wherever the media modal is used.
	 *
	 * @return void
	 */
	public static function enqueue() {
		if ( is_admin() && current_user_can( 'upload_files' ) ) {
			AI_CIS_Admin::enqueue_bundle( 'media' );
		}
	}

	/**
	 * Enqueues on the Media Library list screen and attachment edit screen.
	 *
	 * @param string $hook Admin page.
	 * @return void
	 */
	public static function enqueue_on_library( $hook ) {
		if ( 'upload.php' === $hook ) {
			self::enqueue();
			return;
		}
		if ( 'post.php' === $hook ) {
			$screen = get_current_screen();
			if ( $screen && 'attachment' === $screen->post_type ) {
				self::enqueue();
			}
		}
	}

	/**
	 * Displays a notice when the bulk action could not start.
	 *
	 * @return void
	 */
	public static function bulk_notice() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only display of an error code set by our own redirect.
		if ( empty( $_GET['ai_cis_error'] ) || empty( $_GET['page'] ) || 'ai-cis-image' !== $_GET['page'] ) {
			return;
		}
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only display.
		$code    = sanitize_key( wp_unslash( $_GET['ai_cis_error'] ) );
		$message = 'ai_cis_job_exists' === $code
			? __( 'A bulk optimization is already in progress. Resume or cancel it first.', 'wbd-content-image-seo-assistant' )
			: AI_CIS_AI_Manager::friendly_message( $code );
		echo '<div class="notice notice-error is-dismissible"><p>' . esc_html( $message ) . '</p></div>';
	}
}
