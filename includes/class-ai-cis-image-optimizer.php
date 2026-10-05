<?php
/**
 * Image metadata generation (alt text, title, caption, description).
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Image AI service.
 */
final class AI_CIS_Image_Optimizer {

	const META_TYPE      = '_ai_cis_image_type';
	const META_STATUS    = '_ai_cis_status';
	const META_GENERATED = '_ai_cis_generated';
	const CACHE_GROUP    = 'ai_cis';

	/**
	 * Supported metadata fields.
	 *
	 * @return array Map of field => label.
	 */
	public static function fields() {
		return array(
			'alt'         => __( 'Alt Text', 'wbd-content-image-seo-assistant' ),
			'title'       => __( 'Title', 'wbd-content-image-seo-assistant' ),
			'caption'     => __( 'Caption', 'wbd-content-image-seo-assistant' ),
			'description' => __( 'Description', 'wbd-content-image-seo-assistant' ),
		);
	}

	/**
	 * Keeps only known field keys.
	 *
	 * @param array $fields Raw fields.
	 * @return array
	 */
	public static function sanitize_fields( $fields ) {
		$fields = array_map( 'sanitize_key', array_map( 'strval', (array) $fields ) );
		return array_values( array_intersect( array_keys( self::fields() ), $fields ) );
	}

	/**
	 * Validates an image type choice.
	 *
	 * @param string $type Raw type.
	 * @return string informative|decorative|unsure
	 */
	public static function sanitize_image_type( $type ) {
		$type = sanitize_key( (string) $type );
		return in_array( $type, array( 'informative', 'decorative', 'unsure' ), true ) ? $type : 'informative';
	}

	/**
	 * Whether an attachment is an image this plugin can handle.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return bool
	 */
	public static function is_image( $attachment_id ) {
		return $attachment_id > 0 && 'attachment' === get_post_type( $attachment_id ) && wp_attachment_is_image( $attachment_id );
	}

	/**
	 * Current metadata values.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return array
	 */
	public static function get_current( $attachment_id ) {
		$post = get_post( $attachment_id );
		return array(
			'alt'         => (string) get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ),
			'title'       => $post ? (string) $post->post_title : '',
			'caption'     => $post ? (string) $post->post_excerpt : '',
			'description' => $post ? (string) $post->post_content : '',
		);
	}

	/**
	 * Builds the context sent with an image request. No personal data is included.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return array Label => value.
	 */
	public static function get_context( $attachment_id ) {
		$post    = get_post( $attachment_id );
		$current = self::get_current( $attachment_id );
		$file    = get_attached_file( $attachment_id );

		$context = array(
			'Filename'            => $file ? wp_basename( $file ) : '',
			'Attachment title'    => $current['title'],
			'Current alt text'    => $current['alt'],
			'Current caption'     => $current['caption'],
			'Current description' => AI_CIS_Content_Generator::to_plain_text( $current['description'], 500 ),
		);

		$parent_id = $post ? (int) $post->post_parent : 0;
		$product   = null;

		if ( class_exists( 'WooCommerce' ) && function_exists( 'wc_get_product' ) ) {
			if ( $parent_id && in_array( get_post_type( $parent_id ), array( 'product', 'product_variation' ), true ) ) {
				$product = wc_get_product( $parent_id );
			} else {
				$product_id = self::find_product_using_image( $attachment_id );
				$product    = $product_id ? wc_get_product( $product_id ) : null;
			}
		}

		if ( $product ) {
			$context['WooCommerce product name']        = $product->get_name();
			$context['WooCommerce product description'] = AI_CIS_Content_Generator::to_plain_text( $product->get_short_description() ? $product->get_short_description() : $product->get_description(), 600 );
			$context['Product category']                = wp_strip_all_tags( wc_get_product_category_list( $product->get_id(), ', ' ) );
			$attributes                                 = array();
			foreach ( $product->get_attributes() as $attribute ) {
				if ( is_object( $attribute ) && method_exists( $attribute, 'get_name' ) ) {
					$options      = $attribute->is_taxonomy() ? wc_get_product_terms( $product->get_id(), $attribute->get_name(), array( 'fields' => 'names' ) ) : $attribute->get_options();
					$attributes[] = wc_attribute_label( $attribute->get_name() ) . ': ' . implode( '/', (array) $options );
				}
			}
			$context['Product attributes'] = implode( '; ', $attributes );
		} elseif ( $parent_id ) {
			$parent = get_post( $parent_id );
			if ( $parent ) {
				$context['Parent post title']   = $parent->post_title;
				$context['Parent post content'] = AI_CIS_Content_Generator::to_plain_text( $parent->post_content, 800 );
			}
		}

		/**
		 * Filters the context used to generate image metadata.
		 *
		 * @param array $context       Label => value.
		 * @param int   $attachment_id Attachment ID.
		 */
		return apply_filters( 'ai_cis_image_context', $context, $attachment_id );
	}

	/**
	 * Finds a product that uses the image as featured image.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return int
	 */
	private static function find_product_using_image( $attachment_id ) {
		$query = new WP_Query(
			array(
				'post_type'              => 'product',
				'post_status'            => 'any',
				'posts_per_page'         => 1,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
				'meta_key'               => '_thumbnail_id', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- Single indexed lookup.
				'meta_value'             => (string) $attachment_id, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- Single indexed lookup.
			)
		);
		return $query->posts ? (int) $query->posts[0] : 0;
	}

	/**
	 * Returns a base64 payload of a reasonably sized rendition of the image.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return array|null array( 'data' => base64, 'mime' => mime ) or null.
	 */
	public static function image_payload( $attachment_id ) {
		if ( ! AI_CIS_Settings::get( 'image_send_file', true ) ) {
			return null;
		}

		$supported = array( 'image/jpeg', 'image/png', 'image/gif', 'image/webp' );
		$path      = '';

		foreach ( array( 'medium_large', 'large', 'medium' ) as $size ) {
			$intermediate = image_get_intermediate_size( $attachment_id, $size );
			if ( $intermediate && ! empty( $intermediate['path'] ) ) {
				$uploads   = wp_get_upload_dir();
				$candidate = trailingslashit( $uploads['basedir'] ) . $intermediate['path'];
				if ( is_readable( $candidate ) ) {
					$path = $candidate;
					break;
				}
			}
		}

		if ( '' === $path ) {
			$original = get_attached_file( $attachment_id );
			if ( $original && is_readable( $original ) && filesize( $original ) <= 4 * MB_IN_BYTES ) {
				$path = $original;
			}
		}

		if ( '' === $path || filesize( $path ) > 4 * MB_IN_BYTES ) {
			return null;
		}

		$type = wp_check_filetype( $path );
		if ( empty( $type['type'] ) || ! in_array( $type['type'], $supported, true ) ) {
			return null;
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Reading a local file from the uploads directory.
		$contents = file_get_contents( $path );
		if ( false === $contents || '' === $contents ) {
			return null;
		}

		/**
		 * Filters whether the image file is sent to the AI provider.
		 *
		 * @param bool $send          Whether to send.
		 * @param int  $attachment_id Attachment ID.
		 */
		if ( ! apply_filters( 'ai_cis_send_image_to_provider', true, $attachment_id ) ) {
			return null;
		}

		return array(
			// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Image bytes must be base64 encoded for AI vision APIs.
			'data' => base64_encode( $contents ),
			'mime' => $type['type'],
		);
	}

	/**
	 * Generates metadata suggestions (nothing is saved here).
	 *
	 * @param int   $attachment_id Attachment ID.
	 * @param array $args {
	 *     Generation arguments.
	 *
	 *     @type array  $fields     Fields to generate.
	 *     @type string $image_type informative|decorative|unsure.
	 *     @type string $style      balanced|accessibility|seo.
	 *     @type string $language   Language.
	 *     @type string $request_id Idempotency key.
	 *     @type string $usage_type Usage type (image or auto_image).
	 * }
	 * @return array|WP_Error
	 */
	public static function generate( $attachment_id, $args = array() ) {
		if ( ! self::is_image( $attachment_id ) ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'This file is not an image.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}

		$args = wp_parse_args(
			$args,
			array(
				'fields'     => array( 'alt', 'title', 'caption', 'description' ),
				'image_type' => 'informative',
				'style'      => AI_CIS_Settings::get( 'alt_text_style', 'balanced' ),
				'language'   => '',
				'request_id' => '',
				'usage_type' => 'image',
			)
		);

		$fields     = self::sanitize_fields( $args['fields'] );
		$image_type = self::sanitize_image_type( $args['image_type'] );
		$style      = in_array( $args['style'], array( 'balanced', 'accessibility', 'seo' ), true ) ? $args['style'] : 'balanced';

		if ( empty( $fields ) ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'Select at least one field.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}

		$output = array_fill_keys( $fields, '' );

		// Decorative images get an empty alt text and no AI call for it.
		$ai_fields = 'decorative' === $image_type ? array_values( array_diff( $fields, array( 'alt' ) ) ) : $fields;

		if ( empty( $ai_fields ) ) {
			return array(
				'values'     => $output,
				'image_type' => $image_type,
				'used_ai'    => false,
			);
		}

		$payload = self::image_payload( $attachment_id );
		$context = self::get_context( $attachment_id );
		if ( 'unsure' === $image_type ) {
			$context['Note'] = 'The site owner is unsure whether this image is decorative. If it looks purely decorative (patterns, spacers, backgrounds), return an empty alt text.';
		}

		$result = AI_CIS_AI_Manager::run(
			$args['usage_type'],
			AI_CIS_Prompts::image( $context, $style, null !== $payload ),
			array(
				'system'      => AI_CIS_Prompts::system( AI_CIS_Settings::resolve_language( $args['language'] ) ),
				'json'        => true,
				'max_tokens'  => 600,
				'temperature' => 0.4,
				'image'       => $payload,
				'request_id'  => $args['request_id'],
			)
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		foreach ( $ai_fields as $field ) {
			if ( ! isset( $result[ $field ] ) || ! is_scalar( $result[ $field ] ) ) {
				continue;
			}
			$value = (string) $result[ $field ];
			if ( 'alt' === $field ) {
				$value = preg_replace( '/^(an?\s+)?(image|picture|photo|photograph)\s+of\s+/i', '', trim( $value ) );
				$value = ucfirst( rtrim( sanitize_text_field( $value ), '.' ) );
			} elseif ( 'description' === $field || 'caption' === $field ) {
				$value = sanitize_textarea_field( $value );
			} else {
				$value = sanitize_text_field( $value );
			}
			$output[ $field ] = $value;
		}

		AI_CIS_Logger::log( 'Image metadata generated', array( 'attachment' => $attachment_id ) );

		return array(
			'values'     => $output,
			'image_type' => $image_type,
			'used_ai'    => true,
			'vision'     => null !== $payload,
		);
	}

	/**
	 * Applies selected metadata. Existing values are kept unless $overwrite is true.
	 *
	 * @param int    $attachment_id Attachment ID.
	 * @param array  $values        Field => value.
	 * @param array  $fields        Fields to apply.
	 * @param bool   $overwrite     Whether to overwrite existing values.
	 * @param string $image_type    Image type to store.
	 * @return array Map with 'updated' and 'skipped' field lists.
	 */
	public static function apply( $attachment_id, $values, $fields, $overwrite = false, $image_type = '' ) {
		$fields  = self::sanitize_fields( $fields );
		$current = self::get_current( $attachment_id );
		$updated = array();
		$skipped = array();
		$post    = array( 'ID' => $attachment_id );

		if ( '' !== $image_type ) {
			update_post_meta( $attachment_id, self::META_TYPE, self::sanitize_image_type( $image_type ) );
		}
		$is_decorative = 'decorative' === get_post_meta( $attachment_id, self::META_TYPE, true );

		foreach ( $fields as $field ) {
			$value = isset( $values[ $field ] ) ? (string) $values[ $field ] : '';

			if ( '' === $value && ! ( 'alt' === $field && $is_decorative ) ) {
				$skipped[] = $field;
				continue;
			}
			if ( '' !== trim( $current[ $field ] ) && ! $overwrite ) {
				$skipped[] = $field;
				continue;
			}

			switch ( $field ) {
				case 'alt':
					update_post_meta( $attachment_id, '_wp_attachment_image_alt', $is_decorative ? '' : sanitize_text_field( $value ) );
					break;
				case 'title':
					$post['post_title'] = sanitize_text_field( $value );
					break;
				case 'caption':
					$post['post_excerpt'] = sanitize_textarea_field( $value );
					break;
				case 'description':
					$post['post_content'] = sanitize_textarea_field( $value );
					break;
			}
			$updated[] = $field;
		}

		if ( count( $post ) > 1 ) {
			wp_update_post( $post );
		}

		if ( $updated ) {
			update_post_meta( $attachment_id, self::META_GENERATED, time() );
			update_post_meta( $attachment_id, self::META_STATUS, 'optimized' );
			wp_cache_delete( 'stats', self::CACHE_GROUP );
		}

		/**
		 * Fires after AI metadata is applied to an image.
		 *
		 * @param int   $attachment_id Attachment ID.
		 * @param array $updated       Updated fields.
		 */
		do_action( 'ai_cis_image_metadata_applied', $attachment_id, $updated );

		return array(
			'updated' => $updated,
			'skipped' => $skipped,
			'current' => self::get_current( $attachment_id ),
		);
	}

	/**
	 * Generate + apply in one step (bulk and automation).
	 *
	 * @param int    $attachment_id Attachment ID.
	 * @param array  $fields        Fields.
	 * @param bool   $overwrite     Overwrite existing values.
	 * @param string $usage_type    image or auto_image.
	 * @return array|WP_Error Result with status: optimized|skipped.
	 */
	public static function process( $attachment_id, $fields, $overwrite, $usage_type = 'image' ) {
		if ( ! self::is_image( $attachment_id ) ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'This file is not an image.', 'wbd-content-image-seo-assistant' ) );
		}

		$fields     = self::sanitize_fields( $fields );
		$current    = self::get_current( $attachment_id );
		$image_type = (string) get_post_meta( $attachment_id, self::META_TYPE, true );
		$image_type = '' === $image_type ? 'informative' : $image_type;

		// Skip AI entirely when nothing would change (saves usage).
		$needed = array();
		foreach ( $fields as $field ) {
			if ( $overwrite || '' === trim( $current[ $field ] ) || ( 'title' === $field && self::title_looks_like_filename( $attachment_id ) ) ) {
				$needed[] = $field;
			}
		}
		if ( 'decorative' === $image_type ) {
			$needed = array_values( array_diff( $needed, array( 'alt' ) ) );
		}
		if ( empty( $needed ) ) {
			return array( 'status' => 'skipped' );
		}

		$generated = self::generate(
			$attachment_id,
			array(
				'fields'     => $needed,
				'image_type' => $image_type,
				'usage_type' => $usage_type,
				'request_id' => $usage_type . '-' . $attachment_id . '-' . wp_generate_password( 6, false ),
			)
		);

		if ( is_wp_error( $generated ) ) {
			update_post_meta( $attachment_id, self::META_STATUS, 'ai_cis_limit_reached' === $generated->get_error_code() ? 'limit' : 'failed' );
			return $generated;
		}

		// A filename-like title counts as empty, so allow replacing it.
		$force_title = in_array( 'title', $needed, true ) && self::title_looks_like_filename( $attachment_id );
		$applied     = self::apply( $attachment_id, $generated['values'], array_diff( $needed, array( 'title' ) ), $overwrite );
		if ( in_array( 'title', $needed, true ) ) {
			$title_apply        = self::apply( $attachment_id, $generated['values'], array( 'title' ), $overwrite || $force_title );
			$applied['updated'] = array_merge( $applied['updated'], $title_apply['updated'] );
		}

		return array(
			'status'  => 'optimized',
			'updated' => $applied['updated'],
		);
	}

	/**
	 * WordPress uses the filename as the default title. Treat it as missing.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return bool
	 */
	public static function title_looks_like_filename( $attachment_id ) {
		$post = get_post( $attachment_id );
		if ( ! $post ) {
			return false;
		}
		$title = trim( $post->post_title );
		if ( '' === $title ) {
			return true;
		}
		$file = get_attached_file( $attachment_id );
		$base = $file ? pathinfo( wp_basename( $file ), PATHINFO_FILENAME ) : '';
		$base = preg_replace( '/-(scaled|rotated|\d+x\d+)$/', '', $base );
		return strtolower( $title ) === strtolower( $base ) || strtolower( $title ) === strtolower( $post->post_name );
	}

	/**
	 * Library statistics.
	 *
	 * @return array
	 */
	public static function stats() {
		$cached = wp_cache_get( 'stats', self::CACHE_GROUP );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		$stats = array();
		foreach ( array(
			'total'               => 'all',
			'missing_alt'         => 'missing_alt',
			'missing_title'       => 'missing_title',
			'missing_caption'     => 'missing_caption',
			'missing_description' => 'missing_description',
			'decorative'          => 'decorative',
		) as $key => $filter ) {
			$stats[ $key ] = self::count( $filter );
		}

		wp_cache_set( 'stats', $stats, self::CACHE_GROUP, MINUTE_IN_SECONDS );

		return $stats;
	}

	/**
	 * Builds a WHERE clause with placeholders for a library filter.
	 *
	 * Every fragment is a fixed string; all values are passed as placeholders.
	 *
	 * @param string $filter Filter key.
	 * @param string $search Search term.
	 * @return array array( string $where_with_placeholders, array $args ).
	 */
	private static function filter_sql( $filter, $search = '' ) {
		global $wpdb;

		$not_decorative = "NOT EXISTS ( SELECT 1 FROM {$wpdb->postmeta} dm WHERE dm.post_id = p.ID AND dm.meta_key = %s AND dm.meta_value = %s )";
		$missing_alt    = "NOT EXISTS ( SELECT 1 FROM {$wpdb->postmeta} am WHERE am.post_id = p.ID AND am.meta_key = %s AND am.meta_value <> '' ) AND " . $not_decorative;
		$alt_args       = array( '_wp_attachment_image_alt', self::META_TYPE, 'decorative' );
		$missing_title  = "( p.post_title = '' OR LOWER( p.post_title ) = LOWER( p.post_name ) )";

		$where = 'p.post_type = %s AND p.post_mime_type LIKE %s';
		$args  = array( 'attachment', 'image/%' );

		switch ( $filter ) {
			case 'missing_alt':
				$where .= ' AND ' . $missing_alt;
				$args   = array_merge( $args, $alt_args );
				break;
			case 'missing_title':
				$where .= ' AND ' . $missing_title;
				break;
			case 'missing_caption':
				$where .= " AND p.post_excerpt = ''";
				break;
			case 'missing_description':
				$where .= " AND p.post_content = ''";
				break;
			case 'decorative':
				$where .= " AND EXISTS ( SELECT 1 FROM {$wpdb->postmeta} dm WHERE dm.post_id = p.ID AND dm.meta_key = %s AND dm.meta_value = %s )";
				$args[] = self::META_TYPE;
				$args[] = 'decorative';
				break;
			case 'missing_metadata':
				$where .= ' AND ( ( ' . $missing_alt . ' ) OR ' . $missing_title . " OR p.post_excerpt = '' OR p.post_content = '' )";
				$args   = array_merge( $args, $alt_args );
				break;
			case 'recent':
				$where .= ' AND p.post_date >= %s';
				$args[] = gmdate( 'Y-m-d H:i:s', time() - 30 * DAY_IN_SECONDS );
				break;
			case 'woocommerce':
				$where .= " AND ( EXISTS ( SELECT 1 FROM {$wpdb->posts} pp WHERE pp.ID = p.post_parent AND pp.post_type IN ( %s, %s ) )"
					. " OR EXISTS ( SELECT 1 FROM {$wpdb->postmeta} tm INNER JOIN {$wpdb->posts} tp ON tp.ID = tm.post_id WHERE tm.meta_key = %s AND tm.meta_value = p.ID AND tp.post_type = %s ) )";
				$args   = array_merge( $args, array( 'product', 'product_variation', '_thumbnail_id', 'product' ) );
				break;
			case 'post_images':
				$where .= " AND EXISTS ( SELECT 1 FROM {$wpdb->posts} pp WHERE pp.ID = p.post_parent AND pp.post_type IN ( %s, %s ) )";
				$args   = array_merge( $args, array( 'post', 'page' ) );
				break;
			case 'failed':
				$where .= " AND EXISTS ( SELECT 1 FROM {$wpdb->postmeta} sm WHERE sm.post_id = p.ID AND sm.meta_key = %s AND sm.meta_value IN ( %s, %s ) )";
				$args   = array_merge( $args, array( self::META_STATUS, 'failed', 'limit' ) );
				break;
		}

		if ( '' !== $search ) {
			$like   = '%' . $wpdb->esc_like( $search ) . '%';
			$where .= ' AND ( p.post_title LIKE %s OR p.guid LIKE %s )';
			$args[] = $like;
			$args[] = $like;
		}

		return array( $where, $args );
	}

	/**
	 * Counts images matching a filter.
	 *
	 * @param string $filter Filter key.
	 * @param string $search Search term.
	 * @return int
	 */
	private static function count( $filter, $search = '' ) {
		global $wpdb;
		list( $where, $args ) = self::filter_sql( $filter, $search );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber, PluginCheck.Security.DirectDB.UnescapedDBParameter -- $where contains only fixed SQL fragments; all values are placeholders. Results are cached by callers.
		return (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$wpdb->posts} p WHERE {$where}", $args ) );
	}

	/**
	 * Allowed library filters.
	 *
	 * @return array
	 */
	public static function filters() {
		$filters = array(
			'all'              => __( 'All Images', 'wbd-content-image-seo-assistant' ),
			'missing_alt'      => __( 'Missing Alt Text', 'wbd-content-image-seo-assistant' ),
			'missing_metadata' => __( 'Missing Metadata', 'wbd-content-image-seo-assistant' ),
			'recent'           => __( 'Recently Uploaded', 'wbd-content-image-seo-assistant' ),
			'post_images'      => __( 'Post Images', 'wbd-content-image-seo-assistant' ),
			'failed'           => __( 'Failed / Not Processed', 'wbd-content-image-seo-assistant' ),
		);
		if ( class_exists( 'WooCommerce' ) ) {
			$filters['woocommerce'] = __( 'WooCommerce Images', 'wbd-content-image-seo-assistant' );
		}
		return $filters;
	}

	/**
	 * Lists images for the Bulk Optimizer.
	 *
	 * @param string $filter   Filter key.
	 * @param int    $page     Page number.
	 * @param int    $per_page Items per page.
	 * @param string $search   Search term.
	 * @return array
	 */
	public static function query( $filter = 'all', $page = 1, $per_page = 20, $search = '' ) {
		global $wpdb;

		$filter   = array_key_exists( $filter, self::filters() ) ? $filter : 'all';
		$page     = max( 1, (int) $page );
		$per_page = max( 1, min( 100, (int) $per_page ) );
		$total    = self::count( $filter, $search );

		list( $where, $args ) = self::filter_sql( $filter, $search );
		$args[]               = $per_page;
		$args[]               = ( $page - 1 ) * $per_page;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber, PluginCheck.Security.DirectDB.UnescapedDBParameter -- $where contains only fixed SQL fragments; all values are placeholders. Listing must be live.
		$ids = $wpdb->get_col( $wpdb->prepare( "SELECT p.ID FROM {$wpdb->posts} p WHERE {$where} ORDER BY p.post_date DESC LIMIT %d OFFSET %d", $args ) );

		$items = array();
		if ( $ids ) {
			_prime_post_caches( array_map( 'intval', $ids ), false, true );
		}
		foreach ( $ids as $id ) {
			$items[] = self::item( (int) $id );
		}

		return array(
			'items'       => $items,
			'total'       => $total,
			'page'        => $page,
			'total_pages' => (int) ceil( $total / $per_page ),
		);
	}

	/**
	 * All image IDs matching a filter (for "select all" bulk jobs).
	 *
	 * @param string $filter Filter key.
	 * @param int    $limit  Maximum IDs.
	 * @return int[]
	 */
	public static function query_ids( $filter, $limit = 5000 ) {
		global $wpdb;
		$filter               = array_key_exists( $filter, self::filters() ) ? $filter : 'all';
		list( $where, $args ) = self::filter_sql( $filter );
		$args[]               = max( 1, (int) $limit );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber, PluginCheck.Security.DirectDB.UnescapedDBParameter -- $where contains only fixed SQL fragments; all values are placeholders.
		$ids = $wpdb->get_col( $wpdb->prepare( "SELECT p.ID FROM {$wpdb->posts} p WHERE {$where} ORDER BY p.post_date DESC LIMIT %d", $args ) );
		return array_map( 'intval', $ids );
	}

	/**
	 * Item representation for the UI.
	 *
	 * @param int $id Attachment ID.
	 * @return array
	 */
	public static function item( $id ) {
		$post    = get_post( $id );
		$current = self::get_current( $id );
		$file    = get_attached_file( $id );
		$parent  = $post && $post->post_parent ? get_post( $post->post_parent ) : null;

		return array(
			'id'          => $id,
			'thumb'       => (string) wp_get_attachment_image_url( $id, 'thumbnail' ),
			'url'         => (string) wp_get_attachment_url( $id ),
			'filename'    => $file ? wp_basename( $file ) : '',
			'alt'         => $current['alt'],
			'title'       => $current['title'],
			'caption'     => $current['caption'],
			'description' => $current['description'],
			'parent'      => $parent ? array(
				'id'    => $parent->ID,
				'title' => $parent->post_title,
				'type'  => $parent->post_type,
			) : null,
			'image_type'  => (string) get_post_meta( $id, self::META_TYPE, true ),
			'status'      => (string) get_post_meta( $id, self::META_STATUS, true ),
			'edit_link'   => html_entity_decode( (string) get_edit_post_link( $id, 'raw' ) ),
			'can_edit'    => current_user_can( 'edit_post', $id ),
		);
	}
}
