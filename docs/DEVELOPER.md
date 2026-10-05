# Developer Guide — WBD Content & Image SEO Assistant

Prefixes: classes `AI_CIS_`, functions/options/hooks `ai_cis_`, REST namespace `ai-cis/v1`, text domain `wbd-content-image-seo-assistant`.

## Architecture

```
wbd-content-image-seo-assistant.php          Bootstrap: constants, autoloader, activation hooks
includes/
  class-ai-cis-autoloader.php     AI_CIS_Foo_Bar → class-ai-cis-foo-bar.php
  class-ai-cis-plugin.php         Wires modules; frontend loads only tiny hooks
  class-ai-cis-settings.php       Options, sanitization, encrypted API keys
  class-ai-cis-usage-manager.php  Monthly usage, limits, idempotent counting
  class-ai-cis-ai-manager.php     Provider registry, run(), JSON parsing, friendly errors
  class-ai-cis-prompts.php        Every prompt template (all filterable)
  class-ai-cis-content-generator.php  Posts/pages, rewrite, single fields, drafts
  class-ai-cis-image-optimizer.php    Context, vision payload, generate/apply, stats, filters
  class-ai-cis-queue.php          Bulk job + automation queue (Action Scheduler / WP-Cron / UI step)
  class-ai-cis-seo-integration.php    Yoast / Rank Math / AIOSEO adapters + fallback output
  class-ai-cis-media-library.php  Attachment field, row action, bulk action
  class-ai-cis-rest-api.php       All REST routes
  class-ai-cis-logger.php         WP_DEBUG-only logging (never secrets)
  providers/
    interface-ai-cis-provider-interface.php
    class-ai-cis-provider-base.php        Shared HTTP + error mapping
    class-ai-cis-provider-wp-ai-connector.php  wp_ai_client_prompt() adapter (feature-detected)
    class-ai-cis-provider-openai.php      Chat Completions
    class-ai-cis-provider-openrouter.php  OpenAI-compatible
    class-ai-cis-provider-gemini.php      generateContent
    class-ai-cis-provider-anthropic.php   Messages API
  integrations/
    class-ai-cis-woocommerce.php      Only initialised when WooCommerce is active
    class-ai-cis-review-summary.php
admin/class-ai-cis-admin.php      Menus, per-screen asset loading, onboarding redirect, privacy text
src/                              React sources (@wordpress/* packages)
  admin/ editor/ media/ product/ common/
build/                            Compiled bundles (wp-scripts)
uninstall.php                     Opt-in data removal, never deletes content
tests/                            Integration tests + mock AI server (not shipped to WordPress.org)
```

## Usage API

```php
AI_CIS_Usage_Manager::can_use( 'content' );            // bool
AI_CIS_Usage_Manager::consume( 'image', 1, $request_id ); // idempotent per request ID
AI_CIS_Usage_Manager::get_usage();                     // [ type => count ]
AI_CIS_Usage_Manager::get_limits();                    // [ type => limit ], 0 = unlimited
AI_CIS_Usage_Manager::get_remaining( 'product' );      // int|null (null = unlimited)
AI_CIS_Usage_Manager::get_bulk_batch_limit();          // int, 0 = unlimited
```

Types: `content`, `image`, `product`, `auto_image`, `review`. The period is `YYYY-MM` in the site timezone and is computed on every call, so the monthly reset never depends on WP-Cron. The previous 12 months are kept as history. Usage is consumed only after a successful AI response.

## Calling AI from your own code

```php
$result = AI_CIS_AI_Manager::run(
	'content',                      // usage type ('' = don't count)
	'Write a tagline for a bakery',
	array(
		'system'     => AI_CIS_Prompts::system( 'English' ),
		'json'       => false,        // true → decoded array returned
		'max_tokens' => 200,
		'request_id' => 'my-unique-id',
	)
);
if ( is_wp_error( $result ) ) {
	echo esc_html( $result->get_error_message() ); // always friendly text
}
```

## Adding a provider

```php
class My_Provider implements AI_CIS_Provider_Interface {
	public function get_id() { return 'my_provider'; }
	public function get_label() { return 'My Provider'; }
	public function is_available() { return true; }
	public function get_models() { return array( 'auto' => 'Auto' ); }
	public function generate( $prompt, $args = array() ) { /* return string|WP_Error */ }
}
add_filter( 'ai_cis_provider_classes', function ( $classes ) {
	$classes['my_provider'] = 'My_Provider';
	return $classes;
} );
```

Return `WP_Error` codes `ai_cis_invalid_key`, `ai_cis_rate_limit`, `ai_cis_timeout`, `ai_cis_malformed_response` or `ai_cis_provider_error` and the manager maps them to friendly messages.

## Filters

| Filter | Purpose |
|---|---|
| `ai_cis_monthly_ai_limit` | Monthly content generation limit (0 = unlimited) |
| `ai_cis_monthly_image_limit` | Monthly image metadata limit |
| `ai_cis_monthly_product_limit` | Monthly WooCommerce product limit |
| `ai_cis_monthly_auto_image_limit` | Monthly automatic optimization limit |
| `ai_cis_monthly_review_limit` | Monthly review summary limit |
| `ai_cis_bulk_batch_limit` | Max images per bulk job |
| `ai_cis_can_use` | Final say on whether a usage type may be consumed `( $allowed, $type, $amount )` |
| `ai_cis_default_settings` | Default settings array |
| `ai_cis_languages` | Output languages shown in the UI |
| `ai_cis_tones`, `ai_cis_content_types`, `ai_cis_lengths`, `ai_cis_rewrite_actions` | UI option lists and rewrite instructions |
| `ai_cis_system_prompt` | Base system instruction `( $system, $language )` |
| `ai_cis_content_prompt` | Post/page generation prompt `( $prompt, $args )` |
| `ai_cis_rewrite_prompt` | Rewrite prompt `( $prompt, $content, $action )` |
| `ai_cis_field_prompt` | Title/excerpt/keyword prompts `( $prompt, $field, $context )` |
| `ai_cis_seo_prompt`, `ai_cis_seo_analysis_prompt` | SEO prompts `( $prompt, $context )` |
| `ai_cis_image_metadata_prompt` | Image prompt `( $prompt, $context, $style )` |
| `ai_cis_product_description_prompt`, `ai_cis_product_short_description_prompt`, `ai_cis_product_title_prompt`, `ai_cis_product_tags_prompt`, `ai_cis_product_categories_prompt`, `ai_cis_product_seo_prompt`, `ai_cis_product_improve_prompt` | Product prompts `( $prompt, $product, $context )` |
| `ai_cis_review_summary_prompt` | Review prompt `( $prompt, $product_name, $reviews )` |
| `ai_cis_before_generate_prompt` | Last change to any prompt `( $prompt, $usage_type, $args )` |
| `ai_cis_generation_result` | Filter any AI result `( $output, $usage_type, $prompt )` |
| `ai_cis_image_context` | Context sent for an image `( $context, $attachment_id )` |
| `ai_cis_product_context` | Product context `( $context, $product )` |
| `ai_cis_send_image_to_provider` | Send the image file (vision) `( $send, $attachment_id )` |
| `ai_cis_review_summary_max_reviews` | Max reviews summarized (default 60) |
| `ai_cis_provider_classes` | Register/replace providers |
| `ai_cis_provider_model` | Model used per request `( $model, $provider, $args )` |
| `ai_cis_provider_models` | Model list per provider |
| `ai_cis_provider_request_args` | HTTP args for provider requests |
| `ai_cis_openai_base_url`, `ai_cis_openrouter_base_url`, `ai_cis_gemini_base_url`, `ai_cis_anthropic_base_url` | API base URLs (gateways/proxies) |
| `ai_cis_detected_seo_plugin` | Force `yoast`, `rankmath`, `aioseo` or `''` |
| `ai_cis_bulk_capability` | Capability for bulk jobs (default `edit_others_posts`) |
| `ai_cis_bulk_chunk_size` | Images per queue run (default 5) |
| `ai_cis_queue_time_budget` | Seconds per queue run (default 20) |
| `ai_cis_auto_optimize_image` | Skip automation for specific uploads `( $queue, $attachment_id )` |
| `ai_cis_admin_data` | Data passed to admin JS (never add secrets) |
| `ai_cis_enable_debug_log` | Disable debug logging even when WP_DEBUG is on |

## Actions

| Action | Arguments |
|---|---|
| `ai_cis_loaded` | `AI_CIS_Plugin $plugin` |
| `ai_cis_usage_consumed` | `$type, $amount` |
| `ai_cis_image_metadata_applied` | `$attachment_id, $updated_fields` |
| `ai_cis_seo_saved` | `$post_id, $data, $seo_plugin` |

## Constants

`AI_CIS_OPENAI_API_KEY`, `AI_CIS_GEMINI_API_KEY`, `AI_CIS_ANTHROPIC_API_KEY`, `AI_CIS_OPENROUTER_API_KEY` — define in wp-config.php to keep keys out of the database.

## REST API (`/wp-json/ai-cis/v1`)

All routes require cookie authentication with the `X-WP-Nonce` header (sent automatically by `@wordpress/api-fetch`) or application passwords. Errors are `{ code, message, data: { status, details? } }`; `details` is only included for administrators.

| Method & route | Capability | Body / query | Returns |
|---|---|---|---|
| `GET /usage` | edit_posts | – | report: period, reset_date, types{used,limit,remaining,percent}, history, auto_queue |
| `POST /usage/reset` | manage_options | – | report |
| `GET /settings` | manage_options | – | settings (keys masked) + provider status |
| `POST /settings` | manage_options | `settings{…, api_keys{provider: key|"__delete__"}}` | same as GET |
| `POST /onboarding` | manage_options | `settings`, `skip` | settings |
| `POST /provider/test` | manage_options | `provider` | `{ success, message }` (not counted) |
| `POST /provider/models` | manage_options | `provider` | `{ models }` |
| `POST /generate-content` | edit_posts | `topic`*, `content_type`, `tone`, `length`, `language`, `keywords`, `instructions`, `post_type`, `request_id` | title, content, excerpt, seo_title, meta_description, keywords |
| `POST /rewrite` | edit_posts | `content`*, `action`, `language`, `request_id` | original, result, is_html, action |
| `POST /generate-field` | edit_posts / edit_post | `field` (title, excerpt, seo_title, meta_description, keywords), `title`, `content`, `post_id` | `{ value }` or `{ options }` |
| `POST /create-draft` | create_posts for type | title, content, excerpt, post_type, seo fields | post_id, edit_link |
| `GET /items` | edit_posts | `type`, `search`, `page` | editable posts/pages/products |
| `GET /items/{id}` | edit_post | – | content, seo, images |
| `POST /items/{id}` | edit_post | `field`, `value`, `mode` (replace/append) | saved |
| `GET /seo/status` | edit_posts | – | detected plugin |
| `POST /seo/generate` | edit_post / edit_posts | `post_id` or `title`+`content`, `keyword` | seo_title, meta_description, focus_keyword, keywords |
| `POST /seo/analyze` | edit_post / edit_posts | same | score, summary, suggestions, checks |
| `POST /seo/save` | edit_post | `post_id`*, `seo_title`, `meta_description`, `focus_keyword` | saved, target |
| `POST /generate-image-metadata` | upload_files + edit_post | `attachment_id`*, `fields[]`, `image_type`, `style`, `language`, `request_id` | values, image_type, used_ai, vision, current |
| `POST /apply-image-metadata` | upload_files + edit_post | `attachment_id`*, `values{}`, `fields[]`, `overwrite`, `image_type` | updated, skipped, current |
| `GET /images` | upload_files | `filter`, `search`, `page`, `per_page` | items, total, total_pages |
| `GET /images/stats` | upload_files | – | total, missing_alt, missing_title, missing_caption, missing_description, decorative |
| `GET /images/{id}` | edit_post | – | item |
| `POST /bulk/start` | bulk capability | `ids[]` or `filter`, `fields[]`, `overwrite` | job status |
| `GET /bulk/status` | upload_files | – | job status |
| `POST /bulk/step` | bulk capability | – | processes one chunk, job status |
| `POST /bulk/{pause,resume,cancel}` | bulk capability | – | job status |
| `GET /products` | edit_products | `search`, `page` | products |
| `POST /generate-product-content` | edit_post (product) | `product_id`*, `field`, `tone`, `language`, `overrides{name,description,short_description}`, `request_id` | value / options / seo fields |
| `POST /apply-product-content` | edit_post (product) | `product_id`*, `field`, `value`, `mode` | saved (+ terms for categories) |
| `POST /review-summary` | edit_post (product) | `product_id`* | summary, pros, cons, review_count |
| `GET /review-summary/{product_id}` | edit_post (product) | – | saved summary, review_count |
| `POST /review-summary/save` | edit_post (product) | product_id, summary, pros, cons | saved summary |

WooCommerce routes return `400 ai_cis_woocommerce_inactive` when WooCommerce is not active.

## Data storage

| Key | Type | Autoload | Notes |
|---|---|---|---|
| `ai_cis_settings` | option | no | settings |
| `ai_cis_api_keys` | option | no | sodium secretbox encrypted with key derived from `wp_salt('auth')` |
| `ai_cis_usage` | option | no | period, counts, history, recent request IDs |
| `ai_cis_bulk_job`, `ai_cis_auto_queue`, `ai_cis_auto_limit_hit` | option | no | queue state |
| `_ai_cis_image_type`, `_ai_cis_status`, `_ai_cis_generated` | post meta | – | attachment flags |
| `_ai_cis_seo_title`, `_ai_cis_meta_description`, `_ai_cis_focus_keyword` | post meta | – | only when no SEO plugin |
| `_ai_cis_review_summary` | post meta | – | confirmed summaries |

No custom tables.

## Building assets

```bash
npm install
npm run build      # production bundles in build/
npm run start      # watch mode
npm run lint:js
npm run lint:css
```
