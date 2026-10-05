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
					'wbd-content-image-seo-assistant'
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
			speak( __( 'Metadata saved.', 'wbd-content-image-seo-assistant' ) );
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
								__(
									'Attached to: %s',
									'wbd-content-image-seo-assistant'
								),
								item.parent.title
							) }
						</p>
					) }
				</div>
			</div>

			<ProviderNotice />

			<fieldset className="ai-cis-fieldset">
				<legend>
					{ __(
						'Fields to generate',
						'wbd-content-image-seo-assistant'
					) }
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
					label={ __(
						'Image Type',
						'wbd-content-image-seo-assistant'
					) }
					selected={ imageType }
					onChange={ setImageType }
					options={ [
						{
							label: __(
								'Informative',
								'wbd-content-image-seo-assistant'
							),
							value: 'informative',
						},
						{
							label: __(
								'Decorative (alt text stays empty)',
								'wbd-content-image-seo-assistant'
							),
							value: 'decorative',
						},
						{
							label: __(
								'Unsure',
								'wbd-content-image-seo-assistant'
							),
							value: 'unsure',
						},
					] }
				/>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __(
						'Alt Text Style',
						'wbd-content-image-seo-assistant'
					) }
					value={ style }
					onChange={ setStyle }
					options={ [
						{
							label: __(
								'Balanced',
								'wbd-content-image-seo-assistant'
							),
							value: 'balanced',
						},
						{
							label: __(
								'Accessibility First',
								'wbd-content-image-seo-assistant'
							),
							value: 'accessibility',
						},
						{
							label: __(
								'SEO Focused',
								'wbd-content-image-seo-assistant'
							),
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
						? __(
								'Mark as Decorative',
								'wbd-content-image-seo-assistant'
						  )
						: __(
								'Generate Image Metadata',
								'wbd-content-image-seo-assistant'
						  ) }
				</Button>
				{ result && ! decorativeOnlyAlt && (
					<Button
						variant="tertiary"
						onClick={ generate }
						disabled={ busy }
					>
						{ __(
							'Regenerate',
							'wbd-content-image-seo-assistant'
						) }
					</Button>
				) }
			</div>

			{ busy && <Loading /> }
			<ErrorNotice error={ error } onDismiss={ () => setError( null ) } />

			{ result && ! busy && (
				<div className="ai-cis-compare" aria-live="polite">
					<h3>
						{ __(
							'Review AI result',
							'wbd-content-image-seo-assistant'
						) }
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
												'wbd-content-image-seo-assistant'
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
												'wbd-content-image-seo-assistant'
											) }
										</strong>{ ' ' }
										{ hasCurrent ? (
											current[ field ]
										) : (
											<em>
												{ __(
													'(empty)',
													'wbd-content-image-seo-assistant'
												) }
											</em>
										) }
									</p>
									{ field === 'alt' &&
									imageType === 'decorative' ? (
										<p className="description">
											{ __(
												'Decorative image: the alt text will be saved as empty so screen readers skip it.',
												'wbd-content-image-seo-assistant'
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
														'wbd-content-image-seo-assistant'
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
													'wbd-content-image-seo-assistant'
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
							'wbd-content-image-seo-assistant'
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
							{ __(
								'Apply Selected',
								'wbd-content-image-seo-assistant'
							) }
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
									__(
										'Saved: %s.',
										'wbd-content-image-seo-assistant'
									),
									saved.updated
										.map( ( f ) => labels[ f ] || f )
										.join( ', ' )
							  )
							: __(
									'Nothing was changed.',
									'wbd-content-image-seo-assistant'
							  ) }{ ' ' }
						{ saved.skipped.length > 0 &&
							sprintf(
								/* translators: %s: list of fields. */
								__(
									'Kept existing: %s.',
									'wbd-content-image-seo-assistant'
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
