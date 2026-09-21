"""Mirror the published ORCA assembly diagrams with source attribution.

The guide and illustrations are credited to the ORCA project (CC BY 4.0).
Only image assets are copied; the app's instructions are separately authored.
"""
import json
import re
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, quote, unquote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assembly'
OUT.mkdir(parents=True, exist_ok=True)
STEPS = [i for i in range(32) if i not in (4, 27, 28)]
BASE = 'https://orca.ethz.ch/assembly/'

def fetch(url):
    request = Request(url, headers={'User-Agent': 'OrcaAtlas/1.0 (educational assembly guide)'})
    with urlopen(request, timeout=45) as response:
        return response.read()

class Images(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
    def handle_starttag(self, tag, attrs):
        if tag == 'img':
            src = dict(attrs).get('src')
            if src and not src.startswith('data:'):
                self.images.append((src, dict(attrs).get('alt', '')))

def caption(text):
    """Keep the source image's own caption, without Markdown presentation."""
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text).replace('**', '')
    text = ' '.join(text.split())
    return '' if re.fullmatch(r'Image \d+', text) else text

def page(number):
    url = BASE + f'Orca%20Hand_step{number:02}.html'
    parser = Images()
    parser.feed(fetch(url).decode('utf-8'))
    diagrams = []
    for index, (src, alt) in enumerate(dict(parser.images).items()):
        image_url = quote(unquote(urljoin(url, src)), safe=':/')
        assert urlparse(image_url).netloc == 'orca.ethz.ch'
        suffix = Path(urlparse(image_url).path).suffix.lower()
        assert suffix in ('.png', '.jpg', '.jpeg', '.webp', '.gif'), suffix
        filename = f'{number:02}-{index + 1:02}{suffix}'
        target = OUT / filename
        if not target.exists():
            target.write_bytes(fetch(image_url))
        diagrams.append({'src': '/assembly/' + filename, 'source': image_url, 'caption': caption(alt)})
    assert diagrams, f'No images for step {number}'
    print(f'Step {number:02}: {len(diagrams)} diagrams', flush=True)
    return (f'{number:02}', diagrams)

with ThreadPoolExecutor(max_workers=4) as pool:
    data = dict(pool.map(page, STEPS))
(OUT / 'diagrams.json').write_text(json.dumps(data, indent=2) + '\n')
print(f'Published {sum(map(len, data.values()))} original diagrams across {len(data)} steps.', flush=True)
