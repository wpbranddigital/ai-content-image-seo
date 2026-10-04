"""Local mock of OpenAI / Anthropic / Gemini / OpenRouter APIs for plugin testing only.

Returns deterministic outputs derived from the prompt so tests can assert real
request/response handling end to end. Never shipped with the plugin.
"""
import json, re, sys, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import os
LOG = os.environ.get('AI_CIS_MOCK_LOG', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mock_requests.jsonl'))


def answer(prompt, system=''):
    p = prompt
    if 'TRIGGER_MALFORMED' in p:
        return '<<not json at all>>'
    if 'Reply with the single word' in p:
        return 'OK'
    if 'Generate WordPress media library metadata' in p:
        prod = re.search(r'WooCommerce product name: (.+)', p)
        fname = re.search(r'Filename: (.+)', p)
        subject = prod.group(1).strip() if prod else (fname.group(1).rsplit('.', 1)[0].replace('-', ' ') if fname else 'subject')
        return json.dumps({
            'alt': 'Image of ' + subject.lower() + ' on a white background',
            'title': subject.title(),
            'caption': 'Lightweight ' + subject.lower() + ' for everyday use.',
            'description': 'A detailed photo showing ' + subject.lower() + '.',
        })
    if 'Write a ' in p and '"title" (string), "content" (HTML string)' in p:
        topic = re.search(r'Topic: (.+)', p).group(1).strip()
        return '```json\n' + json.dumps({
            'title': 'Guide to ' + topic,
            'content': '<h2>Introduction</h2><p>All about ' + topic + '.</p><script>alert(1)</script><ul><li>Point one</li></ul>',
            'excerpt': 'A short guide to ' + topic + '.',
            'seo_title': topic.title() + ' Guide',
            'meta_description': 'Learn everything about ' + topic + ' in this practical guide written for beginners and experts alike.',
            'keywords': [topic, topic + ' tips', 'guide'],
        }) + '\n```'
    if 'Create search engine metadata' in p or 'Create SEO metadata for this product page' in p:
        t = re.search(r'(?:Title|Product name): (.+)', p)
        t = t.group(1).strip() if t else 'Page'
        return json.dumps({'seo_title': 'Best ' + t, 'meta_description': 'Discover ' + t + ' - comfortable, lightweight and built for everyday use. Shop now and find your perfect fit today.', 'focus_keyword': t.lower(), 'keywords': [t.lower(), 'best ' + t.lower()]})
    if 'Review this WordPress content for on-page SEO' in p:
        return json.dumps({'score': 72, 'summary': 'Solid content that needs a stronger keyword focus.', 'suggestions': [{'priority': 'high', 'text': 'Add the focus keyword to the first paragraph.'}, {'priority': 'low', 'text': 'Add internal links.'}]})
    if 'Summarize the customer reviews' in p:
        n = len(re.findall(r'^#\d+', p, re.M))
        return json.dumps({'summary': 'Based on %d reviews, customers praise comfort.' % n, 'pros': ['Comfortable', 'Good value'], 'cons': ['Runs small']})
    if '{"options": ["...", "...", "..."]} with 3 options' in p or 'Suggest 3 compelling' in p:
        return json.dumps({'options': ['Option Title A', 'Option Title B', 'Option Title C']})
    if 'Suggest 5-10 relevant product tags' in p:
        return json.dumps({'options': ['running', 'shoes', 'lightweight']})
    if 'Suggest 1-4 suitable product categories' in p:
        return json.dumps({'options': ['Shoes', 'Brand New Category']})
    if 'Suggest 5-10 relevant focus keywords' in p:
        return json.dumps({'options': ['keyword one', 'keyword two']})
    if 'Respond with JSON: {"value"' in p:
        if 'product description as clean HTML' in p or 'Improve the existing product description' in p:
            return json.dumps({'value': '<h3>Overview</h3><p>Great product.</p><ul><li>Feature</li></ul>'})
        return json.dumps({'value': 'Generated value text.'})
    if 'Text to rewrite:' in p:
        body = p.split('<<<\n', 1)[1].rsplit('\n>>>', 1)[0]
        return '```html\nREWRITTEN: ' + body + '\n```' if '<' in body else 'REWRITTEN: ' + body
    return 'Generic answer.'


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _send(self, code, obj, raw=None):
        body = raw.encode() if raw is not None else json.dumps(obj).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.startswith('/v1/models') or self.path.startswith('/api/v1/models'):
            return self._send(200, {'data': [{'id': 'gpt-4o-mini', 'created': 1}, {'id': 'gpt-4.1', 'created': 2}, {'id': 'claude-haiku-4-5', 'display_name': 'Claude Haiku 4.5'}]})
        if self.path.startswith('/v1beta/models'):
            return self._send(200, {'models': [{'name': 'models/gemini-2.5-flash', 'displayName': 'Gemini 2.5 Flash', 'supportedGenerationMethods': ['generateContent']}]})
        self._send(404, {'error': {'message': 'not found'}})

    def do_POST(self):
        n = int(self.headers.get('Content-Length', 0))
        req = json.loads(self.rfile.read(n) or b'{}')
        auth = self.headers.get('Authorization', '') + self.headers.get('x-api-key', '') + self.headers.get('x-goog-api-key', '')
        prompt, system, has_image = '', '', False
        if self.path.endswith('/chat/completions'):
            for m in req.get('messages', []):
                c = m['content']
                if isinstance(c, list):
                    for part in c:
                        if part.get('type') == 'text':
                            prompt += part['text']
                        if part.get('type') == 'image_url':
                            has_image = True
                elif m['role'] == 'system':
                    system += c
                else:
                    prompt += c
        elif self.path.endswith('/messages'):
            system = req.get('system', '')
            for part in req['messages'][0]['content']:
                if part['type'] == 'text':
                    prompt += part['text']
                if part['type'] == 'image':
                    has_image = True
        elif ':generateContent' in self.path:
            for part in req['contents'][0]['parts']:
                if 'text' in part:
                    prompt += part['text']
                if 'inline_data' in part:
                    has_image = True
            system = req.get('systemInstruction', {}).get('parts', [{}])[0].get('text', '')
        elif self.path.endswith('/responses'):
            inp = req.get('input')
            if isinstance(inp, str):
                prompt = inp
            else:
                for m in inp or []:
                    for part in m.get('content', []) if isinstance(m.get('content'), list) else []:
                        if part.get('type') == 'input_text':
                            prompt += part['text']
                        if part.get('type') == 'input_image':
                            has_image = True
            system = req.get('instructions', '') or ''
        with open(LOG, 'a') as f:
            f.write(json.dumps({'path': self.path, 'prompt': prompt, 'system': system, 'has_image': has_image, 'model': req.get('model'), 'keys': list(req.keys())}) + '\n')

        if 'bad-key' in auth:
            return self._send(401, {'error': {'message': 'Incorrect API key provided'}})
        if 'TRIGGER_RATE_LIMIT' in prompt:
            return self._send(429, {'error': {'message': 'Rate limit exceeded'}})
        if 'TRIGGER_SERVER_ERROR' in prompt:
            return self._send(500, {'error': {'message': 'Internal error'}})
        if 'TRIGGER_TIMEOUT' in prompt:
            time.sleep(13)
        text = answer(prompt, system)
        if self.path.endswith('/chat/completions'):
            if 'TRIGGER_MALFORMED_SHAPE' in prompt:
                return self._send(200, {'unexpected': True})
            return self._send(200, {'choices': [{'message': {'role': 'assistant', 'content': text}}]})
        if self.path.endswith('/messages'):
            return self._send(200, {'content': [{'type': 'text', 'text': text}]})
        if ':generateContent' in self.path:
            return self._send(200, {'candidates': [{'content': {'parts': [{'text': text}]}}]})
        if self.path.endswith('/responses'):
            return self._send(200, {'id': 'resp_1', 'status': 'completed', 'output': [{'id': 'msg_1', 'type': 'message', 'role': 'assistant', 'status': 'completed', 'content': [{'type': 'output_text', 'text': text, 'annotations': []}]}], 'usage': {'input_tokens': 10, 'output_tokens': 10, 'total_tokens': 20}})
        self._send(404, {'error': {'message': 'unknown'}})


if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1]) if len(sys.argv) > 1 else 9999), H).serve_forever()
