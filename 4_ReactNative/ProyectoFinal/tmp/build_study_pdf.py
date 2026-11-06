from pathlib import Path
from html import escape
import re,json
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,Table,TableStyle,KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT
from pypdf import PdfReader
from pdf2image import convert_from_path
from PIL import Image,ImageOps,ImageDraw

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/pdf/Guia_de_estudio_EstanciaApp.pdf'
OUT.parent.mkdir(exist_ok=True,parents=True)
QA=ROOT/'tmp/guia_pdf_qa';QA.mkdir(exist_ok=True)
for name,file in [('Body','calibri.ttf'),('Bold','calibrib.ttf'),('Italic','calibrii.ttf')]:
    pdfmetrics.registerFont(TTFont(name,'C:/Windows/Fonts/'+file))
styles={
 'body':ParagraphStyle('body',fontName='Body',fontSize=11,leading=13,spaceAfter=5),
 'h1':ParagraphStyle('h1',fontName='Bold',fontSize=20,leading=23,spaceAfter=12,keepWithNext=True),
 'title':ParagraphStyle('title',fontName='Bold',fontSize=25,leading=28,spaceAfter=12,keepWithNext=True),
 'h2':ParagraphStyle('h2',fontName='Bold',fontSize=13,leading=16,spaceAfter=5,spaceBefore=8,keepWithNext=True),
 'ref':ParagraphStyle('ref',fontName='Body',fontSize=9.2,leading=10.2,spaceAfter=3.5,textColor=colors.HexColor('#37483C'),splitLongWords=True),
 'bullet':ParagraphStyle('bullet',fontName='Body',fontSize=11,leading=13.2,leftIndent=11,firstLineIndent=-8,spaceAfter=4),
 'cell':ParagraphStyle('cell',fontName='Body',fontSize=9.5,leading=11),
 'cellhead':ParagraphStyle('cellhead',fontName='Bold',fontSize=9.5,leading=11,textColor=colors.white),
 'toc':ParagraphStyle('toc',fontName='Body',fontSize=10.5,leading=12.3,spaceAfter=1.5),
}
story=[];lines=(ROOT/'tmp/guia_estudio_contenido.md').read_text(encoding='utf8').splitlines()
first=True;i=0;sections=[]
def txt(t):return escape(t)
while i<len(lines):
    l=lines[i].strip();i+=1
    if not l:continue
    if l=='---PAGE---':story.append(PageBreak());continue
    if l.startswith('|'):
        raw=[l]
        while i<len(lines) and lines[i].strip().startswith('|'):
            raw.append(lines[i].strip());i+=1
        rows=[[v.strip() for v in r.strip('|').split('|')] for r in raw]
        rows=[rows[0]]+rows[2:]
        t=Table([[Paragraph(txt(c),styles['cellhead' if ri==0 else 'cell']) for c in row] for ri,row in enumerate(rows)],colWidths=[192,320],repeatRows=1,hAlign='LEFT')
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#34463B')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F3F5F3')]),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#D9D9D9')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3)]))
        story.extend([t,Spacer(1,5)]);continue
    if l.startswith('@'):
        path,needle=l[1:].split('|',1)
        n=next(n for n,text in enumerate((ROOT/path).read_text(encoding='utf-8-sig').splitlines(),1) if needle in text)
        story.append(Paragraph(txt(f'{path} · línea {n}')+'<br/>'+txt('Buscar: '+needle),styles['ref']))
    elif l.startswith('# '):
        title=l[2:]; anchor='inicio' if first else 'sec'+title.split()[0]
        story.append(Paragraph(f'<a name="{anchor}"/>'+txt(title),styles['title' if first else 'h1']))
        sections.append((anchor,title));first=False
    elif l.startswith('## '):story.append(Paragraph(txt(l[3:]),styles['h2']))
    elif l.startswith('- '):story.append(Paragraph('• '+txt(l[2:]),styles['bullet']))
    elif re.match(r'^\d+\. ',l) and len(l)<90 and len(sections)==1:
        n=l.split('.')[0];story.append(Paragraph(f'<link href="#sec{n}" color="#000000">{txt(l)}</link>',styles['toc']))
    else:story.append(Paragraph(txt(l),styles['body']))

def page(canvas,doc):
    canvas.saveState();canvas.setFont('Body',8);canvas.setFillColor(colors.HexColor('#435346'))
    canvas.drawString(50,767,'ESTANCIAAPP  ·  GUÍA DEL CÓDIGO  ·  NOVIEMBRE 2026')
    canvas.drawRightString(562,24,f'Página {doc.page}')
    canvas.restoreState()
doc=SimpleDocTemplate(str(OUT),pagesize=(612,792),leftMargin=50,rightMargin=50,topMargin=42,bottomMargin=42,title='EstanciaApp guía para ubicar y explicar el código',author='',allowSplitting=1)
doc.build(story,onFirstPage=page,onLaterPages=page)
reader=PdfReader(str(OUT));print('Pages',len(reader.pages))
for n,p in enumerate(reader.pages,1):
    text=p.extract_text()
    print(n,len(text),text.splitlines()[1][:90] if len(text.splitlines())>1 else text[:90])
images=convert_from_path(str(OUT),dpi=110,output_folder=str(QA),fmt='png',paths_only=True,thread_count=4)
thumb_w=306;thumb_h=421
for start in range(0,len(images),6):
    sheet=Image.new('RGB',(thumb_w*3,thumb_h*2),'#bdc5bf');draw=ImageDraw.Draw(sheet)
    for j,path in enumerate(images[start:start+6]):
        im=Image.open(path).convert('RGB');im.thumbnail((294,389))
        x=(j%3)*thumb_w+6;y=(j//3)*thumb_h+22
        sheet.paste(im,(x,y));draw.text((x,y-17),f'Página {start+j+1}',fill='black')
    sheet.save(QA/f'contact_{start//6+1}.png')
print('Rendered',len(images),'pages to',QA)
