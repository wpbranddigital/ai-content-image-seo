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
	dashboard: __( 'Dashboard', 'wbd-content-image-seo-assistant' ),
	content: __( 'Content AI', 'wbd-content-image-seo-assistant' ),
	image: __( 'Image AI', 'wbd-content-image-seo-assistant' ),
	seo: __( 'SEO Assistant', 'wbd-content-image-seo-assistant' ),
	woocommerce: __( 'WooCommerce AI', 'wbd-content-image-seo-assistant' ),
	usage: __( 'Usage', 'wbd-content-image-seo-assistant' ),
	settings: __( 'Settings', 'wbd-content-image-seo-assistant' ),
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
					{ __(
						'WBD Content & Image SEO',
						'wbd-content-image-seo-assistant'
					) }
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
					? __(
							'AI provider connected',
							'wbd-content-image-seo-assistant'
					  )
					: __(
							'No AI provider',
							'wbd-content-image-seo-assistant'
					  ) }
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
