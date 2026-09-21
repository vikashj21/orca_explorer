"""Render the supplied manual, retaining complete diagrams and annotations.
Usage: python3 scripts/extract-assembly-v2-manual.py /path/to/manual-part-a.pdf
Requires Poppler (pdftoppm) and Pillow.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
from PIL import Image

source = Path(sys.argv[1])
output = Path(__file__).resolve().parents[1] / 'public/assembly/v2/manual'
output.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='orca-manual-') as directory:
    subprocess.run(['pdftoppm', '-scale-to', '2400', '-png', str(source), f'{directory}/page'], check=True)
    pages = sorted(Path(directory).glob('page-*.png'))
    if len(pages) != 32:
        raise ValueError('Expected the supplied 32-page manual-part-a.pdf')
    for number, page in enumerate(pages, 1):
        with Image.open(page) as image:
            image.convert('RGB').save(output / f'page-{number:02}.webp', quality=90, method=6)
(output / 'source.json').write_text(json.dumps({
    'filename': source.name,
    'sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'pages': len(pages),
    'method': 'Full pages rendered with Poppler at 2400 pixels wide and encoded as WebP quality 90. Original colours, labels, arrows and diagram groupings preserved.',
}, indent=2) + '\n')
print(f'Extracted {len(pages)} manual pages to {output}')
