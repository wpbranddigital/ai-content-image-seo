<?php
/**
 * OpenAI provider (Chat Completions API).
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * OpenAI adapter. Also used as the base for OpenAI-compatible APIs.
 */
class AI_CIS_Provider_OpenAI extends AI_CIS_Provider_Base {

	/**
	 * Provider slug.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'openai';
	}

	/**
	 * Provider label.
	 *
	 * @return string
	 */
	public function get_label() {
		return __( 'OpenAI', 'ai-content-image-seo' );
	}

	/**
	 * API base URL.
	 *
	 * @return string
	 */
	protected function base_url() {
		/**
		 * Filters the OpenAI API base URL (useful for Azure/OpenAI-compatible gateways).
		 *
		 * @param string $url Base URL without trailing slash.
		 */
		return untrailingslashit( apply_filters( 'ai_cis_openai_base_url', 'https://api.openai.com/v1' ) );
	}

	/**
	 * Extra request headers.
	 *
	 * @return array
	 */
	protected function extra_headers() {
		return array();
	}

	/**
	 * Default model.
	 *
	 * @return string
	 */
	protected function default_model() {
		return 'gpt-4o-mini';
	}

	/**
	 * Suggested models.
	 *
	 * @return array
	 */
	protected function suggested_models() {
		return array(
			'gpt-4o-mini'  => 'GPT-4o mini',
			'gpt-4o'       => 'GPT-4o',
			'gpt-4.1-mini' => 'GPT-4.1 mini',
			'gpt-4.1'      => 'GPT-4.1',
			'gpt-5-mini'   => 'GPT-5 mini',
			'gpt-5'        => 'GPT-5',
		);
	}

	/**
	 * Whether the API supports response_format json_object.
	 *
	 * @return bool
	 */
	protected function supports_json_mode() {
		return true;
	}

	/**
	 * Whether a model is a reasoning model that rejects custom temperature.
	 *
	 * @param string $model Model ID.
	 * @return bool
	 */
	protected function is_reasoning_model( $model ) {
		$model = strtolower( $model );
		return (bool) preg_match( '/^(o\d|gpt-5)/', $model );
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

		$messages = array();
		if ( '' !== $args['system'] ) {
			$messages[] = array(
				'role'    => 'system',
				'content' => $args['system'],
			);
		}

		if ( ! empty( $args['image']['data'] ) ) {
			$messages[] = array(
				'role'    => 'user',
				'content' => array(
					array(
						'type' => 'text',
						'text' => $prompt,
					),
					array(
						'type'      => 'image_url',
						'image_url' => array(
							'url'    => $this->image_data_uri( $args['image'] ),
							'detail' => 'low',
						),
					),
				),
			);
		} else {
			$messages[] = array(
				'role'    => 'user',
				'content' => $prompt,
			);
		}

		$body = array(
			'model'    => $model,
			'messages' => $messages,
		);

		if ( $this->is_reasoning_model( $model ) ) {
			$body['max_completion_tokens'] = (int) $args['max_tokens'] * 4;
		} else {
			$body['temperature']           = (float) $args['temperature'];
			$body['max_completion_tokens'] = (int) $args['max_tokens'];
		}

		if ( $args['json'] && $this->supports_json_mode() ) {
			$body['response_format'] = array( 'type' => 'json_object' );
		}

		$data = $this->request(
			'POST',
			$this->base_url() . '/chat/completions',
			array_merge( array( 'Authorization' => 'Bearer ' . $this->api_key() ), $this->extra_headers() ),
			$body,
			$args['timeout']
		);

		if ( is_wp_error( $data ) ) {
			return $data;
		}

		if ( ! isset( $data['choices'][0]['message']['content'] ) || ! is_string( $data['choices'][0]['message']['content'] ) ) {
			return new WP_Error( 'ai_cis_malformed_response', '', array( 'details' => 'Missing choices[0].message.content' ) );
		}

		return $data['choices'][0]['message']['content'];
	}

	/**
	 * Lists models from the API.
	 *
	 * @return array|WP_Error
	 */
	protected function request_remote_models() {
		$data = $this->request(
			'GET',
			$this->base_url() . '/models',
			array_merge( array( 'Authorization' => 'Bearer ' . $this->api_key() ), $this->extra_headers() ),
			array(),
			30
		);
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		$models = array();
		if ( isset( $data['data'] ) && is_array( $data['data'] ) ) {
			foreach ( $data['data'] as $model ) {
				if ( empty( $model['id'] ) ) {
					continue;
				}
				$id = sanitize_text_field( $model['id'] );
				if ( $this->is_listable_model( $id ) ) {
					$models[ $id ] = isset( $model['name'] ) ? sanitize_text_field( $model['name'] ) : $id;
				}
			}
		}
		return $models;
	}

	/**
	 * Filters out non-chat models from the remote list.
	 *
	 * @param string $id Model ID.
	 * @return bool
	 */
	protected function is_listable_model( $id ) {
		return (bool) preg_match( '/^(gpt-|o\d|chatgpt)/', $id ) && ! preg_match( '/(audio|realtime|tts|transcribe|image|embedding|search|instruct)/', $id );
	}
}
