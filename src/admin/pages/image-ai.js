/**
 * Image AI: single image metadata, Bulk Optimizer and automation status.
 */
import {
	Button,
	CheckboxControl,
	Notice,
	SearchControl,
	SelectControl,
	Spinner,
	TabPanel,
	ToggleControl,
} from '@wordpress/components';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf, _n } from '@wordpress/i18n';
import { useDebounce } from '@wordpress/compose';
import { speak } from '@wordpress/a11y';
import { request, errorInfo, data } from '../../common/api';
import {
	Section,
	ErrorNotice,
	ProviderNotice,
	EmptyState,
	ProgressBar,
} from '../../common/components';
import ImageMetadataPanel from '../../common/image-metadata-panel';

/**
 * Opens the WordPress media frame to pick one image.
 *
 * @param {Function} onPick Callback with attachment ID.
 */
function openMediaFrame( onPick ) {
	if ( ! window.wp || ! window.wp.media ) {
		return;
	}
	const frame = window.wp.media( {
		title: __( 'Select an image', 'ai-content-image-seo' ),
		library: { type: 'image' },
		button: { text: __( 'Use this image', 'ai-content-image-seo' ) },
		multiple: false,
	} );
	frame.on( 'select', () => {
		const attachment = frame.state().get( 'selection' ).first();
		if ( attachment ) {
			onPick( attachment.get( 'id' ) );
		}
	} );
	frame.open();
}

function SingleTab() {
	const params = new window.URLSearchParams( window.location.search );
	const [ attachmentId, setAttachmentId ] = useState(
		parseInt( params.get( 'attachment' ), 10 ) || 0
	);

	return (
		<div className="ai-cis-page">
			<Section
				title={ __(
					'Generate Image Metadata',
					'ai-content-image-seo'
				) }
				actions={
					<Button
						variant="secondary"
						onClick={ () => openMediaFrame( setAttachmentId ) }
					>
						{ attachmentId
							? __(
									'Choose another image',
									'ai-content-image-seo'
							  )
							: __( 'Select Image', 'ai-content-image-seo' ) }
					</Button>
				}
			>
				{ attachmentId ? (
					<ImageMetadataPanel attachmentId={ attachmentId } />
				) : (
					<EmptyState
						title={ __(
							'No image selected.',
							'ai-content-image-seo'
						) }
						text={ __(
							'Pick an image from the Media Library to generate alt text, title, caption and description. You review everything before it is saved.',
							'ai-content-image-seo'
						) }
					>
						<Button
							variant="primary"
							onClick={ () => openMediaFrame( setAttachmentId ) }
						>
							{ __( 'Select Image', 'ai-content-image-seo' ) }
						</Button>
					</EmptyState>
				) }
			</Section>
		</div>
	);
}

function JobPanel( { job, onControl, busy } ) {
	if ( ! job || job.status === 'idle' ) {
		return null;
	}
	const statusText = {
		running: __( 'Optimizing Images', 'ai-content-image-seo' ),
		paused: __( 'Paused', 'ai-content-image-seo' ),
		completed: __( 'Completed', 'ai-content-image-seo' ),
	}[ job.status ];

	const reasons = {
		limit: __(
			'Paused because the monthly image limit was reached. It can resume when the limit resets or is raised.',
			'ai-content-image-seo'
		),
		provider: __(
			'Paused because no AI provider is configured.',
			'ai-content-image-seo'
		),
		rate_limit: __(
			'Paused because your AI provider rate limit was reached. Please resume in a few minutes.',
			'ai-content-image-seo'
		),
		user: __( 'Paused by you.', 'ai-content-image-seo' ),
	};

	return (
		<Section title={ statusText } className="ai-cis-job">
			<ProgressBar
				percent={ job.percent }
				label={ __(
					'Bulk optimization progress',
					'ai-content-image-seo'
				) }
			/>
			<p className="ai-cis-job__numbers" aria-live="polite">
				{ sprintf(
					/* translators: 1: percent, 2: processed, 3: remaining. */
					__(
						'%1$d%% · Processed: %2$d · Remaining: %3$d',
						'ai-content-image-seo'
					),
					job.percent,
					job.processed,
					job.remaining
				) }
				{ ' · ' }
				{ sprintf(
					/* translators: 1: optimized count, 2: skipped count, 3: failed count. */
					__(
						'Updated: %1$d · Already complete: %2$d · Failed: %3$d',
						'ai-content-image-seo'
					),
					job.optimized,
					job.skipped,
					job.failed
				) }
			</p>
			{ job.truncated > 0 && (
				<p className="description">
					{ sprintf(
						/* translators: %d: number of images not included. */
						_n(
							'%d image was not included because of the bulk batch limit.',
							'%d images were not included because of the bulk batch limit.',
							job.truncated,
							'ai-content-image-seo'
						),
						job.truncated
					) }
				</p>
			) }
			{ job.status === 'paused' && job.stop_reason && (
				<p>{ reasons[ job.stop_reason ] }</p>
			) }
			<div className="ai-cis-actions">
				{ job.status === 'running' && (
					<Button
						variant="secondary"
						onClick={ () => onControl( 'pause' ) }
						disabled={ busy }
					>
						{ __( 'Pause', 'ai-content-image-seo' ) }
					</Button>
				) }
				{ job.status === 'paused' && (
					<Button
						variant="primary"
						onClick={ () => onControl( 'resume' ) }
						disabled={ busy }
					>
						{ __( 'Resume', 'ai-content-image-seo' ) }
					</Button>
				) }
				{ job.status !== 'completed' ? (
					<Button
						variant="tertiary"
						isDestructive
						onClick={ () => onControl( 'cancel' ) }
						disabled={ busy }
					>
						{ __( 'Cancel', 'ai-content-image-seo' ) }
					</Button>
				) : (
					<Button
						variant="secondary"
						onClick={ () => onControl( 'cancel' ) }
						disabled={ busy }
					>
						{ __( 'Clear', 'ai-content-image-seo' ) }
					</Button>
				) }
			</div>
			{ job.errors?.length > 0 && (
				<details className="ai-cis-errors">
					<summary>
						{ __( 'Failed images', 'ai-content-image-seo' ) }
					</summary>
					<ul>
						{ job.errors.map( ( e, i ) => (
							<li key={ i }>
								#{ e.id } { e.title }: { e.message }
							</li>
						) ) }
					</ul>
				</details>
			) }
		</Section>
	);
}

function AltCell( { item } ) {
	if ( item.image_type === 'decorative' ) {
		return (
			<em>
				{ __( 'Decorative (empty by design)', 'ai-content-image-seo' ) }
			</em>
		);
	}
	if ( item.alt ) {
		return item.alt;
	}
	return (
		<span className="ai-cis-missing">
			{ __( 'Missing', 'ai-content-image-seo' ) }
		</span>
	);
}

function BulkTab() {
	const d = data();
	const [ stats, setStats ] = useState( null );
	const [ filter, setFilter ] = useState( 'missing_alt' );
	const [ search, setSearch ] = useState( '' );
	const [ query, setQuery ] = useState( '' );
	const [ page, setPage ] = useState( 1 );
	const [ list, setList ] = useState( null );
	const [ selected, setSelected ] = useState( [] );
	const [ fields, setFields ] = useState(
		d.defaults.imageFields?.length
			? d.defaults.imageFields
			: [ 'alt', 'title' ]
	);
	const [ overwrite, setOverwrite ] = useState( false );
	const [ job, setJob ] = useState( null );
	const [ busy, setBusy ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ scanning, setScanning ] = useState( false );
	const stepping = useRef( false );
	const debounced = useDebounce( setQuery, 350 );

	const loadStats = useCallback( () => {
		setScanning( true );
		return request( '/images/stats' )
			.then( setStats )
			.catch( ( e ) => setError( errorInfo( e ) ) )
			.finally( () => setScanning( false ) );
	}, [] );

	const loadList = useCallback( () => {
		setList( null );
		request( '/images', { query: { filter, page, search: query } } )
			.then( setList )
			.catch( ( e ) => setError( errorInfo( e ) ) );
	}, [ filter, page, query ] );

	useEffect( () => {
		loadStats();
		request( '/bulk/status' )
			.then( setJob )
			.catch( () => {} );
	}, [ loadStats ] );

	useEffect( () => {
		debounced( search );
	}, [ search, debounced ] );

	useEffect( loadList, [ loadList ] );

	// While a job runs and this page is open, advance it step by step.
	useEffect( () => {
		if ( ! job || job.status !== 'running' || stepping.current ) {
			return undefined;
		}
		stepping.current = true;
		const timer = setTimeout( async () => {
			try {
				const next = await request( '/bulk/step', { method: 'POST' } );
				setJob( next );
				if ( next.status === 'completed' ) {
					speak(
						__(
							'Bulk optimization completed.',
							'ai-content-image-seo'
						)
					);
					loadStats();
					loadList();
				}
			} catch ( e ) {
				setError( errorInfo( e ) );
			}
			stepping.current = false;
		}, 800 );
		return () => {
			clearTimeout( timer );
			stepping.current = false;
		};
	}, [ job, loadStats, loadList ] );

	const start = async ( useFilter ) => {
		setBusy( true );
		setError( null );
		try {
			const res = await request( '/bulk/start', {
				method: 'POST',
				data: useFilter
					? { filter, fields, overwrite }
					: { ids: selected, fields, overwrite },
			} );
			setJob( res );
			setSelected( [] );
			speak( __( 'Bulk optimization started.', 'ai-content-image-seo' ) );
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( false );
	};

	const control = async ( action ) => {
		setBusy( true );
		try {
			const res = await request( '/bulk/' + action, { method: 'POST' } );
			setJob( res );
			if ( action === 'cancel' ) {
				loadStats();
				loadList();
			}
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( false );
	};

	const jobActive =
		job && ( job.status === 'running' || job.status === 'paused' );
	const pageIds = list ? list.items.map( ( i ) => i.id ) : [];
	const allOnPage =
		pageIds.length > 0 &&
		pageIds.every( ( id ) => selected.includes( id ) );
	const fieldLabels = d.options.imageFields;

	return (
		<div className="ai-cis-page">
			<Section
				title={ __( 'Media Library', 'ai-content-image-seo' ) }
				actions={
					<Button
						variant="secondary"
						onClick={ () => loadStats().then( loadList ) }
						isBusy={ scanning }
						disabled={ scanning }
					>
						{ __( 'Scan Library', 'ai-content-image-seo' ) }
					</Button>
				}
			>
				{ ! stats ? (
					<Spinner />
				) : (
					<dl className="ai-cis-stats">
						<div>
							<dt>
								{ __( 'Total Images', 'ai-content-image-seo' ) }
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
						<div>
							<dt>
								{ __( 'Decorative', 'ai-content-image-seo' ) }
							</dt>
							<dd>{ stats.decorative }</dd>
						</div>
					</dl>
				) }
			</Section>

			<ErrorNotice error={ error } onDismiss={ () => setError( null ) } />
			<JobPanel job={ job } onControl={ control } busy={ busy } />

			<Section title={ __( 'Bulk Optimizer', 'ai-content-image-seo' ) }>
				{ ! d.canBulk && (
					<Notice status="info" isDismissible={ false }>
						<p>
							{ __(
								'Bulk optimization is available to editors and administrators.',
								'ai-content-image-seo'
							) }
						</p>
					</Notice>
				) }
				<div className="ai-cis-bulk-options">
					<fieldset className="ai-cis-fieldset ai-cis-inline">
						<legend>
							{ __( 'Fields to fill', 'ai-content-image-seo' ) }
						</legend>
						{ fieldLabels.map( ( f ) => (
							<CheckboxControl
								key={ f.value }
								__nextHasNoMarginBottom
								label={ f.label }
								checked={ fields.includes( f.value ) }
								onChange={ ( c ) =>
									setFields( ( prev ) =>
										c
											? [ ...prev, f.value ]
											: prev.filter(
													( x ) => x !== f.value
											  )
									)
								}
							/>
						) ) }
					</fieldset>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Overwrite existing metadata',
							'ai-content-image-seo'
						) }
						help={
							overwrite
								? __(
										'Existing values will be replaced.',
										'ai-content-image-seo'
								  )
								: __(
										'Only empty fields (and default filename titles) are filled.',
										'ai-content-image-seo'
								  )
						}
						checked={ overwrite }
						onChange={ setOverwrite }
					/>
				</div>

				<div className="ai-cis-picker__filters">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Filter', 'ai-content-image-seo' ) }
						value={ filter }
						options={ d.options.imageFilters }
						onChange={ ( v ) => {
							setFilter( v );
							setPage( 1 );
							setSelected( [] );
						} }
					/>
					<SearchControl
						__nextHasNoMarginBottom
						label={ __( 'Search images', 'ai-content-image-seo' ) }
						value={ search }
						onChange={ ( v ) => {
							setSearch( v );
							setPage( 1 );
						} }
					/>
				</div>

				{ ! list && <Spinner /> }
				{ list && list.total === 0 && (
					<EmptyState
						title={ __(
							'No images need optimization.',
							'ai-content-image-seo'
						) }
						text={
							filter === 'missing_alt' ||
							filter === 'missing_metadata'
								? __(
										'Your media library is already optimized.',
										'ai-content-image-seo'
								  )
								: __(
										'No images match this filter.',
										'ai-content-image-seo'
								  )
						}
					/>
				) }
				{ list && list.total > 0 && (
					<>
						<div className="ai-cis-actions">
							<Button
								variant="primary"
								onClick={ () => start( false ) }
								disabled={
									busy ||
									jobActive ||
									! selected.length ||
									! fields.length ||
									! d.canBulk
								}
							>
								{ sprintf(
									/* translators: %d: number of selected images. */
									__(
										'Optimize Selected (%d)',
										'ai-content-image-seo'
									),
									selected.length
								) }
							</Button>
							<Button
								variant="secondary"
								onClick={ () => start( true ) }
								disabled={
									busy ||
									jobActive ||
									! fields.length ||
									! d.canBulk
								}
							>
								{ sprintf(
									/* translators: %d: number of matching images. */
									__(
										'Optimize all %d matching images',
										'ai-content-image-seo'
									),
									list.total
								) }
							</Button>
							{ jobActive && (
								<span className="description">
									{ __(
										'A job is already in progress.',
										'ai-content-image-seo'
									) }
								</span>
							) }
						</div>
						<table className="widefat striped ai-cis-table">
							<thead>
								<tr>
									<td className="check-column">
										<CheckboxControl
											__nextHasNoMarginBottom
											label={ __(
												'Select all on this page',
												'ai-content-image-seo'
											) }
											className="ai-cis-sr-label"
											checked={ allOnPage }
											onChange={ ( c ) =>
												setSelected( ( prev ) =>
													c
														? [
																...new Set( [
																	...prev,
																	...pageIds,
																] ),
														  ]
														: prev.filter(
																( id ) =>
																	! pageIds.includes(
																		id
																	)
														  )
												)
											}
										/>
									</td>
									<th scope="col">
										{ __(
											'Image',
											'ai-content-image-seo'
										) }
									</th>
									<th scope="col">
										{ __(
											'Alt Text',
											'ai-content-image-seo'
										) }
									</th>
									<th scope="col">
										{ __(
											'Title',
											'ai-content-image-seo'
										) }
									</th>
									<th scope="col">
										{ __(
											'Used in',
											'ai-content-image-seo'
										) }
									</th>
								</tr>
							</thead>
							<tbody>
								{ list.items.map( ( item ) => (
									<tr key={ item.id }>
										<th
											scope="row"
											className="check-column"
										>
											<CheckboxControl
												__nextHasNoMarginBottom
												className="ai-cis-sr-label"
												label={ sprintf(
													/* translators: %s: file name. */
													__(
														'Select %s',
														'ai-content-image-seo'
													),
													item.filename
												) }
												checked={ selected.includes(
													item.id
												) }
												onChange={ ( c ) =>
													setSelected( ( prev ) =>
														c
															? [
																	...prev,
																	item.id,
															  ]
															: prev.filter(
																	( id ) =>
																		id !==
																		item.id
															  )
													)
												}
											/>
										</th>
										<td>
											<div className="ai-cis-row-image">
												{ item.thumb && (
													<img
														src={ item.thumb }
														alt=""
														width="48"
														height="48"
													/>
												) }
												<div>
													<a
														href={
															data().pages.image +
															'&tab=single&attachment=' +
															item.id
														}
													>
														{ item.filename }
													</a>
													{ item.status ===
														'failed' && (
														<span className="ai-cis-badge is-error">
															{ __(
																'Failed',
																'ai-content-image-seo'
															) }
														</span>
													) }
													{ item.status ===
														'limit' && (
														<span className="ai-cis-badge is-warn">
															{ __(
																'Waiting for limit reset',
																'ai-content-image-seo'
															) }
														</span>
													) }
													{ item.status ===
														'queued' && (
														<span className="ai-cis-badge">
															{ __(
																'Queued',
																'ai-content-image-seo'
															) }
														</span>
													) }
												</div>
											</div>
										</td>
										<td>
											<AltCell item={ item } />
										</td>
										<td>{ item.title }</td>
										<td>
											{ item.parent
												? item.parent.title
												: '—' }
										</td>
									</tr>
								) ) }
							</tbody>
						</table>
						{ list.total_pages > 1 && (
							<div className="ai-cis-pagination">
								<Button
									variant="secondary"
									disabled={ page <= 1 }
									onClick={ () => setPage( page - 1 ) }
								>
									{ __( 'Previous', 'ai-content-image-seo' ) }
								</Button>
								<span>
									{ sprintf(
										/* translators: 1: current page, 2: total pages. */
										__(
											'Page %1$d of %2$d',
											'ai-content-image-seo'
										),
										page,
										list.total_pages
									) }
								</span>
								<Button
									variant="secondary"
									disabled={ page >= list.total_pages }
									onClick={ () => setPage( page + 1 ) }
								>
									{ __( 'Next', 'ai-content-image-seo' ) }
								</Button>
							</div>
						) }
					</>
				) }
				<p className="description">
					{ __(
						'Images are processed a few at a time in the background (Action Scheduler or WP-Cron). Keeping this page open speeds things up. Each processed image counts as one image generation; images that already have the selected fields are skipped without using AI.',
						'ai-content-image-seo'
					) }
				</p>
			</Section>
		</div>
	);
}

function AutomationTab() {
	const d = data();
	const [ usage, setUsage ] = useState( null );
	useEffect( () => {
		request( '/usage' )
			.then( setUsage )
			.catch( () => {} );
	}, [] );

	return (
		<div className="ai-cis-page">
			<Section
				title={ __(
					'Automatic Image Optimization',
					'ai-content-image-seo'
				) }
			>
				<p>
					<strong>{ __( 'Status:', 'ai-content-image-seo' ) }</strong>{ ' ' }
					{ d.defaults.autoOptimize
						? __(
								'Enabled. New uploads are optimized in the background.',
								'ai-content-image-seo'
						  )
						: __( 'Disabled.', 'ai-content-image-seo' ) }
				</p>
				{ usage && (
					<>
						<p>
							{ sprintf(
								/* translators: %d: images waiting. */
								__(
									'Images waiting in the queue: %d',
									'ai-content-image-seo'
								),
								usage.auto_queue
							) }
						</p>
						{ usage.auto_limit_hit && (
							<Notice status="warning" isDismissible={ false }>
								<p>
									{ __(
										'AI usage limit reached. New images will remain unprocessed until the limit resets.',
										'ai-content-image-seo'
									) }
								</p>
							</Notice>
						) }
					</>
				) }
				<p className="description">
					{ __(
						'Automation only fills empty fields, respects the monthly automation limit and never retries failed images automatically. Use the Bulk Optimizer with the "Failed / Not Processed" filter to retry.',
						'ai-content-image-seo'
					) }
				</p>
				{ d.isManager && (
					<Button
						variant="secondary"
						href={ d.pages.settings + '&tab=images' }
					>
						{ __( 'Automation Settings', 'ai-content-image-seo' ) }
					</Button>
				) }
			</Section>
		</div>
	);
}

export default function ImageAI() {
	const params = new window.URLSearchParams( window.location.search );
	const tab = params.get( 'tab' );
	let initial = 'single';
	if ( tab === 'bulk' || tab === 'automation' ) {
		initial = tab;
	} else if ( ! params.get( 'attachment' ) && tab !== 'single' ) {
		initial = 'bulk';
	}

	return (
		<div className="ai-cis-page">
			<ProviderNotice />
			<TabPanel
				className="ai-cis-tabs"
				initialTabName={ initial }
				tabs={ [
					{
						name: 'bulk',
						title: __( 'Bulk Optimizer', 'ai-content-image-seo' ),
					},
					{
						name: 'single',
						title: __( 'Single Image', 'ai-content-image-seo' ),
					},
					{
						name: 'automation',
						title: __( 'Automation', 'ai-content-image-seo' ),
					},
				] }
			>
				{ ( t ) => {
					if ( t.name === 'single' ) {
						return <SingleTab />;
					}
					if ( t.name === 'automation' ) {
						return <AutomationTab />;
					}
					return <BulkTab />;
				} }
			</TabPanel>
		</div>
	);
}
