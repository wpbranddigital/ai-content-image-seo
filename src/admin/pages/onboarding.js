/**
 * First-time setup wizard. Every step can be skipped; no external account
 * registration with the plugin author is ever required.
 */
import {
	Button,
	RadioControl,
	TextControl,
	Notice,
	ExternalLink,
} from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { request, errorInfo, data } from '../../common/api';
import { ErrorNotice } from '../../common/components';
import { LanguageControl } from './content-ai';

const KEY_LINKS = {
	openai: 'https://platform.openai.com/api-keys',
	gemini: 'https://aistudio.google.com/apikey',
	anthropic: 'https://console.anthropic.com/settings/keys',
	openrouter: 'https://openrouter.ai/keys',
};

export default function Onboarding() {
	const [ step, setStep ] = useState( 1 );
	const [ status, setStatus ] = useState( null );
	const [ provider, setProvider ] = useState( 'wp_ai_connector' );
	const [ apiKey, setApiKey ] = useState( '' );
	const [ language, setLanguage ] = useState(
		data().defaults.language || 'English'
	);
	const [ style, setStyle ] = useState( 'balanced' );
	const [ busy, setBusy ] = useState( false );
	const [ error, setError ] = useState( null );
	const headingRef = useRef();

	useEffect( () => {
		request( '/settings' )
			.then( ( res ) => {
				setStatus( res.status );
				const firstReady = Object.values( res.status.providers ).find(
					( p ) => p.available
				);
				setProvider(
					firstReady ? firstReady.id : res.settings.provider
				);
			} )
			.catch( ( e ) => setError( errorInfo( e ) ) );
	}, [] );

	useEffect( () => {
		if ( headingRef.current ) {
			headingRef.current.focus();
		}
	}, [ step ] );

	const finish = async ( skip = false ) => {
		setBusy( true );
		setError( null );
		const settings = { provider, alt_text_style: style };
		if ( language.startsWith( 'Custom:' ) ) {
			settings.default_language = 'Custom';
			settings.custom_language = language.slice( 7 );
		} else {
			settings.default_language = language;
		}
		if ( apiKey ) {
			settings.api_keys = { [ provider ]: apiKey };
		}
		try {
			await request( '/onboarding', {
				method: 'POST',
				data: { settings, skip },
			} );
			window.location.href = data().pages.dashboard;
		} catch ( e ) {
			setError( errorInfo( e ) );
			setBusy( false );
		}
	};

	const info = status?.providers?.[ provider ];

	const stepClass = ( n ) => {
		if ( n === step ) {
			return 'is-current';
		}
		return n < step ? 'is-done' : '';
	};

	let connectorText = __(
		'The WordPress AI Client is not available on this site. Go back and choose another provider.',
		'ai-content-image-seo'
	);
	if ( info?.available ) {
		connectorText = __(
			'WordPress AI is configured. No API key is needed here.',
			'ai-content-image-seo'
		);
	} else if ( info?.api_exists ) {
		connectorText = __(
			'Configure a provider in Settings → Connectors, then come back. You can also go back and pick another provider.',
			'ai-content-image-seo'
		);
	}
	const steps = [
		__( 'Choose AI Provider', 'ai-content-image-seo' ),
		__( 'Configure API', 'ai-content-image-seo' ),
		__( 'Choose Default Language', 'ai-content-image-seo' ),
		__( 'Choose Alt Text Style', 'ai-content-image-seo' ),
	];

	return (
		<div className="ai-cis-onboarding">
			<div className="ai-cis-onboarding__card">
				<h2>
					{ __(
						'Welcome to AI Content & Image SEO',
						'ai-content-image-seo'
					) }
				</h2>
				<p>
					{ __(
						'Every feature is free to use. Let’s connect an AI provider and set a few defaults.',
						'ai-content-image-seo'
					) }
				</p>

				<ol
					className="ai-cis-steps"
					aria-label={ __( 'Setup steps', 'ai-content-image-seo' ) }
				>
					{ steps.map( ( label, i ) => (
						<li
							key={ label }
							className={ stepClass( i + 1 ) }
							aria-current={ i + 1 === step ? 'step' : undefined }
						>
							{ sprintf(
								/* translators: 1: step number, 2: step name. */
								__( 'Step %1$d: %2$s', 'ai-content-image-seo' ),
								i + 1,
								label
							) }
						</li>
					) ) }
				</ol>

				<h3
					tabIndex={ -1 }
					ref={ headingRef }
					className="ai-cis-onboarding__step-title"
				>
					{ steps[ step - 1 ] }
				</h3>

				<ErrorNotice error={ error } />

				{ step === 1 && status && (
					<RadioControl
						label={ __( 'Provider', 'ai-content-image-seo' ) }
						hideLabelFromVision
						selected={ provider }
						onChange={ setProvider }
						options={ Object.values( status.providers ).map(
							( p ) => ( {
								value: p.id,
								label:
									p.label +
									( p.available
										? ' — ' +
										  __( 'ready', 'ai-content-image-seo' )
										: '' ),
							} )
						) }
					/>
				) }

				{ step === 2 && info && (
					<>
						{ provider === 'wp_ai_connector' ? (
							<Notice
								status={ info.available ? 'success' : 'info' }
								isDismissible={ false }
							>
								<p>{ connectorText }</p>
							</Notice>
						) : (
							<>
								<TextControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									type="password"
									autoComplete="new-password"
									label={ sprintf(
										/* translators: %s: provider name. */
										__(
											'%s API Key',
											'ai-content-image-seo'
										),
										info.label
									) }
									value={ apiKey }
									placeholder={
										info.available
											? __(
													'A key is already saved — leave empty to keep it',
													'ai-content-image-seo'
											  )
											: ''
									}
									onChange={ setApiKey }
								/>
								<p>
									<ExternalLink
										href={ KEY_LINKS[ provider ] }
									>
										{ __(
											'Get an API key',
											'ai-content-image-seo'
										) }
									</ExternalLink>
								</p>
								<p className="description">
									{ __(
										'Your key is stored encrypted on your own site and is only sent to this provider.',
										'ai-content-image-seo'
									) }
								</p>
							</>
						) }
					</>
				) }

				{ step === 3 && (
					<LanguageControl
						value={ language }
						onChange={ setLanguage }
					/>
				) }

				{ step === 4 && (
					<RadioControl
						label={ __( 'Alt Text Style', 'ai-content-image-seo' ) }
						hideLabelFromVision
						selected={ style }
						onChange={ setStyle }
						options={ [
							{
								value: 'balanced',
								label: __(
									'Balanced (recommended)',
									'ai-content-image-seo'
								),
							},
							{
								value: 'accessibility',
								label: __(
									'Accessibility First',
									'ai-content-image-seo'
								),
							},
							{
								value: 'seo',
								label: __(
									'SEO Focused',
									'ai-content-image-seo'
								),
							},
						] }
					/>
				) }

				<div className="ai-cis-actions ai-cis-onboarding__nav">
					{ step > 1 && (
						<Button
							variant="secondary"
							onClick={ () => setStep( step - 1 ) }
							disabled={ busy }
						>
							{ __( 'Back', 'ai-content-image-seo' ) }
						</Button>
					) }
					{ step < 4 ? (
						<Button
							variant="primary"
							onClick={ () => setStep( step + 1 ) }
							disabled={ ! status }
						>
							{ __( 'Continue', 'ai-content-image-seo' ) }
						</Button>
					) : (
						<Button
							variant="primary"
							onClick={ () => finish( false ) }
							isBusy={ busy }
							disabled={ busy }
						>
							{ __( 'Finish Setup', 'ai-content-image-seo' ) }
						</Button>
					) }
					<Button
						variant="tertiary"
						onClick={ () => finish( true ) }
						disabled={ busy }
					>
						{ __( 'Skip setup', 'ai-content-image-seo' ) }
					</Button>
				</div>
			</div>
		</div>
	);
}
