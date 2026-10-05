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

/***/ "./src/common/image-metadata-panel.js"
/*!********************************************!*\
  !*** ./src/common/image-metadata-panel.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ImageMetadataPanel)
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
 * Generate → review → apply flow for one image. Shared by Image AI,
 * the Media Library modal and the SEO Assistant.
 */







const FIELD_ORDER = ['alt', 'title', 'caption', 'description'];

/**
 * Field labels from bootstrap data.
 *
 * @return {Object} Map.
 */
const fieldLabels = () => {
  const map = {};
  ((0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().options?.imageFields || []).forEach(f => {
    map[f.value] = f.label;
  });
  return map;
};
function ImageMetadataPanel({
  attachmentId,
  onApplied
}) {
  const labels = fieldLabels();
  const defaults = (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().defaults || {};
  const [item, setItem] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [loadError, setLoadError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [fields, setFields] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(defaults.imageFields?.length ? defaults.imageFields : ['alt', 'title']);
  const [imageType, setImageType] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('informative');
  const [style, setStyle] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(defaults.altStyle || 'balanced');
  const [overwrite, setOverwrite] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [busy, setBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [saving, setSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [result, setResult] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [apply, setApply] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [saved, setSaved] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    let active = true;
    setItem(null);
    setResult(null);
    setSaved(null);
    setError(null);
    (0,_api__WEBPACK_IMPORTED_MODULE_4__.request)('/images/' + attachmentId).then(res => {
      if (!active) {
        return;
      }
      setItem(res);
      if (res.image_type) {
        setImageType(res.image_type);
      }
    }).catch(e => active && setLoadError((0,_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e)));
    return () => {
      active = false;
    };
  }, [attachmentId]);
  if (loadError) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
      error: loadError
    });
  }
  if (!item) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {});
  }
  const toggleField = (field, checked) => setFields(prev => checked ? [...new Set([...prev, field])] : prev.filter(f => f !== field));
  const generate = async () => {
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      const res = await (0,_api__WEBPACK_IMPORTED_MODULE_4__.request)('/generate-image-metadata', {
        method: 'POST',
        data: {
          attachment_id: attachmentId,
          fields,
          image_type: imageType,
          style,
          request_id: (0,_api__WEBPACK_IMPORTED_MODULE_4__.newRequestId)()
        }
      });
      setResult(res.values);
      setApply(Object.keys(res.values));
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI metadata generated. Review it before applying.', 'wbd-content-image-seo-assistant'));
    } catch (e) {
      setError((0,_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setBusy(false);
  };
  const applySelected = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await (0,_api__WEBPACK_IMPORTED_MODULE_4__.request)('/apply-image-metadata', {
        method: 'POST',
        data: {
          attachment_id: attachmentId,
          values: result || {},
          fields: apply,
          overwrite,
          image_type: imageType
        }
      });
      setSaved(res);
      setItem({
        ...item,
        ...res.current,
        image_type: imageType
      });
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Metadata saved.', 'wbd-content-image-seo-assistant'));
      if (onApplied) {
        onApplied(res.current);
      }
    } catch (e) {
      setError((0,_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setSaving(false);
  };
  const current = {
    alt: item.alt,
    title: item.title,
    caption: item.caption,
    description: item.description
  };
  const decorativeOnlyAlt = imageType === 'decorative' && fields.length === 1 && fields[0] === 'alt';
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
    className: "ai-cis-image-panel",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
      className: "ai-cis-image-panel__head",
      children: [item.thumb && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("img", {
        src: item.thumb,
        alt: "",
        className: "ai-cis-image-panel__thumb"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
          className: "ai-cis-image-panel__name",
          children: item.filename
        }), item.parent && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
          className: "description",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: parent post title. */
          (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Attached to: %s', 'wbd-content-image-seo-assistant'), item.parent.title)
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ProviderNotice, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("fieldset", {
      className: "ai-cis-fieldset",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("legend", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Fields to generate', 'wbd-content-image-seo-assistant')
      }), FIELD_ORDER.map(field => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CheckboxControl, {
        __nextHasNoMarginBottom: true,
        label: labels[field] || field,
        checked: fields.includes(field),
        onChange: checked => toggleField(field, checked)
      }, field))]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
      className: "ai-cis-grid-2",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.RadioControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Image Type', 'wbd-content-image-seo-assistant'),
        selected: imageType,
        onChange: setImageType,
        options: [{
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Informative', 'wbd-content-image-seo-assistant'),
          value: 'informative'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Decorative (alt text stays empty)', 'wbd-content-image-seo-assistant'),
          value: 'decorative'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Unsure', 'wbd-content-image-seo-assistant'),
          value: 'unsure'
        }]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Alt Text Style', 'wbd-content-image-seo-assistant'),
        value: style,
        onChange: setStyle,
        options: [{
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Balanced', 'wbd-content-image-seo-assistant'),
          value: 'balanced'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Accessibility First', 'wbd-content-image-seo-assistant'),
          value: 'accessibility'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO Focused', 'wbd-content-image-seo-assistant'),
          value: 'seo'
        }]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
      className: "ai-cis-actions",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "primary",
        onClick: decorativeOnlyAlt ? () => {
          setResult({
            alt: ''
          });
          setApply(['alt']);
        } : generate,
        isBusy: busy,
        disabled: busy || !fields.length,
        children: decorativeOnlyAlt ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Mark as Decorative', 'wbd-content-image-seo-assistant') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Image Metadata', 'wbd-content-image-seo-assistant')
      }), result && !decorativeOnlyAlt && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "tertiary",
        onClick: generate,
        disabled: busy,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Regenerate', 'wbd-content-image-seo-assistant')
      })]
    }), busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.Loading, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    }), result && !busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
      className: "ai-cis-compare",
      "aria-live": "polite",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("h3", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Review AI result', 'wbd-content-image-seo-assistant')
      }), FIELD_ORDER.filter(f => f in result).map(field => {
        const Control = field === 'description' || field === 'caption' ? _wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextareaControl : _wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl;
        const hasCurrent = (current[field] || '').trim() !== '';
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
          className: "ai-cis-compare__row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CheckboxControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: field label. */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Apply %s', 'wbd-content-image-seo-assistant'), labels[field] || field),
            checked: apply.includes(field),
            onChange: checked => setApply(prev => checked ? [...prev, field] : prev.filter(f => f !== field))
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("p", {
            className: "ai-cis-compare__current",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("strong", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Current:', 'wbd-content-image-seo-assistant')
            }), ' ', hasCurrent ? current[field] : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("em", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('(empty)', 'wbd-content-image-seo-assistant')
            })]
          }), field === 'alt' && imageType === 'decorative' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
            className: "description",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Decorative image: the alt text will be saved as empty so screen readers skip it.', 'wbd-content-image-seo-assistant')
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
            className: "ai-cis-compare__edit",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(Control, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: field label. */
              (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI %s', 'wbd-content-image-seo-assistant'), labels[field] || field),
              value: result[field],
              onChange: value => setResult({
                ...result,
                [field]: value
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.CopyButton, {
              text: result[field]
            })]
          }), hasCurrent && !overwrite && apply.includes(field) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
            className: "description ai-cis-warn-text",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('This field already has a value and will be kept unless you enable "Overwrite existing metadata".', 'wbd-content-image-seo-assistant')
          })]
        }, field);
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Overwrite existing metadata', 'wbd-content-image-seo-assistant'),
        checked: overwrite,
        onChange: setOverwrite
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
        className: "ai-cis-actions",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "primary",
          onClick: applySelected,
          isBusy: saving,
          disabled: saving || !apply.length,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Apply Selected', 'wbd-content-image-seo-assistant')
        })
      })]
    }), saved && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
      status: "success",
      isDismissible: true,
      onRemove: () => setSaved(null),
      className: "ai-cis-notice",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("p", {
        children: [saved.updated.length ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: list of fields. */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Saved: %s.', 'wbd-content-image-seo-assistant'), saved.updated.map(f => labels[f] || f).join(', ')) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Nothing was changed.', 'wbd-content-image-seo-assistant'), ' ', saved.skipped.length > 0 && (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: list of fields. */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Kept existing: %s.', 'wbd-content-image-seo-assistant'), saved.skipped.map(f => labels[f] || f).join(', '))]
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
/*!****************************!*\
  !*** ./src/media/index.js ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _common_image_metadata_panel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../common/image-metadata-panel */ "./src/common/image-metadata-panel.js");
/* harmony import */ var _common_ai_cis_scss__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../common/ai-cis.scss */ "./src/common/ai-cis.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);
/**
 * Media Library integration: opens the AI metadata panel in a modal when
 * "Generate AI Metadata" is clicked in attachment details or list rows.
 */






let root = null;
let container = null;

/**
 * Refreshes the Backbone attachment model so the media modal shows new values.
 *
 * @param {number} id      Attachment ID.
 * @param {Object} current Current values.
 */
function refreshAttachment(id, current) {
  const media = window.wp && window.wp.media;
  if (!media || !media.attachment) {
    return;
  }
  const model = media.attachment(id);
  if (model) {
    model.set({
      alt: current.alt,
      title: current.title,
      caption: current.caption,
      description: current.description
    });
  }
  // Plain edit-attachment screen fields.
  const pairs = [['attachment_alt', current.alt], ['title', current.title], ['attachment_caption', current.caption], ['attachment_content', current.description]];
  pairs.forEach(([elId, value]) => {
    const el = document.getElementById(elId);
    if (el && typeof value === 'string') {
      el.value = value;
    }
  });
}
function MediaModal({
  attachmentId,
  onClose
}) {
  const [id] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(attachmentId);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Modal, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate AI Metadata', 'wbd-content-image-seo-assistant'),
    onRequestClose: onClose,
    className: "ai-cis-modal",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_common_image_metadata_panel__WEBPACK_IMPORTED_MODULE_3__["default"], {
      attachmentId: id,
      onApplied: current => refreshAttachment(id, current)
    })
  });
}
function open(attachmentId, returnFocus) {
  if (!container) {
    container = document.createElement('div');
    container.className = 'ai-cis-media-root';
    document.body.appendChild(container);
    root = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createRoot)(container);
  }
  const close = () => {
    root.render(null);
    if (returnFocus && document.body.contains(returnFocus)) {
      returnFocus.focus();
    }
  };
  root.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(MediaModal, {
    attachmentId: attachmentId,
    onClose: close
  }, attachmentId + '-' + Date.now()));
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('.ai-cis-media-generate');
  if (!trigger) {
    return;
  }
  const id = parseInt(trigger.getAttribute('data-attachment-id'), 10);
  if (!id) {
    return;
  }
  event.preventDefault();
  open(id, trigger);
});
})();

/******/ })()
;
//# sourceMappingURL=media.js.map