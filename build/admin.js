/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/admin/pages/content-ai.js"
/*!***************************************!*\
  !*** ./src/admin/pages/content-ai.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LanguageControl: () => (/* binding */ LanguageControl),
/* harmony export */   apiLanguage: () => (/* binding */ apiLanguage),
/* harmony export */   "default": () => (/* binding */ ContentAI)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/a11y */ "@wordpress/a11y");
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _common_api__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../common/api */ "./src/common/api.js");
/* harmony import */ var _common_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../common/components */ "./src/common/components.js");
/* harmony import */ var _common_item_picker__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../common/item-picker */ "./src/common/item-picker.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);
/**
 * Content AI: generate posts/pages and rewrite existing content.
 */








/**
 * Language select with "Custom" support.
 *
 * @param {Object}   props             Props.
 * @param {string}   props.value       Language.
 * @param {Function} props.onChange    Change handler.
 * @param {boolean}  props.allowSource Include "same as original".
 * @return {Element} Control.
 */

function LanguageControl({
  value,
  onChange,
  allowSource = false
}) {
  const options = [...(0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().options.languages, {
    value: 'Custom',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Custom…', 'ai-content-image-seo')
  }];
  if (allowSource) {
    options.unshift({
      value: '',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Same as original', 'ai-content-image-seo')
    });
  }
  const isCustom = (value || '').startsWith('Custom:') || !options.some(o => o.value === value);
  const customText = (value || '').replace(/^Custom:/, '');
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
    className: "ai-cis-language",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Language', 'ai-content-image-seo'),
      value: isCustom ? 'Custom' : value,
      options: options,
      onChange: v => onChange(v === 'Custom' ? 'Custom:' : v)
    }), isCustom && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Custom language', 'ai-content-image-seo'),
      value: customText,
      placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('e.g. Portuguese (Brazil)', 'ai-content-image-seo'),
      onChange: v => onChange('Custom:' + v)
    })]
  });
}

/**
 * Normalizes the language value for the API.
 *
 * @param {string} value Value.
 * @return {string} Language.
 */
const apiLanguage = value => (value || '').replace(/^Custom:/, '').trim();
function GenerateTab() {
  const d = (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)();
  const [form, setForm] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({
    topic: '',
    post_type: 'post',
    content_type: 'blog_post',
    tone: d.defaults.tone,
    length: 'medium',
    language: d.defaults.language,
    keywords: '',
    instructions: ''
  });
  const [busy, setBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [refining, setRefining] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [result, setResult] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [creating, setCreating] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const set = key => value => setForm({
    ...form,
    [key]: value
  });
  const generate = async () => {
    if (!form.topic.trim()) {
      setError({
        message: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Please enter a topic.', 'ai-content-image-seo')
      });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/generate-content', {
        method: 'POST',
        data: {
          ...form,
          language: apiLanguage(form.language),
          request_id: (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.newRequestId)()
        }
      });
      setResult(res);
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Content generated. Review the result below.', 'ai-content-image-seo'));
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setBusy(false);
  };
  const refine = async action => {
    setRefining(action);
    setError(null);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/rewrite', {
        method: 'POST',
        data: {
          content: result.content,
          action,
          request_id: (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.newRequestId)()
        }
      });
      setResult({
        ...result,
        content: res.result
      });
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Content updated.', 'ai-content-image-seo'));
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setRefining('');
  };
  const createDraft = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/create-draft', {
        method: 'POST',
        data: {
          title: result.title,
          content: result.content,
          excerpt: result.excerpt,
          post_type: form.post_type,
          seo_title: result.seo_title,
          meta_description: result.meta_description,
          focus_keyword: result.keywords?.[0] || ''
        }
      });
      window.location.href = res.edit_link;
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
      setCreating(false);
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
    className: "ai-cis-two-col",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Post Content', 'ai-content-image-seo'),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextareaControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Topic', 'ai-content-image-seo'),
        help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Describe what the content should be about.', 'ai-content-image-seo'),
        value: form.topic,
        onChange: set('topic'),
        rows: 3
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
        className: "ai-cis-grid-2",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Create as', 'ai-content-image-seo'),
          value: form.post_type,
          options: [{
            value: 'post',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Post', 'ai-content-image-seo')
          }, {
            value: 'page',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Page', 'ai-content-image-seo')
          }],
          onChange: set('post_type')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Content Type', 'ai-content-image-seo'),
          value: form.content_type,
          options: d.options.contentTypes,
          onChange: set('content_type')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Tone', 'ai-content-image-seo'),
          value: form.tone,
          options: d.options.tones,
          onChange: set('tone')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Length', 'ai-content-image-seo'),
          value: form.length,
          options: d.options.lengths,
          onChange: set('length')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(LanguageControl, {
        value: form.language,
        onChange: set('language')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Keywords', 'ai-content-image-seo'),
        help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Optional, comma separated.', 'ai-content-image-seo'),
        value: form.keywords,
        onChange: set('keywords')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextareaControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Extra instructions', 'ai-content-image-seo'),
        value: form.instructions,
        onChange: set('instructions'),
        rows: 2
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
        className: "ai-cis-actions",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "primary",
          onClick: generate,
          isBusy: busy,
          disabled: busy,
          children: busy ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generating…', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate', 'ai-content-image-seo')
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.PrivacyHint, {})]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI Result', 'ai-content-image-seo'),
      children: [busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Loading, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
        error: error,
        onDismiss: () => setError(null)
      }), !busy && !result && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.EmptyState, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Nothing generated yet.', 'ai-content-image-seo'),
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Enter a topic and click Generate. You can review and edit everything before creating a draft.', 'ai-content-image-seo')
      }), !busy && result && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
        className: "ai-cis-result",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Title', 'ai-content-image-seo'),
          value: result.title,
          onChange: v => setResult({
            ...result,
            title: v
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
          className: "ai-cis-label",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Content', 'ai-content-image-seo')
        }), refining ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Loading, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Updating content…', 'ai-content-image-seo')
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.HtmlPreview, {
          html: result.content
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
          className: "ai-cis-actions ai-cis-actions--compact",
          children: [['improve', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Improve', 'ai-content-image-seo')], ['shorten', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Shorten', 'ai-content-image-seo')], ['expand', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Expand', 'ai-content-image-seo')], ['rewrite', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Rewrite', 'ai-content-image-seo')]].map(([action, label]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
            variant: "secondary",
            size: "compact",
            onClick: () => refine(action),
            disabled: !!refining,
            isBusy: refining === action,
            children: label
          }, action))
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextareaControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Excerpt', 'ai-content-image-seo'),
          value: result.excerpt,
          onChange: v => setResult({
            ...result,
            excerpt: v
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO Title', 'ai-content-image-seo'),
          value: result.seo_title,
          onChange: v => setResult({
            ...result,
            seo_title: v
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextareaControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Meta Description', 'ai-content-image-seo'),
          value: result.meta_description,
          onChange: v => setResult({
            ...result,
            meta_description: v
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.GooglePreview, {
          title: result.seo_title,
          description: result.meta_description
        }), result.keywords?.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("p", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("strong", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Keywords:', 'ai-content-image-seo')
          }), ' ', result.keywords.join(', ')]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.ResultActions, {
          onUse: createDraft,
          useLabel: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: post or page. */
          (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Insert into editor (new %s draft)', 'ai-content-image-seo'), form.post_type === 'page' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('page', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('post', 'ai-content-image-seo')),
          busy: creating || !!refining,
          copyText: (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.htmlToText)(result.content),
          onRegenerate: generate,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.CopyButton, {
            text: result.content,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Copy HTML', 'ai-content-image-seo')
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
          className: "description",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Regenerate, Improve, Shorten, Expand and Rewrite each count as one AI generation.', 'ai-content-image-seo')
        })]
      })]
    })]
  });
}
function RewriteTab() {
  const d = (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)();
  const [source, setSource] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('paste');
  const [item, setItem] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [loadingItem, setLoadingItem] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [content, setContent] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [action, setAction] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('improve');
  const [language, setLanguage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [busy, setBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [saving, setSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [result, setResult] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [notice, setNotice] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const pickItem = async picked => {
    setLoadingItem(true);
    setResult(null);
    setNotice('');
    try {
      const full = await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/items/' + picked.id);
      setItem(full);
      setContent(full.content);
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setLoadingItem(false);
  };
  const run = async () => {
    if (!content.trim()) {
      setError({
        message: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('There is no content to rewrite.', 'ai-content-image-seo')
      });
      return;
    }
    setBusy(true);
    setError(null);
    setNotice('');
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/rewrite', {
        method: 'POST',
        data: {
          content,
          action,
          language: apiLanguage(language),
          request_id: (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.newRequestId)()
        }
      });
      setResult(res);
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Rewrite ready. Compare the original and the AI result.', 'ai-content-image-seo'));
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setBusy(false);
  };
  const save = async mode => {
    if (source === 'paste') {
      setContent(mode === 'replace' ? result.result : content + '\n\n' + result.result);
      setResult(null);
      setNotice(mode === 'replace' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('The text box now contains the AI result.', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('The AI result was added below your text.', 'ai-content-image-seo'));
      return;
    }
    if (mode === 'replace' &&
    // eslint-disable-next-line no-alert
    !window.confirm((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Replace the content of this post with the AI result? A revision is kept so you can restore it.', 'ai-content-image-seo'))) {
      return;
    }
    setSaving(true);
    try {
      await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/items/' + item.id, {
        method: 'POST',
        data: {
          field: 'content',
          value: result.result,
          mode: mode === 'replace' ? 'replace' : 'append'
        }
      });
      const fresh = await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/items/' + item.id);
      setItem(fresh);
      setContent(fresh.content);
      setResult(null);
      setNotice((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Saved to the post.', 'ai-content-image-seo'));
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setSaving(false);
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
    className: "ai-cis-page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Improve Existing Content', 'ai-content-image-seo'),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
        className: "ai-cis-segmented",
        role: "group",
        "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Content source', 'ai-content-image-seo'),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: source === 'paste' ? 'primary' : 'secondary',
          onClick: () => setSource('paste'),
          "aria-pressed": source === 'paste',
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Paste text', 'ai-content-image-seo')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: source === 'post' ? 'primary' : 'secondary',
          onClick: () => setSource('post'),
          "aria-pressed": source === 'post',
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Existing post or page', 'ai-content-image-seo')
        })]
      }), source === 'post' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_item_picker__WEBPACK_IMPORTED_MODULE_6__["default"], {
          onSelect: pickItem,
          selectedId: item?.id
        }), loadingItem && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {}), item && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("p", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("strong", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Selected:', 'ai-content-image-seo')
          }), ' ', item.title, ' ', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("a", {
            href: item.edit_link,
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Edit', 'ai-content-image-seo')
          })]
        })]
      }), (source === 'paste' || item) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextareaControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Content', 'ai-content-image-seo'),
        value: content,
        onChange: setContent,
        rows: 8
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
        className: "ai-cis-grid-2",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Action', 'ai-content-image-seo'),
          value: action,
          options: d.options.rewriteActions,
          onChange: setAction
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(LanguageControl, {
          value: language,
          onChange: setLanguage,
          allowSource: true
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
        className: "ai-cis-actions",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "primary",
          onClick: run,
          isBusy: busy,
          disabled: busy || !content.trim(),
          children: busy ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generating…', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Rewrite', 'ai-content-image-seo')
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
        className: "description",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Your original content is never overwritten automatically.', 'ai-content-image-seo')
      })]
    }), busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Loading, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    }), notice && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
      status: "success",
      onRemove: () => setNotice(''),
      className: "ai-cis-notice",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
        children: notice
      })
    }), result && !busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Compare', 'ai-content-image-seo'),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
        className: "ai-cis-compare-cols",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("h3", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Original', 'ai-content-image-seo')
          }), result.is_html ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.HtmlPreview, {
            html: result.original
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
            className: "ai-cis-text-preview",
            children: result.original
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("h3", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI Result', 'ai-content-image-seo')
          }), result.is_html ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.HtmlPreview, {
            html: result.result
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
            className: "ai-cis-text-preview",
            children: result.result
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.ResultActions, {
        onUse: () => save('replace'),
        useLabel: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Replace', 'ai-content-image-seo'),
        busy: saving,
        copyText: result.is_html ? (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.htmlToText)(result.result) : result.result,
        onRegenerate: run,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "secondary",
          onClick: () => save('insert'),
          disabled: saving,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Insert (append)', 'ai-content-image-seo')
        })
      })]
    })]
  });
}
function ContentAI() {
  const params = new window.URLSearchParams(window.location.search);
  const initial = params.get('tab') === 'rewrite' ? 'rewrite' : 'generate';
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
    className: "ai-cis-page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.ProviderNotice, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TabPanel, {
      className: "ai-cis-tabs",
      initialTabName: initial,
      tabs: [{
        name: 'generate',
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Content', 'ai-content-image-seo')
      }, {
        name: 'rewrite',
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Content Rewriter', 'ai-content-image-seo')
      }],
      children: tab => tab.name === 'rewrite' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(RewriteTab, {}) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(GenerateTab, {})
    })]
  });
}

/***/ },

/***/ "./src/admin/pages/dashboard.js"
/*!**************************************!*\
  !*** ./src/admin/pages/dashboard.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Dashboard)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _common_api__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../common/api */ "./src/common/api.js");
/* harmony import */ var _common_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../common/components */ "./src/common/components.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);
/**
 * Dashboard: real usage numbers, quick actions and library status.
 */






function QuickAction({
  icon,
  title,
  text,
  href,
  disabledReason
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    className: 'ai-cis-quick' + (disabledReason ? ' is-disabled' : ''),
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
      className: 'dashicons ' + icon,
      "aria-hidden": "true"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("h3", {
      children: title
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
      children: text
    }), disabledReason ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        disabled: true,
        "aria-describedby": 'reason-' + icon,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Open', 'ai-content-image-seo')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
        className: "description",
        id: 'reason-' + icon,
        children: disabledReason
      })]
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
      variant: "secondary",
      href: href,
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Open', 'ai-content-image-seo')
    })]
  });
}
function Dashboard() {
  const [usage, setUsage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [stats, setStats] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const pages = (0,_common_api__WEBPACK_IMPORTED_MODULE_3__.data)().pages;
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    (0,_common_api__WEBPACK_IMPORTED_MODULE_3__.request)('/usage').then(setUsage).catch(e => setError((0,_common_api__WEBPACK_IMPORTED_MODULE_3__.errorInfo)(e)));
    if ((0,_common_api__WEBPACK_IMPORTED_MODULE_3__.data)().canUpload) {
      (0,_common_api__WEBPACK_IMPORTED_MODULE_3__.request)('/images/stats').then(setStats).catch(() => {});
    }
  }, []);
  const total = usage ? Object.values(usage.types).reduce((sum, t) => sum + t.used, 0) : 0;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    className: "ai-cis-page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_4__.ProviderNotice, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_4__.ErrorNotice, {
      error: error
    }), usage?.auto_limit_hit && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
      status: "warning",
      isDismissible: false,
      className: "ai-cis-notice",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("p", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("strong", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI usage limit reached.', 'ai-content-image-seo')
        }), ' ', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('New images will remain unprocessed until the limit resets.', 'ai-content-image-seo')]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "ai-cis-grid-main",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_4__.Section, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI Usage This Month', 'ai-content-image-seo'),
        actions: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "link",
          href: pages.usage,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('View details', 'ai-content-image-seo')
        }),
        children: [!usage && !error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {}), usage && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
            className: "ai-cis-big-number",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %d: total AI requests this month. */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('%d AI requests this month', 'ai-content-image-seo'), total)
          }), Object.entries(usage.types).map(([key, type]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_4__.UsageMeter, {
            type: type
          }, key)), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
            className: "description",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: reset date. */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Counters reset on %s. All features are free; limits are optional and set by the site owner.', 'ai-content-image-seo'), usage.reset_date)
          })]
        })]
      }), (0,_common_api__WEBPACK_IMPORTED_MODULE_3__.data)().canUpload && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_4__.Section, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Media Library', 'ai-content-image-seo'),
        actions: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "link",
          href: pages.image + '&tab=bulk',
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Bulk Optimizer', 'ai-content-image-seo')
        }),
        children: [!stats && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {}), stats && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("dl", {
          className: "ai-cis-stats",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("dt", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Total Images', 'ai-content-image-seo')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("dd", {
              children: stats.total
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("dt", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Missing Alt Text', 'ai-content-image-seo')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("dd", {
              children: stats.missing_alt
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("dt", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Missing Title', 'ai-content-image-seo')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("dd", {
              children: stats.missing_title
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("dt", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Missing Description', 'ai-content-image-seo')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("dd", {
              children: stats.missing_description
            })]
          })]
        }), usage && usage.auto_queue > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
          className: "description",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %d: number of images. */
          (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('%d new images waiting for automatic optimization.', 'ai-content-image-seo'), usage.auto_queue)
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("h2", {
      className: "ai-cis-section-title",
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Quick Actions', 'ai-content-image-seo')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "ai-cis-quick-grid",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(QuickAction, {
        icon: "dashicons-edit-page",
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Content', 'ai-content-image-seo'),
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Write a complete post or page with title, excerpt and SEO metadata.', 'ai-content-image-seo'),
        href: pages.content
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(QuickAction, {
        icon: "dashicons-format-gallery",
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Optimize Images', 'ai-content-image-seo'),
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Fill in missing image metadata across your media library in the background.', 'ai-content-image-seo'),
        href: pages.image ? pages.image + '&tab=bulk' : '',
        disabledReason: !(0,_common_api__WEBPACK_IMPORTED_MODULE_3__.data)().canUpload ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('You need permission to upload files.', 'ai-content-image-seo') : ''
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(QuickAction, {
        icon: "dashicons-cart",
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Optimize Products', 'ai-content-image-seo'),
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate product titles, descriptions, tags, categories and review summaries.', 'ai-content-image-seo'),
        href: pages.woocommerce,
        disabledReason: !(0,_common_api__WEBPACK_IMPORTED_MODULE_3__.data)().isWooActive ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Requires WooCommerce to be installed and active.', 'ai-content-image-seo') : ''
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(QuickAction, {
        icon: "dashicons-update",
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Rewrite Content', 'ai-content-image-seo'),
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Improve, shorten, expand or fix grammar in existing content with a side-by-side preview.', 'ai-content-image-seo'),
        href: pages.content + '&tab=rewrite'
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(QuickAction, {
        icon: "dashicons-universal-access-alt",
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Alt Text', 'ai-content-image-seo'),
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Create accessible, context-aware alt text for a single image.', 'ai-content-image-seo'),
        href: pages.image ? pages.image + '&tab=single' : '',
        disabledReason: !(0,_common_api__WEBPACK_IMPORTED_MODULE_3__.data)().canUpload ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('You need permission to upload files.', 'ai-content-image-seo') : ''
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(QuickAction, {
        icon: "dashicons-search",
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO Assistant', 'ai-content-image-seo'),
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: SEO plugin name. */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate SEO titles and meta descriptions. Saves to: %s.', 'ai-content-image-seo'), (0,_common_api__WEBPACK_IMPORTED_MODULE_3__.data)().seoPluginLabel),
        href: pages.seo
      })]
    })]
  });
}

/***/ },

/***/ "./src/admin/pages/image-ai.js"
/*!*************************************!*\
  !*** ./src/admin/pages/image-ai.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ImageAI)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/a11y */ "@wordpress/a11y");
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_a11y__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _common_api__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../common/api */ "./src/common/api.js");
/* harmony import */ var _common_components__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../common/components */ "./src/common/components.js");
/* harmony import */ var _common_image_metadata_panel__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../common/image-metadata-panel */ "./src/common/image-metadata-panel.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__);
/**
 * Image AI: single image metadata, Bulk Optimizer and automation status.
 */









/**
 * Opens the WordPress media frame to pick one image.
 *
 * @param {Function} onPick Callback with attachment ID.
 */

function openMediaFrame(onPick) {
  if (!window.wp || !window.wp.media) {
    return;
  }
  const frame = window.wp.media({
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Select an image', 'ai-content-image-seo'),
    library: {
      type: 'image'
    },
    button: {
      text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Use this image', 'ai-content-image-seo')
    },
    multiple: false
  });
  frame.on('select', () => {
    const attachment = frame.state().get('selection').first();
    if (attachment) {
      onPick(attachment.get('id'));
    }
  });
  frame.open();
}
function SingleTab() {
  const params = new window.URLSearchParams(window.location.search);
  const [attachmentId, setAttachmentId] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(parseInt(params.get('attachment'), 10) || 0);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
    className: "ai-cis-page",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_6__.Section, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Image Metadata', 'ai-content-image-seo'),
      actions: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        onClick: () => openMediaFrame(setAttachmentId),
        children: attachmentId ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Choose another image', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Select Image', 'ai-content-image-seo')
      }),
      children: attachmentId ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_image_metadata_panel__WEBPACK_IMPORTED_MODULE_7__["default"], {
        attachmentId: attachmentId
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_6__.EmptyState, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No image selected.', 'ai-content-image-seo'),
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Pick an image from the Media Library to generate alt text, title, caption and description. You review everything before it is saved.', 'ai-content-image-seo'),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "primary",
          onClick: () => openMediaFrame(setAttachmentId),
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Select Image', 'ai-content-image-seo')
        })
      })
    })
  });
}
function JobPanel({
  job,
  onControl,
  busy
}) {
  if (!job || job.status === 'idle') {
    return null;
  }
  const statusText = {
    running: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Optimizing Images', 'ai-content-image-seo'),
    paused: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Paused', 'ai-content-image-seo'),
    completed: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Completed', 'ai-content-image-seo')
  }[job.status];
  const reasons = {
    limit: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Paused because the monthly image limit was reached. It can resume when the limit resets or is raised.', 'ai-content-image-seo'),
    provider: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Paused because no AI provider is configured.', 'ai-content-image-seo'),
    rate_limit: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Paused because your AI provider rate limit was reached. Please resume in a few minutes.', 'ai-content-image-seo'),
    user: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Paused by you.', 'ai-content-image-seo')
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_6__.Section, {
    title: statusText,
    className: "ai-cis-job",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_6__.ProgressBar, {
      percent: job.percent,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Bulk optimization progress', 'ai-content-image-seo')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("p", {
      className: "ai-cis-job__numbers",
      "aria-live": "polite",
      children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: 1: percent, 2: processed, 3: remaining. */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('%1$d%% · Processed: %2$d · Remaining: %3$d', 'ai-content-image-seo'), job.percent, job.processed, job.remaining), ' · ', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: 1: optimized count, 2: skipped count, 3: failed count. */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Updated: %1$d · Already complete: %2$d · Failed: %3$d', 'ai-content-image-seo'), job.optimized, job.skipped, job.failed)]
    }), job.truncated > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
      className: "description",
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %d: number of images not included. */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__._n)('%d image was not included because of the bulk batch limit.', '%d images were not included because of the bulk batch limit.', job.truncated, 'ai-content-image-seo'), job.truncated)
    }), job.status === 'paused' && job.stop_reason && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
      children: reasons[job.stop_reason]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
      className: "ai-cis-actions",
      children: [job.status === 'running' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        onClick: () => onControl('pause'),
        disabled: busy,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Pause', 'ai-content-image-seo')
      }), job.status === 'paused' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "primary",
        onClick: () => onControl('resume'),
        disabled: busy,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Resume', 'ai-content-image-seo')
      }), job.status !== 'completed' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "tertiary",
        isDestructive: true,
        onClick: () => onControl('cancel'),
        disabled: busy,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Cancel', 'ai-content-image-seo')
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        onClick: () => onControl('cancel'),
        disabled: busy,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Clear', 'ai-content-image-seo')
      })]
    }), job.errors?.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("details", {
      className: "ai-cis-errors",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("summary", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Failed images', 'ai-content-image-seo')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("ul", {
        children: job.errors.map((e, i) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("li", {
          children: ["#", e.id, " ", e.title, ": ", e.message]
        }, i))
      })]
    })]
  });
}
function AltCell({
  item
}) {
  if (item.image_type === 'decorative') {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("em", {
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Decorative (empty by design)', 'ai-content-image-seo')
    });
  }
  if (item.alt) {
    return item.alt;
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
    className: "ai-cis-missing",
    children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Missing', 'ai-content-image-seo')
  });
}
function BulkTab() {
  const d = (0,_common_api__WEBPACK_IMPORTED_MODULE_5__.data)();
  const [stats, setStats] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [filter, setFilter] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('missing_alt');
  const [search, setSearch] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [query, setQuery] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [page, setPage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(1);
  const [list, setList] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [selected, setSelected] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [fields, setFields] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(d.defaults.imageFields?.length ? d.defaults.imageFields : ['alt', 'title']);
  const [overwrite, setOverwrite] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [job, setJob] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [busy, setBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [scanning, setScanning] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const stepping = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(false);
  const debounced = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_3__.useDebounce)(setQuery, 350);
  const loadStats = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    setScanning(true);
    return (0,_common_api__WEBPACK_IMPORTED_MODULE_5__.request)('/images/stats').then(setStats).catch(e => setError((0,_common_api__WEBPACK_IMPORTED_MODULE_5__.errorInfo)(e))).finally(() => setScanning(false));
  }, []);
  const loadList = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    setList(null);
    (0,_common_api__WEBPACK_IMPORTED_MODULE_5__.request)('/images', {
      query: {
        filter,
        page,
        search: query
      }
    }).then(setList).catch(e => setError((0,_common_api__WEBPACK_IMPORTED_MODULE_5__.errorInfo)(e)));
  }, [filter, page, query]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    loadStats();
    (0,_common_api__WEBPACK_IMPORTED_MODULE_5__.request)('/bulk/status').then(setJob).catch(() => {});
  }, [loadStats]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    debounced(search);
  }, [search, debounced]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(loadList, [loadList]);

  // While a job runs and this page is open, advance it step by step.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!job || job.status !== 'running' || stepping.current) {
      return undefined;
    }
    stepping.current = true;
    const timer = setTimeout(async () => {
      try {
        const next = await (0,_common_api__WEBPACK_IMPORTED_MODULE_5__.request)('/bulk/step', {
          method: 'POST'
        });
        setJob(next);
        if (next.status === 'completed') {
          (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_4__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Bulk optimization completed.', 'ai-content-image-seo'));
          loadStats();
          loadList();
        }
      } catch (e) {
        setError((0,_common_api__WEBPACK_IMPORTED_MODULE_5__.errorInfo)(e));
      }
      stepping.current = false;
    }, 800);
    return () => {
      clearTimeout(timer);
      stepping.current = false;
    };
  }, [job, loadStats, loadList]);
  const start = async useFilter => {
    setBusy(true);
    setError(null);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_5__.request)('/bulk/start', {
        method: 'POST',
        data: useFilter ? {
          filter,
          fields,
          overwrite
        } : {
          ids: selected,
          fields,
          overwrite
        }
      });
      setJob(res);
      setSelected([]);
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_4__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Bulk optimization started.', 'ai-content-image-seo'));
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_5__.errorInfo)(e));
    }
    setBusy(false);
  };
  const control = async action => {
    setBusy(true);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_5__.request)('/bulk/' + action, {
        method: 'POST'
      });
      setJob(res);
      if (action === 'cancel') {
        loadStats();
        loadList();
      }
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_5__.errorInfo)(e));
    }
    setBusy(false);
  };
  const jobActive = job && (job.status === 'running' || job.status === 'paused');
  const pageIds = list ? list.items.map(i => i.id) : [];
  const allOnPage = pageIds.length > 0 && pageIds.every(id => selected.includes(id));
  const fieldLabels = d.options.imageFields;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
    className: "ai-cis-page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_6__.Section, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Media Library', 'ai-content-image-seo'),
      actions: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        onClick: () => loadStats().then(loadList),
        isBusy: scanning,
        disabled: scanning,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Scan Library', 'ai-content-image-seo')
      }),
      children: !stats ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {}) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("dl", {
        className: "ai-cis-stats",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("dt", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Total Images', 'ai-content-image-seo')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("dd", {
            children: stats.total
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("dt", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Missing Alt Text', 'ai-content-image-seo')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("dd", {
            children: stats.missing_alt
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("dt", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Missing Title', 'ai-content-image-seo')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("dd", {
            children: stats.missing_title
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("dt", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Missing Description', 'ai-content-image-seo')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("dd", {
            children: stats.missing_description
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("dt", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Decorative', 'ai-content-image-seo')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("dd", {
            children: stats.decorative
          })]
        })]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_6__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(JobPanel, {
      job: job,
      onControl: control,
      busy: busy
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_6__.Section, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Bulk Optimizer', 'ai-content-image-seo'),
      children: [!d.canBulk && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
        status: "info",
        isDismissible: false,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Bulk optimization is available to editors and administrators.', 'ai-content-image-seo')
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
        className: "ai-cis-bulk-options",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("fieldset", {
          className: "ai-cis-fieldset ai-cis-inline",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("legend", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Fields to fill', 'ai-content-image-seo')
          }), fieldLabels.map(f => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CheckboxControl, {
            __nextHasNoMarginBottom: true,
            label: f.label,
            checked: fields.includes(f.value),
            onChange: c => setFields(prev => c ? [...prev, f.value] : prev.filter(x => x !== f.value))
          }, f.value))]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Overwrite existing metadata', 'ai-content-image-seo'),
          help: overwrite ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Existing values will be replaced.', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Only empty fields (and default filename titles) are filled.', 'ai-content-image-seo'),
          checked: overwrite,
          onChange: setOverwrite
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
        className: "ai-cis-picker__filters",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Filter', 'ai-content-image-seo'),
          value: filter,
          options: d.options.imageFilters,
          onChange: v => {
            setFilter(v);
            setPage(1);
            setSelected([]);
          }
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SearchControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Search images', 'ai-content-image-seo'),
          value: search,
          onChange: v => {
            setSearch(v);
            setPage(1);
          }
        })]
      }), !list && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {}), list && list.total === 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_6__.EmptyState, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No images need optimization.', 'ai-content-image-seo'),
        text: filter === 'missing_alt' || filter === 'missing_metadata' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Your media library is already optimized.', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No images match this filter.', 'ai-content-image-seo')
      }), list && list.total > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
          className: "ai-cis-actions",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
            variant: "primary",
            onClick: () => start(false),
            disabled: busy || jobActive || !selected.length || !fields.length || !d.canBulk,
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %d: number of selected images. */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Optimize Selected (%d)', 'ai-content-image-seo'), selected.length)
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
            variant: "secondary",
            onClick: () => start(true),
            disabled: busy || jobActive || !fields.length || !d.canBulk,
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %d: number of matching images. */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Optimize all %d matching images', 'ai-content-image-seo'), list.total)
          }), jobActive && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
            className: "description",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('A job is already in progress.', 'ai-content-image-seo')
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("table", {
          className: "widefat striped ai-cis-table",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("thead", {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("tr", {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("td", {
                className: "check-column",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CheckboxControl, {
                  __nextHasNoMarginBottom: true,
                  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Select all on this page', 'ai-content-image-seo'),
                  className: "ai-cis-sr-label",
                  checked: allOnPage,
                  onChange: c => setSelected(prev => c ? [...new Set([...prev, ...pageIds])] : prev.filter(id => !pageIds.includes(id)))
                })
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("th", {
                scope: "col",
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Image', 'ai-content-image-seo')
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("th", {
                scope: "col",
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Alt Text', 'ai-content-image-seo')
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("th", {
                scope: "col",
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Title', 'ai-content-image-seo')
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("th", {
                scope: "col",
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Used in', 'ai-content-image-seo')
              })]
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("tbody", {
            children: list.items.map(item => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("tr", {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("th", {
                scope: "row",
                className: "check-column",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CheckboxControl, {
                  __nextHasNoMarginBottom: true,
                  className: "ai-cis-sr-label",
                  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: file name. */
                  (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Select %s', 'ai-content-image-seo'), item.filename),
                  checked: selected.includes(item.id),
                  onChange: c => setSelected(prev => c ? [...prev, item.id] : prev.filter(id => id !== item.id))
                })
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("td", {
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
                  className: "ai-cis-row-image",
                  children: [item.thumb && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("img", {
                    src: item.thumb,
                    alt: "",
                    width: "48",
                    height: "48"
                  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
                    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("a", {
                      href: (0,_common_api__WEBPACK_IMPORTED_MODULE_5__.data)().pages.image + '&tab=single&attachment=' + item.id,
                      children: item.filename
                    }), item.status === 'failed' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
                      className: "ai-cis-badge is-error",
                      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Failed', 'ai-content-image-seo')
                    }), item.status === 'limit' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
                      className: "ai-cis-badge is-warn",
                      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Waiting for limit reset', 'ai-content-image-seo')
                    }), item.status === 'queued' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
                      className: "ai-cis-badge",
                      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Queued', 'ai-content-image-seo')
                    })]
                  })]
                })
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("td", {
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(AltCell, {
                  item: item
                })
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("td", {
                children: item.title
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("td", {
                children: item.parent ? item.parent.title : '—'
              })]
            }, item.id))
          })]
        }), list.total_pages > 1 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
          className: "ai-cis-pagination",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
            variant: "secondary",
            disabled: page <= 1,
            onClick: () => setPage(page - 1),
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Previous', 'ai-content-image-seo')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: 1: current page, 2: total pages. */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Page %1$d of %2$d', 'ai-content-image-seo'), page, list.total_pages)
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
            variant: "secondary",
            disabled: page >= list.total_pages,
            onClick: () => setPage(page + 1),
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Next', 'ai-content-image-seo')
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
        className: "description",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Images are processed a few at a time in the background (Action Scheduler or WP-Cron). Keeping this page open speeds things up. Each processed image counts as one image generation; images that already have the selected fields are skipped without using AI.', 'ai-content-image-seo')
      })]
    })]
  });
}
function AutomationTab() {
  const d = (0,_common_api__WEBPACK_IMPORTED_MODULE_5__.data)();
  const [usage, setUsage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    (0,_common_api__WEBPACK_IMPORTED_MODULE_5__.request)('/usage').then(setUsage).catch(() => {});
  }, []);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
    className: "ai-cis-page",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_6__.Section, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Automatic Image Optimization', 'ai-content-image-seo'),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("p", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("strong", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Status:', 'ai-content-image-seo')
        }), ' ', d.defaults.autoOptimize ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Enabled. New uploads are optimized in the background.', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Disabled.', 'ai-content-image-seo')]
      }), usage && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %d: images waiting. */
          (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Images waiting in the queue: %d', 'ai-content-image-seo'), usage.auto_queue)
        }), usage.auto_limit_hit && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
          status: "warning",
          isDismissible: false,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI usage limit reached. New images will remain unprocessed until the limit resets.', 'ai-content-image-seo')
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
        className: "description",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Automation only fills empty fields, respects the monthly automation limit and never retries failed images automatically. Use the Bulk Optimizer with the "Failed / Not Processed" filter to retry.', 'ai-content-image-seo')
      }), d.isManager && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        href: d.pages.settings + '&tab=images',
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Automation Settings', 'ai-content-image-seo')
      })]
    })
  });
}
function ImageAI() {
  const params = new window.URLSearchParams(window.location.search);
  const tab = params.get('tab');
  let initial = 'single';
  if (tab === 'bulk' || tab === 'automation') {
    initial = tab;
  } else if (!params.get('attachment') && tab !== 'single') {
    initial = 'bulk';
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
    className: "ai-cis-page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_6__.ProviderNotice, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TabPanel, {
      className: "ai-cis-tabs",
      initialTabName: initial,
      tabs: [{
        name: 'bulk',
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Bulk Optimizer', 'ai-content-image-seo')
      }, {
        name: 'single',
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Single Image', 'ai-content-image-seo')
      }, {
        name: 'automation',
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Automation', 'ai-content-image-seo')
      }],
      children: t => {
        if (t.name === 'single') {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(SingleTab, {});
        }
        if (t.name === 'automation') {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(AutomationTab, {});
        }
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(BulkTab, {});
      }
    })]
  });
}

/***/ },

/***/ "./src/admin/pages/onboarding.js"
/*!***************************************!*\
  !*** ./src/admin/pages/onboarding.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Onboarding)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _common_api__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../common/api */ "./src/common/api.js");
/* harmony import */ var _common_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../common/components */ "./src/common/components.js");
/* harmony import */ var _content_ai__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./content-ai */ "./src/admin/pages/content-ai.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);
/**
 * First-time setup wizard. Every step can be skipped; no external account
 * registration with the plugin author is ever required.
 */







const KEY_LINKS = {
  openai: 'https://platform.openai.com/api-keys',
  gemini: 'https://aistudio.google.com/apikey',
  anthropic: 'https://console.anthropic.com/settings/keys',
  openrouter: 'https://openrouter.ai/keys'
};
function Onboarding() {
  const [step, setStep] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(1);
  const [status, setStatus] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [provider, setProvider] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('wp_ai_connector');
  const [apiKey, setApiKey] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [language, setLanguage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)((0,_common_api__WEBPACK_IMPORTED_MODULE_3__.data)().defaults.language || 'English');
  const [style, setStyle] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('balanced');
  const [busy, setBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const headingRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)();
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    (0,_common_api__WEBPACK_IMPORTED_MODULE_3__.request)('/settings').then(res => {
      setStatus(res.status);
      const firstReady = Object.values(res.status.providers).find(p => p.available);
      setProvider(firstReady ? firstReady.id : res.settings.provider);
    }).catch(e => setError((0,_common_api__WEBPACK_IMPORTED_MODULE_3__.errorInfo)(e)));
  }, []);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [step]);
  const finish = async (skip = false) => {
    setBusy(true);
    setError(null);
    const settings = {
      provider,
      alt_text_style: style
    };
    if (language.startsWith('Custom:')) {
      settings.default_language = 'Custom';
      settings.custom_language = language.slice(7);
    } else {
      settings.default_language = language;
    }
    if (apiKey) {
      settings.api_keys = {
        [provider]: apiKey
      };
    }
    try {
      await (0,_common_api__WEBPACK_IMPORTED_MODULE_3__.request)('/onboarding', {
        method: 'POST',
        data: {
          settings,
          skip
        }
      });
      window.location.href = (0,_common_api__WEBPACK_IMPORTED_MODULE_3__.data)().pages.dashboard;
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_3__.errorInfo)(e));
      setBusy(false);
    }
  };
  const info = status?.providers?.[provider];
  const stepClass = n => {
    if (n === step) {
      return 'is-current';
    }
    return n < step ? 'is-done' : '';
  };
  let connectorText = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('The WordPress AI Client is not available on this site. Go back and choose another provider.', 'ai-content-image-seo');
  if (info?.available) {
    connectorText = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('WordPress AI is configured. No API key is needed here.', 'ai-content-image-seo');
  } else if (info?.api_exists) {
    connectorText = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Configure a provider in Settings → Connectors, then come back. You can also go back and pick another provider.', 'ai-content-image-seo');
  }
  const steps = [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Choose AI Provider', 'ai-content-image-seo'), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Configure API', 'ai-content-image-seo'), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Choose Default Language', 'ai-content-image-seo'), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Choose Alt Text Style', 'ai-content-image-seo')];
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
    className: "ai-cis-onboarding",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
      className: "ai-cis-onboarding__card",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("h2", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Welcome to AI Content & Image SEO', 'ai-content-image-seo')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Every feature is free to use. Let’s connect an AI provider and set a few defaults.', 'ai-content-image-seo')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("ol", {
        className: "ai-cis-steps",
        "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Setup steps', 'ai-content-image-seo'),
        children: steps.map((label, i) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("li", {
          className: stepClass(i + 1),
          "aria-current": i + 1 === step ? 'step' : undefined,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: 1: step number, 2: step name. */
          (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Step %1$d: %2$s', 'ai-content-image-seo'), i + 1, label)
        }, label))
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("h3", {
        tabIndex: -1,
        ref: headingRef,
        className: "ai-cis-onboarding__step-title",
        children: steps[step - 1]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_4__.ErrorNotice, {
        error: error
      }), step === 1 && status && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.RadioControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Provider', 'ai-content-image-seo'),
        hideLabelFromVision: true,
        selected: provider,
        onChange: setProvider,
        options: Object.values(status.providers).map(p => ({
          value: p.id,
          label: p.label + (p.available ? ' — ' + (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('ready', 'ai-content-image-seo') : '')
        }))
      }), step === 2 && info && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
        children: provider === 'wp_ai_connector' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
          status: info.available ? 'success' : 'info',
          isDismissible: false,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
            children: connectorText
          })
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            type: "password",
            autoComplete: "new-password",
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: provider name. */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('%s API Key', 'ai-content-image-seo'), info.label),
            value: apiKey,
            placeholder: info.available ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('A key is already saved — leave empty to keep it', 'ai-content-image-seo') : '',
            onChange: setApiKey
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ExternalLink, {
              href: KEY_LINKS[provider],
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Get an API key', 'ai-content-image-seo')
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
            className: "description",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Your key is stored encrypted on your own site and is only sent to this provider.', 'ai-content-image-seo')
          })]
        })
      }), step === 3 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_content_ai__WEBPACK_IMPORTED_MODULE_5__.LanguageControl, {
        value: language,
        onChange: setLanguage
      }), step === 4 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.RadioControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Alt Text Style', 'ai-content-image-seo'),
        hideLabelFromVision: true,
        selected: style,
        onChange: setStyle,
        options: [{
          value: 'balanced',
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Balanced (recommended)', 'ai-content-image-seo')
        }, {
          value: 'accessibility',
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Accessibility First', 'ai-content-image-seo')
        }, {
          value: 'seo',
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO Focused', 'ai-content-image-seo')
        }]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
        className: "ai-cis-actions ai-cis-onboarding__nav",
        children: [step > 1 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "secondary",
          onClick: () => setStep(step - 1),
          disabled: busy,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Back', 'ai-content-image-seo')
        }), step < 4 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "primary",
          onClick: () => setStep(step + 1),
          disabled: !status,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Continue', 'ai-content-image-seo')
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "primary",
          onClick: () => finish(false),
          isBusy: busy,
          disabled: busy,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Finish Setup', 'ai-content-image-seo')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "tertiary",
          onClick: () => finish(true),
          disabled: busy,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Skip setup', 'ai-content-image-seo')
        })]
      })]
    })
  });
}

/***/ },

/***/ "./src/admin/pages/seo.js"
/*!********************************!*\
  !*** ./src/admin/pages/seo.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SeoAssistant)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/a11y */ "@wordpress/a11y");
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _common_api__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../common/api */ "./src/common/api.js");
/* harmony import */ var _common_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../common/components */ "./src/common/components.js");
/* harmony import */ var _common_item_picker__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../common/item-picker */ "./src/common/item-picker.js");
/* harmony import */ var _common_image_metadata_panel__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../common/image-metadata-panel */ "./src/common/image-metadata-panel.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__);
/**
 * SEO Assistant: metadata, keyword suggestions, content optimization, image SEO.
 */









function MetadataPanel({
  item,
  onSaved
}) {
  const [busy, setBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [saving, setSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [draft, setDraft] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [keywords, setKeywords] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [notice, setNotice] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const generate = async () => {
    setBusy(true);
    setError(null);
    setNotice('');
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/seo/generate', {
        method: 'POST',
        data: {
          post_id: item.id,
          request_id: (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.newRequestId)()
        }
      });
      setDraft(res);
      setKeywords(res.keywords || []);
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO metadata generated. Review the Google preview before saving.', 'ai-content-image-seo'));
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setBusy(false);
  };
  const suggestKeywords = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/generate-field', {
        method: 'POST',
        data: {
          field: 'keywords',
          post_id: item.id,
          request_id: (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.newRequestId)()
        }
      });
      setKeywords(res.options || []);
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setBusy(false);
  };
  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/seo/save', {
        method: 'POST',
        data: {
          post_id: item.id,
          ...draft
        }
      });
      setNotice((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: SEO plugin name. */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Saved to %s.', 'ai-content-image-seo'), res.target));
      onSaved(res.seo);
      setDraft(null);
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setSaving(false);
  };
  const current = item.seo || {};
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO Title & Meta Description', 'ai-content-image-seo'),
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
      className: "description",
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: SEO plugin name. */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Metadata is saved to: %s. Nothing is changed until you click Save.', 'ai-content-image-seo'), (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().seoPluginLabel)
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
      className: "ai-cis-label",
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Current', 'ai-content-image-seo')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.GooglePreview, {
      title: current.seo_title || item.title,
      description: current.meta_description,
      url: item.link
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
      className: "ai-cis-actions",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "primary",
        onClick: generate,
        isBusy: busy,
        disabled: busy,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate SEO Title & Meta Description', 'ai-content-image-seo')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        onClick: suggestKeywords,
        disabled: busy,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Suggest Focus Keywords', 'ai-content-image-seo')
      })]
    }), busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Loading, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    }), keywords.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
      className: "ai-cis-chips",
      role: "group",
      "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Keyword suggestions', 'ai-content-image-seo'),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
        className: "ai-cis-label",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Keyword suggestions (click to use as focus keyword)', 'ai-content-image-seo')
      }), keywords.map(k => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        size: "compact",
        onClick: () => setDraft({
          ...(draft || {
            seo_title: current.seo_title,
            meta_description: current.meta_description
          }),
          focus_keyword: k
        }),
        children: k
      }, k))]
    }), draft && !busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
      className: "ai-cis-result",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
        className: "ai-cis-label",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI Result', 'ai-content-image-seo')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO Title', 'ai-content-image-seo'),
        value: draft.seo_title || '',
        onChange: v => setDraft({
          ...draft,
          seo_title: v
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextareaControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Meta Description', 'ai-content-image-seo'),
        value: draft.meta_description || '',
        onChange: v => setDraft({
          ...draft,
          meta_description: v
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Focus Keyword', 'ai-content-image-seo'),
        value: draft.focus_keyword || '',
        onChange: v => setDraft({
          ...draft,
          focus_keyword: v
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.GooglePreview, {
        title: draft.seo_title,
        description: draft.meta_description,
        url: item.link
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.ResultActions, {
        onUse: save,
        useLabel: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Save SEO Metadata', 'ai-content-image-seo'),
        busy: saving,
        copyText: (draft.seo_title || '') + '\n' + (draft.meta_description || ''),
        onRegenerate: generate
      })]
    }), notice && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
      status: "success",
      onRemove: () => setNotice(''),
      className: "ai-cis-notice",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
        children: notice
      })
    })]
  });
}
function OptimizationPanel({
  item
}) {
  const [busy, setBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [report, setReport] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const analyze = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/seo/analyze', {
        method: 'POST',
        data: {
          post_id: item.id,
          request_id: (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.newRequestId)()
        }
      });
      setReport(res);
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Content analysis ready.', 'ai-content-image-seo'));
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setBusy(false);
  };
  const priorityLabel = {
    high: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('High priority', 'ai-content-image-seo'),
    medium: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Medium priority', 'ai-content-image-seo'),
    low: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Low priority', 'ai-content-image-seo')
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Content Optimization', 'ai-content-image-seo'),
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
      className: "ai-cis-actions",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        onClick: analyze,
        isBusy: busy,
        disabled: busy,
        children: report ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Analyze Again', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Analyze Content', 'ai-content-image-seo')
      })
    }), busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Loading, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Analyzing…', 'ai-content-image-seo')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    }), report && !busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
      className: "ai-cis-result",
      children: [report.score !== null && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
        className: "ai-cis-big-number",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %d: SEO score. */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI SEO score: %d / 100', 'ai-content-image-seo'), report.score)
      }), report.summary && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
        children: report.summary
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("ul", {
        className: "ai-cis-checks",
        children: report.checks.map(c => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("li", {
          className: c.pass ? 'is-pass' : 'is-fail',
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
            className: 'dashicons ' + (c.pass ? 'dashicons-yes' : 'dashicons-warning'),
            "aria-hidden": "true"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
            className: "screen-reader-text",
            children: c.pass ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Passed:', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Needs work:', 'ai-content-image-seo')
          }), c.label, ": ", c.note]
        }, c.label))
      }), report.suggestions.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
          className: "ai-cis-label",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Suggestions', 'ai-content-image-seo')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("ul", {
          className: "ai-cis-suggestions",
          children: report.suggestions.map((s, i) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("li", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
              className: 'ai-cis-badge is-' + s.priority,
              children: priorityLabel[s.priority]
            }), ' ', s.text]
          }, i))
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("a", {
          href: (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().pages.content + '&tab=rewrite',
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Use the Content Rewriter to apply improvements', 'ai-content-image-seo')
        })
      })]
    })]
  });
}
function ImageSeoPanel({
  item,
  onChanged
}) {
  const [editing, setEditing] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const images = item.images || [];
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Image SEO', 'ai-content-image-seo'),
    children: [images.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.EmptyState, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No images found in this content.', 'ai-content-image-seo')
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("ul", {
      className: "ai-cis-image-list",
      children: images.map(img => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("li", {
        children: [img.thumb && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("img", {
          src: img.thumb,
          alt: "",
          width: "48",
          height: "48"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("strong", {
            children: img.title
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("br", {}), img.decorative && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("em", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Decorative (empty alt by design)', 'ai-content-image-seo')
          }), !img.decorative && (img.alt ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("span", {
            children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Alt:', 'ai-content-image-seo'), ' ', img.alt]
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
            className: "ai-cis-missing",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Missing alt text', 'ai-content-image-seo')
          }))]
        }), (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().canUpload && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "secondary",
          size: "compact",
          onClick: () => setEditing(img.id),
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate AI Metadata', 'ai-content-image-seo')
        })]
      }, img.id))
    }), editing && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Modal, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate AI Metadata', 'ai-content-image-seo'),
      onRequestClose: () => setEditing(null),
      className: "ai-cis-modal",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_image_metadata_panel__WEBPACK_IMPORTED_MODULE_7__["default"], {
        attachmentId: editing,
        onApplied: onChanged
      })
    })]
  });
}
function SeoAssistant() {
  const [item, setItem] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [loading, setLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const load = async picked => {
    setLoading(true);
    setError(null);
    try {
      setItem(await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/items/' + picked.id));
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setLoading(false);
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
    className: "ai-cis-page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.ProviderNotice, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
      status: "info",
      isDismissible: false,
      className: "ai-cis-notice",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
        children: (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().seoPlugin ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: SEO plugin name. */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('%s detected. SEO metadata is read from and saved to it.', 'ai-content-image-seo'), (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().seoPluginLabel) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No SEO plugin detected (Yoast SEO, Rank Math and All in One SEO are supported). Metadata is stored by this plugin and output in your page head.', 'ai-content-image-seo')
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
      className: "ai-cis-sidebar-layout",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Choose content', 'ai-content-image-seo'),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_item_picker__WEBPACK_IMPORTED_MODULE_6__["default"], {
          onSelect: load,
          selectedId: item?.id,
          showSeo: true
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
          error: error
        }), loading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {}), !loading && !item && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.EmptyState, {
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Select a post, page or product.', 'ai-content-image-seo'),
            text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Then generate an SEO title and meta description, get keyword ideas, analyze the content and check image alt text.', 'ai-content-image-seo')
          })
        }), !loading && item && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("h2", {
            className: "ai-cis-section-title",
            children: [item.title, ' ', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("a", {
              href: item.edit_link,
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Edit', 'ai-content-image-seo')
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(MetadataPanel, {
            item: item,
            onSaved: seo => setItem({
              ...item,
              seo
            })
          }, 'm' + item.id), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(OptimizationPanel, {
            item: item
          }, 'o' + item.id), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(ImageSeoPanel, {
            item: item,
            onChanged: () => (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/items/' + item.id).then(setItem).catch(() => {})
          }, 'i' + item.id)]
        })]
      })]
    })]
  });
}

/***/ },

/***/ "./src/admin/pages/settings.js"
/*!*************************************!*\
  !*** ./src/admin/pages/settings.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SettingsPage)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/a11y */ "@wordpress/a11y");
/* harmony import */ var _wordpress_a11y__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _common_api__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../common/api */ "./src/common/api.js");
/* harmony import */ var _common_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../common/components */ "./src/common/components.js");
/* harmony import */ var _content_ai__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./content-ai */ "./src/admin/pages/content-ai.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);
/**
 * Settings. API keys are write-only: the server only ever returns whether a
 * key is configured plus its last four characters.
 */








const KEY_LINKS = {
  openai: 'https://platform.openai.com/api-keys',
  gemini: 'https://aistudio.google.com/apikey',
  anthropic: 'https://console.anthropic.com/settings/keys',
  openrouter: 'https://openrouter.ai/keys'
};
function ProviderTab({
  form,
  set,
  status,
  keys,
  setKeys,
  publicKeys,
  onModelsRefreshed
}) {
  const provider = form.provider;
  const info = status.providers[provider] || {};
  const [testing, setTesting] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [refreshing, setRefreshing] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [testResult, setTestResult] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const models = info.models || {
    auto: 'Auto'
  };
  const currentModel = form.provider_models[provider] || 'auto';
  const isKnownModel = Object.prototype.hasOwnProperty.call(models, currentModel);
  const [customChosen, setCustomModel] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const customModel = customChosen || !isKnownModel;
  const setModel = value => set('provider_models', {
    ...form.provider_models,
    [provider]: value
  });
  const test = async () => {
    setTesting(true);
    setTestResult(null);
    setError(null);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/provider/test', {
        method: 'POST',
        data: {
          provider
        }
      });
      setTestResult(res.message);
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)(res.message);
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setTesting(false);
  };
  const refreshModels = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/provider/models', {
        method: 'POST',
        data: {
          provider
        }
      });
      onModelsRefreshed(provider, res.models);
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Model list updated.', 'ai-content-image-seo'));
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setRefreshing(false);
  };
  const keyInfo = publicKeys[provider];
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI Provider', 'ai-content-image-seo'),
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.RadioControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Provider', 'ai-content-image-seo'),
      selected: provider,
      onChange: v => {
        set('provider', v);
        setTestResult(null);
        setError(null);
        setCustomModel(false);
      },
      options: Object.values(status.providers).map(p => ({
        value: p.id,
        label: p.label + ' — ' + (p.available ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('ready', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('not configured', 'ai-content-image-seo'))
      }))
    }), provider === 'wp_ai_connector' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
      status: info.available ? 'success' : 'info',
      isDismissible: false,
      className: "ai-cis-notice",
      children: info.api_exists ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("p", {
        children: [info.available ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('WordPress AI is available. Requests use the provider configured in Settings → Connectors.', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('WordPress AI Client is available, but no text-generation connector is configured yet.', 'ai-content-image-seo'), ' ', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("a", {
          href: (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().connectorsUrl,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Open Connectors', 'ai-content-image-seo')
        })]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('The WordPress AI Client is not available on this site (it ships with WordPress 7.0+). Choose another provider and add an API key instead.', 'ai-content-image-seo')
      })
    }), info.needs_key && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
      className: "ai-cis-key",
      children: keyInfo?.via_constant ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: constant name. */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('The API key is defined in wp-config.php (%s).', 'ai-content-image-seo'), 'AI_CIS_' + provider.toUpperCase() + '_API_KEY')
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          type: "password",
          autoComplete: "new-password",
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('API Key', 'ai-content-image-seo'),
          value: keys[provider] && keys[provider] !== '__delete__' ? keys[provider] : '',
          placeholder: keyInfo?.configured ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: last characters of the key. */
          (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Saved key %s — leave empty to keep it', 'ai-content-image-seo'), keyInfo.hint) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Paste your API key', 'ai-content-image-seo'),
          onChange: v => setKeys({
            ...keys,
            [provider]: v
          }),
          help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Stored encrypted in your database and never shown in the browser again. You can also define it in wp-config.php.', 'ai-content-image-seo')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("p", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ExternalLink, {
            href: KEY_LINKS[provider],
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Get an API key', 'ai-content-image-seo')
          }), keyInfo?.configured && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
            children: [' · ', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
              variant: "link",
              isDestructive: true,
              onClick: () => setKeys({
                ...keys,
                [provider]: '__delete__'
              }),
              children: keys[provider] === '__delete__' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Key will be removed on save', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Remove saved key', 'ai-content-image-seo')
            })]
          })]
        })]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "ai-cis-grid-2",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Model', 'ai-content-image-seo'),
          value: customModel ? '__custom' : currentModel,
          options: [...Object.entries(models).map(([value, label]) => ({
            value,
            label
          })), {
            value: '__custom',
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Custom model ID…', 'ai-content-image-seo')
          }],
          onChange: v => {
            if (v === '__custom') {
              setCustomModel(true);
            } else {
              setCustomModel(false);
              setModel(v);
            }
          }
        }), customModel && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Custom model ID', 'ai-content-image-seo'),
          value: currentModel === 'auto' ? '' : currentModel,
          onChange: setModel
        }), info.needs_key && keyInfo?.configured && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "link",
          onClick: refreshModels,
          isBusy: refreshing,
          disabled: refreshing,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Load models from provider', 'ai-content-image-seo')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.RangeControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Temperature', 'ai-content-image-seo'),
          help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Lower is more focused, higher is more creative.', 'ai-content-image-seo'),
          value: Number(form.temperature),
          min: 0,
          max: 2,
          step: 0.1,
          onChange: v => set('temperature', v)
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        type: "number",
        min: 64,
        max: 32000,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Max Tokens', 'ai-content-image-seo'),
        value: form.max_tokens,
        onChange: v => set('max_tokens', parseInt(v, 10) || 0)
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        type: "number",
        min: 10,
        max: 300,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Request timeout (seconds)', 'ai-content-image-seo'),
        value: form.request_timeout,
        onChange: v => set('request_timeout', parseInt(v, 10) || 0)
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "ai-cis-actions",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        onClick: test,
        isBusy: testing,
        disabled: testing,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Test Connection', 'ai-content-image-seo')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
        className: "description",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Tests the saved settings. Save changes first. Tests are not counted as usage.', 'ai-content-image-seo')
      })]
    }), testResult && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
      status: "success",
      onRemove: () => setTestResult(null),
      className: "ai-cis-notice",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
        children: testResult
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    })]
  });
}
function FieldChecks({
  value,
  onChange,
  legend
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("fieldset", {
    className: "ai-cis-fieldset",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("legend", {
      children: legend
    }), (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().options.imageFields.map(f => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CheckboxControl, {
      __nextHasNoMarginBottom: true,
      label: f.label,
      checked: value.includes(f.value),
      onChange: c => onChange(c ? [...value, f.value] : value.filter(x => x !== f.value))
    }, f.value))]
  });
}
function SettingsPage() {
  const [loaded, setLoaded] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [form, setForm] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [keys, setKeys] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({});
  const [saving, setSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [saved, setSaved] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const apply = res => {
    const {
      api_keys: apiKeys,
      ...rest
    } = res.settings;
    setLoaded({
      ...res,
      apiKeys
    });
    setForm(rest);
    window.aiCisData.providerReady = res.status.ready;
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/settings').then(apply).catch(e => setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e)));
  }, []);
  if (!form) {
    return error ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
      error: error
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {});
  }
  const set = (key, value) => {
    setSaved(false);
    setForm(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const setNested = (group, key, value) => set(group, {
    ...form[group],
    [key]: value
  });
  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/settings', {
        method: 'POST',
        data: {
          settings: {
            ...form,
            api_keys: keys
          }
        }
      });
      apply(res);
      setKeys({});
      setSaved(true);
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Settings saved.', 'ai-content-image-seo'));
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e));
    }
    setSaving(false);
  };
  const onModelsRefreshed = (provider, models) => {
    setLoaded(prev => ({
      ...prev,
      status: {
        ...prev.status,
        providers: {
          ...prev.status.providers,
          [provider]: {
            ...prev.status.providers[provider],
            models
          }
        }
      }
    }));
  };
  const params = new window.URLSearchParams(window.location.search);
  const tabs = [{
    name: 'provider',
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI Provider', 'ai-content-image-seo')
  }, {
    name: 'content',
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Content & Language', 'ai-content-image-seo')
  }, {
    name: 'images',
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Images & Automation', 'ai-content-image-seo')
  }, {
    name: 'seo',
    title: (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().isWooActive ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO & WooCommerce', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO', 'ai-content-image-seo')
  }, {
    name: 'prompts',
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Custom Prompts', 'ai-content-image-seo')
  }, {
    name: 'limits',
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Usage Limits', 'ai-content-image-seo')
  }, {
    name: 'privacy',
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Privacy & Data', 'ai-content-image-seo')
  }];
  const initial = tabs.some(t => t.name === params.get('tab')) ? params.get('tab') : 'provider';
  const promptGroups = [['content', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Content generation', 'ai-content-image-seo')], ['rewrite', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Content rewriting', 'ai-content-image-seo')], ['image', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Image metadata', 'ai-content-image-seo')], ['product', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('WooCommerce products', 'ai-content-image-seo')], ['seo', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO metadata', 'ai-content-image-seo')], ['review', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Review summaries', 'ai-content-image-seo')]];
  const limitLabels = {
    content: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI content generations per month', 'ai-content-image-seo'),
    image: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Image metadata generations per month', 'ai-content-image-seo'),
    product: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('WooCommerce product generations per month', 'ai-content-image-seo'),
    auto_image: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Automatic image optimizations per month', 'ai-content-image-seo'),
    review: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Review summaries per month', 'ai-content-image-seo'),
    bulk_batch: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Bulk items per batch', 'ai-content-image-seo')
  };
  const renderTab = tab => {
    switch (tab.name) {
      case 'provider':
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(ProviderTab, {
          form: form,
          set: set,
          status: loaded.status,
          keys: keys,
          setKeys: setKeys,
          publicKeys: loaded.apiKeys,
          onModelsRefreshed: onModelsRefreshed
        });
      case 'content':
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Content & Language', 'ai-content-image-seo'),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_content_ai__WEBPACK_IMPORTED_MODULE_6__.LanguageControl, {
            value: form.default_language === 'Custom' ? 'Custom:' + form.custom_language : form.default_language,
            onChange: v => {
              if (v.startsWith('Custom:')) {
                set('default_language', 'Custom');
                set('custom_language', v.slice(7));
              } else {
                set('default_language', v);
              }
            }
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Default tone', 'ai-content-image-seo'),
            value: form.default_tone,
            options: (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().options.tones,
            onChange: v => set('default_tone', v)
          })]
        });
      case 'images':
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Image AI', 'ai-content-image-seo'),
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.RadioControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Alt Text Style', 'ai-content-image-seo'),
              selected: form.alt_text_style,
              onChange: v => set('alt_text_style', v),
              options: [{
                value: 'balanced',
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Balanced (default)', 'ai-content-image-seo')
              }, {
                value: 'accessibility',
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Accessibility First — concise, factual, no keyword stuffing', 'ai-content-image-seo')
              }, {
                value: 'seo',
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO Focused', 'ai-content-image-seo')
              }]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(FieldChecks, {
              legend: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Default fields for single and bulk generation', 'ai-content-image-seo'),
              value: form.image_default_fields,
              onChange: v => set('image_default_fields', v)
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Send the image to the AI provider for visual analysis', 'ai-content-image-seo'),
              help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Recommended for accurate alt text. When off, only the filename and surrounding context are used.', 'ai-content-image-seo'),
              checked: !!form.image_send_file,
              onChange: v => set('image_send_file', v)
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Automation', 'ai-content-image-seo'),
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
              __nextHasNoMarginBottom: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Automatically optimize new images', 'ai-content-image-seo'),
              help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('New uploads are processed in the background. Only empty fields are filled, the automation limit is respected and failed images are not retried.', 'ai-content-image-seo'),
              checked: !!form.auto_optimize,
              onChange: v => set('auto_optimize', v)
            }), form.auto_optimize && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(FieldChecks, {
              legend: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Fields', 'ai-content-image-seo'),
              value: form.auto_fields,
              onChange: v => set('auto_fields', v)
            })]
          })]
        });
      case 'seo':
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
          title: tab.title,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
            children: (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().seoPlugin ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: plugin name. */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Detected SEO plugin: %s. SEO metadata is saved there.', 'ai-content-image-seo'), (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().seoPluginLabel) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No SEO plugin detected. Supported: Yoast SEO, Rank Math, All in One SEO.', 'ai-content-image-seo')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Output SEO title and meta description when no SEO plugin is active', 'ai-content-image-seo'),
            checked: !!form.seo_output_meta,
            onChange: v => set('seo_output_meta', v)
          }), (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().isWooActive && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Show saved AI review summaries above product reviews', 'ai-content-image-seo'),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('You can also place a summary anywhere with the [ai_cis_review_summary] shortcode.', 'ai-content-image-seo'),
            checked: !!form.review_summary_display,
            onChange: v => set('review_summary_display', v)
          })]
        });
      case 'prompts':
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Custom Prompts', 'ai-content-image-seo'),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
            className: "description",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Extra instructions appended to every prompt in a group, for example your brand voice or words to avoid. Developers can replace prompts entirely with the ai_cis_*_prompt filters.', 'ai-content-image-seo')
          }), promptGroups.map(([key, label]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextareaControl, {
            __nextHasNoMarginBottom: true,
            label: label,
            value: form.custom_prompts[key] || '',
            onChange: v => setNested('custom_prompts', key, v),
            rows: 3
          }, key))]
        });
      case 'limits':
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Usage Limits', 'ai-content-image-seo'),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
            status: "info",
            isDismissible: false,
            className: "ai-cis-notice",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('All features are free and unlimited by default. Set a number to cap monthly usage on this site (for example to control AI provider costs). 0 = unlimited.', 'ai-content-image-seo')
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
            className: "ai-cis-grid-2",
            children: Object.keys(limitLabels).map(key => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              type: "number",
              min: 0,
              label: limitLabels[key],
              value: form.limits[key],
              onChange: v => setNested('limits', key, Math.max(0, parseInt(v, 10) || 0)),
              help: Number(form.limits[key]) === 0 ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Unlimited', 'ai-content-image-seo') : ''
            }, key))
          })]
        });
      case 'privacy':
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Privacy & Data', 'ai-content-image-seo'),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI requests send the content you select (post text, image files and context, product details, or review text and star ratings) to the AI provider configured above. Nothing is sent without a user action or enabled automation.', 'ai-content-image-seo')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Never sent: passwords, payment information, customer accounts, reviewer names, emails or IP addresses. The plugin has no tracking and sends nothing to its author.', 'ai-content-image-seo')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Review your AI provider’s data policy before use. Suggested text has been added to Settings → Privacy → Policy Guide.', 'ai-content-image-seo')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Delete plugin settings on uninstall', 'ai-content-image-seo'),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Removes settings, API keys and usage data when the plugin is deleted. Your posts, products, media and generated content are never deleted.', 'ai-content-image-seo'),
            checked: !!form.delete_on_uninstall,
            onChange: v => set('delete_on_uninstall', v)
          }), (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().isManager && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("a", {
              href: (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().pages.dashboard + '&setup=1',
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Run the setup wizard again', 'ai-content-image-seo')
            })
          })]
        });
    }
    return null;
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
    className: "ai-cis-page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TabPanel, {
      className: "ai-cis-tabs",
      initialTabName: initial,
      tabs: tabs,
      children: renderTab
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "ai-cis-savebar",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "primary",
        onClick: save,
        isBusy: saving,
        disabled: saving,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Save Settings', 'ai-content-image-seo')
      }), saved && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
        className: "ai-cis-saved",
        role: "status",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Settings saved.', 'ai-content-image-seo')
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    })]
  });
}

/***/ },

/***/ "./src/admin/pages/usage.js"
/*!**********************************!*\
  !*** ./src/admin/pages/usage.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ UsagePage)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _common_api__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../common/api */ "./src/common/api.js");
/* harmony import */ var _common_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../common/components */ "./src/common/components.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);
/**
 * Usage & limits.
 */






function UsagePage() {
  const [usage, setUsage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [busy, setBusy] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    (0,_common_api__WEBPACK_IMPORTED_MODULE_3__.request)('/usage').then(setUsage).catch(e => setError((0,_common_api__WEBPACK_IMPORTED_MODULE_3__.errorInfo)(e)));
  }, []);
  const reset = async () => {
    if (
    // eslint-disable-next-line no-alert
    !window.confirm((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Reset this month’s usage counters to zero?', 'ai-content-image-seo'))) {
      return;
    }
    setBusy(true);
    try {
      setUsage(await (0,_common_api__WEBPACK_IMPORTED_MODULE_3__.request)('/usage/reset', {
        method: 'POST'
      }));
    } catch (e) {
      setError((0,_common_api__WEBPACK_IMPORTED_MODULE_3__.errorInfo)(e));
    }
    setBusy(false);
  };
  if (!usage) {
    return error ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_4__.ErrorNotice, {
      error: error
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {});
  }
  const history = Object.entries(usage.history || {});
  const types = usage.types;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    className: "ai-cis-page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
      status: "info",
      isDismissible: false,
      className: "ai-cis-notice",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Every feature is available for free. Usage is tracked so you can see how much AI you use; limits are optional and can be set in Settings → Usage Limits (0 = unlimited).', 'ai-content-image-seo')
      })
    }), usage.auto_limit_hit && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
      status: "warning",
      isDismissible: false,
      className: "ai-cis-notice",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI usage limit reached. New images will remain unprocessed until the limit resets.', 'ai-content-image-seo')
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_4__.ErrorNotice, {
      error: error
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_4__.Section, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: period YYYY-MM. */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Usage for %s', 'ai-content-image-seo'), usage.period),
      actions: (0,_common_api__WEBPACK_IMPORTED_MODULE_3__.data)().isManager && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "secondary",
          href: (0,_common_api__WEBPACK_IMPORTED_MODULE_3__.data)().pages.settings + '&tab=limits',
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Edit Limits', 'ai-content-image-seo')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "tertiary",
          isDestructive: true,
          onClick: reset,
          disabled: busy,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Reset Counters', 'ai-content-image-seo')
        })]
      }),
      children: [Object.entries(types).map(([key, type]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_4__.UsageMeter, {
        type: type
      }, key)), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("table", {
        className: "widefat striped ai-cis-table",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("thead", {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("tr", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("th", {
              scope: "col",
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Type', 'ai-content-image-seo')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("th", {
              scope: "col",
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Used', 'ai-content-image-seo')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("th", {
              scope: "col",
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Limit', 'ai-content-image-seo')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("th", {
              scope: "col",
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Remaining', 'ai-content-image-seo')
            })]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("tbody", {
          children: [Object.entries(types).map(([key, type]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("tr", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("td", {
              children: type.label
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("td", {
              children: type.used
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("td", {
              children: type.unlimited ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Unlimited', 'ai-content-image-seo') : type.limit
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("td", {
              children: type.unlimited ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Unlimited', 'ai-content-image-seo') : type.remaining
            })]
          }, key)), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("tr", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("td", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Bulk items per batch', 'ai-content-image-seo')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("td", {
              children: "\u2014"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("td", {
              children: usage.bulk_batch ? usage.bulk_batch : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Unlimited', 'ai-content-image-seo')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("td", {
              children: "\u2014"
            })]
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
        className: "description",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: date. */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Counters reset automatically on %s (site timezone). Regenerating a result counts as a new generation. Connection tests are never counted.', 'ai-content-image-seo'), usage.reset_date)
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_4__.Section, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('History', 'ai-content-image-seo'),
      children: history.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_4__.EmptyState, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No history yet.', 'ai-content-image-seo'),
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Monthly totals appear here after your first full month.', 'ai-content-image-seo')
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("table", {
        className: "widefat striped ai-cis-table",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("thead", {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("tr", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("th", {
              scope: "col",
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Month', 'ai-content-image-seo')
            }), Object.entries(types).map(([key, type]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("th", {
              scope: "col",
              children: type.label
            }, key))]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("tbody", {
          children: history.map(([period, counts]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("tr", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("td", {
              children: period
            }), Object.keys(types).map(key => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("td", {
              children: counts[key] || 0
            }, key))]
          }, period))
        })]
      })
    })]
  });
}

/***/ },

/***/ "./src/admin/pages/woocommerce.js"
/*!****************************************!*\
  !*** ./src/admin/pages/woocommerce.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WooCommercePage)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _common_api__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../common/api */ "./src/common/api.js");
/* harmony import */ var _common_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../common/components */ "./src/common/components.js");
/* harmony import */ var _common_product_assistant__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../common/product-assistant */ "./src/common/product-assistant.js");
/* harmony import */ var _common_review_summary_panel__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../common/review-summary-panel */ "./src/common/review-summary-panel.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__);
/**
 * WooCommerce AI page: pick a product, generate content, summarize reviews.
 */









function WooCommercePage() {
  const [search, setSearch] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [query, setQuery] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [page, setPage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(1);
  const [list, setList] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [product, setProduct] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const debounced = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_3__.useDebounce)(setQuery, 350);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    debounced(search);
  }, [search, debounced]);
  const load = () => {
    setList(null);
    return (0,_common_api__WEBPACK_IMPORTED_MODULE_4__.request)('/products', {
      query: {
        search: query,
        page
      }
    }).then(res => {
      setList(res);
      return res;
    }).catch(e => setError((0,_common_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e)));
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);
  if (!(0,_common_api__WEBPACK_IMPORTED_MODULE_4__.data)().isWooActive) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.EmptyState, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('WooCommerce is not active.', 'ai-content-image-seo'),
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Install and activate WooCommerce to use product AI features.', 'ai-content-image-seo')
      })
    });
  }
  const refreshProduct = () => load().then(res => {
    const fresh = res?.items?.find(i => i.id === product.id);
    if (fresh) {
      setProduct(fresh);
    }
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
    className: "ai-cis-sidebar-layout",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Products', 'ai-content-image-seo'),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SearchControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Search products', 'ai-content-image-seo'),
        value: search,
        onChange: v => {
          setSearch(v);
          setPage(1);
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
        error: error
      }), !list && !error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {}), list && list.items.length === 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.EmptyState, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No products found.', 'ai-content-image-seo'),
        text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Create a product in WooCommerce first, then come back to generate its content.', 'ai-content-image-seo')
      }), list && list.items.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("ul", {
        className: "ai-cis-picker__list",
        children: list.items.map(item => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("li", {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
            className: 'ai-cis-picker__item' + (product?.id === item.id ? ' is-selected' : ''),
            onClick: () => setProduct(item),
            "aria-pressed": product?.id === item.id,
            children: [item.thumb && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("img", {
              src: item.thumb,
              alt: "",
              width: "32",
              height: "32"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("span", {
              className: "ai-cis-picker__title",
              children: item.name
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("span", {
              className: "ai-cis-picker__meta",
              children: [item.status, !item.has_description && ' · ' + (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('no description', 'ai-content-image-seo')]
            })]
          })
        }, item.id))
      }), list && list.total_pages > 1 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("div", {
        className: "ai-cis-pagination",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "secondary",
          disabled: page <= 1,
          onClick: () => setPage(page - 1),
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Previous', 'ai-content-image-seo')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "secondary",
          disabled: page >= list.total_pages,
          onClick: () => setPage(page + 1),
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Next', 'ai-content-image-seo')
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
      children: !product ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.EmptyState, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Select a product.', 'ai-content-image-seo'),
          text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate titles, descriptions, tags, category suggestions, SEO metadata and review summaries. Every result is previewed before it is saved.', 'ai-content-image-seo')
        })
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("h2", {
          className: "ai-cis-section-title",
          children: [product.name, ' ', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("a", {
            href: product.edit_link,
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Edit product', 'ai-content-image-seo')
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TabPanel, {
          className: "ai-cis-tabs",
          tabs: [{
            name: 'assistant',
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI Product Assistant', 'ai-content-image-seo')
          }, {
            name: 'reviews',
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI Review Summary', 'ai-content-image-seo')
          }, {
            name: 'current',
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Current Content', 'ai-content-image-seo')
          }],
          children: tab => {
            if (tab.name === 'reviews') {
              return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_review_summary_panel__WEBPACK_IMPORTED_MODULE_7__["default"], {
                  productId: product.id
                }, product.id)
              });
            }
            if (tab.name === 'current') {
              return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
                  className: "ai-cis-label",
                  children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Short Description', 'ai-content-image-seo')
                }), product.short_description ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.HtmlPreview, {
                  html: product.short_description
                }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("em", {
                    children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('(empty)', 'ai-content-image-seo')
                  })
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
                  className: "ai-cis-label",
                  children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Description', 'ai-content-image-seo')
                }), product.description ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.HtmlPreview, {
                  html: product.description
                }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("em", {
                    children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('(empty)', 'ai-content-image-seo')
                  })
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("p", {
                  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("strong", {
                    children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Categories:', 'ai-content-image-seo')
                  }), ' ', product.categories.join(', ') || '—', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("br", {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("strong", {
                    children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Tags:', 'ai-content-image-seo')
                  }), ' ', product.tags.join(', ') || '—', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("br", {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("strong", {
                    children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO title:', 'ai-content-image-seo')
                  }), ' ', product.seo.seo_title || '—', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("br", {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("strong", {
                    children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Meta description:', 'ai-content-image-seo')
                  }), ' ', product.seo.meta_description || '—']
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("p", {
                  className: "description",
                  children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %d: review count. */
                  (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Approved reviews: %d', 'ai-content-image-seo'), product.review_count)
                })]
              });
            }
            return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_components__WEBPACK_IMPORTED_MODULE_5__.Section, {
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_common_product_assistant__WEBPACK_IMPORTED_MODULE_6__["default"], {
                productId: product.id,
                mode: "direct",
                product: product,
                onSaved: refreshProduct
              }, product.id)
            });
          }
        })]
      })
    })]
  });
}

/***/ },

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
  const message = error.message || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Unable to generate content. Please check your AI provider settings and try again.', 'ai-content-image-seo');
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
        children: label || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generating…', 'ai-content-image-seo')
      }), ' ', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Please wait.', 'ai-content-image-seo')]
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
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Open AI Provider settings', 'ai-content-image-seo')
      })
    }), error.details && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "link",
        onClick: () => setOpen(!open),
        "aria-expanded": open,
        children: open ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Hide technical details', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Show technical details', 'ai-content-image-seo')
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
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No AI provider configured.', 'ai-content-image-seo')
      }), ' ', (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().isManager ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Connect an AI provider from Settings → AI Provider.', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Ask a site administrator to connect an AI provider.', 'ai-content-image-seo')]
    }), (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().isManager && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        href: (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().pages.settings,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Connect AI Provider', 'ai-content-image-seo')
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
    (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)(ok ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Copied to clipboard.', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Copy failed. Select the text and copy it manually.', 'ai-content-image-seo'));
    if (ok) {
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
    variant: "secondary",
    onClick: onClick,
    disabled: !text,
    children: copied ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Copied!', 'ai-content-image-seo') : label || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Copy', 'ai-content-image-seo')
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
  (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Used: %d (unlimited)', 'ai-content-image-seo'), type.used) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: 1: number used, 2: limit. */
  (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Used: %1$d / %2$d', 'ai-content-image-seo'), type.used, type.limit);
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
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI result preview', 'ai-content-image-seo'),
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
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Google Preview', 'ai-content-image-seo'),
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
      className: "ai-cis-serp__label",
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Google Preview', 'ai-content-image-seo')
    }), url && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: "ai-cis-serp__url",
      children: url
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: "ai-cis-serp__title",
      children: title || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('(no SEO title)', 'ai-content-image-seo')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: "ai-cis-serp__desc",
      children: description || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('(no meta description)', 'ai-content-image-seo')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
      className: "ai-cis-serp__meta",
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: 1: title length, 2: description length. */
      (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Title: %1$d characters (aim for 60 or fewer) · Description: %2$d characters (aim for 120–155)', 'ai-content-image-seo'), titleLen, descLen)
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
      children: useLabel || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Use This', 'ai-content-image-seo')
    }), typeof text === 'string' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(CopyButton, {
      text: text
    }), onRegenerate && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
      variant: "tertiary",
      onClick: onRegenerate,
      disabled: busy,
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Regenerate', 'ai-content-image-seo')
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
    children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('The selected content is sent to your configured AI provider only when you click a generate button.', 'ai-content-image-seo')
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
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI metadata generated. Review it before applying.', 'ai-content-image-seo'));
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
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Metadata saved.', 'ai-content-image-seo'));
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
          (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Attached to: %s', 'ai-content-image-seo'), item.parent.title)
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ProviderNotice, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("fieldset", {
      className: "ai-cis-fieldset",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("legend", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Fields to generate', 'ai-content-image-seo')
      }), FIELD_ORDER.map(field => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CheckboxControl, {
        __nextHasNoMarginBottom: true,
        label: labels[field] || field,
        checked: fields.includes(field),
        onChange: checked => toggleField(field, checked)
      }, field))]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
      className: "ai-cis-grid-2",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.RadioControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Image Type', 'ai-content-image-seo'),
        selected: imageType,
        onChange: setImageType,
        options: [{
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Informative', 'ai-content-image-seo'),
          value: 'informative'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Decorative (alt text stays empty)', 'ai-content-image-seo'),
          value: 'decorative'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Unsure', 'ai-content-image-seo'),
          value: 'unsure'
        }]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Alt Text Style', 'ai-content-image-seo'),
        value: style,
        onChange: setStyle,
        options: [{
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Balanced', 'ai-content-image-seo'),
          value: 'balanced'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Accessibility First', 'ai-content-image-seo'),
          value: 'accessibility'
        }, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO Focused', 'ai-content-image-seo'),
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
        children: decorativeOnlyAlt ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Mark as Decorative', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Image Metadata', 'ai-content-image-seo')
      }), result && !decorativeOnlyAlt && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "tertiary",
        onClick: generate,
        disabled: busy,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Regenerate', 'ai-content-image-seo')
      })]
    }), busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.Loading, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    }), result && !busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
      className: "ai-cis-compare",
      "aria-live": "polite",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("h3", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Review AI result', 'ai-content-image-seo')
      }), FIELD_ORDER.filter(f => f in result).map(field => {
        const Control = field === 'description' || field === 'caption' ? _wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextareaControl : _wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl;
        const hasCurrent = (current[field] || '').trim() !== '';
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
          className: "ai-cis-compare__row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CheckboxControl, {
            __nextHasNoMarginBottom: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: field label. */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Apply %s', 'ai-content-image-seo'), labels[field] || field),
            checked: apply.includes(field),
            onChange: checked => setApply(prev => checked ? [...prev, field] : prev.filter(f => f !== field))
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("p", {
            className: "ai-cis-compare__current",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("strong", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Current:', 'ai-content-image-seo')
            }), ' ', hasCurrent ? current[field] : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("em", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('(empty)', 'ai-content-image-seo')
            })]
          }), field === 'alt' && imageType === 'decorative' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
            className: "description",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Decorative image: the alt text will be saved as empty so screen readers skip it.', 'ai-content-image-seo')
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
            className: "ai-cis-compare__edit",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(Control, {
              __nextHasNoMarginBottom: true,
              __next40pxDefaultSize: true,
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: field label. */
              (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI %s', 'ai-content-image-seo'), labels[field] || field),
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
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('This field already has a value and will be kept unless you enable "Overwrite existing metadata".', 'ai-content-image-seo')
          })]
        }, field);
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Overwrite existing metadata', 'ai-content-image-seo'),
        checked: overwrite,
        onChange: setOverwrite
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
        className: "ai-cis-actions",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          variant: "primary",
          onClick: applySelected,
          isBusy: saving,
          disabled: saving || !apply.length,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Apply Selected', 'ai-content-image-seo')
        })
      })]
    }), saved && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
      status: "success",
      isDismissible: true,
      onRemove: () => setSaved(null),
      className: "ai-cis-notice",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("p", {
        children: [saved.updated.length ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: list of fields. */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Saved: %s.', 'ai-content-image-seo'), saved.updated.map(f => labels[f] || f).join(', ')) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Nothing was changed.', 'ai-content-image-seo'), ' ', saved.skipped.length > 0 && (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: list of fields. */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Kept existing: %s.', 'ai-content-image-seo'), saved.skipped.map(f => labels[f] || f).join(', '))]
      })
    })]
  });
}

/***/ },

/***/ "./src/common/item-picker.js"
/*!***********************************!*\
  !*** ./src/common/item-picker.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ItemPicker)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./api */ "./src/common/api.js");
/* harmony import */ var _components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components */ "./src/common/components.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);
/**
 * Searchable picker for posts, pages and products the user can edit.
 */







function ItemPicker({
  onSelect,
  selectedId,
  showSeo = false
}) {
  const [search, setSearch] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [type, setType] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('any');
  const [page, setPage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(1);
  const [result, setResult] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [query, setQuery] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const debounced = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_3__.useDebounce)(setQuery, 350);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    debounced(search);
  }, [search, debounced]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    setResult(null);
    (0,_api__WEBPACK_IMPORTED_MODULE_4__.request)('/items', {
      query: {
        search: query,
        type,
        page
      }
    }).then(setResult).catch(e => setError((0,_api__WEBPACK_IMPORTED_MODULE_4__.errorInfo)(e)));
  }, [query, type, page]);
  const typeOptions = [{
    value: 'any',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('All content', 'ai-content-image-seo')
  }, {
    value: 'post',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Posts', 'ai-content-image-seo')
  }, {
    value: 'page',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Pages', 'ai-content-image-seo')
  }];
  if ((0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().isWooActive) {
    typeOptions.push({
      value: 'product',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Products', 'ai-content-image-seo')
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
    className: "ai-cis-picker",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
      className: "ai-cis-picker__filters",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SearchControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Search content', 'ai-content-image-seo'),
        value: search,
        onChange: v => {
          setSearch(v);
          setPage(1);
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Type', 'ai-content-image-seo'),
        hideLabelFromVision: true,
        value: type,
        options: typeOptions,
        onChange: v => {
          setType(v);
          setPage(1);
        }
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
      error: error
    }), !result && !error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Spinner, {}), result && result.items.length === 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.EmptyState, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No content found.', 'ai-content-image-seo'),
      text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Try a different search, or create a post first.', 'ai-content-image-seo')
    }), result && result.items.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("ul", {
      className: "ai-cis-picker__list",
      children: result.items.map(item => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("li", {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
          className: 'ai-cis-picker__item' + (item.id === selectedId ? ' is-selected' : ''),
          onClick: () => onSelect(item),
          "aria-pressed": item.id === selectedId,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
            className: "ai-cis-picker__title",
            children: item.title
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("span", {
            className: "ai-cis-picker__meta",
            children: [item.type, " \xB7 ", item.status, showSeo && (item.seo?.meta_description ? ' · ' + (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('has meta description', 'ai-content-image-seo') : ' · ' + (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('no meta description', 'ai-content-image-seo'))]
          })]
        })
      }, item.id))
    }), result && result.total_pages > 1 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
      className: "ai-cis-pagination",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        disabled: page <= 1,
        onClick: () => setPage(page - 1),
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Previous', 'ai-content-image-seo')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: 1: current page, 2: total pages. */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Page %1$d of %2$d', 'ai-content-image-seo'), page, result.total_pages)
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
        variant: "secondary",
        disabled: page >= result.total_pages,
        onClick: () => setPage(page + 1),
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Next', 'ai-content-image-seo')
      })]
    })]
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
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Title', 'ai-content-image-seo')
}, {
  field: 'description',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Description', 'ai-content-image-seo')
}, {
  field: 'short_description',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Short Description', 'ai-content-image-seo')
}, {
  field: 'seo',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate SEO Metadata', 'ai-content-image-seo')
}, {
  field: 'tags',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Tags', 'ai-content-image-seo')
}, {
  field: 'categories',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Suggest Categories', 'ai-content-image-seo')
}, {
  field: 'improve',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Improve Existing Content', 'ai-content-image-seo')
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
      ;(0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI result ready. Review it before using it.', 'ai-content-image-seo'));
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
          done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Title inserted. Click "Update" to save the product.', 'ai-content-image-seo'));
        } else {
          await saveDirect(choice);
          done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Product title saved.', 'ai-content-image-seo'));
        }
      } else if (['description', 'improve', 'short_description'].includes(target)) {
        const editorId = target === 'short_description' ? 'excerpt' : 'content';
        if (isEditor && (0,_classic_editor__WEBPACK_IMPORTED_MODULE_6__.setEditorValue)(editorId, result.value)) {
          done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Inserted into the editor. Click "Update" to save the product.', 'ai-content-image-seo'));
        } else {
          await saveDirect(result.value);
          done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Product content saved.', 'ai-content-image-seo'));
        }
      } else if (target === 'tags') {
        if (isEditor && (0,_classic_editor__WEBPACK_IMPORTED_MODULE_6__.addTagsToForm)(selected)) {
          done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Tags added. Click "Update" to save the product.', 'ai-content-image-seo'));
        } else {
          await saveDirect(selected, {
            mode: 'append'
          });
          done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Tags added to the product.', 'ai-content-image-seo'));
        }
      } else if (target === 'categories') {
        const res = await saveDirect(selected, {
          mode: 'append'
        });
        if (isEditor) {
          (0,_classic_editor__WEBPACK_IMPORTED_MODULE_6__.checkCategoriesInForm)(res.terms || []);
        }
        done((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Categories assigned.', 'ai-content-image-seo'));
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
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO metadata saved to %s.', 'ai-content-image-seo'), (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().seoPluginLabel));
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
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Choose a title', 'ai-content-image-seo'),
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
            children: target === 'tags' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Select tags to add', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Select categories to assign', 'ai-content-image-seo')
          }), result.options.map(option => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CheckboxControl, {
            __nextHasNoMarginBottom: true,
            label: target === 'categories' && result.existing && !result.existing[option] ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %s: category name. */
            (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('%s (new category)', 'ai-content-image-seo'), option) : option,
            checked: selected.includes(option),
            onChange: checked => setSelected(prev => checked ? [...prev, option] : prev.filter(o => o !== option))
          }, option))]
        }), target === 'categories' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
          className: "description",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Categories are never assigned automatically. Only the categories you select are added.', 'ai-content-image-seo')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ResultActions, {
          onUse: selected.length ? use : null,
          useLabel: target === 'tags' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Add Selected Tags', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Assign Selected Categories', 'ai-content-image-seo'),
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
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('SEO Title', 'ai-content-image-seo'),
          value: result.seo_title,
          onChange: v => setResult({
            ...result,
            seo_title: v
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextareaControl, {
          __nextHasNoMarginBottom: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Meta Description', 'ai-content-image-seo'),
          value: result.meta_description,
          onChange: v => setResult({
            ...result,
            meta_description: v
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Focus Keyword', 'ai-content-image-seo'),
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
          useLabel: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Save SEO Metadata', 'ai-content-image-seo'),
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
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Original', 'ai-content-image-seo')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.HtmlPreview, {
          html: original
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
        className: "ai-cis-label",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI Result', 'ai-content-image-seo')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.HtmlPreview, {
        html: result.value
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ResultActions, {
        onUse: use,
        useLabel: isEditor ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Insert into Editor', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Save to Product', 'ai-content-image-seo'),
        busy: saving,
        copyText: (0,_api__WEBPACK_IMPORTED_MODULE_4__.htmlToText)(result.value),
        onRegenerate: () => generate(target),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.CopyButton, {
          text: result.value,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Copy HTML', 'ai-content-image-seo')
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
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Tone', 'ai-content-image-seo'),
        value: tone,
        options: (0,_api__WEBPACK_IMPORTED_MODULE_4__.data)().options.tones,
        onChange: setTone
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.SelectControl, {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Language', 'ai-content-image-seo'),
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

const asText = s => [s.summary, s.pros?.length ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Pros', 'ai-content-image-seo') + ':\n' + s.pros.map(p => '✓ ' + p).join('\n') : '', s.cons?.length ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Cons', 'ai-content-image-seo') + ':\n' + s.cons.map(c => '• ' + c).join('\n') : ''].filter(Boolean).join('\n\n');
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
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Pros', 'ai-content-image-seo')
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
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Cons', 'ai-content-image-seo')
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
      (0,_wordpress_a11y__WEBPACK_IMPORTED_MODULE_3__.speak)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Review summary generated.', 'ai-content-image-seo'));
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
      setNotice(info?.display ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Summary saved. It is shown above the reviews on the product page.', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Summary saved. Enable "Show review summary on product pages" in Settings, or use the [ai_cis_review_summary] shortcode.', 'ai-content-image-seo'));
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
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No reviews yet.', 'ai-content-image-seo'),
      text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('A summary can be generated once this product has approved customer reviews. Summaries only use real review content.', 'ai-content-image-seo')
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
      children: [info && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
        className: "description",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.sprintf)(/* translators: %d: number of reviews. */
        (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__._n)('Based on %d approved review. Only review text and star ratings are sent to the AI, never reviewer names or emails.', 'Based on %d approved reviews. Only review text and star ratings are sent to the AI, never reviewer names or emails.', info.review_count, 'ai-content-image-seo'), info.review_count)
      }), info?.saved && !result && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
          className: "ai-cis-label",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Saved summary', 'ai-content-image-seo')
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
          children: info?.saved ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate New Summary', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate Review Summary', 'ai-content-image-seo')
        })
      })]
    }), busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.Loading, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components__WEBPACK_IMPORTED_MODULE_5__.ErrorNotice, {
      error: error,
      onDismiss: () => setError(null)
    }), result && !busy && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
      className: "ai-cis-result",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
        className: "ai-cis-label",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI Result', 'ai-content-image-seo')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.TextareaControl, {
        __nextHasNoMarginBottom: true,
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Summary', 'ai-content-image-seo'),
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
        useLabel: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Save Summary', 'ai-content-image-seo'),
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

/***/ "@wordpress/compose"
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["compose"];

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
  !*** ./src/admin/index.js ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _common_api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/api */ "./src/common/api.js");
/* harmony import */ var _pages_dashboard__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages/dashboard */ "./src/admin/pages/dashboard.js");
/* harmony import */ var _pages_content_ai__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pages/content-ai */ "./src/admin/pages/content-ai.js");
/* harmony import */ var _pages_image_ai__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./pages/image-ai */ "./src/admin/pages/image-ai.js");
/* harmony import */ var _pages_seo__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./pages/seo */ "./src/admin/pages/seo.js");
/* harmony import */ var _pages_woocommerce__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./pages/woocommerce */ "./src/admin/pages/woocommerce.js");
/* harmony import */ var _pages_usage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./pages/usage */ "./src/admin/pages/usage.js");
/* harmony import */ var _pages_settings__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./pages/settings */ "./src/admin/pages/settings.js");
/* harmony import */ var _pages_onboarding__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./pages/onboarding */ "./src/admin/pages/onboarding.js");
/* harmony import */ var _common_ai_cis_scss__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../common/ai-cis.scss */ "./src/common/ai-cis.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__);
/**
 * Admin app entry: renders the page matching data-view.
 */













const VIEWS = {
  dashboard: _pages_dashboard__WEBPACK_IMPORTED_MODULE_3__["default"],
  content: _pages_content_ai__WEBPACK_IMPORTED_MODULE_4__["default"],
  image: _pages_image_ai__WEBPACK_IMPORTED_MODULE_5__["default"],
  seo: _pages_seo__WEBPACK_IMPORTED_MODULE_6__["default"],
  woocommerce: _pages_woocommerce__WEBPACK_IMPORTED_MODULE_7__["default"],
  usage: _pages_usage__WEBPACK_IMPORTED_MODULE_8__["default"],
  settings: _pages_settings__WEBPACK_IMPORTED_MODULE_9__["default"]
};
const TITLES = {
  dashboard: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Dashboard', 'ai-content-image-seo'),
  content: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Content AI', 'ai-content-image-seo'),
  image: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Image AI', 'ai-content-image-seo'),
  seo: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('SEO Assistant', 'ai-content-image-seo'),
  woocommerce: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('WooCommerce AI', 'ai-content-image-seo'),
  usage: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Usage', 'ai-content-image-seo'),
  settings: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Settings', 'ai-content-image-seo')
};
function Header({
  view
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("header", {
    className: "ai-cis-header",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
      className: "ai-cis-header__brand",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("span", {
        className: "dashicons dashicons-superhero-alt",
        "aria-hidden": "true"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("span", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('AI Content & Image SEO', 'ai-content-image-seo')
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("h2", {
      className: "ai-cis-header__title",
      children: TITLES[view]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("span", {
      className: 'ai-cis-status ' + ((0,_common_api__WEBPACK_IMPORTED_MODULE_2__.data)().providerReady ? 'is-ok' : 'is-warn'),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("span", {
        className: 'dashicons ' + ((0,_common_api__WEBPACK_IMPORTED_MODULE_2__.data)().providerReady ? 'dashicons-yes-alt' : 'dashicons-warning'),
        "aria-hidden": "true"
      }), (0,_common_api__WEBPACK_IMPORTED_MODULE_2__.data)().providerReady ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('AI provider connected', 'ai-content-image-seo') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('No AI provider', 'ai-content-image-seo')]
    })]
  });
}
function App({
  view
}) {
  const params = new window.URLSearchParams(window.location.search);
  const forceSetup = params.get('setup') === '1';
  if (view === 'dashboard' && ((0,_common_api__WEBPACK_IMPORTED_MODULE_2__.data)().onboarding || forceSetup) && (0,_common_api__WEBPACK_IMPORTED_MODULE_2__.data)().isManager) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_pages_onboarding__WEBPACK_IMPORTED_MODULE_10__["default"], {});
  }
  const View = VIEWS[view] || _pages_dashboard__WEBPACK_IMPORTED_MODULE_3__["default"];
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)("div", {
    className: "ai-cis-app",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(Header, {
      view: view
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(View, {})]
  });
}
const mount = () => {
  const root = document.getElementById('ai-cis-admin-root');
  if (root) {
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createRoot)(root).render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(App, {
      view: root.dataset.view || 'dashboard'
    }));
  }
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
})();

/******/ })()
;
//# sourceMappingURL=admin.js.map