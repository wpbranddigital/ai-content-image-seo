<?php
/**
 * AI provider contract.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Every AI provider adapter implements this interface so features never talk
 * to a vendor API directly.
 */
interface AI_CIS_Provider_Interface {

	/**
	 * Generates text.
	 *
	 * @param string $prompt User prompt.
	 * @param array  $args {
	 *     Optional arguments.
	 *
	 *     @type string $system      System instruction.
	 *     @type float  $temperature Sampling temperature.
	 *     @type int    $max_tokens  Maximum output tokens.
	 *     @type string $model       Model ID or "auto".
	 *     @type bool   $json        Request a JSON object response.
	 *     @type array  $image       Optional image: array( 'data' => base64, 'mime' => mime type ).
	 *     @type int    $timeout     Request timeout in seconds.
	 * }
	 * @return string|WP_Error Generated text or error.
	 */
	public function generate( $prompt, $args = array() );

	/**
	 * Whether the provider is configured and usable on this site.
	 *
	 * @return bool
	 */
	public function is_available();

	/**
	 * Suggested models as a map of model ID => label.
	 *
	 * @return array
	 */
	public function get_models();

	/**
	 * Provider slug.
	 *
	 * @return string
	 */
	public function get_id();

	/**
	 * Provider label.
	 *
	 * @return string
	 */
	public function get_label();
}
