# WBD Content & Image SEO Assistant

AI-powered content generation, image metadata optimization, SEO assistance, and accessibility tools for WordPress and WooCommerce.

- **Slug / text domain:** `wbd-content-image-seo-assistant`
- **Requires:** WordPress 6.6+, PHP 7.4+
- **Optional:** WooCommerce, Yoast SEO / Rank Math / All in One SEO, WordPress AI Connectors (WP 7.0+)
- **License:** GPL-2.0-or-later

**Product principle:** all features are free; usage is tracked and limits are optional (default: unlimited). No feature gates, no upsells, no fake premium placeholders.

---

## 1. Installation

1. In WordPress: **Plugins → Add New → Upload Plugin**, choose `wbd-content-image-seo-assistant.zip`, **Install**, **Activate**.
2. The setup wizard opens: choose provider → API key → default language → alt-text style → **Finish Setup** (or **Skip setup**).
3. Open **AI Content & SEO** in the admin menu.

From source: `npm install && npm run build`, then copy the folder to `wp-content/plugins/`.

## 2. AI provider setup

| Provider | Where to get a key | Notes |
|---|---|---|
| WordPress AI Connector | Settings → Connectors (WordPress 7.0+) | No key in this plugin. Uses `wp_ai_client_prompt()`; detected at runtime, never required. |
| OpenAI | https://platform.openai.com/api-keys | Default model `gpt-4o-mini`. Vision supported. |
| Google Gemini | https://aistudio.google.com/apikey | Default model `gemini-2.5-flash`. |
| Anthropic | https://console.anthropic.com/settings/keys | Default model `claude-haiku-4-5`. |
| OpenRouter | https://openrouter.ai/keys | Default `openrouter/auto`. |

Settings → **AI Provider**: pick the provider, paste the key, choose a model (or **Load models from provider** / custom model ID), set temperature, max tokens and timeout, then **Save Settings** and **Test Connection** (tests are not counted as usage).

Keys are encrypted at rest with the site salts, never sent to the browser, never returned by REST. Alternatively define them in `wp-config.php`:

```php
define( 'AI_CIS_OPENAI_API_KEY', 'sk-...' );
define( 'AI_CIS_GEMINI_API_KEY', '...' );
define( 'AI_CIS_ANTHROPIC_API_KEY', '...' );
define( 'AI_CIS_OPENROUTER_API_KEY', '...' );
```

## 3. Features (V1 checklist)

| Area | Features |
|---|---|
| Content | Post & page generation, titles, excerpts, rewrite / improve / expand / shorten / grammar / SEO / persuasive / simplify / professional / friendly, Original vs AI Result, Replace / Insert / Copy / Regenerate, create draft, block editor sidebar |
| WooCommerce | Product title, long description, short description, tags, category suggestions (confirmation required), SEO title & meta, improve existing description, AI review summary (+ shortcode / product page display) |
| Images | Alt text, title, caption, description, vision + context, Balanced / Accessibility First / SEO styles, decorative images, Media Library button + row action + bulk action, Bulk Optimizer with queue, automatic new-image optimization |
| SEO | SEO title, meta description, focus keyword & keyword suggestions, content analysis, image SEO report, Google preview, Yoast / Rank Math / AIOSEO adapters, built-in fallback output |
| AI | Provider abstraction, WP AI Connector, OpenAI, Gemini, Anthropic, OpenRouter, model selection, custom prompts, filterable prompts |
| Usage | Monthly tracking per type, optional limits (0 = unlimited), dashboard & usage page, monthly reset in site timezone, history, developer filters |
| UX | Loading states, friendly errors, empty states, preview before save, regenerate, copy, apply selected, onboarding wizard, accessible UI |

## 4. File structure

```
wbd-content-image-seo-assistant/
├── wbd-content-image-seo-assistant.php
├── uninstall.php
├── readme.txt
├── admin/class-ai-cis-admin.php
├── includes/
│   ├── class-ai-cis-autoloader.php      class-ai-cis-plugin.php
│   ├── class-ai-cis-settings.php        class-ai-cis-usage-manager.php
│   ├── class-ai-cis-ai-manager.php      class-ai-cis-prompts.php
│   ├── class-ai-cis-content-generator.php
│   ├── class-ai-cis-image-optimizer.php class-ai-cis-queue.php
│   ├── class-ai-cis-seo-integration.php class-ai-cis-media-library.php
│   ├── class-ai-cis-rest-api.php        class-ai-cis-logger.php
│   ├── providers/  (interface, base, wp-ai-connector, openai, openrouter, gemini, anthropic)
│   └── integrations/ (woocommerce, review-summary)
├── src/        React sources: admin/ (pages), editor/, media/, product/, common/
├── build/      Compiled JS/CSS + .asset.php dependency files
├── languages/  wbd-content-image-seo-assistant.pot
├── docs/DEVELOPER.md   hooks, filters, REST API, storage
└── tests/      integration suite, mock AI server, browser E2E (dev only)
```

## 5. Developer hooks & REST API

See [`docs/DEVELOPER.md`](docs/DEVELOPER.md) for every filter/action, the usage API, how to add a provider, and the full REST reference (`/wp-json/ai-cis/v1`).

## 6. Testing

**Static analysis**

```bash
phpcs                      # WordPress + WordPress-Extra + WordPress-Docs + PHPCompatibilityWP (7.4+)
npm run lint:js
npm run lint:css
```

**Integration suite** — runs inside a real WordPress (with or without WooCommerce) against a local mock of the OpenAI, Anthropic, Gemini and OpenRouter APIs so request/response handling, errors, timeouts and usage counting are exercised end to end:

```bash
export AI_CIS_MOCK_LOG=/tmp/ai-cis-mock.jsonl
python3 tests/mock-ai-server.py 9999 &
cp tests/mu-plugin-mock-endpoints.php wp-content/mu-plugins/
wp eval-file wp-content/plugins/wbd-content-image-seo-assistant/tests/run-tests.php
```

Covers: usage (within limit, after limit, monthly reset, regeneration counting, duplicate request IDs, bulk limit, filters); security (logged-out, wrong role, other user's content, invalid input, key encryption, keys never in REST/JS); AI (provider unavailable, invalid key, timeout, rate limit, 500, malformed JSON, unexpected shape, failures not counted, all 4 HTTP adapters); content (generation, sanitization, prompt filters, custom prompts, all rewrite actions, never auto-overwrite, drafts); SEO (generate, confirm-to-save, analysis, Yoast/Rank Math/AIOSEO adapters, frontend fallback); images (vision, context, styles, preserve vs overwrite, apply selected only, decorative, stats, filters, bulk queue, pause on limit, resume, automation quota, no retries, media library hooks); WooCommerce (context, all fields, categories never auto-assigned, apply, review summary privacy, shortcode, WooCommerce inactive); onboarding; uninstall.

**Browser E2E** (Playwright): `python3 tests/e2e-browser.py <product_id> <attachment_id>` walks through onboarding, every admin page, the block editor sidebar, the product editor meta box and Media Library modals, and fails on any JavaScript error.

Results for this build: PHPCS 0 errors / 0 warnings; ESLint and Stylelint clean; 164/164 integration tests (WordPress 7.2-alpha + WooCommerce 11.1), 140/140 (WooCommerce inactive), 140/140 on WordPress 6.6; 30/30 browser tests, 8/8 browser smoke tests on WordPress 6.6; WordPress AI Connector verified end to end with the official OpenAI connector plugin (text + vision).

## 7. WordPress.org compliance checklist

- [x] GPL-2.0-or-later, all bundled code GPL compatible; no third-party PHP libraries.
- [x] Human-readable source for all minified JS/CSS in `src/` with build instructions.
- [x] No tracking, telemetry, ads, or calls home; no requests to the plugin author.
- [x] External services documented in readme.txt with terms & privacy links; requests only on user action, explicit admin action or opt-in automation.
- [x] No locked features, no "upgrade" prompts, no admin nags; notices only on plugin screens.
- [x] No obfuscated or encrypted code (base64 is used only to encode encrypted API keys and image bytes for vision APIs — annotated).
- [x] No remote code execution, no `eval`, no loading external JS/CSS (all assets local, WordPress script handles).
- [x] Unique prefixes (`AI_CIS_`, `ai_cis_`, `ai-cis/v1`), text domain matches slug, no `load_plugin_textdomain` needed.
- [x] `Requires at least`, `Requires PHP`, `Tested up to`, `Stable tag` set; plugin headers match readme.
- [x] Uninstall via `uninstall.php`, data deletion opt-in, user content never deleted.
- [x] No custom tables; options not autoloaded.

## 8. Security checklist

- [x] Every REST route has a `permission_callback` with object-level checks (`edit_post` on the specific post/attachment/product).
- [x] Cookie-authenticated REST requires a valid `wp_rest` nonce (verified: no nonce → 401, bad nonce → 403).
- [x] Media bulk action re-verifies the `bulk-media` nonce and capability.
- [x] All args typed, enum-validated and sanitized (`sanitize_text_field`, `sanitize_textarea_field`, `absint`, `wp_kses_post`, custom sanitizers).
- [x] AI output sanitized before display and storage (`wp_kses_post` after removing script/style/iframe blocks; plain fields sanitized); React renders only server-sanitized HTML.
- [x] Output escaped in PHP (`esc_html`, `esc_attr`, `esc_url`, `wp_kses_post`).
- [x] API keys encrypted at rest, write-only in the UI, masked hint only, never logged, never in REST/JS/HTML.
- [x] Raw provider errors never shown in messages; technical details only for administrators.
- [x] Direct SQL only for aggregate counts/listing with fixed fragments and `$wpdb->prepare()` for values.
- [x] Customer PII never sent; review summaries send only review text and star ratings of approved reviews.
- [x] Debug log only when `WP_DEBUG` is true and strips key/token/secret/password/email fields.
- [x] `ABSPATH` guard in every PHP file.

## 9. Performance checklist

- [x] Frontend: no scripts or styles; only the SEO fallback hooks (when no SEO plugin) and review-summary tab wrapper (when enabled).
- [x] Admin bundles load only on plugin pages; editor bundle only in the block editor; media bundle only with the media modal; product bundle only on product edit screens.
- [x] WooCommerce code initialised only when WooCommerce is active; providers instantiated lazily.
- [x] Bulk work runs in small chunks with a time budget via Action Scheduler (WooCommerce) or WP-Cron, with a lock to avoid overlap; never hundreds of images in one request.
- [x] Images skipped without an AI call when nothing would change; vision uses an intermediate size (≤4 MB).
- [x] Options are not autoloaded; library stats cached briefly; post caches primed for listings.

## 10. Uninstall behavior

- Deactivation: unschedules background jobs; keeps everything else.
- Deletion (default): stops background jobs and keeps settings and data.
- Deletion with **Settings → Privacy & Data → Delete plugin settings on uninstall** enabled: removes `ai_cis_*` options (settings, encrypted keys, usage, queue state), plugin transients and internal attachment flags (`_ai_cis_status`, `_ai_cis_generated`, `_ai_cis_image_type`).
- Never deleted: posts, pages, products, media, alt text/titles/captions/descriptions, generated content, SEO metadata, saved review summaries.

## 11. Changelog

### 1.0.1
- Minor bug fixes and compliance updates.

### 1.0.0
- Initial release with all V1 features listed above.
