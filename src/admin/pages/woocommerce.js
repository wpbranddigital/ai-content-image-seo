/**
 * WooCommerce AI page: pick a product, generate content, summarize reviews.
 */
import {
	Button,
	SearchControl,
	Spinner,
	TabPanel,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useDebounce } from '@wordpress/compose';
import { request, errorInfo, data } from '../../common/api';
import {
	Section,
	ErrorNotice,
	EmptyState,
	HtmlPreview,
} from '../../common/components';
import ProductAssistant from '../../common/product-assistant';
import ReviewSummaryPanel from '../../common/review-summary-panel';

export default function WooCommercePage() {
	const [ search, setSearch ] = useState( '' );
	const [ query, setQuery ] = useState( '' );
	const [ page, setPage ] = useState( 1 );
	const [ list, setList ] = useState( null );
	const [ product, setProduct ] = useState( null );
	const [ error, setError ] = useState( null );
	const debounced = useDebounce( setQuery, 350 );

	useEffect( () => {
		debounced( search );
	}, [ search, debounced ] );

	const load = () => {
		setList( null );
		return request( '/products', { query: { search: query, page } } )
			.then( ( res ) => {
				setList( res );
				return res;
			} )
			.catch( ( e ) => setError( errorInfo( e ) ) );
	};

	useEffect( () => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ query, page ] );

	if ( ! data().isWooActive ) {
		return (
			<Section>
				<EmptyState
					title={ __(
						'WooCommerce is not active.',
						'ai-content-image-seo'
					) }
					text={ __(
						'Install and activate WooCommerce to use product AI features.',
						'ai-content-image-seo'
					) }
				/>
			</Section>
		);
	}

	const refreshProduct = () =>
		load().then( ( res ) => {
			const fresh = res?.items?.find( ( i ) => i.id === product.id );
			if ( fresh ) {
				setProduct( fresh );
			}
		} );

	return (
		<div className="ai-cis-sidebar-layout">
			<Section title={ __( 'Products', 'ai-content-image-seo' ) }>
				<SearchControl
					__nextHasNoMarginBottom
					label={ __( 'Search products', 'ai-content-image-seo' ) }
					value={ search }
					onChange={ ( v ) => {
						setSearch( v );
						setPage( 1 );
					} }
				/>
				<ErrorNotice error={ error } />
				{ ! list && ! error && <Spinner /> }
				{ list && list.items.length === 0 && (
					<EmptyState
						title={ __(
							'No products found.',
							'ai-content-image-seo'
						) }
						text={ __(
							'Create a product in WooCommerce first, then come back to generate its content.',
							'ai-content-image-seo'
						) }
					/>
				) }
				{ list && list.items.length > 0 && (
					<ul className="ai-cis-picker__list">
						{ list.items.map( ( item ) => (
							<li key={ item.id }>
								<Button
									className={
										'ai-cis-picker__item' +
										( product?.id === item.id
											? ' is-selected'
											: '' )
									}
									onClick={ () => setProduct( item ) }
									aria-pressed={ product?.id === item.id }
								>
									{ item.thumb && (
										<img
											src={ item.thumb }
											alt=""
											width="32"
											height="32"
										/>
									) }
									<span className="ai-cis-picker__title">
										{ item.name }
									</span>
									<span className="ai-cis-picker__meta">
										{ item.status }
										{ ! item.has_description &&
											' · ' +
												__(
													'no description',
													'ai-content-image-seo'
												) }
									</span>
								</Button>
							</li>
						) ) }
					</ul>
				) }
				{ list && list.total_pages > 1 && (
					<div className="ai-cis-pagination">
						<Button
							variant="secondary"
							disabled={ page <= 1 }
							onClick={ () => setPage( page - 1 ) }
						>
							{ __( 'Previous', 'ai-content-image-seo' ) }
						</Button>
						<Button
							variant="secondary"
							disabled={ page >= list.total_pages }
							onClick={ () => setPage( page + 1 ) }
						>
							{ __( 'Next', 'ai-content-image-seo' ) }
						</Button>
					</div>
				) }
			</Section>

			<div>
				{ ! product ? (
					<Section>
						<EmptyState
							title={ __(
								'Select a product.',
								'ai-content-image-seo'
							) }
							text={ __(
								'Generate titles, descriptions, tags, category suggestions, SEO metadata and review summaries. Every result is previewed before it is saved.',
								'ai-content-image-seo'
							) }
						/>
					</Section>
				) : (
					<>
						<h2 className="ai-cis-section-title">
							{ product.name }{ ' ' }
							<a href={ product.edit_link }>
								{ __( 'Edit product', 'ai-content-image-seo' ) }
							</a>
						</h2>
						<TabPanel
							className="ai-cis-tabs"
							tabs={ [
								{
									name: 'assistant',
									title: __(
										'AI Product Assistant',
										'ai-content-image-seo'
									),
								},
								{
									name: 'reviews',
									title: __(
										'AI Review Summary',
										'ai-content-image-seo'
									),
								},
								{
									name: 'current',
									title: __(
										'Current Content',
										'ai-content-image-seo'
									),
								},
							] }
						>
							{ ( tab ) => {
								if ( tab.name === 'reviews' ) {
									return (
										<Section>
											<ReviewSummaryPanel
												key={ product.id }
												productId={ product.id }
											/>
										</Section>
									);
								}
								if ( tab.name === 'current' ) {
									return (
										<Section>
											<p className="ai-cis-label">
												{ __(
													'Short Description',
													'ai-content-image-seo'
												) }
											</p>
											{ product.short_description ? (
												<HtmlPreview
													html={
														product.short_description
													}
												/>
											) : (
												<p>
													<em>
														{ __(
															'(empty)',
															'ai-content-image-seo'
														) }
													</em>
												</p>
											) }
											<p className="ai-cis-label">
												{ __(
													'Description',
													'ai-content-image-seo'
												) }
											</p>
											{ product.description ? (
												<HtmlPreview
													html={ product.description }
												/>
											) : (
												<p>
													<em>
														{ __(
															'(empty)',
															'ai-content-image-seo'
														) }
													</em>
												</p>
											) }
											<p>
												<strong>
													{ __(
														'Categories:',
														'ai-content-image-seo'
													) }
												</strong>{ ' ' }
												{ product.categories.join(
													', '
												) || '—' }
												<br />
												<strong>
													{ __(
														'Tags:',
														'ai-content-image-seo'
													) }
												</strong>{ ' ' }
												{ product.tags.join( ', ' ) ||
													'—' }
												<br />
												<strong>
													{ __(
														'SEO title:',
														'ai-content-image-seo'
													) }
												</strong>{ ' ' }
												{ product.seo.seo_title || '—' }
												<br />
												<strong>
													{ __(
														'Meta description:',
														'ai-content-image-seo'
													) }
												</strong>{ ' ' }
												{ product.seo
													.meta_description || '—' }
											</p>
											<p className="description">
												{ sprintf(
													/* translators: %d: review count. */
													__(
														'Approved reviews: %d',
														'ai-content-image-seo'
													),
													product.review_count
												) }
											</p>
										</Section>
									);
								}
								return (
									<Section>
										<ProductAssistant
											key={ product.id }
											productId={ product.id }
											mode="direct"
											product={ product }
											onSaved={ refreshProduct }
										/>
									</Section>
								);
							} }
						</TabPanel>
					</>
				) }
			</div>
		</div>
	);
}
