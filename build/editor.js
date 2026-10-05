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

/***/ "@wordpress/block-editor"
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
(module) {

module.exports = window["wp"]["blockEditor"];

/***/ },

/***/ "@wordpress/blocks"
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
(module) {

module.exports = window["wp"]["blocks"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/data"
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["data"];

/***/ },

/***/ "@wordpress/editor"
/*!********************************!*\
  !*** external ["wp","editor"] ***!
  \********************************/
(module) {

module.exports = window["wp"]["editor"];

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

/***/ "@wordpress/plugins"
/*!*********************************!*\
  !*** external ["wp","plugins"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["plugins"];

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
/*!*****************************!*\
  !*** ./src/editor/index.js ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/plugins */ "@wordpress/plugins");
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_plugins__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/editor */ "@wordpress/editor");
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @wordpress/a11y */ "@wordpress/a11y");
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_wordpress_a11y__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _common_api__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../common/api */ "./src/common/api.js");
/* harmony import */ var _common_components__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../common/components */ "./src/common/components.js");
/* harmony import */ var _common_ai_cis_scss__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../common/ai-cis.scss */ "./src/common/ai-cis.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__);
/**
 * Block editor integration: "AI Content Assistant" sidebar.
 * Uses the editor data stores; never touches the editor DOM directly.
 */













const TEXT_BLOCKS = ['core/paragraph', 'core/heading', 'core/list-item', 'core/quote', 'core/verse', 'core/preformatted'];
const BLOCK_ACTIONS = [['improve', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Improve', 'wbd-content-image-seo-assistant')], ['rewrite', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Rewrite', 'wbd-content-image-seo-assistant')], ['expand', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Expand', 'wbd-content-image-seo-assistant')], ['shorten', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Shorten', 'wbd-content-image-seo-assistant')], ['grammar', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Fix Grammar', 'wbd-content-image-seo-assistant')], ['seo', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('SEO Optimize', 'wbd-content-image-seo-assistant')]];

/**
 * Block text content as an HTML string.
 *
 * @param {Object} block Block.
 * @return {string} HTML.
 */
const blockHtml = block => {
  const content = block?.attributes?.content;
  if (!content) {
    return '';
  }
  return typeof content === 'string' ? content : String(content);
};
function SelectedBlockPanel() {
  const block = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => select(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.store).getSelectedBlock(), []);
  const {
    updateBlockAttributes,
    insertBlocks
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useDispatch)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.store);
  const blockIndex = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => block ? select(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.store).getBlockIndex(block.clientId) : -1, [block]);
  const rootClientId = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => block ? select(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.store).getBlockRootClientId(block.clientId) : undefined, [block]);
  const [busy, setBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)('');
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)(null);
  const [result, setResult] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)(null);
  const supported = block && TEXT_BLOCKS.includes(block.name) && blockHtml(block).trim() !== '';
  const run = async action => {
    setBusy(action);
    setError(null);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_9__.request)('/rewrite', {
        method: 'POST',
        data: {
          content: blockHtml(block),
          action,
          request_id: (0,_common_api__WEBPACK_IMPORTED_MODULE_9__.newRequestId)()
        }
      });
      setResult({
        ...res,
        clientId: block.clientId
      });
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_8__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('AI result ready.', 'wbd-content-image-seo-assistant'));
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_9__.errorInfo)(e));
    }
    setBusy('');
  };
  const replace = () => {
    updateBlockAttributes(result.clientId, {
      content: result.result
    });
    setResult(null);
    (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_8__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Block replaced with the AI result.', 'wbd-content-image-seo-assistant'));
  };
  const insertBelow = () => {
    insertBlocks((0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_3__.createBlock)('core/paragraph', {
      content: result.result
    }), blockIndex + 1, rootClientId);
    setResult(null);
    (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_8__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('AI result inserted below.', 'wbd-content-image-seo-assistant'));
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Selected Block', 'wbd-content-image-seo-assistant'),
    initialOpen: true,
    children: [!supported ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("p", {
      className: "description",
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Select a paragraph, heading, list item or quote with text to improve, rewrite, expand or shorten it.', 'wbd-content-image-seo-assistant')
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
      className: "ai-cis-button-grid",
      children: BLOCK_ACTIONS.map(([action, label]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
        variant: "secondary",
        onClick: () => run(action),
        disabled: !!busy,
        isBusy: busy === action,
        children: label
      }, action))
    }), busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.Loading, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    }), result && !busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
      className: "ai-cis-result",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("p", {
        className: "ai-cis-label",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Original', 'wbd-content-image-seo-assistant')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.HtmlPreview, {
        html: result.original
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("p", {
        className: "ai-cis-label",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('AI Result', 'wbd-content-image-seo-assistant')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.HtmlPreview, {
        html: result.result
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.ResultActions, {
        onUse: replace,
        useLabel: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Replace', 'wbd-content-image-seo-assistant'),
        copyText: (0,_common_api__WEBPACK_IMPORTED_MODULE_9__.htmlToText)(result.result),
        onRegenerate: () => run(result.action),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
          variant: "secondary",
          onClick: insertBelow,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Insert below', 'wbd-content-image-seo-assistant')
        })
      })]
    })]
  });
}
function GeneratePanel() {
  const d = (0,_common_api__WEBPACK_IMPORTED_MODULE_9__.data)();
  const postType = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => select(_wordpress_editor__WEBPACK_IMPORTED_MODULE_1__.store).getCurrentPostType(), []);
  const {
    insertBlocks
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useDispatch)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.store);
  const {
    editPost
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useDispatch)(_wordpress_editor__WEBPACK_IMPORTED_MODULE_1__.store);
  const [topic, setTopic] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)('');
  const [tone, setTone] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)(d.defaults.tone);
  const [length, setLength] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)('medium');
  const [language, setLanguage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)(d.defaults.language);
  const [busy, setBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)(null);
  const [result, setResult] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)(null);
  const generate = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_9__.request)('/generate-content', {
        method: 'POST',
        data: {
          topic,
          tone,
          length,
          language,
          post_type: postType === 'page' ? 'page' : 'post',
          request_id: (0,_common_api__WEBPACK_IMPORTED_MODULE_9__.newRequestId)()
        }
      });
      setResult(res);
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_8__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Content generated.', 'wbd-content-image-seo-assistant'));
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_9__.errorInfo)(e));
    }
    setBusy(false);
  };
  const insert = () => {
    insertBlocks((0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_3__.rawHandler)({
      HTML: result.content
    }));
    const edits = {};
    if (result.title) {
      edits.title = result.title;
    }
    if (result.excerpt) {
      edits.excerpt = result.excerpt;
    }
    editPost(edits);
    setResult(null);
    (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_8__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Content inserted into the editor.', 'wbd-content-image-seo-assistant'));
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Generate', 'wbd-content-image-seo-assistant'),
    initialOpen: false,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.TextareaControl, {
      __nextHasNoMarginBottom: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Topic', 'wbd-content-image-seo-assistant'),
      value: topic,
      onChange: setTopic,
      rows: 3
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.SelectControl, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Tone', 'wbd-content-image-seo-assistant'),
      value: tone,
      options: d.options.tones,
      onChange: setTone
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.SelectControl, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Length', 'wbd-content-image-seo-assistant'),
      value: length,
      options: d.options.lengths,
      onChange: setLength
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.SelectControl, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Language', 'wbd-content-image-seo-assistant'),
      value: language,
      options: d.options.languages,
      onChange: setLanguage
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
      variant: "primary",
      onClick: generate,
      disabled: busy || !topic.trim(),
      isBusy: busy,
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Generate', 'wbd-content-image-seo-assistant')
    }), busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.Loading, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    }), result && !busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
      className: "ai-cis-result",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("p", {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("strong", {
          children: result.title
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.HtmlPreview, {
        html: result.content
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.ResultActions, {
        onUse: insert,
        useLabel: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Insert into editor', 'wbd-content-image-seo-assistant'),
        copyText: (0,_common_api__WEBPACK_IMPORTED_MODULE_9__.htmlToText)(result.content),
        onRegenerate: generate
      })]
    })]
  });
}
function TitleExcerptPanel() {
  const {
    title,
    content
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => ({
    title: select(_wordpress_editor__WEBPACK_IMPORTED_MODULE_1__.store).getEditedPostAttribute('title'),
    content: select(_wordpress_editor__WEBPACK_IMPORTED_MODULE_1__.store).getEditedPostContent()
  }), []);
  const {
    editPost
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useDispatch)(_wordpress_editor__WEBPACK_IMPORTED_MODULE_1__.store);
  const [busy, setBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)('');
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)(null);
  const [titles, setTitles] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)([]);
  const [excerpt, setExcerpt] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)('');
  const gen = async field => {
    setBusy(field);
    setError(null);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_9__.request)('/generate-field', {
        method: 'POST',
        data: {
          field,
          title,
          content,
          request_id: (0,_common_api__WEBPACK_IMPORTED_MODULE_9__.newRequestId)()
        }
      });
      if (field === 'title') {
        setTitles(res.options || []);
      } else {
        setExcerpt(res.value || '');
      }
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_9__.errorInfo)(e));
    }
    setBusy('');
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Title & Excerpt', 'wbd-content-image-seo-assistant'),
    initialOpen: false,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
      className: "ai-cis-button-grid",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
        variant: "secondary",
        onClick: () => gen('title'),
        disabled: !!busy,
        isBusy: busy === 'title',
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Suggest Titles', 'wbd-content-image-seo-assistant')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
        variant: "secondary",
        onClick: () => gen('excerpt'),
        disabled: !!busy,
        isBusy: busy === 'excerpt',
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Generate Excerpt', 'wbd-content-image-seo-assistant')
      })]
    }), busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.Loading, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    }), titles.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("ul", {
      className: "ai-cis-option-list",
      children: titles.map(t => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("li", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("span", {
          children: t
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
          variant: "link",
          onClick: () => {
            editPost({
              title: t
            });
            (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_8__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Title updated.', 'wbd-content-image-seo-assistant'));
          },
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Use This', 'wbd-content-image-seo-assistant')
        })]
      }, t))
    }), excerpt && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
      className: "ai-cis-result",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.TextareaControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('AI Excerpt', 'wbd-content-image-seo-assistant'),
        value: excerpt,
        onChange: setExcerpt
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.ResultActions, {
        onUse: () => {
          editPost({
            excerpt
          });
          (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_8__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Excerpt updated.', 'wbd-content-image-seo-assistant'));
        },
        copyText: excerpt,
        onRegenerate: () => gen('excerpt')
      })]
    })]
  });
}
function SeoPanel() {
  const {
    postId,
    title,
    content,
    link
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => ({
    postId: select(_wordpress_editor__WEBPACK_IMPORTED_MODULE_1__.store).getCurrentPostId(),
    title: select(_wordpress_editor__WEBPACK_IMPORTED_MODULE_1__.store).getEditedPostAttribute('title'),
    content: select(_wordpress_editor__WEBPACK_IMPORTED_MODULE_1__.store).getEditedPostContent(),
    link: select(_wordpress_editor__WEBPACK_IMPORTED_MODULE_1__.store).getPermalink()
  }), []);
  const [busy, setBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)(false);
  const [saving, setSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)(null);
  const [seo, setSeo] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)(null);
  const [notice, setNotice] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)('');
  const generate = async () => {
    setBusy(true);
    setError(null);
    setNotice('');
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_9__.request)('/seo/generate', {
        method: 'POST',
        data: {
          post_id: postId,
          title,
          content,
          request_id: (0,_common_api__WEBPACK_IMPORTED_MODULE_9__.newRequestId)()
        }
      });
      setSeo(res);
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_9__.errorInfo)(e));
    }
    setBusy(false);
  };
  const save = async () => {
    setSaving(true);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_9__.request)('/seo/save', {
        method: 'POST',
        data: {
          post_id: postId,
          ...seo
        }
      });
      setNotice((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.sprintf)(/* translators: %s: SEO plugin name. */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Saved to %s.', 'wbd-content-image-seo-assistant'), res.target));
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_8__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('SEO metadata saved.', 'wbd-content-image-seo-assistant'));
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_9__.errorInfo)(e));
    }
    setSaving(false);
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('SEO Optimize', 'wbd-content-image-seo-assistant'),
    initialOpen: false,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("p", {
      className: "description",
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.sprintf)(/* translators: %s: SEO plugin name. */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Saves to: %s. Nothing is saved until you confirm.', 'wbd-content-image-seo-assistant'), (0,_common_api__WEBPACK_IMPORTED_MODULE_9__.data)().seoPluginLabel)
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
      variant: "secondary",
      onClick: generate,
      disabled: busy,
      isBusy: busy,
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Generate SEO Title & Meta', 'wbd-content-image-seo-assistant')
    }), busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.Loading, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    }), seo && !busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
      className: "ai-cis-result",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.TextControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('SEO Title', 'wbd-content-image-seo-assistant'),
        value: seo.seo_title,
        onChange: v => setSeo({
          ...seo,
          seo_title: v
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.TextareaControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Meta Description', 'wbd-content-image-seo-assistant'),
        value: seo.meta_description,
        onChange: v => setSeo({
          ...seo,
          meta_description: v
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.TextControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Focus Keyword', 'wbd-content-image-seo-assistant'),
        value: seo.focus_keyword,
        onChange: v => setSeo({
          ...seo,
          focus_keyword: v
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.GooglePreview, {
        title: seo.seo_title,
        description: seo.meta_description,
        url: link
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.ResultActions, {
        onUse: save,
        useLabel: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Save SEO Metadata', 'wbd-content-image-seo-assistant'),
        busy: saving,
        copyText: seo.seo_title + '\n' + seo.meta_description,
        onRegenerate: generate
      }), (0,_common_api__WEBPACK_IMPORTED_MODULE_9__.data)().seoPlugin && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("p", {
        className: "description",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('Tip: reload the editor before your next save so your SEO plugin panel shows the new values.', 'wbd-content-image-seo-assistant')
      })]
    }), notice && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Notice, {
      status: "success",
      onRemove: () => setNotice(''),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("p", {
        children: notice
      })
    })]
  });
}
function AssistantSidebar() {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_editor__WEBPACK_IMPORTED_MODULE_1__.PluginSidebarMoreMenuItem, {
      target: "ai-cis-assistant",
      icon: "superhero-alt",
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('AI Content Assistant', 'wbd-content-image-seo-assistant')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_wordpress_editor__WEBPACK_IMPORTED_MODULE_1__.PluginSidebar, {
      name: "ai-cis-assistant",
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__.__)('AI Content Assistant', 'wbd-content-image-seo-assistant'),
      icon: "superhero-alt",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
        className: "ai-cis-editor-sidebar",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_10__.ProviderNotice, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(SelectedBlockPanel, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(GeneratePanel, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(TitleExcerptPanel, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(SeoPanel, {})]
      })
    })]
  });
}
;(0,_wordpress_plugins__WEBPACK_IMPORTED_MODULE_0__.registerPlugin)('wbd-content-image-seo-assistant', {
  render: AssistantSidebar
});
})();

/******/ })()
;
//# sourceMappingURL=editor.js.map