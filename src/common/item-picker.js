/**
 * Searchable picker for posts, pages and products the user can edit.
 */
import {
	Button,
	SearchControl,
	SelectControl,
	Spinner,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useDebounce } from '@wordpress/compose';
import { request, errorInfo, data } from './api';
import { EmptyState, ErrorNotice } from './components';

export default function ItemPicker( {
	onSelect,
	selectedId,
	showSeo = false,
} ) {
	const [ search, setSearch ] = useState( '' );
	const [ type, setType ] = useState( 'any' );
	const [ page, setPage ] = useState( 1 );
	const [ result, setResult ] = useState( null );
	const [ error, setError ] = useState( null );
	const [ query, setQuery ] = useState( '' );
	const debounced = useDebounce( setQuery, 350 );

	useEffect( () => {
		debounced( search );
	}, [ search, debounced ] );

	useEffect( () => {
		setResult( null );
		request( '/items', { query: { search: query, type, page } } )
			.then( setResult )
			.catch( ( e ) => setError( errorInfo( e ) ) );
	}, [ query, type, page ] );

	const typeOptions = [
		{
			value: 'any',
			label: __( 'All content', 'wbd-content-image-seo-assistant' ),
		},
		{
			value: 'post',
			label: __( 'Posts', 'wbd-content-image-seo-assistant' ),
		},
		{
			value: 'page',
			label: __( 'Pages', 'wbd-content-image-seo-assistant' ),
		},
	];
	if ( data().isWooActive ) {
		typeOptions.push( {
			value: 'product',
			label: __( 'Products', 'wbd-content-image-seo-assistant' ),
		} );
	}

	return (
		<div className="ai-cis-picker">
			<div className="ai-cis-picker__filters">
				<SearchControl
					__nextHasNoMarginBottom
					label={ __(
						'Search content',
						'wbd-content-image-seo-assistant'
					) }
					value={ search }
					onChange={ ( v ) => {
						setSearch( v );
						setPage( 1 );
					} }
				/>
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Type', 'wbd-content-image-seo-assistant' ) }
					hideLabelFromVision
					value={ type }
					options={ typeOptions }
					onChange={ ( v ) => {
						setType( v );
						setPage( 1 );
					} }
				/>
			</div>
			<ErrorNotice error={ error } />
			{ ! result && ! error && <Spinner /> }
			{ result && result.items.length === 0 && (
				<EmptyState
					title={ __(
						'No content found.',
						'wbd-content-image-seo-assistant'
					) }
					text={ __(
						'Try a different search, or create a post first.',
						'wbd-content-image-seo-assistant'
					) }
				/>
			) }
			{ result && result.items.length > 0 && (
				<ul className="ai-cis-picker__list">
					{ result.items.map( ( item ) => (
						<li key={ item.id }>
							<Button
								className={
									'ai-cis-picker__item' +
									( item.id === selectedId
										? ' is-selected'
										: '' )
								}
								onClick={ () => onSelect( item ) }
								aria-pressed={ item.id === selectedId }
							>
								<span className="ai-cis-picker__title">
									{ item.title }
								</span>
								<span className="ai-cis-picker__meta">
									{ item.type } · { item.status }
									{ showSeo &&
										( item.seo?.meta_description
											? ' · ' +
											  __(
													'has meta description',
													'wbd-content-image-seo-assistant'
											  )
											: ' · ' +
											  __(
													'no meta description',
													'wbd-content-image-seo-assistant'
											  ) ) }
								</span>
							</Button>
						</li>
					) ) }
				</ul>
			) }
			{ result && result.total_pages > 1 && (
				<div className="ai-cis-pagination">
					<Button
						variant="secondary"
						disabled={ page <= 1 }
						onClick={ () => setPage( page - 1 ) }
					>
						{ __( 'Previous', 'wbd-content-image-seo-assistant' ) }
					</Button>
					<span>
						{ sprintf(
							/* translators: 1: current page, 2: total pages. */
							__(
								'Page %1$d of %2$d',
								'wbd-content-image-seo-assistant'
							),
							page,
							result.total_pages
						) }
					</span>
					<Button
						variant="secondary"
						disabled={ page >= result.total_pages }
						onClick={ () => setPage( page + 1 ) }
					>
						{ __( 'Next', 'wbd-content-image-seo-assistant' ) }
					</Button>
				</div>
			) }
		</div>
	);
}
