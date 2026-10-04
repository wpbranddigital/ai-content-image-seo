<?php
/**
 * Integration test suite.
 *
 * Runs inside a real WordPress install with WP-CLI:
 *   wp eval-file wp-content/plugins/ai-content-image-seo/tests/run-tests.php
 *
 * Requires a mock AI server (tests/mock-ai-server.py) and the test mu-plugin
 * (tests/mu-plugin-mock-endpoints.php) that points provider base URLs at it.
 * This file is excluded from the WordPress.org build.
 *
 * @package AI_Content_Image_SEO
 */

// phpcs:disable

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$GLOBALS['ai_cis_t'] = array( 'pass' => 0, 'fail' => 0, 'failures' => array() );
$GLOBALS['ai_cis_mock_log'] = getenv( 'AI_CIS_MOCK_LOG' ) ? getenv( 'AI_CIS_MOCK_LOG' ) : dirname( ABSPATH ) . '/mock_requests.jsonl';

function t_ok( $cond, $name, $extra = '' ) {
	if ( $cond ) {
		$GLOBALS['ai_cis_t']['pass']++;
		echo "  \033[32m✓\033[0m {$name}\n";
	} else {
		$GLOBALS['ai_cis_t']['fail']++;
		$GLOBALS['ai_cis_t']['failures'][] = $name;
		echo "  \033[31m✗ {$name}\033[0m " . ( is_string( $extra ) ? $extra : wp_json_encode( $extra ) ) . "\n";
	}
}

function t_section( $name ) {
	echo "\n\033[1m{$name}\033[0m\n";
}

function t_rest( $method, $route, $params = array() ) {
	$request = new WP_REST_Request( $method, '/ai-cis/v1' . $route );
	if ( 'GET' === $method ) {
		$request->set_query_params( $params );
	} else {
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body( wp_json_encode( $params ) );
	}
	$response = rest_do_request( $request );
	return array( $response->get_status(), $response->get_data() );
}

function t_settings( $values ) {
	AI_CIS_Settings::update( $values );
}

function t_mock_log() {
	$mock_log = $GLOBALS['ai_cis_mock_log'];
	if ( ! file_exists( $mock_log ) ) {
		return array();
	}
	return array_map( 'json_decode', array_filter( explode( "\n", file_get_contents( $mock_log ) ) ) );
}

function t_clear_mock_log() {
	$mock_log = $GLOBALS['ai_cis_mock_log'];
	file_put_contents( $mock_log, '' );
}

function t_make_image( $name, $parent = 0, $title = null ) {
	$upload = wp_upload_dir();
	$path   = trailingslashit( $upload['path'] ) . $name;
	$img    = imagecreatetruecolor( 900, 700 );
	imagefill( $img, 0, 0, imagecolorallocate( $img, 20, 20, 20 ) );
	imagejpeg( $img, $path, 80 );
	imagedestroy( $img );
	$id = wp_insert_attachment(
		array(
			'post_mime_type' => 'image/jpeg',
			'post_title'     => null === $title ? pathinfo( $name, PATHINFO_FILENAME ) : $title,
			'post_status'    => 'inherit',
			'post_parent'    => $parent,
		),
		$path,
		$parent
	);
	require_once ABSPATH . 'wp-admin/includes/image.php';
	wp_update_attachment_metadata( $id, wp_generate_attachment_metadata( $id, $path ) );
	return $id;
}

function t_reset_usage() {
	delete_option( AI_CIS_Usage_Manager::OPTION );
}

// ---------------------------------------------------------------------------
// Setup.
// ---------------------------------------------------------------------------

$admin = get_user_by( 'login', 'admin' );
wp_set_current_user( $admin->ID );

$subscriber = get_user_by( 'login', 'ai_cis_sub' );
if ( ! $subscriber ) {
	$subscriber = get_user_by( 'id', wp_create_user( 'ai_cis_sub', wp_generate_password(), 'sub@example.com' ) );
}
$subscriber->set_role( 'subscriber' );

$author = get_user_by( 'login', 'ai_cis_author' );
if ( ! $author ) {
	$author = get_user_by( 'id', wp_create_user( 'ai_cis_author', wp_generate_password(), 'author@example.com' ) );
}
$author->set_role( 'author' );

delete_option( AI_CIS_Settings::OPTION );
delete_option( AI_CIS_Settings::KEYS );
delete_option( AI_CIS_Queue::JOB_OPTION );
delete_option( AI_CIS_Queue::AUTO_OPTION );
delete_option( AI_CIS_Queue::LIMIT_OPTION );
AI_CIS_Settings::flush_cache();
t_reset_usage();

// ---------------------------------------------------------------------------
t_section( 'Bootstrap & graceful degradation' );
// ---------------------------------------------------------------------------

t_ok( class_exists( 'AI_CIS_Plugin' ), 'Plugin loaded' );
t_ok( ! AI_CIS_AI_Manager::is_ready() || 'wp_ai_connector' === AI_CIS_Settings::get( 'provider' ), 'Defaults to WordPress AI Connector provider' );
$connector = AI_CIS_AI_Manager::get_provider( 'wp_ai_connector' );
t_ok( false === $connector->is_available() || $connector->api_exists(), 'WP AI Connector reports availability without fatal errors' );

t_settings( array( 'provider' => 'openai' ) );
list( $status, $body ) = t_rest( 'POST', '/generate-content', array( 'topic' => 'Coffee' ) );
t_ok( 400 === $status && 'ai_cis_no_provider' === $body['code'], 'No provider configured → friendly error', $body );
t_ok( false !== strpos( $body['message'], 'No AI provider configured' ), 'No-provider message text matches spec' );
t_ok( 0 === AI_CIS_Usage_Manager::get_usage()['content'], 'Failed request does not consume usage' );

// ---------------------------------------------------------------------------
t_section( 'Settings & API key security' );
// ---------------------------------------------------------------------------

list( $status, $body ) = t_rest( 'POST', '/settings', array( 'settings' => array( 'provider' => 'openai', 'api_keys' => array( 'openai' => 'sk-test-secret-123456' ), 'temperature' => 5, 'max_tokens' => 10 ) ) );
t_ok( 200 === $status, 'Admin can save settings' );
$raw_keys = get_option( AI_CIS_Settings::KEYS );
t_ok( isset( $raw_keys['openai'] ) && false === strpos( $raw_keys['openai'], 'sk-test-secret' ), 'API key is encrypted at rest' );
t_ok( 'sk-test-secret-123456' === AI_CIS_Settings::get_api_key( 'openai' ), 'API key decrypts server side' );
$json = wp_json_encode( $body );
t_ok( false === strpos( $json, 'sk-test-secret' ), 'API key never returned by REST', $json );
t_ok( '…3456' === $body['settings']['api_keys']['openai']['hint'], 'Only masked hint exposed' );
t_ok( 2.0 === (float) $body['settings']['temperature'] && 64 === (int) $body['settings']['max_tokens'], 'Numeric settings clamped' );
list( $status ) = t_rest( 'POST', '/settings', array( 'settings' => array( 'provider' => 'evil' ) ) );
t_ok( 'openai' === AI_CIS_Settings::get( 'provider' ), 'Unknown provider rejected by sanitizer' );
t_settings( array( 'temperature' => 0.7, 'max_tokens' => 1500, 'request_timeout' => 10 ) );

// Bootstrap data must not contain keys.
ob_start();
$reflect = new ReflectionMethod( 'AI_CIS_Admin', 'bootstrap_data' );
$reflect->setAccessible( true );
$boot = wp_json_encode( $reflect->invoke( null ) );
ob_end_clean();
t_ok( false === strpos( $boot, 'sk-test' ), 'Admin JavaScript bootstrap data has no API key' );

// ---------------------------------------------------------------------------
t_section( 'REST permissions & validation' );
// ---------------------------------------------------------------------------

wp_set_current_user( 0 );
list( $status ) = t_rest( 'GET', '/usage' );
t_ok( 401 === $status, 'Logged-out request rejected (401)', $status );
list( $status ) = t_rest( 'POST', '/generate-content', array( 'topic' => 'x' ) );
t_ok( 401 === $status, 'Logged-out generation rejected (401)' );

wp_set_current_user( $subscriber->ID );
list( $status ) = t_rest( 'POST', '/generate-content', array( 'topic' => 'x' ) );
t_ok( 403 === $status, 'Subscriber cannot generate content (403)', $status );
list( $status ) = t_rest( 'GET', '/images' );
t_ok( 403 === $status, 'Subscriber cannot list media (403)' );

wp_set_current_user( $author->ID );
list( $status ) = t_rest( 'GET', '/settings' );
t_ok( 403 === $status, 'Author cannot read settings (403)' );
list( $status ) = t_rest( 'POST', '/bulk/start', array( 'ids' => array( 1 ) ) );
t_ok( 403 === $status, 'Author cannot run bulk jobs (403)' );
$admin_post = wp_insert_post( array( 'post_title' => 'Admin Post', 'post_content' => 'Hello world', 'post_status' => 'publish', 'post_author' => $admin->ID ) );
list( $status ) = t_rest( 'POST', '/seo/save', array( 'post_id' => $admin_post, 'seo_title' => 'Hack' ) );
t_ok( 403 === $status, 'Author cannot edit SEO of another user’s post (403)' );
list( $status ) = t_rest( 'GET', '/items/' . $admin_post );
t_ok( 403 === $status, 'Author cannot read another user’s post content via /items (403)' );

wp_set_current_user( $admin->ID );
list( $status, $body ) = t_rest( 'POST', '/generate-content', array( 'topic' => '   ' ) );
t_ok( 400 === $status, 'Empty topic rejected (400)', $body );
list( $status ) = t_rest( 'POST', '/generate-content', array( 'topic' => 'x', 'tone' => 'evil' ) );
t_ok( 400 === $status, 'Invalid enum rejected (400)' );
list( $status ) = t_rest( 'POST', '/generate-image-metadata', array( 'attachment_id' => $admin_post ) );
t_ok( 403 === $status, 'Image endpoint rejects non-attachment IDs' );

// ---------------------------------------------------------------------------
t_section( 'AI providers (adapters against mock APIs)' );
// ---------------------------------------------------------------------------

foreach ( array( 'openai', 'anthropic', 'gemini', 'openrouter' ) as $provider_id ) {
	AI_CIS_Settings::update_api_keys( array( $provider_id => 'test-key-' . $provider_id ) );
	t_settings( array( 'provider' => $provider_id ) );
	list( $status, $body ) = t_rest( 'POST', '/provider/test', array( 'provider' => $provider_id ) );
	t_ok( 200 === $status && 'OK' === $body['reply'], "{$provider_id}: connection test succeeds", $body );
	list( $status, $body ) = t_rest( 'POST', '/rewrite', array( 'content' => 'Plain text', 'action' => 'grammar', 'request_id' => 'p-' . $provider_id ) );
	t_ok( 200 === $status && 'REWRITTEN: Plain text' === $body['result'], "{$provider_id}: generation works", $body );
	list( $status, $body ) = t_rest( 'POST', '/provider/models', array( 'provider' => $provider_id ) );
	t_ok( 200 === $status && count( $body['models'] ) > 1, "{$provider_id}: model list refresh works" );
}
t_ok( 4 === AI_CIS_Usage_Manager::get_usage()['content'], 'Connection tests are not counted; generations are', AI_CIS_Usage_Manager::get_usage() );

t_settings( array( 'provider' => 'openai' ) );
AI_CIS_Settings::update_api_keys( array( 'openai' => 'bad-key' ) );
list( $status, $body ) = t_rest( 'POST', '/rewrite', array( 'content' => 'x', 'action' => 'improve' ) );
t_ok( 401 === $status && 'ai_cis_invalid_key' === $body['code'], 'Invalid API key → friendly error', $body );
t_ok( false === strpos( wp_json_encode( $body ), 'bad-key' ), 'Error response never echoes the key' );

AI_CIS_Settings::update_api_keys( array( 'openai' => 'good-key' ) );
$before = AI_CIS_Usage_Manager::get_usage()['content'];
list( $status, $body ) = t_rest( 'POST', '/rewrite', array( 'content' => 'TRIGGER_RATE_LIMIT', 'action' => 'improve' ) );
t_ok( 429 === $status && false !== strpos( $body['message'], 'rate limit' ), 'Rate limit → friendly message', $body );
list( $status, $body ) = t_rest( 'POST', '/rewrite', array( 'content' => 'TRIGGER_SERVER_ERROR', 'action' => 'improve' ) );
t_ok( 502 === $status && 'ai_cis_provider_error' === $body['code'] && false === strpos( $body['message'], 'Internal error' ), 'Provider 500 → friendly message, raw error hidden from message', $body );
t_ok( ! empty( $body['data']['details'] ), 'Admins get technical details separately' );
list( $status, $body ) = t_rest( 'POST', '/generate-field', array( 'field' => 'excerpt', 'content' => 'TRIGGER_MALFORMED' ) );
t_ok( 502 === $status && 'ai_cis_malformed_response' === $body['code'], 'Malformed JSON response handled', $body );
list( $status, $body ) = t_rest( 'POST', '/rewrite', array( 'content' => 'TRIGGER_MALFORMED_SHAPE', 'action' => 'improve' ) );
t_ok( 502 === $status && 'ai_cis_malformed_response' === $body['code'], 'Unexpected response shape handled', $body );
$t0 = time();
list( $status, $body ) = t_rest( 'POST', '/rewrite', array( 'content' => 'TRIGGER_TIMEOUT', 'action' => 'improve' ) );
t_ok( 504 === $status && 'ai_cis_timeout' === $body['code'], 'Timeout → friendly error', $body );
t_ok( $before === AI_CIS_Usage_Manager::get_usage()['content'], 'Failed calls never consume usage' );

wp_set_current_user( $author->ID );
list( $status, $body ) = t_rest( 'POST', '/rewrite', array( 'content' => 'TRIGGER_SERVER_ERROR', 'action' => 'improve' ) );
t_ok( empty( $body['data']['details'] ), 'Non-admins do not get technical details' );
wp_set_current_user( $admin->ID );

// ---------------------------------------------------------------------------
t_section( 'Usage manager' );
// ---------------------------------------------------------------------------

t_reset_usage();
t_settings( array( 'limits' => array( 'content' => 0 ) ) );
t_ok( null === AI_CIS_Usage_Manager::get_remaining( 'content' ), 'Default limit is unlimited (0)' );
t_ok( AI_CIS_Usage_Manager::can_use( 'content' ), 'Unlimited can always be used' );

t_settings( array( 'limits' => array( 'content' => 2 ) ) );
t_ok( AI_CIS_Usage_Manager::can_use( 'content' ), 'Can use within limit' );
AI_CIS_Usage_Manager::consume( 'content', 1, 'req-a' );
AI_CIS_Usage_Manager::consume( 'content', 1, 'req-a' );
t_ok( 1 === AI_CIS_Usage_Manager::get_usage()['content'], 'Same request ID is only counted once' );
list( $status, $body ) = t_rest( 'POST', '/rewrite', array( 'content' => 'hi', 'action' => 'improve', 'request_id' => 'r1' ) );
t_ok( 200 === $status && 2 === AI_CIS_Usage_Manager::get_usage()['content'], 'Generation consumes usage' );
t_ok( 0 === AI_CIS_Usage_Manager::get_remaining( 'content' ), 'Remaining reaches 0' );
list( $status, $body ) = t_rest( 'POST', '/rewrite', array( 'content' => 'hi', 'action' => 'improve', 'request_id' => 'r2' ) );
t_ok( 403 === $status && 'ai_cis_limit_reached' === $body['code'], 'Cannot use after limit', $body );
t_ok( false !== strpos( $body['message'], 'monthly AI limit' ), 'Limit message matches spec' );

t_settings( array( 'limits' => array( 'content' => 5 ) ) );
t_rest( 'POST', '/rewrite', array( 'content' => 'hi', 'action' => 'improve', 'request_id' => 'regen-1' ) );
t_rest( 'POST', '/rewrite', array( 'content' => 'hi', 'action' => 'improve', 'request_id' => 'regen-2' ) );
t_ok( 4 === AI_CIS_Usage_Manager::get_usage()['content'], 'Regeneration counts as another generation' );

add_filter( 'ai_cis_monthly_ai_limit', function () { return 1000; } );
t_ok( 1000 === AI_CIS_Usage_Manager::get_limit( 'content' ), 'ai_cis_monthly_ai_limit filter overrides limit' );
remove_all_filters( 'ai_cis_monthly_ai_limit' );

// Monthly reset: pretend the stored period is last month.
$data           = get_option( AI_CIS_Usage_Manager::OPTION );
$data['period'] = '2000-01';
update_option( AI_CIS_Usage_Manager::OPTION, $data );
t_ok( 0 === AI_CIS_Usage_Manager::get_usage()['content'], 'Monthly reset happens when period changes (no cron needed)' );
t_ok( isset( AI_CIS_Usage_Manager::get_history()['2000-01'] ) && 4 === AI_CIS_Usage_Manager::get_history()['2000-01']['content'], 'Previous month kept in history' );
t_ok( wp_date( 'Y-m', null, wp_timezone() ) === AI_CIS_Usage_Manager::current_period(), 'Period uses site timezone' );

t_settings( array( 'limits' => array( 'content' => 0, 'bulk_batch' => 0 ) ) );
t_reset_usage();

// ---------------------------------------------------------------------------
t_section( 'Content AI' );
// ---------------------------------------------------------------------------

list( $status, $body ) = t_rest( 'POST', '/generate-content', array( 'topic' => 'Trail running', 'keywords' => 'shoes', 'request_id' => 'c1' ) );
t_ok( 200 === $status && 'Guide to Trail running' === $body['title'], 'Generates title (code-fenced JSON parsed)', $body );
t_ok( false !== strpos( $body['content'], '<h2>' ) && false === strpos( $body['content'], '<script' ) && false === strpos( $body['content'], 'alert(1)' ), 'Content HTML kept, scripts (and their contents) stripped' );
t_ok( '' !== $body['excerpt'] && '' !== $body['seo_title'] && '' !== $body['meta_description'] && count( $body['keywords'] ) === 3, 'Excerpt, SEO title, meta description, keywords returned' );
$log  = t_mock_log();
$last = end( $log );
t_ok( false !== strpos( $last->system, 'Write all output in English' ), 'Default language sent in system prompt' );

list( $status, $body ) = t_rest( 'POST', '/generate-content', array( 'topic' => 'Tea', 'language' => 'Bangla', 'post_type' => 'page' ) );
$log  = t_mock_log();
$last = end( $log );
t_ok( false !== strpos( $last->system, 'Bangla' ) && false !== strpos( $last->prompt, 'WordPress page' ), 'Language & page type passed to prompt' );

add_filter( 'ai_cis_content_prompt', function ( $p ) { return $p . "\nFILTER_MARK"; } );
t_rest( 'POST', '/generate-content', array( 'topic' => 'Filters' ) );
$log = t_mock_log();
t_ok( false !== strpos( end( $log )->prompt, 'FILTER_MARK' ), 'Prompt filters applied' );
remove_all_filters( 'ai_cis_content_prompt' );

t_settings( array( 'custom_prompts' => array( 'content' => 'Always mention our brand ACME.' ) ) );
t_rest( 'POST', '/generate-content', array( 'topic' => 'Brand' ) );
$log = t_mock_log();
t_ok( false !== strpos( end( $log )->prompt, 'ACME' ), 'Custom prompt instructions appended' );
t_settings( array( 'custom_prompts' => array( 'content' => '' ) ) );

$post_id = wp_insert_post( array( 'post_title' => 'Original', 'post_content' => '<!-- wp:paragraph --><p>Original text</p><!-- /wp:paragraph -->', 'post_status' => 'draft' ) );
foreach ( array( 'improve', 'grammar', 'seo', 'persuasive', 'shorten', 'expand', 'simplify', 'professional', 'friendly' ) as $action ) {
	list( $status, $body ) = t_rest( 'POST', '/rewrite', array( 'content' => get_post( $post_id )->post_content, 'action' => $action ) );
	t_ok( 200 === $status && 0 === strpos( $body['result'], 'REWRITTEN' ), "Rewrite action: {$action}" );
}
t_ok( false !== strpos( get_post( $post_id )->post_content, 'Original text' ) && false === strpos( get_post( $post_id )->post_content, 'REWRITTEN' ), 'Rewrite never overwrites original automatically' );
t_ok( $body['is_html'] && false !== strpos( $body['original'], 'Original text' ), 'Rewrite returns original + AI result' );
list( $status ) = t_rest( 'POST', '/items/' . $post_id, array( 'field' => 'content', 'value' => $body['result'], 'mode' => 'replace' ) );
t_ok( 200 === $status && false !== strpos( get_post( $post_id )->post_content, 'REWRITTEN' ), 'Replace saves only on explicit request' );

list( $status, $body ) = t_rest( 'POST', '/generate-field', array( 'field' => 'title', 'post_id' => $post_id ) );
t_ok( 200 === $status && 3 === count( $body['options'] ), 'Title suggestions' );
list( $status, $body ) = t_rest( 'POST', '/generate-field', array( 'field' => 'excerpt', 'post_id' => $post_id ) );
t_ok( 200 === $status && 'Generated value text.' === $body['value'], 'Excerpt generation' );

list( $status, $body ) = t_rest( 'POST', '/create-draft', array( 'title' => 'AI Draft', 'content' => '<p>Body</p><script>x</script>', 'excerpt' => 'Ex', 'post_type' => 'page', 'seo_title' => 'SEO T', 'meta_description' => 'Meta D' ) );
$draft = get_post( $body['post_id'] );
t_ok( 200 === $status && 'draft' === $draft->post_status && 'page' === $draft->post_type && false === strpos( $draft->post_content, '<script' ), 'Create draft (sanitized) for page' );
t_ok( 'Meta D' === get_post_meta( $draft->ID, AI_CIS_SEO_Integration::META_DESC, true ), 'Draft SEO meta stored via SEO integration' );

// ---------------------------------------------------------------------------
t_section( 'SEO' );
// ---------------------------------------------------------------------------

t_ok( '' === AI_CIS_SEO_Integration::detect(), 'No SEO plugin detected → built-in storage' );
list( $status, $body ) = t_rest( 'POST', '/seo/generate', array( 'post_id' => $post_id ) );
t_ok( 200 === $status && 'Best Original' === $body['seo_title'], 'SEO title/meta generated', $body );
t_ok( '' === get_post_meta( $post_id, AI_CIS_SEO_Integration::META_TITLE, true ), 'Generating SEO does not save automatically' );
list( $status, $body ) = t_rest( 'POST', '/seo/save', array( 'post_id' => $post_id, 'seo_title' => 'My SEO Title', 'meta_description' => 'My <b>desc</b>', 'focus_keyword' => 'kw' ) );
t_ok( 200 === $status && 'My SEO Title' === get_post_meta( $post_id, AI_CIS_SEO_Integration::META_TITLE, true ) && 'My desc' === get_post_meta( $post_id, AI_CIS_SEO_Integration::META_DESC, true ), 'SEO save sanitizes and stores on confirm' );
list( $status, $body ) = t_rest( 'POST', '/seo/analyze', array( 'post_id' => $post_id, 'keyword' => 'original' ) );
t_ok( 200 === $status && 72 === $body['score'] && 2 === count( $body['suggestions'] ) && count( $body['checks'] ) >= 3, 'Content optimization analysis', $body );
list( $status, $body ) = t_rest( 'POST', '/generate-field', array( 'field' => 'keywords', 'post_id' => $post_id ) );
t_ok( 200 === $status && 2 === count( $body['options'] ), 'Keyword suggestions' );

add_filter( 'ai_cis_detected_seo_plugin', function () { return 'yoast'; } );
AI_CIS_SEO_Integration::save( $post_id, array( 'seo_title' => 'Y Title', 'meta_description' => 'Y Desc', 'focus_keyword' => 'ykw' ) );
t_ok( 'Y Title' === get_post_meta( $post_id, '_yoast_wpseo_title', true ) && 'ykw' === get_post_meta( $post_id, '_yoast_wpseo_focuskw', true ), 'Yoast adapter writes Yoast meta keys' );
remove_all_filters( 'ai_cis_detected_seo_plugin' );
add_filter( 'ai_cis_detected_seo_plugin', function () { return 'rankmath'; } );
AI_CIS_SEO_Integration::save( $post_id, array( 'seo_title' => 'R Title', 'meta_description' => 'R Desc', 'focus_keyword' => 'rkw' ) );
t_ok( 'R Desc' === get_post_meta( $post_id, 'rank_math_description', true ) && 'rkw' === AI_CIS_SEO_Integration::get( $post_id )['focus_keyword'], 'Rank Math adapter reads/writes Rank Math meta' );
remove_all_filters( 'ai_cis_detected_seo_plugin' );
add_filter( 'ai_cis_detected_seo_plugin', function () { return 'aioseo'; } );
AI_CIS_SEO_Integration::save( $post_id, array( 'seo_title' => 'A Title', 'meta_description' => 'A Desc' ) );
t_ok( 'A Title' === get_post_meta( $post_id, '_aioseo_title', true ), 'AIOSEO adapter degrades gracefully without AIOSEO classes' );
remove_all_filters( 'ai_cis_detected_seo_plugin' );

// Frontend fallback output.
wp_update_post( array( 'ID' => $post_id, 'post_status' => 'publish' ) );
$html = wp_remote_retrieve_body( wp_remote_get( get_permalink( $post_id ) ) );
t_ok( false !== strpos( $html, '<meta name="description" content="My desc" />' ) && false !== strpos( $html, '<title>My SEO Title' ), 'Fallback meta description & title output on frontend', substr( $html, 0, 300 ) );

// ---------------------------------------------------------------------------
t_section( 'Image AI' );
// ---------------------------------------------------------------------------

t_settings( array( 'provider' => 'openai', 'image_send_file' => true ) );
$parent = wp_insert_post( array( 'post_title' => 'Mountain Trip', 'post_content' => 'We hiked the alps.', 'post_status' => 'publish' ) );
$img1   = t_make_image( 'black-running-shoes.jpg', $parent );
t_clear_mock_log();
list( $status, $body ) = t_rest( 'POST', '/generate-image-metadata', array( 'attachment_id' => $img1, 'fields' => array( 'alt', 'title', 'caption', 'description' ), 'request_id' => 'img1' ) );
t_ok( 200 === $status && 'Black running shoes on a white background' === $body['values']['alt'], 'Alt text generated; "Image of" prefix removed', $body );
t_ok( $body['vision'] && t_mock_log()[0]->has_image, 'Image file sent for visual analysis' );
t_ok( false !== strpos( t_mock_log()[0]->prompt, 'Parent post title: Mountain Trip' ) && false !== strpos( t_mock_log()[0]->prompt, 'Filename: black-running-shoes.jpg' ), 'Context (filename, parent post) included' );
t_ok( '' === AI_CIS_Image_Optimizer::get_current( $img1 )['alt'], 'Generation alone does not save metadata' );
t_ok( 1 === AI_CIS_Usage_Manager::get_usage()['image'], 'Image generation counted as image usage' );

t_settings( array( 'image_send_file' => false ) );
t_clear_mock_log();
t_rest( 'POST', '/generate-image-metadata', array( 'attachment_id' => $img1, 'fields' => array( 'alt' ) ) );
t_ok( ! t_mock_log()[0]->has_image, 'Vision can be disabled in settings' );
t_settings( array( 'image_send_file' => true ) );

t_settings( array( 'alt_text_style' => 'accessibility' ) );
t_clear_mock_log();
t_rest( 'POST', '/generate-image-metadata', array( 'attachment_id' => $img1, 'fields' => array( 'alt' ), 'style' => 'accessibility' ) );
t_ok( false !== strpos( t_mock_log()[0]->prompt, 'Accessibility first' ), 'Accessibility First rules in prompt' );

update_post_meta( $img1, '_wp_attachment_image_alt', 'Existing alt' );
list( $status, $body ) = t_rest( 'POST', '/apply-image-metadata', array( 'attachment_id' => $img1, 'values' => array( 'alt' => 'New alt', 'caption' => 'New caption' ), 'fields' => array( 'alt', 'caption' ), 'overwrite' => false ) );
t_ok( 'Existing alt' === get_post_meta( $img1, '_wp_attachment_image_alt', true ) && in_array( 'alt', $body['skipped'], true ), 'Existing metadata preserved without overwrite' );
t_ok( 'New caption' === get_post( $img1 )->post_excerpt, 'Empty fields filled' );
t_rest( 'POST', '/apply-image-metadata', array( 'attachment_id' => $img1, 'values' => array( 'alt' => 'New alt' ), 'fields' => array( 'alt' ), 'overwrite' => true ) );
t_ok( 'New alt' === get_post_meta( $img1, '_wp_attachment_image_alt', true ), 'Overwrite only with explicit confirmation' );
t_rest( 'POST', '/apply-image-metadata', array( 'attachment_id' => $img1, 'values' => array( 'title' => 'Unchecked' ), 'fields' => array( 'alt' ), 'overwrite' => true ) );
t_ok( 'Unchecked' !== get_post( $img1 )->post_title, 'Only selected fields are applied' );

$img2 = t_make_image( 'divider-pattern.jpg' );
t_clear_mock_log();
list( $status, $body ) = t_rest( 'POST', '/generate-image-metadata', array( 'attachment_id' => $img2, 'fields' => array( 'alt' ), 'image_type' => 'decorative' ) );
t_ok( 200 === $status && '' === $body['values']['alt'] && false === $body['used_ai'] && 0 === count( t_mock_log() ), 'Decorative image: empty alt, no AI call' );
update_post_meta( $img2, '_wp_attachment_image_alt', '' );
t_rest( 'POST', '/apply-image-metadata', array( 'attachment_id' => $img2, 'values' => array( 'alt' => '' ), 'fields' => array( 'alt' ), 'image_type' => 'decorative' ) );
t_ok( 'decorative' === get_post_meta( $img2, AI_CIS_Image_Optimizer::META_TYPE, true ), 'Decorative flag stored' );
list( $status, $body ) = t_rest( 'POST', '/generate-image-metadata', array( 'attachment_id' => $img2, 'fields' => array( 'alt', 'title' ), 'image_type' => 'decorative' ) );
t_ok( '' === $body['values']['alt'] && '' !== $body['values']['title'], 'Decorative: other fields still generated, alt stays empty' );

// Stats & filters.
$img3  = t_make_image( 'img-0003.jpg' );
$img4  = t_make_image( 'red-mug.jpg', $parent );
$stats = AI_CIS_Image_Optimizer::stats();
t_ok( $stats['total'] >= 4 && $stats['decorative'] >= 1, 'Library stats computed', $stats );
$missing = AI_CIS_Image_Optimizer::query_ids( 'missing_alt' );
t_ok( in_array( $img3, $missing, true ) && ! in_array( $img2, $missing, true ) && ! in_array( $img1, $missing, true ), 'Missing-alt filter excludes decorative and filled images' );
t_ok( in_array( $img4, AI_CIS_Image_Optimizer::query_ids( 'post_images' ), true ) && ! in_array( $img3, AI_CIS_Image_Optimizer::query_ids( 'post_images' ), true ), 'Post images filter' );
list( $status, $body ) = t_rest( 'GET', '/images', array( 'filter' => 'missing_metadata', 'per_page' => 2 ) );
t_ok( 200 === $status && count( $body['items'] ) <= 2 && $body['total'] >= 2, 'Paginated image listing' );

// Bulk processing.
t_reset_usage();
t_settings( array( 'limits' => array( 'bulk_batch' => 2 ) ) );
list( $status, $body ) = t_rest( 'POST', '/bulk/start', array( 'ids' => array( $img3, $img4, $img1 ), 'fields' => array( 'alt', 'title' ) ) );
t_ok( 200 === $status && 2 === $body['total'] && 1 === $body['truncated'], 'Bulk batch limit enforced', $body );
list( $status, $body ) = t_rest( 'POST', '/bulk/start', array( 'ids' => array( $img3 ), 'fields' => array( 'alt' ) ) );
t_ok( 409 === $status, 'Only one bulk job at a time' );
$guard = 0;
do {
	$state = AI_CIS_Queue::process_bulk( false );
} while ( 'running' === $state['status'] && ++$guard < 10 );
t_ok( 'completed' === $state['status'] && 2 === $state['optimized'], 'Bulk job completes in chunks', $state );
t_ok( '' !== get_post_meta( $img3, '_wp_attachment_image_alt', true ) && 'img-0003' !== get_post( $img3 )->post_title, 'Bulk fills alt and replaces filename-like title' );
t_ok( 2 === AI_CIS_Usage_Manager::get_usage()['image'], 'Bulk consumes image usage per processed image' );
AI_CIS_Queue::control( 'cancel' );

// Bulk respects limit & pause/resume.
t_settings( array( 'limits' => array( 'bulk_batch' => 0, 'image' => 3 ) ) );
$img5 = t_make_image( 'blue-chair.jpg' );
$img6 = t_make_image( 'green-lamp.jpg' );
t_rest( 'POST', '/bulk/start', array( 'ids' => array( $img5, $img6 ), 'fields' => array( 'alt' ) ) );
$state = AI_CIS_Queue::process_bulk( false );
t_ok( 'paused' === $state['status'] && 'limit' === $state['stop_reason'] && 1 === $state['remaining'], 'Bulk pauses when monthly limit is reached', $state );
list( $status, $body ) = t_rest( 'POST', '/bulk/resume' );
t_ok( 403 === $status, 'Resume blocked while limit reached' );
t_settings( array( 'limits' => array( 'image' => 0 ) ) );
t_rest( 'POST', '/bulk/resume' );
$state = AI_CIS_Queue::process_bulk( false );
t_ok( 'completed' === $state['status'], 'Bulk resumes after limit raised' );
AI_CIS_Queue::control( 'cancel' );

// Skips images that need nothing (no usage).
$before = AI_CIS_Usage_Manager::get_usage()['image'];
$res    = AI_CIS_Image_Optimizer::process( $img5, array( 'alt' ), false );
t_ok( 'skipped' === $res['status'] && $before === AI_CIS_Usage_Manager::get_usage()['image'], 'Already-complete images skipped without AI usage' );

// Automatic optimization.
t_reset_usage();
t_settings( array( 'auto_optimize' => true, 'auto_fields' => array( 'alt', 'title' ), 'limits' => array( 'auto_image' => 1 ) ) );
$auto1 = t_make_image( 'auto-one.jpg' );
do_action( 'add_attachment', $auto1 );
$auto2 = t_make_image( 'auto-two.jpg' );
do_action( 'add_attachment', $auto2 );
t_ok( 2 === AI_CIS_Queue::auto_queue_count() && 'queued' === get_post_meta( $auto1, AI_CIS_Image_Optimizer::META_STATUS, true ), 'New uploads queued (not processed during upload)' );
AI_CIS_Queue::process_auto();
t_ok( '' !== get_post_meta( $auto1, '_wp_attachment_image_alt', true ), 'Automation processed first image' );
t_ok( 'limit' === get_post_meta( $auto2, AI_CIS_Image_Optimizer::META_STATUS, true ) && 0 === AI_CIS_Queue::auto_queue_count(), 'Automation stops at limit; remaining left unprocessed' );
t_ok( AI_CIS_Queue::auto_limit_hit(), 'Limit-reached notice flag set' );
t_ok( 1 === AI_CIS_Usage_Manager::get_usage()['auto_image'] && 0 === AI_CIS_Usage_Manager::get_usage()['image'], 'Automation uses its own quota' );

// Failed automation not retried.
t_settings( array( 'limits' => array( 'auto_image' => 0 ) ) );
AI_CIS_Settings::update_api_keys( array( 'openai' => 'bad-key' ) );
$auto3 = t_make_image( 'auto-three.jpg' );
do_action( 'add_attachment', $auto3 );
AI_CIS_Queue::process_auto();
t_ok( 'failed' === get_post_meta( $auto3, AI_CIS_Image_Optimizer::META_STATUS, true ) && 0 === AI_CIS_Queue::auto_queue_count(), 'Failed automation is not re-queued' );
AI_CIS_Settings::update_api_keys( array( 'openai' => 'good-key' ) );
t_settings( array( 'auto_optimize' => false ) );
$auto4 = t_make_image( 'auto-four.jpg' );
do_action( 'add_attachment', $auto4 );
t_ok( 0 === AI_CIS_Queue::auto_queue_count(), 'Automation off → nothing queued' );
delete_option( AI_CIS_Queue::LIMIT_OPTION );

// Media library integration (admin-only hooks; WP-CLI is not an admin request).
if ( ! has_filter( 'attachment_fields_to_edit', array( 'AI_CIS_Media_Library', 'attachment_field' ) ) ) {
	AI_CIS_Media_Library::init();
}
$fields = apply_filters( 'attachment_fields_to_edit', array(), get_post( $img1 ) );
t_ok( isset( $fields['ai_cis_generate'] ) && false !== strpos( $fields['ai_cis_generate']['html'], 'data-attachment-id="' . $img1 . '"' ), 'Media modal shows Generate AI Metadata button' );
$actions = apply_filters( 'media_row_actions', array(), get_post( $img1 ), false );
t_ok( isset( $actions['ai_cis_generate'] ), 'Media list row action present' );
$bulk_actions = apply_filters( 'bulk_actions-upload', array() );
t_ok( isset( $bulk_actions['ai_cis_optimize'] ), 'Media bulk action registered' );

// ---------------------------------------------------------------------------
t_section( 'WooCommerce' );
// ---------------------------------------------------------------------------

if ( AI_CIS_WooCommerce::is_active() ) {
	$stale = get_term_by( 'name', 'Brand New Category', 'product_cat' );
	if ( $stale ) {
		wp_delete_term( $stale->term_id, 'product_cat' );
	}
	$cat = wp_insert_term( 'Shoes', 'product_cat' );
	$product = new WC_Product_Simple();
	$product->set_name( "Men's Running Shoes" );
	$product->set_regular_price( '99.00' );
	$sku = 'RUN-' . strtoupper( wp_generate_password( 6, false ) );
	$product->set_sku( $sku );
	$product->set_description( 'Breathable mesh upper.' );
	$product->set_category_ids( array( is_wp_error( $cat ) ? (int) $cat->get_error_data() : $cat['term_id'] ) );
	$attr = new WC_Product_Attribute();
	$attr->set_name( 'Color' );
	$attr->set_options( array( 'Black' ) );
	$attr->set_visible( true );
	$product->set_attributes( array( $attr ) );
	$product->save();
	$pid = $product->get_id();

	$context = AI_CIS_WooCommerce::get_context( wc_get_product( $pid ) );
	t_ok( "Men's Running Shoes" === $context['Product name'] && $sku === $context['SKU'] && false !== strpos( $context['Attributes'], 'Black' ) && 'Shoes' === $context['Category'], 'Product context includes name, SKU, price, category, attributes', $context );

	t_clear_mock_log();
	foreach ( array( 'title', 'description', 'short_description', 'tags', 'categories', 'seo', 'improve' ) as $field ) {
		list( $status, $body ) = t_rest( 'POST', '/generate-product-content', array( 'product_id' => $pid, 'field' => $field ) );
		t_ok( 200 === $status && $field === $body['field'], "Product generation: {$field}", $body );
		if ( 'categories' === $field ) {
			t_ok( $body['existing']['Shoes'] > 0 && 0 === $body['existing']['Brand New Category'], 'Category suggestions flag existing vs new' );
			t_ok( 1 === count( wc_get_product( $pid )->get_category_ids() ), 'Categories never assigned automatically' );
		}
	}
	t_ok( 7 === AI_CIS_Usage_Manager::get_usage()['product'], 'Each product action consumes product usage' );
	t_ok( false !== strpos( t_mock_log()[0]->prompt, 'Price:' ), 'Price included in product prompt' );

	list( $status, $body ) = t_rest( 'POST', '/generate-product-content', array( 'product_id' => $pid, 'field' => 'description', 'overrides' => array( 'name' => 'Unsaved Name' ) ) );
	$log = t_mock_log();
	t_ok( false !== strpos( end( $log )->prompt, 'Unsaved Name' ), 'Unsaved editor values used as context' );

	t_rest( 'POST', '/apply-product-content', array( 'product_id' => $pid, 'field' => 'title', 'value' => 'Option Title A ' . $sku ) );
	t_rest( 'POST', '/apply-product-content', array( 'product_id' => $pid, 'field' => 'description', 'value' => '<h3>New</h3><script>bad()</script>' ) );
	t_rest( 'POST', '/apply-product-content', array( 'product_id' => $pid, 'field' => 'tags', 'value' => array( 'running', 'shoes' ) ) );
	list( $status, $body ) = t_rest( 'POST', '/apply-product-content', array( 'product_id' => $pid, 'field' => 'categories', 'value' => array( 'Shoes', 'Brand New Category' ) ) );
	wp_cache_flush();
	$p = wc_get_product( $pid );
	t_ok( 'Option Title A ' . $sku === $p->get_name() && false === strpos( $p->get_description(), 'script' ), 'Title/description saved & sanitized on confirm' );
	t_ok( 2 === count( $p->get_tag_ids() ) && 2 === count( $p->get_category_ids() ) && 2 === count( $body['terms'] ), 'Tags and confirmed categories assigned', $body );
	t_rest( 'POST', '/apply-product-content', array( 'product_id' => $pid, 'field' => 'seo', 'value' => array( 'seo_title' => 'P SEO', 'meta_description' => 'P desc' ) ) );
	t_ok( 'P SEO' === AI_CIS_SEO_Integration::get( $pid )['seo_title'], 'Product SEO metadata saved' );

	// Reviews.
	list( $status, $body ) = t_rest( 'POST', '/review-summary', array( 'product_id' => $pid ) );
	t_ok( 400 === $status && 'ai_cis_no_reviews' === $body['code'], 'No reviews → no fabricated summary' );
	foreach ( array( array( 'Jane Secret', 'jane@private.test', 'Very comfortable!', 5 ), array( 'Bob Hidden', 'bob@private.test', 'Runs a bit small.', 3 ) ) as $r ) {
		$cid = wp_insert_comment( array( 'comment_post_ID' => $pid, 'comment_author' => $r[0], 'comment_author_email' => $r[1], 'comment_author_IP' => '10.1.2.3', 'comment_content' => $r[2], 'comment_type' => 'review', 'comment_approved' => 1 ) );
		update_comment_meta( $cid, 'rating', $r[3] );
	}
	wp_insert_comment( array( 'comment_post_ID' => $pid, 'comment_author' => 'Spammer', 'comment_content' => 'UNAPPROVED SPAM', 'comment_type' => 'review', 'comment_approved' => 0 ) );
	t_clear_mock_log();
	list( $status, $body ) = t_rest( 'POST', '/review-summary', array( 'product_id' => $pid ) );
	$sent = t_mock_log()[0]->prompt;
	t_ok( 200 === $status && 2 === $body['review_count'] && 'Based on 2 reviews, customers praise comfort.' === $body['summary'], 'Review summary from approved reviews only', $body );
	t_ok( false === strpos( $sent, 'Jane' ) && false === strpos( $sent, 'private.test' ) && false === strpos( $sent, '10.1.2.3' ) && false === strpos( $sent, 'UNAPPROVED' ), 'No reviewer names, emails, IPs or unapproved reviews sent' );
	t_ok( false !== strpos( $sent, '(5/5)' ) && false !== strpos( $sent, 'Very comfortable!' ), 'Review text and rating sent' );
	t_ok( null === AI_CIS_Review_Summary::get( $pid ), 'Summary not saved until confirmed' );
	t_rest( 'POST', '/review-summary/save', array( 'product_id' => $pid, 'summary' => $body['summary'], 'pros' => $body['pros'], 'cons' => $body['cons'], 'review_count' => 2 ) );
	t_ok( null !== AI_CIS_Review_Summary::get( $pid ), 'Summary saved on confirm' );
	t_ok( false !== strpos( do_shortcode( '[ai_cis_review_summary id="' . $pid . '"]' ), 'Comfortable' ), 'Shortcode renders summary' );
	t_ok( 1 === AI_CIS_Usage_Manager::get_usage()['review'], 'Review summaries use their own quota' );

	// Product image context.
	$pimg = t_make_image( 'shoe-side.jpg', $pid );
	t_clear_mock_log();
	t_rest( 'POST', '/generate-image-metadata', array( 'attachment_id' => $pimg, 'fields' => array( 'alt' ) ) );
	t_ok( false !== strpos( t_mock_log()[0]->prompt, 'WooCommerce product name: Option Title A ' . $sku ) && false !== strpos( t_mock_log()[0]->prompt, 'Product category' ), 'Image context includes WooCommerce product data' );
	t_ok( in_array( $pimg, AI_CIS_Image_Optimizer::query_ids( 'woocommerce' ), true ), 'WooCommerce images filter' );

	list( $status, $body ) = t_rest( 'GET', '/products', array( 'search' => $sku ) );
	t_ok( 200 === $status && 1 === $body['total'], 'Product listing' );

	wp_set_current_user( $author->ID );
	list( $status ) = t_rest( 'POST', '/generate-product-content', array( 'product_id' => $pid, 'field' => 'title' ) );
	t_ok( 403 === $status, 'Author cannot generate for products they cannot edit' );
	wp_set_current_user( $admin->ID );
} else {
	list( $status, $body ) = t_rest( 'POST', '/generate-product-content', array( 'product_id' => 1, 'field' => 'title' ) );
	t_ok( 400 === $status && 'ai_cis_woocommerce_inactive' === $body['code'], 'WooCommerce inactive → clear error', $body );
	list( $status, $body ) = t_rest( 'POST', '/review-summary', array( 'product_id' => 1 ) );
	t_ok( 400 === $status && 'ai_cis_woocommerce_inactive' === $body['code'], 'Review summary without WooCommerce → clear error' );
	t_ok( ! isset( AI_CIS_Admin::pages()['ai-cis-woocommerce'] ), 'No WooCommerce menu when WooCommerce is inactive' );
	t_ok( ! array_key_exists( 'woocommerce', AI_CIS_Image_Optimizer::filters() ), 'No WooCommerce image filter when inactive' );
}

// ---------------------------------------------------------------------------
t_section( 'Onboarding & uninstall' );
// ---------------------------------------------------------------------------

t_settings( array( 'onboarding_complete' => false ) );
list( $status, $body ) = t_rest( 'POST', '/onboarding', array( 'skip' => true ) );
t_ok( 200 === $status && true === $body['settings']['onboarding_complete'], 'Onboarding can be skipped' );
list( $status, $body ) = t_rest( 'POST', '/onboarding', array( 'settings' => array( 'provider' => 'gemini', 'default_language' => 'Custom', 'custom_language' => 'Portuguese', 'alt_text_style' => 'seo' ) ) );
t_ok( 'gemini' === $body['settings']['provider'] && 'Portuguese' === AI_CIS_Settings::resolve_language() && 'seo' === $body['settings']['alt_text_style'], 'Onboarding saves provider, custom language and alt style' );

$keep_post = wp_insert_post( array( 'post_title' => 'Keep me', 'post_status' => 'publish' ) );
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	define( 'WP_UNINSTALL_PLUGIN', 'ai-content-image-seo/ai-content-image-seo.php' );
}
include AI_CIS_PATH . 'uninstall.php';
wp_cache_flush();
t_ok( false !== get_option( AI_CIS_Settings::OPTION ) && false !== get_option( AI_CIS_Settings::KEYS ), 'Uninstall keeps settings by default' );
t_settings( array( 'delete_on_uninstall' => true ) );
include AI_CIS_PATH . 'uninstall.php';
wp_cache_flush();
t_ok( false === get_option( AI_CIS_Settings::OPTION ) && false === get_option( AI_CIS_Settings::KEYS ) && false === get_option( AI_CIS_Usage_Manager::OPTION ), 'Uninstall removes plugin data when enabled' );
t_ok( null !== get_post( $keep_post ) && null !== get_post( $img1 ) && 'New alt' === get_post_meta( $img1, '_wp_attachment_image_alt', true ), 'Uninstall never deletes posts, media or generated metadata' );
AI_CIS_Settings::flush_cache();

// ---------------------------------------------------------------------------
$r = $GLOBALS['ai_cis_t'];
echo "\n\033[1mResult: {$r['pass']} passed, {$r['fail']} failed\033[0m\n";
if ( $r['fail'] ) {
	echo "Failures:\n - " . implode( "\n - ", $r['failures'] ) . "\n";
}
