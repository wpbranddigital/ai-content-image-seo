<?php
/**
 * OpenRouter provider (OpenAI-compatible API).
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * OpenRouter adapter.
 */
class AI_CIS_Provider_OpenRouter extends AI_CIS_Provider_OpenAI {

	/**
	 * Provider slug.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'openrouter';
	}

	/**
	 * Provider label.
	 *
	 * @return string
	 */
	public function get_label() {
		return __( 'OpenRouter', 'ai-content-image-seo' );
	}

	/**
	 * API base URL.
	 *
	 * @return string
	 */
	protected function base_url() {
		/**
		 * Filters the OpenRouter API base URL.
		 *
		 * @param string $url Base URL without trailing slash.
		 */
		return untrailingslashit( apply_filters( 'ai_cis_openrouter_base_url', 'https://openrouter.ai/api/v1' ) );
	}

	/**
	 * OpenRouter attribution headers (site URL and name only).
	 *
	 * @return array
	 */
	protected function extra_headers() {
		return array(
			'HTTP-Referer' => home_url( '/' ),
			'X-Title'      => 'AI Content & Image SEO Assistant',
		);
	}

	/**
	 * Default model.
	 *
	 * @return string
	 */
	protected function default_model() {
		return 'openrouter/auto';
	}

	/**
	 * Suggested models.
	 *
	 * @return array
	 */
	protected function suggested_models() {
		return array(
			'openrouter/auto'                   => __( 'OpenRouter Auto Router', 'ai-content-image-seo' ),
			'openai/gpt-4o-mini'                => 'OpenAI GPT-4o mini',
			'anthropic/claude-sonnet-4.5'       => 'Anthropic Claude Sonnet 4.5',
			'google/gemini-2.5-flash'           => 'Google Gemini 2.5 Flash',
			'meta-llama/llama-3.3-70b-instruct' => 'Meta Llama 3.3 70B',
		);
	}

	/**
	 * JSON mode is not supported by every routed model, so rely on the prompt instead.
	 *
	 * @return bool
	 */
	protected function supports_json_mode() {
		return false;
	}

	/**
	 * OpenRouter models never need the reasoning special case here.
	 *
	 * @param string $model Model ID.
	 * @return bool
	 */
	protected function is_reasoning_model( $model ) {
		return false;
	}

	/**
	 * Every OpenRouter model is listable.
	 *
	 * @param string $id Model ID.
	 * @return bool
	 */
	protected function is_listable_model( $id ) {
		return '' !== $id;
	}
}
