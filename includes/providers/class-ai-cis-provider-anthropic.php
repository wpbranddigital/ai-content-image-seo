<?php
/**
 * Anthropic provider (Messages API).
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Anthropic Claude adapter.
 */
class AI_CIS_Provider_Anthropic extends AI_CIS_Provider_Base {

	/**
	 * Provider slug.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'anthropic';
	}

	/**
	 * Provider label.
	 *
	 * @return string
	 */
	public function get_label() {
		return __( 'Anthropic Claude', 'ai-content-image-seo' );
	}

	/**
	 * API base URL.
	 *
	 * @return string
	 */
	protected function base_url() {
		/**
		 * Filters the Anthropic API base URL.
		 *
		 * @param string $url Base URL without trailing slash.
		 */
		return untrailingslashit( apply_filters( 'ai_cis_anthropic_base_url', 'https://api.anthropic.com/v1' ) );
	}

	/**
	 * Request headers.
	 *
	 * @return array
	 */
	private function headers() {
		return array(
			'x-api-key'         => $this->api_key(),
			'anthropic-version' => '2023-06-01',
		);
	}

	/**
	 * Default model.
	 *
	 * @return string
	 */
	protected function default_model() {
		return 'claude-haiku-4-5';
	}

	/**
	 * Suggested models.
	 *
	 * @return array
	 */
	protected function suggested_models() {
		return array(
			'claude-haiku-4-5'  => 'Claude Haiku 4.5',
			'claude-sonnet-4-5' => 'Claude Sonnet 4.5',
			'claude-opus-4-5'   => 'Claude Opus 4.5',
		);
	}

	/**
	 * Generates text.
	 *
	 * @param string $prompt Prompt.
	 * @param array  $args   Args.
	 * @return string|WP_Error
	 */
	public function generate( $prompt, $args = array() ) {
		if ( ! $this->is_available() ) {
			return new WP_Error( 'ai_cis_no_provider', '' );
		}

		$args    = $this->normalize_args( $args );
		$content = array();

		if ( ! empty( $args['image']['data'] ) ) {
			$content[] = array(
				'type'   => 'image',
				'source' => array(
					'type'       => 'base64',
					'media_type' => $args['image']['mime'],
					'data'       => $args['image']['data'],
				),
			);
		}
		$content[] = array(
			'type' => 'text',
			'text' => $prompt,
		);

		$body = array(
			'model'       => $this->resolve_model( $args ),
			'max_tokens'  => (int) $args['max_tokens'],
			'temperature' => min( 1.0, (float) $args['temperature'] ),
			'messages'    => array(
				array(
					'role'    => 'user',
					'content' => $content,
				),
			),
		);

		if ( '' !== $args['system'] ) {
			$body['system'] = $args['system'];
		}

		$data = $this->request( 'POST', $this->base_url() . '/messages', $this->headers(), $body, $args['timeout'] );

		if ( is_wp_error( $data ) ) {
			return $data;
		}

		if ( empty( $data['content'] ) || ! is_array( $data['content'] ) ) {
			return new WP_Error( 'ai_cis_malformed_response', '', array( 'details' => 'Missing content' ) );
		}

		$text = '';
		foreach ( $data['content'] as $block ) {
			if ( isset( $block['type'], $block['text'] ) && 'text' === $block['type'] ) {
				$text .= $block['text'];
			}
		}

		if ( '' === $text ) {
			return new WP_Error( 'ai_cis_malformed_response', '', array( 'details' => 'Empty text' ) );
		}

		return $text;
	}

	/**
	 * Lists models from the API.
	 *
	 * @return array|WP_Error
	 */
	protected function request_remote_models() {
		$data = $this->request( 'GET', $this->base_url() . '/models?limit=100', $this->headers(), array(), 30 );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		$models = array();
		if ( isset( $data['data'] ) && is_array( $data['data'] ) ) {
			foreach ( $data['data'] as $model ) {
				if ( empty( $model['id'] ) ) {
					continue;
				}
				$id            = sanitize_text_field( $model['id'] );
				$models[ $id ] = isset( $model['display_name'] ) ? sanitize_text_field( $model['display_name'] ) : $id;
			}
		}
		return $models;
	}
}
