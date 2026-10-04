/**
 * Admin app entry: renders the page matching data-view.
 */
import { createRoot } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { data } from '../common/api';
import Dashboard from './pages/dashboard';
import ContentAI from './pages/content-ai';
import ImageAI from './pages/image-ai';
import SeoAssistant from './pages/seo';
import WooCommercePage from './pages/woocommerce';
import UsagePage from './pages/usage';
import SettingsPage from './pages/settings';
import Onboarding from './pages/onboarding';
import '../common/ai-cis.scss';

const VIEWS = {
	dashboard: Dashboard,
	content: ContentAI,
	image: ImageAI,
	seo: SeoAssistant,
	woocommerce: WooCommercePage,
	usage: UsagePage,
	settings: SettingsPage,
};

const TITLES = {
	dashboard: __( 'Dashboard', 'ai-content-image-seo' ),
	content: __( 'Content AI', 'ai-content-image-seo' ),
	image: __( 'Image AI', 'ai-content-image-seo' ),
	seo: __( 'SEO Assistant', 'ai-content-image-seo' ),
	woocommerce: __( 'WooCommerce AI', 'ai-content-image-seo' ),
	usage: __( 'Usage', 'ai-content-image-seo' ),
	settings: __( 'Settings', 'ai-content-image-seo' ),
};

function Header( { view } ) {
	return (
		<header className="ai-cis-header">
			<div className="ai-cis-header__brand">
				<span
					className="dashicons dashicons-superhero-alt"
					aria-hidden="true"
				/>
				<span>
					{ __( 'AI Content & Image SEO', 'ai-content-image-seo' ) }
				</span>
			</div>
			<h2 className="ai-cis-header__title">{ TITLES[ view ] }</h2>
			<span
				className={
					'ai-cis-status ' +
					( data().providerReady ? 'is-ok' : 'is-warn' )
				}
			>
				<span
					className={
						'dashicons ' +
						( data().providerReady
							? 'dashicons-yes-alt'
							: 'dashicons-warning' )
					}
					aria-hidden="true"
				/>
				{ data().providerReady
					? __( 'AI provider connected', 'ai-content-image-seo' )
					: __( 'No AI provider', 'ai-content-image-seo' ) }
			</span>
		</header>
	);
}

function App( { view } ) {
	const params = new window.URLSearchParams( window.location.search );
	const forceSetup = params.get( 'setup' ) === '1';

	if (
		view === 'dashboard' &&
		( data().onboarding || forceSetup ) &&
		data().isManager
	) {
		return <Onboarding />;
	}

	const View = VIEWS[ view ] || Dashboard;
	return (
		<div className="ai-cis-app">
			<Header view={ view } />
			<View />
		</div>
	);
}

const mount = () => {
	const root = document.getElementById( 'ai-cis-admin-root' );
	if ( root ) {
		createRoot( root ).render(
			<App view={ root.dataset.view || 'dashboard' } />
		);
	}
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', mount );
} else {
	mount();
}
