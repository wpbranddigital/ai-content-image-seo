/**
 * Dashboard: real usage numbers, quick actions and library status.
 */
import { Button, Notice, Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { request, errorInfo, data } from '../../common/api';
import {
	Section,
	UsageMeter,
	ErrorNotice,
	ProviderNotice,
} from '../../common/components';

function QuickAction( { icon, title, text, href, disabledReason } ) {
	return (
		<div
			className={
				'ai-cis-quick' + ( disabledReason ? ' is-disabled' : '' )
			}
		>
			<span className={ 'dashicons ' + icon } aria-hidden="true" />
			<h3>{ title }</h3>
			<p>{ text }</p>
			{ disabledReason ? (
				<>
					<Button
						variant="secondary"
						disabled
						aria-describedby={ 'reason-' + icon }
					>
						{ __( 'Open', 'wbd-content-image-seo-assistant' ) }
					</Button>
					<p className="description" id={ 'reason-' + icon }>
						{ disabledReason }
					</p>
				</>
			) : (
				<Button variant="secondary" href={ href }>
					{ __( 'Open', 'wbd-content-image-seo-assistant' ) }
				</Button>
			) }
		</div>
	);
}

export default function Dashboard() {
	const [ usage, setUsage ] = useState( null );
	const [ stats, setStats ] = useState( null );
	const [ error, setError ] = useState( null );
	const pages = data().pages;

	useEffect( () => {
		request( '/usage' )
			.then( setUsage )
			.catch( ( e ) => setError( errorInfo( e ) ) );
		if ( data().canUpload ) {
			request( '/images/stats' )
				.then( setStats )
				.catch( () => {} );
		}
	}, [] );

	const total = usage
		? Object.values( usage.types ).reduce( ( sum, t ) => sum + t.used, 0 )
		: 0;

	return (
		<div className="ai-cis-page">
			<ProviderNotice />
			<ErrorNotice error={ error } />

			{ usage?.auto_limit_hit && (
				<Notice
					status="warning"
					isDismissible={ false }
					className="ai-cis-notice"
				>
					<p>
						<strong>
							{ __(
								'AI usage limit reached.',
								'wbd-content-image-seo-assistant'
							) }
						</strong>{ ' ' }
						{ __(
							'New images will remain unprocessed until the limit resets.',
							'wbd-content-image-seo-assistant'
						) }
					</p>
				</Notice>
			) }

			<div className="ai-cis-grid-main">
				<Section
					title={ __(
						'AI Usage This Month',
						'wbd-content-image-seo-assistant'
					) }
					actions={
						<Button variant="link" href={ pages.usage }>
							{ __(
								'View details',
								'wbd-content-image-seo-assistant'
							) }
						</Button>
					}
				>
					{ ! usage && ! error && <Spinner /> }
					{ usage && (
						<>
							<p className="ai-cis-big-number">
								{ sprintf(
									/* translators: %d: total AI requests this month. */
									__(
										'%d AI requests this month',
										'wbd-content-image-seo-assistant'
									),
									total
								) }
							</p>
							{ Object.entries( usage.types ).map(
								( [ key, type ] ) => (
									<UsageMeter key={ key } type={ type } />
								)
							) }
							<p className="description">
								{ sprintf(
									/* translators: %s: reset date. */
									__(
										'Counters reset on %s. All features are free; limits are optional and set by the site owner.',
										'wbd-content-image-seo-assistant'
									),
									usage.reset_date
								) }
							</p>
						</>
					) }
				</Section>

				{ data().canUpload && (
					<Section
						title={ __(
							'Media Library',
							'wbd-content-image-seo-assistant'
						) }
						actions={
							<Button
								variant="link"
								href={ pages.image + '&tab=bulk' }
							>
								{ __(
									'Bulk Optimizer',
									'wbd-content-image-seo-assistant'
								) }
							</Button>
						}
					>
						{ ! stats && <Spinner /> }
						{ stats && (
							<dl className="ai-cis-stats">
								<div>
									<dt>
										{ __(
											'Total Images',
											'wbd-content-image-seo-assistant'
										) }
									</dt>
									<dd>{ stats.total }</dd>
								</div>
								<div>
									<dt>
										{ __(
											'Missing Alt Text',
											'wbd-content-image-seo-assistant'
										) }
									</dt>
									<dd>{ stats.missing_alt }</dd>
								</div>
								<div>
									<dt>
										{ __(
											'Missing Title',
											'wbd-content-image-seo-assistant'
										) }
									</dt>
									<dd>{ stats.missing_title }</dd>
								</div>
								<div>
									<dt>
										{ __(
											'Missing Description',
											'wbd-content-image-seo-assistant'
										) }
									</dt>
									<dd>{ stats.missing_description }</dd>
								</div>
							</dl>
						) }
						{ usage && usage.auto_queue > 0 && (
							<p className="description">
								{ sprintf(
									/* translators: %d: number of images. */
									__(
										'%d new images waiting for automatic optimization.',
										'wbd-content-image-seo-assistant'
									),
									usage.auto_queue
								) }
							</p>
						) }
					</Section>
				) }
			</div>

			<h2 className="ai-cis-section-title">
				{ __( 'Quick Actions', 'wbd-content-image-seo-assistant' ) }
			</h2>
			<div className="ai-cis-quick-grid">
				<QuickAction
					icon="dashicons-edit-page"
					title={ __(
						'Generate Content',
						'wbd-content-image-seo-assistant'
					) }
					text={ __(
						'Write a complete post or page with title, excerpt and SEO metadata.',
						'wbd-content-image-seo-assistant'
					) }
					href={ pages.content }
				/>
				<QuickAction
					icon="dashicons-format-gallery"
					title={ __(
						'Optimize Images',
						'wbd-content-image-seo-assistant'
					) }
					text={ __(
						'Fill in missing image metadata across your media library in the background.',
						'wbd-content-image-seo-assistant'
					) }
					href={ pages.image ? pages.image + '&tab=bulk' : '' }
					disabledReason={
						! data().canUpload
							? __(
									'You need permission to upload files.',
									'wbd-content-image-seo-assistant'
							  )
							: ''
					}
				/>
				<QuickAction
					icon="dashicons-cart"
					title={ __(
						'Optimize Products',
						'wbd-content-image-seo-assistant'
					) }
					text={ __(
						'Generate product titles, descriptions, tags, categories and review summaries.',
						'wbd-content-image-seo-assistant'
					) }
					href={ pages.woocommerce }
					disabledReason={
						! data().isWooActive
							? __(
									'Requires WooCommerce to be installed and active.',
									'wbd-content-image-seo-assistant'
							  )
							: ''
					}
				/>
				<QuickAction
					icon="dashicons-update"
					title={ __(
						'Rewrite Content',
						'wbd-content-image-seo-assistant'
					) }
					text={ __(
						'Improve, shorten, expand or fix grammar in existing content with a side-by-side preview.',
						'wbd-content-image-seo-assistant'
					) }
					href={ pages.content + '&tab=rewrite' }
				/>
				<QuickAction
					icon="dashicons-universal-access-alt"
					title={ __(
						'Generate Alt Text',
						'wbd-content-image-seo-assistant'
					) }
					text={ __(
						'Create accessible, context-aware alt text for a single image.',
						'wbd-content-image-seo-assistant'
					) }
					href={ pages.image ? pages.image + '&tab=single' : '' }
					disabledReason={
						! data().canUpload
							? __(
									'You need permission to upload files.',
									'wbd-content-image-seo-assistant'
							  )
							: ''
					}
				/>
				<QuickAction
					icon="dashicons-search"
					title={ __(
						'SEO Assistant',
						'wbd-content-image-seo-assistant'
					) }
					text={ sprintf(
						/* translators: %s: SEO plugin name. */
						__(
							'Generate SEO titles and meta descriptions. Saves to: %s.',
							'wbd-content-image-seo-assistant'
						),
						data().seoPluginLabel
					) }
					href={ pages.seo }
				/>
			</div>
		</div>
	);
}
