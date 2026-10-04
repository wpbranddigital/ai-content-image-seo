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
		{ value: 'Custom', label: __( 'Custom…', 'ai-content-image-seo' ) },
	];
	if ( allowSource ) {
		options.unshift( {
			value: '',
			label: __( 'Same as original', 'ai-content-image-seo' ),
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
				label={ __( 'Language', 'ai-content-image-seo' ) }
				value={ isCustom ? 'Custom' : value }
				options={ options }
				onChange={ ( v ) => onChange( v === 'Custom' ? 'Custom:' : v ) }
			/>
			{ isCustom && (
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Custom language', 'ai-content-image-seo' ) }
					value={ customText }
					placeholder={ __(
						'e.g. Portuguese (Brazil)',
						'ai-content-image-seo'
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
				message: __( 'Please enter a topic.', 'ai-content-image-seo' ),
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
					'ai-content-image-seo'
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
			speak( __( 'Content updated.', 'ai-content-image-seo' ) );
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
				title={ __( 'Generate Post Content', 'ai-content-image-seo' ) }
			>
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Topic', 'ai-content-image-seo' ) }
					help={ __(
						'Describe what the content should be about.',
						'ai-content-image-seo'
					) }
					value={ form.topic }
					onChange={ set( 'topic' ) }
					rows={ 3 }
				/>
				<div className="ai-cis-grid-2">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Create as', 'ai-content-image-seo' ) }
						value={ form.post_type }
						options={ [
							{
								value: 'post',
								label: __( 'Post', 'ai-content-image-seo' ),
							},
							{
								value: 'page',
								label: __( 'Page', 'ai-content-image-seo' ),
							},
						] }
						onChange={ set( 'post_type' ) }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Content Type', 'ai-content-image-seo' ) }
						value={ form.content_type }
						options={ d.options.contentTypes }
						onChange={ set( 'content_type' ) }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Tone', 'ai-content-image-seo' ) }
						value={ form.tone }
						options={ d.options.tones }
						onChange={ set( 'tone' ) }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Length', 'ai-content-image-seo' ) }
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
					label={ __( 'Keywords', 'ai-content-image-seo' ) }
					help={ __(
						'Optional, comma separated.',
						'ai-content-image-seo'
					) }
					value={ form.keywords }
					onChange={ set( 'keywords' ) }
				/>
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Extra instructions', 'ai-content-image-seo' ) }
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
							? __( 'Generating…', 'ai-content-image-seo' )
							: __( 'Generate', 'ai-content-image-seo' ) }
					</Button>
				</div>
				<PrivacyHint />
			</Section>

			<Section title={ __( 'AI Result', 'ai-content-image-seo' ) }>
				{ busy && <Loading /> }
				<ErrorNotice
					error={ error }
					onDismiss={ () => setError( null ) }
				/>
				{ ! busy && ! result && (
					<EmptyState
						title={ __(
							'Nothing generated yet.',
							'ai-content-image-seo'
						) }
						text={ __(
							'Enter a topic and click Generate. You can review and edit everything before creating a draft.',
							'ai-content-image-seo'
						) }
					/>
				) }
				{ ! busy && result && (
					<div className="ai-cis-result">
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __( 'Title', 'ai-content-image-seo' ) }
							value={ result.title }
							onChange={ ( v ) =>
								setResult( { ...result, title: v } )
							}
						/>
						<p className="ai-cis-label">
							{ __( 'Content', 'ai-content-image-seo' ) }
						</p>
						{ refining ? (
							<Loading
								label={ __(
									'Updating content…',
									'ai-content-image-seo'
								) }
							/>
						) : (
							<HtmlPreview html={ result.content } />
						) }
						<div className="ai-cis-actions ai-cis-actions--compact">
							{ [
								[
									'improve',
									__( 'Improve', 'ai-content-image-seo' ),
								],
								[
									'shorten',
									__( 'Shorten', 'ai-content-image-seo' ),
								],
								[
									'expand',
									__( 'Expand', 'ai-content-image-seo' ),
								],
								[
									'rewrite',
									__( 'Rewrite', 'ai-content-image-seo' ),
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
							label={ __( 'Excerpt', 'ai-content-image-seo' ) }
							value={ result.excerpt }
							onChange={ ( v ) =>
								setResult( { ...result, excerpt: v } )
							}
						/>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __( 'SEO Title', 'ai-content-image-seo' ) }
							value={ result.seo_title }
							onChange={ ( v ) =>
								setResult( { ...result, seo_title: v } )
							}
						/>
						<TextareaControl
							__nextHasNoMarginBottom
							label={ __(
								'Meta Description',
								'ai-content-image-seo'
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
										'ai-content-image-seo'
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
									'ai-content-image-seo'
								),
								form.post_type === 'page'
									? __( 'page', 'ai-content-image-seo' )
									: __( 'post', 'ai-content-image-seo' )
							) }
							busy={ creating || !! refining }
							copyText={ htmlToText( result.content ) }
							onRegenerate={ generate }
						>
							<CopyButton
								text={ result.content }
								label={ __(
									'Copy HTML',
									'ai-content-image-seo'
								) }
							/>
						</ResultActions>
						<p className="description">
							{ __(
								'Regenerate, Improve, Shorten, Expand and Rewrite each count as one AI generation.',
								'ai-content-image-seo'
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
					'ai-content-image-seo'
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
					'ai-content-image-seo'
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
							'ai-content-image-seo'
					  )
					: __(
							'The AI result was added below your text.',
							'ai-content-image-seo'
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
					'ai-content-image-seo'
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
			setNotice( __( 'Saved to the post.', 'ai-content-image-seo' ) );
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
					'ai-content-image-seo'
				) }
			>
				<div
					className="ai-cis-segmented"
					role="group"
					aria-label={ __(
						'Content source',
						'ai-content-image-seo'
					) }
				>
					<Button
						variant={ source === 'paste' ? 'primary' : 'secondary' }
						onClick={ () => setSource( 'paste' ) }
						aria-pressed={ source === 'paste' }
					>
						{ __( 'Paste text', 'ai-content-image-seo' ) }
					</Button>
					<Button
						variant={ source === 'post' ? 'primary' : 'secondary' }
						onClick={ () => setSource( 'post' ) }
						aria-pressed={ source === 'post' }
					>
						{ __(
							'Existing post or page',
							'ai-content-image-seo'
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
										'ai-content-image-seo'
									) }
								</strong>{ ' ' }
								{ item.title }{ ' ' }
								<a href={ item.edit_link }>
									{ __( 'Edit', 'ai-content-image-seo' ) }
								</a>
							</p>
						) }
					</>
				) }

				{ ( source === 'paste' || item ) && (
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'Content', 'ai-content-image-seo' ) }
						value={ content }
						onChange={ setContent }
						rows={ 8 }
					/>
				) }

				<div className="ai-cis-grid-2">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Action', 'ai-content-image-seo' ) }
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
							? __( 'Generating…', 'ai-content-image-seo' )
							: __( 'Rewrite', 'ai-content-image-seo' ) }
					</Button>
				</div>
				<p className="description">
					{ __(
						'Your original content is never overwritten automatically.',
						'ai-content-image-seo'
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
				<Section title={ __( 'Compare', 'ai-content-image-seo' ) }>
					<div className="ai-cis-compare-cols">
						<div>
							<h3>
								{ __( 'Original', 'ai-content-image-seo' ) }
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
								{ __( 'AI Result', 'ai-content-image-seo' ) }
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
						useLabel={ __( 'Replace', 'ai-content-image-seo' ) }
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
							{ __( 'Insert (append)', 'ai-content-image-seo' ) }
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
						title: __( 'Generate Content', 'ai-content-image-seo' ),
					},
					{
						name: 'rewrite',
						title: __( 'Content Rewriter', 'ai-content-image-seo' ),
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
