import mysql from 'mysql2/promise';

async function setupDatabase() {
  try {
    // Conexión inicial sin especificar base de datos
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('✓ Conectado a MySQL');

    // Crear base de datos alumnosDB
    await connection.query('CREATE DATABASE IF NOT EXISTS alumnosDB');
    console.log('✓ Base de datos alumnosDB creada/verificada');

    // Usar la base de datos
    await connection.query('USE alumnosDB');

    // Crear tabla
    await connection.query(`
      CREATE TABLE IF NOT EXISTS alumnos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        edad INT NOT NULL
      )
    `);
    console.log('✓ Tabla alumnos creada/verificada');

    // Limpiar registros anteriores (si existen)
    try {
      await connection.query('DELETE FROM alumnos');
      console.log('✓ Registros anteriores eliminados');
    } catch (err) {
      // Si la tabla está vacía, ignorar el error
    }

    // Insertar 5 alumnos de ejemplo
    const alumnos = [
      ['Juan', 'Pérez', 20],
      ['María', 'González', 22],
      ['Carlos', 'López', 19],
      ['Ana', 'Martínez', 21],
      ['Pedro', 'Rodríguez', 23]
    ];

    for (const [nombre, apellido, edad] of alumnos) {
      await connection.execute(
        'INSERT INTO alumnos (nombre, apellido, edad) VALUES (?, ?, ?)',
        [nombre, apellido, edad]
      );
    }
    console.log('✓ 5 alumnos de ejemplo insertados');

    // Verificar datos
    const [rows] = await connection.execute('SELECT * FROM alumnos');
    console.log('\n📊 Datos en la BD:');
    console.table(rows);

    await connection.end();
    console.log('\n✓ Setup completado exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
