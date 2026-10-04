/**
 * Generate → review → apply flow for one image. Shared by Image AI,
 * the Media Library modal and the SEO Assistant.
 */
import {
	Button,
	CheckboxControl,
	RadioControl,
	SelectControl,
	TextControl,
	TextareaControl,
	ToggleControl,
	Notice,
	Spinner,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { speak } from '@wordpress/a11y';
import { request, errorInfo, newRequestId, data } from './api';
import { ErrorNotice, Loading, ProviderNotice, CopyButton } from './components';

const FIELD_ORDER = [ 'alt', 'title', 'caption', 'description' ];

/**
 * Field labels from bootstrap data.
 *
 * @return {Object} Map.
 */
const fieldLabels = () => {
	const map = {};
	( data().options?.imageFields || [] ).forEach( ( f ) => {
		map[ f.value ] = f.label;
	} );
	return map;
};

export default function ImageMetadataPanel( { attachmentId, onApplied } ) {
	const labels = fieldLabels();
	const defaults = data().defaults || {};

	const [ item, setItem ] = useState( null );
	const [ loadError, setLoadError ] = useState( null );
	const [ fields, setFields ] = useState(
		defaults.imageFields?.length ? defaults.imageFields : [ 'alt', 'title' ]
	);
	const [ imageType, setImageType ] = useState( 'informative' );
	const [ style, setStyle ] = useState( defaults.altStyle || 'balanced' );
	const [ overwrite, setOverwrite ] = useState( false );
	const [ busy, setBusy ] = useState( false );
	const [ saving, setSaving ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ result, setResult ] = useState( null );
	const [ apply, setApply ] = useState( [] );
	const [ saved, setSaved ] = useState( null );

	useEffect( () => {
		let active = true;
		setItem( null );
		setResult( null );
		setSaved( null );
		setError( null );
		request( '/images/' + attachmentId )
			.then( ( res ) => {
				if ( ! active ) {
					return;
				}
				setItem( res );
				if ( res.image_type ) {
					setImageType( res.image_type );
				}
			} )
			.catch( ( e ) => active && setLoadError( errorInfo( e ) ) );
		return () => {
			active = false;
		};
	}, [ attachmentId ] );

	if ( loadError ) {
		return <ErrorNotice error={ loadError } />;
	}
	if ( ! item ) {
		return <Spinner />;
	}

	const toggleField = ( field, checked ) =>
		setFields( ( prev ) =>
			checked
				? [ ...new Set( [ ...prev, field ] ) ]
				: prev.filter( ( f ) => f !== field )
		);

	const generate = async () => {
		setBusy( true );
		setError( null );
		setSaved( null );
		try {
			const res = await request( '/generate-image-metadata', {
				method: 'POST',
				data: {
					attachment_id: attachmentId,
					fields,
					image_type: imageType,
					style,
					request_id: newRequestId(),
				},
			} );
			setResult( res.values );
			setApply( Object.keys( res.values ) );
			speak(
				__(
					'AI metadata generated. Review it before applying.',
					'ai-content-image-seo'
				)
			);
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( false );
	};

	const applySelected = async () => {
		setSaving( true );
		setError( null );
		try {
			const res = await request( '/apply-image-metadata', {
				method: 'POST',
				data: {
					attachment_id: attachmentId,
					values: result || {},
					fields: apply,
					overwrite,
					image_type: imageType,
				},
			} );
			setSaved( res );
			setItem( { ...item, ...res.current, image_type: imageType } );
			speak( __( 'Metadata saved.', 'ai-content-image-seo' ) );
			if ( onApplied ) {
				onApplied( res.current );
			}
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setSaving( false );
	};

	const current = {
		alt: item.alt,
		title: item.title,
		caption: item.caption,
		description: item.description,
	};

	const decorativeOnlyAlt =
		imageType === 'decorative' &&
		fields.length === 1 &&
		fields[ 0 ] === 'alt';

	return (
		<div className="ai-cis-image-panel">
			<div className="ai-cis-image-panel__head">
				{ item.thumb && (
					<img
						src={ item.thumb }
						alt=""
						className="ai-cis-image-panel__thumb"
					/>
				) }
				<div>
					<p className="ai-cis-image-panel__name">
						{ item.filename }
					</p>
					{ item.parent && (
						<p className="description">
							{ sprintf(
								/* translators: %s: parent post title. */
								__( 'Attached to: %s', 'ai-content-image-seo' ),
								item.parent.title
							) }
						</p>
					) }
				</div>
			</div>

			<ProviderNotice />

			<fieldset className="ai-cis-fieldset">
				<legend>
					{ __( 'Fields to generate', 'ai-content-image-seo' ) }
				</legend>
				{ FIELD_ORDER.map( ( field ) => (
					<CheckboxControl
						key={ field }
						__nextHasNoMarginBottom
						label={ labels[ field ] || field }
						checked={ fields.includes( field ) }
						onChange={ ( checked ) =>
							toggleField( field, checked )
						}
					/>
				) ) }
			</fieldset>

			<div className="ai-cis-grid-2">
				<RadioControl
					label={ __( 'Image Type', 'ai-content-image-seo' ) }
					selected={ imageType }
					onChange={ setImageType }
					options={ [
						{
							label: __( 'Informative', 'ai-content-image-seo' ),
							value: 'informative',
						},
						{
							label: __(
								'Decorative (alt text stays empty)',
								'ai-content-image-seo'
							),
							value: 'decorative',
						},
						{
							label: __( 'Unsure', 'ai-content-image-seo' ),
							value: 'unsure',
						},
					] }
				/>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Alt Text Style', 'ai-content-image-seo' ) }
					value={ style }
					onChange={ setStyle }
					options={ [
						{
							label: __( 'Balanced', 'ai-content-image-seo' ),
							value: 'balanced',
						},
						{
							label: __(
								'Accessibility First',
								'ai-content-image-seo'
							),
							value: 'accessibility',
						},
						{
							label: __( 'SEO Focused', 'ai-content-image-seo' ),
							value: 'seo',
						},
					] }
				/>
			</div>

			<div className="ai-cis-actions">
				<Button
					variant="primary"
					onClick={
						decorativeOnlyAlt
							? () => {
									setResult( { alt: '' } );
									setApply( [ 'alt' ] );
							  }
							: generate
					}
					isBusy={ busy }
					disabled={ busy || ! fields.length }
				>
					{ decorativeOnlyAlt
						? __( 'Mark as Decorative', 'ai-content-image-seo' )
						: __(
								'Generate Image Metadata',
								'ai-content-image-seo'
						  ) }
				</Button>
				{ result && ! decorativeOnlyAlt && (
					<Button
						variant="tertiary"
						onClick={ generate }
						disabled={ busy }
					>
						{ __( 'Regenerate', 'ai-content-image-seo' ) }
					</Button>
				) }
			</div>

			{ busy && <Loading /> }
			<ErrorNotice error={ error } onDismiss={ () => setError( null ) } />

			{ result && ! busy && (
				<div className="ai-cis-compare" aria-live="polite">
					<h3>
						{ __( 'Review AI result', 'ai-content-image-seo' ) }
					</h3>
					{ FIELD_ORDER.filter( ( f ) => f in result ).map(
						( field ) => {
							const Control =
								field === 'description' || field === 'caption'
									? TextareaControl
									: TextControl;
							const hasCurrent =
								( current[ field ] || '' ).trim() !== '';
							return (
								<div
									key={ field }
									className="ai-cis-compare__row"
								>
									<CheckboxControl
										__nextHasNoMarginBottom
										label={ sprintf(
											/* translators: %s: field label. */
											__(
												'Apply %s',
												'ai-content-image-seo'
											),
											labels[ field ] || field
										) }
										checked={ apply.includes( field ) }
										onChange={ ( checked ) =>
											setApply( ( prev ) =>
												checked
													? [ ...prev, field ]
													: prev.filter(
															( f ) => f !== field
													  )
											)
										}
									/>
									<p className="ai-cis-compare__current">
										<strong>
											{ __(
												'Current:',
												'ai-content-image-seo'
											) }
										</strong>{ ' ' }
										{ hasCurrent ? (
											current[ field ]
										) : (
											<em>
												{ __(
													'(empty)',
													'ai-content-image-seo'
												) }
											</em>
										) }
									</p>
									{ field === 'alt' &&
									imageType === 'decorative' ? (
										<p className="description">
											{ __(
												'Decorative image: the alt text will be saved as empty so screen readers skip it.',
												'ai-content-image-seo'
											) }
										</p>
									) : (
										<div className="ai-cis-compare__edit">
											<Control
												__nextHasNoMarginBottom
												__next40pxDefaultSize
												label={ sprintf(
													/* translators: %s: field label. */
													__(
														'AI %s',
														'ai-content-image-seo'
													),
													labels[ field ] || field
												) }
												value={ result[ field ] }
												onChange={ ( value ) =>
													setResult( {
														...result,
														[ field ]: value,
													} )
												}
											/>
											<CopyButton
												text={ result[ field ] }
											/>
										</div>
									) }
									{ hasCurrent &&
										! overwrite &&
										apply.includes( field ) && (
											<p className="description ai-cis-warn-text">
												{ __(
													'This field already has a value and will be kept unless you enable "Overwrite existing metadata".',
													'ai-content-image-seo'
												) }
											</p>
										) }
								</div>
							);
						}
					) }

					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Overwrite existing metadata',
							'ai-content-image-seo'
						) }
						checked={ overwrite }
						onChange={ setOverwrite }
					/>

					<div className="ai-cis-actions">
						<Button
							variant="primary"
							onClick={ applySelected }
							isBusy={ saving }
							disabled={ saving || ! apply.length }
						>
							{ __( 'Apply Selected', 'ai-content-image-seo' ) }
						</Button>
					</div>
				</div>
			) }

			{ saved && (
				<Notice
					status="success"
					isDismissible
					onRemove={ () => setSaved( null ) }
					className="ai-cis-notice"
				>
					<p>
						{ saved.updated.length
							? sprintf(
									/* translators: %s: list of fields. */
									__( 'Saved: %s.', 'ai-content-image-seo' ),
									saved.updated
										.map( ( f ) => labels[ f ] || f )
										.join( ', ' )
							  )
							: __(
									'Nothing was changed.',
									'ai-content-image-seo'
							  ) }{ ' ' }
						{ saved.skipped.length > 0 &&
							sprintf(
								/* translators: %s: list of fields. */
								__(
									'Kept existing: %s.',
									'ai-content-image-seo'
								),
								saved.skipped
									.map( ( f ) => labels[ f ] || f )
									.join( ', ' )
							) }
					</p>
				</Notice>
			) }
		</div>
	);
}
