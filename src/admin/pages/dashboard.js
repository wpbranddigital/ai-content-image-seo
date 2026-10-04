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
						{ __( 'Open', 'ai-content-image-seo' ) }
					</Button>
					<p className="description" id={ 'reason-' + icon }>
						{ disabledReason }
					</p>
				</>
			) : (
				<Button variant="secondary" href={ href }>
					{ __( 'Open', 'ai-content-image-seo' ) }
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
								'ai-content-image-seo'
							) }
						</strong>{ ' ' }
						{ __(
							'New images will remain unprocessed until the limit resets.',
							'ai-content-image-seo'
						) }
					</p>
				</Notice>
			) }

			<div className="ai-cis-grid-main">
				<Section
					title={ __(
						'AI Usage This Month',
						'ai-content-image-seo'
					) }
					actions={
						<Button variant="link" href={ pages.usage }>
							{ __( 'View details', 'ai-content-image-seo' ) }
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
										'ai-content-image-seo'
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
										'ai-content-image-seo'
									),
									usage.reset_date
								) }
							</p>
						</>
					) }
				</Section>

				{ data().canUpload && (
					<Section
						title={ __( 'Media Library', 'ai-content-image-seo' ) }
						actions={
							<Button
								variant="link"
								href={ pages.image + '&tab=bulk' }
							>
								{ __(
									'Bulk Optimizer',
									'ai-content-image-seo'
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
											'ai-content-image-seo'
										) }
									</dt>
									<dd>{ stats.total }</dd>
								</div>
								<div>
									<dt>
										{ __(
											'Missing Alt Text',
											'ai-content-image-seo'
										) }
									</dt>
									<dd>{ stats.missing_alt }</dd>
								</div>
								<div>
									<dt>
										{ __(
											'Missing Title',
											'ai-content-image-seo'
										) }
									</dt>
									<dd>{ stats.missing_title }</dd>
								</div>
								<div>
									<dt>
										{ __(
											'Missing Description',
											'ai-content-image-seo'
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
										'ai-content-image-seo'
									),
									usage.auto_queue
								) }
							</p>
						) }
					</Section>
				) }
			</div>

			<h2 className="ai-cis-section-title">
				{ __( 'Quick Actions', 'ai-content-image-seo' ) }
			</h2>
			<div className="ai-cis-quick-grid">
				<QuickAction
					icon="dashicons-edit-page"
					title={ __( 'Generate Content', 'ai-content-image-seo' ) }
					text={ __(
						'Write a complete post or page with title, excerpt and SEO metadata.',
						'ai-content-image-seo'
					) }
					href={ pages.content }
				/>
				<QuickAction
					icon="dashicons-format-gallery"
					title={ __( 'Optimize Images', 'ai-content-image-seo' ) }
					text={ __(
						'Fill in missing image metadata across your media library in the background.',
						'ai-content-image-seo'
					) }
					href={ pages.image ? pages.image + '&tab=bulk' : '' }
					disabledReason={
						! data().canUpload
							? __(
									'You need permission to upload files.',
									'ai-content-image-seo'
							  )
							: ''
					}
				/>
				<QuickAction
					icon="dashicons-cart"
					title={ __( 'Optimize Products', 'ai-content-image-seo' ) }
					text={ __(
						'Generate product titles, descriptions, tags, categories and review summaries.',
						'ai-content-image-seo'
					) }
					href={ pages.woocommerce }
					disabledReason={
						! data().isWooActive
							? __(
									'Requires WooCommerce to be installed and active.',
									'ai-content-image-seo'
							  )
							: ''
					}
				/>
				<QuickAction
					icon="dashicons-update"
					title={ __( 'Rewrite Content', 'ai-content-image-seo' ) }
					text={ __(
						'Improve, shorten, expand or fix grammar in existing content with a side-by-side preview.',
						'ai-content-image-seo'
					) }
					href={ pages.content + '&tab=rewrite' }
				/>
				<QuickAction
					icon="dashicons-universal-access-alt"
					title={ __( 'Generate Alt Text', 'ai-content-image-seo' ) }
					text={ __(
						'Create accessible, context-aware alt text for a single image.',
						'ai-content-image-seo'
					) }
					href={ pages.image ? pages.image + '&tab=single' : '' }
					disabledReason={
						! data().canUpload
							? __(
									'You need permission to upload files.',
									'ai-content-image-seo'
							  )
							: ''
					}
				/>
				<QuickAction
					icon="dashicons-search"
					title={ __( 'SEO Assistant', 'ai-content-image-seo' ) }
					text={ sprintf(
						/* translators: %s: SEO plugin name. */
						__(
							'Generate SEO titles and meta descriptions. Saves to: %s.',
							'ai-content-image-seo'
						),
						data().seoPluginLabel
					) }
					href={ pages.seo }
				/>
			</div>
		</div>
	);
}
