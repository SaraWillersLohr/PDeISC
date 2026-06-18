from pathlib import Path
import re

root = Path(r"C:/Users/Sara Willers/Desktop/PDeISC/1_NodeJS/NSJ3")
if_pattern = re.compile(r'^(?P<indent>\s*)(if\s*\(.+\))')

headers = {
    '.js': '// Comentarios claros: este archivo explica la lógica paso a paso.\n',
    '.html': '<!-- Comentarios claros: esta página muestra la estructura y el contenido. -->\n',
    '.css': '/* Comentarios claros: estas reglas controlan el estilo visual. */\n'
}

files = [p for p in root.rglob('*') if p.suffix in headers and 'node_modules' not in p.parts]
for path in files:
    text = path.read_text(encoding='utf-8')
    if not text:
        continue
    original = text
    if path.suffix == '.js':
        lines = text.splitlines()
        new_lines = []
        idx = 0
        while idx < len(lines) and lines[idx].strip() == '':
            new_lines.append(lines[idx])
            idx += 1
        if idx < len(lines) and not lines[idx].lstrip().startswith('//'):
            new_lines.append(headers['.js'])
        while idx < len(lines):
            line = lines[idx]
            if_match = if_pattern.match(line)
            if if_match:
                prev_nonblank = None
                for prev in reversed(new_lines):
                    if prev.strip() == '':
                        continue
                    prev_nonblank = prev
                    break
                if prev_nonblank is None or not prev_nonblank.lstrip().startswith('//'):
                    cond = if_match.group(2)
                    comment = f"{if_match.group('indent')}// Si {cond}, entonces se ejecuta este bloque."
                    new_lines.append(comment)
            new_lines.append(line)
            idx += 1
        text = '\n'.join(new_lines) + ('' if text.endswith('\n') else '\n')
    elif path.suffix == '.html':
        stripped = text.lstrip()
        if not stripped.startswith('<!--'):
            text = headers['.html'] + text
    elif path.suffix == '.css':
        stripped = text.lstrip()
        if not stripped.startswith('/*'):
            text = headers['.css'] + text
    if text != original:
        path.write_text(text, encoding='utf-8')
        print(f'Modified: {path}')
print(f'Done: {len(files)} files scanned')
