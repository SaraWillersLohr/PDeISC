export interface Item { id?:number; active?:number; sort_order?:number; [key:string]: unknown }
export interface Photo extends Item { title:string; description?:string; image_path:string; alt_text:string; category?:string }
export interface Project extends Item { title:string; slug:string; description:string; image_path?:string; demo_url?:string; github_url?:string }
export interface Portfolio { settings:Record<string,string>; photos:Photo[]; projects:Project[]; education:Item[]; skills:Item[]; timeline:Item[]; learning:Item[]; objectives:Item[]; links:Item[] }
