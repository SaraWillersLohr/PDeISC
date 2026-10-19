export type Product={id:number;codigo:string;nombre:string;descripcion:string|null;precio:number|null;stock_actual:number;stock_minimo:number;fecha_vencimiento:string|null;activo:number;categoria_ids?:string;categorias?:string};
export type Category={id:number;nombre:string};
export type Movement={id:number;producto:string;tipo:'entrada'|'salida';cantidad:number;stock_anterior:number;stock_posterior:number;created_at:string};
export type Dashboard={productos:number;unidades:number;stock_bajo:number;proximos_vencer:number;vencidos:number};
