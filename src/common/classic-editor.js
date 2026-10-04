/**
 * Helpers for the classic product editor form (WooCommerce products use the
 * classic editor). Values are written into the form so the user still
 * reviews and clicks "Update" to save.
 */

/**
 * Reads a classic editor field (TinyMCE or plain textarea).
 *
 * @param {string} id Editor ID (content or excerpt).
 * @return {string} HTML.
 */
export function getEditorValue( id ) {
	const tiny = window.tinymce && window.tinymce.get( id );
	if ( tiny && ! tiny.isHidden() ) {
		return tiny.getContent();
	}
	const el = document.getElementById( id );
	return el ? el.value : '';
}

/**
 * Writes a classic editor field.
 *
 * @param {string} id    Editor ID.
 * @param {string} value HTML.
 * @return {boolean} Whether the field exists.
 */
export function setEditorValue( id, value ) {
	const el = document.getElementById( id );
	const tiny = window.tinymce && window.tinymce.get( id );
	if ( tiny ) {
		tiny.setContent( value );
		tiny.save();
		tiny.fire( 'change' );
	}
	if ( el ) {
		el.value = value;
		el.dispatchEvent( new window.Event( 'input', { bubbles: true } ) );
		el.dispatchEvent( new window.Event( 'change', { bubbles: true } ) );
	}
	return !! ( el || tiny );
}

/**
 * Sets an input value and notifies listeners.
 *
 * @param {string} selector CSS selector.
 * @param {string} value    Value.
 * @return {boolean} Whether found.
 */
export function setInputValue( selector, value ) {
	const el = document.querySelector( selector );
	if ( ! el ) {
		return false;
	}
	el.value = value;
	el.dispatchEvent( new window.Event( 'input', { bubbles: true } ) );
	el.dispatchEvent( new window.Event( 'change', { bubbles: true } ) );
	return true;
}

/**
 * Current unsaved values in the product form.
 *
 * @return {Object} Overrides for the generation context.
 */
export function readProductForm() {
	const title = document.getElementById( 'title' );
	return {
		name: title ? title.value : '',
		description: getEditorValue( 'content' ),
		short_description: getEditorValue( 'excerpt' ),
	};
}

/**
 * Adds tags through the core tag box UI.
 *
 * @param {string[]} tags Tags.
 * @return {boolean} Whether the tag box exists.
 */
export function addTagsToForm( tags ) {
	const input = document.getElementById( 'new-tag-product_tag' );
	const box = document.getElementById( 'tagsdiv-product_tag' );
	const button = box ? box.querySelector( '.tagadd' ) : null;
	if ( ! input || ! button ) {
		return false;
	}
	input.value = tags.join( ', ' );
	button.click();
	return true;
}

/**
 * Checks category boxes, adding any newly created terms to the list.
 *
 * @param {Array<{id:number,name:string}>} terms Terms.
 * @return {boolean} Whether the checklist exists.
 */
export function checkCategoriesInForm( terms ) {
	const list = document.getElementById( 'product_catchecklist' );
	if ( ! list ) {
		return false;
	}
	terms.forEach( ( term ) => {
		let box = document.getElementById( 'in-product_cat-' + term.id );
		if ( ! box ) {
			const li = document.createElement( 'li' );
			li.id = 'product_cat-' + term.id;
			const label = document.createElement( 'label' );
			label.className = 'selectit';
			box = document.createElement( 'input' );
			box.type = 'checkbox';
			box.name = 'tax_input[product_cat][]';
			box.id = 'in-product_cat-' + term.id;
			box.value = String( term.id );
			label.appendChild( box );
			label.appendChild( document.createTextNode( ' ' + term.name ) );
			li.appendChild( label );
			list.insertBefore( li, list.firstChild );
		}
		box.checked = true;
	} );
	return true;
}

/**
 * Copies SEO values into SEO plugin form fields when present so saving the
 * product does not overwrite the new values with stale ones.
 *
 * @param {Object} seo SEO values.
 */
export function syncSeoFields( seo ) {
	const pairs = [
		[ '#yoast_wpseo_title', seo.seo_title ],
		[ '#yoast_wpseo_metadesc', seo.meta_description ],
		[ '#yoast_wpseo_focuskw', seo.focus_keyword ],
		[ 'input[name="rank_math_title"]', seo.seo_title ],
		[ 'input[name="rank_math_description"]', seo.meta_description ],
		[ 'input[name="rank_math_focus_keyword"]', seo.focus_keyword ],
	];
	pairs.forEach( ( [ selector, value ] ) => {
		if ( typeof value === 'string' ) {
			setInputValue( selector, value );
		}
	} );
}
