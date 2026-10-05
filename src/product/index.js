/**
 * WooCommerce product editor meta box: AI Product Assistant + Review Summary.
 */
import { createRoot } from '@wordpress/element';
import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ProductAssistant from '../common/product-assistant';
import ReviewSummaryPanel from '../common/review-summary-panel';
import '../common/ai-cis.scss';

function ProductBox( { productId } ) {
	return (
		<TabPanel
			className="ai-cis-tabs ai-cis-tabs--small"
			tabs={ [
				{
					name: 'assistant',
					title: __( 'Assistant', 'wbd-content-image-seo-assistant' ),
				},
				{
					name: 'reviews',
					title: __(
						'Review Summary',
						'wbd-content-image-seo-assistant'
					),
				},
			] }
		>
			{ ( tab ) =>
				tab.name === 'reviews' ? (
					<ReviewSummaryPanel productId={ productId } />
				) : (
					<ProductAssistant productId={ productId } mode="editor" />
				)
			}
		</TabPanel>
	);
}

const mount = () => {
	const el = document.getElementById( 'ai-cis-product-assistant-root' );
	if ( ! el ) {
		return;
	}
	const productId = parseInt( el.dataset.productId, 10 );
	createRoot( el ).render( <ProductBox productId={ productId } /> );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', mount );
} else {
	mount();
}
