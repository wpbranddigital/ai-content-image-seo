<?php
/**
 * Centralized usage tracking and limit enforcement.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Tracks monthly AI usage per type.
 *
 * Every feature is available to every user. Limits are optional: a limit of 0
 * means "unlimited" (the default). Site owners or developers can set caps from
 * Settings → Usage Limits or with the ai_cis_* limit filters.
 */
final class AI_CIS_Usage_Manager {

	const OPTION         = 'ai_cis_usage';
	const HISTORY_MONTHS = 12;
	const RECENT_IDS     = 100;

	/**
	 * Usage types and the filter controlling each limit.
	 *
	 * @return array Map of type => filter name.
	 */
	public static function type_filters() {
		return array(
			'content'    => 'ai_cis_monthly_ai_limit',
			'image'      => 'ai_cis_monthly_image_limit',
			'product'    => 'ai_cis_monthly_product_limit',
			'auto_image' => 'ai_cis_monthly_auto_image_limit',
			'review'     => 'ai_cis_monthly_review_limit',
		);
	}

	/**
	 * Human readable labels per type.
	 *
	 * @return array
	 */
	public static function type_labels() {
		return array(
			'content'    => __( 'AI content generations', 'wbd-content-image-seo-assistant' ),
			'image'      => __( 'Image metadata generations', 'wbd-content-image-seo-assistant' ),
			'product'    => __( 'WooCommerce product generations', 'wbd-content-image-seo-assistant' ),
			'auto_image' => __( 'Automatic image optimizations', 'wbd-content-image-seo-assistant' ),
			'review'     => __( 'Review summaries', 'wbd-content-image-seo-assistant' ),
		);
	}

	/**
	 * Validates a usage type.
	 *
	 * @param string $type Usage type.
	 * @return bool
	 */
	public static function is_valid_type( $type ) {
		return array_key_exists( $type, self::type_filters() );
	}

	/**
	 * Current period in the site's timezone (YYYY-MM). Calculated on every call
	 * so the monthly reset never depends on WP-Cron.
	 *
	 * @return string
	 */
	public static function current_period() {
		return wp_date( 'Y-m', null, wp_timezone() );
	}

	/**
	 * First day of next period in the site timezone (Y-m-d).
	 *
	 * @return string
	 */
	public static function next_reset_date() {
		$now  = new DateTimeImmutable( 'now', wp_timezone() );
		$next = $now->modify( 'first day of next month' )->setTime( 0, 0 );
		return $next->format( 'Y-m-d' );
	}

	/**
	 * Loads the stored usage record, rolling it over when the month changed.
	 *
	 * @return array
	 */
	private static function load() {
		$data   = get_option( self::OPTION, array() );
		$data   = is_array( $data ) ? $data : array();
		$period = self::current_period();

		$empty_counts = array_fill_keys( array_keys( self::type_filters() ), 0 );

		if ( empty( $data['period'] ) ) {
			return array(
				'period'  => $period,
				'counts'  => $empty_counts,
				'history' => array(),
				'recent'  => array(),
			);
		}

		$data['counts']  = isset( $data['counts'] ) && is_array( $data['counts'] ) ? array_merge( $empty_counts, $data['counts'] ) : $empty_counts;
		$data['history'] = isset( $data['history'] ) && is_array( $data['history'] ) ? $data['history'] : array();
		$data['recent']  = isset( $data['recent'] ) && is_array( $data['recent'] ) ? $data['recent'] : array();

		if ( $data['period'] !== $period ) {
			$data['history'][ $data['period'] ] = $data['counts'];
			krsort( $data['history'] );
			$data['history'] = array_slice( $data['history'], 0, self::HISTORY_MONTHS, true );
			$data['period']  = $period;
			$data['counts']  = $empty_counts;
			$data['recent']  = array();
			AI_CIS_Logger::log( 'Usage period rolled over', array( 'period' => $period ) );
		}

		return $data;
	}

	/**
	 * Persists usage.
	 *
	 * @param array $data Usage data.
	 * @return void
	 */
	private static function save( $data ) {
		update_option( self::OPTION, $data, false );
	}

	/**
	 * Returns the monthly limit for a type. 0 means unlimited.
	 *
	 * @param string $type Usage type.
	 * @return int
	 */
	public static function get_limit( $type ) {
		$filters = self::type_filters();
		if ( ! isset( $filters[ $type ] ) ) {
			return 0;
		}

		$limits = AI_CIS_Settings::get( 'limits', array() );
		$limit  = isset( $limits[ $type ] ) ? absint( $limits[ $type ] ) : 0;

		/**
		 * Filters a monthly usage limit. Return 0 for unlimited.
		 *
		 * Filters: ai_cis_monthly_ai_limit, ai_cis_monthly_image_limit,
		 * ai_cis_monthly_product_limit, ai_cis_monthly_auto_image_limit,
		 * ai_cis_monthly_review_limit.
		 *
		 * @param int $limit Monthly limit.
		 */
		return absint( apply_filters( $filters[ $type ], $limit ) ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- Hook names come from type_filters() and are all prefixed with ai_cis_.
	}

	/**
	 * Returns all limits.
	 *
	 * @return array Map of type => limit (0 = unlimited).
	 */
	public static function get_limits() {
		$limits = array();
		foreach ( array_keys( self::type_filters() ) as $type ) {
			$limits[ $type ] = self::get_limit( $type );
		}
		return $limits;
	}

	/**
	 * Maximum number of items accepted in one bulk batch. 0 means unlimited.
	 *
	 * @return int
	 */
	public static function get_bulk_batch_limit() {
		$limits = AI_CIS_Settings::get( 'limits', array() );
		$limit  = isset( $limits['bulk_batch'] ) ? absint( $limits['bulk_batch'] ) : 0;

		/**
		 * Filters the maximum number of items per bulk batch. Return 0 for unlimited.
		 *
		 * @param int $limit Bulk batch limit.
		 */
		return absint( apply_filters( 'ai_cis_bulk_batch_limit', $limit ) );
	}

	/**
	 * Returns current usage counts.
	 *
	 * @return array Map of type => count.
	 */
	public static function get_usage() {
		$data = self::load();
		return array_map( 'absint', $data['counts'] );
	}

	/**
	 * Returns past months' usage.
	 *
	 * @return array Map of period => counts.
	 */
	public static function get_history() {
		$data = self::load();
		return $data['history'];
	}

	/**
	 * Remaining usage for a type, or null when unlimited.
	 *
	 * @param string $type Usage type.
	 * @return int|null
	 */
	public static function get_remaining( $type = '' ) {
		if ( '' === $type ) {
			$all = array();
			foreach ( array_keys( self::type_filters() ) as $usage_type ) {
				$all[ $usage_type ] = self::get_remaining( $usage_type );
			}
			return $all;
		}

		$limit = self::get_limit( $type );
		if ( 0 === $limit ) {
			return null;
		}
		$usage = self::get_usage();
		$used  = isset( $usage[ $type ] ) ? $usage[ $type ] : 0;
		return max( 0, $limit - $used );
	}

	/**
	 * Whether a type can be used for the given amount.
	 *
	 * @param string $type   Usage type.
	 * @param int    $amount Amount needed.
	 * @return bool
	 */
	public static function can_use( $type, $amount = 1 ) {
		if ( ! self::is_valid_type( $type ) ) {
			return false;
		}
		$remaining = self::get_remaining( $type );

		$allowed = null === $remaining || $remaining >= max( 1, (int) $amount );

		/**
		 * Filters whether a usage type can be consumed.
		 *
		 * @param bool   $allowed Whether usage is allowed.
		 * @param string $type    Usage type.
		 * @param int    $amount  Requested amount.
		 */
		return (bool) apply_filters( 'ai_cis_can_use', $allowed, $type, $amount );
	}

	/**
	 * Records usage. Passing the same request ID twice only counts once, which
	 * prevents accidental double counting from retries or double submissions.
	 *
	 * @param string $type       Usage type.
	 * @param int    $amount     Amount to record.
	 * @param string $request_id Optional idempotency key.
	 * @return bool True when recorded, false when skipped.
	 */
	public static function consume( $type, $amount = 1, $request_id = '' ) {
		if ( ! self::is_valid_type( $type ) ) {
			return false;
		}

		$data       = self::load();
		$request_id = substr( preg_replace( '/[^A-Za-z0-9_\-:]/', '', (string) $request_id ), 0, 64 );

		if ( '' !== $request_id ) {
			$key = $type . ':' . $request_id;
			if ( in_array( $key, $data['recent'], true ) ) {
				AI_CIS_Logger::log( 'Duplicate usage ignored', array( 'type' => $type ) );
				return false;
			}
			$data['recent'][] = $key;
			if ( count( $data['recent'] ) > self::RECENT_IDS ) {
				$data['recent'] = array_slice( $data['recent'], -self::RECENT_IDS );
			}
		}

		$data['counts'][ $type ] = absint( $data['counts'][ $type ] ) + max( 1, absint( $amount ) );
		self::save( $data );

		AI_CIS_Logger::log( 'Usage consumed', array( 'type' => $type ) );

		/**
		 * Fires after usage is recorded.
		 *
		 * @param string $type   Usage type.
		 * @param int    $amount Amount recorded.
		 */
		do_action( 'ai_cis_usage_consumed', $type, $amount );

		return true;
	}

	/**
	 * Resets the current month's counters (admin tool).
	 *
	 * @return void
	 */
	public static function reset_current() {
		$data           = self::load();
		$data['counts'] = array_fill_keys( array_keys( self::type_filters() ), 0 );
		$data['recent'] = array();
		self::save( $data );
	}

	/**
	 * Full usage report for the dashboard.
	 *
	 * @return array
	 */
	public static function get_report() {
		$usage  = self::get_usage();
		$labels = self::type_labels();
		$types  = array();

		foreach ( array_keys( self::type_filters() ) as $type ) {
			$limit          = self::get_limit( $type );
			$used           = isset( $usage[ $type ] ) ? $usage[ $type ] : 0;
			$types[ $type ] = array(
				'label'     => $labels[ $type ],
				'used'      => $used,
				'limit'     => $limit,
				'unlimited' => 0 === $limit,
				'remaining' => self::get_remaining( $type ),
				'percent'   => $limit > 0 ? min( 100, (int) round( ( $used / $limit ) * 100 ) ) : 0,
			);
		}

		return array(
			'period'     => self::current_period(),
			'reset_date' => self::next_reset_date(),
			'types'      => $types,
			'bulk_batch' => self::get_bulk_batch_limit(),
			'history'    => self::get_history(),
		);
	}
}
