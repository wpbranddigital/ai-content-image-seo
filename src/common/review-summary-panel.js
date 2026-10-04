/**
 * AI Review Summary for a WooCommerce product.
 */
import {
	Button,
	Notice,
	Spinner,
	TextareaControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf, _n } from '@wordpress/i18n';
import { speak } from '@wordpress/a11y';
import { request, errorInfo, newRequestId, data } from './api';
import { ErrorNotice, Loading, ResultActions, EmptyState } from './components';

/**
 * Formats a summary as plain text.
 *
 * @param {Object} s Summary.
 * @return {string} Text.
 */
const asText = ( s ) =>
	[
		s.summary,
		s.pros?.length
			? __( 'Pros', 'ai-content-image-seo' ) +
			  ':\n' +
			  s.pros.map( ( p ) => '✓ ' + p ).join( '\n' )
			: '',
		s.cons?.length
			? __( 'Cons', 'ai-content-image-seo' ) +
			  ':\n' +
			  s.cons.map( ( c ) => '• ' + c ).join( '\n' )
			: '',
	]
		.filter( Boolean )
		.join( '\n\n' );

function SummaryView( { summary } ) {
	return (
		<div className="ai-cis-review-summary-view">
			<p>{ summary.summary }</p>
			{ summary.pros?.length > 0 && (
				<>
					<p className="ai-cis-label">
						{ __( 'Pros', 'ai-content-image-seo' ) }
					</p>
					<ul className="ai-cis-pros">
						{ summary.pros.map( ( p ) => (
							<li key={ p }>
								<span aria-hidden="true">✓ </span>
								{ p }
							</li>
						) ) }
					</ul>
				</>
			) }
			{ summary.cons?.length > 0 && (
				<>
					<p className="ai-cis-label">
						{ __( 'Cons', 'ai-content-image-seo' ) }
					</p>
					<ul className="ai-cis-cons">
						{ summary.cons.map( ( c ) => (
							<li key={ c }>
								<span aria-hidden="true">• </span>
								{ c }
							</li>
						) ) }
					</ul>
				</>
			) }
		</div>
	);
}

export default function ReviewSummaryPanel( { productId } ) {
	const [ info, setInfo ] = useState( null );
	const [ busy, setBusy ] = useState( false );
	const [ saving, setSaving ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ result, setResult ] = useState( null );
	const [ notice, setNotice ] = useState( '' );

	useEffect( () => {
		setInfo( null );
		setResult( null );
		request( '/review-summary/' + productId )
			.then( setInfo )
			.catch( ( e ) => setError( errorInfo( e ) ) );
	}, [ productId ] );

	const generate = async () => {
		setBusy( true );
		setError( null );
		setNotice( '' );
		try {
			const res = await request( '/review-summary', {
				method: 'POST',
				data: {
					product_id: productId,
					request_id: newRequestId(),
					language: data().defaults?.language || '',
				},
			} );
			setResult( res );
			speak( __( 'Review summary generated.', 'ai-content-image-seo' ) );
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setBusy( false );
	};

	const save = async () => {
		setSaving( true );
		try {
			const saved = await request( '/review-summary/save', {
				method: 'POST',
				data: { product_id: productId, ...result },
			} );
			setInfo( { ...info, saved } );
			setNotice(
				info?.display
					? __(
							'Summary saved. It is shown above the reviews on the product page.',
							'ai-content-image-seo'
					  )
					: __(
							'Summary saved. Enable "Show review summary on product pages" in Settings, or use the [ai_cis_review_summary] shortcode.',
							'ai-content-image-seo'
					  )
			);
		} catch ( e ) {
			setError( errorInfo( e ) );
		}
		setSaving( false );
	};

	if ( ! info && ! error ) {
		return <Spinner />;
	}

	return (
		<div className="ai-cis-review-panel">
			{ info && info.review_count === 0 ? (
				<EmptyState
					title={ __( 'No reviews yet.', 'ai-content-image-seo' ) }
					text={ __(
						'A summary can be generated once this product has approved customer reviews. Summaries only use real review content.',
						'ai-content-image-seo'
					) }
				/>
			) : (
				<>
					{ info && (
						<p className="description">
							{ sprintf(
								/* translators: %d: number of reviews. */
								_n(
									'Based on %d approved review. Only review text and star ratings are sent to the AI, never reviewer names or emails.',
									'Based on %d approved reviews. Only review text and star ratings are sent to the AI, never reviewer names or emails.',
									info.review_count,
									'ai-content-image-seo'
								),
								info.review_count
							) }
						</p>
					) }
					{ info?.saved && ! result && (
						<>
							<p className="ai-cis-label">
								{ __(
									'Saved summary',
									'ai-content-image-seo'
								) }
							</p>
							<SummaryView summary={ info.saved } />
						</>
					) }
					<div className="ai-cis-actions">
						<Button
							variant="primary"
							onClick={ generate }
							isBusy={ busy }
							disabled={ busy }
						>
							{ info?.saved
								? __(
										'Generate New Summary',
										'ai-content-image-seo'
								  )
								: __(
										'Generate Review Summary',
										'ai-content-image-seo'
								  ) }
						</Button>
					</div>
				</>
			) }
			{ busy && <Loading /> }
			<ErrorNotice error={ error } onDismiss={ () => setError( null ) } />
			{ result && ! busy && (
				<div className="ai-cis-result">
					<p className="ai-cis-label">
						{ __( 'AI Result', 'ai-content-image-seo' ) }
					</p>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'Summary', 'ai-content-image-seo' ) }
						value={ result.summary }
						onChange={ ( v ) =>
							setResult( { ...result, summary: v } )
						}
					/>
					<SummaryView summary={ { ...result, summary: '' } } />
					<ResultActions
						onUse={ save }
						useLabel={ __(
							'Save Summary',
							'ai-content-image-seo'
						) }
						busy={ saving }
						copyText={ asText( result ) }
						onRegenerate={ generate }
					/>
				</div>
			) }
			{ notice && (
				<Notice
					status="success"
					onRemove={ () => setNotice( '' ) }
					className="ai-cis-notice"
				>
					<p>{ notice }</p>
				</Notice>
			) }
		</div>
	);
}
