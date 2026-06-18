from pathlib import Path
import re

root = Path(r"C:/Users/Sara Willers/Desktop/PDeISC/2_JS")
if_pattern = re.compile(r'^(?P<indent>\s*)(if\s*\(.+\))')
else_if_pattern = re.compile(r'^(?P<indent>\s*)(else\s+if\s*\(.+\))')
for_pattern = re.compile(r'^(?P<indent>\s*)(for\s*\(.+\)|for\s+.+\s+of\s+.+|for\s+.+\s+in\s+.+)')
while_pattern = re.compile(r'^(?P<indent>\s*)(while\s*\(.+\))')
do_pattern = re.compile(r'^(?P<indent>\s*)(do\s*\{)')
func_pattern = re.compile(r'^(?P<indent>\s*)(export\s+function\s+\w+|function\s+\w+|const\s+\w+\s*=\s*\(.+\)\s*=>|let\s+\w+\s*=\s*\(.+\)\s*=>|const\s+\w+\s*=\s*async\s*\(.+\)\s*=>|let\s+\w+\s*=\s*async\s*\(.+\)\s*=>)')

headers = {
    '.js': '// Comentarios claros: este archivo explica la lógica paso a paso.\n',
    '.html': '<!-- Comentarios claros: esta página muestra la estructura y el contenido. -->\n',
    '.css': '/* Comentarios claros: estas reglas controlan el estilo visual. */\n'
}

files = [p for p in root.rglob('*') if p.suffix in headers and 'node_modules' not in p.parts]
for path in sorted(files):
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
            stripped = line.lstrip()
            comment_line = None
            if func_pattern.match(line):
                if not stripped.startswith('//'):
                    name = stripped.split()[1] if stripped.startswith('function') else stripped.split()[1].split('=')[0]
                    comment_line = f"{line[:len(line)-len(stripped)]}// Función {name} que ayuda a entender la lógica."
            elif else_if_pattern.match(line):
                comment_line = f"{line[:len(line)-len(stripped)]}// Si {stripped[5:]}, entonces se ejecuta este bloque."  # after else
            elif if_pattern.match(line):
                comment_line = f"{line[:len(line)-len(stripped)]}// Si {stripped}, entonces se ejecuta este bloque."
            elif for_pattern.match(line):
                comment_line = f"{line[:len(line)-len(stripped)]}// Repite este bloque con un bucle for."  
            elif while_pattern.match(line):
                comment_line = f"{line[:len(line)-len(stripped)]}// Repite mientras la condición sea verdadera."  
            elif do_pattern.match(line):
                comment_line = f"{line[:len(line)-len(stripped)]}// Ejecuta este bloque al menos una vez y luego repite mientras la condición sea verdadera."  
            if comment_line:
                prev_nonblank = None
                for prev in reversed(new_lines):
                    if prev.strip() == '':
                        continue
                    prev_nonblank = prev
                    break
                if prev_nonblank is None or not prev_nonblank.lstrip().startswith('//'):
                    new_lines.append(comment_line)
            new_lines.append(line)
            idx += 1
        text = '\n'.join(new_lines) + ('' if text.endswith('\n') else '\n')
    else:
        stripped = text.lstrip()
        if path.suffix == '.html' and not stripped.startswith('<!--'):
            text = headers['.html'] + text
        elif path.suffix == '.css' and not stripped.startswith('/*'):
            text = headers['.css'] + text
    if text != original:
        path.write_text(text, encoding='utf-8')
        print(f'Modified: {path}')
print(f'Done: {len(files)} files scanned')
