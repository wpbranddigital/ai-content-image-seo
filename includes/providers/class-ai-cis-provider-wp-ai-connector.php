<?php
/**
 * WordPress AI Connector adapter (WordPress AI Client, WordPress 7.0+ or the AI plugin).
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Uses the AI provider configured site-wide under Settings → Connectors.
 *
 * Every API used here is feature-detected so the plugin keeps working on
 * WordPress versions that do not ship the AI Client.
 */
class AI_CIS_Provider_WP_AI_Connector implements AI_CIS_Provider_Interface {

	/**
	 * Provider slug.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'wp_ai_connector';
	}

	/**
	 * Provider label.
	 *
	 * @return string
	 */
	public function get_label() {
		return __( 'WordPress AI Connector', 'ai-content-image-seo' );
	}

	/**
	 * Whether the WordPress AI Client API exists on this site.
	 *
	 * @return bool
	 */
	public function api_exists() {
		return function_exists( 'wp_ai_client_prompt' );
	}

	/**
	 * Whether AI is supported and a text-capable connector is configured.
	 *
	 * @return bool
	 */
	public function is_available() {
		if ( ! $this->api_exists() ) {
			return false;
		}
		if ( function_exists( 'wp_supports_ai' ) && ! wp_supports_ai() ) {
			return false;
		}

		try {
			$builder = wp_ai_client_prompt( 'ping' );
			if ( is_object( $builder ) && method_exists( $builder, '__call' ) ) {
				return (bool) $builder->is_supported_for_text_generation();
			}
		} catch ( Throwable $e ) {
			AI_CIS_Logger::log( 'WP AI Connector availability check failed', array( 'error' => $e->getMessage() ) );
			return false;
		}

		return false;
	}

	/**
	 * Models are chosen by the connector itself.
	 *
	 * @return array
	 */
	public function get_models() {
		/** This filter is documented in includes/providers/abstract-ai-cis-provider-base.php */
		return apply_filters(
			'ai_cis_provider_models',
			array( 'auto' => __( 'Auto (connector default)', 'ai-content-image-seo' ) ),
			$this->get_id()
		);
	}

	/**
	 * Generates text through the WordPress AI Client.
	 *
	 * @param string $prompt Prompt.
	 * @param array  $args   Args.
	 * @return string|WP_Error
	 */
	public function generate( $prompt, $args = array() ) {
		if ( ! $this->api_exists() ) {
			return new WP_Error( 'ai_cis_no_provider', '' );
		}

		$args = wp_parse_args(
			$args,
			array(
				'system'      => '',
				'temperature' => 0.7,
				'max_tokens'  => 1500,
				'model'       => 'auto',
				'json'        => false,
				'image'       => null,
			)
		);

		try {
			$builder = wp_ai_client_prompt( $prompt );

			if ( '' !== $args['system'] ) {
				$builder = $builder->using_system_instruction( $args['system'] );
			}
			$builder = $builder->using_temperature( (float) $args['temperature'] );
			$builder = $builder->using_max_tokens( (int) $args['max_tokens'] );

			if ( ! empty( $args['model'] ) && 'auto' !== $args['model'] ) {
				$builder = $builder->using_model_preference( (string) $args['model'] );
			}

			if ( ! empty( $args['image']['data'] ) ) {
				$builder = $builder->with_file( 'data:' . $args['image']['mime'] . ';base64,' . $args['image']['data'], $args['image']['mime'] );
			}

			if ( ! $builder->is_supported_for_text_generation() ) {
				return new WP_Error( 'ai_cis_no_provider', '' );
			}

			$result = $builder->generate_text();
		} catch ( Throwable $e ) {
			AI_CIS_Logger::log( 'WP AI Connector error', array( 'error' => $e->getMessage() ) );
			return new WP_Error( 'ai_cis_provider_error', '', array( 'details' => substr( sanitize_text_field( $e->getMessage() ), 0, 300 ) ) );
		}

		if ( is_wp_error( $result ) ) {
			$details = $result->get_error_message();
			$code    = 'ai_cis_provider_error';
			if ( false !== stripos( $details, 'rate' ) && false !== stripos( $details, 'limit' ) ) {
				$code = 'ai_cis_rate_limit';
			} elseif ( false !== stripos( $details, 'timed out' ) ) {
				$code = 'ai_cis_timeout';
			}
			return new WP_Error( $code, '', array( 'details' => substr( sanitize_text_field( $details ), 0, 300 ) ) );
		}

		if ( ! is_string( $result ) || '' === $result ) {
			return new WP_Error( 'ai_cis_malformed_response', '', array( 'details' => 'Empty text' ) );
		}

		return $result;
	}
}
