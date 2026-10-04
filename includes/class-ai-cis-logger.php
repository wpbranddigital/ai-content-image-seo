<?php
/**
 * Debug logger.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Writes short diagnostic lines to the PHP error log, only when WP_DEBUG is on.
 *
 * Never pass API keys, passwords or customer data to this logger.
 */
final class AI_CIS_Logger {

	/**
	 * Logs a message when debugging is enabled.
	 *
	 * @param string $message Message to log.
	 * @param array  $context Optional scalar context values (sensitive keys are stripped).
	 * @return void
	 */
	public static function log( $message, $context = array() ) {
		if ( ! defined( 'WP_DEBUG' ) || true !== WP_DEBUG ) {
			return;
		}

		/**
		 * Filters whether the plugin writes debug log lines.
		 *
		 * @param bool $enabled Whether logging is enabled. Default true when WP_DEBUG is on.
		 */
		if ( ! apply_filters( 'ai_cis_enable_debug_log', true ) ) {
			return;
		}

		$line = '[AI-CIS] ' . sanitize_text_field( $message );

		if ( ! empty( $context ) && is_array( $context ) ) {
			$safe = array();
			foreach ( $context as $key => $value ) {
				if ( preg_match( '/key|token|secret|password|auth|email/i', (string) $key ) ) {
					continue;
				}
				if ( is_scalar( $value ) ) {
					$safe[] = sanitize_key( $key ) . '=' . substr( sanitize_text_field( (string) $value ), 0, 120 );
				}
			}
			if ( $safe ) {
				$line .= ' (' . implode( ', ', $safe ) . ')';
			}
		}

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Debug logging only runs when WP_DEBUG is true.
		error_log( $line );
	}
}
