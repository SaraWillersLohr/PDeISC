const fs = require('node:fs');
const path = require('node:path');
const ts = require('../frontend/node_modules/typescript');

const root = path.resolve(__dirname, '..');

function parse(relativePath) {
  const file = path.join(root, relativePath);
  const source = fs.readFileSync(file, 'utf8');
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  return { file, source, sf };
}

function localDeclarations(sf) {
  const found = new Map();
  for (const statement of sf.statements) {
    if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement) || ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || ts.isEnumDeclaration(statement)) {
      if (statement.name) found.set(statement.name.text, statement);
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) found.set(declaration.name.text, statement);
      }
    }
  }
  return found;
}

function nodeNames(statement) {
  const names = [];
  if (ts.isVariableStatement(statement)) {
    for (const declaration of statement.declarationList.declarations) if (ts.isIdentifier(declaration.name)) names.push(declaration.name.text);
  } else if (statement.name) names.push(statement.name.text);
  return names;
}

function identifiers(node) {
  const names = new Set();
  const visit = (child) => {
    if (ts.isIdentifier(child)) names.add(child.text);
    ts.forEachChild(child, visit);
  };
  visit(node);
  return names;
}

function exportStatement(statement, sourceFile) {
  const text = statement.getFullText(sourceFile).trim();
  if (ts.canHaveModifiers(statement) && ts.getModifiers(statement)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) return statement.getFullText(sourceFile).trim();
  const start = statement.getStart(sourceFile);
  const offset = start - statement.getFullStart();
  const leading = statement.getFullText(sourceFile).slice(0, offset);
  const body = sourceFile.text.slice(start, statement.end);
  return `${leading}export ${body}`.trim();
}

function filteredImport(statement, usedNames, sourceFile) {
  if (!statement.importClause) return statement.getText(sourceFile);
  const clause = statement.importClause;
  const defaultName = clause.name && usedNames.has(clause.name.text) ? clause.name : undefined;
  let bindings;
  if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
    if (usedNames.has(clause.namedBindings.name.text)) bindings = clause.namedBindings;
  } else if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
    const elements = clause.namedBindings.elements.filter((element) => usedNames.has(element.name.text));
    if (elements.length) bindings = ts.factory.updateNamedImports(clause.namedBindings, elements);
  }
  if (!defaultName && !bindings) return '';
  const nextClause = ts.factory.updateImportClause(clause, clause.isTypeOnly, defaultName, bindings);
  const next = ts.factory.updateImportDeclaration(statement, statement.modifiers, nextClause, statement.moduleSpecifier, statement.attributes);
  return ts.createPrinter().printNode(ts.EmitHint.Unspecified, next, sourceFile);
}

function write(relativePath, contents) {
  const full = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${contents.trimEnd()}\n`, 'utf8');
}

function splitModules({ sourcePath, styleName, styleModule, styleAlias, groups, facadePath, header }) {
  const { file, source, sf } = parse(sourcePath);
  const decls = localDeclarations(sf);
  const statementGroups = new Map();
  for (const [name, group] of Object.entries(groups)) {
    const statement = decls.get(name);
    if (!statement) throw new Error(`${sourcePath}: no se encontró ${name}`);
    const previous = statementGroups.get(statement);
    if (previous && previous !== group) throw new Error(`${sourcePath}: la declaración compartida ${name} quedó en dos módulos`);
    statementGroups.set(statement, group);
  }
  const styleStatement = decls.get(styleName);
  if (!styleStatement || !ts.isVariableStatement(styleStatement)) throw new Error(`${sourcePath}: no se encontró el estilo ${styleName}`);

  const originalImports = sf.statements.filter(ts.isImportDeclaration);
  const statementTexts = new Map();
  for (const statement of statementGroups.keys()) statementTexts.set(statement, exportStatement(statement, sf));

  const moduleFileByGroup = {};
  const sourceBase = path.basename(sourcePath, path.extname(sourcePath));
  for (const group of new Set(Object.values(groups))) moduleFileByGroup[group] = sourcePath.replace(/[^/]+$/, `${sourceBase}.${group}.tsx`);
  const styleUse = ts.factory.createIdentifier(styleName);
  const styleInitializer = styleStatement.declarationList.declarations.find((item) => ts.isIdentifier(item.name) && item.name.text === styleName)?.initializer;
  if (!styleInitializer || !ts.isCallExpression(styleInitializer) || !styleInitializer.arguments[0] || !ts.isObjectLiteralExpression(styleInitializer.arguments[0])) throw new Error(`${sourcePath}: formato de estilos inesperado`);

  const bucketParts = [];
  let bucket = [];
  let bucketLineCount = 0;
  for (const property of styleInitializer.arguments[0].properties) {
    const lineCount = property.getText(sf).split(/\r?\n/).length + 1;
    if (bucket.length && bucketLineCount + lineCount > 300) {
      bucketParts.push(bucket); bucket = []; bucketLineCount = 0;
    }
    bucket.push(property.getText(sf)); bucketLineCount += lineCount;
  }
  if (bucket.length) bucketParts.push(bucket);
  const styleBase = styleModule.replace(/\.tsx?$/, '');
  const stylePartNames = bucketParts.map((_, index) => `${path.basename(styleBase)}Part${index + 1}`);
  for (let index = 0; index < bucketParts.length; index++) {
    write(`${path.dirname(styleModule)}/${stylePartNames[index]}.tsx`, `// defino una parte de los estilos compartidos para mantener las pantallas modulares.\nimport { StyleSheet } from 'react-native';\n\nconst part = StyleSheet.create({\n${bucketParts[index].map((property) => `  ${property.replace(/\n/g, '\n  ')}`).join(',\n')}\n});\n\nexport default part;`);
  }
  write(styleModule, `// reúno los estilos compartidos por las pantallas de este módulo.\n${stylePartNames.map((name, index) => `import part${index + 1} from './${name}';`).join('\n')}\n\nexport const ${styleName} = { ${stylePartNames.map((_, index) => `...part${index + 1}`).join(', ')} };`);

  const originalPublic = new Map();
  for (const statement of statementGroups.keys()) {
    const isPublic = ts.canHaveModifiers(statement) && ts.getModifiers(statement)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (isPublic) for (const name of nodeNames(statement)) originalPublic.set(name, statementGroups.get(statement));
  }

  for (const [group, modulePath] of Object.entries(moduleFileByGroup)) {
    const selected = [...statementGroups.entries()].filter(([, assigned]) => assigned === group).map(([statement]) => statement);
    const usedNames = new Set(selected.flatMap((statement) => [...identifiers(statement)]));
    const imports = originalImports.map((statement) => filteredImport(statement, usedNames, sf)).filter(Boolean);
    const internalImports = new Map();
    for (const statement of selected) {
      for (const name of identifiers(statement)) {
        const target = decls.get(name);
        const targetGroup = target && statementGroups.get(target);
        if (target && targetGroup && targetGroup !== group) internalImports.set(`${targetGroup}:${name}`, { group: targetGroup, name });
      }
    }
    for (const { group: targetGroup, name } of internalImports.values()) {
      const targetBase = path.basename(moduleFileByGroup[targetGroup], '.tsx');
      const relative = `./${targetBase}`;
      imports.push(`import { ${name} } from '${relative}';`);
    }
    if (usedNames.has(styleName)) imports.push(`import { ${styleName} } from './${path.basename(styleModule, '.tsx')}';`);
    const pieces = selected.map((statement) => statementTexts.get(statement));
    write(modulePath, `// ${header[group]}\n${[...new Set(imports)].join('\n')}\n\n${pieces.join('\n\n')}`);
  }

  const exports = [...originalPublic.entries()].map(([name, group]) => `export { ${name} } from './${path.basename(moduleFileByGroup[group], '.tsx')}';`);
  write(facadePath, `// mantengo este punto de entrada para que las rutas existentes conserven sus importaciones.\n${exports.join('\n')}`);
}

function extractSingleStyle(sourcePath, styleName, styleModule) {
  const { source, sf } = parse(sourcePath);
  const decls = localDeclarations(sf);
  const statement = decls.get(styleName);
  if (!statement || !ts.isVariableStatement(statement)) throw new Error(`${sourcePath}: no se encontró ${styleName}`);
  const text = exportStatement(statement, sf);
  const exported = text.replace(new RegExp(`^export const ${styleName}\\s*=`), `export const ${styleName} =`);
  write(styleModule, `// centralizo los estilos de este módulo para separar presentación y comportamiento.\nimport { StyleSheet } from 'react-native';\n\n${exported}`);
  const replacement = `import { ${styleName} } from './${path.basename(styleModule, '.tsx')}';`;
  const updated = source.slice(0, statement.getFullStart()) + replacement + '\n' + source.slice(statement.end);
  fs.writeFileSync(path.join(root, sourcePath), updated, 'utf8');
}

function splitController({ sourcePath, groups, facadePath, header }) {
  const { source, sf } = parse(sourcePath);
  const decls = localDeclarations(sf);
  const statementGroups = new Map();
  for (const [name, group] of Object.entries(groups)) {
    const statement = decls.get(name);
    if (!statement) throw new Error(`${sourcePath}: no se encontró ${name}`);
    const previous = statementGroups.get(statement);
    if (previous && previous !== group) throw new Error(`${sourcePath}: la declaración ${name} quedó en dos módulos`);
    statementGroups.set(statement, group);
  }
  const originalImports = sf.statements.filter(ts.isImportDeclaration);
  const sourceBase = path.basename(sourcePath, path.extname(sourcePath));
  const moduleFileByGroup = {};
  for (const group of new Set(Object.values(groups))) moduleFileByGroup[group] = sourcePath.replace(/[^/]+$/, `${sourceBase}.${group}.ts`);
  const publicNames = new Map();
  for (const statement of statementGroups.keys()) {
    const isPublic = ts.canHaveModifiers(statement) && ts.getModifiers(statement)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (isPublic) for (const name of nodeNames(statement)) publicNames.set(name, statementGroups.get(statement));
  }
  for (const [group, modulePath] of Object.entries(moduleFileByGroup)) {
    const selected = [...statementGroups.entries()].filter(([, assigned]) => assigned === group).map(([statement]) => statement);
    const usedNames = new Set(selected.flatMap((statement) => [...identifiers(statement)]));
    const imports = originalImports.map((statement) => filteredImport(statement, usedNames, sf)).filter(Boolean);
    const internalImports = new Map();
    for (const statement of selected) for (const name of identifiers(statement)) {
      const target = decls.get(name);
      const targetGroup = target && statementGroups.get(target);
      if (target && targetGroup && targetGroup !== group) internalImports.set(`${targetGroup}:${name}`, { group: targetGroup, name });
    }
    for (const { group: targetGroup, name } of internalImports.values()) imports.push(`import { ${name} } from './${path.basename(moduleFileByGroup[targetGroup], '.ts')}';`);
    const pieces = selected.map((statement) => exportStatement(statement, sf));
    write(modulePath, `// ${header[group]}\n${[...new Set(imports)].join('\n')}\n\n${pieces.join('\n\n')}`);
  }
  const exports = [...publicNames.entries()].map(([name, group]) => `export { ${name} } from './${path.basename(moduleFileByGroup[group], '.ts')}';`);
  write(facadePath, `// mantengo este punto de entrada para que las rutas existentes conserven sus importaciones.\n${exports.join('\n')}`);
}

splitModules({
  sourcePath: 'frontend/src/components/app/LivestockScreens.tsx',
  styleName: 'style',
  styleModule: 'frontend/src/components/app/LivestockStyles.tsx',
  facadePath: 'frontend/src/components/app/LivestockScreens.tsx',
  groups: {
    genderOptions: 'animals', genderLabel: 'animals', AnimalsInventoryScreen: 'animals', MatingServiceForm: 'animals',
    CorralsInventoryScreen: 'corrals', NursingScreen: 'nursing',
    SpeciesFilterChip: 'shared', InventoryPage: 'shared', Empty: 'shared', formatAnimalAge: 'shared', isValidBirthDate: 'shared',
  },
  header: { animals: 'muestro la ficha ganadera y sus operaciones desde el inventario.', corrals: 'consulto la ocupación y administración operativa de corrales.', nursing: 'presento el seguimiento clínico y el alta veterinaria.', shared: 'comparto elementos visuales y validaciones de los inventarios ganaderos.' },
});

splitController({
  sourcePath: 'backend/src/controllers/livestockController.ts',
  facadePath: 'backend/src/controllers/livestockController.ts',
  groups: {
    MovementRow: 'shared', CorralRow: 'shared', animalGenders: 'shared', AnimalGender: 'shared', isAnimalGender: 'shared', readPhoto: 'shared', validBirthDate: 'shared',
    listAnimals: 'animals', createAnimal: 'animals', updateAnimal: 'animals', deactivateAnimal: 'animals', permanentlyDeleteInactiveAnimal: 'animals',
    listCorrals: 'corrals', createCorral: 'corrals', updateCorral: 'corrals', deleteCorral: 'corrals',
    moveAnimal: 'movements',
    listNursingAnimals: 'nursing', listVeterinaryRecords: 'nursing', createVeterinaryRecord: 'nursing', updateNursingHealthStatus: 'nursing', dischargeNursingAnimal: 'nursing',
    listNotifications: 'notifications', getVisibleNotification: 'notifications', updateNotification: 'notifications',
  },
  header: { shared: 'comparto tipos y validaciones usadas por los controladores ganaderos.', animals: 'consulto y modifico fichas de animales y sus bajas.', corrals: 'consulto y modifico corrales y capacidad.', movements: 'registro movimientos y valido la capacidad y las reglas sanitarias.', nursing: 'gestiono consultas veterinarias, diagnósticos y altas clínicas.', notifications: 'consulto y actualizo avisos visibles por perfil.' },
});
