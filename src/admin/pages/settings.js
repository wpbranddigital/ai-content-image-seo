/**
 * Settings. API keys are write-only: the server only ever returns whether a
 * key is configured plus its last four characters.
 */
import {
	Button,
	CheckboxControl,
	Notice,
	RadioControl,
	RangeControl,
	SelectControl,
	Spinner,
	TabPanel,
	TextControl,
	TextareaControl,
	ToggleControl,
	ExternalLink,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { speak } from '@wordpress/a11y';
import { request, errorInfo, data } from '../../common/api';
import { Section, ErrorNotice } from '../../common/components';
import { LanguageControl } from './content-ai';

const KEY_LINKS = {
	openai: 'https://platform.openai.com/api-keys',
	gemini: 'https://aistudio.google.com/apikey',
	anthropic: 'https://console.anthropic.com/settings/keys',
	openrouter: 'https://openrouter.ai/keys',
};

function ProviderTab( {
	form,
	set,
	status,
	keys,
	setKeys,
	publicKeys,
	onModelsRefreshed,
} ) {
	const provider = form.provider;
	const info = status.providers[ provider ] || {};
	const [ testing, setTesting ] = useState( false );
	const [ refreshing, setRefreshing ] = useState( false );
	const [ testResult, setTestResult ] = useState( null );
	const [ error, setError ] = useState( null );

	const models = info.models || { auto: 'Auto' };
	const currentModel = form.provider_models[ provider ] || 'auto';
	const isKnownModel = Object.prototype.hasOwnProperty.call(
		models,
		currentModel
	);
	const [ customChosen, setCustomModel ] = useState( false );
	const customModel = customChosen || ! isKnownModel;

	const setModel = ( value ) =>
		set( 'provider_models', {
			...form.provider_models,
			[ provider ]: value,
		} );

	const test = async () => {
		setTesting( true );
		setTestResult( null );
		setError( null );
		try {
			const res = await request( '/provider/test', {
				method: 'POST',
				data: { provider },
			} );
			setTestResult( res.message );
			speak( res.message );
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setTesting( false );
	};

	const refreshModels = async () => {
		setRefreshing( true );
		setError( null );
		try {
			const res = await request( '/provider/models', {
				method: 'POST',
				data: { provider },
			} );
			onModelsRefreshed( provider, res.models );
			speak(
				__( 'Model list updated.', 'wbd-content-image-seo-assistant' )
			);
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setRefreshing( false );
	};

	const keyInfo = publicKeys[ provider ];

	return (
		<Section
			title={ __( 'AI Provider', 'wbd-content-image-seo-assistant' ) }
		>
			<RadioControl
				label={ __( 'Provider', 'wbd-content-image-seo-assistant' ) }
				selected={ provider }
				onChange={ ( v ) => {
					set( 'provider', v );
					setTestResult( null );
					setError( null );
					setCustomModel( false );
				} }
				options={ Object.values( status.providers ).map( ( p ) => ( {
					value: p.id,
					label:
						p.label +
						' — ' +
						( p.available
							? __( 'ready', 'wbd-content-image-seo-assistant' )
							: __(
									'not configured',
									'wbd-content-image-seo-assistant'
							  ) ),
				} ) ) }
			/>

			{ provider === 'wp_ai_connector' && (
				<Notice
					status={ info.available ? 'success' : 'info' }
					isDismissible={ false }
					className="ai-cis-notice"
				>
					{ info.api_exists ? (
						<p>
							{ info.available
								? __(
										'WordPress AI is available. Requests use the provider configured in Settings → Connectors.',
										'wbd-content-image-seo-assistant'
								  )
								: __(
										'WordPress AI Client is available, but no text-generation connector is configured yet.',
										'wbd-content-image-seo-assistant'
								  ) }{ ' ' }
							<a href={ data().connectorsUrl }>
								{ __(
									'Open Connectors',
									'wbd-content-image-seo-assistant'
								) }
							</a>
						</p>
					) : (
						<p>
							{ __(
								'The WordPress AI Client is not available on this site (it ships with WordPress 7.0+). Choose another provider and add an API key instead.',
								'wbd-content-image-seo-assistant'
							) }
						</p>
					) }
				</Notice>
			) }

			{ info.needs_key && (
				<div className="ai-cis-key">
					{ keyInfo?.via_constant ? (
						<p>
							{ sprintf(
								/* translators: %s: constant name. */
								__(
									'The API key is defined in wp-config.php (%s).',
									'wbd-content-image-seo-assistant'
								),
								'AI_CIS_' + provider.toUpperCase() + '_API_KEY'
							) }
						</p>
					) : (
						<>
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								type="password"
								autoComplete="new-password"
								label={ __(
									'API Key',
									'wbd-content-image-seo-assistant'
								) }
								value={
									keys[ provider ] &&
									keys[ provider ] !== '__delete__'
										? keys[ provider ]
										: ''
								}
								placeholder={
									keyInfo?.configured
										? sprintf(
												/* translators: %s: last characters of the key. */
												__(
													'Saved key %s — leave empty to keep it',
													'wbd-content-image-seo-assistant'
												),
												keyInfo.hint
										  )
										: __(
												'Paste your API key',
												'wbd-content-image-seo-assistant'
										  )
								}
								onChange={ ( v ) =>
									setKeys( { ...keys, [ provider ]: v } )
								}
								help={ __(
									'Stored encrypted in your database and never shown in the browser again. You can also define it in wp-config.php.',
									'wbd-content-image-seo-assistant'
								) }
							/>
							<p>
								<ExternalLink href={ KEY_LINKS[ provider ] }>
									{ __(
										'Get an API key',
										'wbd-content-image-seo-assistant'
									) }
								</ExternalLink>
								{ keyInfo?.configured && (
									<>
										{ ' · ' }
										<Button
											variant="link"
											isDestructive
											onClick={ () =>
												setKeys( {
													...keys,
													[ provider ]: '__delete__',
												} )
											}
										>
											{ keys[ provider ] === '__delete__'
												? __(
														'Key will be removed on save',
														'wbd-content-image-seo-assistant'
												  )
												: __(
														'Remove saved key',
														'wbd-content-image-seo-assistant'
												  ) }
										</Button>
									</>
								) }
							</p>
						</>
					) }
				</div>
			) }

			<div className="ai-cis-grid-2">
				<div>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Model',
							'wbd-content-image-seo-assistant'
						) }
						value={ customModel ? '__custom' : currentModel }
						options={ [
							...Object.entries( models ).map(
								( [ value, label ] ) => ( { value, label } )
							),
							{
								value: '__custom',
								label: __(
									'Custom model ID…',
									'wbd-content-image-seo-assistant'
								),
							},
						] }
						onChange={ ( v ) => {
							if ( v === '__custom' ) {
								setCustomModel( true );
							} else {
								setCustomModel( false );
								setModel( v );
							}
						} }
					/>
					{ customModel && (
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __(
								'Custom model ID',
								'wbd-content-image-seo-assistant'
							) }
							value={
								currentModel === 'auto' ? '' : currentModel
							}
							onChange={ setModel }
						/>
					) }
					{ info.needs_key && keyInfo?.configured && (
						<Button
							variant="link"
							onClick={ refreshModels }
							isBusy={ refreshing }
							disabled={ refreshing }
						>
							{ __(
								'Load models from provider',
								'wbd-content-image-seo-assistant'
							) }
						</Button>
					) }
				</div>
				<div>
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Temperature',
							'wbd-content-image-seo-assistant'
						) }
						help={ __(
							'Lower is more focused, higher is more creative.',
							'wbd-content-image-seo-assistant'
						) }
						value={ Number( form.temperature ) }
						min={ 0 }
						max={ 2 }
						step={ 0.1 }
						onChange={ ( v ) => set( 'temperature', v ) }
					/>
				</div>
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					type="number"
					min={ 64 }
					max={ 32000 }
					label={ __(
						'Max Tokens',
						'wbd-content-image-seo-assistant'
					) }
					value={ form.max_tokens }
					onChange={ ( v ) =>
						set( 'max_tokens', parseInt( v, 10 ) || 0 )
					}
				/>
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					type="number"
					min={ 10 }
					max={ 300 }
					label={ __(
						'Request timeout (seconds)',
						'wbd-content-image-seo-assistant'
					) }
					value={ form.request_timeout }
					onChange={ ( v ) =>
						set( 'request_timeout', parseInt( v, 10 ) || 0 )
					}
				/>
			</div>

			<div className="ai-cis-actions">
				<Button
					variant="secondary"
					onClick={ test }
					isBusy={ testing }
					disabled={ testing }
				>
					{ __(
						'Test Connection',
						'wbd-content-image-seo-assistant'
					) }
				</Button>
				<span className="description">
					{ __(
						'Tests the saved settings. Save changes first. Tests are not counted as usage.',
						'wbd-content-image-seo-assistant'
					) }
				</span>
			</div>
			{ testResult && (
				<Notice
					status="success"
					onRemove={ () => setTestResult( null ) }
					className="ai-cis-notice"
				>
					<p>{ testResult }</p>
				</Notice>
			) }
			<ErrorNotice error={ error } onDismiss={ () => setError( null ) } />
		</Section>
	);
}

function FieldChecks( { value, onChange, legend } ) {
	return (
		<fieldset className="ai-cis-fieldset">
			<legend>{ legend }</legend>
			{ data().options.imageFields.map( ( f ) => (
				<CheckboxControl
					key={ f.value }
					__nextHasNoMarginBottom
					label={ f.label }
					checked={ value.includes( f.value ) }
					onChange={ ( c ) =>
						onChange(
							c
								? [ ...value, f.value ]
								: value.filter( ( x ) => x !== f.value )
						)
					}
				/>
			) ) }
		</fieldset>
	);
}

export default function SettingsPage() {
	const [ loaded, setLoaded ] = useState( null );
	const [ form, setForm ] = useState( null );
	const [ keys, setKeys ] = useState( {} );
	const [ saving, setSaving ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ saved, setSaved ] = useState( false );

	const apply = ( res ) => {
		const { api_keys: apiKeys, ...rest } = res.settings;
		setLoaded( { ...res, apiKeys } );
		setForm( rest );
		window.aiCisData.providerReady = res.status.ready;
	};

	useEffect( () => {
		request( '/settings' )
			.then( apply )
			.catch( ( e ) => setError( errorInfo( e ) ) );
	}, [] );

	if ( ! form ) {
		return error ? <ErrorNotice error={ error } /> : <Spinner />;
	}

	const set = ( key, value ) => {
		setSaved( false );
		setForm( ( prev ) => ( { ...prev, [ key ]: value } ) );
	};
	const setNested = ( group, key, value ) =>
		set( group, { ...form[ group ], [ key ]: value } );

	const save = async () => {
		setSaving( true );
		setError( null );
		try {
			const res = await request( '/settings', {
				method: 'POST',
				data: { settings: { ...form, api_keys: keys } },
			} );
			apply( res );
			setKeys( {} );
			setSaved( true );
			speak( __( 'Settings saved.', 'wbd-content-image-seo-assistant' ) );
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setSaving( false );
	};

	const onModelsRefreshed = ( provider, models ) => {
		setLoaded( ( prev ) => ( {
			...prev,
			status: {
				...prev.status,
				providers: {
					...prev.status.providers,
					[ provider ]: {
						...prev.status.providers[ provider ],
						models,
					},
				},
			},
		} ) );
	};

	const params = new window.URLSearchParams( window.location.search );
	const tabs = [
		{
			name: 'provider',
			title: __( 'AI Provider', 'wbd-content-image-seo-assistant' ),
		},
		{
			name: 'content',
			title: __(
				'Content & Language',
				'wbd-content-image-seo-assistant'
			),
		},
		{
			name: 'images',
			title: __(
				'Images & Automation',
				'wbd-content-image-seo-assistant'
			),
		},
		{
			name: 'seo',
			title: data().isWooActive
				? __( 'SEO & WooCommerce', 'wbd-content-image-seo-assistant' )
				: __( 'SEO', 'wbd-content-image-seo-assistant' ),
		},
		{
			name: 'prompts',
			title: __( 'Custom Prompts', 'wbd-content-image-seo-assistant' ),
		},
		{
			name: 'limits',
			title: __( 'Usage Limits', 'wbd-content-image-seo-assistant' ),
		},
		{
			name: 'privacy',
			title: __( 'Privacy & Data', 'wbd-content-image-seo-assistant' ),
		},
	];
	const initial = tabs.some( ( t ) => t.name === params.get( 'tab' ) )
		? params.get( 'tab' )
		: 'provider';

	const promptGroups = [
		[
			'content',
			__( 'Content generation', 'wbd-content-image-seo-assistant' ),
		],
		[
			'rewrite',
			__( 'Content rewriting', 'wbd-content-image-seo-assistant' ),
		],
		[ 'image', __( 'Image metadata', 'wbd-content-image-seo-assistant' ) ],
		[
			'product',
			__( 'WooCommerce products', 'wbd-content-image-seo-assistant' ),
		],
		[ 'seo', __( 'SEO metadata', 'wbd-content-image-seo-assistant' ) ],
		[
			'review',
			__( 'Review summaries', 'wbd-content-image-seo-assistant' ),
		],
	];

	const limitLabels = {
		content: __(
			'AI content generations per month',
			'wbd-content-image-seo-assistant'
		),
		image: __(
			'Image metadata generations per month',
			'wbd-content-image-seo-assistant'
		),
		product: __(
			'WooCommerce product generations per month',
			'wbd-content-image-seo-assistant'
		),
		auto_image: __(
			'Automatic image optimizations per month',
			'wbd-content-image-seo-assistant'
		),
		review: __(
			'Review summaries per month',
			'wbd-content-image-seo-assistant'
		),
		bulk_batch: __(
			'Bulk items per batch',
			'wbd-content-image-seo-assistant'
		),
	};

	const renderTab = ( tab ) => {
		switch ( tab.name ) {
			case 'provider':
				return (
					<ProviderTab
						form={ form }
						set={ set }
						status={ loaded.status }
						keys={ keys }
						setKeys={ setKeys }
						publicKeys={ loaded.apiKeys }
						onModelsRefreshed={ onModelsRefreshed }
					/>
				);
			case 'content':
				return (
					<Section
						title={ __(
							'Content & Language',
							'wbd-content-image-seo-assistant'
						) }
					>
						<LanguageControl
							value={
								form.default_language === 'Custom'
									? 'Custom:' + form.custom_language
									: form.default_language
							}
							onChange={ ( v ) => {
								if ( v.startsWith( 'Custom:' ) ) {
									set( 'default_language', 'Custom' );
									set( 'custom_language', v.slice( 7 ) );
								} else {
									set( 'default_language', v );
								}
							} }
						/>
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __(
								'Default tone',
								'wbd-content-image-seo-assistant'
							) }
							value={ form.default_tone }
							options={ data().options.tones }
							onChange={ ( v ) => set( 'default_tone', v ) }
						/>
					</Section>
				);
			case 'images':
				return (
					<>
						<Section
							title={ __(
								'Image AI',
								'wbd-content-image-seo-assistant'
							) }
						>
							<RadioControl
								label={ __(
									'Alt Text Style',
									'wbd-content-image-seo-assistant'
								) }
								selected={ form.alt_text_style }
								onChange={ ( v ) => set( 'alt_text_style', v ) }
								options={ [
									{
										value: 'balanced',
										label: __(
											'Balanced (default)',
											'wbd-content-image-seo-assistant'
										),
									},
									{
										value: 'accessibility',
										label: __(
											'Accessibility First — concise, factual, no keyword stuffing',
											'wbd-content-image-seo-assistant'
										),
									},
									{
										value: 'seo',
										label: __(
											'SEO Focused',
											'wbd-content-image-seo-assistant'
										),
									},
								] }
							/>
							<FieldChecks
								legend={ __(
									'Default fields for single and bulk generation',
									'wbd-content-image-seo-assistant'
								) }
								value={ form.image_default_fields }
								onChange={ ( v ) =>
									set( 'image_default_fields', v )
								}
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __(
									'Send the image to the AI provider for visual analysis',
									'wbd-content-image-seo-assistant'
								) }
								help={ __(
									'Recommended for accurate alt text. When off, only the filename and surrounding context are used.',
									'wbd-content-image-seo-assistant'
								) }
								checked={ !! form.image_send_file }
								onChange={ ( v ) =>
									set( 'image_send_file', v )
								}
							/>
						</Section>
						<Section
							title={ __(
								'Automation',
								'wbd-content-image-seo-assistant'
							) }
						>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __(
									'Automatically optimize new images',
									'wbd-content-image-seo-assistant'
								) }
								help={ __(
									'New uploads are processed in the background. Only empty fields are filled, the automation limit is respected and failed images are not retried.',
									'wbd-content-image-seo-assistant'
								) }
								checked={ !! form.auto_optimize }
								onChange={ ( v ) => set( 'auto_optimize', v ) }
							/>
							{ form.auto_optimize && (
								<FieldChecks
									legend={ __(
										'Fields',
										'wbd-content-image-seo-assistant'
									) }
									value={ form.auto_fields }
									onChange={ ( v ) =>
										set( 'auto_fields', v )
									}
								/>
							) }
						</Section>
					</>
				);
			case 'seo':
				return (
					<Section title={ tab.title }>
						<p>
							{ data().seoPlugin
								? sprintf(
										/* translators: %s: plugin name. */
										__(
											'Detected SEO plugin: %s. SEO metadata is saved there.',
											'wbd-content-image-seo-assistant'
										),
										data().seoPluginLabel
								  )
								: __(
										'No SEO plugin detected. Supported: Yoast SEO, Rank Math, All in One SEO.',
										'wbd-content-image-seo-assistant'
								  ) }
						</p>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __(
								'Output SEO title and meta description when no SEO plugin is active',
								'wbd-content-image-seo-assistant'
							) }
							checked={ !! form.seo_output_meta }
							onChange={ ( v ) => set( 'seo_output_meta', v ) }
						/>
						{ data().isWooActive && (
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __(
									'Show saved AI review summaries above product reviews',
									'wbd-content-image-seo-assistant'
								) }
								help={ __(
									'You can also place a summary anywhere with the [ai_cis_review_summary] shortcode.',
									'wbd-content-image-seo-assistant'
								) }
								checked={ !! form.review_summary_display }
								onChange={ ( v ) =>
									set( 'review_summary_display', v )
								}
							/>
						) }
					</Section>
				);
			case 'prompts':
				return (
					<Section
						title={ __(
							'Custom Prompts',
							'wbd-content-image-seo-assistant'
						) }
					>
						<p className="description">
							{ __(
								'Extra instructions appended to every prompt in a group, for example your brand voice or words to avoid. Developers can replace prompts entirely with the ai_cis_*_prompt filters.',
								'wbd-content-image-seo-assistant'
							) }
						</p>
						{ promptGroups.map( ( [ key, label ] ) => (
							<TextareaControl
								key={ key }
								__nextHasNoMarginBottom
								label={ label }
								value={ form.custom_prompts[ key ] || '' }
								onChange={ ( v ) =>
									setNested( 'custom_prompts', key, v )
								}
								rows={ 3 }
							/>
						) ) }
					</Section>
				);
			case 'limits':
				return (
					<Section
						title={ __(
							'Usage Limits',
							'wbd-content-image-seo-assistant'
						) }
					>
						<Notice
							status="info"
							isDismissible={ false }
							className="ai-cis-notice"
						>
							<p>
								{ __(
									'All features are free and unlimited by default. Set a number to cap monthly usage on this site (for example to control AI provider costs). 0 = unlimited.',
									'wbd-content-image-seo-assistant'
								) }
							</p>
						</Notice>
						<div className="ai-cis-grid-2">
							{ Object.keys( limitLabels ).map( ( key ) => (
								<TextControl
									key={ key }
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									type="number"
									min={ 0 }
									label={ limitLabels[ key ] }
									value={ form.limits[ key ] }
									onChange={ ( v ) =>
										setNested(
											'limits',
											key,
											Math.max(
												0,
												parseInt( v, 10 ) || 0
											)
										)
									}
									help={
										Number( form.limits[ key ] ) === 0
											? __(
													'Unlimited',
													'wbd-content-image-seo-assistant'
											  )
											: ''
									}
								/>
							) ) }
						</div>
					</Section>
				);
			case 'privacy':
				return (
					<Section
						title={ __(
							'Privacy & Data',
							'wbd-content-image-seo-assistant'
						) }
					>
						<p>
							{ __(
								'AI requests send the content you select (post text, image files and context, product details, or review text and star ratings) to the AI provider configured above. Nothing is sent without a user action or enabled automation.',
								'wbd-content-image-seo-assistant'
							) }
						</p>
						<p>
							{ __(
								'Never sent: passwords, payment information, customer accounts, reviewer names, emails or IP addresses. The plugin has no tracking and sends nothing to its author.',
								'wbd-content-image-seo-assistant'
							) }
						</p>
						<p>
							{ __(
								'Review your AI provider’s data policy before use. Suggested text has been added to Settings → Privacy → Policy Guide.',
								'wbd-content-image-seo-assistant'
							) }
						</p>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __(
								'Delete plugin settings on uninstall',
								'wbd-content-image-seo-assistant'
							) }
							help={ __(
								'Removes settings, API keys and usage data when the plugin is deleted. Your posts, products, media and generated content are never deleted.',
								'wbd-content-image-seo-assistant'
							) }
							checked={ !! form.delete_on_uninstall }
							onChange={ ( v ) =>
								set( 'delete_on_uninstall', v )
							}
						/>
						{ data().isManager && (
							<p>
								<a href={ data().pages.dashboard + '&setup=1' }>
									{ __(
										'Run the setup wizard again',
										'wbd-content-image-seo-assistant'
									) }
								</a>
							</p>
						) }
					</Section>
				);
		}
		return null;
	};

	return (
		<div className="ai-cis-page">
			<TabPanel
				className="ai-cis-tabs"
				initialTabName={ initial }
				tabs={ tabs }
			>
				{ renderTab }
			</TabPanel>
			<div className="ai-cis-savebar">
				<Button
					variant="primary"
					onClick={ save }
					isBusy={ saving }
					disabled={ saving }
				>
					{ __( 'Save Settings', 'wbd-content-image-seo-assistant' ) }
				</Button>
				{ saved && (
					<span className="ai-cis-saved" role="status">
						{ __(
							'Settings saved.',
							'wbd-content-image-seo-assistant'
						) }
					</span>
				) }
			</div>
			<ErrorNotice error={ error } onDismiss={ () => setError( null ) } />
		</div>
	);
}
