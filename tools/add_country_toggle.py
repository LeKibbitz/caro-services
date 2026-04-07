"""
Add France/Luxembourg country toggle to the TPE/PME page.
- Adds country switcher buttons (LU / FR)
- Tags current content as Luxembourg
- Extracts "Entrepreneurs français" sub-items → France accordion
- "Comment Caroline" duplicated for both countries with adapted copy
"""
import re

PATH = 'website/creation-entreprise-luxembourg/index.html'

with open(PATH, encoding='utf-8') as f:
    html = f.read()

# ── 1. Extract the 5 faq-items inside "Entrepreneurs français" acc-item ──────
# Each faq-item: <div class="faq-item" onclick="toggleFaq(this)"> ... </div>
faq_re = re.compile(
    r'<div class="faq-item" onclick="toggleFaq\(this\)">\s*'
    r'<div class="faq-q"(.*?)</div>\s*'
    r'<div class="faq-a"(.*?)</div>\s*'
    r'</div>',
    re.DOTALL
)

# Find within the "Entrepreneurs français" acc-body
efr_start = html.find('Entrepreneurs fran\u00e7ais : cr\u00e9er au Luxembourg')
efr_block_start = html.rfind('<div class="acc-item"', 0, efr_start)
efr_block_end = html.find('</div>\n        <div class="acc-item" onclick="toggleAcc(this)">\n          <div class="acc-head" data-fr="Comment Caroline', efr_block_start)
efr_block = html[efr_block_start:efr_block_end]

faq_items_raw = faq_re.findall(efr_block)

def build_fr_acc_item(head_attrs, body_attrs, first=False):
    """Build an acc-item from extracted faq-q/faq-a attribute strings."""
    # Extract data-fr, data-en, and visible text from head
    fr_m = re.search(r'data-fr="([^"]*)"', head_attrs)
    en_m = re.search(r'data-en="([^"]*)"', head_attrs)
    txt_m = re.search(r'>([^<]+)<', head_attrs + '>')
    fr = fr_m.group(1) if fr_m else ''
    en = en_m.group(1) if en_m else ''
    txt = txt_m.group(1).strip() if txt_m else fr

    # Extract data-fr, data-en, and visible HTML from body
    bfr_m = re.search(r'data-fr="([^"]*)"', body_attrs)
    ben_m = re.search(r'data-en="([^"]*)"', body_attrs)
    # Visible content is everything after the closing > of the div tag
    vis_m = re.search(r'>(.*)', body_attrs, re.DOTALL)
    bfr = bfr_m.group(1) if bfr_m else ''
    ben = ben_m.group(1) if ben_m else ''
    vis = vis_m.group(1).strip() if vis_m else ''

    open_cls = ' open' if first else ''
    return (
        f'        <div class="acc-item{open_cls}" onclick="toggleAcc(this)">\n'
        f'          <div class="acc-head" data-fr="{fr}" data-en="{en}">{txt}</div>\n'
        f'          <div class="acc-body" data-fr="{bfr}" data-en="{ben}">\n'
        f'        {vis}\n'
        f'          </div>\n'
        f'        </div>'
    )

fr_items_html = '\n'.join(
    build_fr_acc_item(h, b, first=(i == 0))
    for i, (h, b) in enumerate(faq_items_raw)
)

# ── 2. Build the France acc-wrap ──────────────────────────────────────────────
fr_caroline_p_fr = 'Vous gérez une société en France ou envisagez de créer une structure au Luxembourg ? Caroline vous accompagne dans les deux configurations :'
fr_caroline_p_en = 'Managing a company in France or considering a Luxembourg structure? Caroline supports you in both configurations:'
fr_caroline_ul_fr = [
    'Analyse comparative des formes juridiques France / Luxembourg',
    'Optimisation de la convention fiscale franco-luxembourgeoise',
    'Conseil sur la substance luxembourgeoise et les critères de résidence fiscale',
    'Accompagnement des professions libérales réglementées',
    'Structuration holding / filiale / succursale',
    'Coordination avec vos conseils en France (experts-comptables, avocats)',
]
fr_caroline_ul_en = [
    'Comparative analysis of French / Luxembourg legal forms',
    'Optimisation of the France-Luxembourg tax treaty',
    'Advice on Luxembourg substance and tax residence criteria',
    'Support for regulated liberal professions',
    'Holding / subsidiary / branch structuring',
    'Coordination with your French advisors (accountants, lawyers)',
]

fr_caroline_li_fr = '\n'.join(f'          <li data-fr="{t}" data-en="{e}">{t}</li>'
                              for t, e in zip(fr_caroline_ul_fr, fr_caroline_ul_en))
fr_acc_wrap = f'''        <div class="acc-wrap cs-hidden" data-country="fr">
{fr_items_html}
        <div class="acc-item" onclick="toggleAcc(this)">
          <div class="acc-head" data-fr="Comment Caroline peut vous aider" data-en="How Caroline can help you">Comment Caroline peut vous aider</div>
          <div class="acc-body">
        <p data-fr="{fr_caroline_p_fr}" data-en="{fr_caroline_p_en}">{fr_caroline_p_fr}</p>
        <ul>
{fr_caroline_li_fr}
        </ul>

        <div class="info-box">
          <p data-fr='<strong>Expertise transfrontalière :</strong> Caroline maîtrise les deux systèmes — France et Luxembourg. <a href="/#contact">Demandez un devis personnalisé</a>.' data-en='<strong>Cross-border expertise:</strong> Caroline masters both systems — France and Luxembourg. <a href="/#contact">Request a personalised quote</a>.'><strong>Expertise transfrontalière :</strong> Caroline maîtrise les deux systèmes — France et Luxembourg. <a href="/#contact">Demandez un devis personnalisé</a>.</p>
        </div>

                  </div>
        </div>
        </div>'''

# ── 3. Build the country switcher ─────────────────────────────────────────────
country_switch = '''        <div class="country-switch">
          <button class="cs-btn active" data-country="lu" onclick="setCountry('lu')">&#127466;&#127482; Luxembourg</button>
          <button class="cs-btn" data-country="fr" onclick="setCountry('fr')">&#127467;&#127479; France</button>
        </div>
'''

# ── 4. Build final acc-wrap opening with country tag ──────────────────────────
OLD_ACCWRAP = '                <div class="acc-wrap">'
NEW_ACCWRAP = country_switch + '        <div class="acc-wrap" data-country="lu">'

# ── 5. Locate and remove the "Entrepreneurs français" acc-item from LU ────────
# Also find the closing of LU acc-wrap and insert FR acc-wrap before faq-heading
efr_acc_item_start = html.find('<div class="acc-item" onclick="toggleAcc(this)">\n          <div class="acc-head" data-fr="Entrepreneurs fran')
if efr_acc_item_start == -1:
    raise ValueError('Could not find Entrepreneurs français acc-item')

# Find closing </div> for this acc-item
# It ends with:  </div>\n        </div>   (acc-body closing + acc-item closing)
efr_acc_item_end_search = html.find('\n        <div class="acc-item" onclick="toggleAcc(this)">\n          <div class="acc-head" data-fr="Comment Caroline', efr_acc_item_start)
if efr_acc_item_end_search == -1:
    raise ValueError('Could not find end of Entrepreneurs français acc-item')

EFR_BLOCK = html[efr_acc_item_start:efr_acc_item_end_search]

# ── 6. Locate the faq-heading to insert FR acc-wrap before it in main wrap ────
faq_heading_str = '        <h2 class="faq-heading"'

# ── 7. Apply transformations ──────────────────────────────────────────────────
# a) Replace acc-wrap opening
html = html.replace(OLD_ACCWRAP, NEW_ACCWRAP, 1)

# b) Remove "Entrepreneurs français" acc-item from LU content
html = html.replace(EFR_BLOCK, '', 1)

# c) Insert FR acc-wrap + faq-heading after LU acc-wrap closing, before page-content rv for FAQ
# LU acc-wrap closing is '        </div>\n      </div>\n\n      <div class="page-content rv">'
old_lu_end = '        </div>\n      </div>\n\n      <div class="page-content rv">'
new_lu_end = (
    '        </div>\n'
    + faq_heading_str[8:].lstrip()  # just use literal below
    + '\n'
)
# Actually, let's be more explicit:
# Find the faq-heading and insert FR acc-wrap before it
html = html.replace(
    faq_heading_str,
    fr_acc_wrap + '\n' + faq_heading_str,
    1
)

# ── 8. Add setCountry JS function ─────────────────────────────────────────────
if 'function setCountry' not in html:
    html = html.replace(
        'function toggleAcc(el)',
        "function setCountry(c){"
        "document.querySelectorAll('.cs-btn').forEach(function(b){b.classList.toggle('active',b.dataset.country===c)});"
        "document.querySelectorAll('[data-country]').forEach(function(el){el.classList.toggle('cs-hidden',el.dataset.country!==c&&el.dataset.country!=='both')});"
        "localStorage.setItem('caroCountry',c)}"
        "\n    function toggleAcc(el)",
        1
    )

# ── 9. Init setCountry on DOMContentLoaded ────────────────────────────────────
if 'caroCountry' not in html:
    html = html.replace(
        "var mode=localStorage.getItem('caroMode')",
        "var country=localStorage.getItem('caroCountry')||'lu';setCountry(country);"
        "\n      var mode=localStorage.getItem('caroMode')",
        1
    )

with open(PATH, 'w', encoding='utf-8') as f:
    f.write(html)

print('Done.')
