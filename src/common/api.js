/**
 * REST helpers. Authentication uses the WordPress REST nonce that core
 * attaches to apiFetch automatically; no secrets ever live in JavaScript.
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

const NAMESPACE = '/ai-cis/v1';

/**
 * Global bootstrap data printed by PHP.
 *
 * @return {Object} Data.
 */
export const data = () => window.aiCisData || {};

/**
 * Generates a unique request ID so usage is never double counted.
 *
 * @return {string} ID.
 */
export const newRequestId = () =>
	Date.now().toString( 36 ) +
	'-' +
	Math.random().toString( 36 ).slice( 2, 10 );

/**
 * Calls a plugin REST endpoint.
 *
 * @param {string} path           Route, e.g. "/usage".
 * @param {Object} options        Options.
 * @param {string} options.method HTTP method.
 * @param {Object} options.data   Body for POST.
 * @param {Object} options.query  Query args for GET.
 * @param {Object} options.signal AbortSignal.
 * @return {Promise<*>} Response.
 */
export function request(
	path,
	{ method = 'GET', data: body, query, signal } = {}
) {
	const url = query
		? addQueryArgs( NAMESPACE + path, query )
		: NAMESPACE + path;
	return apiFetch( { path: url, method, data: body, signal } );
}

/**
 * Turns an apiFetch error into display text.
 *
 * @param {Object} error Error.
 * @return {{message: string, details: string, code: string}} Error info.
 */
export function errorInfo( error ) {
	if ( ! error ) {
		return { message: '', details: '', code: '' };
	}
	if ( error.name === 'AbortError' ) {
		return { message: '', details: '', code: 'abort' };
	}
	const message =
		error.message ||
		__(
			'Unable to generate content. Please check your AI provider settings and try again.',
			'ai-content-image-seo'
		);
	return {
		message,
		details: ( error.data && error.data.details ) || '',
		code: error.code || '',
	};
}

/**
 * Copies text to the clipboard.
 *
 * @param {string} text Text.
 * @return {Promise<boolean>} Whether it worked.
 */
export async function copyText( text ) {
	try {
		if ( window.navigator.clipboard && window.isSecureContext ) {
			await window.navigator.clipboard.writeText( text );
			return true;
		}
	} catch ( e ) {
		// Fall through to the legacy approach.
	}
	const textarea = document.createElement( 'textarea' );
	textarea.value = text;
	textarea.setAttribute( 'readonly', '' );
	textarea.style.position = 'absolute';
	textarea.style.left = '-9999px';
	document.body.appendChild( textarea );
	textarea.select();
	let ok = false;
	try {
		// eslint-disable-next-line @wordpress/no-global-active-element
		ok = document.execCommand( 'copy' );
	} catch ( e ) {
		ok = false;
	}
	document.body.removeChild( textarea );
	return ok;
}

/**
 * Strips HTML for plain-text copy.
 *
 * @param {string} html HTML.
 * @return {string} Text.
 */
export function htmlToText( html ) {
	const doc = new window.DOMParser().parseFromString(
		html || '',
		'text/html'
	);
	return ( doc.body.textContent || '' ).trim();
}
