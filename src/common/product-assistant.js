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
	{
		field: 'title',
		label: __( 'Generate Title', 'wbd-content-image-seo-assistant' ),
	},
	{
		field: 'description',
		label: __( 'Generate Description', 'wbd-content-image-seo-assistant' ),
	},
	{
		field: 'short_description',
		label: __(
			'Generate Short Description',
			'wbd-content-image-seo-assistant'
		),
	},
	{
		field: 'seo',
		label: __( 'Generate SEO Metadata', 'wbd-content-image-seo-assistant' ),
	},
	{
		field: 'tags',
		label: __( 'Generate Tags', 'wbd-content-image-seo-assistant' ),
	},
	{
		field: 'categories',
		label: __( 'Suggest Categories', 'wbd-content-image-seo-assistant' ),
	},
	{
		field: 'improve',
		label: __(
			'Improve Existing Content',
			'wbd-content-image-seo-assistant'
		),
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
					'wbd-content-image-seo-assistant'
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
							'wbd-content-image-seo-assistant'
						)
					);
				} else {
					await saveDirect( choice );
					done(
						__(
							'Product title saved.',
							'wbd-content-image-seo-assistant'
						)
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
							'wbd-content-image-seo-assistant'
						)
					);
				} else {
					await saveDirect( result.value );
					done(
						__(
							'Product content saved.',
							'wbd-content-image-seo-assistant'
						)
					);
				}
			} else if ( target === 'tags' ) {
				if ( isEditor && addTagsToForm( selected ) ) {
					done(
						__(
							'Tags added. Click "Update" to save the product.',
							'wbd-content-image-seo-assistant'
						)
					);
				} else {
					await saveDirect( selected, { mode: 'append' } );
					done(
						__(
							'Tags added to the product.',
							'wbd-content-image-seo-assistant'
						)
					);
				}
			} else if ( target === 'categories' ) {
				const res = await saveDirect( selected, { mode: 'append' } );
				if ( isEditor ) {
					checkCategoriesInForm( res.terms || [] );
				}
				done(
					__(
						'Categories assigned.',
						'wbd-content-image-seo-assistant'
					)
				);
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
							'wbd-content-image-seo-assistant'
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
						label={ __(
							'Choose a title',
							'wbd-content-image-seo-assistant'
						) }
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
										'wbd-content-image-seo-assistant'
								  )
								: __(
										'Select categories to assign',
										'wbd-content-image-seo-assistant'
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
													'wbd-content-image-seo-assistant'
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
								'wbd-content-image-seo-assistant'
							) }
						</p>
					) }
					<ResultActions
						onUse={ selected.length ? use : null }
						useLabel={
							target === 'tags'
								? __(
										'Add Selected Tags',
										'wbd-content-image-seo-assistant'
								  )
								: __(
										'Assign Selected Categories',
										'wbd-content-image-seo-assistant'
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
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Focus Keyword',
							'wbd-content-image-seo-assistant'
						) }
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
							'wbd-content-image-seo-assistant'
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
							{ __(
								'Original',
								'wbd-content-image-seo-assistant'
							) }
						</summary>
						<HtmlPreview html={ original } />
					</details>
				) }
				<p className="ai-cis-label">
					{ __( 'AI Result', 'wbd-content-image-seo-assistant' ) }
				</p>
				<HtmlPreview html={ result.value } />
				<ResultActions
					onUse={ use }
					useLabel={
						isEditor
							? __(
									'Insert into Editor',
									'wbd-content-image-seo-assistant'
							  )
							: __(
									'Save to Product',
									'wbd-content-image-seo-assistant'
							  )
					}
					busy={ saving }
					copyText={ htmlToText( result.value ) }
					onRegenerate={ () => generate( target ) }
				>
					<CopyButton
						text={ result.value }
						label={ __(
							'Copy HTML',
							'wbd-content-image-seo-assistant'
						) }
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
					label={ __( 'Tone', 'wbd-content-image-seo-assistant' ) }
					value={ tone }
					options={ data().options.tones }
					onChange={ setTone }
				/>
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __(
						'Language',
						'wbd-content-image-seo-assistant'
					) }
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
