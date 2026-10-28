// sincronizo agendas públicas de asociaciones sin reemplazar datos cuando una fuente falla.
import { createHash } from 'node:crypto';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';

interface EventSource extends RowDataPacket { codigo_fuente: string; nombre: string; url: string; especie: string | null; raza: string | null; }
interface ParsedEvent {
  externalKey: string; title: string; description: string | null; kind: string;
  start: string; end: string | null; province: string | null; locality: string | null;
  location: string | null; organizer: string; species: string | null; breed: string | null; url: string | null;
}

const eventLinkWords = /remat|expos|event|agenda|calend|feria|actividad|programa/i;
const associationEventPages: Record<string, string[]> = {
  angus_argentina: ['https://www.angus.org.ar/auspiciosremates/index.php', 'https://www.angus.org.ar/calendario.php'],
  hereford_argentina: ['https://www.hereford.org.ar/web/exposiciones-patrocinadas/', 'https://www.hereford.org.ar/web/remates/', 'https://www.hereford.org.ar/web/remates-calendario/categoria/remates/'],
  brangus_argentina: ['https://brangus.org.ar/exposiciones/', 'https://brangus.org.ar/remates/'],
  bonsmara_argentina: ['https://bonsmara.org.ar/eventos/', 'https://bonsmara.org.ar/noticias/'],
  caballos_criollos_argentina: ['https://caballoscriollos.com/web/calendario.php', 'https://caballoscriollos.com/web/aparte', 'https://caballoscriollos.com/web/noticias.php?IdCategoria=13'],
  cuarto_de_milla_argentina: ['https://w3.caccm.com.ar/eventos'],
  caballo_de_polo_argentina: ['https://www.criapoloargentino.com.ar/actividades', 'https://info.criapoloargentino.com.ar/noticias.php'],
  caballos_arabes_argentina: ['https://www.aacca.com.ar/resultados'],
  spc_argentina: ['https://criadores-spc.com.ar/noticias/'],
  caballo_peruano_argentina: ['https://aaccpp.org.ar/concursonacionalargentina2026/'],
  braford_argentina: ['https://www.braford.org.ar/calendario-de-remates-auspiciados-2026/', 'https://www.braford.org.ar/resultados-de-exposiciones/'],
  merino_argentina: ['https://www.merino.org.ar/exposiciones/'],
  hampshire_down_argentina: ['https://hampshiredown.org.ar/calendario/'],
  corriedale_argentina: ['https://www.corriedale.org.ar/'],
  porcinos_argentina: ['https://porcinos.org.ar/noticias/noticias'],
};
const provinces = ['Buenos Aires','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán','Ciudad Autónoma de Buenos Aires'];
const spanishMonths: Record<string, number> = { ene: 1, enero: 1, feb: 2, febrero: 2, mar: 3, marzo: 3, abr: 4, abril: 4, may: 5, mayo: 5, jun: 6, junio: 6, jul: 7, julio: 7, ago: 8, agosto: 8, sep: 9, sept: 9, septiembre: 9, setiembre: 9, oct: 10, octubre: 10, nov: 11, noviembre: 11, dic: 12, diciembre: 12, jan: 1, january: 1, february: 2, march: 3, apr: 4, april: 4, june: 6, july: 7, aug: 8, august: 8, september: 9, october: 10, november: 11, dec: 12, december: 12 };

// decodifico entidades comunes antes de evaluar títulos, fechas y lugares.
function decodeEntities(value: string): string {
  return value.replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, number: string) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_match, number: string) => String.fromCodePoint(Number.parseInt(number, 16)));
}

// convierto un fragmento html en texto legible para buscar datos publicados.
function plainText(html: string): string {
  return decodeEntities(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ').trim();
}

// convierto fechas ISO, numéricas y en español al formato de mysql.
function parseDate(value: string): { date: string; end: string | null } | null {
  const text = plainText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
  const iso = /(20\d{2})-(\d{1,2})-(\d{1,2})/.exec(text);
  if (iso) return makeDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  const numeric = /\b(\d{1,2})[/.\-](\d{1,2})[/.\-](20\d{2})\b/.exec(text);
  if (numeric) return makeDate(Number(numeric[3]), Number(numeric[2]), Number(numeric[1]));
  const shortYear = /\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2})\b/.exec(text);
  if (shortYear) return makeDate(2000 + Number(shortYear[3]), Number(shortYear[2]), Number(shortYear[1]));
  const monthPattern = Object.keys(spanishMonths).sort((a, b) => b.length - a.length).join('|');
  const dayFirst = new RegExp(`\\b(\\d{1,2})(?:\\s*(?:al|a|y|-)\\s*(\\d{1,2}))?\\s*(?:[-/.]\\s*|de\\s*)?(${monthPattern})\\s*(?:de\\s*)?(20\\d{2})?\\b`, 'i').exec(text);
  const monthFirst = new RegExp(`\\b(${monthPattern})\\s+(\\d{1,2})(?:,?\\s+(20\\d{2}))?\\b`, 'i').exec(text);
  const range = dayFirst;
  if (!range && !monthFirst) return null;
  const year = Number(range?.[4] || monthFirst?.[3] || new Date().getFullYear());
  const month = range ? spanishMonths[range[3]] : spanishMonths[monthFirst![1]];
  const start = makeDate(year, month, Number(range?.[1] ?? monthFirst?.[2]));
  if (!start || !range?.[2]) return start;
  const end = makeDate(year, month, Number(range[2]));
  return end ? { ...start, end: end.date } : start;
}

// valido los componentes de fecha y evito publicar datos malformados.
function makeDate(year: number, month: number, day: number): { date: string; end: string | null } | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (year < 2000 || year > 2100 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, end: null };
}

// detecto el tipo y la provincia cuando la fuente informa suficiente contexto.
function eventKind(title: string, context: string): string {
  const text = `${title} ${context}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
  if (/remat|venta/.test(text)) return 'remate';
  if (/expos|expo/.test(text)) return 'exposicion';
  if (/feria/.test(text)) return 'feria';
  if (/jornada|simposio|congreso|curso|encuentro/.test(text)) return 'jornada';
  return 'evento';
}

// busco el nombre provincial publicado, sin inferir una provincia desde una ciudad.
function findProvince(value: string): string | null {
  const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
  return provinces.find((province) => normalized.includes(province.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es'))) ?? null;
}

// convierto un enlace de asociación en una url absoluta y segura para lectura.
function resolveUrl(href: string, base: string): string | null {
  try { const url = new URL(decodeEntities(href), base); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}

// obtengo una página pública con límite de tiempo y tamaño para no atascar el servidor.
async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(12_000), headers: { 'User-Agent': 'EstanciaApp event calendar (official public event pages)' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.text();
  if (body.length > 4_000_000) throw new Error('La página superó el tamaño permitido para lectura.');
  return body;
}

// encuentro enlaces de agenda en el sitio de la asociación sin salir de su dominio.
function discoverEventPages(html: string, base: string): string[] {
  const host = new URL(base).hostname.replace(/^www\./, '');
  const found = new Set<string>();
  const anchor = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchor)) {
    const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(match[1]);
    if (!href || !eventLinkWords.test(`${plainText(match[2])} ${href[1] ?? href[2] ?? href[3] ?? ''}`)) continue;
    const url = resolveUrl(href[1] ?? href[2] ?? href[3] ?? '', base);
    if (!url) continue;
    const parsed = new URL(url);
    if (parsed.hostname.replace(/^www\./, '') !== host || /\.(pdf|jpg|png|zip)(\?|$)/i.test(parsed.pathname)) continue;
    found.add(parsed.href);
    if (found.size >= 5) break;
  }
  return [...found];
}

// recolecto eventos schema.org publicados en las páginas oficiales.
function readStructuredEvents(html: string, pageUrl: string, source: EventSource): ParsedEvent[] {
  const results: ParsedEvent[] = [];
  const scripts = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(scripts)) {
    try {
      const root: unknown = JSON.parse(decodeEntities(match[1]));
      for (const item of structuredObjects(root)) {
        const type = Array.isArray(item['@type']) ? item['@type'].join(' ') : String(item['@type'] ?? '');
        if (!/event/i.test(type) || !item.name || !item.startDate) continue;
        const start = parseDate(String(item.startDate));
        if (!start) continue;
        const end = item.endDate ? parseDate(String(item.endDate)) : null;
        const location = asRecord(item.location);
        const address = asRecord(location?.address);
        const url = resolveUrl(String(item.url ?? ''), pageUrl) ?? pageUrl;
        const title = plainText(String(item.name));
        results.push({
          externalKey: stableEventKey(title, start.date), title: title.slice(0, 150),
          description: item.description ? plainText(String(item.description)).slice(0, 8000) : null,
          kind: eventKind(title, pageUrl), start: start.date, end: end?.date ?? start.end,
          province: address?.addressRegion ? plainText(String(address.addressRegion)).slice(0, 80) : findProvince(String(location?.name ?? '')),
          locality: address?.addressLocality ? plainText(String(address.addressLocality)).slice(0, 100) : null,
          location: location?.name ? plainText(String(location.name)).slice(0, 200) : null,
          organizer: source.nombre, species: source.especie, breed: source.raza, url,
        });
      }
    } catch { /* ignoro bloques estructurados incompletos y sigo con el resto de la página. */ }
  }
  return results;
}

// recorro objetos schema.org anidados y grafos sin depender de una biblioteca html.
function structuredObjects(value: unknown, output: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(value)) { value.forEach((item) => structuredObjects(item, output)); return output; }
  if (!value || typeof value !== 'object') return output;
  const record = value as Record<string, unknown>;
  output.push(record);
  for (const item of Object.values(record)) structuredObjects(item, output);
  return output;
}

// obtengo registros de tablas de calendario solo desde páginas con ruta de eventos.
function readCalendarTables(html: string, pageUrl: string, source: EventSource): ParsedEvent[] {
  const results: ParsedEvent[] = [];
  const tables = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
  for (const table of html.matchAll(tables)) {
    const rows = [...table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) => [...row[1].matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map((cell) => plainText(cell[1]))).filter((cells) => cells.length >= 2);
    if (rows.length < 2) continue;
    const header = rows[0].map((cell) => cell.toLocaleLowerCase('es'));
    const hasHeader = header.some((cell) => /fecha|expos|evento|remat|localidad|ventas|jura/.test(cell));
    const dataRows = hasHeader ? rows.slice(1) : rows;
    const nameIndex = hasHeader ? header.findIndex((cell) => /expos|evento|remat|titulo|actividad|localidad/.test(cell)) : -1;
    const preferredDates = hasHeader ? header.map((cell, index) => /fecha|jura|clasif|venta|evento|expos/.test(cell) ? index : -1).filter((index) => index >= 0) : [];
    const placeIndex = hasHeader ? header.findIndex((cell) => /lugar|ubic|localidad|ciudad|sede/.test(cell)) : -1;
    for (const cells of dataRows) {
      const dateIndexes = preferredDates.length ? preferredDates : cells.map((_cell, index) => index);
      const dates = dateIndexes.map((index) => cells[index] ? parseDate(cells[index]) : null).filter((value): value is { date: string; end: string | null } => Boolean(value));
      if (!dates.length) continue;
      const candidates = cells.filter((cell) => cell.length >= 4 && !parseDate(cell) && !/^\(?\d{1,3}\)?$/.test(cell));
      const rawTitle = nameIndex >= 0 ? cells[nameIndex] : candidates.sort((a, b) => b.length - a.length)[0];
      if (!rawTitle || /^(mes|categoria|cat\.?|circuito|jurado|ventas|veredicto)$/i.test(rawTitle)) continue;
      const title = rawTitle.slice(0, 150);
      const allText = cells.join(' · ');
      const place = placeIndex >= 0 ? cells[placeIndex] : null;
      const start = dates[0];
      const end = dates.length > 1 ? dates[dates.length - 1] : start;
      results.push({
        externalKey: stableEventKey(title, start.date), title,
        description: null, kind: eventKind(title, pageUrl), start: start.date, end: end.end ?? end.date,
        province: findProvince(`${place ?? ''} ${allText}`), locality: place?.slice(0, 100) ?? null,
        location: place?.slice(0, 200) ?? null, organizer: source.nombre, species: source.especie, breed: source.raza,
        url: pageUrl,
      });
    }
  }
  return results;
}

// leo tarjetas y listados semánticos que las asociaciones publican sin tablas ni schema.org.
function readEventCards(html: string, pageUrl: string, source: EventSource): ParsedEvent[] {
  const results: ParsedEvent[] = [];
  const blocks: { attributes: string; content: string }[] = [];
  const tagPattern = /<(\/)?(article|li|section|div)\b([^>]*)>/gi;
  const stack: { tag: string; attributes: string; start: number; candidate: boolean }[] = [];
  for (const match of html.matchAll(tagPattern)) {
    const tag = match[2].toLocaleLowerCase('en');
    if (!match[1]) {
      const attributes = match[3];
      const classes = /\b(?:class|id)\s*=\s*["']([^"']+)["']/i.exec(attributes)?.[1] ?? '';
      stack.push({ tag, attributes, start: (match.index ?? 0) + match[0].length, candidate: tag === 'article' || tag === 'li' || /event|agenda|calendar|calend|remat|expo|card|item|post/i.test(classes) });
      continue;
    }
    const index = stack.map((element) => element.tag).lastIndexOf(tag);
    if (index < 0) continue;
    const [element] = stack.splice(index, 1);
    if (element.candidate) blocks.push({ attributes: element.attributes, content: html.slice(element.start, match.index) });
  }
  for (const { attributes, content } of blocks) {
    const className = /\b(?:class|id)\s*=\s*["']([^"']+)["']/i.exec(attributes)?.[1] ?? '';
    const heading = /<h[2-6]\b[^>]*>([\s\S]*?)<\/h[2-6]>/i.exec(content)?.[1];
    const anchor = /<a\b([^>]*)>([\s\S]*?)<\/a>/i.exec(content);
    const title = plainText(heading ?? anchor?.[2] ?? '');
    const body = plainText(content);
    if (!title || title.length < 4 || title.length > 150 || !/(remat|expo|feria|jornada|encuentro|muestra|nacional|regional)/i.test(`${title} ${className}`)) continue;
    const date = parseDate(body);
    if (!date) continue;
    const rawHref = anchor ? /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(anchor[1]) : null;
    const eventUrl = rawHref ? resolveUrl(rawHref[1] ?? rawHref[2] ?? rawHref[3] ?? '', pageUrl) : null;
    const place = body.replace(title, '').slice(0, 500);
    results.push({
      externalKey: stableEventKey(title, date.date), title,
      description: body.slice(0, 8000), kind: eventKind(title, body), start: date.date, end: date.end,
      province: findProvince(body), locality: null, location: place || null,
      organizer: source.nombre, species: source.especie, breed: source.raza, url: eventUrl ?? pageUrl,
    });
  }
  return results;
}

// rescato remates y eventos cuando la fecha forma parte del título de la publicación.
function readDatedHeadings(html: string, pageUrl: string, source: EventSource): ParsedEvent[] {
  const results: ParsedEvent[] = [];
  const headings = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  for (const match of html.matchAll(headings)) {
    const title = plainText(match[1]);
    if (!title || !/(remat|expo|feria|jornada|curso|concurso|encuentro|muestra|nacional)/i.test(title)) continue;
    const date = parseDate(title);
    if (!date) continue;
    const name = title.replace(/[:–—-]?\s*\d{1,2}\s*(?:al\s*\d{1,2}\s*)?(?:de\s*)?(?:ene(?:ro)?|feb(?:rero)?|mar(?:zo)?|abr(?:il)?|may(?:o)?|jun(?:io)?|jul(?:io)?|ago(?:sto)?|sep(?:t(?:iembre)?)?|set(?:iembre)?|oct(?:ubre)?|nov(?:iembre)?|dic(?:iembre)?)(?:\s*(?:de\s*)?20\d{2})?/i, '').replace(/\s*[:–—-]\s*$/, '').trim() || title;
    const anchor = /<a\b([^>]*)>/i.exec(match[1]);
    const href = anchor ? /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(anchor[1]) : null;
    results.push({ externalKey: stableEventKey(name, date.date), title: name.slice(0, 150), description: null, kind: eventKind(title, pageUrl), start: date.date, end: date.end, province: findProvince(title), locality: null, location: null, organizer: source.nombre, species: source.especie, breed: source.raza, url: href ? resolveUrl(href[1] ?? href[2] ?? href[3] ?? '', pageUrl) ?? pageUrl : pageUrl });
  }
  return results;
}

// interpreto agendas que publican la fecha, el lugar y la descripción como etiquetas.
function readLabeledEvents(html: string, pageUrl: string, source: EventSource): ParsedEvent[] {
  const text = plainText(html);
  const results: ParsedEvent[] = [];
  for (const entry of text.matchAll(/Fecha\s*:\s*([\s\S]*?)(?=Fecha\s*:|$)/gi)) {
    const body = entry[1].slice(0, 1600);
    const date = parseDate(body);
    const description = /Descripci[oó]n\s*:\s*([\s\S]*?)(?=Fecha\s*:|$)/i.exec(body)?.[1]?.trim();
    if (!date || !description) continue;
    const title = description.split(/(?<=[.!?])\s+/)[0].trim().slice(0, 150);
    if (!title || !/(remat|expo|feria|jornada|encuentro|congreso|curso)/i.test(title)) continue;
    const location = /Lugar\s*:\s*([\s\S]*?)(?=Descripci[oó]n\s*:|$)/i.exec(body)?.[1]?.trim() ?? null;
    results.push({ externalKey: stableEventKey(title, date.date), title, description, kind: eventKind(title, body), start: date.date, end: date.end, province: findProvince(location ?? ''), locality: null, location, organizer: source.nombre, species: source.especie, breed: source.raza, url: pageUrl });
  }
  return results;
}

// convierto el enlace y fecha en una clave estable para reintentos idempotentes.
function stableEventKey(title: string, date: string): string {
  return createHash('sha256').update(`${title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es')}|${date}`).digest('hex').slice(0, 64);
}

// leo un objeto json sin hacer suposiciones sobre la forma de una ubicación.
function asRecord(value: unknown): Record<string, unknown> | null { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null; }

// leo las páginas de una asociación y deduplico los eventos por su clave externa.
async function collectSourceEvents(source: EventSource): Promise<ParsedEvent[]> {
  const homePage = await fetchPage(source.url).then((html) => ({ html, error: null as Error | null }))
    .catch((error: unknown) => ({ html: null, error: error instanceof Error ? error : new Error('No se pudo leer la página principal.') }));
  const preferredPages = associationEventPages[source.codigo_fuente] ?? [];
  if (!homePage.html && !preferredPages.length) throw homePage.error;
  const discoveredPages = homePage.html ? discoverEventPages(homePage.html, source.url) : [];
  const pages = [...new Set([...preferredPages, ...(homePage.html ? [source.url, ...discoveredPages] : [])])];
  const unique = new Map<string, ParsedEvent>();
  const failedPages: string[] = [];
  for (const pageUrl of pages) {
    try {
      const html = pageUrl === source.url && homePage.html ? homePage.html : await fetchPage(pageUrl);
      const parsed = [...readStructuredEvents(html, pageUrl, source), ...readCalendarTables(html, pageUrl, source), ...readEventCards(html, pageUrl, source), ...readDatedHeadings(html, pageUrl, source), ...readLabeledEvents(html, pageUrl, source)];
      for (const event of parsed) unique.set(event.externalKey, event);
    } catch { failedPages.push(pageUrl); }
  }
  if (!unique.size && failedPages.length === pages.length) throw new Error('No se pudieron leer las páginas oficiales de la asociación.');
  return [...unique.values()];
}

// sincronizo cada asociación por separado y conservo sus publicaciones si falla una consulta.
async function synchronizeSource(source: EventSource): Promise<void> {
  const [run] = await database.execute<ResultSetHeader>(
    "INSERT INTO sincronizaciones_eventos (codigo_fuente,estado) VALUES (?,'iniciada')", [source.codigo_fuente],
  );
  try {
    const events = await collectSourceEvents(source);
    const connection = await database.getConnection();
    try {
      await connection.beginTransaction();
      for (const event of events) {
        await connection.execute(
          `INSERT INTO eventos_importados
           (codigo_fuente,clave_externa,titulo,descripcion,tipo_evento,fecha_inicio,fecha_fin,provincia,localidad,ubicacion,organizador,especie,raza,url)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
           ON DUPLICATE KEY UPDATE titulo=VALUES(titulo),descripcion=VALUES(descripcion),tipo_evento=VALUES(tipo_evento),
             fecha_inicio=VALUES(fecha_inicio),fecha_fin=VALUES(fecha_fin),provincia=VALUES(provincia),localidad=VALUES(localidad),
             ubicacion=VALUES(ubicacion),organizador=VALUES(organizador),especie=VALUES(especie),raza=VALUES(raza),url=VALUES(url)`,
          [source.codigo_fuente,event.externalKey,event.title,event.description,event.kind,event.start,event.end,event.province,event.locality,event.location,event.organizer,event.species,event.breed,event.url],
        );
      }
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
    const message = events.length ? null : 'La página respondió, pero no se reconocieron fechas de eventos publicadas.';
    await database.execute('UPDATE fuentes_eventos SET consultada_en=NOW(),ultimo_error=? WHERE codigo_fuente=?', [message,source.codigo_fuente]);
    await database.execute("UPDATE sincronizaciones_eventos SET finalizada_en=NOW(),estado=?,eventos_leidos=?,mensaje=? WHERE id_sincronizacion=?", [events.length ? 'correcta' : 'sin_eventos',events.length,message,run.insertId]);
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 1000) : 'falló la lectura de la página oficial';
    await database.execute('UPDATE fuentes_eventos SET consultada_en=NOW(),ultimo_error=? WHERE codigo_fuente=?', [message,source.codigo_fuente]).catch(() => undefined);
    await database.execute("UPDATE sincronizaciones_eventos SET finalizada_en=NOW(),estado='error',mensaje=? WHERE id_sincronizacion=?", [message,run.insertId]).catch(() => undefined);
  }
}

// sincronizo las fuentes activas sin detener la api si cambia una página externa.
export async function synchronizeAssociationEvents(): Promise<void> {
  let sources: EventSource[];
  try {
    const [rows] = await database.execute<EventSource[]>('SELECT codigo_fuente,nombre,url,especie,raza FROM fuentes_eventos WHERE habilitada=1 ORDER BY nombre');
    sources = rows;
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'EVENT_SOURCE_TABLE_UNAVAILABLE';
    console.error(`No se pudieron iniciar las agendas de asociaciones (${code}).`);
    return;
  }
  for (const source of sources) await synchronizeSource(source);
  console.info(`Terminó la consulta de ${sources.length} agendas oficiales.`);
}
