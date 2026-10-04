import re, sys, json
from playwright.sync_api import sync_playwright, expect

BASE = 'http://127.0.0.1:8080'
import os
SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shots') + '/'
os.makedirs(SHOTS, exist_ok=True)
BASE = os.environ.get('AI_CIS_E2E_URL', BASE)
PRODUCT = int(sys.argv[1])
IMAGE = int(sys.argv[2])
errors = []
results = []


def ok(cond, name):
    results.append((bool(cond), name))
    print(('PASS ' if cond else 'FAIL ') + name, flush=True)


with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={'width': 1400, 'height': 1000})
    page = ctx.new_page()
    page.set_default_timeout(20000)
    page.on('console', lambda m: errors.append(('console', page.url, m.text)) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(('pageerror', page.url, str(e))))

    page.goto(BASE + '/wp-login.php')
    page.fill('#user_login', 'admin')
    page.fill('#user_pass', 'admin')
    page.click('#wp-submit')
    page.wait_for_url(re.compile('wp-admin'))

    # Onboarding.
    page.goto(BASE + '/wp-admin/admin.php?page=ai-content-image-seo')
    page.get_by_text('Welcome to AI Content & Image SEO').first.wait_for()
    page.screenshot(path=SHOTS + '01-onboarding.png', full_page=True)
    page.get_by_label(re.compile('^OpenAI')).check()
    page.get_by_role('button', name='Continue').click()
    page.get_by_label('OpenAI API Key').fill('sk-e2e-key-0001')
    page.get_by_role('button', name='Continue').click()
    page.get_by_role('combobox', name='Language').select_option('English')
    page.get_by_role('button', name='Continue').click()
    page.get_by_label('Accessibility First').check()
    page.get_by_role('button', name='Finish Setup').click()
    page.get_by_text('AI Usage This Month').first.wait_for()
    ok(True, 'Onboarding completes and lands on dashboard')
    ok(page.get_by_text('AI provider connected').is_visible(), 'Dashboard shows provider connected')
    page.screenshot(path=SHOTS + '02-dashboard.png', full_page=True)
    ok(page.get_by_role('heading', name='Quick Actions').is_visible(), 'Quick actions visible')

    # Content AI.
    page.goto(BASE + '/wp-admin/admin.php?page=ai-cis-content')
    page.get_by_label('Topic').fill('Healthy breakfast ideas')
    page.get_by_role('button', name='Generate', exact=True).click()
    page.get_by_text('Generating…').first.wait_for()
    ok(True, 'Loading state shown while generating')
    title = page.get_by_label('Title', exact=True)
    title.wait_for()
    ok(title.input_value() == 'Guide to Healthy breakfast ideas', 'Generated title shown in editable field')
    page.screenshot(path=SHOTS + '03-content-result.png', full_page=True)
    page.get_by_role('button', name='Shorten').click()
    page.locator('.ai-cis-html-preview').filter(has_text='REWRITTEN').wait_for()
    ok(True, 'Shorten refines generated content')
    page.get_by_role('button', name=re.compile('Insert into editor')).click()
    page.wait_for_url(re.compile('post.php'))
    ok(True, 'Insert into editor creates draft and opens editor')
    page.wait_for_timeout(4000)
    # Close welcome guide if present.
    for label in ['Close', 'Close dialog']:
        btn = page.get_by_role('button', name=label)
        if btn.count():
            try:
                btn.first.click(timeout=2000)
            except Exception:
                pass
    frame_title = page.frame_locator('iframe[name="editor-canvas"]').locator('h1').first
    try:
        ok('Guide to Healthy breakfast ideas' in frame_title.inner_text(timeout=8000), 'Draft has generated title in block editor')
    except Exception:
        ok('Guide to Healthy breakfast ideas' in page.content(), 'Draft has generated title in block editor')
    page.get_by_role('button', name='AI Content Assistant').first.click()
    page.get_by_text('Selected Block').first.wait_for()
    ok(True, 'Gutenberg AI Content Assistant sidebar opens')
    page.get_by_role('button', name='Title & Excerpt').click()
    page.get_by_role('button', name='Suggest Titles').click()
    page.get_by_text('Option Title B').first.wait_for()
    ok(True, 'Gutenberg title suggestions work')
    page.screenshot(path=SHOTS + '04-gutenberg-sidebar.png')

    # Rewriter.
    page.goto(BASE + '/wp-admin/admin.php?page=ai-cis-content&tab=rewrite')
    page.get_by_label('Content', exact=True).fill('this are bad grammar')
    page.get_by_role('combobox', name='Action').select_option('grammar')
    page.get_by_role('button', name='Rewrite', exact=True).click()
    page.get_by_role('heading', name='Compare').wait_for()
    ok(page.get_by_text('REWRITTEN: this are bad grammar').is_visible(), 'Rewriter shows Original vs AI Result')
    page.screenshot(path=SHOTS + '05-rewriter.png', full_page=True)
    page.get_by_role('button', name='Replace').click()
    ok(page.get_by_label('Content', exact=True).input_value().startswith('REWRITTEN'), 'Replace updates pasted text')

    # Image AI single.
    page.goto(BASE + f'/wp-admin/admin.php?page=ai-cis-image&tab=single&attachment={IMAGE}')
    page.get_by_role('button', name='Generate Image Metadata').click()
    page.get_by_text('Review AI result').first.wait_for()
    ok(page.get_by_label('AI Alt Text').input_value() != '', 'Image metadata generated and previewed')
    page.screenshot(path=SHOTS + '06-image-single.png', full_page=True)
    page.get_by_label('Overwrite existing metadata').check()
    page.get_by_role('button', name='Apply Selected').click()
    page.get_by_text(re.compile('^Saved:')).first.wait_for()
    ok(True, 'Apply Selected saves metadata')

    # Bulk.
    page.goto(BASE + '/wp-admin/admin.php?page=ai-cis-image&tab=bulk')
    page.get_by_text('Total Images').first.wait_for()
    page.get_by_role('combobox', name='Filter').select_option('all')
    page.locator('table.ai-cis-table tbody tr').first.wait_for()
    page.screenshot(path=SHOTS + '07-bulk.png', full_page=True)
    page.get_by_label('Select all on this page').check()
    page.get_by_role('button', name=re.compile('Optimize Selected')).click()
    page.get_by_text('Completed', exact=True).first.wait_for(timeout=120000)
    ok(True, 'Bulk optimizer runs to completion with progress UI')
    page.screenshot(path=SHOTS + '08-bulk-done.png', full_page=True)
    page.get_by_role('button', name='Clear').click()

    # SEO.
    page.goto(BASE + '/wp-admin/admin.php?page=ai-cis-seo')
    page.locator('.ai-cis-picker__item').first.click()
    page.get_by_role('button', name='Generate SEO Title & Meta Description').click()
    page.get_by_role('button', name='Save SEO Metadata').wait_for()
    ok(page.get_by_text('Google Preview').count() >= 2, 'SEO Google preview shown')
    page.get_by_role('button', name='Save SEO Metadata').click()
    page.get_by_text(re.compile('Saved to')).first.wait_for()
    ok(True, 'SEO metadata saved after confirmation')
    page.get_by_role('button', name='Analyze Content').click()
    page.get_by_text('AI SEO score: 72 / 100').first.wait_for()
    ok(True, 'Content optimization analysis shown')
    page.screenshot(path=SHOTS + '09-seo.png', full_page=True)

    # WooCommerce page.
    page.goto(BASE + '/wp-admin/admin.php?page=ai-cis-woocommerce')
    page.locator('.ai-cis-picker__item').first.click()
    page.get_by_role('button', name='Generate Title').click()
    page.get_by_label('Option Title B').check()
    page.get_by_role('button', name='Use This').click()
    page.get_by_text('Product title saved.').first.wait_for()
    ok(True, 'WooCommerce page: generate + save product title')
    page.get_by_role('button', name='Suggest Categories').click()
    page.get_by_text('(new category)').first.wait_for()
    ok(True, 'Category suggestions mark new categories')
    page.screenshot(path=SHOTS + '10-woo-page.png', full_page=True)
    page.get_by_role('tab', name='AI Review Summary').click()
    page.get_by_role('button', name=re.compile('Generate (New )?Summary|Generate Review Summary')).click()
    page.get_by_role('button', name='Save Summary').wait_for()
    ok(True, 'Review summary generated in UI')

    # Product editor meta box.
    page.goto(BASE + f'/wp-admin/post.php?post={PRODUCT}&action=edit')
    box = page.locator('#ai-cis-product-assistant')
    box.get_by_role('button', name='Generate Short Description').click()
    box.get_by_role('button', name='Insert into Editor').click()
    box.get_by_text('Inserted into the editor').first.wait_for()
    val = page.evaluate("() => (window.tinymce && tinymce.get('excerpt') ? tinymce.get('excerpt').getContent() : document.getElementById('excerpt').value)")
    ok('Generated value text.' in val, 'Product editor: short description inserted into form')
    box.get_by_role('button', name='Generate Tags').click()
    box.get_by_role('button', name='Add Selected Tags').click()
    page.wait_for_timeout(500)
    ok(page.locator('#tagsdiv-product_tag .tagchecklist li').filter(has_text='lightweight').count() > 0, 'Product editor: tags added to tag box')
    page.screenshot(path=SHOTS + '11-product-metabox.png', full_page=True)

    # Media library modal.
    page.goto(BASE + '/wp-admin/upload.php?mode=list')
    row = page.locator(f'#post-{IMAGE}')
    row.hover()
    row.get_by_role('link', name='Generate AI Metadata').click()
    page.get_by_role('dialog').get_by_role('button', name='Generate Image Metadata').wait_for()
    ok(True, 'Media Library row action opens AI modal')
    page.screenshot(path=SHOTS + '12-media-modal.png')
    page.keyboard.press('Escape')

    page.goto(BASE + '/wp-admin/upload.php?mode=grid')
    page.locator('li.attachment').first.click()
    page.locator('.ai-cis-media-generate').first.click()
    page.locator('.ai-cis-modal').get_by_role('button', name='Generate Image Metadata').wait_for()
    ok(True, 'Attachment details (grid modal) button opens AI metadata modal')
    page.screenshot(path=SHOTS + '12b-grid-modal.png')
    page.keyboard.press('Escape')

    # Settings & usage.
    page.goto(BASE + '/wp-admin/admin.php?page=ai-cis-settings')
    page.get_by_role('button', name='Test Connection').click()
    page.get_by_text('Connection successful').first.wait_for()
    ok(True, 'Settings: Test Connection works')
    page.get_by_role('button', name='Load models from provider').click()
    page.wait_for_timeout(1500)
    page.screenshot(path=SHOTS + '13-settings.png', full_page=True)
    for tab in ['Content & Language', 'Images & Automation', 'SEO & WooCommerce', 'Custom Prompts', 'Usage Limits', 'Privacy & Data']:
        page.get_by_role('tab', name=tab).click()
        page.wait_for_timeout(200)
    page.get_by_role('tab', name='Usage Limits').click()
    page.get_by_label('AI content generations per month').fill('100')
    page.get_by_role('button', name='Save Settings').click()
    page.get_by_text('Settings saved.').first.wait_for()
    ok(True, 'Settings save works')
    page.goto(BASE + '/wp-admin/admin.php?page=ai-cis-usage')
    page.get_by_text(re.compile('Usage for')).first.wait_for()
    ok(page.get_by_role('progressbar').count() >= 1, 'Usage page shows meters for limited types')
    page.screenshot(path=SHOTS + '14-usage.png', full_page=True)
    ok(page.locator('body').inner_text().find('sk-e2e-key') == -1, 'API key never rendered in admin pages')
    html = page.content()
    ok('sk-e2e-key' not in html, 'API key not present in page HTML/JS')

    # Mobile layout.
    page.set_viewport_size({'width': 400, 'height': 900})
    page.goto(BASE + '/wp-admin/admin.php?page=ai-content-image-seo')
    page.get_by_text('AI Usage This Month').first.wait_for()
    page.screenshot(path=SHOTS + '15-mobile.png', full_page=True)

    browser.close()

bad = [e for e in errors if 'favicon' not in e[2] and 'ERR_TUNNEL_CONNECTION_FAILED' not in e[2]]
print('external resource errors (sandbox network, not plugin):', len(errors) - len(bad))
print('\nJS errors:', json.dumps(bad, indent=1))
failed = [r for r in results if not r[0]]
print(f'\n{len(results) - len(failed)} passed, {len(failed)} failed')
