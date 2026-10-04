<?php
/**
 * Google Gemini provider.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Gemini adapter (Generative Language API).
 */
class AI_CIS_Provider_Gemini extends AI_CIS_Provider_Base {

	/**
	 * Provider slug.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'gemini';
	}

	/**
	 * Provider label.
	 *
	 * @return string
	 */
	public function get_label() {
		return __( 'Google Gemini', 'ai-content-image-seo' );
	}

	/**
	 * API base URL.
	 *
	 * @return string
	 */
	protected function base_url() {
		/**
		 * Filters the Gemini API base URL.
		 *
		 * @param string $url Base URL without trailing slash.
		 */
		return untrailingslashit( apply_filters( 'ai_cis_gemini_base_url', 'https://generativelanguage.googleapis.com/v1beta' ) );
	}

	/**
	 * Default model.
	 *
	 * @return string
	 */
	protected function default_model() {
		return 'gemini-2.5-flash';
	}

	/**
	 * Suggested models.
	 *
	 * @return array
	 */
	protected function suggested_models() {
		return array(
			'gemini-2.5-flash'      => 'Gemini 2.5 Flash',
			'gemini-2.5-flash-lite' => 'Gemini 2.5 Flash-Lite',
			'gemini-2.5-pro'        => 'Gemini 2.5 Pro',
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

		$args  = $this->normalize_args( $args );
		$model = $this->resolve_model( $args );

		$parts = array( array( 'text' => $prompt ) );
		if ( ! empty( $args['image']['data'] ) ) {
			$parts[] = array(
				'inline_data' => array(
					'mime_type' => $args['image']['mime'],
					'data'      => $args['image']['data'],
				),
			);
		}

		$body = array(
			'contents'         => array(
				array(
					'role'  => 'user',
					'parts' => $parts,
				),
			),
			'generationConfig' => array(
				'temperature'     => (float) $args['temperature'],
				// Thinking models spend part of the budget on reasoning, so leave headroom.
				'maxOutputTokens' => (int) $args['max_tokens'] * 3,
			),
		);

		if ( '' !== $args['system'] ) {
			$body['systemInstruction'] = array( 'parts' => array( array( 'text' => $args['system'] ) ) );
		}
		if ( $args['json'] ) {
			$body['generationConfig']['responseMimeType'] = 'application/json';
		}

		$data = $this->request(
			'POST',
			$this->base_url() . '/models/' . rawurlencode( $model ) . ':generateContent',
			array( 'x-goog-api-key' => $this->api_key() ),
			$body,
			$args['timeout']
		);

		if ( is_wp_error( $data ) ) {
			return $data;
		}

		if ( empty( $data['candidates'][0]['content']['parts'] ) || ! is_array( $data['candidates'][0]['content']['parts'] ) ) {
			$reason = isset( $data['promptFeedback']['blockReason'] ) ? (string) $data['promptFeedback']['blockReason'] : 'Missing candidates';
			return new WP_Error( 'ai_cis_malformed_response', '', array( 'details' => $reason ) );
		}

		$text = '';
		foreach ( $data['candidates'][0]['content']['parts'] as $part ) {
			if ( isset( $part['text'] ) && empty( $part['thought'] ) ) {
				$text .= $part['text'];
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
		$data = $this->request( 'GET', $this->base_url() . '/models?pageSize=200', array( 'x-goog-api-key' => $this->api_key() ), array(), 30 );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		$models = array();
		if ( isset( $data['models'] ) && is_array( $data['models'] ) ) {
			foreach ( $data['models'] as $model ) {
				$methods = isset( $model['supportedGenerationMethods'] ) ? (array) $model['supportedGenerationMethods'] : array();
				if ( empty( $model['name'] ) || ! in_array( 'generateContent', $methods, true ) ) {
					continue;
				}
				$id            = sanitize_text_field( preg_replace( '#^models/#', '', $model['name'] ) );
				$models[ $id ] = isset( $model['displayName'] ) ? sanitize_text_field( $model['displayName'] ) : $id;
			}
		}
		return $models;
	}
}
