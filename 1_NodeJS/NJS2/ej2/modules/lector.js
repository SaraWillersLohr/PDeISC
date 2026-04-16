import fs from 'fs';

export function leerArchivo(ruta, callback) {
  fs.readFile(ruta, (err, data) => {
    callback(err, data);
  });
}
