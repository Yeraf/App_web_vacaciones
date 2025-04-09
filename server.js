require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
    origin: 'http://localhost:3000', // su frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '5mb' })); // o más si lo necesita

// Configuración de conexión
const dbConfig = {
    user: "sa",
    password: "VERYlife8585",
    server: "DESKTOP-UN57ULG",
    database: "VacacionesYS",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Conexión inicial
sql.connect(dbConfig).then(() => {
    console.log('Conectado a SQL Server');
}).catch(err => console.log('Error de conexión:', err));

// POST - Insertar colaborador
app.post('/api/colaboradores', async (req, res) => {
    try {
        const {
            Nombre, Apellidos, CedulaID, Telefono, Direccion,
            Contrasena, Correo, FechaIngreso, Empresa, Foto, IDColaborador
        } = req.body;

        const pool = await sql.connect(dbConfig);
        console.log("Valores recibidos:");
        console.log({
            Nombre, Apellidos, CedulaID, Telefono, Direccion,
            Contrasena, Correo, FechaIngreso, Empresa, Foto, IDColaborador
        });
        await pool.request()
            .input('Nombre', sql.VarChar, Nombre)
            .input('Apellidos', sql.VarChar, Apellidos)
            .input('CedulaID', sql.VarChar, CedulaID)
            .input('Telefono', sql.VarChar, Telefono)
            .input('Direccion', sql.VarChar, Direccion)
            .input('Contrasena', sql.VarChar, Contrasena)
            .input('Correo', sql.VarChar, Correo)
            .input('FechaIngreso', sql.Date, FechaIngreso)
            .input('Empresa', sql.VarChar, Empresa)
            .input('Foto', sql.VarChar(sql.MAX), Foto || null)
            .input('IDColaborador', sql.VarChar, IDColaborador ? IDColaborador.toString() : null)
            .query(`
          INSERT INTO Colaboradores (Nombre, Apellidos, CedulaID, Telefono, Direccion, Contrasena, Correo, FechaIngreso, Empresa, Foto, IDColaborador)
          VALUES (@Nombre, @Apellidos, @CedulaID, @Telefono, @Direccion, @Contrasena, @Correo, @FechaIngreso, @Empresa, @Foto, @IDColaborador)
        `);

        res.status(201).json({ message: 'Colaborador insertado correctamente' });
    } catch (error) {
        console.error("Error al insertar colaborador:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET - Obtener todos los colaboradores
app.get('/api/colaboradores', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(
            `SELECT ID, Nombre, Apellidos, CedulaID, Telefono, Direccion, Contrasena, Correo, FechaIngreso, Empresa,Foto, IDColaborador FROM Colaboradores`
        );
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.put('/api/colaboradores/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const {
            Nombre, Apellidos, CedulaID, Telefono, Direccion,
            Contrasena, Correo, FechaIngreso, Empresa, Foto, IDColaborador
        } = req.body;

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input("ID", sql.Int, id)
            .input("Nombre", sql.VarChar, Nombre)
            .input("Apellidos", sql.VarChar, Apellidos)
            .input("CedulaID", sql.VarChar, CedulaID)
            .input("Telefono", sql.VarChar, Telefono)
            .input("Direccion", sql.VarChar, Direccion)
            .input("Contrasena", sql.VarChar, Contrasena)
            .input("Correo", sql.VarChar, Correo)
            .input("FechaIngreso", sql.Date, FechaIngreso)
            .input("Empresa", sql.VarChar, Empresa)
            .input("Foto", sql.VarChar(sql.MAX), Foto || null)
            .input("IDColaborador", sql.VarChar, IDColaborador ? IDColaborador.toString() : null)
            .query(`UPDATE Colaboradores SET
          Nombre=@Nombre, Apellidos=@Apellidos, CedulaID=@CedulaID, Telefono=@Telefono,
          Direccion=@Direccion, Contrasena=@Contrasena, Correo=@Correo, FechaIngreso=@FechaIngreso,
          Empresa=@Empresa, Foto=@Foto, IDColaborador=@IDColaborador WHERE ID=@ID`);

        res.json({ message: "Colaborador actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar colaborador:", error); // 👈 Esta línea es clave
        res.status(500).json({ error: error.message });           // 👈 Y esta también
    }
});

app.delete('/api/colaboradores/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input("ID", sql.Int, id)
            .query(`DELETE FROM Colaboradores WHERE ID=@ID`);
        res.json({ message: "Colaborador eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Guardar boleta de vacaciones
app.post('/api/vacaciones', async (req, res) => {
    try {
        const { CedulaID, Nombre, FechaIngreso, FechaSalida, FechaEntrada, DiasTomados } = req.body;

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('CedulaID', sql.NVarChar, CedulaID)
            .input('Nombre', sql.NVarChar, Nombre)
            .input('FechaIngreso', sql.Date, FechaIngreso)
            .input('FechaSalida', sql.Date, FechaSalida)
            .input('FechaEntrada', sql.Date, FechaEntrada)
            .input('DiasTomados', sql.Int, DiasTomados)
            .query(`
          INSERT INTO BoletaVacaciones (CedulaID, Nombre, FechaIngreso, FechaSalida, FechaEntrada, DiasTomados)
          VALUES (@CedulaID, @Nombre, @FechaIngreso, @FechaSalida, @FechaEntrada, @DiasTomados)
        `);

        res.status(201).json({ message: 'Boleta de vacaciones guardada correctamente' });
    } catch (error) {
        console.error("Error al guardar boleta de vacaciones:", error);
        res.status(500).json({ error: 'Error al guardar boleta' });
    }
});

//   app.get('/api/vacaciones', async (req, res) => {
//     try {
//       const pool = await sql.connect(config);
//       const result = await pool.request().query("SELECT CedulaID, DiasTomados FROM BoletaVacaciones");
//       res.json(result.recordset);
//     } catch (error) {
//       console.error('Error al obtener vacaciones:', error);
//       res.status(500).send('Error al obtener vacaciones');
//     }
//   });

app.get('/api/vacaciones', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT CedulaID, DiasTomados FROM BoletaVacaciones");
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener vacaciones:', error);
        res.status(500).send('Error al obtener vacaciones');
    }
});