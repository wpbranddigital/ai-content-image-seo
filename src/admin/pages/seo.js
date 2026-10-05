/**
 * SEO Assistant: metadata, keyword suggestions, content optimization, image SEO.
 */
import {
	Button,
	Modal,
	Notice,
	Spinner,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { speak } from '@wordpress/a11y';
import { request, errorInfo, newRequestId, data } from '../../common/api';
import {
	Section,
	Loading,
	ErrorNotice,
	ProviderNotice,
	GooglePreview,
	EmptyState,
	ResultActions,
} from '../../common/components';
import ItemPicker from '../../common/item-picker';
import ImageMetadataPanel from '../../common/image-metadata-panel';

function MetadataPanel( { item, onSaved } ) {
	const [ busy, setBusy ] = useState( false );
	const [ saving, setSaving ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ draft, setDraft ] = useState( null );
	const [ keywords, setKeywords ] = useState( [] );
	const [ notice, setNotice ] = useState( '' );

	const generate = async () => {
		setBusy( true );
		setError( null );
		setNotice( '' );
		try {
			const res = await request( '/seo/generate', {
				method: 'POST',
				data: { post_id: item.id, request_id: newRequestId() },
			} );
			setDraft( res );
			setKeywords( res.keywords || [] );
			speak(
				__(
					'SEO metadata generated. Review the Google preview before saving.',
					'wbd-content-image-seo-assistant'
				)
			);
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( false );
	};

	const suggestKeywords = async () => {
		setBusy( true );
		setError( null );
		try {
			const res = await request( '/generate-field', {
				method: 'POST',
				data: {
					field: 'keywords',
					post_id: item.id,
					request_id: newRequestId(),
				},
			} );
			setKeywords( res.options || [] );
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( false );
	};

	const save = async () => {
		setSaving( true );
		setError( null );
		try {
			const res = await request( '/seo/save', {
				method: 'POST',
				data: { post_id: item.id, ...draft },
			} );
			setNotice(
				sprintf(
					/* translators: %s: SEO plugin name. */
					__( 'Saved to %s.', 'wbd-content-image-seo-assistant' ),
					res.target
				)
			);
			onSaved( res.seo );
			setDraft( null );
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setSaving( false );
	};

	const current = item.seo || {};

	return (
		<Section
			title={ __(
				'SEO Title & Meta Description',
				'wbd-content-image-seo-assistant'
			) }
		>
			<p className="description">
				{ sprintf(
					/* translators: %s: SEO plugin name. */
					__(
						'Metadata is saved to: %s. Nothing is changed until you click Save.',
						'wbd-content-image-seo-assistant'
					),
					data().seoPluginLabel
				) }
			</p>
			<p className="ai-cis-label">
				{ __( 'Current', 'wbd-content-image-seo-assistant' ) }
			</p>
			<GooglePreview
				title={ current.seo_title || item.title }
				description={ current.meta_description }
				url={ item.link }
			/>
			<div className="ai-cis-actions">
				<Button
					variant="primary"
					onClick={ generate }
					isBusy={ busy }
					disabled={ busy }
				>
					{ __(
						'Generate SEO Title & Meta Description',
						'wbd-content-image-seo-assistant'
					) }
				</Button>
				<Button
					variant="secondary"
					onClick={ suggestKeywords }
					disabled={ busy }
				>
					{ __(
						'Suggest Focus Keywords',
						'wbd-content-image-seo-assistant'
					) }
				</Button>
			</div>
			{ busy && <Loading /> }
			<ErrorNotice error={ error } onDismiss={ () => setError( null ) } />
			{ keywords.length > 0 && (
				<div
					className="ai-cis-chips"
					role="group"
					aria-label={ __(
						'Keyword suggestions',
						'wbd-content-image-seo-assistant'
					) }
				>
					<p className="ai-cis-label">
						{ __(
							'Keyword suggestions (click to use as focus keyword)',
							'wbd-content-image-seo-assistant'
						) }
					</p>
					{ keywords.map( ( k ) => (
						<Button
							key={ k }
							variant="secondary"
							size="compact"
							onClick={ () =>
								setDraft( {
									...( draft || {
										seo_title: current.seo_title,
										meta_description:
											current.meta_description,
									} ),
									focus_keyword: k,
								} )
							}
						>
							{ k }
						</Button>
					) ) }
				</div>
			) }
			{ draft && ! busy && (
				<div className="ai-cis-result">
					<p className="ai-cis-label">
						{ __( 'AI Result', 'wbd-content-image-seo-assistant' ) }
					</p>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'SEO Title',
							'wbd-content-image-seo-assistant'
						) }
						value={ draft.seo_title || '' }
						onChange={ ( v ) =>
							setDraft( { ...draft, seo_title: v } )
						}
					/>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __(
							'Meta Description',
							'wbd-content-image-seo-assistant'
						) }
						value={ draft.meta_description || '' }
						onChange={ ( v ) =>
							setDraft( { ...draft, meta_description: v } )
						}
					/>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Focus Keyword',
							'wbd-content-image-seo-assistant'
						) }
						value={ draft.focus_keyword || '' }
						onChange={ ( v ) =>
							setDraft( { ...draft, focus_keyword: v } )
						}
					/>
					<GooglePreview
						title={ draft.seo_title }
						description={ draft.meta_description }
						url={ item.link }
					/>
					<ResultActions
						onUse={ save }
						useLabel={ __(
							'Save SEO Metadata',
							'wbd-content-image-seo-assistant'
						) }
						busy={ saving }
						copyText={
							( draft.seo_title || '' ) +
							'\n' +
							( draft.meta_description || '' )
						}
						onRegenerate={ generate }
					/>
				</div>
			) }
			{ notice && (
				<Notice
					status="success"
					onRemove={ () => setNotice( '' ) }
					className="ai-cis-notice"
				>
					<p>{ notice }</p>
				</Notice>
			) }
		</Section>
	);
}

function OptimizationPanel( { item } ) {
	const [ busy, setBusy ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ report, setReport ] = useState( null );

	const analyze = async () => {
		setBusy( true );
		setError( null );
		try {
			const res = await request( '/seo/analyze', {
				method: 'POST',
				data: { post_id: item.id, request_id: newRequestId() },
			} );
			setReport( res );
			speak(
				__(
					'Content analysis ready.',
					'wbd-content-image-seo-assistant'
				)
			);
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( false );
	};

	const priorityLabel = {
		high: __( 'High priority', 'wbd-content-image-seo-assistant' ),
		medium: __( 'Medium priority', 'wbd-content-image-seo-assistant' ),
		low: __( 'Low priority', 'wbd-content-image-seo-assistant' ),
	};

	return (
		<Section
			title={ __(
				'Content Optimization',
				'wbd-content-image-seo-assistant'
			) }
		>
			<div className="ai-cis-actions">
				<Button
					variant="secondary"
					onClick={ analyze }
					isBusy={ busy }
					disabled={ busy }
				>
					{ report
						? __(
								'Analyze Again',
								'wbd-content-image-seo-assistant'
						  )
						: __(
								'Analyze Content',
								'wbd-content-image-seo-assistant'
						  ) }
				</Button>
			</div>
			{ busy && (
				<Loading
					label={ __(
						'Analyzing…',
						'wbd-content-image-seo-assistant'
					) }
				/>
			) }
			<ErrorNotice error={ error } onDismiss={ () => setError( null ) } />
			{ report && ! busy && (
				<div className="ai-cis-result">
					{ report.score !== null && (
						<p className="ai-cis-big-number">
							{ sprintf(
								/* translators: %d: SEO score. */
								__(
									'AI SEO score: %d / 100',
									'wbd-content-image-seo-assistant'
								),
								report.score
							) }
						</p>
					) }
					{ report.summary && <p>{ report.summary }</p> }
					<ul className="ai-cis-checks">
						{ report.checks.map( ( c ) => (
							<li
								key={ c.label }
								className={ c.pass ? 'is-pass' : 'is-fail' }
							>
								<span
									className={
										'dashicons ' +
										( c.pass
											? 'dashicons-yes'
											: 'dashicons-warning' )
									}
									aria-hidden="true"
								/>
								<span className="screen-reader-text">
									{ c.pass
										? __(
												'Passed:',
												'wbd-content-image-seo-assistant'
										  )
										: __(
												'Needs work:',
												'wbd-content-image-seo-assistant'
										  ) }
								</span>
								{ c.label }: { c.note }
							</li>
						) ) }
					</ul>
					{ report.suggestions.length > 0 && (
						<>
							<p className="ai-cis-label">
								{ __(
									'Suggestions',
									'wbd-content-image-seo-assistant'
								) }
							</p>
							<ul className="ai-cis-suggestions">
								{ report.suggestions.map( ( s, i ) => (
									<li key={ i }>
										<span
											className={
												'ai-cis-badge is-' + s.priority
											}
										>
											{ priorityLabel[ s.priority ] }
										</span>{ ' ' }
										{ s.text }
									</li>
								) ) }
							</ul>
						</>
					) }
					<p>
						<a href={ data().pages.content + '&tab=rewrite' }>
							{ __(
								'Use the Content Rewriter to apply improvements',
								'wbd-content-image-seo-assistant'
							) }
						</a>
					</p>
				</div>
			) }
		</Section>
	);
}

function ImageSeoPanel( { item, onChanged } ) {
	const [ editing, setEditing ] = useState( null );
	const images = item.images || [];

	return (
		<Section title={ __( 'Image SEO', 'wbd-content-image-seo-assistant' ) }>
			{ images.length === 0 ? (
				<EmptyState
					title={ __(
						'No images found in this content.',
						'wbd-content-image-seo-assistant'
					) }
				/>
			) : (
				<ul className="ai-cis-image-list">
					{ images.map( ( img ) => (
						<li key={ img.id }>
							{ img.thumb && (
								<img
									src={ img.thumb }
									alt=""
									width="48"
									height="48"
								/>
							) }
							<div>
								<strong>{ img.title }</strong>
								<br />
								{ img.decorative && (
									<em>
										{ __(
											'Decorative (empty alt by design)',
											'wbd-content-image-seo-assistant'
										) }
									</em>
								) }
								{ ! img.decorative &&
									( img.alt ? (
										<span>
											{ __(
												'Alt:',
												'wbd-content-image-seo-assistant'
											) }{ ' ' }
											{ img.alt }
										</span>
									) : (
										<span className="ai-cis-missing">
											{ __(
												'Missing alt text',
												'wbd-content-image-seo-assistant'
											) }
										</span>
									) ) }
							</div>
							{ data().canUpload && (
								<Button
									variant="secondary"
									size="compact"
									onClick={ () => setEditing( img.id ) }
								>
									{ __(
										'Generate AI Metadata',
										'wbd-content-image-seo-assistant'
									) }
								</Button>
							) }
						</li>
					) ) }
				</ul>
			) }
			{ editing && (
				<Modal
					title={ __(
						'Generate AI Metadata',
						'wbd-content-image-seo-assistant'
					) }
					onRequestClose={ () => setEditing( null ) }
					className="ai-cis-modal"
				>
					<ImageMetadataPanel
						attachmentId={ editing }
						onApplied={ onChanged }
					/>
				</Modal>
			) }
		</Section>
	);
}

export default function SeoAssistant() {
	const [ item, setItem ] = useState( null );
	const [ loading, setLoading ] = useState( false );
	const [ error, setError ] = useState( null );

	const load = async ( picked ) => {
		setLoading( true );
		setError( null );
		try {
			setItem( await request( '/items/' + picked.id ) );
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setLoading( false );
	};

	return (
		<div className="ai-cis-page">
			<ProviderNotice />
			<Notice
				status="info"
				isDismissible={ false }
				className="ai-cis-notice"
			>
				<p>
					{ data().seoPlugin
						? sprintf(
								/* translators: %s: SEO plugin name. */
								__(
									'%s detected. SEO metadata is read from and saved to it.',
									'wbd-content-image-seo-assistant'
								),
								data().seoPluginLabel
						  )
						: __(
								'No SEO plugin detected (Yoast SEO, Rank Math and All in One SEO are supported). Metadata is stored by this plugin and output in your page head.',
								'wbd-content-image-seo-assistant'
						  ) }
				</p>
			</Notice>
			<div className="ai-cis-sidebar-layout">
				<Section
					title={ __(
						'Choose content',
						'wbd-content-image-seo-assistant'
					) }
				>
					<ItemPicker
						onSelect={ load }
						selectedId={ item?.id }
						showSeo
					/>
				</Section>
				<div>
					<ErrorNotice error={ error } />
					{ loading && <Spinner /> }
					{ ! loading && ! item && (
						<Section>
							<EmptyState
								title={ __(
									'Select a post, page or product.',
									'wbd-content-image-seo-assistant'
								) }
								text={ __(
									'Then generate an SEO title and meta description, get keyword ideas, analyze the content and check image alt text.',
									'wbd-content-image-seo-assistant'
								) }
							/>
						</Section>
					) }
					{ ! loading && item && (
						<>
							<h2 className="ai-cis-section-title">
								{ item.title }{ ' ' }
								<a href={ item.edit_link }>
									{ __(
										'Edit',
										'wbd-content-image-seo-assistant'
									) }
								</a>
							</h2>
							<MetadataPanel
								key={ 'm' + item.id }
								item={ item }
								onSaved={ ( seo ) =>
									setItem( { ...item, seo } )
								}
							/>
							<OptimizationPanel
								key={ 'o' + item.id }
								item={ item }
							/>
							<ImageSeoPanel
								key={ 'i' + item.id }
								item={ item }
								onChanged={ () =>
									request( '/items/' + item.id )
										.then( setItem )
										.catch( () => {} )
								}
							/>
						</>
					) }
				</div>
			</div>
		</div>
	);
}
