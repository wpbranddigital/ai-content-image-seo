<?php
/**
 * Shared HTTP handling for API-key based providers.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Base class for remote providers.
 */
abstract class AI_CIS_Provider_Base implements AI_CIS_Provider_Interface {

	/**
	 * Default model used when "auto" is selected.
	 *
	 * @return string
	 */
	abstract protected function default_model();

	/**
	 * Remote models endpoint parser. Returns map of model => label or WP_Error.
	 *
	 * @return array|WP_Error
	 */
	abstract protected function request_remote_models();

	/**
	 * API key for this provider.
	 *
	 * @return string
	 */
	protected function api_key() {
		return AI_CIS_Settings::get_api_key( $this->get_id() );
	}

	/**
	 * Remote providers are available once a key is stored.
	 *
	 * @return bool
	 */
	public function is_available() {
		return '' !== $this->api_key();
	}

	/**
	 * Resolves "auto" and empty model values.
	 *
	 * @param array $args Request args.
	 * @return string
	 */
	protected function resolve_model( $args ) {
		$model = isset( $args['model'] ) ? (string) $args['model'] : 'auto';
		if ( '' === $model || 'auto' === $model ) {
			$model = $this->default_model();
		}

		/**
		 * Filters the model used for a provider request.
		 *
		 * @param string $model    Model ID.
		 * @param string $provider Provider slug.
		 * @param array  $args     Request args.
		 */
		return (string) apply_filters( 'ai_cis_provider_model', $model, $this->get_id(), $args );
	}

	/**
	 * Suggested models, merged with any list refreshed from the provider.
	 *
	 * @return array
	 */
	public function get_models() {
		$models = array( 'auto' => __( 'Auto (recommended)', 'wbd-content-image-seo-assistant' ) );
		$models = array_merge( $models, $this->suggested_models() );

		$remote = get_transient( 'ai_cis_models_' . $this->get_id() );
		if ( is_array( $remote ) ) {
			$models = array_merge( $models, $remote );
		}

		/**
		 * Filters the models listed for a provider.
		 *
		 * @param array  $models   Map of model ID => label.
		 * @param string $provider Provider slug.
		 */
		return apply_filters( 'ai_cis_provider_models', $models, $this->get_id() );
	}

	/**
	 * Built-in model suggestions.
	 *
	 * @return array
	 */
	protected function suggested_models() {
		return array();
	}

	/**
	 * Fetches the list of models from the provider (explicit admin action only).
	 *
	 * @return array|WP_Error
	 */
	public function refresh_models() {
		if ( ! $this->is_available() ) {
			return new WP_Error( 'ai_cis_no_provider', __( 'Add an API key for this provider first.', 'wbd-content-image-seo-assistant' ) );
		}
		$models = $this->request_remote_models();
		if ( is_wp_error( $models ) ) {
			return $models;
		}
		ksort( $models );
		set_transient( 'ai_cis_models_' . $this->get_id(), $models, DAY_IN_SECONDS );
		return $this->get_models();
	}

	/**
	 * Builds a data URI for an image argument.
	 *
	 * @param array $image Image arg.
	 * @return string
	 */
	protected function image_data_uri( $image ) {
		return 'data:' . $image['mime'] . ';base64,' . $image['data'];
	}

	/**
	 * Sends a JSON request and returns the decoded body.
	 *
	 * @param string $method  HTTP method.
	 * @param string $url     Endpoint URL.
	 * @param array  $headers Headers.
	 * @param array  $body    Body to JSON encode (ignored for GET).
	 * @param int    $timeout Timeout in seconds.
	 * @return array|WP_Error
	 */
	protected function request( $method, $url, $headers, $body = array(), $timeout = 60 ) {
		$request_args = array(
			'method'  => $method,
			'timeout' => max( 5, (int) $timeout ),
			'headers' => array_merge(
				array( 'Content-Type' => 'application/json' ),
				$headers
			),
		);

		if ( 'GET' !== $method ) {
			$request_args['body'] = wp_json_encode( $body );
		}

		/**
		 * Filters HTTP request arguments sent to an AI provider.
		 *
		 * @param array  $request_args Arguments for wp_remote_request().
		 * @param string $provider     Provider slug.
		 * @param string $url          Endpoint URL.
		 */
		$request_args = apply_filters( 'ai_cis_provider_request_args', $request_args, $this->get_id(), $url );

		AI_CIS_Logger::log( 'Provider request started', array( 'provider' => $this->get_id() ) );

		$response = wp_remote_request( esc_url_raw( $url ), $request_args );

		if ( is_wp_error( $response ) ) {
			$message = $response->get_error_message();
			AI_CIS_Logger::log(
				'Provider transport error',
				array(
					'provider' => $this->get_id(),
					'error'    => $message,
				)
			);
			if ( false !== stripos( $message, 'timed out' ) || false !== stripos( $message, 'timeout' ) ) {
				return new WP_Error( 'ai_cis_timeout', '', array( 'details' => $message ) );
			}
			return new WP_Error( 'ai_cis_connection_error', '', array( 'details' => $message ) );
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		$raw  = wp_remote_retrieve_body( $response );
		$data = json_decode( $raw, true );

		if ( $code < 200 || $code >= 300 ) {
			$details = $this->extract_error_message( $data, $raw );
			AI_CIS_Logger::log(
				'Provider HTTP error',
				array(
					'provider' => $this->get_id(),
					'status'   => $code,
					'error'    => $details,
				)
			);

			if ( 401 === $code || 403 === $code ) {
				return new WP_Error( 'ai_cis_invalid_key', '', array( 'details' => $details ) );
			}
			if ( 429 === $code ) {
				return new WP_Error( 'ai_cis_rate_limit', '', array( 'details' => $details ) );
			}
			if ( 408 === $code || 504 === $code ) {
				return new WP_Error( 'ai_cis_timeout', '', array( 'details' => $details ) );
			}
			return new WP_Error(
				'ai_cis_provider_error',
				'',
				array(
					'details' => $details,
					'status'  => $code,
				)
			);
		}

		if ( ! is_array( $data ) ) {
			return new WP_Error( 'ai_cis_malformed_response', '', array( 'details' => 'Invalid JSON body' ) );
		}

		return $data;
	}

	/**
	 * Pulls a short error message out of a provider error body.
	 *
	 * @param mixed  $data Decoded body.
	 * @param string $raw  Raw body.
	 * @return string
	 */
	protected function extract_error_message( $data, $raw ) {
		$message = '';
		if ( is_array( $data ) ) {
			if ( isset( $data['error']['message'] ) ) {
				$message = (string) $data['error']['message'];
			} elseif ( isset( $data['error'] ) && is_string( $data['error'] ) ) {
				$message = $data['error'];
			} elseif ( isset( $data['message'] ) ) {
				$message = (string) $data['message'];
			}
		}
		if ( '' === $message ) {
			$message = wp_strip_all_tags( (string) $raw );
		}
		return substr( sanitize_text_field( $message ), 0, 300 );
	}

	/**
	 * Common reading of generation args.
	 *
	 * @param array $args Args.
	 * @return array
	 */
	protected function normalize_args( $args ) {
		return wp_parse_args(
			$args,
			array(
				'system'      => '',
				'temperature' => 0.7,
				'max_tokens'  => 1500,
				'model'       => 'auto',
				'json'        => false,
				'image'       => null,
				'timeout'     => 60,
			)
		);
	}
}
