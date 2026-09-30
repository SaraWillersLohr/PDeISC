import { Platform, TextStyle } from 'react-native';

// tipos permitidos para colores, fuentes, tamanos y fondos
export type ColorName = 'Bosque' | 'Cielo' | 'Laguna' | 'Salvia' | 'Arena' | 'Terracota';
export type FontName = 'Moderna' | 'Elegante' | 'Cursiva' | 'Monospace';
export type TextSize = 'Pequeño' | 'Normal' | 'Grande';
export type BackgroundName = 'Claro' | 'Bruma' | 'Olas';

// estructura principal con todas las configuraciones de apariencia
export type AppearanceSettings = {
  color: ColorName;
  font: FontName;
  textSize: TextSize;
  background: BackgroundName;
};

// valores iniciales que usa la aplicacion por defecto
export const defaultAppearance: AppearanceSettings = {
  color: 'Bosque',
  font: 'Moderna',
  textSize: 'Normal',
  background: 'Claro',
};

// lista de colores disponibles con sus codigos hexadecimales
export const colorOptions: { name: ColorName; color: string }[] = [
  { name: 'Bosque', color: '#287C68' },
  { name: 'Cielo', color: '#55AFC2' },
  { name: 'Laguna', color: '#368D8A' },
  { name: 'Salvia', color: '#83A98A' },
  { name: 'Arena', color: '#BD9467' },
  { name: 'Terracota', color: '#B87550' },
];

// opciones de tipografia con nombre legible y descripcion breve
export const fontOptions: {
  label: string;
  value: FontName;
  description: string;
}[] = [
  { label: 'Moderna', value: 'Moderna', description: 'Sans-serif limpia y actual' },
  { label: 'Elegante', value: 'Elegante', description: 'Serif clásica con remates' },
  { label: 'Cursiva', value: 'Cursiva', description: 'Manuscrita caligráfica fluida' },
  { label: 'Máquina', value: 'Monospace', description: 'Monoespaciada retro typewriter' },
];

// funcion para obtener la fuente correcta segun el sistema operativo
export const getFontFamily = (font: FontName): string | undefined => {
  switch (font) {
    case 'Moderna':
      return Platform.select({
        ios: 'System',
        android: 'sans-serif',
        web: 'sans-serif',
        default: undefined,
      });
    case 'Elegante':
      return Platform.select({
        ios: 'Georgia',
        android: 'serif',
        web: 'Georgia, serif',
        default: 'serif',
      });
    case 'Cursiva':
      return Platform.select({
        ios: 'Snell Roundhand',
        android: 'cursive',
        web: 'cursive',
        default: 'cursive',
      });
    case 'Monospace':
      return Platform.select({
        ios: 'Courier New',
        android: 'monospace',
        web: 'Courier New, monospace',
        default: 'monospace',
      });
    default:
      return undefined;
  }
};

// funcion para aplicar cursiva, peso y espaciado segun la tipografia
export const getFontStyle = (font: FontName): TextStyle => {
  switch (font) {
    case 'Cursiva':
      return {
        fontStyle: 'italic',
        fontWeight: Platform.OS === 'ios' ? '600' : 'normal',
        letterSpacing: 0.5,
      };
    case 'Elegante':
      return {
        fontStyle: 'normal',
        fontWeight: '700',
        letterSpacing: 0,
      };
    case 'Monospace':
      return {
        fontStyle: 'normal',
        fontWeight: '600',
        letterSpacing: 1.5,
      };
    case 'Moderna':
    default:
      return {
        fontStyle: 'normal',
        fontWeight: '800',
        letterSpacing: -0.5,
      };
  }
};

// opciones de tamano de texto con su valor numerico en pixeles
export const textSizes: { label: TextSize; value: number }[] = [
  { label: 'Pequeño', value: 30 },
  { label: 'Normal', value: 40 },
  { label: 'Grande', value: 50 },
];

// colores de fondo para modo claro y oscuro segun el estilo elegido
export const backgrounds: Record<BackgroundName, { light: string; dark: string }> = {
  Claro: { light: '#F4F8F4', dark: '#14211F' },
  Bruma: { light: '#E8F1ED', dark: '#1B302B' },
  Olas: { light: '#E4F1F2', dark: '#183037' },
};

// paletas de acento claro, oscuro y tonos suaves para cada color
export const colorAccents: Record<ColorName, { light: string; dark: string; softLight: string; softDark: string }> = {
  Bosque: { light: '#287C68', dark: '#83CDB5', softLight: '#E3F1EC', softDark: '#28463E' },
  Cielo: { light: '#267A8B', dark: '#91D4E2', softLight: '#DFF1F4', softDark: '#1E3B49' },
  Laguna: { light: '#237875', dark: '#87CEC7', softLight: '#DDF1EF', softDark: '#244743' },
  Salvia: { light: '#617E57', dark: '#B5D0A7', softLight: '#E8F0E2', softDark: '#354832' },
  Arena: { light: '#916A3F', dark: '#D8B98E', softLight: '#F2E9D9', softDark: '#493D2F' },
  Terracota: { light: '#A65F3D', dark: '#E1AF80', softLight: '#F3E7D9', softDark: '#47362D' },
};
