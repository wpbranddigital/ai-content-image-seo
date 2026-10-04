<?php
/**
 * AI manager: provider selection, usage enforcement and error normalization.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single entry point that features use to talk to AI.
 */
final class AI_CIS_AI_Manager {

	/**
	 * Instantiated providers.
	 *
	 * @var AI_CIS_Provider_Interface[]
	 */
	private static $instances = array();

	/**
	 * Registered provider classes.
	 *
	 * @return array Map of slug => class name.
	 */
	public static function provider_classes() {
		$classes = array(
			'wp_ai_connector' => 'AI_CIS_Provider_WP_AI_Connector',
			'openai'          => 'AI_CIS_Provider_OpenAI',
			'gemini'          => 'AI_CIS_Provider_Gemini',
			'anthropic'       => 'AI_CIS_Provider_Anthropic',
			'openrouter'      => 'AI_CIS_Provider_OpenRouter',
		);

		/**
		 * Filters registered AI providers. Classes must implement AI_CIS_Provider_Interface.
		 *
		 * @param array $classes Map of provider slug => class name.
		 */
		return apply_filters( 'ai_cis_provider_classes', $classes );
	}

	/**
	 * Returns a provider instance.
	 *
	 * @param string $id Provider slug.
	 * @return AI_CIS_Provider_Interface|null
	 */
	public static function get_provider( $id ) {
		if ( isset( self::$instances[ $id ] ) ) {
			return self::$instances[ $id ];
		}
		$classes = self::provider_classes();
		if ( empty( $classes[ $id ] ) || ! class_exists( $classes[ $id ] ) ) {
			return null;
		}
		$instance = new $classes[ $id ]();
		if ( ! $instance instanceof AI_CIS_Provider_Interface ) {
			return null;
		}
		self::$instances[ $id ] = $instance;
		return $instance;
	}

	/**
	 * Returns the configured provider.
	 *
	 * @return AI_CIS_Provider_Interface|null
	 */
	public static function get_active_provider() {
		$id = (string) AI_CIS_Settings::get( 'provider', 'wp_ai_connector' );
		return self::get_provider( $id );
	}

	/**
	 * Whether the configured provider can be used.
	 *
	 * @return bool
	 */
	public static function is_ready() {
		$provider = self::get_active_provider();
		return $provider && $provider->is_available();
	}

	/**
	 * Provider status for the settings UI (no secrets).
	 *
	 * @return array
	 */
	public static function get_status() {
		$providers = array();
		foreach ( array_keys( self::provider_classes() ) as $id ) {
			$provider = self::get_provider( $id );
			if ( ! $provider ) {
				continue;
			}
			$providers[ $id ] = array(
				'id'        => $id,
				'label'     => $provider->get_label(),
				'available' => $provider->is_available(),
				'needs_key' => in_array( $id, AI_CIS_Settings::key_providers(), true ),
				'models'    => $provider->get_models(),
			);
			if ( $provider instanceof AI_CIS_Provider_WP_AI_Connector ) {
				$providers[ $id ]['api_exists'] = $provider->api_exists();
			}
		}

		$active = (string) AI_CIS_Settings::get( 'provider', 'wp_ai_connector' );

		return array(
			'active'    => $active,
			'ready'     => self::is_ready(),
			'providers' => $providers,
		);
	}

	/**
	 * Runs a prompt against the active provider with usage enforcement.
	 *
	 * @param string $usage_type Usage type to check and consume ('' to skip, e.g. connection tests).
	 * @param string $prompt     User prompt.
	 * @param array  $args       Generation args (see AI_CIS_Provider_Interface::generate()) plus:
	 *                           'request_id' => idempotency key for usage counting,
	 *                           'consume'    => false to only check the limit.
	 * @return string|array|WP_Error Text, decoded array when 'json' is true, or error.
	 */
	public static function run( $usage_type, $prompt, $args = array() ) {
		if ( '' !== $usage_type && ! AI_CIS_Usage_Manager::can_use( $usage_type ) ) {
			return self::error( 'ai_cis_limit_reached' );
		}

		$provider = self::get_active_provider();
		if ( ! $provider || ! $provider->is_available() ) {
			return self::error( 'ai_cis_no_provider' );
		}

		$models = AI_CIS_Settings::get( 'provider_models', array() );
		$args   = wp_parse_args(
			$args,
			array(
				'system'      => '',
				'temperature' => (float) AI_CIS_Settings::get( 'temperature', 0.7 ),
				'max_tokens'  => (int) AI_CIS_Settings::get( 'max_tokens', 1500 ),
				'model'       => isset( $models[ $provider->get_id() ] ) ? $models[ $provider->get_id() ] : 'auto',
				'json'        => false,
				'image'       => null,
				'timeout'     => (int) AI_CIS_Settings::get( 'request_timeout', 60 ),
				'request_id'  => '',
				'consume'     => true,
			)
		);

		/**
		 * Filters a prompt right before it is sent to the provider.
		 *
		 * @param string $prompt     Prompt.
		 * @param string $usage_type Usage type.
		 * @param array  $args       Generation args.
		 */
		$prompt = (string) apply_filters( 'ai_cis_before_generate_prompt', $prompt, $usage_type, $args );

		$result = $provider->generate( $prompt, $args );

		if ( is_wp_error( $result ) ) {
			return self::error( $result->get_error_code(), $result->get_error_data() );
		}

		$output = trim( (string) $result );

		if ( $args['json'] ) {
			$output = self::parse_json( $output );
			if ( null === $output ) {
				return self::error( 'ai_cis_malformed_response', array( 'details' => 'Response was not valid JSON' ) );
			}
		}

		if ( '' !== $usage_type && $args['consume'] ) {
			AI_CIS_Usage_Manager::consume( $usage_type, 1, $args['request_id'] );
		}

		AI_CIS_Logger::log( 'Generation completed', array( 'type' => $usage_type ) );

		/**
		 * Filters a generation result.
		 *
		 * @param string|array $output     Result.
		 * @param string       $usage_type Usage type.
		 * @param string       $prompt     Prompt.
		 */
		return apply_filters( 'ai_cis_generation_result', $output, $usage_type, $prompt );
	}

	/**
	 * Extracts a JSON object from model output.
	 *
	 * @param string $text Raw text.
	 * @return array|null
	 */
	public static function parse_json( $text ) {
		$text = trim( (string) $text );
		$text = preg_replace( '/^```(?:json)?\s*|\s*```$/i', '', $text );

		$decoded = json_decode( $text, true );
		if ( is_array( $decoded ) ) {
			return $decoded;
		}

		$start = strpos( $text, '{' );
		$end   = strrpos( $text, '}' );
		if ( false !== $start && false !== $end && $end > $start ) {
			$decoded = json_decode( substr( $text, $start, $end - $start + 1 ), true );
			if ( is_array( $decoded ) ) {
				return $decoded;
			}
		}

		return null;
	}

	/**
	 * Friendly, translatable error messages.
	 *
	 * @param string $code Error code.
	 * @return string
	 */
	public static function friendly_message( $code ) {
		switch ( $code ) {
			case 'ai_cis_no_provider':
				return __( 'No AI provider configured. Connect an AI provider from Settings → AI Provider.', 'ai-content-image-seo' );
			case 'ai_cis_limit_reached':
				return __( 'You have reached your monthly AI limit. Your usage will reset next month.', 'ai-content-image-seo' );
			case 'ai_cis_rate_limit':
				return __( 'Your AI provider rate limit was reached. Please try again later.', 'ai-content-image-seo' );
			case 'ai_cis_invalid_key':
				return __( 'The AI provider rejected the API key. Please check your AI provider settings.', 'ai-content-image-seo' );
			case 'ai_cis_timeout':
				return __( 'The AI provider took too long to respond. Please try again.', 'ai-content-image-seo' );
			case 'ai_cis_connection_error':
				return __( 'Could not connect to the AI provider. Please check your internet connection and try again.', 'ai-content-image-seo' );
			case 'ai_cis_malformed_response':
				return __( 'The AI provider returned an unexpected response. Please try again.', 'ai-content-image-seo' );
			default:
				return __( 'Unable to generate content. Please check your AI provider settings and try again.', 'ai-content-image-seo' );
		}
	}

	/**
	 * Builds a normalized WP_Error with a friendly message and HTTP status.
	 *
	 * @param string $code Error code.
	 * @param mixed  $data Optional data with 'details'.
	 * @return WP_Error
	 */
	public static function error( $code, $data = array() ) {
		$statuses = array(
			'ai_cis_no_provider'        => 400,
			'ai_cis_limit_reached'      => 403,
			'ai_cis_rate_limit'         => 429,
			'ai_cis_invalid_key'        => 401,
			'ai_cis_timeout'            => 504,
			'ai_cis_connection_error'   => 502,
			'ai_cis_malformed_response' => 502,
		);

		$error_data = array( 'status' => isset( $statuses[ $code ] ) ? $statuses[ $code ] : 502 );

		// Technical details help administrators debug; never shown to other roles.
		if ( is_array( $data ) && ! empty( $data['details'] ) && current_user_can( 'manage_options' ) ) {
			$error_data['details'] = substr( sanitize_text_field( (string) $data['details'] ), 0, 300 );
		}

		$known = isset( $statuses[ $code ] ) || 'ai_cis_provider_error' === $code;

		return new WP_Error( $known ? $code : 'ai_cis_provider_error', self::friendly_message( $code ), $error_data );
	}
}
