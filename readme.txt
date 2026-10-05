=== WBD Content & Image SEO Assistant ===
Contributors: wpbranddigital25
Tags: ai, alt text, seo, woocommerce, content generator
Requires at least: 6.5
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

AI-powered content generation, image metadata optimization, SEO assistance, and accessibility tools for WordPress and WooCommerce.

== Description ==

WBD Content & Image SEO Assistant brings AI writing, accessible image metadata, SEO metadata and WooCommerce product content into one plugin, using the AI provider you choose.

**Every feature is free. Nothing is locked.** There are no "Pro-only" features, no upgrade prompts and no account to create with the plugin author. Usage is tracked so you can see how much AI you use, and site owners can optionally set monthly caps (0 = unlimited, the default).

= Content AI =

* Generate complete posts and pages: title, content, excerpt, SEO title, meta description and keywords.
* Choose content type, tone, length, language (including a custom language) and keywords.
* Content Rewriter: Improve Writing, Fix Grammar, Make SEO Friendly, Make More Persuasive, Shorten, Expand, Simplify, Professional Tone, Friendly Tone.
* Side-by-side Original vs AI Result. Your content is never overwritten automatically: Replace, Insert or Copy only when you choose.
* Block editor sidebar "AI Content Assistant": improve, rewrite, expand, shorten, fix grammar or SEO-optimize the selected block, generate content, suggest titles, write excerpts and create SEO metadata.

= Image AI =

* Generate alt text, image title, caption and description from the image itself (vision) plus context: filename, parent post, WooCommerce product name, description and category.
* Alt text styles: Balanced, Accessibility First, SEO Focused.
* Decorative image support: decorative images keep an empty alt attribute and never trigger an AI request.
* Media Library integration: "Generate AI Metadata" in attachment details, list rows and a bulk action.
* Choose exactly which fields to apply. Existing metadata is kept unless you enable "Overwrite existing metadata".
* Bulk Optimizer with library scan (missing alt text, titles, descriptions), filters, selection and a resumable background queue with progress, pause, resume and cancel.
* Automatic optimization of new uploads (optional) that respects its monthly quota and never retries failed images automatically.

= SEO Assistant =

* SEO title, meta description and focus keyword generation with a Google search preview.
* Keyword suggestions and AI content optimization review with on-page checks.
* Image SEO report for any post (images missing alt text).
* Works with Yoast SEO, Rank Math and All in One SEO when installed. Without an SEO plugin, metadata is stored by this plugin and output in your page head. Nothing is saved until you confirm.

= WooCommerce AI =

Loaded only when WooCommerce is active.

* AI Product Assistant in the product editor and on a dedicated admin page.
* Product title, long description (introduction, features, benefits, use cases, conclusion), short description, tags, category suggestions (never auto-assigned), SEO title and meta description, and "Improve existing content".
* Uses product name, descriptions, SKU, price, categories, tags, attributes, brand and image info. Never sends customer information.
* AI Review Summary with pros and cons, built only from real approved reviews (review text and star ratings only — never reviewer names, emails or IP addresses). Show it above product reviews or anywhere with the `[ai_cis_review_summary]` shortcode.

= AI providers =

* WordPress AI Connector (uses the provider configured in Settings → Connectors on WordPress 7.0+; detected automatically)

Pick a model per provider, load the current model list from the provider, or enter a custom model ID. Temperature, max tokens and timeout are configurable. A "Test Connection" button verifies your setup.

= Built for site owners and developers =

* Monthly usage tracking per type with automatic monthly reset (site timezone, no cron dependency), history and optional limits.
* Filterable prompts (`ai_cis_*_prompt`), limits (`ai_cis_monthly_*_limit`), providers (`ai_cis_provider_classes`) and more.
* Secure REST API (`ai-cis/v1`) with capability checks on every route.
* Translation-ready, accessible admin UI built with WordPress components.
* Lightweight: no assets load on the frontend, admin scripts load only on the screens that use them.

== Development ==

Public source code repository:
https://github.com/wpbranddigital/wbd-content-image-seo-assistant

Build Instructions:

1. npm install
2. npm run build
3. npm run start (development)
WBD Content & Image SEO Assistant is built using @wordpress/scripts.

== External services ==

This plugin connects to a third-party AI service to generate text. Requests are only sent when a logged-in user clicks a generate/analyze button, when the administrator clicks "Test Connection" or "Load models from provider", or when the administrator has enabled automatic optimization of new images. No data is ever sent to the plugin author.

Only the provider selected in Settings → AI Provider is contacted. Depending on the feature, the request contains: the prompt instructions; the text you selected or the post/page/product content being processed; for image features a resized copy of the image (can be disabled) with its filename, title, caption and parent post or product details; for review summaries the text and star rating of approved reviews. Customer data, reviewer names, emails, IP addresses, passwords and payment information are never sent.

* **WordPress AI Connector** – sends requests through the WordPress AI Client to the provider you configured in Settings → Connectors. That provider's terms and privacy policy apply.

Provider usage may be billed by the provider.

== Installation ==

1. Upload the plugin through Plugins → Add New → Upload Plugin, or install it from the WordPress.org directory.
2. Activate it. The setup wizard opens (you can skip it).
3. Use the WordPress AI Connector on WordPress 7.0+.
4. Choose your default language and alt text style.
5. Open **AI Content & SEO** in the admin menu.

== Frequently Asked Questions ==

= Are any features locked or paid? =

No. Every feature is available. Usage is tracked and the site owner can optionally set monthly limits under Settings → Usage Limits (0 = unlimited).

= Do I need an AI account? =

Yes, with a provider configured in WordPress' own Connectors screen. You never need an account with the plugin author.

= Will the plugin overwrite my content or metadata? =

No. Every AI result is shown as a preview first. Content is only replaced, inserted or saved when you click the button to do so. Image metadata is never overwritten unless you enable "Overwrite existing metadata". Categories are never assigned without confirmation.

= Does it work without WooCommerce or an SEO plugin? =

Yes. WooCommerce features appear only when WooCommerce is active. SEO metadata is stored by this plugin when no SEO plugin is installed.

= How are API keys stored? =

API keys are not used by this plugin directly; the WordPress AI Connector manages its own keys.

= How does bulk optimization work on large libraries? =

Images are processed a few at a time in the background using Action Scheduler (when WooCommerce is active) or WP-Cron. While the Bulk Optimizer page is open it also advances the queue directly. You can pause, resume or cancel at any time.

= What happens when I uninstall? =

By default settings are kept. Enable "Delete plugin settings on uninstall" in Settings → Privacy & Data to remove settings, API keys and usage data. Posts, products, media and generated content are never deleted.

= Where is the source code for the JavaScript? =

The unminified source is included in the `src/` folder. Build it with `npm install && npm run build`.

== Screenshots ==

1. Dashboard with real usage numbers and quick actions.
2. Content AI: generate a post with SEO metadata and Google preview.
3. Content Rewriter with Original vs AI Result.
4. Image AI: review and apply alt text, title, caption and description.
5. Bulk Optimizer with background progress.
6. SEO Assistant with Google preview and content analysis.
7. WooCommerce AI Product Assistant and review summaries.
8. Block editor AI Content Assistant sidebar.

== Changelog ==

= 1.0.1 =
* Fixed: Updated text domains, plugin slug, and resolved plugin review issues.

= 1.0.0 =
* Initial release: Content AI, Content Rewriter, Image AI with accessibility modes and decorative images, Media Library integration, Bulk Optimizer and automatic optimization, SEO Assistant with Yoast SEO / Rank Math / All in One SEO adapters, WooCommerce product AI and review summaries, five AI provider adapters, usage tracking with optional limits, REST API, block editor sidebar and setup wizard.

== Upgrade Notice ==

= 1.0.1 =
Minor bug fixes and compliance updates.

= 1.0.0 =
First release.
