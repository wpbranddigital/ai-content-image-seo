<?php
/**
 * Background processing for bulk image optimization and automatic optimization.
 *
 * @package AI_Content_Image_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Small, resumable queue. Uses Action Scheduler when available (WooCommerce),
 * otherwise WP-Cron. The admin UI also advances the queue while it is open, so
 * progress never depends on WP-Cron alone. Items are processed a few at a time
 * within a time budget.
 */
final class AI_CIS_Queue {

	const JOB_OPTION   = 'ai_cis_bulk_job';
	const AUTO_OPTION  = 'ai_cis_auto_queue';
	const LIMIT_OPTION = 'ai_cis_auto_limit_hit';
	const LOCK         = 'ai_cis_bulk_lock';
	const AUTO_LOCK    = 'ai_cis_auto_lock';
	const BULK_HOOK    = 'ai_cis_process_bulk';
	const AUTO_HOOK    = 'ai_cis_process_auto';
	const GROUP        = 'ai-content-image-seo';

	/**
	 * Registers hooks. Cheap: only adds callbacks.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( self::BULK_HOOK, array( __CLASS__, 'run_scheduled_bulk' ) );
		add_action( self::AUTO_HOOK, array( __CLASS__, 'process_auto' ) );
		add_action( 'add_attachment', array( __CLASS__, 'maybe_queue_new_image' ) );
	}

	/**
	 * Seconds of work allowed per run.
	 *
	 * @return int
	 */
	private static function time_budget() {
		/**
		 * Filters the seconds spent per queue run before yielding.
		 *
		 * @param int $seconds Time budget.
		 */
		return max( 5, (int) apply_filters( 'ai_cis_queue_time_budget', 20 ) );
	}

	/**
	 * Maximum items per run.
	 *
	 * @return int
	 */
	private static function chunk_size() {
		/**
		 * Filters the number of images processed per queue run.
		 *
		 * @param int $size Items per run. Default 5.
		 */
		return max( 1, min( 20, (int) apply_filters( 'ai_cis_bulk_chunk_size', 5 ) ) );
	}

	/**
	 * Schedules a hook to run as soon as possible.
	 *
	 * @param string $hook  Hook name.
	 * @param int    $delay Delay in seconds.
	 * @return void
	 */
	private static function schedule( $hook, $delay = 0 ) {
		if ( function_exists( 'as_enqueue_async_action' ) && function_exists( 'as_has_scheduled_action' ) && function_exists( 'as_schedule_single_action' ) ) {
			if ( ! as_has_scheduled_action( $hook, array(), self::GROUP ) ) {
				if ( $delay > 0 ) {
					as_schedule_single_action( time() + $delay, $hook, array(), self::GROUP );
				} else {
					as_enqueue_async_action( $hook, array(), self::GROUP );
				}
			}
			return;
		}

		if ( ! wp_next_scheduled( $hook ) ) {
			wp_schedule_single_event( time() + max( 1, $delay ), $hook );
		}
	}

	/**
	 * Removes scheduled events for a hook.
	 *
	 * @param string $hook Hook.
	 * @return void
	 */
	public static function unschedule( $hook ) {
		if ( function_exists( 'as_unschedule_all_actions' ) ) {
			as_unschedule_all_actions( $hook, array(), self::GROUP );
		}
		wp_clear_scheduled_hook( $hook );
	}

	/**
	 * Returns the current bulk job.
	 *
	 * @return array|null
	 */
	public static function get_job() {
		$job = get_option( self::JOB_OPTION, null );
		return is_array( $job ) ? $job : null;
	}

	/**
	 * Saves the bulk job.
	 *
	 * @param array $job Job.
	 * @return void
	 */
	private static function save_job( $job ) {
		$job['updated'] = time();
		update_option( self::JOB_OPTION, $job, false );
	}

	/**
	 * Public job status (no internal ID list).
	 *
	 * @return array
	 */
	public static function status() {
		$job = self::get_job();
		if ( ! $job ) {
			return array( 'status' => 'idle' );
		}
		$remaining = count( $job['ids'] );
		return array(
			'status'      => $job['status'],
			'total'       => (int) $job['total'],
			'processed'   => (int) $job['processed'],
			'optimized'   => (int) $job['optimized'],
			'skipped'     => (int) $job['skipped'],
			'failed'      => (int) $job['failed'],
			'remaining'   => $remaining,
			'percent'     => $job['total'] > 0 ? (int) floor( ( $job['processed'] / $job['total'] ) * 100 ) : 100,
			'fields'      => $job['fields'],
			'overwrite'   => (bool) $job['overwrite'],
			'stop_reason' => isset( $job['stop_reason'] ) ? $job['stop_reason'] : '',
			'truncated'   => isset( $job['truncated'] ) ? (int) $job['truncated'] : 0,
			'errors'      => isset( $job['errors'] ) ? $job['errors'] : array(),
			'started'     => (int) $job['started'],
			'updated'     => (int) $job['updated'],
		);
	}

	/**
	 * Starts a bulk job.
	 *
	 * @param int[] $ids       Attachment IDs.
	 * @param array $fields    Fields to fill.
	 * @param bool  $overwrite Overwrite existing values.
	 * @return array|WP_Error Status.
	 */
	public static function start( $ids, $fields, $overwrite ) {
		$current = self::get_job();
		if ( $current && in_array( $current['status'], array( 'running', 'paused' ), true ) && ! empty( $current['ids'] ) ) {
			return new WP_Error( 'ai_cis_job_exists', __( 'A bulk optimization is already in progress. Resume or cancel it first.', 'ai-content-image-seo' ), array( 'status' => 409 ) );
		}

		$fields = AI_CIS_Image_Optimizer::sanitize_fields( $fields );
		if ( empty( $fields ) ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'Select at least one field.', 'ai-content-image-seo' ), array( 'status' => 400 ) );
		}

		$ids = array_values( array_unique( array_filter( array_map( 'absint', (array) $ids ) ) ) );
		$ids = array_values( array_filter( $ids, array( 'AI_CIS_Image_Optimizer', 'is_image' ) ) );

		if ( empty( $ids ) ) {
			return new WP_Error( 'ai_cis_invalid_input', __( 'No images selected.', 'ai-content-image-seo' ), array( 'status' => 400 ) );
		}

		$truncated = 0;
		$limit     = AI_CIS_Usage_Manager::get_bulk_batch_limit();
		if ( $limit > 0 && count( $ids ) > $limit ) {
			$truncated = count( $ids ) - $limit;
			$ids       = array_slice( $ids, 0, $limit );
		}

		if ( ! AI_CIS_Usage_Manager::can_use( 'image' ) ) {
			return AI_CIS_AI_Manager::error( 'ai_cis_limit_reached' );
		}
		if ( ! AI_CIS_AI_Manager::is_ready() ) {
			return AI_CIS_AI_Manager::error( 'ai_cis_no_provider' );
		}

		$job = array(
			'status'      => 'running',
			'ids'         => $ids,
			'total'       => count( $ids ),
			'processed'   => 0,
			'optimized'   => 0,
			'skipped'     => 0,
			'failed'      => 0,
			'errors'      => array(),
			'fields'      => $fields,
			'overwrite'   => (bool) $overwrite,
			'started'     => time(),
			'updated'     => time(),
			'truncated'   => $truncated,
			'stop_reason' => '',
			'user'        => get_current_user_id(),
		);
		self::save_job( $job );
		self::schedule( self::BULK_HOOK );

		AI_CIS_Logger::log( 'Bulk job started', array( 'items' => count( $ids ) ) );

		return self::status();
	}

	/**
	 * Pauses, resumes or cancels the job.
	 *
	 * @param string $action pause|resume|cancel|clear.
	 * @return array|WP_Error
	 */
	public static function control( $action ) {
		$job = self::get_job();
		if ( ! $job ) {
			return self::status();
		}

		switch ( $action ) {
			case 'pause':
				if ( 'running' === $job['status'] ) {
					$job['status']      = 'paused';
					$job['stop_reason'] = 'user';
					self::save_job( $job );
					self::unschedule( self::BULK_HOOK );
				}
				break;
			case 'resume':
				if ( 'paused' === $job['status'] && ! empty( $job['ids'] ) ) {
					if ( ! AI_CIS_Usage_Manager::can_use( 'image' ) ) {
						return AI_CIS_AI_Manager::error( 'ai_cis_limit_reached' );
					}
					$job['status']      = 'running';
					$job['stop_reason'] = '';
					self::save_job( $job );
					self::schedule( self::BULK_HOOK );
				}
				break;
			case 'cancel':
			case 'clear':
				delete_option( self::JOB_OPTION );
				self::unschedule( self::BULK_HOOK );
				delete_transient( self::LOCK );
				break;
		}

		return self::status();
	}

	/**
	 * Scheduled callback (cron/Action Scheduler pass no reliable arguments).
	 *
	 * @return void
	 */
	public static function run_scheduled_bulk() {
		self::process_bulk( true );
	}

	/**
	 * Processes a chunk of the bulk job. Safe to call from cron, Action
	 * Scheduler or the REST step endpoint; a lock prevents overlap.
	 *
	 * @param bool $reschedule Whether to schedule the next run.
	 * @return array Status.
	 */
	public static function process_bulk( $reschedule = true ) {
		$job = self::get_job();
		if ( ! $job || 'running' !== $job['status'] ) {
			return self::status();
		}

		if ( get_transient( self::LOCK ) ) {
			return self::status();
		}
		set_transient( self::LOCK, 1, self::time_budget() + 90 );

		// Cron/Action Scheduler runs have no user; act as the user who started the job.
		$restore_user = get_current_user_id();
		if ( ! $restore_user && ! empty( $job['user'] ) ) {
			wp_set_current_user( (int) $job['user'] );
		}

		$started = time();
		$count   = 0;

		while ( ! empty( $job['ids'] ) && $count < self::chunk_size() && ( time() - $started ) < self::time_budget() ) {
			$id = (int) array_shift( $job['ids'] );
			++$count;

			$result = AI_CIS_Image_Optimizer::process( $id, $job['fields'], $job['overwrite'], 'image' );

			if ( is_wp_error( $result ) ) {
				if ( 'ai_cis_limit_reached' === $result->get_error_code() ) {
					array_unshift( $job['ids'], $id );
					$job['status']      = 'paused';
					$job['stop_reason'] = 'limit';
					break;
				}
				if ( 'ai_cis_no_provider' === $result->get_error_code() ) {
					array_unshift( $job['ids'], $id );
					$job['status']      = 'paused';
					$job['stop_reason'] = 'provider';
					break;
				}
				++$job['failed'];
				++$job['processed'];
				$job['errors'][] = array(
					'id'      => $id,
					'title'   => get_the_title( $id ),
					'message' => $result->get_error_message(),
				);
				$job['errors']   = array_slice( $job['errors'], -20 );

				// Back off on provider rate limits instead of failing the whole batch.
				if ( 'ai_cis_rate_limit' === $result->get_error_code() ) {
					$job['status']      = 'paused';
					$job['stop_reason'] = 'rate_limit';
					break;
				}
				continue;
			}

			++$job['processed'];
			if ( 'skipped' === $result['status'] ) {
				++$job['skipped'];
			} else {
				++$job['optimized'];
			}

			// Persist progress after each item so a fatal error never loses work.
			self::save_job( $job );
		}

		if ( empty( $job['ids'] ) && 'running' === $job['status'] ) {
			$job['status'] = 'completed';
			AI_CIS_Logger::log( 'Bulk job completed', array( 'optimized' => $job['optimized'] ) );
		}

		self::save_job( $job );
		delete_transient( self::LOCK );
		wp_cache_delete( 'stats', AI_CIS_Image_Optimizer::CACHE_GROUP );

		if ( ! $restore_user && ! empty( $job['user'] ) ) {
			wp_set_current_user( 0 );
		}

		if ( $reschedule && 'running' === $job['status'] ) {
			self::schedule( self::BULK_HOOK );
		}

		return self::status();
	}

	/**
	 * Queues newly uploaded images for automatic optimization.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return void
	 */
	public static function maybe_queue_new_image( $attachment_id ) {
		if ( ! AI_CIS_Settings::get( 'auto_optimize', false ) ) {
			return;
		}
		$mime = (string) get_post_mime_type( $attachment_id );
		if ( 0 !== strpos( $mime, 'image/' ) ) {
			return;
		}

		/**
		 * Filters whether a newly uploaded image is queued for automatic optimization.
		 *
		 * @param bool $queue         Whether to queue.
		 * @param int  $attachment_id Attachment ID.
		 */
		if ( ! apply_filters( 'ai_cis_auto_optimize_image', true, $attachment_id ) ) {
			return;
		}

		$queue   = get_option( self::AUTO_OPTION, array() );
		$queue   = is_array( $queue ) ? $queue : array();
		$queue[] = (int) $attachment_id;
		update_option( self::AUTO_OPTION, array_values( array_unique( $queue ) ), false );
		update_post_meta( $attachment_id, AI_CIS_Image_Optimizer::META_STATUS, 'queued' );

		// Small delay so image sub-sizes exist before processing.
		self::schedule( self::AUTO_HOOK, 15 );
	}

	/**
	 * Number of images waiting for automatic optimization.
	 *
	 * @return int
	 */
	public static function auto_queue_count() {
		$queue = get_option( self::AUTO_OPTION, array() );
		return is_array( $queue ) ? count( $queue ) : 0;
	}

	/**
	 * Whether automation hit the monthly limit in the current period.
	 *
	 * @return bool
	 */
	public static function auto_limit_hit() {
		return get_option( self::LIMIT_OPTION, '' ) === AI_CIS_Usage_Manager::current_period();
	}

	/**
	 * Processes automatically queued images. Failed items are never retried
	 * automatically; images skipped because of the limit stay unprocessed.
	 *
	 * @return void
	 */
	public static function process_auto() {
		if ( get_transient( self::AUTO_LOCK ) ) {
			return;
		}

		$queue = get_option( self::AUTO_OPTION, array() );
		$queue = is_array( $queue ) ? array_values( $queue ) : array();
		if ( empty( $queue ) ) {
			return;
		}

		set_transient( self::AUTO_LOCK, 1, self::time_budget() + 90 );

		$fields  = AI_CIS_Settings::get( 'auto_fields', array( 'alt', 'title' ) );
		$started = time();
		$count   = 0;

		while ( ! empty( $queue ) && $count < self::chunk_size() && ( time() - $started ) < self::time_budget() ) {
			if ( ! AI_CIS_Usage_Manager::can_use( 'auto_image' ) ) {
				// Leave remaining images unprocessed until the limit resets. No retries.
				foreach ( $queue as $waiting_id ) {
					update_post_meta( (int) $waiting_id, AI_CIS_Image_Optimizer::META_STATUS, 'limit' );
				}
				$queue = array();
				update_option( self::LIMIT_OPTION, AI_CIS_Usage_Manager::current_period(), false );
				AI_CIS_Logger::log( 'Automatic optimization stopped: monthly limit reached' );
				break;
			}

			$id = (int) array_shift( $queue );
			++$count;

			if ( ! AI_CIS_Image_Optimizer::is_image( $id ) ) {
				continue;
			}

			$result = AI_CIS_Image_Optimizer::process( $id, $fields, false, 'auto_image' );
			if ( is_wp_error( $result ) ) {
				AI_CIS_Logger::log(
					'Automatic optimization failed',
					array(
						'attachment' => $id,
						'code'       => $result->get_error_code(),
					)
				);
			} elseif ( 'skipped' === $result['status'] ) {
				delete_post_meta( $id, AI_CIS_Image_Optimizer::META_STATUS );
			}

			update_option( self::AUTO_OPTION, $queue, false );
		}

		update_option( self::AUTO_OPTION, $queue, false );
		delete_transient( self::AUTO_LOCK );

		if ( ! empty( $queue ) ) {
			self::schedule( self::AUTO_HOOK, 5 );
		}
	}
}
