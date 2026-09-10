"""Build a local-preview Latin font from the user-supplied Slim Font game mod.

Requires Python fonttools + pillow, and potrace on PATH.
Format reference: Meloman19/PersonaEditor, PersonaEditorLib/Other/FNT*.cs
The source contains raster glyphs; contours are traced, not original outlines.
"""
from pathlib import Path
import argparse
import shutil
import struct
import subprocess
import tempfile
import xml.etree.ElementTree as ET

from PIL import Image, ImageFilter
from fontTools.fontBuilder import FontBuilder
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--bold', action='store_true', help='Thicken glyph strokes by one source pixel without changing advance widths')
args = parser.parse_args()
SOURCE = ROOT / 'references/fonts/p4gpc_slimfont3_0_0/FEmulator/PAK/init.bin/system/font/font0.fnt'
OUTPUT = ROOT / 'assets/themes/persona/fonts' / ('slim-latin-bold.woff' if args.bold else 'slim-latin.woff')
data = SOURCE.read_bytes()
u32 = lambda offset: struct.unpack_from('<I', data, offset)[0]
u16 = lambda offset: struct.unpack_from('<H', data, offset)[0]
count, width, height, glyph_bytes = struct.unpack_from('<HHHH', data, 14)
assert (u32(0), width, height, glyph_bytes) == (32, 64, 64, 2048), 'Unsupported font format'
cut_start = u32(0) + 16 * 4 + 4
header = cut_start + u32(cut_start - 4) + count * 4 + 4
header_size, dictionary_size, compressed_size = struct.unpack_from('<III', data, header)
dictionary_start = header + header_size
compressed_start = dictionary_start + dictionary_size + u32(header + 24)
assert compressed_start + compressed_size <= len(data), 'Truncated font'
tree = [struct.unpack_from('<HHH', data, offset)[1:]
        for offset in range(dictionary_start, dictionary_start + dictionary_size, 6)]
decoded = bytearray()
node = 0
for byte in data[compressed_start:compressed_start + compressed_size]:
    for bit in range(8):
        node = tree[node][(byte >> bit) & 1]
        if tree[node][0] == 0:
            decoded.append(tree[node][1])
            node = 0
    if len(decoded) >= 95 * glyph_bytes:
        break
assert len(decoded) >= 95 * glyph_bytes, 'Incomplete Latin glyphs'

potrace = shutil.which('potrace')
assert potrace, 'Install potrace to trace the raster glyphs'
glyphs = {'.notdef': TTGlyphPen(None).glyph()}
metrics = {'.notdef': (512, 0)}
mapping = {}
with tempfile.TemporaryDirectory(prefix='persona-font-') as temporary:
    directory = Path(temporary)
    for codepoint in range(32, 127):
        index = codepoint - 32
        name = f'uni{codepoint:04X}'
        mapping[codepoint] = name
        pixels = bytearray()
        for byte in decoded[index * glyph_bytes:(index + 1) * glyph_bytes]:
            pixels.extend((255 - (byte & 15) * 17, 255 - (byte >> 4) * 17))
        mask = Image.frombytes('L', (width, height), bytes(pixels)).point(lambda p: 255 if p >= 128 else 0, '1')
        bounds = mask.convert('L').point(lambda p: 255 - p).getbbox()
        if args.bold:
            # Grow the black ink, retaining the original bounds for spacing.
            mask = mask.convert('L').filter(ImageFilter.MinFilter(3)).convert('1')
        pen = TTGlyphPen(None)
        if bounds:
            left = bounds[0]
            pbm, svg = directory / 'glyph.pbm', directory / 'glyph.svg'
            mask.save(pbm)
            subprocess.run([potrace, str(pbm), '--svg', '--flat', '--turdsize', '1',
                            '--opttolerance', '0.15', '--output', str(svg)], check=True, capture_output=True)
            # Potrace path units are tenths of a pixel, with origin at bottom left.
            # 16 font units per pixel; glyph baseline is 54px from the cell top.
            transformed = TransformPen(Cu2QuPen(pen, max_err=1, reverse_direction=False),
                                       (1.6, 0, 0, 1.6, 32 - left * 16, -160))
            for element in ET.parse(svg).iter('{http://www.w3.org/2000/svg}path'):
                parse_path(element.attrib['d'], transformed)
            advance = (bounds[2] - left + 4) * 16
        else:
            advance = 320
        glyphs[name] = pen.glyph()
        glyphs[name].recalcBounds(None)
        metrics[name] = (advance, glyphs[name].xMin if bounds else 0)

builder = FontBuilder(1024, isTTF=True)
builder.setupGlyphOrder(list(glyphs))
builder.setupCharacterMap(mapping)
builder.setupGlyf(glyphs)
builder.setupHorizontalMetrics(metrics)
builder.setupHorizontalHeader(ascent=864, descent=-160, lineGap=80)
style = 'Bold' if args.bold else 'Regular'
builder.setupNameTable({'familyName': 'Persona Slim Local', 'styleName': style,
                        'uniqueFontIdentifier': f'PersonaSlimLocal-Latin-1-{style}',
                        'fullName': f'Persona Slim Local {style}',
                        'psName': f'PersonaSlimLocal-{style}',
                        'version': 'Version 1.0',
                        'description': 'Latin contours traced from the user-supplied P4G Slim Font mod by Tekka and Pixelguin.'})
builder.setupOS2(sTypoAscender=864, sTypoDescender=-160, sTypoLineGap=80,
                 usWinAscent=1024, usWinDescent=256, usWeightClass=700 if args.bold else 400,
                 fsSelection=0x20 if args.bold else 0x40)
builder.font['head'].macStyle = 1 if args.bold else 0
builder.setupPost()
builder.font.flavor = 'woff'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
builder.save(OUTPUT)
print(f'{OUTPUT}: {len(mapping)} Latin glyphs')

# Widen the outlines AND advance widths so browser wrapping accounts for the
# extra space. CSS scaleX alone would paint over neighboring content.
wide = TTFont(OUTPUT)
source_glyphs = wide.getGlyphSet()
outlines = {}
for name in wide.getGlyphOrder():
    pen = TTGlyphPen(None)
    source_glyphs[name].draw(TransformPen(pen, (1.5, 0, 0, 1, 0, 0)))
    outlines[name] = pen.glyph()
for name, glyph in outlines.items():
    wide['glyf'][name] = glyph
    advance, bearing = wide['hmtx'][name]
    wide['hmtx'][name] = (round(advance * 1.5), round(bearing * 1.5))
for record in wide['name'].names:
    text = record.toUnicode().replace('Persona Slim Local', 'Persona Slim Wide').replace('PersonaSlimLocal', 'PersonaSlimWide')
    record.string = text.encode(record.getEncoding())
wide_output = OUTPUT.with_name('slim-latin-wide-bold.woff' if args.bold else 'slim-latin-wide.woff')
wide.save(wide_output)
print(f'{wide_output}: 150% horizontal width, original height')
