/**
 * Media Library integration: opens the AI metadata panel in a modal when
 * "Generate AI Metadata" is clicked in attachment details or list rows.
 */
import { createRoot, useState } from '@wordpress/element';
import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ImageMetadataPanel from '../common/image-metadata-panel';
import '../common/ai-cis.scss';

let root = null;
let container = null;

/**
 * Refreshes the Backbone attachment model so the media modal shows new values.
 *
 * @param {number} id      Attachment ID.
 * @param {Object} current Current values.
 */
function refreshAttachment( id, current ) {
	const media = window.wp && window.wp.media;
	if ( ! media || ! media.attachment ) {
		return;
	}
	const model = media.attachment( id );
	if ( model ) {
		model.set( {
			alt: current.alt,
			title: current.title,
			caption: current.caption,
			description: current.description,
		} );
	}
	// Plain edit-attachment screen fields.
	const pairs = [
		[ 'attachment_alt', current.alt ],
		[ 'title', current.title ],
		[ 'attachment_caption', current.caption ],
		[ 'attachment_content', current.description ],
	];
	pairs.forEach( ( [ elId, value ] ) => {
		const el = document.getElementById( elId );
		if ( el && typeof value === 'string' ) {
			el.value = value;
		}
	} );
}

function MediaModal( { attachmentId, onClose } ) {
	const [ id ] = useState( attachmentId );
	return (
		<Modal
			title={ __( 'Generate AI Metadata', 'ai-content-image-seo' ) }
			onRequestClose={ onClose }
			className="ai-cis-modal"
		>
			<ImageMetadataPanel
				attachmentId={ id }
				onApplied={ ( current ) => refreshAttachment( id, current ) }
			/>
		</Modal>
	);
}

function open( attachmentId, returnFocus ) {
	if ( ! container ) {
		container = document.createElement( 'div' );
		container.className = 'ai-cis-media-root';
		document.body.appendChild( container );
		root = createRoot( container );
	}
	const close = () => {
		root.render( null );
		if ( returnFocus && document.body.contains( returnFocus ) ) {
			returnFocus.focus();
		}
	};
	root.render(
		<MediaModal
			key={ attachmentId + '-' + Date.now() }
			attachmentId={ attachmentId }
			onClose={ close }
		/>
	);
}

document.addEventListener( 'click', ( event ) => {
	const trigger = event.target.closest( '.ai-cis-media-generate' );
	if ( ! trigger ) {
		return;
	}
	const id = parseInt( trigger.getAttribute( 'data-attachment-id' ), 10 );
	if ( ! id ) {
		return;
	}
	event.preventDefault();
	open( id, trigger );
} );
