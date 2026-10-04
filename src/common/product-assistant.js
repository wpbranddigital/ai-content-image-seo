/**
 * AI Product Assistant: used in the product editor meta box (mode "editor",
 * fills the form) and on the WooCommerce admin page (mode "direct", saves via REST).
 */
import {
	Button,
	CheckboxControl,
	RadioControl,
	SelectControl,
	TextControl,
	TextareaControl,
	Notice,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { speak } from '@wordpress/a11y';
import { request, errorInfo, newRequestId, data, htmlToText } from './api';
import {
	ErrorNotice,
	Loading,
	HtmlPreview,
	ResultActions,
	GooglePreview,
	ProviderNotice,
	CopyButton,
} from './components';
import {
	readProductForm,
	setEditorValue,
	setInputValue,
	addTagsToForm,
	checkCategoriesInForm,
	syncSeoFields,
	getEditorValue,
} from './classic-editor';

const ACTIONS = [
	{ field: 'title', label: __( 'Generate Title', 'ai-content-image-seo' ) },
	{
		field: 'description',
		label: __( 'Generate Description', 'ai-content-image-seo' ),
	},
	{
		field: 'short_description',
		label: __( 'Generate Short Description', 'ai-content-image-seo' ),
	},
	{
		field: 'seo',
		label: __( 'Generate SEO Metadata', 'ai-content-image-seo' ),
	},
	{ field: 'tags', label: __( 'Generate Tags', 'ai-content-image-seo' ) },
	{
		field: 'categories',
		label: __( 'Suggest Categories', 'ai-content-image-seo' ),
	},
	{
		field: 'improve',
		label: __( 'Improve Existing Content', 'ai-content-image-seo' ),
	},
];

export default function ProductAssistant( {
	productId,
	mode = 'editor',
	product = null,
	onSaved,
} ) {
	const [ field, setField ] = useState( null );
	const [ tone, setTone ] = useState(
		data().defaults?.tone || 'professional'
	);
	const [ language, setLanguage ] = useState(
		data().defaults?.language || 'English'
	);
	const [ busy, setBusy ] = useState( false );
	const [ saving, setSaving ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ result, setResult ] = useState( null );
	const [ choice, setChoice ] = useState( '' );
	const [ selected, setSelected ] = useState( [] );
	const [ notice, setNotice ] = useState( '' );

	const isEditor = mode === 'editor';

	const generate = async ( target ) => {
		setField( target );
		setBusy( true );
		setError( null );
		setResult( null );
		setNotice( '' );
		try {
			const res = await request( '/generate-product-content', {
				method: 'POST',
				data: {
					product_id: productId,
					field: target,
					tone,
					language,
					request_id: newRequestId(),
					overrides: isEditor ? readProductForm() : {},
				},
			} );
			setResult( res );
			if ( res.options ) {
				setChoice( res.options[ 0 ] );
				setSelected(
					target === 'categories'
						? res.options.filter(
								( o ) => res.existing && res.existing[ o ]
						  )
						: res.options
				);
			}
			speak(
				__(
					'AI result ready. Review it before using it.',
					'ai-content-image-seo'
				)
			);
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( false );
	};

	const saveDirect = async ( value, extra = {} ) => {
		const res = await request( '/apply-product-content', {
			method: 'POST',
			data: {
				product_id: productId,
				field: result.field,
				value,
				...extra,
			},
		} );
		if ( onSaved ) {
			onSaved( result.field, value );
		}
		return res;
	};

	const done = ( message ) => {
		setNotice( message );
		speak( message );
	};

	const use = async () => {
		setSaving( true );
		setError( null );
		const target = result.field;
		try {
			if ( target === 'title' ) {
				if ( isEditor && setInputValue( '#title', choice ) ) {
					document
						.getElementById( 'title-prompt-text' )
						?.classList.add( 'screen-reader-text' );
					done(
						__(
							'Title inserted. Click "Update" to save the product.',
							'ai-content-image-seo'
						)
					);
				} else {
					await saveDirect( choice );
					done(
						__( 'Product title saved.', 'ai-content-image-seo' )
					);
				}
			} else if (
				[ 'description', 'improve', 'short_description' ].includes(
					target
				)
			) {
				const editorId =
					target === 'short_description' ? 'excerpt' : 'content';
				if ( isEditor && setEditorValue( editorId, result.value ) ) {
					done(
						__(
							'Inserted into the editor. Click "Update" to save the product.',
							'ai-content-image-seo'
						)
					);
				} else {
					await saveDirect( result.value );
					done(
						__( 'Product content saved.', 'ai-content-image-seo' )
					);
				}
			} else if ( target === 'tags' ) {
				if ( isEditor && addTagsToForm( selected ) ) {
					done(
						__(
							'Tags added. Click "Update" to save the product.',
							'ai-content-image-seo'
						)
					);
				} else {
					await saveDirect( selected, { mode: 'append' } );
					done(
						__(
							'Tags added to the product.',
							'ai-content-image-seo'
						)
					);
				}
			} else if ( target === 'categories' ) {
				const res = await saveDirect( selected, { mode: 'append' } );
				if ( isEditor ) {
					checkCategoriesInForm( res.terms || [] );
				}
				done( __( 'Categories assigned.', 'ai-content-image-seo' ) );
			} else if ( target === 'seo' ) {
				const seo = {
					seo_title: result.seo_title,
					meta_description: result.meta_description,
					focus_keyword: result.focus_keyword,
				};
				await saveDirect( seo );
				if ( isEditor ) {
					syncSeoFields( seo );
				}
				done(
					sprintf(
						/* translators: %s: SEO plugin name. */
						__(
							'SEO metadata saved to %s.',
							'ai-content-image-seo'
						),
						data().seoPluginLabel
					)
				);
			}
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setSaving( false );
	};

	const renderResult = () => {
		if ( ! result ) {
			return null;
		}
		const target = result.field;

		if ( target === 'title' ) {
			return (
				<>
					<RadioControl
						label={ __( 'Choose a title', 'ai-content-image-seo' ) }
						selected={ choice }
						options={ result.options.map( ( o ) => ( {
							label: o,
							value: o,
						} ) ) }
						onChange={ setChoice }
					/>
					<ResultActions
						onUse={ use }
						busy={ saving }
						copyText={ choice }
						onRegenerate={ () => generate( target ) }
					/>
				</>
			);
		}

		if ( target === 'tags' || target === 'categories' ) {
			return (
				<>
					<fieldset className="ai-cis-fieldset">
						<legend>
							{ target === 'tags'
								? __(
										'Select tags to add',
										'ai-content-image-seo'
								  )
								: __(
										'Select categories to assign',
										'ai-content-image-seo'
								  ) }
						</legend>
						{ result.options.map( ( option ) => (
							<CheckboxControl
								key={ option }
								__nextHasNoMarginBottom
								label={
									target === 'categories' &&
									result.existing &&
									! result.existing[ option ]
										? sprintf(
												/* translators: %s: category name. */
												__(
													'%s (new category)',
													'ai-content-image-seo'
												),
												option
										  )
										: option
								}
								checked={ selected.includes( option ) }
								onChange={ ( checked ) =>
									setSelected( ( prev ) =>
										checked
											? [ ...prev, option ]
											: prev.filter(
													( o ) => o !== option
											  )
									)
								}
							/>
						) ) }
					</fieldset>
					{ target === 'categories' && (
						<p className="description">
							{ __(
								'Categories are never assigned automatically. Only the categories you select are added.',
								'ai-content-image-seo'
							) }
						</p>
					) }
					<ResultActions
						onUse={ selected.length ? use : null }
						useLabel={
							target === 'tags'
								? __(
										'Add Selected Tags',
										'ai-content-image-seo'
								  )
								: __(
										'Assign Selected Categories',
										'ai-content-image-seo'
								  )
						}
						busy={ saving }
						copyText={ selected.join( ', ' ) }
						onRegenerate={ () => generate( target ) }
					/>
				</>
			);
		}

		if ( target === 'seo' ) {
			return (
				<>
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
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Focus Keyword', 'ai-content-image-seo' ) }
						value={ result.focus_keyword }
						onChange={ ( v ) =>
							setResult( { ...result, focus_keyword: v } )
						}
					/>
					<GooglePreview
						title={ result.seo_title }
						description={ result.meta_description }
					/>
					<ResultActions
						onUse={ use }
						useLabel={ __(
							'Save SEO Metadata',
							'ai-content-image-seo'
						) }
						busy={ saving }
						copyText={
							result.seo_title + '\n' + result.meta_description
						}
						onRegenerate={ () => generate( target ) }
					/>
				</>
			);
		}

		let original = '';
		if ( target === 'improve' ) {
			original = isEditor
				? getEditorValue( 'content' )
				: product?.description || '';
		}

		return (
			<>
				{ target === 'improve' && original && (
					<details className="ai-cis-original">
						<summary>
							{ __( 'Original', 'ai-content-image-seo' ) }
						</summary>
						<HtmlPreview html={ original } />
					</details>
				) }
				<p className="ai-cis-label">
					{ __( 'AI Result', 'ai-content-image-seo' ) }
				</p>
				<HtmlPreview html={ result.value } />
				<ResultActions
					onUse={ use }
					useLabel={
						isEditor
							? __( 'Insert into Editor', 'ai-content-image-seo' )
							: __( 'Save to Product', 'ai-content-image-seo' )
					}
					busy={ saving }
					copyText={ htmlToText( result.value ) }
					onRegenerate={ () => generate( target ) }
				>
					<CopyButton
						text={ result.value }
						label={ __( 'Copy HTML', 'ai-content-image-seo' ) }
					/>
				</ResultActions>
			</>
		);
	};

	return (
		<div className={ 'ai-cis-product-assistant is-' + mode }>
			<ProviderNotice />
			<div className="ai-cis-grid-2">
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Tone', 'ai-content-image-seo' ) }
					value={ tone }
					options={ data().options.tones }
					onChange={ setTone }
				/>
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Language', 'ai-content-image-seo' ) }
					value={ language }
					options={ data().options.languages }
					onChange={ setLanguage }
				/>
			</div>
			<div className="ai-cis-button-stack">
				{ ACTIONS.map( ( action ) => (
					<Button
						key={ action.field }
						variant={
							field === action.field ? 'primary' : 'secondary'
						}
						onClick={ () => generate( action.field ) }
						disabled={ busy }
						isBusy={ busy && field === action.field }
					>
						{ action.label }
					</Button>
				) ) }
			</div>
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
			{ ! busy && result && (
				<div className="ai-cis-result">{ renderResult() }</div>
			) }
		</div>
	);
}
