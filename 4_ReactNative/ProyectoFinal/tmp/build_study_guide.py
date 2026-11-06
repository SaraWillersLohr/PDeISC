from pathlib import Path
import re, json
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'tmp/guia_estudio_contenido.md'
OUT = ROOT / 'Manuales/Guia_de_estudio_del_codigo_EstanciaApp.docx'
OUT.parent.mkdir(exist_ok=True)
doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Inches(8.5), Inches(11)
sec.top_margin, sec.bottom_margin = Inches(.62), Inches(.60)
sec.left_margin, sec.right_margin = Inches(.7), Inches(.7)
sec.header_distance, sec.footer_distance = Inches(.24), Inches(.24)
styles=doc.styles
for name in ['Normal','Title','Subtitle','Heading 1','Heading 2','Heading 3']:
    s=styles[name]
    s.font.name='Calibri'
    s.font.color.rgb=RGBColor(0,0,0)
    s.paragraph_format.space_after=Pt(6)
styles['Normal'].font.size=Pt(11)
styles['Normal'].paragraph_format.line_spacing=1.06
styles['Title'].font.size=Pt(25)
styles['Title'].paragraph_format.space_after=Pt(12)
styles['Heading 1'].font.size=Pt(20)
styles['Heading 1'].paragraph_format.space_after=Pt(10)
styles['Heading 2'].font.size=Pt(13)
styles['Heading 2'].paragraph_format.space_before=Pt(10)
styles['Heading 2'].paragraph_format.space_after=Pt(5)
for name in ['List Bullet','List Number']:
    styles[name].font.name='Calibri'; styles[name].font.size=Pt(11)
    styles[name].paragraph_format.space_after=Pt(4)
    styles[name].paragraph_format.line_spacing=1.03
if 'Code Reference' not in styles:
    styles.add_style('Code Reference',1)
s=styles['Code Reference'];s.font.name='Consolas';s.font.size=Pt(9)
s.font.color.rgb=RGBColor.from_string('3C4940')
s.paragraph_format.space_after=Pt(4)
s.paragraph_format.line_spacing=1
header=sec.header.paragraphs[0]
header.text='ESTANCIAAPP  ·  GUÍA DEL CÓDIGO  ·  NOVIEMBRE 2026'
header.runs[0].font.size=Pt(8)
footer=sec.footer.paragraphs[0];footer.alignment=2
r=footer.add_run('Página ');r.font.size=Pt(9)
fld=OxmlElement('w:fldSimple');fld.set(qn('w:instr'),'PAGE');footer._p.append(fld)
refs=[]

def paragraph(text, style=None):
    p=doc.add_paragraph(text,style)
    p.paragraph_format.widow_control=True
    return p

def table(lines):
    rows=[[v.strip() for v in l.strip().strip('|').split('|')] for l in lines]
    rows=[rows[0]]+rows[2:]
    t=doc.add_table(rows=0, cols=len(rows[0]));t.autofit=False
    widths=[2.6,4.5] if len(rows[0])==2 else [7.1/len(rows[0])]*len(rows[0])
    for col,w in zip(t.columns,widths):col.width=Inches(w)
    borders=OxmlElement('w:tblBorders')
    for edge in ['top','left','bottom','right','insideH','insideV']:
        el=OxmlElement('w:'+edge);el.set(qn('w:val'),'single');el.set(qn('w:sz'),'4');el.set(qn('w:color'),'D9D9D9');borders.append(el)
    t._tbl.tblPr.append(borders)
    for i,row in enumerate(rows):
        cells=t.add_row().cells
        for j,text in enumerate(row):
            cells[j].width=Inches(widths[j]);cells[j].vertical_alignment=1
            tcPr=cells[j]._tc.get_or_add_tcPr()
            margins=OxmlElement('w:tcMar')
            for edge,val in [('top',75),('bottom',75),('left',95),('right',95)]:
                e=OxmlElement('w:'+edge);e.set(qn('w:w'),str(val));e.set(qn('w:type'),'dxa');margins.append(e)
            tcPr.append(margins)
            shd=OxmlElement('w:shd');shd.set(qn('w:fill'),'34463B' if i==0 else ('F3F5F3' if i%2==0 else 'FFFFFF'));tcPr.append(shd)
            p=cells[j].paragraphs[0];p.paragraph_format.space_after=Pt(0);p.paragraph_format.line_spacing=1.0
            # Permit line wrapping in long paths and identifiers.
            run=p.add_run(text.replace('/', '/\u200b').replace('_','_\u200b'))
            run.font.size=Pt(9.5);run.bold=i==0
            if i==0:run.font.color.rgb=RGBColor(255,255,255)
        if i==0:
            repeat=OxmlElement('w:tblHeader');t.rows[i]._tr.get_or_add_trPr().append(repeat)
        cant=OxmlElement('w:cantSplit');t.rows[i]._tr.get_or_add_trPr().append(cant)
    paragraph('').paragraph_format.space_after=Pt(0)

lines=SOURCE.read_text(encoding='utf-8').splitlines();i=0;first=True
while i<len(lines):
    line=lines[i].strip()
    if not line:i+=1;continue
    if line=='---PAGE---':doc.add_page_break();i+=1;continue
    if line.startswith('|'):
        block=[]
        while i<len(lines) and lines[i].strip().startswith('|'):
            block.append(lines[i]);i+=1
        table(block);continue
    if line.startswith('@'):
        path,needle=line[1:].split('|',1)
        file=ROOT/path
        content=file.read_text(encoding='utf-8-sig').splitlines()
        matches=[n for n,l in enumerate(content,1) if needle in l]
        if not matches:raise ValueError(f'Unresolved reference: {path} {needle}')
        refs.append(dict(file=path,line=matches[0],search=needle))
        paragraph(f'{path} · línea {matches[0]}\nBuscar: {needle}', 'Code Reference')
    elif line.startswith('# '):
        p=doc.add_paragraph(line[2:], 'Title' if first else 'Heading 1');first=False
    elif line.startswith('## '):doc.add_paragraph(line[3:],'Heading 2')
    elif line.startswith('- '):paragraph(line[2:],'List Bullet')
    elif re.match(r'^\d+\. ',line):paragraph(line)
    else:paragraph(line)
    i+=1

doc.core_properties.title='EstanciaApp guía para ubicar y explicar el código'
doc.core_properties.subject='Guía de estudio de pantallas funciones y reglas del proyecto'
doc.core_properties.author=''
doc.save(OUT)
(ROOT/'tmp/guia_referencias_verificadas.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Saved {OUT}; {len(refs)} source references verified; {len(SOURCE.read_text(encoding="utf-8").split())} words')
