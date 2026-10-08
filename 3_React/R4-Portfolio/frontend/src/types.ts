// Define los campos comunes que pueden tener los elementos del portfolio.
export interface Item {
  id?: number;
  active?: number;
  sort_order?: number;
  [key: string]: unknown;
}
// Define la información necesaria para mostrar una fotografía.
export interface Photo extends Item {
  title: string;
  description?: string;
  image_path: string;
  alt_text: string;
  category?: string;
}
// Define los datos que se muestran en una tarjeta de proyecto.
export interface Project extends Item {
  title: string;
  slug: string;
  description: string;
  image_path?: string;
  demo_url?: string;
  github_url?: string;
}
// Agrupa todas las secciones que devuelve la API pública.
export interface Portfolio {
  settings: Record<string, string>;
  photos: Photo[];
  projects: Project[];
  education: Item[];
  skills: Item[];
  timeline: Item[];
  learning: Item[];
  objectives: Item[];
  links: Item[];
}
