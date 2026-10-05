/**
 * Block editor integration: "AI Content Assistant" sidebar.
 * Uses the editor data stores; never touches the editor DOM directly.
 */
import { registerPlugin } from '@wordpress/plugins';
import {
	PluginSidebar,
	PluginSidebarMoreMenuItem,
	store as editorStore,
} from '@wordpress/editor';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { createBlock, rawHandler } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import {
	PanelBody,
	Button,
	TextareaControl,
	TextControl,
	SelectControl,
	Notice,
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
} from '../common/api';
import {
	Loading,
	ErrorNotice,
	HtmlPreview,
	ResultActions,
	GooglePreview,
	ProviderNotice,
} from '../common/components';
import '../common/ai-cis.scss';

const TEXT_BLOCKS = [
	'core/paragraph',
	'core/heading',
	'core/list-item',
	'core/quote',
	'core/verse',
	'core/preformatted',
];

const BLOCK_ACTIONS = [
	[ 'improve', __( 'Improve', 'wbd-content-image-seo-assistant' ) ],
	[ 'rewrite', __( 'Rewrite', 'wbd-content-image-seo-assistant' ) ],
	[ 'expand', __( 'Expand', 'wbd-content-image-seo-assistant' ) ],
	[ 'shorten', __( 'Shorten', 'wbd-content-image-seo-assistant' ) ],
	[ 'grammar', __( 'Fix Grammar', 'wbd-content-image-seo-assistant' ) ],
	[ 'seo', __( 'SEO Optimize', 'wbd-content-image-seo-assistant' ) ],
];

/**
 * Block text content as an HTML string.
 *
 * @param {Object} block Block.
 * @return {string} HTML.
 */
const blockHtml = ( block ) => {
	const content = block?.attributes?.content;
	if ( ! content ) {
		return '';
	}
	return typeof content === 'string' ? content : String( content );
};

function SelectedBlockPanel() {
	const block = useSelect(
		( select ) => select( blockEditorStore ).getSelectedBlock(),
		[]
	);
	const { updateBlockAttributes, insertBlocks } =
		useDispatch( blockEditorStore );
	const blockIndex = useSelect(
		( select ) =>
			block
				? select( blockEditorStore ).getBlockIndex( block.clientId )
				: -1,
		[ block ]
	);
	const rootClientId = useSelect(
		( select ) =>
			block
				? select( blockEditorStore ).getBlockRootClientId(
						block.clientId
				  )
				: undefined,
		[ block ]
	);
	const [ busy, setBusy ] = useState( '' );
	const [ error, setError ] = useState( null );
	const [ result, setResult ] = useState( null );

	const supported =
		block &&
		TEXT_BLOCKS.includes( block.name ) &&
		blockHtml( block ).trim() !== '';

	const run = async ( action ) => {
		setBusy( action );
		setError( null );
		try {
			const res = await request( '/rewrite', {
				method: 'POST',
				data: {
					content: blockHtml( block ),
					action,
					request_id: newRequestId(),
				},
			} );
			setResult( { ...res, clientId: block.clientId } );
			speak(
				__( 'AI result ready.', 'wbd-content-image-seo-assistant' )
			);
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( '' );
	};

	const replace = () => {
		updateBlockAttributes( result.clientId, { content: result.result } );
		setResult( null );
		speak(
			__(
				'Block replaced with the AI result.',
				'wbd-content-image-seo-assistant'
			)
		);
	};

	const insertBelow = () => {
		insertBlocks(
			createBlock( 'core/paragraph', { content: result.result } ),
			blockIndex + 1,
			rootClientId
		);
		setResult( null );
		speak(
			__( 'AI result inserted below.', 'wbd-content-image-seo-assistant' )
		);
	};

	return (
		<PanelBody
			title={ __( 'Selected Block', 'wbd-content-image-seo-assistant' ) }
			initialOpen
		>
			{ ! supported ? (
				<p className="description">
					{ __(
						'Select a paragraph, heading, list item or quote with text to improve, rewrite, expand or shorten it.',
						'wbd-content-image-seo-assistant'
					) }
				</p>
			) : (
				<div className="ai-cis-button-grid">
					{ BLOCK_ACTIONS.map( ( [ action, label ] ) => (
						<Button
							key={ action }
							variant="secondary"
							onClick={ () => run( action ) }
							disabled={ !! busy }
							isBusy={ busy === action }
						>
							{ label }
						</Button>
					) ) }
				</div>
			) }
			{ busy && <Loading /> }
			<ErrorNotice error={ error } onDismiss={ () => setError( null ) } />
			{ result && ! busy && (
				<div className="ai-cis-result">
					<p className="ai-cis-label">
						{ __( 'Original', 'wbd-content-image-seo-assistant' ) }
					</p>
					<HtmlPreview html={ result.original } />
					<p className="ai-cis-label">
						{ __( 'AI Result', 'wbd-content-image-seo-assistant' ) }
					</p>
					<HtmlPreview html={ result.result } />
					<ResultActions
						onUse={ replace }
						useLabel={ __(
							'Replace',
							'wbd-content-image-seo-assistant'
						) }
						copyText={ htmlToText( result.result ) }
						onRegenerate={ () => run( result.action ) }
					>
						<Button variant="secondary" onClick={ insertBelow }>
							{ __(
								'Insert below',
								'wbd-content-image-seo-assistant'
							) }
						</Button>
					</ResultActions>
				</div>
			) }
		</PanelBody>
	);
}

function GeneratePanel() {
	const d = data();
	const postType = useSelect(
		( select ) => select( editorStore ).getCurrentPostType(),
		[]
	);
	const { insertBlocks } = useDispatch( blockEditorStore );
	const { editPost } = useDispatch( editorStore );
	const [ topic, setTopic ] = useState( '' );
	const [ tone, setTone ] = useState( d.defaults.tone );
	const [ length, setLength ] = useState( 'medium' );
	const [ language, setLanguage ] = useState( d.defaults.language );
	const [ busy, setBusy ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ result, setResult ] = useState( null );

	const generate = async () => {
		setBusy( true );
		setError( null );
		try {
			const res = await request( '/generate-content', {
				method: 'POST',
				data: {
					topic,
					tone,
					length,
					language,
					post_type: postType === 'page' ? 'page' : 'post',
					request_id: newRequestId(),
				},
			} );
			setResult( res );
			speak(
				__( 'Content generated.', 'wbd-content-image-seo-assistant' )
			);
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( false );
	};

	const insert = () => {
		insertBlocks( rawHandler( { HTML: result.content } ) );
		const edits = {};
		if ( result.title ) {
			edits.title = result.title;
		}
		if ( result.excerpt ) {
			edits.excerpt = result.excerpt;
		}
		editPost( edits );
		setResult( null );
		speak(
			__(
				'Content inserted into the editor.',
				'wbd-content-image-seo-assistant'
			)
		);
	};

	return (
		<PanelBody
			title={ __( 'Generate', 'wbd-content-image-seo-assistant' ) }
			initialOpen={ false }
		>
			<TextareaControl
				__nextHasNoMarginBottom
				label={ __( 'Topic', 'wbd-content-image-seo-assistant' ) }
				value={ topic }
				onChange={ setTopic }
				rows={ 3 }
			/>
			<SelectControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ __( 'Tone', 'wbd-content-image-seo-assistant' ) }
				value={ tone }
				options={ d.options.tones }
				onChange={ setTone }
			/>
			<SelectControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ __( 'Length', 'wbd-content-image-seo-assistant' ) }
				value={ length }
				options={ d.options.lengths }
				onChange={ setLength }
			/>
			<SelectControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ __( 'Language', 'wbd-content-image-seo-assistant' ) }
				value={ language }
				options={ d.options.languages }
				onChange={ setLanguage }
			/>
			<Button
				variant="primary"
				onClick={ generate }
				disabled={ busy || ! topic.trim() }
				isBusy={ busy }
			>
				{ __( 'Generate', 'wbd-content-image-seo-assistant' ) }
			</Button>
			{ busy && <Loading /> }
			<ErrorNotice error={ error } onDismiss={ () => setError( null ) } />
			{ result && ! busy && (
				<div className="ai-cis-result">
					<p>
						<strong>{ result.title }</strong>
					</p>
					<HtmlPreview html={ result.content } />
					<ResultActions
						onUse={ insert }
						useLabel={ __(
							'Insert into editor',
							'wbd-content-image-seo-assistant'
						) }
						copyText={ htmlToText( result.content ) }
						onRegenerate={ generate }
					/>
				</div>
			) }
		</PanelBody>
	);
}

function TitleExcerptPanel() {
	const { title, content } = useSelect(
		( select ) => ( {
			title: select( editorStore ).getEditedPostAttribute( 'title' ),
			content: select( editorStore ).getEditedPostContent(),
		} ),
		[]
	);
	const { editPost } = useDispatch( editorStore );
	const [ busy, setBusy ] = useState( '' );
	const [ error, setError ] = useState( null );
	const [ titles, setTitles ] = useState( [] );
	const [ excerpt, setExcerpt ] = useState( '' );

	const gen = async ( field ) => {
		setBusy( field );
		setError( null );
		try {
			const res = await request( '/generate-field', {
				method: 'POST',
				data: { field, title, content, request_id: newRequestId() },
			} );
			if ( field === 'title' ) {
				setTitles( res.options || [] );
			} else {
				setExcerpt( res.value || '' );
			}
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( '' );
	};

	return (
		<PanelBody
			title={ __( 'Title & Excerpt', 'wbd-content-image-seo-assistant' ) }
			initialOpen={ false }
		>
			<div className="ai-cis-button-grid">
				<Button
					variant="secondary"
					onClick={ () => gen( 'title' ) }
					disabled={ !! busy }
					isBusy={ busy === 'title' }
				>
					{ __(
						'Suggest Titles',
						'wbd-content-image-seo-assistant'
					) }
				</Button>
				<Button
					variant="secondary"
					onClick={ () => gen( 'excerpt' ) }
					disabled={ !! busy }
					isBusy={ busy === 'excerpt' }
				>
					{ __(
						'Generate Excerpt',
						'wbd-content-image-seo-assistant'
					) }
				</Button>
			</div>
			{ busy && <Loading /> }
			<ErrorNotice error={ error } onDismiss={ () => setError( null ) } />
			{ titles.length > 0 && (
				<ul className="ai-cis-option-list">
					{ titles.map( ( t ) => (
						<li key={ t }>
							<span>{ t }</span>
							<Button
								variant="link"
								onClick={ () => {
									editPost( { title: t } );
									speak(
										__(
											'Title updated.',
											'wbd-content-image-seo-assistant'
										)
									);
								} }
							>
								{ __(
									'Use This',
									'wbd-content-image-seo-assistant'
								) }
							</Button>
						</li>
					) ) }
				</ul>
			) }
			{ excerpt && (
				<div className="ai-cis-result">
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __(
							'AI Excerpt',
							'wbd-content-image-seo-assistant'
						) }
						value={ excerpt }
						onChange={ setExcerpt }
					/>
					<ResultActions
						onUse={ () => {
							editPost( { excerpt } );
							speak(
								__(
									'Excerpt updated.',
									'wbd-content-image-seo-assistant'
								)
							);
						} }
						copyText={ excerpt }
						onRegenerate={ () => gen( 'excerpt' ) }
					/>
				</div>
			) }
		</PanelBody>
	);
}

function SeoPanel() {
	const { postId, title, content, link } = useSelect(
		( select ) => ( {
			postId: select( editorStore ).getCurrentPostId(),
			title: select( editorStore ).getEditedPostAttribute( 'title' ),
			content: select( editorStore ).getEditedPostContent(),
			link: select( editorStore ).getPermalink(),
		} ),
		[]
	);
	const [ busy, setBusy ] = useState( false );
	const [ saving, setSaving ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ seo, setSeo ] = useState( null );
	const [ notice, setNotice ] = useState( '' );

	const generate = async () => {
		setBusy( true );
		setError( null );
		setNotice( '' );
		try {
			const res = await request( '/seo/generate', {
				method: 'POST',
				data: {
					post_id: postId,
					title,
					content,
					request_id: newRequestId(),
				},
			} );
			setSeo( res );
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( false );
	};

	const save = async () => {
		setSaving( true );
		try {
			const res = await request( '/seo/save', {
				method: 'POST',
				data: { post_id: postId, ...seo },
			} );
			setNotice(
				sprintf(
					/* translators: %s: SEO plugin name. */
					__( 'Saved to %s.', 'wbd-content-image-seo-assistant' ),
					res.target
				)
			);
			speak(
				__( 'SEO metadata saved.', 'wbd-content-image-seo-assistant' )
			);
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setSaving( false );
	};

	return (
		<PanelBody
			title={ __( 'SEO Optimize', 'wbd-content-image-seo-assistant' ) }
			initialOpen={ false }
		>
			<p className="description">
				{ sprintf(
					/* translators: %s: SEO plugin name. */
					__(
						'Saves to: %s. Nothing is saved until you confirm.',
						'wbd-content-image-seo-assistant'
					),
					data().seoPluginLabel
				) }
			</p>
			<Button
				variant="secondary"
				onClick={ generate }
				disabled={ busy }
				isBusy={ busy }
			>
				{ __(
					'Generate SEO Title & Meta',
					'wbd-content-image-seo-assistant'
				) }
			</Button>
			{ busy && <Loading /> }
			<ErrorNotice error={ error } onDismiss={ () => setError( null ) } />
			{ seo && ! busy && (
				<div className="ai-cis-result">
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'SEO Title',
							'wbd-content-image-seo-assistant'
						) }
						value={ seo.seo_title }
						onChange={ ( v ) => setSeo( { ...seo, seo_title: v } ) }
					/>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __(
							'Meta Description',
							'wbd-content-image-seo-assistant'
						) }
						value={ seo.meta_description }
						onChange={ ( v ) =>
							setSeo( { ...seo, meta_description: v } )
						}
					/>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Focus Keyword',
							'wbd-content-image-seo-assistant'
						) }
						value={ seo.focus_keyword }
						onChange={ ( v ) =>
							setSeo( { ...seo, focus_keyword: v } )
						}
					/>
					<GooglePreview
						title={ seo.seo_title }
						description={ seo.meta_description }
						url={ link }
					/>
					<ResultActions
						onUse={ save }
						useLabel={ __(
							'Save SEO Metadata',
							'wbd-content-image-seo-assistant'
						) }
						busy={ saving }
						copyText={ seo.seo_title + '\n' + seo.meta_description }
						onRegenerate={ generate }
					/>
					{ data().seoPlugin && (
						<p className="description">
							{ __(
								'Tip: reload the editor before your next save so your SEO plugin panel shows the new values.',
								'wbd-content-image-seo-assistant'
							) }
						</p>
					) }
				</div>
			) }
			{ notice && (
				<Notice status="success" onRemove={ () => setNotice( '' ) }>
					<p>{ notice }</p>
				</Notice>
			) }
		</PanelBody>
	);
}

function AssistantSidebar() {
	return (
		<>
			<PluginSidebarMoreMenuItem
				target="ai-cis-assistant"
				icon="superhero-alt"
			>
				{ __(
					'AI Content Assistant',
					'wbd-content-image-seo-assistant'
				) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				name="ai-cis-assistant"
				title={ __(
					'AI Content Assistant',
					'wbd-content-image-seo-assistant'
				) }
				icon="superhero-alt"
			>
				<div className="ai-cis-editor-sidebar">
					<ProviderNotice />
					<SelectedBlockPanel />
					<GeneratePanel />
					<TitleExcerptPanel />
					<SeoPanel />
				</div>
			</PluginSidebar>
		</>
	);
}

registerPlugin( 'wbd-content-image-seo-assistant', {
	render: AssistantSidebar,
} );
