/**
 * Usage & limits.
 */
import { Button, Spinner, Notice } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { request, errorInfo, data } from '../../common/api';
import {
	Section,
	UsageMeter,
	ErrorNotice,
	EmptyState,
} from '../../common/components';

export default function UsagePage() {
	const [ usage, setUsage ] = useState( null );
	const [ error, setError ] = useState( null );
	const [ busy, setBusy ] = useState( false );

	useEffect( () => {
		request( '/usage' )
			.then( setUsage )
			.catch( ( e ) => setError( errorInfo( e ) ) );
	}, [] );

	const reset = async () => {
		if (
			// eslint-disable-next-line no-alert
			! window.confirm(
				__(
					'Reset this month’s usage counters to zero?',
					'wbd-content-image-seo-assistant'
				)
			)
		) {
			return;
		}
		setBusy( true );
		try {
			setUsage( await request( '/usage/reset', { method: 'POST' } ) );
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( false );
	};

	if ( ! usage ) {
		return error ? <ErrorNotice error={ error } /> : <Spinner />;
	}

	const history = Object.entries( usage.history || {} );
	const types = usage.types;

	return (
		<div className="ai-cis-page">
			<Notice
				status="info"
				isDismissible={ false }
				className="ai-cis-notice"
			>
				<p>
					{ __(
						'Every feature is available for free. Usage is tracked so you can see how much AI you use; limits are optional and can be set in Settings → Usage Limits (0 = unlimited).',
						'wbd-content-image-seo-assistant'
					) }
				</p>
			</Notice>
			{ usage.auto_limit_hit && (
				<Notice
					status="warning"
					isDismissible={ false }
					className="ai-cis-notice"
				>
					<p>
						{ __(
							'AI usage limit reached. New images will remain unprocessed until the limit resets.',
							'wbd-content-image-seo-assistant'
						) }
					</p>
				</Notice>
			) }
			<ErrorNotice error={ error } />
			<Section
				title={ sprintf(
					/* translators: %s: period YYYY-MM. */
					__( 'Usage for %s', 'wbd-content-image-seo-assistant' ),
					usage.period
				) }
				actions={
					data().isManager && (
						<>
							<Button
								variant="secondary"
								href={ data().pages.settings + '&tab=limits' }
							>
								{ __(
									'Edit Limits',
									'wbd-content-image-seo-assistant'
								) }
							</Button>
							<Button
								variant="tertiary"
								isDestructive
								onClick={ reset }
								disabled={ busy }
							>
								{ __(
									'Reset Counters',
									'wbd-content-image-seo-assistant'
								) }
							</Button>
						</>
					)
				}
			>
				{ Object.entries( types ).map( ( [ key, type ] ) => (
					<UsageMeter key={ key } type={ type } />
				) ) }
				<table className="widefat striped ai-cis-table">
					<thead>
						<tr>
							<th scope="col">
								{ __(
									'Type',
									'wbd-content-image-seo-assistant'
								) }
							</th>
							<th scope="col">
								{ __(
									'Used',
									'wbd-content-image-seo-assistant'
								) }
							</th>
							<th scope="col">
								{ __(
									'Limit',
									'wbd-content-image-seo-assistant'
								) }
							</th>
							<th scope="col">
								{ __(
									'Remaining',
									'wbd-content-image-seo-assistant'
								) }
							</th>
						</tr>
					</thead>
					<tbody>
						{ Object.entries( types ).map( ( [ key, type ] ) => (
							<tr key={ key }>
								<td>{ type.label }</td>
								<td>{ type.used }</td>
								<td>
									{ type.unlimited
										? __(
												'Unlimited',
												'wbd-content-image-seo-assistant'
										  )
										: type.limit }
								</td>
								<td>
									{ type.unlimited
										? __(
												'Unlimited',
												'wbd-content-image-seo-assistant'
										  )
										: type.remaining }
								</td>
							</tr>
						) ) }
						<tr>
							<td>
								{ __(
									'Bulk items per batch',
									'wbd-content-image-seo-assistant'
								) }
							</td>
							<td>—</td>
							<td>
								{ usage.bulk_batch
									? usage.bulk_batch
									: __(
											'Unlimited',
											'wbd-content-image-seo-assistant'
									  ) }
							</td>
							<td>—</td>
						</tr>
					</tbody>
				</table>
				<p className="description">
					{ sprintf(
						/* translators: %s: date. */
						__(
							'Counters reset automatically on %s (site timezone). Regenerating a result counts as a new generation. Connection tests are never counted.',
							'wbd-content-image-seo-assistant'
						),
						usage.reset_date
					) }
				</p>
			</Section>

			<Section
				title={ __( 'History', 'wbd-content-image-seo-assistant' ) }
			>
				{ history.length === 0 ? (
					<EmptyState
						title={ __(
							'No history yet.',
							'wbd-content-image-seo-assistant'
						) }
						text={ __(
							'Monthly totals appear here after your first full month.',
							'wbd-content-image-seo-assistant'
						) }
					/>
				) : (
					<table className="widefat striped ai-cis-table">
						<thead>
							<tr>
								<th scope="col">
									{ __(
										'Month',
										'wbd-content-image-seo-assistant'
									) }
								</th>
								{ Object.entries( types ).map(
									( [ key, type ] ) => (
										<th scope="col" key={ key }>
											{ type.label }
										</th>
									)
								) }
							</tr>
						</thead>
						<tbody>
							{ history.map( ( [ period, counts ] ) => (
								<tr key={ period }>
									<td>{ period }</td>
									{ Object.keys( types ).map( ( key ) => (
										<td key={ key }>
											{ counts[ key ] || 0 }
										</td>
									) ) }
								</tr>
							) ) }
						</tbody>
					</table>
				) }
			</Section>
		</div>
	);
}
