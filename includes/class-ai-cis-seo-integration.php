<?php
/**
 * SEO plugin adapters (Yoast SEO, Rank Math, All in One SEO) and fallback output.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads/writes SEO metadata through whichever SEO plugin is active.
 * None of these plugins are required.
 */
final class AI_CIS_SEO_Integration {

	const META_TITLE   = '_ai_cis_seo_title';
	const META_DESC    = '_ai_cis_meta_description';
	const META_KEYWORD = '_ai_cis_focus_keyword';

	/**
	 * Registers frontend fallback output (only when no SEO plugin is active).
	 *
	 * @return void
	 */
	public static function init() {
		if ( is_admin() || '' !== self::detect() || ! AI_CIS_Settings::get( 'seo_output_meta', true ) ) {
			return;
		}
		add_filter( 'pre_get_document_title', array( __CLASS__, 'filter_document_title' ), 20 );
		add_action( 'wp_head', array( __CLASS__, 'output_meta_description' ), 1 );
	}

	/**
	 * Detects the active SEO plugin.
	 *
	 * @return string yoast|rankmath|aioseo|'' (none).
	 */
	public static function detect() {
		$detected = '';
		if ( defined( 'WPSEO_VERSION' ) ) {
			$detected = 'yoast';
		} elseif ( defined( 'RANK_MATH_VERSION' ) || class_exists( 'RankMath' ) ) {
			$detected = 'rankmath';
		} elseif ( defined( 'AIOSEO_VERSION' ) || function_exists( 'aioseo' ) ) {
			$detected = 'aioseo';
		}

		/**
		 * Filters the detected SEO plugin.
		 *
		 * @param string $detected yoast, rankmath, aioseo or empty string.
		 */
		return (string) apply_filters( 'ai_cis_detected_seo_plugin', $detected );
	}

	/**
	 * Label of the active SEO integration.
	 *
	 * @return string
	 */
	public static function label() {
		$labels = array(
			'yoast'    => 'Yoast SEO',
			'rankmath' => 'Rank Math',
			'aioseo'   => 'All in One SEO',
		);
		$active = self::detect();
		return isset( $labels[ $active ] ) ? $labels[ $active ] : __( 'WBD Content & Image SEO (built-in)', 'wbd-content-image-seo-assistant' );
	}

	/**
	 * Returns the meta keys used by the active plugin.
	 *
	 * @param string $plugin Plugin slug.
	 * @return array
	 */
	private static function meta_keys( $plugin ) {
		switch ( $plugin ) {
			case 'yoast':
				return array( '_yoast_wpseo_title', '_yoast_wpseo_metadesc', '_yoast_wpseo_focuskw' );
			case 'rankmath':
				return array( 'rank_math_title', 'rank_math_description', 'rank_math_focus_keyword' );
			case 'aioseo':
				return array( '_aioseo_title', '_aioseo_description', '_aioseo_keywords' );
			default:
				return array( self::META_TITLE, self::META_DESC, self::META_KEYWORD );
		}
	}

	/**
	 * Gets current SEO metadata for a post.
	 *
	 * @param int $post_id Post ID.
	 * @return array
	 */
	public static function get( $post_id ) {
		$plugin = self::detect();
		$keys   = self::meta_keys( $plugin );
		$data   = array(
			'seo_title'        => (string) get_post_meta( $post_id, $keys[0], true ),
			'meta_description' => (string) get_post_meta( $post_id, $keys[1], true ),
			'focus_keyword'    => (string) get_post_meta( $post_id, $keys[2], true ),
		);

		if ( 'aioseo' === $plugin ) {
			$model = self::aioseo_model( $post_id );
			if ( $model ) {
				$data['seo_title']        = isset( $model->title ) ? (string) $model->title : $data['seo_title'];
				$data['meta_description'] = isset( $model->description ) ? (string) $model->description : $data['meta_description'];
				if ( ! empty( $model->keyphrases ) ) {
					$phrases = is_string( $model->keyphrases ) ? json_decode( $model->keyphrases, true ) : (array) $model->keyphrases;
					if ( isset( $phrases['focus']['keyphrase'] ) ) {
						$data['focus_keyword'] = (string) $phrases['focus']['keyphrase'];
					}
				}
			}
		}

		if ( 'rankmath' === $plugin && false !== strpos( $data['focus_keyword'], ',' ) ) {
			$parts                 = explode( ',', $data['focus_keyword'] );
			$data['focus_keyword'] = trim( $parts[0] );
		}

		return $data;
	}

	/**
	 * Saves SEO metadata (only after explicit user confirmation).
	 *
	 * @param int   $post_id Post ID.
	 * @param array $data    seo_title, meta_description, focus_keyword.
	 * @return bool
	 */
	public static function save( $post_id, $data ) {
		$title   = isset( $data['seo_title'] ) ? sanitize_text_field( $data['seo_title'] ) : null;
		$desc    = isset( $data['meta_description'] ) ? sanitize_textarea_field( $data['meta_description'] ) : null;
		$keyword = isset( $data['focus_keyword'] ) ? sanitize_text_field( $data['focus_keyword'] ) : null;

		$plugin = self::detect();
		$keys   = self::meta_keys( $plugin );

		if ( null !== $title ) {
			update_post_meta( $post_id, $keys[0], $title );
		}
		if ( null !== $desc ) {
			update_post_meta( $post_id, $keys[1], $desc );
		}
		if ( null !== $keyword && 'aioseo' !== $plugin ) {
			update_post_meta( $post_id, $keys[2], $keyword );
		}

		if ( 'aioseo' === $plugin ) {
			self::save_aioseo( $post_id, $title, $desc, $keyword );
		} elseif ( 'yoast' === $plugin ) {
			self::refresh_yoast_indexable( $post_id );
		}

		/**
		 * Fires after SEO metadata is saved.
		 *
		 * @param int    $post_id Post ID.
		 * @param array  $data    Saved data.
		 * @param string $plugin  Target SEO plugin ('' for built-in).
		 */
		do_action( 'ai_cis_seo_saved', $post_id, $data, $plugin );

		return true;
	}

	/**
	 * Returns the AIOSEO post model when the API is available.
	 *
	 * @param int $post_id Post ID.
	 * @return object|null
	 */
	private static function aioseo_model( $post_id ) {
		$class = 'AIOSEO\\Plugin\\Common\\Models\\Post';
		if ( ! class_exists( $class ) || ! method_exists( $class, 'getPost' ) ) {
			return null;
		}
		try {
			return call_user_func( array( $class, 'getPost' ), $post_id );
		} catch ( Throwable $e ) {
			AI_CIS_Logger::log( 'AIOSEO model unavailable', array( 'error' => $e->getMessage() ) );
			return null;
		}
	}

	/**
	 * Saves to AIOSEO's own storage.
	 *
	 * @param int         $post_id Post ID.
	 * @param string|null $title   Title.
	 * @param string|null $desc    Description.
	 * @param string|null $keyword Focus keyphrase.
	 * @return void
	 */
	private static function save_aioseo( $post_id, $title, $desc, $keyword ) {
		$model = self::aioseo_model( $post_id );
		if ( ! $model ) {
			return;
		}
		try {
			$model->post_id = $post_id;
			if ( null !== $title ) {
				$model->title = $title;
			}
			if ( null !== $desc ) {
				$model->description = $desc;
			}
			if ( null !== $keyword && '' !== $keyword ) {
				$phrases = ! empty( $model->keyphrases ) && is_string( $model->keyphrases ) ? json_decode( $model->keyphrases, true ) : array();
				$phrases = is_array( $phrases ) ? $phrases : array();

				$phrases['focus']      = array(
					'keyphrase' => $keyword,
					'score'     => 0,
					'analysis'  => array(),
				);
				$phrases['additional'] = isset( $phrases['additional'] ) ? $phrases['additional'] : array();
				$model->keyphrases     = wp_json_encode( $phrases );
			}
			$model->save();
		} catch ( Throwable $e ) {
			AI_CIS_Logger::log( 'AIOSEO save failed', array( 'error' => $e->getMessage() ) );
		}
	}

	/**
	 * Asks Yoast to rebuild the post indexable so the new meta shows immediately.
	 *
	 * @param int $post_id Post ID.
	 * @return void
	 */
	private static function refresh_yoast_indexable( $post_id ) {
		$watcher_class = 'Yoast\\WP\\SEO\\Integrations\\Watchers\\Indexable_Post_Watcher';
		if ( ! function_exists( 'YoastSEO' ) || ! class_exists( $watcher_class ) ) {
			return;
		}
		try {
			$watcher = YoastSEO()->classes->get( $watcher_class );
			if ( $watcher && method_exists( $watcher, 'build_indexable' ) ) {
				$watcher->build_indexable( $post_id );
			}
		} catch ( Throwable $e ) {
			AI_CIS_Logger::log( 'Yoast indexable refresh failed', array( 'error' => $e->getMessage() ) );
		}
	}

	/**
	 * Generates SEO metadata (preview only, nothing is saved).
	 *
	 * @param array  $context    title, content, keyword, type.
	 * @param string $language   Language.
	 * @param string $request_id Idempotency key.
	 * @param string $usage_type Usage type to consume.
	 * @return array|WP_Error
	 */
	public static function generate( $context, $language = '', $request_id = '', $usage_type = 'content' ) {
		$context = array(
			'title'   => isset( $context['title'] ) ? sanitize_text_field( $context['title'] ) : '',
			'content' => isset( $context['content'] ) ? AI_CIS_Content_Generator::to_plain_text( $context['content'], 6000 ) : '',
			'keyword' => isset( $context['keyword'] ) ? sanitize_text_field( $context['keyword'] ) : '',
			'type'    => isset( $context['type'] ) ? sanitize_text_field( $context['type'] ) : 'post',
		);

		if ( '' === $context['title'] && '' === $context['content'] ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'This content is empty. Add a title or content first.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}

		$result = AI_CIS_AI_Manager::run(
			$usage_type,
			AI_CIS_Prompts::seo( $context ),
			array(
				'system'     => AI_CIS_Prompts::system( AI_CIS_Settings::resolve_language( $language ) ),
				'json'       => true,
				'max_tokens' => 600,
				'request_id' => $request_id,
			)
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$keywords = isset( $result['keywords'] ) && is_array( $result['keywords'] ) ? $result['keywords'] : array();

		return array(
			'seo_title'        => isset( $result['seo_title'] ) ? sanitize_text_field( $result['seo_title'] ) : '',
			'meta_description' => isset( $result['meta_description'] ) ? sanitize_textarea_field( $result['meta_description'] ) : '',
			'focus_keyword'    => isset( $result['focus_keyword'] ) ? sanitize_text_field( $result['focus_keyword'] ) : '',
			'keywords'         => array_values( array_filter( array_map( 'sanitize_text_field', array_map( 'strval', $keywords ) ) ) ),
		);
	}

	/**
	 * AI content optimization review.
	 *
	 * @param array  $context    title, content, keyword.
	 * @param string $language   Language.
	 * @param string $request_id Idempotency key.
	 * @return array|WP_Error
	 */
	public static function analyze( $context, $language = '', $request_id = '' ) {
		$context = array(
			'title'   => isset( $context['title'] ) ? sanitize_text_field( $context['title'] ) : '',
			'content' => isset( $context['content'] ) ? AI_CIS_Content_Generator::to_plain_text( $context['content'], 10000 ) : '',
			'keyword' => isset( $context['keyword'] ) ? sanitize_text_field( $context['keyword'] ) : '',
		);

		if ( '' === $context['content'] ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'This content is empty. Add content first.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}

		$result = AI_CIS_AI_Manager::run(
			'content',
			AI_CIS_Prompts::seo_analysis( $context ),
			array(
				'system'     => AI_CIS_Prompts::system( AI_CIS_Settings::resolve_language( $language ) ),
				'json'       => true,
				'max_tokens' => 1200,
				'request_id' => $request_id,
			)
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$suggestions = array();
		if ( isset( $result['suggestions'] ) && is_array( $result['suggestions'] ) ) {
			foreach ( $result['suggestions'] as $suggestion ) {
				if ( is_string( $suggestion ) ) {
					$suggestion = array( 'text' => $suggestion );
				}
				if ( ! is_array( $suggestion ) || empty( $suggestion['text'] ) ) {
					continue;
				}
				$priority      = isset( $suggestion['priority'] ) ? sanitize_key( $suggestion['priority'] ) : 'medium';
				$suggestions[] = array(
					'priority' => in_array( $priority, array( 'high', 'medium', 'low' ), true ) ? $priority : 'medium',
					'text'     => sanitize_text_field( $suggestion['text'] ),
				);
			}
		}

		return array(
			'score'       => isset( $result['score'] ) ? max( 0, min( 100, absint( $result['score'] ) ) ) : null,
			'summary'     => isset( $result['summary'] ) ? sanitize_text_field( $result['summary'] ) : '',
			'suggestions' => $suggestions,
			'checks'      => self::basic_checks( $context['title'], $context['content'], $context['keyword'] ),
		);
	}

	/**
	 * Deterministic on-page checks (no AI).
	 *
	 * @param string $title   Title.
	 * @param string $text    Plain text content.
	 * @param string $keyword Focus keyword.
	 * @return array
	 */
	public static function basic_checks( $title, $text, $keyword ) {
		$words  = str_word_count( $text );
		$checks = array(
			array(
				'label' => __( 'Content length', 'wbd-content-image-seo-assistant' ),
				'pass'  => $words >= 300,
				/* translators: %d: number of words. */
				'note'  => sprintf( _n( '%d word', '%d words', $words, 'wbd-content-image-seo-assistant' ), $words ),
			),
			array(
				'label' => __( 'Title length', 'wbd-content-image-seo-assistant' ),
				'pass'  => strlen( $title ) >= 20 && strlen( $title ) <= 70,
				/* translators: %d: number of characters. */
				'note'  => sprintf( __( '%d characters', 'wbd-content-image-seo-assistant' ), strlen( $title ) ),
			),
		);

		if ( '' !== $keyword ) {
			$in_title = false !== stripos( $title, $keyword );
			$count    = substr_count( strtolower( $text ), strtolower( $keyword ) );
			$checks[] = array(
				'label' => __( 'Focus keyword in title', 'wbd-content-image-seo-assistant' ),
				'pass'  => $in_title,
				'note'  => $in_title ? __( 'Yes', 'wbd-content-image-seo-assistant' ) : __( 'No', 'wbd-content-image-seo-assistant' ),
			);
			$checks[] = array(
				'label' => __( 'Focus keyword in content', 'wbd-content-image-seo-assistant' ),
				'pass'  => $count > 0,
				/* translators: %d: number of keyword occurrences. */
				'note'  => sprintf( _n( '%d time', '%d times', $count, 'wbd-content-image-seo-assistant' ), $count ),
			);
		}

		return $checks;
	}

	/**
	 * Images used in a post that are missing alt text (Image SEO).
	 *
	 * @param int $post_id Post ID.
	 * @return array
	 */
	public static function image_report( $post_id ) {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return array();
		}

		$ids = array();
		if ( has_post_thumbnail( $post ) ) {
			$ids[] = (int) get_post_thumbnail_id( $post );
		}
		if ( preg_match_all( '/wp-image-(\d+)/', $post->post_content, $matches ) ) {
			$ids = array_merge( $ids, array_map( 'intval', $matches[1] ) );
		}
		if ( preg_match_all( '/"id":(\d+)/', $post->post_content, $matches ) ) {
			foreach ( $matches[1] as $maybe_id ) {
				if ( wp_attachment_is_image( (int) $maybe_id ) ) {
					$ids[] = (int) $maybe_id;
				}
			}
		}

		$report = array();
		foreach ( array_unique( array_filter( $ids ) ) as $id ) {
			if ( ! wp_attachment_is_image( $id ) ) {
				continue;
			}
			$alt      = (string) get_post_meta( $id, '_wp_attachment_image_alt', true );
			$report[] = array(
				'id'         => $id,
				'title'      => get_the_title( $id ),
				'thumb'      => wp_get_attachment_image_url( $id, 'thumbnail' ),
				'alt'        => $alt,
				'decorative' => 'decorative' === get_post_meta( $id, AI_CIS_Image_Optimizer::META_TYPE, true ),
			);
		}
		return $report;
	}

	/**
	 * Fallback document title when no SEO plugin is active.
	 *
	 * @param string $title Title.
	 * @return string
	 */
	public static function filter_document_title( $title ) {
		if ( is_singular() ) {
			$custom = (string) get_post_meta( get_queried_object_id(), self::META_TITLE, true );
			if ( '' !== $custom ) {
				return $custom;
			}
		}
		return $title;
	}

	/**
	 * Fallback meta description when no SEO plugin is active.
	 *
	 * @return void
	 */
	public static function output_meta_description() {
		if ( ! is_singular() ) {
			return;
		}
		$description = (string) get_post_meta( get_queried_object_id(), self::META_DESC, true );
		if ( '' !== $description ) {
			echo '<meta name="description" content="' . esc_attr( $description ) . '" />' . "\n";
		}
	}
}
