<?php
/**
 * Post and page content generation, rewriting and field generation.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Content AI service.
 */
final class AI_CIS_Content_Generator {

	/**
	 * Converts content to compact plain text for prompts.
	 *
	 * @param string $content HTML or block content.
	 * @param int    $max     Maximum characters.
	 * @return string
	 */
	public static function to_plain_text( $content, $max = 8000 ) {
		$content = strip_shortcodes( (string) $content );
		$content = preg_replace( '/<!--(.|\s)*?-->/', '', $content );
		$content = wp_strip_all_tags( $content );
		$content = preg_replace( "/[ \t]+/", ' ', $content );
		$content = preg_replace( "/\n{3,}/", "\n\n", $content );
		$content = trim( html_entity_decode( $content, ENT_QUOTES, get_bloginfo( 'charset' ) ) );
		return function_exists( 'mb_substr' ) ? mb_substr( $content, 0, $max ) : substr( $content, 0, $max );
	}

	/**
	 * Removes code fences and wrapping quotes some models add.
	 *
	 * @param string $text Model output.
	 * @return string
	 */
	public static function clean_output( $text ) {
		$text = trim( (string) $text );
		$text = preg_replace( '/^```[a-zA-Z]*\s*|\s*```$/', '', $text );
		return trim( $text );
	}

	/**
	 * Post-safe HTML from model output: removes script/style/iframe blocks
	 * (including their inner text), then applies wp_kses_post().
	 *
	 * @param string $html HTML.
	 * @return string
	 */
	public static function safe_html( $html ) {
		$html = preg_replace( '#<(script|style|iframe|noscript)\b[^>]*>.*?</\1\s*>#is', '', (string) $html );
		return wp_kses_post( self::clean_output( $html ) );
	}

	/**
	 * Generates a full post or page.
	 *
	 * @param array $args {
	 *     Generation arguments.
	 *
	 *     @type string $topic        Topic (required).
	 *     @type string $content_type Content type key.
	 *     @type string $tone         Tone key.
	 *     @type string $length       Length key.
	 *     @type string $language     Language.
	 *     @type string $keywords     Comma separated keywords.
	 *     @type string $instructions Extra instructions.
	 *     @type string $post_type    post|page.
	 *     @type string $request_id   Idempotency key.
	 * }
	 * @return array|WP_Error
	 */
	public static function generate( $args ) {
		$args = wp_parse_args(
			$args,
			array(
				'topic'        => '',
				'content_type' => 'blog_post',
				'tone'         => AI_CIS_Settings::get( 'default_tone', 'professional' ),
				'length'       => 'medium',
				'language'     => '',
				'keywords'     => '',
				'instructions' => '',
				'post_type'    => 'post',
				'request_id'   => '',
			)
		);

		if ( '' === trim( $args['topic'] ) ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'Please enter a topic.', 'ai-content-image-seo' ), array( 'status' => 400 ) );
		}

		$language  = AI_CIS_Settings::resolve_language( $args['language'] );
		$lengths   = AI_CIS_Prompts::lengths();
		$words     = isset( $lengths[ $args['length'] ]['words'] ) ? (int) $lengths[ $args['length'] ]['words'] : 700;
		$max_token = max( (int) AI_CIS_Settings::get( 'max_tokens', 1500 ), (int) ( $words * 2.2 ) + 600 );

		$result = AI_CIS_AI_Manager::run(
			'content',
			AI_CIS_Prompts::content( $args ),
			array(
				'system'     => AI_CIS_Prompts::system( $language ),
				'json'       => true,
				'max_tokens' => $max_token,
				'request_id' => $args['request_id'],
			)
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$keywords = array();
		if ( isset( $result['keywords'] ) ) {
			$keywords = is_array( $result['keywords'] ) ? $result['keywords'] : explode( ',', (string) $result['keywords'] );
		}

		$output = array(
			'title'            => isset( $result['title'] ) ? sanitize_text_field( $result['title'] ) : '',
			'content'          => isset( $result['content'] ) ? self::safe_html( $result['content'] ) : '',
			'excerpt'          => isset( $result['excerpt'] ) ? sanitize_textarea_field( $result['excerpt'] ) : '',
			'seo_title'        => isset( $result['seo_title'] ) ? sanitize_text_field( $result['seo_title'] ) : '',
			'meta_description' => isset( $result['meta_description'] ) ? sanitize_textarea_field( $result['meta_description'] ) : '',
			'keywords'         => array_values( array_filter( array_map( 'sanitize_text_field', array_map( 'strval', $keywords ) ) ) ),
		);

		if ( '' === $output['content'] ) {
			return AI_CIS_AI_Manager::error( 'ai_cis_malformed_response', array( 'details' => 'Empty content in response' ) );
		}

		return $output;
	}

	/**
	 * Rewrites content. The original is never modified here.
	 *
	 * @param string $content    Content.
	 * @param string $action     Action key.
	 * @param string $language   Language ('' keeps the source language).
	 * @param string $request_id Idempotency key.
	 * @return array|WP_Error
	 */
	public static function rewrite( $content, $action, $language = '', $request_id = '' ) {
		$content = trim( (string) $content );
		if ( '' === $content ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'There is no content to rewrite.', 'ai-content-image-seo' ), array( 'status' => 400 ) );
		}

		$actions = AI_CIS_Prompts::rewrite_actions();
		if ( ! isset( $actions[ $action ] ) ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'Unknown rewrite action.', 'ai-content-image-seo' ), array( 'status' => 400 ) );
		}

		$is_html = wp_strip_all_tags( $content ) !== $content;
		$system  = '' === $language
			? AI_CIS_Prompts::system( 'the same language as the provided text' )
			: AI_CIS_Prompts::system( AI_CIS_Settings::resolve_language( $language ) );

		$approx_tokens = (int) ( strlen( $content ) / 3 );
		$max_tokens    = max( (int) AI_CIS_Settings::get( 'max_tokens', 1500 ), 'expand' === $action ? $approx_tokens * 2 + 500 : $approx_tokens + 500 );

		$result = AI_CIS_AI_Manager::run(
			'content',
			AI_CIS_Prompts::rewrite( $content, $action, $is_html ),
			array(
				'system'     => $system,
				'max_tokens' => min( 16000, $max_tokens ),
				'request_id' => $request_id,
			)
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$result = self::clean_output( $result );

		return array(
			'original' => $content,
			'result'   => $is_html ? self::safe_html( $result ) : sanitize_textarea_field( $result ),
			'is_html'  => $is_html,
			'action'   => $action,
		);
	}

	/**
	 * Generates a single field such as a title or excerpt.
	 *
	 * @param string $field      Field key: title, excerpt, seo_title, meta_description, keywords.
	 * @param array  $context    Context: title, content, keywords.
	 * @param string $language   Language.
	 * @param string $request_id Idempotency key.
	 * @return array|WP_Error Array with 'value' or 'options'.
	 */
	public static function field( $field, $context, $language = '', $request_id = '' ) {
		$allowed = array( 'title', 'excerpt', 'seo_title', 'meta_description', 'keywords' );
		if ( ! in_array( $field, $allowed, true ) ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'Unknown field.', 'ai-content-image-seo' ), array( 'status' => 400 ) );
		}

		$context = array(
			'title'    => isset( $context['title'] ) ? sanitize_text_field( $context['title'] ) : '',
			'content'  => isset( $context['content'] ) ? self::to_plain_text( $context['content'] ) : '',
			'keywords' => isset( $context['keywords'] ) ? sanitize_text_field( $context['keywords'] ) : '',
		);

		if ( '' === $context['content'] && '' === $context['title'] ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'Add a title or some content first.', 'ai-content-image-seo' ), array( 'status' => 400 ) );
		}

		$result = AI_CIS_AI_Manager::run(
			'content',
			AI_CIS_Prompts::field( $field, $context ),
			array(
				'system'     => AI_CIS_Prompts::system( AI_CIS_Settings::resolve_language( $language ) ),
				'json'       => true,
				'max_tokens' => 600,
				'request_id' => $request_id,
			)
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return self::normalize_field_result( $result );
	}

	/**
	 * Normalizes {"value"} / {"options"} responses.
	 *
	 * @param array $result Decoded result.
	 * @return array
	 */
	public static function normalize_field_result( $result ) {
		$output = array();
		if ( isset( $result['options'] ) && is_array( $result['options'] ) ) {
			$output['options'] = array_values( array_filter( array_map( 'sanitize_text_field', array_map( 'strval', $result['options'] ) ) ) );
		}
		if ( isset( $result['value'] ) && is_scalar( $result['value'] ) ) {
			$output['value'] = sanitize_textarea_field( (string) $result['value'] );
		}
		if ( empty( $output ) ) {
			return AI_CIS_AI_Manager::error( 'ai_cis_malformed_response', array( 'details' => 'Missing value/options' ) );
		}
		return $output;
	}

	/**
	 * Creates a draft from generated content (explicit user action).
	 *
	 * @param array $data Data: title, content, excerpt, post_type, seo_title, meta_description, focus_keyword.
	 * @return array|WP_Error
	 */
	public static function create_draft( $data ) {
		$post_type = isset( $data['post_type'] ) && in_array( $data['post_type'], array( 'post', 'page' ), true ) ? $data['post_type'] : 'post';
		$type_obj  = get_post_type_object( $post_type );

		if ( ! $type_obj || ! current_user_can( $type_obj->cap->create_posts ) ) {
			return new WP_Error( 'ai_cis_forbidden', __( 'You are not allowed to create this content.', 'ai-content-image-seo' ), array( 'status' => 403 ) );
		}

		$post_id = wp_insert_post(
			array(
				'post_type'    => $post_type,
				'post_status'  => 'draft',
				'post_title'   => isset( $data['title'] ) ? sanitize_text_field( $data['title'] ) : '',
				'post_content' => isset( $data['content'] ) ? wp_kses_post( $data['content'] ) : '',
				'post_excerpt' => isset( $data['excerpt'] ) ? sanitize_textarea_field( $data['excerpt'] ) : '',
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return new WP_Error( 'ai_cis_save_failed', __( 'The draft could not be created.', 'ai-content-image-seo' ), array( 'status' => 500 ) );
		}

		if ( ! empty( $data['seo_title'] ) || ! empty( $data['meta_description'] ) ) {
			AI_CIS_SEO_Integration::save(
				$post_id,
				array(
					'seo_title'        => isset( $data['seo_title'] ) ? $data['seo_title'] : '',
					'meta_description' => isset( $data['meta_description'] ) ? $data['meta_description'] : '',
					'focus_keyword'    => isset( $data['focus_keyword'] ) ? $data['focus_keyword'] : '',
				)
			);
		}

		return array(
			'post_id'   => $post_id,
			'edit_link' => html_entity_decode( get_edit_post_link( $post_id, 'raw' ) ),
		);
	}
}
