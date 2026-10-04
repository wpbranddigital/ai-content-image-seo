<?php
// TEST ENVIRONMENT ONLY: point provider adapters at the local mock server.
add_filter( 'ai_cis_openai_base_url', function () { return 'http://127.0.0.1:9999/v1'; } );
add_filter( 'ai_cis_openrouter_base_url', function () { return 'http://127.0.0.1:9999/api/v1'; } );
add_filter( 'ai_cis_anthropic_base_url', function () { return 'http://127.0.0.1:9999/v1'; } );
add_filter( 'ai_cis_gemini_base_url', function () { return 'http://127.0.0.1:9999/v1beta'; } );
add_filter( 'pre_site_transient_update_plugins', '__return_empty_array' );
add_filter( 'pre_site_transient_update_themes', '__return_empty_array' );
add_filter( 'pre_site_transient_update_core', '__return_empty_array' );
add_filter( 'http_request_host_is_external', '__return_true' ); // Test only: allow WP AI Client to reach the local mock.
add_filter( 'http_allowed_safe_ports', function ( $p ) { $p[] = 9999; return $p; } );
