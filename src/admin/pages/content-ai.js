/**
 * Content AI: generate posts/pages and rewrite existing content.
 */
import {
	Button,
	Notice,
	SelectControl,
	TabPanel,
	TextControl,
	TextareaControl,
	Spinner,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { speak } from '@wordpress/a11y';
import {
	request,
	errorInfo,
	newRequestId,
	data,
	htmlToText,
} from '../../common/api';
import {
	Section,
	Loading,
	ErrorNotice,
	ProviderNotice,
	HtmlPreview,
	ResultActions,
	CopyButton,
	GooglePreview,
	PrivacyHint,
	EmptyState,
} from '../../common/components';
import ItemPicker from '../../common/item-picker';

/**
 * Language select with "Custom" support.
 *
 * @param {Object}   props             Props.
 * @param {string}   props.value       Language.
 * @param {Function} props.onChange    Change handler.
 * @param {boolean}  props.allowSource Include "same as original".
 * @return {Element} Control.
 */
export function LanguageControl( { value, onChange, allowSource = false } ) {
	const options = [
		...data().options.languages,
		{
			value: 'Custom',
			label: __( 'Custom…', 'wbd-content-image-seo-assistant' ),
		},
	];
	if ( allowSource ) {
		options.unshift( {
			value: '',
			label: __( 'Same as original', 'wbd-content-image-seo-assistant' ),
		} );
	}
	const isCustom =
		( value || '' ).startsWith( 'Custom:' ) ||
		! options.some( ( o ) => o.value === value );
	const customText = ( value || '' ).replace( /^Custom:/, '' );
	return (
		<div className="ai-cis-language">
			<SelectControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ __( 'Language', 'wbd-content-image-seo-assistant' ) }
				value={ isCustom ? 'Custom' : value }
				options={ options }
				onChange={ ( v ) => onChange( v === 'Custom' ? 'Custom:' : v ) }
			/>
			{ isCustom && (
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __(
						'Custom language',
						'wbd-content-image-seo-assistant'
					) }
					value={ customText }
					placeholder={ __(
						'e.g. Portuguese (Brazil)',
						'wbd-content-image-seo-assistant'
					) }
					onChange={ ( v ) => onChange( 'Custom:' + v ) }
				/>
			) }
		</div>
	);
}

/**
 * Normalizes the language value for the API.
 *
 * @param {string} value Value.
 * @return {string} Language.
 */
export const apiLanguage = ( value ) =>
	( value || '' ).replace( /^Custom:/, '' ).trim();

function GenerateTab() {
	const d = data();
	const [ form, setForm ] = useState( {
		topic: '',
		post_type: 'post',
		content_type: 'blog_post',
		tone: d.defaults.tone,
		length: 'medium',
		language: d.defaults.language,
		keywords: '',
		instructions: '',
	} );
	const [ busy, setBusy ] = useState( false );
	const [ refining, setRefining ] = useState( '' );
	const [ error, setError ] = useState( null );
	const [ result, setResult ] = useState( null );
	const [ creating, setCreating ] = useState( false );

	const set = ( key ) => ( value ) => setForm( { ...form, [ key ]: value } );

	const generate = async () => {
		if ( ! form.topic.trim() ) {
			setError( {
				message: __(
					'Please enter a topic.',
					'wbd-content-image-seo-assistant'
				),
			} );
			return;
		}
		setBusy( true );
		setError( null );
		try {
			const res = await request( '/generate-content', {
				method: 'POST',
				data: {
					...form,
					language: apiLanguage( form.language ),
					request_id: newRequestId(),
				},
			} );
			setResult( res );
			speak(
				__(
					'Content generated. Review the result below.',
					'wbd-content-image-seo-assistant'
				)
			);
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( false );
	};

	const refine = async ( action ) => {
		setRefining( action );
		setError( null );
		try {
			const res = await request( '/rewrite', {
				method: 'POST',
				data: {
					content: result.content,
					action,
					request_id: newRequestId(),
				},
			} );
			setResult( { ...result, content: res.result } );
			speak(
				__( 'Content updated.', 'wbd-content-image-seo-assistant' )
			);
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setRefining( '' );
	};

	const createDraft = async () => {
		setCreating( true );
		setError( null );
		try {
			const res = await request( '/create-draft', {
				method: 'POST',
				data: {
					title: result.title,
					content: result.content,
					excerpt: result.excerpt,
					post_type: form.post_type,
					seo_title: result.seo_title,
					meta_description: result.meta_description,
					focus_keyword: result.keywords?.[ 0 ] || '',
				},
			} );
			window.location.href = res.edit_link;
		} catch ( e ) {
			setError( errorInfo( e ) );
			setCreating( false );
		}
	};

	return (
		<div className="ai-cis-two-col">
			<Section
				title={ __(
					'Generate Post Content',
					'wbd-content-image-seo-assistant'
				) }
			>
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Topic', 'wbd-content-image-seo-assistant' ) }
					help={ __(
						'Describe what the content should be about.',
						'wbd-content-image-seo-assistant'
					) }
					value={ form.topic }
					onChange={ set( 'topic' ) }
					rows={ 3 }
				/>
				<div className="ai-cis-grid-2">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Create as',
							'wbd-content-image-seo-assistant'
						) }
						value={ form.post_type }
						options={ [
							{
								value: 'post',
								label: __(
									'Post',
									'wbd-content-image-seo-assistant'
								),
							},
							{
								value: 'page',
								label: __(
									'Page',
									'wbd-content-image-seo-assistant'
								),
							},
						] }
						onChange={ set( 'post_type' ) }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Content Type',
							'wbd-content-image-seo-assistant'
						) }
						value={ form.content_type }
						options={ d.options.contentTypes }
						onChange={ set( 'content_type' ) }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Tone',
							'wbd-content-image-seo-assistant'
						) }
						value={ form.tone }
						options={ d.options.tones }
						onChange={ set( 'tone' ) }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Length',
							'wbd-content-image-seo-assistant'
						) }
						value={ form.length }
						options={ d.options.lengths }
						onChange={ set( 'length' ) }
					/>
				</div>
				<LanguageControl
					value={ form.language }
					onChange={ set( 'language' ) }
				/>
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __(
						'Keywords',
						'wbd-content-image-seo-assistant'
					) }
					help={ __(
						'Optional, comma separated.',
						'wbd-content-image-seo-assistant'
					) }
					value={ form.keywords }
					onChange={ set( 'keywords' ) }
				/>
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __(
						'Extra instructions',
						'wbd-content-image-seo-assistant'
					) }
					value={ form.instructions }
					onChange={ set( 'instructions' ) }
					rows={ 2 }
				/>
				<div className="ai-cis-actions">
					<Button
						variant="primary"
						onClick={ generate }
						isBusy={ busy }
						disabled={ busy }
					>
						{ busy
							? __(
									'Generating…',
									'wbd-content-image-seo-assistant'
							  )
							: __(
									'Generate',
									'wbd-content-image-seo-assistant'
							  ) }
					</Button>
				</div>
				<PrivacyHint />
			</Section>

			<Section
				title={ __( 'AI Result', 'wbd-content-image-seo-assistant' ) }
			>
				{ busy && <Loading /> }
				<ErrorNotice
					error={ error }
					onDismiss={ () => setError( null ) }
				/>
				{ ! busy && ! result && (
					<EmptyState
						title={ __(
							'Nothing generated yet.',
							'wbd-content-image-seo-assistant'
						) }
						text={ __(
							'Enter a topic and click Generate. You can review and edit everything before creating a draft.',
							'wbd-content-image-seo-assistant'
						) }
					/>
				) }
				{ ! busy && result && (
					<div className="ai-cis-result">
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __(
								'Title',
								'wbd-content-image-seo-assistant'
							) }
							value={ result.title }
							onChange={ ( v ) =>
								setResult( { ...result, title: v } )
							}
						/>
						<p className="ai-cis-label">
							{ __(
								'Content',
								'wbd-content-image-seo-assistant'
							) }
						</p>
						{ refining ? (
							<Loading
								label={ __(
									'Updating content…',
									'wbd-content-image-seo-assistant'
								) }
							/>
						) : (
							<HtmlPreview html={ result.content } />
						) }
						<div className="ai-cis-actions ai-cis-actions--compact">
							{ [
								[
									'improve',
									__(
										'Improve',
										'wbd-content-image-seo-assistant'
									),
								],
								[
									'shorten',
									__(
										'Shorten',
										'wbd-content-image-seo-assistant'
									),
								],
								[
									'expand',
									__(
										'Expand',
										'wbd-content-image-seo-assistant'
									),
								],
								[
									'rewrite',
									__(
										'Rewrite',
										'wbd-content-image-seo-assistant'
									),
								],
							].map( ( [ action, label ] ) => (
								<Button
									key={ action }
									variant="secondary"
									size="compact"
									onClick={ () => refine( action ) }
									disabled={ !! refining }
									isBusy={ refining === action }
								>
									{ label }
								</Button>
							) ) }
						</div>
						<TextareaControl
							__nextHasNoMarginBottom
							label={ __(
								'Excerpt',
								'wbd-content-image-seo-assistant'
							) }
							value={ result.excerpt }
							onChange={ ( v ) =>
								setResult( { ...result, excerpt: v } )
							}
						/>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __(
								'SEO Title',
								'wbd-content-image-seo-assistant'
							) }
							value={ result.seo_title }
							onChange={ ( v ) =>
								setResult( { ...result, seo_title: v } )
							}
						/>
						<TextareaControl
							__nextHasNoMarginBottom
							label={ __(
								'Meta Description',
								'wbd-content-image-seo-assistant'
							) }
							value={ result.meta_description }
							onChange={ ( v ) =>
								setResult( { ...result, meta_description: v } )
							}
						/>
						<GooglePreview
							title={ result.seo_title }
							description={ result.meta_description }
						/>
						{ result.keywords?.length > 0 && (
							<p>
								<strong>
									{ __(
										'Keywords:',
										'wbd-content-image-seo-assistant'
									) }
								</strong>{ ' ' }
								{ result.keywords.join( ', ' ) }
							</p>
						) }
						<ResultActions
							onUse={ createDraft }
							useLabel={ sprintf(
								/* translators: %s: post or page. */
								__(
									'Insert into editor (new %s draft)',
									'wbd-content-image-seo-assistant'
								),
								form.post_type === 'page'
									? __(
											'page',
											'wbd-content-image-seo-assistant'
									  )
									: __(
											'post',
											'wbd-content-image-seo-assistant'
									  )
							) }
							busy={ creating || !! refining }
							copyText={ htmlToText( result.content ) }
							onRegenerate={ generate }
						>
							<CopyButton
								text={ result.content }
								label={ __(
									'Copy HTML',
									'wbd-content-image-seo-assistant'
								) }
							/>
						</ResultActions>
						<p className="description">
							{ __(
								'Regenerate, Improve, Shorten, Expand and Rewrite each count as one AI generation.',
								'wbd-content-image-seo-assistant'
							) }
						</p>
					</div>
				) }
			</Section>
		</div>
	);
}

function RewriteTab() {
	const d = data();
	const [ source, setSource ] = useState( 'paste' );
	const [ item, setItem ] = useState( null );
	const [ loadingItem, setLoadingItem ] = useState( false );
	const [ content, setContent ] = useState( '' );
	const [ action, setAction ] = useState( 'improve' );
	const [ language, setLanguage ] = useState( '' );
	const [ busy, setBusy ] = useState( false );
	const [ saving, setSaving ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ result, setResult ] = useState( null );
	const [ notice, setNotice ] = useState( '' );

	const pickItem = async ( picked ) => {
		setLoadingItem( true );
		setResult( null );
		setNotice( '' );
		try {
			const full = await request( '/items/' + picked.id );
			setItem( full );
			setContent( full.content );
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setLoadingItem( false );
	};

	const run = async () => {
		if ( ! content.trim() ) {
			setError( {
				message: __(
					'There is no content to rewrite.',
					'wbd-content-image-seo-assistant'
				),
			} );
			return;
		}
		setBusy( true );
		setError( null );
		setNotice( '' );
		try {
			const res = await request( '/rewrite', {
				method: 'POST',
				data: {
					content,
					action,
					language: apiLanguage( language ),
					request_id: newRequestId(),
				},
			} );
			setResult( res );
			speak(
				__(
					'Rewrite ready. Compare the original and the AI result.',
					'wbd-content-image-seo-assistant'
				)
			);
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( false );
	};

	const save = async ( mode ) => {
		if ( source === 'paste' ) {
			setContent(
				mode === 'replace'
					? result.result
					: content + '\n\n' + result.result
			);
			setResult( null );
			setNotice(
				mode === 'replace'
					? __(
							'The text box now contains the AI result.',
							'wbd-content-image-seo-assistant'
					  )
					: __(
							'The AI result was added below your text.',
							'wbd-content-image-seo-assistant'
					  )
			);
			return;
		}
		if (
			mode === 'replace' &&
			// eslint-disable-next-line no-alert
			! window.confirm(
				__(
					'Replace the content of this post with the AI result? A revision is kept so you can restore it.',
					'wbd-content-image-seo-assistant'
				)
			)
		) {
			return;
		}
		setSaving( true );
		try {
			await request( '/items/' + item.id, {
				method: 'POST',
				data: {
					field: 'content',
					value: result.result,
					mode: mode === 'replace' ? 'replace' : 'append',
				},
			} );
			const fresh = await request( '/items/' + item.id );
			setItem( fresh );
			setContent( fresh.content );
			setResult( null );
			setNotice(
				__( 'Saved to the post.', 'wbd-content-image-seo-assistant' )
			);
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setSaving( false );
	};

	return (
		<div className="ai-cis-page">
			<Section
				title={ __(
					'Improve Existing Content',
					'wbd-content-image-seo-assistant'
				) }
			>
				<div
					className="ai-cis-segmented"
					role="group"
					aria-label={ __(
						'Content source',
						'wbd-content-image-seo-assistant'
					) }
				>
					<Button
						variant={ source === 'paste' ? 'primary' : 'secondary' }
						onClick={ () => setSource( 'paste' ) }
						aria-pressed={ source === 'paste' }
					>
						{ __(
							'Paste text',
							'wbd-content-image-seo-assistant'
						) }
					</Button>
					<Button
						variant={ source === 'post' ? 'primary' : 'secondary' }
						onClick={ () => setSource( 'post' ) }
						aria-pressed={ source === 'post' }
					>
						{ __(
							'Existing post or page',
							'wbd-content-image-seo-assistant'
						) }
					</Button>
				</div>

				{ source === 'post' && (
					<>
						<ItemPicker
							onSelect={ pickItem }
							selectedId={ item?.id }
						/>
						{ loadingItem && <Spinner /> }
						{ item && (
							<p>
								<strong>
									{ __(
										'Selected:',
										'wbd-content-image-seo-assistant'
									) }
								</strong>{ ' ' }
								{ item.title }{ ' ' }
								<a href={ item.edit_link }>
									{ __(
										'Edit',
										'wbd-content-image-seo-assistant'
									) }
								</a>
							</p>
						) }
					</>
				) }

				{ ( source === 'paste' || item ) && (
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __(
							'Content',
							'wbd-content-image-seo-assistant'
						) }
						value={ content }
						onChange={ setContent }
						rows={ 8 }
					/>
				) }

				<div className="ai-cis-grid-2">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Action',
							'wbd-content-image-seo-assistant'
						) }
						value={ action }
						options={ d.options.rewriteActions }
						onChange={ setAction }
					/>
					<LanguageControl
						value={ language }
						onChange={ setLanguage }
						allowSource
					/>
				</div>
				<div className="ai-cis-actions">
					<Button
						variant="primary"
						onClick={ run }
						isBusy={ busy }
						disabled={ busy || ! content.trim() }
					>
						{ busy
							? __(
									'Generating…',
									'wbd-content-image-seo-assistant'
							  )
							: __(
									'Rewrite',
									'wbd-content-image-seo-assistant'
							  ) }
					</Button>
				</div>
				<p className="description">
					{ __(
						'Your original content is never overwritten automatically.',
						'wbd-content-image-seo-assistant'
					) }
				</p>
			</Section>

			{ busy && <Loading /> }
			<ErrorNotice error={ error } onDismiss={ () => setError( null ) } />
			{ notice && (
				<Notice
					status="success"
					onRemove={ () => setNotice( '' ) }
					className="ai-cis-notice"
				>
					<p>{ notice }</p>
				</Notice>
			) }

			{ result && ! busy && (
				<Section
					title={ __( 'Compare', 'wbd-content-image-seo-assistant' ) }
				>
					<div className="ai-cis-compare-cols">
						<div>
							<h3>
								{ __(
									'Original',
									'wbd-content-image-seo-assistant'
								) }
							</h3>
							{ result.is_html ? (
								<HtmlPreview html={ result.original } />
							) : (
								<div className="ai-cis-text-preview">
									{ result.original }
								</div>
							) }
						</div>
						<div>
							<h3>
								{ __(
									'AI Result',
									'wbd-content-image-seo-assistant'
								) }
							</h3>
							{ result.is_html ? (
								<HtmlPreview html={ result.result } />
							) : (
								<div className="ai-cis-text-preview">
									{ result.result }
								</div>
							) }
						</div>
					</div>
					<ResultActions
						onUse={ () => save( 'replace' ) }
						useLabel={ __(
							'Replace',
							'wbd-content-image-seo-assistant'
						) }
						busy={ saving }
						copyText={
							result.is_html
								? htmlToText( result.result )
								: result.result
						}
						onRegenerate={ run }
					>
						<Button
							variant="secondary"
							onClick={ () => save( 'insert' ) }
							disabled={ saving }
						>
							{ __(
								'Insert (append)',
								'wbd-content-image-seo-assistant'
							) }
						</Button>
					</ResultActions>
				</Section>
			) }
		</div>
	);
}

export default function ContentAI() {
	const params = new window.URLSearchParams( window.location.search );
	const initial = params.get( 'tab' ) === 'rewrite' ? 'rewrite' : 'generate';
	return (
		<div className="ai-cis-page">
			<ProviderNotice />
			<TabPanel
				className="ai-cis-tabs"
				initialTabName={ initial }
				tabs={ [
					{
						name: 'generate',
						title: __(
							'Generate Content',
							'wbd-content-image-seo-assistant'
						),
					},
					{
						name: 'rewrite',
						title: __(
							'Content Rewriter',
							'wbd-content-image-seo-assistant'
						),
					},
				] }
			>
				{ ( tab ) =>
					tab.name === 'rewrite' ? <RewriteTab /> : <GenerateTab />
				}
			</TabPanel>
		</div>
	);
}
