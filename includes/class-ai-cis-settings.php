<?php
/**
 * Settings storage, sanitization and secure API key handling.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings repository.
 */
final class AI_CIS_Settings {

	const OPTION   = 'ai_cis_settings';
	const KEYS     = 'ai_cis_api_keys';
	const KEY_HEAD = 'aicis1:';

	/**
	 * Request-level cache of the merged settings.
	 *
	 * @var array|null
	 */
	private static $cache = null;

	/**
	 * Provider slugs that use an API key.
	 *
	 * @return string[]
	 */
	public static function key_providers() {
		return array( 'openai', 'gemini', 'anthropic', 'openrouter' );
	}

	/**
	 * Default settings.
	 *
	 * @return array
	 */
	public static function defaults() {
		$defaults = array(
			'provider'               => 'wp_ai_connector',
			'provider_models'        => array(
				'wp_ai_connector' => 'auto',
				'openai'          => 'auto',
				'gemini'          => 'auto',
				'anthropic'       => 'auto',
				'openrouter'      => 'auto',
			),
			'temperature'            => 0.7,
			'max_tokens'             => 1500,
			'request_timeout'        => 60,
			'default_language'       => 'English',
			'custom_language'        => '',
			'default_tone'           => 'professional',
			'alt_text_style'         => 'balanced',
			'image_send_file'        => true,
			'image_default_fields'   => array( 'alt', 'title' ),
			'auto_optimize'          => false,
			'auto_fields'            => array( 'alt', 'title' ),
			'seo_output_meta'        => true,
			'review_summary_display' => false,
			'custom_prompts'         => array(
				'content' => '',
				'rewrite' => '',
				'image'   => '',
				'product' => '',
				'seo'     => '',
				'review'  => '',
			),
			'limits'                 => array(
				'content'    => 0,
				'image'      => 0,
				'product'    => 0,
				'auto_image' => 0,
				'review'     => 0,
				'bulk_batch' => 0,
			),
			'delete_on_uninstall'    => false,
			'onboarding_complete'    => false,
		);

		/**
		 * Filters the default plugin settings.
		 *
		 * @param array $defaults Default settings.
		 */
		return apply_filters( 'ai_cis_default_settings', $defaults );
	}

	/**
	 * Returns all settings merged with defaults.
	 *
	 * @return array
	 */
	public static function all() {
		if ( null === self::$cache ) {
			$saved = get_option( self::OPTION, array() );
			$saved = is_array( $saved ) ? $saved : array();

			$merged = array_merge( self::defaults(), $saved );
			foreach ( array( 'provider_models', 'custom_prompts', 'limits' ) as $nested ) {
				$default_nested    = self::defaults()[ $nested ];
				$saved_nested      = isset( $saved[ $nested ] ) && is_array( $saved[ $nested ] ) ? $saved[ $nested ] : array();
				$merged[ $nested ] = array_merge( $default_nested, $saved_nested );
			}
			self::$cache = $merged;
		}

		return self::$cache;
	}

	/**
	 * Returns a single setting.
	 *
	 * @param string $key      Setting key.
	 * @param mixed  $fallback Value returned when the key is unknown.
	 * @return mixed
	 */
	public static function get( $key, $fallback = null ) {
		$all = self::all();
		return array_key_exists( $key, $all ) ? $all[ $key ] : $fallback;
	}

	/**
	 * Clears the request cache.
	 *
	 * @return void
	 */
	public static function flush_cache() {
		self::$cache = null;
	}

	/**
	 * Sanitizes and saves a partial settings payload.
	 *
	 * @param array $input Raw input.
	 * @return array Saved settings.
	 */
	public static function update( $input ) {
		$current   = self::all();
		$sanitized = self::sanitize( is_array( $input ) ? $input : array(), $current );

		update_option( self::OPTION, $sanitized, false );
		self::flush_cache();

		if ( isset( $input['api_keys'] ) && is_array( $input['api_keys'] ) ) {
			self::update_api_keys( $input['api_keys'] );
		}

		return self::all();
	}

	/**
	 * Sanitizes a settings payload, keeping current values for missing keys.
	 *
	 * @param array $input   Raw input.
	 * @param array $current Current settings.
	 * @return array
	 */
	public static function sanitize( $input, $current ) {
		$out       = $current;
		$providers = array_keys( AI_CIS_AI_Manager::provider_classes() );

		if ( isset( $input['provider'] ) ) {
			$provider        = sanitize_key( $input['provider'] );
			$out['provider'] = in_array( $provider, $providers, true ) ? $provider : $current['provider'];
		}

		if ( isset( $input['provider_models'] ) && is_array( $input['provider_models'] ) ) {
			foreach ( $input['provider_models'] as $provider => $model ) {
				$provider = sanitize_key( $provider );
				if ( in_array( $provider, $providers, true ) ) {
					$model                               = preg_replace( '/[^A-Za-z0-9._:\/\-@]/', '', (string) $model );
					$out['provider_models'][ $provider ] = '' === $model ? 'auto' : substr( $model, 0, 120 );
				}
			}
		}

		if ( isset( $input['temperature'] ) ) {
			$out['temperature'] = max( 0.0, min( 2.0, round( (float) $input['temperature'], 2 ) ) );
		}
		if ( isset( $input['max_tokens'] ) ) {
			$out['max_tokens'] = max( 64, min( 32000, absint( $input['max_tokens'] ) ) );
		}
		if ( isset( $input['request_timeout'] ) ) {
			$out['request_timeout'] = max( 10, min( 300, absint( $input['request_timeout'] ) ) );
		}

		if ( isset( $input['default_language'] ) ) {
			$out['default_language'] = substr( sanitize_text_field( $input['default_language'] ), 0, 60 );
		}
		if ( isset( $input['custom_language'] ) ) {
			$out['custom_language'] = substr( sanitize_text_field( $input['custom_language'] ), 0, 60 );
		}
		if ( isset( $input['default_tone'] ) ) {
			$tone                = sanitize_key( $input['default_tone'] );
			$out['default_tone'] = array_key_exists( $tone, AI_CIS_Prompts::tones() ) ? $tone : $current['default_tone'];
		}
		if ( isset( $input['alt_text_style'] ) ) {
			$style                 = sanitize_key( $input['alt_text_style'] );
			$out['alt_text_style'] = in_array( $style, array( 'balanced', 'accessibility', 'seo' ), true ) ? $style : 'balanced';
		}

		foreach ( array( 'image_send_file', 'auto_optimize', 'seo_output_meta', 'review_summary_display', 'delete_on_uninstall', 'onboarding_complete' ) as $bool ) {
			if ( isset( $input[ $bool ] ) ) {
				$out[ $bool ] = rest_sanitize_boolean( $input[ $bool ] );
			}
		}

		foreach ( array( 'image_default_fields', 'auto_fields' ) as $fields_key ) {
			if ( isset( $input[ $fields_key ] ) && is_array( $input[ $fields_key ] ) ) {
				$out[ $fields_key ] = AI_CIS_Image_Optimizer::sanitize_fields( $input[ $fields_key ] );
			}
		}

		if ( isset( $input['custom_prompts'] ) && is_array( $input['custom_prompts'] ) ) {
			foreach ( array_keys( $current['custom_prompts'] ) as $prompt_key ) {
				if ( isset( $input['custom_prompts'][ $prompt_key ] ) ) {
					$out['custom_prompts'][ $prompt_key ] = substr( sanitize_textarea_field( $input['custom_prompts'][ $prompt_key ] ), 0, 2000 );
				}
			}
		}

		if ( isset( $input['limits'] ) && is_array( $input['limits'] ) ) {
			foreach ( array_keys( $current['limits'] ) as $limit_key ) {
				if ( isset( $input['limits'][ $limit_key ] ) ) {
					$out['limits'][ $limit_key ] = min( 1000000, absint( $input['limits'][ $limit_key ] ) );
				}
			}
		}

		return $out;
	}

	/**
	 * Settings safe to expose to authorised admin JavaScript (no secrets).
	 *
	 * @return array
	 */
	public static function get_public() {
		$settings             = self::all();
		$settings['api_keys'] = array();

		foreach ( self::key_providers() as $provider ) {
			$settings['api_keys'][ $provider ] = array(
				'configured'   => '' !== self::get_api_key( $provider ),
				'via_constant' => self::key_from_constant( $provider ) !== '',
				'hint'         => self::key_hint( $provider ),
			);
		}

		return $settings;
	}

	/**
	 * Constant name that can hold a provider key in wp-config.php.
	 *
	 * @param string $provider Provider slug.
	 * @return string
	 */
	public static function key_constant_name( $provider ) {
		return 'AI_CIS_' . strtoupper( sanitize_key( $provider ) ) . '_API_KEY';
	}

	/**
	 * Returns a key defined as a constant, if any.
	 *
	 * @param string $provider Provider slug.
	 * @return string
	 */
	private static function key_from_constant( $provider ) {
		$constant = self::key_constant_name( $provider );
		return defined( $constant ) ? (string) constant( $constant ) : '';
	}

	/**
	 * Returns the decrypted API key for a provider (server side only).
	 *
	 * @param string $provider Provider slug.
	 * @return string
	 */
	public static function get_api_key( $provider ) {
		$from_constant = self::key_from_constant( $provider );
		if ( '' !== $from_constant ) {
			return $from_constant;
		}

		$keys = get_option( self::KEYS, array() );
		if ( ! is_array( $keys ) || empty( $keys[ $provider ] ) ) {
			return '';
		}

		return self::decrypt( (string) $keys[ $provider ] );
	}

	/**
	 * Returns a masked hint such as "…a1b2" for display.
	 *
	 * @param string $provider Provider slug.
	 * @return string
	 */
	private static function key_hint( $provider ) {
		$key = self::get_api_key( $provider );
		if ( strlen( $key ) < 8 ) {
			return '';
		}
		return '…' . substr( $key, -4 );
	}

	/**
	 * Updates provider keys. Empty strings keep the stored key, "__delete__" removes it.
	 *
	 * @param array $input Map of provider => key.
	 * @return void
	 */
	public static function update_api_keys( $input ) {
		$keys = get_option( self::KEYS, array() );
		$keys = is_array( $keys ) ? $keys : array();

		foreach ( self::key_providers() as $provider ) {
			if ( ! isset( $input[ $provider ] ) ) {
				continue;
			}
			$value = trim( sanitize_text_field( (string) $input[ $provider ] ) );
			if ( '__delete__' === $value ) {
				unset( $keys[ $provider ] );
			} elseif ( '' !== $value ) {
				$keys[ $provider ] = self::encrypt( substr( $value, 0, 500 ) );
			}
		}

		update_option( self::KEYS, $keys, false );
	}

	/**
	 * Derives the encryption key from the site salts.
	 *
	 * @return string 32 byte binary key.
	 */
	private static function crypto_key() {
		return hash( 'sha256', wp_salt( 'auth' ) . 'ai-cis-api-keys', true );
	}

	/**
	 * Encrypts a secret at rest. Falls back to plain storage if sodium is unavailable.
	 *
	 * @param string $plain Plain text.
	 * @return string
	 */
	private static function encrypt( $plain ) {
		if ( ! function_exists( 'sodium_crypto_secretbox' ) ) {
			return $plain;
		}
		try {
			$nonce  = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
			$cipher = sodium_crypto_secretbox( $plain, $nonce, self::crypto_key() );
			// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Encoding encrypted binary data for storage, not obfuscation.
			return self::KEY_HEAD . base64_encode( $nonce . $cipher );
		} catch ( Exception $e ) {
			return $plain;
		}
	}

	/**
	 * Decrypts a stored secret.
	 *
	 * @param string $stored Stored value.
	 * @return string Empty string when the value cannot be decrypted (e.g. salts changed).
	 */
	private static function decrypt( $stored ) {
		if ( 0 !== strpos( $stored, self::KEY_HEAD ) ) {
			return $stored;
		}
		if ( ! function_exists( 'sodium_crypto_secretbox_open' ) ) {
			return '';
		}
		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- Decoding encrypted binary data from storage, not obfuscation.
		$raw = base64_decode( substr( $stored, strlen( self::KEY_HEAD ) ), true );
		if ( false === $raw || strlen( $raw ) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ) {
			return '';
		}
		try {
			$plain = sodium_crypto_secretbox_open(
				substr( $raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ),
				substr( $raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ),
				self::crypto_key()
			);
		} catch ( Exception $e ) {
			return '';
		}
		return false === $plain ? '' : $plain;
	}

	/**
	 * Output languages offered in the UI. Not used by AI logic directly.
	 *
	 * @return array Map of value => label.
	 */
	public static function languages() {
		$languages = array(
			'English'  => __( 'English', 'ai-content-image-seo' ),
			'Bangla'   => __( 'Bangla', 'ai-content-image-seo' ),
			'Spanish'  => __( 'Spanish', 'ai-content-image-seo' ),
			'French'   => __( 'French', 'ai-content-image-seo' ),
			'German'   => __( 'German', 'ai-content-image-seo' ),
			'Japanese' => __( 'Japanese', 'ai-content-image-seo' ),
			'Chinese'  => __( 'Chinese', 'ai-content-image-seo' ),
			'Arabic'   => __( 'Arabic', 'ai-content-image-seo' ),
		);

		/**
		 * Filters the list of AI output languages shown in the UI.
		 *
		 * @param array $languages Map of language value => translated label.
		 */
		return apply_filters( 'ai_cis_languages', $languages );
	}

	/**
	 * Resolves the language to use for a request.
	 *
	 * @param string $requested Requested language (may be empty or "Custom").
	 * @param string $custom    Custom language text when "Custom" is used.
	 * @return string
	 */
	public static function resolve_language( $requested = '', $custom = '' ) {
		$requested = sanitize_text_field( (string) $requested );
		$custom    = sanitize_text_field( (string) $custom );

		if ( 'Custom' === $requested ) {
			return '' !== $custom ? substr( $custom, 0, 60 ) : 'English';
		}
		if ( '' !== $requested ) {
			return substr( $requested, 0, 60 );
		}

		$default = (string) self::get( 'default_language', 'English' );
		if ( 'Custom' === $default ) {
			$stored = (string) self::get( 'custom_language', '' );
			return '' !== $stored ? $stored : 'English';
		}
		return '' !== $default ? $default : 'English';
	}
}
