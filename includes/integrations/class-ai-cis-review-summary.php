<?php
/**
 * AI review summaries for WooCommerce products.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Summarizes real, approved product reviews. Only review text and star
 * ratings are sent to the AI provider: never names, emails or IP addresses.
 */
final class AI_CIS_Review_Summary {

	const META = '_ai_cis_review_summary';

	/**
	 * Registers frontend hooks (only when display is enabled).
	 *
	 * @return void
	 */
	public static function init() {
		if ( ! AI_CIS_WooCommerce::is_active() ) {
			return;
		}
		add_shortcode( 'ai_cis_review_summary', array( __CLASS__, 'shortcode' ) );
		if ( ! is_admin() && AI_CIS_Settings::get( 'review_summary_display', false ) ) {
			add_filter( 'woocommerce_product_tabs', array( __CLASS__, 'wrap_reviews_tab' ), 98 );
		}
	}

	/**
	 * Collects approved review text and ratings.
	 *
	 * @param int $product_id Product ID.
	 * @return array
	 */
	public static function get_reviews( $product_id ) {
		/**
		 * Filters the maximum number of reviews sent for summarization.
		 *
		 * @param int $max Maximum reviews. Default 60.
		 */
		$max = max( 1, (int) apply_filters( 'ai_cis_review_summary_max_reviews', 60 ) );

		$comments = get_comments(
			array(
				'post_id' => $product_id,
				'status'  => 'approve',
				'type'    => 'review',
				'number'  => $max,
				'orderby' => 'comment_date_gmt',
				'order'   => 'DESC',
			)
		);

		$reviews = array();
		$budget  = 12000;
		foreach ( $comments as $comment ) {
			$text = AI_CIS_Content_Generator::to_plain_text( $comment->comment_content, 600 );
			if ( '' === $text ) {
				continue;
			}
			$budget -= strlen( $text );
			if ( $budget < 0 ) {
				break;
			}
			$reviews[] = array(
				'rating' => (int) get_comment_meta( $comment->comment_ID, 'rating', true ),
				'text'   => $text,
			);
		}
		return $reviews;
	}

	/**
	 * Generates a summary (preview only).
	 *
	 * @param int    $product_id Product ID.
	 * @param string $language   Language.
	 * @param string $request_id Idempotency key.
	 * @return array|WP_Error
	 */
	public static function generate( $product_id, $language = '', $request_id = '' ) {
		if ( ! AI_CIS_WooCommerce::is_active() ) {
			return new WP_Error( 'ai_cis_woocommerce_inactive', __( 'WooCommerce is not active.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'Product not found.', 'wbd-content-image-seo-assistant' ), array( 'status' => 404 ) );
		}

		$reviews = self::get_reviews( $product_id );
		if ( empty( $reviews ) ) {
			return new WP_Error( 'ai_cis_no_reviews', __( 'This product has no approved reviews yet, so there is nothing to summarize.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}

		$result = AI_CIS_AI_Manager::run(
			'review',
			AI_CIS_Prompts::review_summary( $product->get_name(), $reviews ),
			array(
				'system'      => AI_CIS_Prompts::system( AI_CIS_Settings::resolve_language( $language ) ),
				'json'        => true,
				'temperature' => 0.3,
				'max_tokens'  => 800,
				'request_id'  => $request_id,
			)
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$list = static function ( $items ) {
			return is_array( $items ) ? array_values( array_filter( array_map( 'sanitize_text_field', array_map( 'strval', $items ) ) ) ) : array();
		};

		$summary = isset( $result['summary'] ) ? sanitize_textarea_field( $result['summary'] ) : '';
		if ( '' === $summary ) {
			return AI_CIS_AI_Manager::error( 'ai_cis_malformed_response', array( 'details' => 'Missing summary' ) );
		}

		return array(
			'summary'      => $summary,
			'pros'         => $list( isset( $result['pros'] ) ? $result['pros'] : array() ),
			'cons'         => $list( isset( $result['cons'] ) ? $result['cons'] : array() ),
			'review_count' => count( $reviews ),
		);
	}

	/**
	 * Saves a confirmed summary.
	 *
	 * @param int   $product_id Product ID.
	 * @param array $data       summary, pros, cons, review_count.
	 * @return array
	 */
	public static function save( $product_id, $data ) {
		$clean = array(
			'summary'      => isset( $data['summary'] ) ? sanitize_textarea_field( $data['summary'] ) : '',
			'pros'         => isset( $data['pros'] ) ? array_values( array_filter( array_map( 'sanitize_text_field', (array) $data['pros'] ) ) ) : array(),
			'cons'         => isset( $data['cons'] ) ? array_values( array_filter( array_map( 'sanitize_text_field', (array) $data['cons'] ) ) ) : array(),
			'review_count' => isset( $data['review_count'] ) ? absint( $data['review_count'] ) : 0,
			'generated'    => time(),
		);
		update_post_meta( $product_id, self::META, $clean );
		return $clean;
	}

	/**
	 * Returns the stored summary.
	 *
	 * @param int $product_id Product ID.
	 * @return array|null
	 */
	public static function get( $product_id ) {
		$data = get_post_meta( $product_id, self::META, true );
		return is_array( $data ) && ! empty( $data['summary'] ) ? $data : null;
	}

	/**
	 * Renders summary HTML.
	 *
	 * @param int $product_id Product ID.
	 * @return string
	 */
	public static function render( $product_id ) {
		$data = self::get( $product_id );
		if ( ! $data ) {
			return '';
		}

		$html  = '<div class="ai-cis-review-summary">';
		$html .= '<h3>' . esc_html__( 'What customers say', 'wbd-content-image-seo-assistant' ) . '</h3>';
		$html .= '<p>' . esc_html( $data['summary'] ) . '</p>';
		if ( ! empty( $data['pros'] ) ) {
			$html .= '<p><strong>' . esc_html__( 'Pros', 'wbd-content-image-seo-assistant' ) . '</strong></p><ul class="ai-cis-review-pros">';
			foreach ( $data['pros'] as $pro ) {
				$html .= '<li>' . esc_html( $pro ) . '</li>';
			}
			$html .= '</ul>';
		}
		if ( ! empty( $data['cons'] ) ) {
			$html .= '<p><strong>' . esc_html__( 'Cons', 'wbd-content-image-seo-assistant' ) . '</strong></p><ul class="ai-cis-review-cons">';
			foreach ( $data['cons'] as $con ) {
				$html .= '<li>' . esc_html( $con ) . '</li>';
			}
			$html .= '</ul>';
		}
		$html .= '<p class="ai-cis-review-note"><small>' . esc_html__( 'AI-generated summary based on customer reviews.', 'wbd-content-image-seo-assistant' ) . '</small></p>';
		$html .= '</div>';

		return $html;
	}

	/**
	 * Shortcode: [ai_cis_review_summary id="123"].
	 *
	 * @param array $atts Attributes.
	 * @return string
	 */
	public static function shortcode( $atts ) {
		$atts = shortcode_atts( array( 'id' => 0 ), $atts, 'ai_cis_review_summary' );
		$id   = absint( $atts['id'] ) ? absint( $atts['id'] ) : get_the_ID();
		return $id ? self::render( $id ) : '';
	}

	/**
	 * Prepends the summary to the Reviews tab.
	 *
	 * @param array $tabs Product tabs.
	 * @return array
	 */
	public static function wrap_reviews_tab( $tabs ) {
		if ( empty( $tabs['reviews']['callback'] ) ) {
			return $tabs;
		}
		$original                    = $tabs['reviews']['callback'];
		$tabs['reviews']['callback'] = static function ( $key, $tab ) use ( $original ) {
			echo wp_kses_post( self::render( get_the_ID() ) );
			call_user_func( $original, $key, $tab );
		};
		return $tabs;
	}
}
