/**
 * Shared UI building blocks.
 */
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Notice,
	Spinner,
	ExternalLink,
} from '@wordpress/components';
import { useState, RawHTML } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { speak } from '@wordpress/a11y';
import { copyText, data } from './api';

/**
 * Section card with a heading.
 *
 * @param {Object} props           Props.
 * @param {string} props.title     Heading.
 * @param {*}      props.actions   Header actions.
 * @param {*}      props.children  Content.
 * @param {string} props.className Extra class.
 * @return {Element} Card.
 */
export function Section( { title, actions, children, className = '' } ) {
	return (
		<Card className={ 'ai-cis-card ' + className }>
			{ title && (
				<CardHeader>
					<h2 className="ai-cis-card__title">{ title }</h2>
					{ actions && (
						<div className="ai-cis-card__actions">{ actions }</div>
					) }
				</CardHeader>
			) }
			<CardBody>{ children }</CardBody>
		</Card>
	);
}

/**
 * Loading state announced to screen readers.
 *
 * @param {Object} props       Props.
 * @param {string} props.label Label.
 * @return {Element} Loading.
 */
export function Loading( { label } ) {
	return (
		<div className="ai-cis-loading" role="status" aria-live="polite">
			<Spinner />
			<span>
				<strong>
					{ label || __( 'Generating…', 'ai-content-image-seo' ) }
				</strong>{ ' ' }
				{ __( 'Please wait.', 'ai-content-image-seo' ) }
			</span>
		</div>
	);
}

/**
 * Error notice with optional technical details (administrators only).
 *
 * @param {Object}   props           Props.
 * @param {Object}   props.error     Error info from errorInfo().
 * @param {Function} props.onDismiss Dismiss handler.
 * @return {Element|null} Notice.
 */
export function ErrorNotice( { error, onDismiss } ) {
	const [ open, setOpen ] = useState( false );
	if ( ! error || ! error.message ) {
		return null;
	}
	const isProvider = error.code === 'ai_cis_no_provider';
	return (
		<Notice
			status="error"
			isDismissible={ !! onDismiss }
			onRemove={ onDismiss }
			className="ai-cis-notice"
		>
			<p>{ error.message }</p>
			{ isProvider && data().isManager && (
				<p>
					<a href={ data().pages.settings }>
						{ __(
							'Open AI Provider settings',
							'ai-content-image-seo'
						) }
					</a>
				</p>
			) }
			{ error.details && (
				<>
					<Button
						variant="link"
						onClick={ () => setOpen( ! open ) }
						aria-expanded={ open }
					>
						{ open
							? __(
									'Hide technical details',
									'ai-content-image-seo'
							  )
							: __(
									'Show technical details',
									'ai-content-image-seo'
							  ) }
					</Button>
					{ open && (
						<p className="ai-cis-details">{ error.details }</p>
					) }
				</>
			) }
		</Notice>
	);
}

/**
 * Notice shown when no provider is configured.
 *
 * @return {Element|null} Notice.
 */
export function ProviderNotice() {
	if ( data().providerReady ) {
		return null;
	}
	return (
		<Notice
			status="warning"
			isDismissible={ false }
			className="ai-cis-notice"
		>
			<p>
				<strong>
					{ __(
						'No AI provider configured.',
						'ai-content-image-seo'
					) }
				</strong>{ ' ' }
				{ data().isManager
					? __(
							'Connect an AI provider from Settings → AI Provider.',
							'ai-content-image-seo'
					  )
					: __(
							'Ask a site administrator to connect an AI provider.',
							'ai-content-image-seo'
					  ) }
			</p>
			{ data().isManager && (
				<p>
					<Button variant="secondary" href={ data().pages.settings }>
						{ __( 'Connect AI Provider', 'ai-content-image-seo' ) }
					</Button>
				</p>
			) }
		</Notice>
	);
}

/**
 * Copy button with accessible feedback.
 *
 * @param {Object} props       Props.
 * @param {string} props.text  Text to copy.
 * @param {string} props.label Label.
 * @return {Element} Button.
 */
export function CopyButton( { text, label } ) {
	const [ copied, setCopied ] = useState( false );
	const onClick = async () => {
		const ok = await copyText( text );
		setCopied( ok );
		speak(
			ok
				? __( 'Copied to clipboard.', 'ai-content-image-seo' )
				: __(
						'Copy failed. Select the text and copy it manually.',
						'ai-content-image-seo'
				  )
		);
		if ( ok ) {
			setTimeout( () => setCopied( false ), 2000 );
		}
	};
	return (
		<Button variant="secondary" onClick={ onClick } disabled={ ! text }>
			{ copied
				? __( 'Copied!', 'ai-content-image-seo' )
				: label || __( 'Copy', 'ai-content-image-seo' ) }
		</Button>
	);
}

/**
 * Empty state.
 *
 * @param {Object} props          Props.
 * @param {string} props.title    Title.
 * @param {string} props.text     Text.
 * @param {*}      props.children Actions.
 * @return {Element} Empty state.
 */
export function EmptyState( { title, text, children } ) {
	return (
		<div className="ai-cis-empty">
			<p className="ai-cis-empty__title">{ title }</p>
			{ text && <p>{ text }</p> }
			{ children }
		</div>
	);
}

/**
 * Usage meter. Shows numbers in text so meaning never depends on color.
 *
 * @param {Object} props      Props.
 * @param {Object} props.type Usage row from the report.
 * @return {Element} Meter.
 */
export function UsageMeter( { type } ) {
	const valueText = type.unlimited
		? sprintf(
				/* translators: %d: number used. */
				__( 'Used: %d (unlimited)', 'ai-content-image-seo' ),
				type.used
		  )
		: sprintf(
				/* translators: 1: number used, 2: limit. */
				__( 'Used: %1$d / %2$d', 'ai-content-image-seo' ),
				type.used,
				type.limit
		  );
	const percent = type.unlimited ? 0 : type.percent;
	return (
		<div className="ai-cis-meter">
			<div className="ai-cis-meter__label">
				<span>{ type.label }</span>
				<span>{ valueText }</span>
			</div>
			{ ! type.unlimited && (
				<div
					className={
						'ai-cis-meter__track' +
						( percent >= 90 ? ' is-high' : '' )
					}
					role="progressbar"
					aria-valuemin={ 0 }
					aria-valuemax={ 100 }
					aria-valuenow={ percent }
					aria-valuetext={ valueText }
					aria-label={ type.label }
				>
					<div
						className="ai-cis-meter__fill"
						style={ { width: percent + '%' } }
					/>
				</div>
			) }
		</div>
	);
}

/**
 * Progress bar for bulk jobs.
 *
 * @param {Object} props         Props.
 * @param {number} props.percent Percent.
 * @param {string} props.label   Label.
 * @return {Element} Bar.
 */
export function ProgressBar( { percent, label } ) {
	return (
		<div
			className="ai-cis-meter__track ai-cis-progress"
			role="progressbar"
			aria-valuemin={ 0 }
			aria-valuemax={ 100 }
			aria-valuenow={ percent }
			aria-label={ label }
		>
			<div
				className="ai-cis-meter__fill"
				style={ { width: percent + '%' } }
			/>
		</div>
	);
}

/**
 * Renders server-sanitized HTML (already filtered with wp_kses_post).
 *
 * @param {Object} props      Props.
 * @param {string} props.html HTML.
 * @return {Element} Preview.
 */
export function HtmlPreview( { html } ) {
	return (
		<div
			className="ai-cis-html-preview"
			tabIndex={ 0 }
			aria-label={ __( 'AI result preview', 'ai-content-image-seo' ) }
		>
			<RawHTML>{ html }</RawHTML>
		</div>
	);
}

/**
 * Google search result preview.
 *
 * @param {Object} props             Props.
 * @param {string} props.title       SEO title.
 * @param {string} props.description Meta description.
 * @param {string} props.url         URL.
 * @return {Element} Preview.
 */
export function GooglePreview( { title, description, url } ) {
	const titleLen = ( title || '' ).length;
	const descLen = ( description || '' ).length;
	return (
		<div
			className="ai-cis-serp"
			aria-label={ __( 'Google Preview', 'ai-content-image-seo' ) }
		>
			<p className="ai-cis-serp__label">
				{ __( 'Google Preview', 'ai-content-image-seo' ) }
			</p>
			{ url && <div className="ai-cis-serp__url">{ url }</div> }
			<div className="ai-cis-serp__title">
				{ title || __( '(no SEO title)', 'ai-content-image-seo' ) }
			</div>
			<div className="ai-cis-serp__desc">
				{ description ||
					__( '(no meta description)', 'ai-content-image-seo' ) }
			</div>
			<p className="ai-cis-serp__meta">
				{ sprintf(
					/* translators: 1: title length, 2: description length. */
					__(
						'Title: %1$d characters (aim for 60 or fewer) · Description: %2$d characters (aim for 120–155)',
						'ai-content-image-seo'
					),
					titleLen,
					descLen
				) }
			</p>
		</div>
	);
}

/**
 * Standard actions for an AI result.
 *
 * @param {Object}   props              Props.
 * @param {Function} props.onUse        "Use This" handler (omit to hide).
 * @param {string}   props.useLabel     Label for the use button.
 * @param {string}   props.copyText     Text to copy.
 * @param {Function} props.onRegenerate Regenerate handler.
 * @param {boolean}  props.busy         Busy flag.
 * @param {*}        props.children     Extra buttons.
 * @return {Element} Actions.
 */
export function ResultActions( {
	onUse,
	useLabel,
	copyText: text,
	onRegenerate,
	busy,
	children,
} ) {
	return (
		<div className="ai-cis-actions">
			{ onUse && (
				<Button variant="primary" onClick={ onUse } disabled={ busy }>
					{ useLabel || __( 'Use This', 'ai-content-image-seo' ) }
				</Button>
			) }
			{ typeof text === 'string' && <CopyButton text={ text } /> }
			{ onRegenerate && (
				<Button
					variant="tertiary"
					onClick={ onRegenerate }
					disabled={ busy }
				>
					{ __( 'Regenerate', 'ai-content-image-seo' ) }
				</Button>
			) }
			{ children }
		</div>
	);
}

/**
 * Small privacy hint shown near AI actions.
 *
 * @return {Element} Hint.
 */
export function PrivacyHint() {
	return (
		<p className="description ai-cis-privacy-hint">
			{ __(
				'The selected content is sent to your configured AI provider only when you click a generate button.',
				'ai-content-image-seo'
			) }
		</p>
	);
}

export { ExternalLink };
