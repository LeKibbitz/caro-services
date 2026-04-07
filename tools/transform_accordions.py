"""Transform page-content h2 sections into accordion items."""
import re
import sys

# Sections to keep as standalone heading (not accordion)
FAQ_HEADINGS = ['Questions fr', 'Frequently asked']


def find_div_end(html, start):
    """Find the closing </div> index for a div starting at `start`."""
    pos = start + 1
    depth = 1
    while pos < len(html):
        open_tag = html.find('<div', pos)
        close_tag = html.find('</div>', pos)
        if close_tag == -1:
            break
        if open_tag != -1 and open_tag < close_tag:
            depth += 1
            pos = open_tag + 4
        else:
            depth -= 1
            if depth == 0:
                return close_tag
            pos = close_tag + 6
    return -1


def extract_h2_head_attrs(h2_tag):
    """Return (data_fr, data_en, visible_text) from an h2 tag string."""
    fr = re.search(r'data-fr="([^"]*)"', h2_tag)
    en = re.search(r'data-en="([^"]*)"', h2_tag)
    text = re.search(r'>([^<]+)<', h2_tag)
    return (
        fr.group(1) if fr else '',
        en.group(1) if en else '',
        text.group(1).strip() if text else '',
    )


def is_faq_heading(fr_text, en_text, vis_text):
    for marker in FAQ_HEADINGS:
        if marker in fr_text or marker in en_text or marker in vis_text:
            return True
    return False


def transform(html):
    if 'class="acc-item' in html:
        print('  [SKIP] already transformed')
        return html

    marker = '<div class="page-content rv">'
    start = html.find(marker)
    if start == -1:
        print('  [SKIP] no page-content rv found')
        return html

    inner_start = start + len(marker)
    end = find_div_end(html, start)
    if end == -1:
        print('  [SKIP] could not find closing div')
        return html

    inner = html[inner_start:end]

    # Split by h2 tags
    h2_re = re.compile(r'(<h2[^>]*>.*?</h2>)', re.DOTALL)
    parts = h2_re.split(inner)
    # parts = [before_first_h2, h2_tag, content, h2_tag, content, ...]

    preamble = parts[0]  # content before first h2 (usually whitespace)
    h2_tags = parts[1::2]
    bodies = parts[2::2]

    acc_items = []
    first_open = True

    for h2_tag, body in zip(h2_tags, bodies):
        fr, en, vis = extract_h2_head_attrs(h2_tag)

        if is_faq_heading(fr, en, vis):
            # Keep as standalone heading with special class
            acc_items.append(
                f'        <h2 class="faq-heading" data-fr="{fr}" data-en="{en}">{vis}</h2>'
            )
            if body.strip():
                acc_items.append(body)
            continue

        open_class = ' open' if first_open else ''
        first_open = False

        acc_items.append(
            f'        <div class="acc-item{open_class}" onclick="toggleAcc(this)">\n'
            f'          <div class="acc-head" data-fr="{fr}" data-en="{en}">{vis}</div>\n'
            f'          <div class="acc-body">{body}          </div>\n'
            f'        </div>'
        )

    new_inner = (
        preamble
        + '        <div class="acc-wrap">\n'
        + '\n'.join(acc_items)
        + '\n        </div>\n      '
    )

    return html[:inner_start] + new_inner + html[end:]


def add_toggle_acc(html):
    """Add toggleAcc function to the inline script if not already present."""
    if 'function toggleAcc' in html:
        return html
    # Insert after toggleFaq
    return html.replace(
        'function toggleFaq(el)',
        'function toggleAcc(el){var item=el.closest?el.closest(\'.acc-item\'):el;if(item)item.classList.toggle(\'open\')}\n    function toggleFaq(el)',
    )


PAGES = [
    'frontaliers-france-luxembourg/index.html',
    'residents-luxembourg/index.html',
    'comptabilite-independants-luxembourg/index.html',
    'creation-entreprise-luxembourg/index.html',
]

import os
base = os.path.join(os.path.dirname(__file__), '..', 'website')

for page in PAGES:
    path = os.path.join(base, page)
    print(f'Processing {page}...')
    with open(path, encoding='utf-8') as f:
        html = f.read()

    transformed = transform(html)
    transformed = add_toggle_acc(transformed)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(transformed)
    print(f'  Done.')

print('All pages transformed.')
