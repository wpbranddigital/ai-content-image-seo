/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/common/api.js"
/*!***************************!*\
  !*** ./src/common/api.js ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   copyText: () => (/* binding */ copyText),
/* harmony export */   data: () => (/* binding */ data),
/* harmony export */   errorInfo: () => (/* binding */ errorInfo),
/* harmony export */   htmlToText: () => (/* binding */ htmlToText),
/* harmony export */   newRequestId: () => (/* binding */ newRequestId),
/* harmony export */   request: () => (/* binding */ request)
/* harmony export */ });
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/url */ "@wordpress/url");
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_url__WEBPACK_IMPORTED_MODULE_2__);
/**
 * REST helpers. Authentication uses the WordPress REST nonce that core
 * attaches to apiFetch automatically; no secrets ever live in JavaScript.
 */



const NAMESPACE = '/ai-cis/v1';

/**
 * Global bootstrap data printed by PHP.
 *
 * @return {Object} Data.
 */
const data = () => window.aiCisData || {};

/**
 * Generates a unique request ID so usage is never double counted.
 *
 * @return {string} ID.
 */
const newRequestId = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);

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
function request(path, {
  method = 'GET',
  data: body,
  query,
  signal
} = {}) {
  const url = query ? (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_2__.addQueryArgs)(NAMESPACE + path, query) : NAMESPACE + path;
  return _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
    path: url,
    method,
    data: body,
    signal
  });
}

/**
 * Turns an apiFetch error into display text.
 *
 * @param {Object} error Error.
 * @return {{message: string, details: string, code: string}} Error info.
 */
function errorInfo(error) {
  if (!error) {
    return {
      message: '',
      details: '',
      code: ''
    };
  }
  if (error.name === 'AbortError') {
    return {
      message: '',
      details: '',
      code: 'abort'
    };
  }
  const message = error.message || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Unable to generate content. Please check your AI provider settings and try again.', 'wbd-content-image-seo-assistant');
  return {
    message,
    details: error.data && error.data.details || '',
    code: error.code || ''
  };
}

/**
 * Copies text to the clipboard.
 *
 * @param {string} text Text.
 * @return {Promise<boolean>} Whether it worked.
 */
async function copyText(text) {
  try {
    if (window.navigator.clipboard && window.isSecureContext) {
      await window.navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // Fall through to the legacy approach.
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    // eslint-disable-next-line @wordpress/no-global-active-element
    ok = document.execCommand('copy');
  } catch (e) {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

/**
 * Strips HTML for plain-text copy.
 *
 * @param {string} html HTML.
 * @return {string} Text.
 */
function htmlToText(html) {
  const doc = new window.DOMParser().parseFromString(html || '', 'text/html');
  return (doc.body.textContent || '').trim();
}

/***/ },

/***/ "./src/common/classic-editor.js"
/*!**************************************!*\
  !*** ./src/common/classic-editor.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addTagsToForm: () => (/* binding */ addTagsToForm),
/* harmony export */   checkCategoriesInForm: () => (/* binding */ checkCategoriesInForm),
/* harmony export */   getEditorValue: () => (/* binding */ getEditorValue),
/* harmony export */   readProductForm: () => (/* binding */ readProductForm),
/* harmony export */   setEditorValue: () => (/* binding */ setEditorValue),
/* harmony export */   setInputValue: () => (/* binding */ setInputValue),
/* harmony export */   syncSeoFields: () => (/* binding */ syncSeoFields)
/* harmony export */ });
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
function getEditorValue(id) {
  const tiny = window.tinymce && window.tinymce.get(id);
  if (tiny && !tiny.isHidden()) {
    return tiny.getContent();
  }
  const el = document.getElementById(id);
  return el ? el.value : '';
}

/**
 * Writes a classic editor field.
 *
 * @param {string} id    Editor ID.
 * @param {string} value HTML.
 * @return {boolean} Whether the field exists.
 */
function setEditorValue(id, value) {
  const el = document.getElementById(id);
  const tiny = window.tinymce && window.tinymce.get(id);
  if (tiny) {
    tiny.setContent(value);
    tiny.save();
    tiny.fire('change');
  }
  if (el) {
    el.value = value;
    el.dispatchEvent(new window.Event('input', {
      bubbles: true
    }));
    el.dispatchEvent(new window.Event('change', {
      bubbles: true
    }));
  }
  return !!(el || tiny);
}

/**
 * Sets an input value and notifies listeners.
 *
 * @param {string} selector CSS selector.
 * @param {string} value    Value.
 * @return {boolean} Whether found.
 */
function setInputValue(selector, value) {
  const el = document.querySelector(selector);
  if (!el) {
    return false;
  }
  el.value = value;
  el.dispatchEvent(new window.Event('input', {
    bubbles: true
  }));
  el.dispatchEvent(new window.Event('change', {
    bubbles: true
  }));
  return true;
}

/**
 * Current unsaved values in the product form.
 *
 * @return {Object} Overrides for the generation context.
 */
function readProductForm() {
  const title = document.getElementById('title');
  return {
    name: title ? title.value : '',
    description: getEditorValue('content'),
    short_description: getEditorValue('excerpt')
  };
}

/**
 * Adds tags through the core tag box UI.
 *
 * @param {string[]} tags Tags.
 * @return {boolean} Whether the tag box exists.
 */
function addTagsToForm(tags) {
  const input = document.getElementById('new-tag-product_tag');
  const box = document.getElementById('tagsdiv-product_tag');
  const button = box ? box.querySelector('.tagadd') : null;
  if (!input || !button) {
    return false;
  }
  input.value = tags.join(', ');
  button.click();
  return true;
}

/**
 * Checks category boxes, adding any newly created terms to the list.
 *
 * @param {Array<{id:number,name:string}>} terms Terms.
 * @return {boolean} Whether the checklist exists.
 */
function checkCategoriesInForm(terms) {
  const list = document.getElementById('product_catchecklist');
  if (!list) {
    return false;
  }
  terms.forEach(term => {
    let box = document.getElementById('in-product_cat-' + term.id);
    if (!box) {
      const li = document.createElement('li');
      li.id = 'product_cat-' + term.id;
      const label = document.createElement('label');
      label.className = 'selectit';
      box = document.createElement('input');
      box.type = 'checkbox';
      box.name = 'tax_input[product_cat][]';
      box.id = 'in-product_cat-' + term.id;
      box.value = String(term.id);
      label.appendChild(box);
      label.appendChild(document.createTextNode(' ' + term.name));
      li.appendChild(label);
      list.insertBefore(li, list.firstChild);
    }
    box.checked = true;
  });
  return true;
}

/**
 * Copies SEO values into SEO plugin form fields when present so saving the
 * product does not overwrite the new values with stale ones.
 *
 * @param {Object} seo SEO values.
 */
function syncSeoFields(seo) {
  const pairs = [['#yoast_wpseo_title', seo.seo_title], ['#yoast_wpseo_metadesc', seo.meta_description], ['#yoast_wpseo_focuskw', seo.focus_keyword], ['input[name="rank_math_title"]', seo.seo_title], ['input[name="rank_math_description"]', seo.meta_description], ['input[name="rank_math_focus_keyword"]', seo.focus_keyword]];
  pairs.forEach(([selector, value]) => {
    if (typeof value === 'string') {
      setInputValue(selector, value);
    }
  });
}

/***/ },

/***/ "./src/common/components.js"
/*!**********************************!*\
  !*** ./src/common/components.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CopyButton: () => (/* binding */ CopyButton),
/* harmony export */   EmptyState: () => (/* binding */ EmptyState),
/* harmony export */   ErrorNotice: () => (/* binding */ ErrorNotice),
/* harmony export */   ExternalLink: () => (/* reexport safe */ _wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ExternalLink),
/* harmony export */   GooglePreview: () => (/* binding */ GooglePreview),
/* harmony export */   HtmlPreview: () => (/* binding */ HtmlPreview),
/* harmony export */   Loading: () => (/* binding */ Loading),
/* harmony export */   PrivacyHint: () => (/* binding */ PrivacyHint),
/* harmony export */   ProgressBar: () => (/* binding */ ProgressBar),
/* harmony export */   ProviderNotice: () => (/* binding */ ProviderNotice),
/* harmony export */   ResultActions: () => (/* binding */ ResultActions),
/* harmony export */   Section: () => (/* binding */ Section),
/* harmony export */   UsageMeter: () => (/* binding */ UsageMeter)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/a11y */ "@wordpress/a11y");
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./api */ "./src/common/api.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);
/**
 * Shared UI building blocks.
 */






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

function Section({
  title,
  actions,
  children,
  className = ''
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Card, {
    className: 'ai-cis-card ' + className,
    children: [title && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CardHeader, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("h2", {
        className: "ai-cis-card__title",
        children: title
      }), actions && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
        className: "ai-cis-card__actions",
        children: actions
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CardBody, {
      children: children
    })]
  });
}

/**
 * Loading state announced to screen readers.
 *
 * @param {Object} props       Props.
 * @param {string} props.label Label.
 * @return {Element} Loading.
 */
function Loading({
  label
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    className: "ai-cis-loading",
    role: "status",
    "aria-live": "polite",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("span", {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("strong", {
        children: label || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generating…', 'wbd-content-image-seo-assistant')
      }), ' ', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Please wait.', 'wbd-content-image-seo-assistant')]
    })]
  });
}

/**
 * Error notice with optional technical details (administrators only).
 *
 * @param {Object}   props           Props.
 * @param {Object}   props.error     Error info from errorInfo().
 * @param {Function} props.onDismiss Dismiss handler.
 * @return {Element|null} Notice.
 */
function ErrorNotice({
  error,
  onDismiss
}) {
  const [open, setOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  if (!error || !error.message) {
    return null;
  }
  const isProvider = error.code === 'ai_cis_no_provider';
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
    status: "error",
    isDismissible: !!onDismiss,
    onRemove: onDismiss,
    className: "ai-cis-notice",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
      children: error.message
    }), isProvider && (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().isManager && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("a", {
        href: (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().pages.settings,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Open AI Provider settings', 'wbd-content-image-seo-assistant')
      })
    }), error.details && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "link",
        onClick: () => setOpen(!open),
        "aria-expanded": open,
        children: open ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Hide technical details', 'wbd-content-image-seo-assistant') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Show technical details', 'wbd-content-image-seo-assistant')
      }), open && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
        className: "ai-cis-details",
        children: error.details
      })]
    })]
  });
}

/**
 * Notice shown when no provider is configured.
 *
 * @return {Element|null} Notice.
 */
function ProviderNotice() {
  if ((0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().providerReady) {
    return null;
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
    status: "warning",
    isDismissible: false,
    className: "ai-cis-notice",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("p", {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("strong", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No AI provider configured.', 'wbd-content-image-seo-assistant')
      }), ' ', (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().isManager ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Connect an AI provider from Settings → AI Provider.', 'wbd-content-image-seo-assistant') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Ask a site administrator to connect an AI provider.', 'wbd-content-image-seo-assistant')]
    }), (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().isManager && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        href: (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().pages.settings,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Connect AI Provider', 'wbd-content-image-seo-assistant')
      })
    })]
  });
}

/**
 * Copy button with accessible feedback.
 *
 * @param {Object} props       Props.
 * @param {string} props.text  Text to copy.
 * @param {string} props.label Label.
 * @return {Element} Button.
 */
function CopyButton({
  text,
  label
}) {
  const [copied, setCopied] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const onClick = async () => {
    const ok = await (0,_api__WEBPACK_IMPORTED_MODULE_4__.copyText)(text);
    setCopied(ok);
    (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)(ok ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Copied to clipboard.', 'wbd-content-image-seo-assistant') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Copy failed. Select the text and copy it manually.', 'wbd-content-image-seo-assistant'));
    if (ok) {
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
    variant: "secondary",
    onClick: onClick,
    disabled: !text,
    children: copied ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Copied!', 'wbd-content-image-seo-assistant') : label || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Copy', 'wbd-content-image-seo-assistant')
  });
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
function EmptyState({
  title,
  text,
  children
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    className: "ai-cis-empty",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
      className: "ai-cis-empty__title",
      children: title
    }), text && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
      children: text
    }), children]
  });
}

/**
 * Usage meter. Shows numbers in text so meaning never depends on color.
 *
 * @param {Object} props      Props.
 * @param {Object} props.type Usage row from the report.
 * @return {Element} Meter.
 */
function UsageMeter({
  type
}) {
  const valueText = type.unlimited ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %d: number used. */
  (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Used: %d (unlimited)', 'wbd-content-image-seo-assistant'), type.used) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: 1: number used, 2: limit. */
  (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Used: %1$d / %2$d', 'wbd-content-image-seo-assistant'), type.used, type.limit);
  const percent = type.unlimited ? 0 : type.percent;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    className: "ai-cis-meter",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "ai-cis-meter__label",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
        children: type.label
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
        children: valueText
      })]
    }), !type.unlimited && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: 'ai-cis-meter__track' + (percent >= 90 ? ' is-high' : ''),
      role: "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": percent,
      "aria-valuetext": valueText,
      "aria-label": type.label,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
        className: "ai-cis-meter__fill",
        style: {
          width: percent + '%'
        }
      })
    })]
  });
}

/**
 * Progress bar for bulk jobs.
 *
 * @param {Object} props         Props.
 * @param {number} props.percent Percent.
 * @param {string} props.label   Label.
 * @return {Element} Bar.
 */
function ProgressBar({
  percent,
  label
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
    className: "ai-cis-meter__track ai-cis-progress",
    role: "progressbar",
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-valuenow": percent,
    "aria-label": label,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: "ai-cis-meter__fill",
      style: {
        width: percent + '%'
      }
    })
  });
}

/**
 * Renders server-sanitized HTML (already filtered with wp_kses_post).
 *
 * @param {Object} props      Props.
 * @param {string} props.html HTML.
 * @return {Element} Preview.
 */
function HtmlPreview({
  html
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
    className: "ai-cis-html-preview",
    tabIndex: 0,
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI result preview', 'wbd-content-image-seo-assistant'),
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.RawHTML, {
      children: html
    })
  });
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
function GooglePreview({
  title,
  description,
  url
}) {
  const titleLen = (title || '').length;
  const descLen = (description || '').length;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    className: "ai-cis-serp",
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Google Preview', 'wbd-content-image-seo-assistant'),
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
      className: "ai-cis-serp__label",
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Google Preview', 'wbd-content-image-seo-assistant')
    }), url && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: "ai-cis-serp__url",
      children: url
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: "ai-cis-serp__title",
      children: title || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('(no SEO title)', 'wbd-content-image-seo-assistant')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: "ai-cis-serp__desc",
      children: description || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('(no meta description)', 'wbd-content-image-seo-assistant')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
      className: "ai-cis-serp__meta",
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: 1: title length, 2: description length. */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Title: %1$d characters (aim for 60 or fewer) · Description: %2$d characters (aim for 120–155)', 'wbd-content-image-seo-assistant'), titleLen, descLen)
    })]
  });
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
function ResultActions({
  onUse,
  useLabel,
  copyText: text,
  onRegenerate,
  busy,
  children
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    className: "ai-cis-actions",
    children: [onUse && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
      variant: "primary",
      onClick: onUse,
      disabled: busy,
      children: useLabel || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Use This', 'wbd-content-image-seo-assistant')
    }), typeof text === 'string' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(CopyButton, {
      text: text
    }), onRegenerate && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
      variant: "tertiary",
      onClick: onRegenerate,
      disabled: busy,
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Regenerate', 'wbd-content-image-seo-assistant')
    }), children]
  });
}

/**
 * Small privacy hint shown near AI actions.
 *
 * @return {Element} Hint.
 */
function PrivacyHint() {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
    className: "description ai-cis-privacy-hint",
    children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('The selected content is sent to your configured AI provider only when you click a generate button.', 'wbd-content-image-seo-assistant')
  });
}


/***/ },

/***/ "./src/common/product-assistant.js"
/*!*****************************************!*\
  !*** ./src/common/product-assistant.js ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ProductAssistant)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/a11y */ "@wordpress/a11y");
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./api */ "./src/common/api.js");
/* harmony import */ var _components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components */ "./src/common/components.js");
/* harmony import */ var _classic_editor__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./classic-editor */ "./src/common/classic-editor.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);
/**
 * AI Product Assistant: used in the product editor meta box (mode "editor",
 * fills the form) and on the WooCommerce admin page (mode "direct", saves via REST).
 */








const ACTIONS = [{
  field: 'title',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Title', 'wbd-content-image-seo-assistant')
}, {
  field: 'description',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Description', 'wbd-content-image-seo-assistant')
}, {
  field: 'short_description',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Short Description', 'wbd-content-image-seo-assistant')
}, {
  field: 'seo',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate SEO Metadata', 'wbd-content-image-seo-assistant')
}, {
  field: 'tags',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Tags', 'wbd-content-image-seo-assistant')
}, {
  field: 'categories',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Suggest Categories', 'wbd-content-image-seo-assistant')
}, {
  field: 'improve',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Improve Existing Content', 'wbd-content-image-seo-assistant')
}];
function ProductAssistant({
  productId,
  mode = 'editor',
  product = null,
  onSaved
}) {
  const [field, setField] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [tone, setTone] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)((0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().defaults?.tone || 'professional');
  const [language, setLanguage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)((0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().defaults?.language || 'English');
  const [busy, setBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [saving, setSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [result, setResult] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [choice, setChoice] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [selected, setSelected] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [notice, setNotice] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const isEditor = mode === 'editor';
  const generate = async target => {
    setField(target);
    setBusy(true);
    setError(null);
    setResult(null);
    setNotice('');
    try {
      const res = await (0,_api__WEBPACK_IMPORTED_MODULE_4__.request)('/generate-product-content', {
        method: 'POST',
        data: {
          product_id: productId,
          field: target,
          tone,
          language,
          request_id: (0,_api__WEBPACK_IMPORTED_MODULE_4__.newRequestId)(),
          overrides: isEditor ? (0,_classic_editor__WEBPACK_IMPORTED_MODULE_6__.readProductForm)() : {}
        }
      });
      setResult(res);
      if (res.options) {
        setChoice(res.options[0]);
        setSelected(target === 'categories' ? res.options.filter(o => res.existing && res.existing[o]) : res.options);
      }
      ;(0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI result ready. Review it before using it.', 'wbd-content-image-seo-assistant'));
    } catch (e) {
      setError((0,_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setBusy(false);
  };
  const saveDirect = async (value, extra = {}) => {
    const res = await (0,_api__WEBPACK_IMPORTED_MODULE_4__.request)('/apply-product-content', {
      method: 'POST',
      data: {
        product_id: productId,
        field: result.field,
        value,
        ...extra
      }
    });
    if (onSaved) {
      onSaved(result.field, value);
    }
    return res;
  };
  const done = message => {
    setNotice(message);
    (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)(message);
  };
  const use = async () => {
    setSaving(true);
    setError(null);
    const target = result.field;
    try {
      if (target === 'title') {
        if (isEditor && (0,_classic_editor__WEBPACK_IMPORTED_MODULE_6__.setInputValue)('#title', choice)) {
          document.getElementById('title-prompt-text')?.classList.add('screen-reader-text');
          done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Title inserted. Click "Update" to save the product.', 'wbd-content-image-seo-assistant'));
        } else {
          await saveDirect(choice);
          done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Product title saved.', 'wbd-content-image-seo-assistant'));
        }
      } else if (['description', 'improve', 'short_description'].includes(target)) {
        const editorId = target === 'short_description' ? 'excerpt' : 'content';
        if (isEditor && (0,_classic_editor__WEBPACK_IMPORTED_MODULE_6__.setEditorValue)(editorId, result.value)) {
          done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Inserted into the editor. Click "Update" to save the product.', 'wbd-content-image-seo-assistant'));
        } else {
          await saveDirect(result.value);
          done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Product content saved.', 'wbd-content-image-seo-assistant'));
        }
      } else if (target === 'tags') {
        if (isEditor && (0,_classic_editor__WEBPACK_IMPORTED_MODULE_6__.addTagsToForm)(selected)) {
          done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Tags added. Click "Update" to save the product.', 'wbd-content-image-seo-assistant'));
        } else {
          await saveDirect(selected, {
            mode: 'append'
          });
          done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Tags added to the product.', 'wbd-content-image-seo-assistant'));
        }
      } else if (target === 'categories') {
        const res = await saveDirect(selected, {
          mode: 'append'
        });
        if (isEditor) {
          (0,_classic_editor__WEBPACK_IMPORTED_MODULE_6__.checkCategoriesInForm)(res.terms || []);
        }
        done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Categories assigned.', 'wbd-content-image-seo-assistant'));
      } else if (target === 'seo') {
        const seo = {
          seo_title: result.seo_title,
          meta_description: result.meta_description,
          focus_keyword: result.focus_keyword
        };
        await saveDirect(seo);
        if (isEditor) {
          (0,_classic_editor__WEBPACK_IMPORTED_MODULE_6__.syncSeoFields)(seo);
        }
        done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: SEO plugin name. */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO metadata saved to %s.', 'wbd-content-image-seo-assistant'), (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().seoPluginLabel));
      }
    } catch (e) {
      setError((0,_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setSaving(false);
  };
  const renderResult = () => {
    if (!result) {
      return null;
    }
    const target = result.field;
    if (target === 'title') {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.RadioControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Choose a title', 'wbd-content-image-seo-assistant'),
          selected: choice,
          options: result.options.map(o => ({
            label: o,
            value: o
          })),
          onChange: setChoice
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ResultActions, {
          onUse: use,
          busy: saving,
          copyText: choice,
          onRegenerate: () => generate(target)
        })]
      });
    }
    if (target === 'tags' || target === 'categories') {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("fieldset", {
          className: "ai-cis-fieldset",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("legend", {
            children: target === 'tags' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Select tags to add', 'wbd-content-image-seo-assistant') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Select categories to assign', 'wbd-content-image-seo-assistant')
          }), result.options.map(option => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CheckboxControl, {
            __nextHasNoMarginBottom: true,
            label: target === 'categories' && result.existing && !result.existing[option] ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: category name. */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('%s (new category)', 'wbd-content-image-seo-assistant'), option) : option,
            checked: selected.includes(option),
            onChange: checked => setSelected(prev => checked ? [...prev, option] : prev.filter(o => o !== option))
          }, option))]
        }), target === 'categories' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
          className: "description",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Categories are never assigned automatically. Only the categories you select are added.', 'wbd-content-image-seo-assistant')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ResultActions, {
          onUse: selected.length ? use : null,
          useLabel: target === 'tags' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Add Selected Tags', 'wbd-content-image-seo-assistant') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Assign Selected Categories', 'wbd-content-image-seo-assistant'),
          busy: saving,
          copyText: selected.join(', '),
          onRegenerate: () => generate(target)
        })]
      });
    }
    if (target === 'seo') {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO Title', 'wbd-content-image-seo-assistant'),
          value: result.seo_title,
          onChange: v => setResult({
            ...result,
            seo_title: v
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextareaControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Meta Description', 'wbd-content-image-seo-assistant'),
          value: result.meta_description,
          onChange: v => setResult({
            ...result,
            meta_description: v
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Focus Keyword', 'wbd-content-image-seo-assistant'),
          value: result.focus_keyword,
          onChange: v => setResult({
            ...result,
            focus_keyword: v
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.GooglePreview, {
          title: result.seo_title,
          description: result.meta_description
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ResultActions, {
          onUse: use,
          useLabel: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Save SEO Metadata', 'wbd-content-image-seo-assistant'),
          busy: saving,
          copyText: result.seo_title + '\n' + result.meta_description,
          onRegenerate: () => generate(target)
        })]
      });
    }
    let original = '';
    if (target === 'improve') {
      original = isEditor ? (0,_classic_editor__WEBPACK_IMPORTED_MODULE_6__.getEditorValue)('content') : product?.description || '';
    }
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
      children: [target === 'improve' && original && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("details", {
        className: "ai-cis-original",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("summary", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Original', 'wbd-content-image-seo-assistant')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.HtmlPreview, {
          html: original
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
        className: "ai-cis-label",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI Result', 'wbd-content-image-seo-assistant')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.HtmlPreview, {
        html: result.value
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ResultActions, {
        onUse: use,
        useLabel: isEditor ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Insert into Editor', 'wbd-content-image-seo-assistant') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Save to Product', 'wbd-content-image-seo-assistant'),
        busy: saving,
        copyText: (0,_api__WEBPACK_IMPORTED_MODULE_4__.htmlToText)(result.value),
        onRegenerate: () => generate(target),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.CopyButton, {
          text: result.value,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Copy HTML', 'wbd-content-image-seo-assistant')
        })
      })]
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
    className: 'ai-cis-product-assistant is-' + mode,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ProviderNotice, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "ai-cis-grid-2",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Tone', 'wbd-content-image-seo-assistant'),
        value: tone,
        options: (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().options.tones,
        onChange: setTone
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Language', 'wbd-content-image-seo-assistant'),
        value: language,
        options: (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().options.languages,
        onChange: setLanguage
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
      className: "ai-cis-button-stack",
      children: ACTIONS.map(action => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: field === action.field ? 'primary' : 'secondary',
        onClick: () => generate(action.field),
        disabled: busy,
        isBusy: busy && field === action.field,
        children: action.label
      }, action.field))
    }), busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.Loading, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    }), notice && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
      status: "success",
      onRemove: () => setNotice(''),
      className: "ai-cis-notice",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
        children: notice
      })
    }), !busy && result && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
      className: "ai-cis-result",
      children: renderResult()
    })]
  });
}

/***/ },

/***/ "./src/common/review-summary-panel.js"
/*!********************************************!*\
  !*** ./src/common/review-summary-panel.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ReviewSummaryPanel)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/a11y */ "@wordpress/a11y");
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./api */ "./src/common/api.js");
/* harmony import */ var _components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components */ "./src/common/components.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);
/**
 * AI Review Summary for a WooCommerce product.
 */







/**
 * Formats a summary as plain text.
 *
 * @param {Object} s Summary.
 * @return {string} Text.
 */

const asText = s => [s.summary, s.pros?.length ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Pros', 'wbd-content-image-seo-assistant') + ':\n' + s.pros.map(p => '✓ ' + p).join('\n') : '', s.cons?.length ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Cons', 'wbd-content-image-seo-assistant') + ':\n' + s.cons.map(c => '• ' + c).join('\n') : ''].filter(Boolean).join('\n\n');
function SummaryView({
  summary
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
    className: "ai-cis-review-summary-view",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
      children: summary.summary
    }), summary.pros?.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
        className: "ai-cis-label",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Pros', 'wbd-content-image-seo-assistant')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("ul", {
        className: "ai-cis-pros",
        children: summary.pros.map(p => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("li", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
            "aria-hidden": "true",
            children: "\u2713 "
          }), p]
        }, p))
      })]
    }), summary.cons?.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
        className: "ai-cis-label",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Cons', 'wbd-content-image-seo-assistant')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("ul", {
        className: "ai-cis-cons",
        children: summary.cons.map(c => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("li", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
            "aria-hidden": "true",
            children: "\u2022 "
          }), c]
        }, c))
      })]
    })]
  });
}
function ReviewSummaryPanel({
  productId
}) {
  const [info, setInfo] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [busy, setBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [saving, setSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [result, setResult] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [notice, setNotice] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    setInfo(null);
    setResult(null);
    (0,_api__WEBPACK_IMPORTED_MODULE_4__.request)('/review-summary/' + productId).then(setInfo).catch(e => setError((0,_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e)));
  }, [productId]);
  const generate = async () => {
    setBusy(true);
    setError(null);
    setNotice('');
    try {
      const res = await (0,_api__WEBPACK_IMPORTED_MODULE_4__.request)('/review-summary', {
        method: 'POST',
        data: {
          product_id: productId,
          request_id: (0,_api__WEBPACK_IMPORTED_MODULE_4__.newRequestId)(),
          language: (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().defaults?.language || ''
        }
      });
      setResult(res);
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Review summary generated.', 'wbd-content-image-seo-assistant'));
    } catch (e) {
      setError((0,_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setBusy(false);
  };
  const save = async () => {
    setSaving(true);
    try {
      const saved = await (0,_api__WEBPACK_IMPORTED_MODULE_4__.request)('/review-summary/save', {
        method: 'POST',
        data: {
          product_id: productId,
          ...result
        }
      });
      setInfo({
        ...info,
        saved
      });
      setNotice(info?.display ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Summary saved. It is shown above the reviews on the product page.', 'wbd-content-image-seo-assistant') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Summary saved. Enable "Show review summary on product pages" in Settings, or use the [ai_cis_review_summary] shortcode.', 'wbd-content-image-seo-assistant'));
    } catch (e) {
      setError((0,_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setSaving(false);
  };
  if (!info && !error) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {});
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
    className: "ai-cis-review-panel",
    children: [info && info.review_count === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.EmptyState, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No reviews yet.', 'wbd-content-image-seo-assistant'),
      text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('A summary can be generated once this product has approved customer reviews. Summaries only use real review content.', 'wbd-content-image-seo-assistant')
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
      children: [info && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
        className: "description",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %d: number of reviews. */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__._n)('Based on %d approved review. Only review text and star ratings are sent to the AI, never reviewer names or emails.', 'Based on %d approved reviews. Only review text and star ratings are sent to the AI, never reviewer names or emails.', info.review_count, 'wbd-content-image-seo-assistant'), info.review_count)
      }), info?.saved && !result && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
          className: "ai-cis-label",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Saved summary', 'wbd-content-image-seo-assistant')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(SummaryView, {
          summary: info.saved
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
        className: "ai-cis-actions",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "primary",
          onClick: generate,
          isBusy: busy,
          disabled: busy,
          children: info?.saved ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate New Summary', 'wbd-content-image-seo-assistant') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Review Summary', 'wbd-content-image-seo-assistant')
        })
      })]
    }), busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.Loading, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    }), result && !busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
      className: "ai-cis-result",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
        className: "ai-cis-label",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI Result', 'wbd-content-image-seo-assistant')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextareaControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Summary', 'wbd-content-image-seo-assistant'),
        value: result.summary,
        onChange: v => setResult({
          ...result,
          summary: v
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(SummaryView, {
        summary: {
          ...result,
          summary: ''
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ResultActions, {
        onUse: save,
        useLabel: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Save Summary', 'wbd-content-image-seo-assistant'),
        busy: saving,
        copyText: asText(result),
        onRegenerate: generate
      })]
    }), notice && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
      status: "success",
      onRemove: () => setNotice(''),
      className: "ai-cis-notice",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
        children: notice
      })
    })]
  });
}

/***/ },

/***/ "./src/common/ai-cis.scss"
/*!********************************!*\
  !*** ./src/common/ai-cis.scss ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "react/jsx-runtime"
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
(module) {

module.exports = window["ReactJSXRuntime"];

/***/ },

/***/ "@wordpress/a11y"
/*!******************************!*\
  !*** external ["wp","a11y"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["a11y"];

/***/ },

/***/ "@wordpress/api-fetch"
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["apiFetch"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ "@wordpress/url"
/*!*****************************!*\
  !*** external ["wp","url"] ***!
  \*****************************/
(module) {

module.exports = window["wp"]["url"];

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = (module) => {
/******/ 		const getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.hasOwn(obj, prop));
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!******************************!*\
  !*** ./src/product/index.js ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _common_product_assistant__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../common/product-assistant */ "./src/common/product-assistant.js");
/* harmony import */ var _common_review_summary_panel__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../common/review-summary-panel */ "./src/common/review-summary-panel.js");
/* harmony import */ var _common_ai_cis_scss__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../common/ai-cis.scss */ "./src/common/ai-cis.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);
/**
 * WooCommerce product editor meta box: AI Product Assistant + Review Summary.
 */







function ProductBox({
  productId
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TabPanel, {
    className: "ai-cis-tabs ai-cis-tabs--small",
    tabs: [{
      name: 'assistant',
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Assistant', 'wbd-content-image-seo-assistant')
    }, {
      name: 'reviews',
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Review Summary', 'wbd-content-image-seo-assistant')
    }],
    children: tab => tab.name === 'reviews' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_common_review_summary_panel__WEBPACK_IMPORTED_MODULE_4__["default"], {
      productId: productId
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_common_product_assistant__WEBPACK_IMPORTED_MODULE_3__["default"], {
      productId: productId,
      mode: "editor"
    })
  });
}
const mount = () => {
  const el = document.getElementById('ai-cis-product-assistant-root');
  if (!el) {
    return;
  }
  const productId = parseInt(el.dataset.productId, 10);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createRoot)(el).render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(ProductBox, {
    productId: productId
  }));
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
})();

/******/ })()
;
//# sourceMappingURL=product.js.map