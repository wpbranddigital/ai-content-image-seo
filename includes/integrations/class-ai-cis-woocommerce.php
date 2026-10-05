<?php
/**
 * WooCommerce product AI. Only loaded when WooCommerce is active.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Product content generation and the product editor assistant.
 */
final class AI_CIS_WooCommerce {

	/**
	 * Whether WooCommerce is active.
	 *
	 * @return bool
	 */
	public static function is_active() {
		return class_exists( 'WooCommerce' ) && function_exists( 'wc_get_product' );
	}

	/**
	 * Registers admin hooks.
	 *
	 * @return void
	 */
	public static function init() {
		if ( ! self::is_active() ) {
			return;
		}
		if ( is_admin() ) {
			add_action( 'add_meta_boxes_product', array( __CLASS__, 'add_meta_box' ) );
			add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
		}
	}

	/**
	 * Supported product fields.
	 *
	 * @return array
	 */
	public static function fields() {
		return array(
			'title'             => __( 'Product Title', 'wbd-content-image-seo-assistant' ),
			'description'       => __( 'Description', 'wbd-content-image-seo-assistant' ),
			'short_description' => __( 'Short Description', 'wbd-content-image-seo-assistant' ),
			'tags'              => __( 'Tags', 'wbd-content-image-seo-assistant' ),
			'categories'        => __( 'Categories', 'wbd-content-image-seo-assistant' ),
			'seo'               => __( 'SEO Metadata', 'wbd-content-image-seo-assistant' ),
			'improve'           => __( 'Improve Existing Description', 'wbd-content-image-seo-assistant' ),
		);
	}

	/**
	 * Adds the AI Product Assistant meta box.
	 *
	 * @return void
	 */
	public static function add_meta_box() {
		if ( ! current_user_can( 'edit_products' ) ) {
			return;
		}
		add_meta_box(
			'ai-cis-product-assistant',
			__( 'AI Product Assistant', 'wbd-content-image-seo-assistant' ),
			array( __CLASS__, 'render_meta_box' ),
			'product',
			'side',
			'high'
		);
	}

	/**
	 * Renders the meta box root (the React app mounts here).
	 *
	 * @param WP_Post $post Product post.
	 * @return void
	 */
	public static function render_meta_box( $post ) {
		echo '<div id="ai-cis-product-assistant-root" data-product-id="' . esc_attr( (string) $post->ID ) . '">';
		echo '<p class="description">' . esc_html__( 'Loading AI Product Assistant…', 'wbd-content-image-seo-assistant' ) . '</p>';
		echo '<noscript>' . esc_html__( 'The AI Product Assistant requires JavaScript.', 'wbd-content-image-seo-assistant' ) . '</noscript>';
		echo '</div>';
	}

	/**
	 * Enqueues the product assistant on product edit screens only.
	 *
	 * @param string $hook Current admin page.
	 * @return void
	 */
	public static function enqueue( $hook ) {
		if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
			return;
		}
		$screen = get_current_screen();
		if ( ! $screen || 'product' !== $screen->post_type ) {
			return;
		}
		AI_CIS_Admin::enqueue_bundle( 'product' );
	}

	/**
	 * Builds the product context sent to AI. Never includes customer data.
	 *
	 * @param WC_Product $product Product.
	 * @return array
	 */
	public static function get_context( $product ) {
		$attributes = array();
		foreach ( $product->get_attributes() as $attribute ) {
			if ( ! is_object( $attribute ) || ! method_exists( $attribute, 'get_name' ) ) {
				continue;
			}
			$options      = $attribute->is_taxonomy()
				? wc_get_product_terms( $product->get_id(), $attribute->get_name(), array( 'fields' => 'names' ) )
				: $attribute->get_options();
			$attributes[] = wc_attribute_label( $attribute->get_name() ) . ': ' . implode( ', ', (array) $options );
		}

		$brand = '';
		foreach ( array( 'product_brand', 'pwb-brand', 'yith_product_brand', 'pa_brand' ) as $brand_taxonomy ) {
			if ( taxonomy_exists( $brand_taxonomy ) ) {
				$terms = wp_get_post_terms( $product->get_id(), $brand_taxonomy, array( 'fields' => 'names' ) );
				if ( ! is_wp_error( $terms ) && $terms ) {
					$brand = implode( ', ', $terms );
					break;
				}
			}
		}

		$image_ids  = array_filter( array_merge( array( $product->get_image_id() ), $product->get_gallery_image_ids() ) );
		$image_alts = array();
		foreach ( $image_ids as $image_id ) {
			$alt = (string) get_post_meta( $image_id, '_wp_attachment_image_alt', true );
			if ( '' !== $alt ) {
				$image_alts[] = $alt;
			}
		}

		$price = '';
		if ( '' !== $product->get_price() ) {
			$price = html_entity_decode( wp_strip_all_tags( wc_price( (float) $product->get_price() ) ), ENT_QUOTES, get_bloginfo( 'charset' ) );
			if ( $product->is_on_sale() && '' !== $product->get_regular_price() ) {
				$price .= ' (on sale, regular ' . html_entity_decode( wp_strip_all_tags( wc_price( (float) $product->get_regular_price() ) ), ENT_QUOTES, get_bloginfo( 'charset' ) ) . ')';
			}
		}

		$context = array(
			'Product name'         => $product->get_name(),
			'Product type'         => $product->get_type(),
			'Existing description' => AI_CIS_Content_Generator::to_plain_text( $product->get_description(), 3000 ),
			'Short description'    => AI_CIS_Content_Generator::to_plain_text( $product->get_short_description(), 800 ),
			'SKU'                  => $product->get_sku(),
			'Price'                => $price,
			'Category'             => wp_strip_all_tags( wc_get_product_category_list( $product->get_id(), ', ' ) ),
			'Tags'                 => wp_strip_all_tags( wc_get_product_tag_list( $product->get_id(), ', ' ) ),
			'Attributes'           => implode( '; ', $attributes ),
			'Brand'                => $brand,
			'Existing images'      => count( $image_ids ) . ( $image_alts ? ' (' . implode( '; ', array_slice( $image_alts, 0, 5 ) ) . ')' : '' ),
			'Weight'               => $product->get_weight() ? $product->get_weight() . ' ' . get_option( 'woocommerce_weight_unit' ) : '',
		);

		/**
		 * Filters the product context sent to the AI provider.
		 *
		 * @param array      $context Label => value.
		 * @param WC_Product $product Product.
		 */
		return apply_filters( 'ai_cis_product_context', $context, $product );
	}

	/**
	 * Store category names for category suggestions.
	 *
	 * @return array Map of term_id => name.
	 */
	public static function store_categories() {
		$terms = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => false,
				'number'     => 150,
				'orderby'    => 'count',
				'order'      => 'DESC',
			)
		);
		$list  = array();
		if ( ! is_wp_error( $terms ) ) {
			foreach ( $terms as $term ) {
				$list[ $term->term_id ] = $term->name;
			}
		}
		return $list;
	}

	/**
	 * Generates product content (preview only).
	 *
	 * @param int    $product_id Product ID.
	 * @param string $field      Field key.
	 * @param array  $args       tone, language, request_id, overrides (unsaved editor values).
	 * @return array|WP_Error
	 */
	public static function generate( $product_id, $field, $args = array() ) {
		if ( ! self::is_active() ) {
			return new WP_Error( 'ai_cis_woocommerce_inactive', __( 'WooCommerce is not active.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'Product not found.', 'wbd-content-image-seo-assistant' ), array( 'status' => 404 ) );
		}
		if ( ! array_key_exists( $field, self::fields() ) ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'Unknown product field.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}

		$args = wp_parse_args(
			$args,
			array(
				'tone'       => AI_CIS_Settings::get( 'default_tone', 'professional' ),
				'language'   => '',
				'request_id' => '',
				'overrides'  => array(),
			)
		);

		$context = self::get_context( $product );

		// Unsaved values from the product editor take priority.
		$override_map = array(
			'name'              => 'Product name',
			'description'       => 'Existing description',
			'short_description' => 'Short description',
		);
		foreach ( $override_map as $key => $label ) {
			if ( isset( $args['overrides'][ $key ] ) && '' !== trim( (string) $args['overrides'][ $key ] ) ) {
				$context[ $label ] = 'name' === $key
					? sanitize_text_field( $args['overrides'][ $key ] )
					: AI_CIS_Content_Generator::to_plain_text( $args['overrides'][ $key ], 'description' === $key ? 3000 : 800 );
			}
		}

		if ( '' === trim( (string) $context['Product name'] ) ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'Add a product name first so the AI knows what the product is.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}

		if ( 'improve' === $field && '' === $context['Existing description'] ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'This product has no description to improve yet. Generate one instead.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}

		if ( 'categories' === $field ) {
			$context['Existing store categories'] = implode( ', ', self::store_categories() );
		}

		$tones = AI_CIS_Prompts::tones();
		$tone  = isset( $tones[ $args['tone'] ] ) ? $args['tone'] : 'professional';

		$result = AI_CIS_AI_Manager::run(
			'product',
			AI_CIS_Prompts::product( $field, $context, $product, $tone ),
			array(
				'system'     => AI_CIS_Prompts::system( AI_CIS_Settings::resolve_language( $args['language'] ) ),
				'json'       => true,
				'max_tokens' => in_array( $field, array( 'description', 'improve' ), true ) ? max( 2000, (int) AI_CIS_Settings::get( 'max_tokens', 1500 ) ) : 700,
				'request_id' => $args['request_id'],
			)
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return self::normalize( $field, $result );
	}

	/**
	 * Normalizes and sanitizes AI output per field.
	 *
	 * @param string $field  Field.
	 * @param array  $result Decoded result.
	 * @return array|WP_Error
	 */
	private static function normalize( $field, $result ) {
		switch ( $field ) {
			case 'seo':
				return array(
					'field'            => $field,
					'seo_title'        => isset( $result['seo_title'] ) ? sanitize_text_field( $result['seo_title'] ) : '',
					'meta_description' => isset( $result['meta_description'] ) ? sanitize_textarea_field( $result['meta_description'] ) : '',
					'focus_keyword'    => isset( $result['focus_keyword'] ) ? sanitize_text_field( $result['focus_keyword'] ) : '',
				);

			case 'title':
			case 'tags':
			case 'categories':
				$options = isset( $result['options'] ) && is_array( $result['options'] ) ? $result['options'] : array();
				if ( empty( $options ) && isset( $result['value'] ) ) {
					$options = array( $result['value'] );
				}
				$options = array_values( array_unique( array_filter( array_map( 'sanitize_text_field', array_map( 'strval', $options ) ) ) ) );
				if ( empty( $options ) ) {
					return AI_CIS_AI_Manager::error( 'ai_cis_malformed_response', array( 'details' => 'Missing options' ) );
				}
				$output = array(
					'field'   => $field,
					'options' => $options,
				);
				if ( 'categories' === $field ) {
					$existing           = array_change_key_case( array_flip( array_map( 'strtolower', self::store_categories() ) ) );
					$output['existing'] = array();
					foreach ( $options as $option ) {
						$output['existing'][ $option ] = isset( $existing[ strtolower( $option ) ] ) ? (int) $existing[ strtolower( $option ) ] : 0;
					}
				}
				return $output;

			default:
				$value = isset( $result['value'] ) && is_scalar( $result['value'] ) ? (string) $result['value'] : '';
				if ( '' === $value ) {
					return AI_CIS_AI_Manager::error( 'ai_cis_malformed_response', array( 'details' => 'Missing value' ) );
				}
				return array(
					'field' => $field,
					'value' => AI_CIS_Content_Generator::safe_html( $value ),
				);
		}
	}

	/**
	 * Saves a confirmed value to the product.
	 *
	 * @param int    $product_id Product ID.
	 * @param string $field      Field.
	 * @param mixed  $value      Value (string, list of strings, or SEO array).
	 * @param array  $args       'mode' => append|replace for terms.
	 * @return array|WP_Error
	 */
	public static function apply( $product_id, $field, $value, $args = array() ) {
		if ( ! self::is_active() ) {
			return new WP_Error( 'ai_cis_woocommerce_inactive', __( 'WooCommerce is not active.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'Product not found.', 'wbd-content-image-seo-assistant' ), array( 'status' => 404 ) );
		}

		$append = ! isset( $args['mode'] ) || 'replace' !== $args['mode'];
		$extra  = array();

		switch ( $field ) {
			case 'title':
				$product->set_name( sanitize_text_field( (string) $value ) );
				$product->save();
				break;
			case 'description':
			case 'improve':
				$product->set_description( wp_kses_post( (string) $value ) );
				$product->save();
				break;
			case 'short_description':
				$product->set_short_description( wp_kses_post( (string) $value ) );
				$product->save();
				break;
			case 'tags':
				$names = array_filter( array_map( 'sanitize_text_field', array_map( 'strval', (array) $value ) ) );
				wp_set_object_terms( $product_id, array_values( $names ), 'product_tag', $append );
				break;
			case 'categories':
				$term_ids = self::ensure_categories( (array) $value );
				if ( is_wp_error( $term_ids ) ) {
					return $term_ids;
				}
				wp_set_object_terms( $product_id, $term_ids, 'product_cat', $append );
				$extra = array( 'terms' => array() );
				foreach ( $term_ids as $term_id ) {
					$term = get_term( $term_id, 'product_cat' );
					if ( $term && ! is_wp_error( $term ) ) {
						$extra['terms'][] = array(
							'id'   => (int) $term->term_id,
							'name' => $term->name,
						);
					}
				}
				break;
			case 'seo':
				AI_CIS_SEO_Integration::save( $product_id, is_array( $value ) ? $value : array() );
				break;
			default:
				return new WP_Error( 'ai_cis_invalid_input', __( 'Unknown product field.', 'wbd-content-image-seo-assistant' ), array( 'status' => 400 ) );
		}

		if ( function_exists( 'wc_delete_product_transients' ) ) {
			wc_delete_product_transients( $product_id );
		}

		return array_merge(
			array(
				'saved' => true,
				'field' => $field,
			),
			$extra
		);
	}

	/**
	 * Resolves category names to term IDs, creating missing ones (user confirmed).
	 *
	 * @param array $names Category names.
	 * @return int[]|WP_Error
	 */
	public static function ensure_categories( $names ) {
		if ( ! current_user_can( 'manage_product_terms' ) && ! current_user_can( 'edit_products' ) ) {
			return new WP_Error( 'ai_cis_forbidden', __( 'You are not allowed to assign categories.', 'wbd-content-image-seo-assistant' ), array( 'status' => 403 ) );
		}

		$ids = array();
		foreach ( $names as $name ) {
			$name = sanitize_text_field( (string) $name );
			if ( '' === $name ) {
				continue;
			}
			$term = get_term_by( 'name', $name, 'product_cat' );
			if ( $term ) {
				$ids[] = (int) $term->term_id;
				continue;
			}
			if ( ! current_user_can( 'manage_product_terms' ) ) {
				continue;
			}
			$created = wp_insert_term( $name, 'product_cat' );
			if ( ! is_wp_error( $created ) ) {
				$ids[] = (int) $created['term_id'];
			}
		}
		return $ids;
	}

	/**
	 * Lightweight product list for the admin WooCommerce page.
	 *
	 * @param string $search Search term.
	 * @param int    $page   Page.
	 * @return array
	 */
	public static function list_products( $search = '', $page = 1 ) {
		$query = new WP_Query(
			array(
				'post_type'      => 'product',
				'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
				'posts_per_page' => 20,
				'paged'          => max( 1, (int) $page ),
				's'              => $search,
				'orderby'        => 'modified',
				'order'          => 'DESC',
			)
		);

		$items = array();
		foreach ( $query->posts as $post ) {
			$product = wc_get_product( $post );
			if ( ! $product || ! current_user_can( 'edit_post', $post->ID ) ) {
				continue;
			}
			$items[] = array(
				'id'                => $product->get_id(),
				'name'              => $product->get_name(),
				'status'            => $post->post_status,
				'sku'               => $product->get_sku(),
				'thumb'             => (string) wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' ),
				'has_description'   => '' !== trim( $product->get_description() ),
				'has_short'         => '' !== trim( $product->get_short_description() ),
				'review_count'      => (int) $product->get_review_count(),
				'edit_link'         => html_entity_decode( (string) get_edit_post_link( $product->get_id(), 'raw' ) ),
				'description'       => $product->get_description(),
				'short_description' => $product->get_short_description(),
				'tags'              => wp_get_post_terms( $product->get_id(), 'product_tag', array( 'fields' => 'names' ) ),
				'categories'        => wp_get_post_terms( $product->get_id(), 'product_cat', array( 'fields' => 'names' ) ),
				'seo'               => AI_CIS_SEO_Integration::get( $product->get_id() ),
			);
		}

		return array(
			'items'       => $items,
			'total'       => (int) $query->found_posts,
			'total_pages' => (int) $query->max_num_pages,
		);
	}
}
