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
					'ai-content-image-seo'
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
						'ai-content-image-seo'
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
							'ai-content-image-seo'
						) }
					</p>
				</Notice>
			) }
			<ErrorNotice error={ error } />
			<Section
				title={ sprintf(
					/* translators: %s: period YYYY-MM. */
					__( 'Usage for %s', 'ai-content-image-seo' ),
					usage.period
				) }
				actions={
					data().isManager && (
						<>
							<Button
								variant="secondary"
								href={ data().pages.settings + '&tab=limits' }
							>
								{ __( 'Edit Limits', 'ai-content-image-seo' ) }
							</Button>
							<Button
								variant="tertiary"
								isDestructive
								onClick={ reset }
								disabled={ busy }
							>
								{ __(
									'Reset Counters',
									'ai-content-image-seo'
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
								{ __( 'Type', 'ai-content-image-seo' ) }
							</th>
							<th scope="col">
								{ __( 'Used', 'ai-content-image-seo' ) }
							</th>
							<th scope="col">
								{ __( 'Limit', 'ai-content-image-seo' ) }
							</th>
							<th scope="col">
								{ __( 'Remaining', 'ai-content-image-seo' ) }
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
												'ai-content-image-seo'
										  )
										: type.limit }
								</td>
								<td>
									{ type.unlimited
										? __(
												'Unlimited',
												'ai-content-image-seo'
										  )
										: type.remaining }
								</td>
							</tr>
						) ) }
						<tr>
							<td>
								{ __(
									'Bulk items per batch',
									'ai-content-image-seo'
								) }
							</td>
							<td>—</td>
							<td>
								{ usage.bulk_batch
									? usage.bulk_batch
									: __(
											'Unlimited',
											'ai-content-image-seo'
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
							'ai-content-image-seo'
						),
						usage.reset_date
					) }
				</p>
			</Section>

			<Section title={ __( 'History', 'ai-content-image-seo' ) }>
				{ history.length === 0 ? (
					<EmptyState
						title={ __(
							'No history yet.',
							'ai-content-image-seo'
						) }
						text={ __(
							'Monthly totals appear here after your first full month.',
							'ai-content-image-seo'
						) }
					/>
				) : (
					<table className="widefat striped ai-cis-table">
						<thead>
							<tr>
								<th scope="col">
									{ __( 'Month', 'ai-content-image-seo' ) }
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
