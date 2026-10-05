<?php
/**
 * Centralized, filterable prompt templates.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Prompt templates. Every prompt passes through a dedicated filter so
 * developers can customize wording without touching feature code.
 */
final class AI_CIS_Prompts {

	/**
	 * Writing tones.
	 *
	 * @return array
	 */
	public static function tones() {
		return apply_filters(
			'ai_cis_tones',
			array(
				'professional'  => __( 'Professional', 'wbd-content-image-seo-assistant' ),
				'friendly'      => __( 'Friendly', 'wbd-content-image-seo-assistant' ),
				'casual'        => __( 'Casual', 'wbd-content-image-seo-assistant' ),
				'persuasive'    => __( 'Persuasive', 'wbd-content-image-seo-assistant' ),
				'informative'   => __( 'Informative', 'wbd-content-image-seo-assistant' ),
				'enthusiastic'  => __( 'Enthusiastic', 'wbd-content-image-seo-assistant' ),
				'authoritative' => __( 'Authoritative', 'wbd-content-image-seo-assistant' ),
			)
		);
	}

	/**
	 * Content types.
	 *
	 * @return array
	 */
	public static function content_types() {
		return apply_filters(
			'ai_cis_content_types',
			array(
				'blog_post'    => __( 'Blog Post', 'wbd-content-image-seo-assistant' ),
				'how_to'       => __( 'How-to Guide', 'wbd-content-image-seo-assistant' ),
				'listicle'     => __( 'Listicle', 'wbd-content-image-seo-assistant' ),
				'news'         => __( 'News Article', 'wbd-content-image-seo-assistant' ),
				'review'       => __( 'Review', 'wbd-content-image-seo-assistant' ),
				'landing_page' => __( 'Landing Page', 'wbd-content-image-seo-assistant' ),
				'about_page'   => __( 'About Page', 'wbd-content-image-seo-assistant' ),
				'service_page' => __( 'Service Page', 'wbd-content-image-seo-assistant' ),
				'faq'          => __( 'FAQ Page', 'wbd-content-image-seo-assistant' ),
			)
		);
	}

	/**
	 * Length presets with approximate word counts.
	 *
	 * @return array
	 */
	public static function lengths() {
		return apply_filters(
			'ai_cis_lengths',
			array(
				'short'  => array(
					'label' => __( 'Short (~300 words)', 'wbd-content-image-seo-assistant' ),
					'words' => 300,
				),
				'medium' => array(
					'label' => __( 'Medium (~700 words)', 'wbd-content-image-seo-assistant' ),
					'words' => 700,
				),
				'long'   => array(
					'label' => __( 'Long (~1200 words)', 'wbd-content-image-seo-assistant' ),
					'words' => 1200,
				),
			)
		);
	}

	/**
	 * Rewrite actions and their instructions.
	 *
	 * @return array Map of action => array( label, instruction ).
	 */
	public static function rewrite_actions() {
		return apply_filters(
			'ai_cis_rewrite_actions',
			array(
				'improve'      => array(
					'label'       => __( 'Improve Writing', 'wbd-content-image-seo-assistant' ),
					'instruction' => 'Improve clarity, flow and readability while keeping the meaning, facts and approximate length.',
				),
				'grammar'      => array(
					'label'       => __( 'Fix Grammar', 'wbd-content-image-seo-assistant' ),
					'instruction' => 'Fix grammar, spelling and punctuation only. Do not change style, meaning or structure.',
				),
				'seo'          => array(
					'label'       => __( 'Make SEO Friendly', 'wbd-content-image-seo-assistant' ),
					'instruction' => 'Make the text more SEO friendly: clear headings, natural use of the main topic keywords, short paragraphs and scannable structure. Never keyword-stuff.',
				),
				'persuasive'   => array(
					'label'       => __( 'Make More Persuasive', 'wbd-content-image-seo-assistant' ),
					'instruction' => 'Make the text more persuasive and compelling, with clear benefits and a call to action, without exaggerating or inventing claims.',
				),
				'shorten'      => array(
					'label'       => __( 'Shorten', 'wbd-content-image-seo-assistant' ),
					'instruction' => 'Shorten the text to roughly half its length while keeping the key points.',
				),
				'expand'       => array(
					'label'       => __( 'Expand', 'wbd-content-image-seo-assistant' ),
					'instruction' => 'Expand the text with more helpful detail, explanation and examples. Do not invent statistics, quotes or facts.',
				),
				'simplify'     => array(
					'label'       => __( 'Simplify', 'wbd-content-image-seo-assistant' ),
					'instruction' => 'Rewrite in plain, simple language that is easy to understand for a general audience.',
				),
				'professional' => array(
					'label'       => __( 'Professional Tone', 'wbd-content-image-seo-assistant' ),
					'instruction' => 'Rewrite in a professional, polished tone.',
				),
				'friendly'     => array(
					'label'       => __( 'Friendly Tone', 'wbd-content-image-seo-assistant' ),
					'instruction' => 'Rewrite in a warm, friendly and conversational tone.',
				),
				'rewrite'      => array(
					'label'       => __( 'Rewrite', 'wbd-content-image-seo-assistant' ),
					'instruction' => 'Rewrite the text with fresh wording while keeping the same meaning and facts.',
				),
			)
		);
	}

	/**
	 * Base system instruction.
	 *
	 * @param string $language Output language.
	 * @return string
	 */
	public static function system( $language ) {
		$system = 'You are an expert copywriter, SEO specialist and accessibility expert working inside a WordPress website. '
			. 'Write all output in ' . $language . '. '
			. 'Never invent facts, statistics, prices, quotes, reviews or product specifications that are not provided. '
			. 'Follow the requested output format exactly.';

		/**
		 * Filters the base system instruction.
		 *
		 * @param string $system   System instruction.
		 * @param string $language Output language.
		 */
		return apply_filters( 'ai_cis_system_prompt', $system, $language );
	}

	/**
	 * Appends site-owner custom instructions for a prompt group.
	 *
	 * @param string $prompt Prompt.
	 * @param string $group  Custom prompt group (content, rewrite, image, product, seo, review).
	 * @return string
	 */
	private static function with_custom( $prompt, $group ) {
		$custom = AI_CIS_Settings::get( 'custom_prompts', array() );
		if ( ! empty( $custom[ $group ] ) ) {
			$prompt .= "\n\nAdditional instructions from the site owner:\n" . $custom[ $group ];
		}
		return $prompt;
	}

	/**
	 * Formats a context block, skipping empty values.
	 *
	 * @param array $context Label => value pairs.
	 * @return string
	 */
	public static function context_block( $context ) {
		$lines = array();
		foreach ( $context as $label => $value ) {
			if ( is_array( $value ) ) {
				$value = implode( ', ', array_filter( array_map( 'strval', $value ) ) );
			}
			$value = trim( (string) $value );
			if ( '' !== $value ) {
				$lines[] = $label . ': ' . $value;
			}
		}
		return implode( "\n", $lines );
	}

	/**
	 * Full post/page generation prompt (JSON output).
	 *
	 * @param array $args Sanitized generation args.
	 * @return string
	 */
	public static function content( $args ) {
		$types   = self::content_types();
		$tones   = self::tones();
		$lengths = self::lengths();

		$type  = isset( $types[ $args['content_type'] ] ) ? $args['content_type'] : 'blog_post';
		$tone  = isset( $tones[ $args['tone'] ] ) ? $args['tone'] : 'professional';
		$words = isset( $lengths[ $args['length'] ]['words'] ) ? (int) $lengths[ $args['length'] ]['words'] : 700;

		$prompt = 'Write a ' . str_replace( '_', ' ', $type ) . ' for a WordPress ' . ( 'page' === $args['post_type'] ? 'page' : 'post' ) . ".\n"
			. 'Topic: ' . $args['topic'] . "\n"
			. 'Tone: ' . $tone . "\n"
			. 'Target length: about ' . $words . " words.\n";

		if ( ! empty( $args['keywords'] ) ) {
			$prompt .= 'Keywords to include naturally: ' . $args['keywords'] . "\n";
		}
		if ( ! empty( $args['instructions'] ) ) {
			$prompt .= 'Extra instructions: ' . $args['instructions'] . "\n";
		}

		$prompt .= "\nFormat the content as clean HTML using only <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em> and <blockquote>. Do not include an <h1> or the title inside the content.\n"
			. 'Respond with only a JSON object with these keys: '
			. '"title" (string), "content" (HTML string), "excerpt" (1-2 sentences), "seo_title" (max 60 characters), '
			. '"meta_description" (max 155 characters), "keywords" (array of 5-8 strings).';

		$prompt = self::with_custom( $prompt, 'content' );

		/**
		 * Filters the content generation prompt.
		 *
		 * @param string $prompt Prompt.
		 * @param array  $args   Generation args.
		 */
		return apply_filters( 'ai_cis_content_prompt', $prompt, $args );
	}

	/**
	 * Rewrite prompt (plain output).
	 *
	 * @param string $content Content to rewrite.
	 * @param string $action  Rewrite action key.
	 * @param bool   $is_html Whether the content contains HTML.
	 * @return string
	 */
	public static function rewrite( $content, $action, $is_html ) {
		$actions     = self::rewrite_actions();
		$instruction = isset( $actions[ $action ] ) ? $actions[ $action ]['instruction'] : $actions['improve']['instruction'];

		$prompt  = $instruction . "\n";
		$prompt .= $is_html
			? "Keep the existing HTML structure and allowed tags. Return only the rewritten HTML, with no explanations and no code fences.\n"
			: "Return only the rewritten text, with no explanations, no quotes and no code fences.\n";
		$prompt .= "\nText to rewrite:\n<<<\n" . $content . "\n>>>";

		$prompt = self::with_custom( $prompt, 'rewrite' );

		/**
		 * Filters the rewrite prompt.
		 *
		 * @param string $prompt  Prompt.
		 * @param string $content Original content.
		 * @param string $action  Action key.
		 */
		return apply_filters( 'ai_cis_rewrite_prompt', $prompt, $content, $action );
	}

	/**
	 * Single field prompt (title, excerpt, ...) returning JSON.
	 *
	 * @param string $field   Field key.
	 * @param array  $context Context with 'title', 'content', 'keywords'.
	 * @return string
	 */
	public static function field( $field, $context ) {
		$specs = array(
			'title'            => 'Suggest 3 compelling, specific titles (max 70 characters each). Respond with JSON: {"options": ["...", "...", "..."]}',
			'excerpt'          => 'Write a concise excerpt of 1-2 sentences (max 300 characters). Respond with JSON: {"value": "..."}',
			'seo_title'        => 'Write an SEO title of at most 60 characters that includes the main topic naturally. Respond with JSON: {"value": "..."}',
			'meta_description' => 'Write a meta description of 140-155 characters that summarizes the page and encourages clicks. Respond with JSON: {"value": "..."}',
			'keywords'         => 'Suggest 5-10 relevant focus keywords or keyphrases. Respond with JSON: {"options": ["...", "..."]}',
		);

		$spec   = isset( $specs[ $field ] ) ? $specs[ $field ] : $specs['excerpt'];
		$prompt = $spec . "\n\n" . self::context_block(
			array(
				'Current title' => isset( $context['title'] ) ? $context['title'] : '',
				'Keywords'      => isset( $context['keywords'] ) ? $context['keywords'] : '',
			)
		) . "\n\nContent:\n<<<\n" . ( isset( $context['content'] ) ? $context['content'] : '' ) . "\n>>>";

		$prompt = self::with_custom( $prompt, 'seo' === $field ? 'seo' : 'content' );

		/**
		 * Filters a single-field generation prompt.
		 *
		 * @param string $prompt  Prompt.
		 * @param string $field   Field key.
		 * @param array  $context Context.
		 */
		return apply_filters( 'ai_cis_field_prompt', $prompt, $field, $context );
	}

	/**
	 * SEO metadata prompt.
	 *
	 * @param array $context Context with title, content, keyword, type.
	 * @return string
	 */
	public static function seo( $context ) {
		$prompt = "Create search engine metadata for this WordPress content.\n"
			. 'Respond with only a JSON object: {"seo_title": "max 60 characters", "meta_description": "140-155 characters", '
			. '"focus_keyword": "one primary keyphrase", "keywords": ["5-8 related keyphrases"]}' . "\n\n"
			. self::context_block(
				array(
					'Content type'        => $context['type'],
					'Title'               => $context['title'],
					'Preferred keyphrase' => $context['keyword'],
				)
			)
			. "\n\nContent:\n<<<\n" . $context['content'] . "\n>>>";

		$prompt = self::with_custom( $prompt, 'seo' );

		/**
		 * Filters the SEO metadata prompt.
		 *
		 * @param string $prompt  Prompt.
		 * @param array  $context Context.
		 */
		return apply_filters( 'ai_cis_seo_prompt', $prompt, $context );
	}

	/**
	 * SEO content analysis prompt.
	 *
	 * @param array $context Context with title, content, keyword.
	 * @return string
	 */
	public static function seo_analysis( $context ) {
		$prompt = "Review this WordPress content for on-page SEO and readability.\n"
			. 'Respond with only a JSON object: {"score": integer 0-100, "summary": "one sentence", '
			. '"suggestions": [{"priority": "high|medium|low", "text": "specific actionable suggestion"}]}. '
			. "Give 4-8 suggestions. Base every suggestion on the actual content.\n\n"
			. self::context_block(
				array(
					'Title'         => $context['title'],
					'Focus keyword' => $context['keyword'],
				)
			)
			. "\n\nContent:\n<<<\n" . $context['content'] . "\n>>>";

		$prompt = self::with_custom( $prompt, 'seo' );

		/**
		 * Filters the SEO analysis prompt.
		 *
		 * @param string $prompt  Prompt.
		 * @param array  $context Context.
		 */
		return apply_filters( 'ai_cis_seo_analysis_prompt', $prompt, $context );
	}

	/**
	 * Image metadata prompt.
	 *
	 * @param array  $context   Image context.
	 * @param string $style     Alt text style: balanced, accessibility, seo.
	 * @param bool   $has_image Whether the image file is attached to the request.
	 * @return string
	 */
	public static function image( $context, $style, $has_image ) {
		$style_rules = array(
			'balanced'      => 'Balance accessibility and SEO: describe what the image shows in plain language and use a relevant keyword only when it is natural.',
			'accessibility' => 'Accessibility first: describe the meaningful visual information for screen reader users. Be concise (ideally under 125 characters). '
				. 'Do not start with "image of", "picture of" or "photo of". Never keyword-stuff. Do not invent details you cannot see or that are not in the context.',
			'seo'           => 'SEO focused: describe the image accurately and include the most relevant product or topic keyword naturally. Never keyword-stuff and stay under 125 characters.',
		);

		$prompt = "Generate WordPress media library metadata for an image.\n"
			. ( isset( $style_rules[ $style ] ) ? $style_rules[ $style ] : $style_rules['balanced'] ) . "\n"
			. ( $has_image
				? "The image is attached. Base the description on what is actually visible, using the context to identify products, places or people's roles.\n"
				: "The image itself is not attached. Use only the filename and context below. If the context is not enough, write a cautious, generic but accurate description.\n" )
			. 'Respond with only a JSON object: {"alt": "alt text", "title": "short title in title case (max 60 characters)", '
			. '"caption": "one short sentence", "description": "1-3 sentences"}' . "\n\nContext:\n"
			. self::context_block( $context );

		$prompt = self::with_custom( $prompt, 'image' );

		/**
		 * Filters the image metadata prompt.
		 *
		 * @param string $prompt  Prompt.
		 * @param array  $context Image context.
		 * @param string $style   Alt text style.
		 */
		return apply_filters( 'ai_cis_image_metadata_prompt', $prompt, $context, $style );
	}

	/**
	 * WooCommerce product prompt.
	 *
	 * @param string     $field   Field key.
	 * @param array      $context Product context.
	 * @param WC_Product $product Product object.
	 * @param string     $tone    Tone.
	 * @return string
	 */
	public static function product( $field, $context, $product, $tone ) {
		$specs = array(
			'title'             => 'Write an optimized product title (max 70 characters) that is clear, specific and searchable. Respond with JSON: {"options": ["...", "...", "..."]} with 3 options.',
			'description'       => 'Write a complete product description as clean HTML using <h3>, <p>, <ul>, <li>, <strong>. '
				. 'Include these sections: a short introduction, Key Features, Benefits, Use Cases, and a brief conclusion. '
				. 'Only mention features supported by the product data. Respond with JSON: {"value": "<html>"}',
			'short_description' => 'Write a concise product summary of 1-3 sentences or up to 4 short bullet points (HTML allowed: <p>, <ul>, <li>). Respond with JSON: {"value": "..."}',
			'tags'              => 'Suggest 5-10 relevant product tags (short lowercase phrases). Respond with JSON: {"options": ["...", "..."]}',
			'categories'        => 'Suggest 1-4 suitable product categories. Prefer categories from the "Existing store categories" list when they fit. Respond with JSON: {"options": ["...", "..."]}',
			'seo'               => 'Create SEO metadata for this product page. Respond with JSON: {"seo_title": "max 60 characters", "meta_description": "140-155 characters", "focus_keyword": "primary keyphrase"}',
			'improve'           => 'Improve the existing product description: better structure, clarity and persuasion, keeping all facts. Return clean HTML. Respond with JSON: {"value": "<html>"}',
		);

		$prompt = ( isset( $specs[ $field ] ) ? $specs[ $field ] : $specs['description'] ) . "\n"
			. 'Tone: ' . $tone . "\n\nProduct data:\n" . self::context_block( $context );

		$prompt = self::with_custom( $prompt, 'product' );

		$filters = array(
			'description'       => 'ai_cis_product_description_prompt',
			'short_description' => 'ai_cis_product_short_description_prompt',
			'title'             => 'ai_cis_product_title_prompt',
			'tags'              => 'ai_cis_product_tags_prompt',
			'categories'        => 'ai_cis_product_categories_prompt',
			'seo'               => 'ai_cis_product_seo_prompt',
			'improve'           => 'ai_cis_product_improve_prompt',
		);

		$filter = isset( $filters[ $field ] ) ? $filters[ $field ] : 'ai_cis_product_description_prompt';

		/**
		 * Filters a WooCommerce product prompt. Filter names:
		 * ai_cis_product_description_prompt, ai_cis_product_short_description_prompt,
		 * ai_cis_product_title_prompt, ai_cis_product_tags_prompt,
		 * ai_cis_product_categories_prompt, ai_cis_product_seo_prompt,
		 * ai_cis_product_improve_prompt.
		 *
		 * @param string     $prompt  Prompt.
		 * @param WC_Product $product Product.
		 * @param array      $context Product context.
		 */
		return apply_filters( $filter, $prompt, $product, $context ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- Hook names come from the fixed $filters map, all prefixed with ai_cis_.
	}

	/**
	 * Review summary prompt.
	 *
	 * @param string $product_name Product name.
	 * @param array  $reviews      List of array( 'rating' => int, 'text' => string ).
	 * @return string
	 */
	public static function review_summary( $product_name, $reviews ) {
		$lines = array();
		foreach ( $reviews as $index => $review ) {
			$lines[] = '#' . ( $index + 1 ) . ' (' . ( $review['rating'] ? $review['rating'] . '/5' : 'no rating' ) . '): ' . $review['text'];
		}

		$prompt = 'Summarize the customer reviews below for the product "' . $product_name . "\".\n"
			. "Only use information that appears in the reviews. Do not invent opinions, numbers or features. If reviews disagree, say so.\n"
			. 'Respond with only a JSON object: {"summary": "2-3 sentences", "pros": ["..."], "cons": ["..."]}. '
			. "Use empty arrays when there are no clear pros or cons.\n\nReviews:\n" . implode( "\n", $lines );

		$prompt = self::with_custom( $prompt, 'review' );

		/**
		 * Filters the review summary prompt.
		 *
		 * @param string $prompt       Prompt.
		 * @param string $product_name Product name.
		 * @param array  $reviews      Reviews sent (rating and text only).
		 */
		return apply_filters( 'ai_cis_review_summary_prompt', $prompt, $product_name, $reviews );
	}
}
