require('dotenv').config();
const express = require('express');
const app = express();
const sql = require('mssql');
const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3001;

app.use(cors()); // 👈 permite solicitudes entre localhost:3000 ↔ 3001
app.use(express.json());

// ✅ Define primero las opciones CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};

app.get("/api/vacaciones/ultimo-numero", async (req, res) => {
  const localidad = req.query.localidad || '';
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("Empresa", sql.NVarChar, localidad)
      .query(`
        SELECT TOP 1 NumeroBoleta
        FROM BoletaVacaciones
        WHERE Empresa = @Empresa
        ORDER BY ID DESC
      `);
    const ultimo = result.recordset[0]?.NumeroBoleta || 'NINGUNO';
    res.json({ ultimo });
  } catch (error) {
    console.error("❌ Error al obtener último número:", error);
    res.status(500).json({ message: "Error interno" });
  }
});

// ✅ Luego aplica los middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
// Login

app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("Correo", sql.VarChar, correo)
      .input("Contrasena", sql.VarChar, contrasena)
      .query(`
        SELECT ID, Nombre, Correo, Localidad
        FROM Usuarios
        WHERE Correo = @Correo AND Contrasena = @Contrasena
      `);

    if (result.recordset.length === 1) {
      res.json({ success: true, usuario: result.recordset[0] });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



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
      Contrasena, Correo, FechaIngreso, Empresa, Foto, IDColaborador,
      Contrato, Cuenta, SalarioBase
    } = req.body;

    const pool = await sql.connect(dbConfig);
    console.log("Valores recibidos:");
    console.log({
      Nombre, Apellidos, CedulaID, Telefono, Direccion,
      Contrasena, Correo, FechaIngreso, Empresa, Foto, IDColaborador,
      Contrato, Cuenta, SalarioBase
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
      .input('Contrato', sql.VarChar, Contrato || null)
      .input('Cuenta', sql.VarChar, Cuenta || null)
      .input('SalarioBase', sql.Decimal(18, 2), SalarioBase || 0)
      .query(`
    INSERT INTO Colaboradores (
      Nombre, Apellidos, CedulaID, Telefono, Direccion, Contrasena, Correo,
      FechaIngreso, Empresa, Foto, IDColaborador, Contrato, Cuenta, SalarioBase
    )
    VALUES (
      @Nombre, @Apellidos, @CedulaID, @Telefono, @Direccion, @Contrasena, @Correo,
      @FechaIngreso, @Empresa, @Foto, @IDColaborador, @Contrato, @Cuenta, @SalarioBase
    )
  `);

    res.status(201).json({ message: 'Colaborador insertado correctamente' });
  } catch (error) {
    console.error("Error al insertar colaborador:", error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/colaboradores', async (req, res) => {
  const { localidad } = req.query; // viene de frontend
  try {
    const pool = await sql.connect(dbConfig);
    let result;

    if (localidad) {
      result = await pool.request()
        .input("Localidad", sql.VarChar, localidad)
        .query(`
          SELECT *
          FROM Colaboradores
          WHERE Empresa = @Localidad
        `);
    } else {
      result = await pool.request().query("SELECT * FROM Colaboradores");
    }

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
      Contrasena, Correo, FechaIngreso, Empresa, Foto, IDColaborador,
      Contrato, Cuenta, SalarioBase
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
      .input('Contrato', sql.VarChar, Contrato || null)
      .input('Cuenta', sql.VarChar, Cuenta || null)
      .input('SalarioBase', sql.Decimal(18, 2), SalarioBase || 0)
      .query(`UPDATE Colaboradores SET
  Nombre=@Nombre, Apellidos=@Apellidos, CedulaID=@CedulaID, Telefono=@Telefono,
  Direccion=@Direccion, Contrasena=@Contrasena, Correo=@Correo, FechaIngreso=@FechaIngreso,
  Empresa=@Empresa, Foto=@Foto, IDColaborador=@IDColaborador, Contrato=@Contrato,
  Cuenta=@Cuenta, SalarioBase=@SalarioBase
  WHERE ID=@ID
`);

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

app.delete('/api/vales/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('ID', sql.Int, id)
      .query('DELETE FROM Vales WHERE ID = @ID');

    res.status(200).json({ message: 'Vale eliminado correctamente' });
  } catch (err) {
    console.error("Error al eliminar vale:", err);
    res.status(500).json({ message: "Error al eliminar vale" });
  }
});

app.delete('/api/financiamientos/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('ID', sql.Int, id)
      .query('DELETE FROM Financiamientos WHERE ID = @ID');

    res.status(200).json({ message: 'Financiamiento eliminado correctamente' });
  } catch (err) {
    console.error("Error al eliminar financiamiento:", err);
    res.status(500).json({ message: "Error al eliminar financiamiento" });
  }
});

// POST - Guardar boleta de vacaciones
app.post('/api/vacaciones', async (req, res) => {
  try {
    const {
      CedulaID,
      Nombre,
      FechaIngreso,
      FechaSalida,
      FechaEntrada,
      DiasTomados,
      Detalle,
      NumeroBoleta,
      Empresa,
    } = req.body;

    const pool = await sql.connect(dbConfig);

    // Buscar apellidos desde la tabla Colaboradores
    const resultado = await pool.request()
      .input("CedulaID", sql.NVarChar, CedulaID)
      .query("SELECT Apellidos FROM Colaboradores WHERE CedulaID = @CedulaID");

    const Apellidos = resultado.recordset[0]?.Apellidos || '';

    // Insertar la boleta de vacaciones
    await pool.request()
      .input("CedulaID", sql.NVarChar, CedulaID)
      .input("Nombre", sql.NVarChar, Nombre)
      .input("Apellidos", sql.NVarChar, Apellidos)
      .input("FechaIngreso", sql.Date, FechaIngreso)
      .input("FechaSalida", sql.Date, FechaSalida)
      .input("FechaEntrada", sql.Date, FechaEntrada)
      .input("DiasTomados", sql.Int, DiasTomados)
      .input("Detalle", sql.NVarChar, Detalle)
      .input("NumeroBoleta", sql.NVarChar, NumeroBoleta)
      .input("Empresa", sql.NVarChar, Empresa)
      // .input("Usuario", sql.NVarChar, Usuario)
      .query(`
        INSERT INTO BoletaVacaciones 
        (CedulaID, Nombre, Apellidos, FechaIngreso, FechaSalida, FechaEntrada, DiasTomados, Detalle, NumeroBoleta, Empresa)
        VALUES 
        (@CedulaID, @Nombre, @Apellidos, @FechaIngreso, @FechaSalida, @FechaEntrada, @DiasTomados, @Detalle, @NumeroBoleta, @Empresa)
      `);

    res.status(200).json({ message: "Boleta registrada correctamente." });
  } catch (error) {
    console.error("❌ Error al registrar boleta:", error);
    res.status(500).json({ message: "Error al registrar boleta." });
  }
});

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

app.get('/api/vacaciones/:cedula', async (req, res) => {
  try {
    const cedula = req.params.cedula;
    const localidad = req.query.localidad || '';
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('CedulaID', sql.NVarChar, cedula)
      .input('Empresa', sql.NVarChar, localidad)
      .query(`
        SELECT * FROM BoletaVacaciones
        WHERE CedulaID = @CedulaID AND Empresa = @Empresa
        ORDER BY FechaSalida DESC
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener vacaciones:", error);
    res.status(500).json({ message: 'Error al obtener vacaciones' });
  }
});

app.post("/api/pago-planilla", async (req, res) => {
  const {
    CedulaID, Nombre, FechaIngreso,
    Contrato, Cuenta, SalarioBase, TipoPago,
    HorasTrabajadas, HorasExtra, Comisiones, Viaticos,
    CCSS, Prestamos, Vales, Adelantos, Ahorro,
    TotalPago, Localidad // <-- nuevo campo
  } = req.body;

  try {
    await sql.connect(dbConfig);
    await sql.query`
  INSERT INTO PagoPlanilla (
    CedulaID, Nombre, FechaIngreso,
    Contrato, Cuenta, SalarioBase, TipoPago,
    HorasTrabajadas, HorasExtra, Comisiones, Viaticos,
    CCSS, Prestamos, Vales, Adelantos, Ahorro,
    TotalPago, FechaRegistro, Localidad
  )
  VALUES (
    ${CedulaID}, ${Nombre}, ${FechaIngreso},
    ${Contrato}, ${Cuenta}, ${SalarioBase}, ${TipoPago},
    ${HorasTrabajadas}, ${HorasExtra}, ${Comisiones}, ${Viaticos},
    ${CCSS}, ${Prestamos}, ${Vales}, ${Adelantos}, ${Ahorro},
    ${TotalPago}, GETDATE(), ${Localidad}  -- ✅ COMA CORRECTA ANTES DE GETDATE()
  )
`;
    res.json({ message: "Pago registrado correctamente." });
  } catch (err) {
    console.error("Error al insertar pago:", err);
    res.status(500).json({ error: "Error al registrar el pago" });
  }
});

app.get("/api/pago-planilla/:cedula", async (req, res) => {
  const cedula = req.params.cedula;
  const localidad = req.query.localidad;

  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request()
      .input("CedulaID", sql.NVarChar, cedula);

    let query = `
      SELECT ID, Nombre, CedulaID, TotalPago, FechaRegistro, HorasTrabajadas, HorasExtra,
       Comisiones, Viaticos, CCSS, Prestamos, Vales, Adelantos, Ahorro
      FROM PagoPlanilla
      WHERE CedulaID = @CedulaID
    `;

    if (localidad) {
      request.input("Localidad", sql.NVarChar, localidad);
      query += " AND Localidad = @Localidad";
    }

    query += " ORDER BY FechaRegistro DESC";

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener pagos:", err);
    res.status(500).json({ message: "Error al obtener pagos." });
  }
});

app.delete("/api/pago-planilla/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ID", sql.Int, id)
      .query("DELETE FROM PagoPlanilla WHERE ID = @ID");
    res.json({ message: "Pago eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar pago:", error);
    res.status(500).json({ message: "Error al eliminar el pago" });
  }
});

app.put("/api/pago-planilla/:id", async (req, res) => {
  const id = req.params.id;
  const {
    CedulaID, Nombre, FechaIngreso, Contrato, Cuenta, SalarioBase, TipoPago,
    HorasTrabajadas, HorasExtra, Comisiones, Viaticos,
    CCSS, Prestamos, Vales, Adelantos, Ahorro, TotalPago
  } = req.body;

  try {
    await sql.query`
      UPDATE PagoPlanilla SET
        CedulaID = ${CedulaID},
        Nombre = ${Nombre},
        FechaIngreso = ${FechaIngreso},
        Contrato = ${Contrato},
        Cuenta = ${Cuenta},
        SalarioBase = ${SalarioBase},
        TipoPago = ${TipoPago},
        HorasTrabajadas = ${HorasTrabajadas},
        HorasExtra = ${HorasExtra},
        Comisiones = ${Comisiones},
        Viaticos = ${Viaticos},
        CCSS = ${CCSS},
        Prestamos = ${Prestamos},
        Vales = ${Vales},
        Adelantos = ${Adelantos},
        Ahorro = ${Ahorro},
        TotalPago = ${TotalPago}
      WHERE ID = ${id}
    `;
    res.json({ message: "Pago actualizado correctamente." });
  } catch (err) {
    console.error("Error al actualizar pago:", err);
    res.status(500).json({ message: "Error al actualizar el pago." });
  }
});

app.post('/api/financiamientos', async (req, res) => {
  const {
    CedulaID, Nombre, Producto, Monto, FechaCreacion,
    Plazo, InteresPorcentaje, Descripcion, Localidad
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('CedulaID', sql.NVarChar, CedulaID)
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Producto', sql.NVarChar, Producto)
      .input('Monto', sql.Decimal(18, 2), Monto)
      .input('FechaCreacion', sql.Date, FechaCreacion)
      .input('Plazo', sql.Int, Plazo)
      .input('InteresPorcentaje', sql.Decimal(5, 2), InteresPorcentaje || 0)
      .input('Descripcion', sql.NVarChar(sql.MAX), Descripcion)
      .input('Localidad', sql.NVarChar, Localidad || '')
      .query(`
        INSERT INTO Financiamientos (
  CedulaID, Nombre, Producto, Monto, FechaCreacion,
  Plazo, InteresPorcentaje, Descripcion, MontoPendiente, Localidad
)
VALUES (
  @CedulaID, @Nombre, @Producto, @Monto, @FechaCreacion,
  @Plazo, @InteresPorcentaje, @Descripcion, @Monto, @Localidad
)
      `);

    res.status(201).json({ message: 'Financiamiento guardado correctamente' });
  } catch (error) {
    console.error("Error al guardar financiamiento:", error);
    res.status(500).json({ error: 'Error al guardar financiamiento' });
  }
});

app.get("/api/financiamientos/:cedula", async (req, res) => {
  const cedula = req.params.cedula;
  const localidad = req.query.localidad;

  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request().input("CedulaID", sql.NVarChar, cedula);

    let query = `
      SELECT ID, Producto, Monto, MontoPendiente, FechaCreacion, Plazo, InteresPorcentaje, Descripcion, Estado
      FROM Financiamientos
      WHERE CedulaID = @CedulaID
    `;

    if (localidad) {
      request.input("Localidad", sql.NVarChar, localidad);
      query += ` AND Localidad = @Localidad`;
    }

    query += ` ORDER BY FechaCreacion DESC`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener financiamientos:", err);
    res.status(500).json({ message: "Error al obtener financiamientos." });
  }
});

app.post('/api/vales', async (req, res) => {
  const { CedulaID, Nombre, FechaRegistro, MontoVale, Empresa, Motivo } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('CedulaID', sql.NVarChar, CedulaID)
      .input('Nombre', sql.NVarChar, Nombre)
      .input('FechaRegistro', sql.Date, FechaRegistro)
      .input('MontoVale', sql.Decimal(18, 2), MontoVale)
      .input('Empresa', sql.NVarChar, Empresa)
      .input('Motivo', sql.NVarChar(sql.MAX), Motivo)
      .query(`
        INSERT INTO Vales (CedulaID, Nombre, FechaRegistro, MontoVale, Empresa, Motivo)
        VALUES (@CedulaID, @Nombre, @FechaRegistro, @MontoVale, @Empresa, @Motivo)
      `);

    res.status(201).json({ message: 'Vale guardado correctamente' });
  } catch (error) {
    console.error("Error al guardar vale:", error);
    res.status(500).json({ error: 'Error al guardar vale' });
  }
});

app.get('/api/vales/:cedula', async (req, res) => {
  try {
    const cedula = req.params.cedula;
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('CedulaID', sql.NVarChar, cedula)
      .input('Localidad', sql.NVarChar, req.query.localidad || '')
      .query(`
  SELECT * FROM Vales
  WHERE CedulaID = @CedulaID AND Empresa = @Localidad
  ORDER BY FechaRegistro DESC
`);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener vales:", error);
    res.status(500).json({ message: 'Error al obtener vales' });
  }
});

// Generar nuevo número de boleta formato NB001, NB002, ...
app.get("/api/vacaciones/numeroboleta", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request().query(`
      SELECT TOP 1 NumeroBoleta
      FROM BoletaVacaciones
      ORDER BY ID DESC
    `);

    let ultimoNumero = result.recordset[0]?.NumeroBoleta || "NB000";
    let numero = parseInt(ultimoNumero.replace("NB", ""), 10) + 1;
    let nuevoNumero = `NB${numero.toString().padStart(3, "0")}`;

    res.json({ numeroBoleta: nuevoNumero });
  } catch (error) {
    console.error("Error generando número de boleta:", error);
    res.status(500).json({ error: "Error al generar número de boleta" });
  }
});

app.get('/api/financiamientos', async (req, res) => {
  const localidad = req.query.localidad;

  try {
    const pool = await sql.connect(dbConfig);
    let result;

    if (localidad) {
      result = await pool.request()
        .input("Localidad", sql.NVarChar, localidad)
        .query(`
          SELECT * FROM Financiamientos
          WHERE Localidad = @Localidad
          ORDER BY FechaCreacion DESC
        `);
    } else {
      result = await pool.request()
        .query("SELECT * FROM Financiamientos ORDER BY FechaCreacion DESC");
    }

    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener financiamientos:", err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.put('/api/financiamientos/:id', async (req, res) => {
  const id = req.params.id;
  const {
    CedulaID, Nombre, Producto, Monto, FechaCreacion,
    Plazo, InteresPorcentaje, Descripcion
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('ID', sql.Int, id)
      .input('CedulaID', sql.NVarChar, CedulaID)
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Producto', sql.NVarChar, Producto)
      .input('Monto', sql.Decimal(18, 2), Monto)
      .input('FechaCreacion', sql.Date, FechaCreacion)
      .input('Plazo', sql.Int, Plazo)
      .input('InteresPorcentaje', sql.Decimal(5, 2), InteresPorcentaje || 0)
      .input('Descripcion', sql.NVarChar(sql.MAX), Descripcion)
      .query(`
        UPDATE Financiamientos SET
          CedulaID = @CedulaID,
          Nombre = @Nombre,
          Producto = @Producto,
          MontoPendiente = @Monto,
          FechaCreacion = @FechaCreacion,
          Plazo = @Plazo,
          InteresPorcentaje = @InteresPorcentaje,
          Descripcion = @Descripcion
        WHERE ID = @ID
      `);

    res.json({ message: "Financiamiento actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar financiamiento:", error);
    res.status(500).json({ error: 'Error al actualizar financiamiento' });
  }
});

app.get("/api/vacaciones", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("Empresa", sql.NVarChar, req.query.localidad || '')
      .query(`
        SELECT Nombre, Apellidos, CedulaID, FechaSalida, FechaEntrada,
               Detalle, NumeroBoleta, DiasTomados AS Dias, DiasDisponibles
        FROM BoletaVacaciones
        WHERE Empresa = @Empresa
        ORDER BY FechaSalida DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error obteniendo boletas:", err);
    res.status(500).json({ message: "Error al obtener boletas" });
  }
});


// PUT - Actualizar financiamiento por ID
app.put('/api/financiamientos/:id', async (req, res) => {
  const id = req.params.id;
  const {
    CedulaID, Nombre, Producto, Monto, FechaCreacion,
    Plazo, InteresPorcentaje, Descripcion
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('ID', sql.Int, id)
      .input('CedulaID', sql.NVarChar, CedulaID)
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Producto', sql.NVarChar, Producto)
      .input('Monto', sql.Decimal(18, 2), Monto)
      .input('FechaCreacion', sql.Date, FechaCreacion)
      .input('Plazo', sql.Int, Plazo)
      .input('InteresPorcentaje', sql.Decimal(5, 2), InteresPorcentaje || 0)
      .input('Descripcion', sql.NVarChar(sql.MAX), Descripcion)
      .query(`
        UPDATE Financiamientos SET
          CedulaID = @CedulaID,
          Nombre = @Nombre,
          Producto = @Producto,
          Monto = @Monto,
          FechaCreacion = @FechaCreacion,
          Plazo = @Plazo,
          InteresPorcentaje = @InteresPorcentaje,
          Descripcion = @Descripcion
        WHERE ID = @ID
      `);
    res.json({ message: "Financiamiento actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar financiamiento:", error);
    res.status(500).json({ error: "Error al actualizar financiamiento" });
  }
});

app.put('/api/financiamientos/:id', async (req, res) => {
  const id = req.params.id;
  const {
    CedulaID, Nombre, Producto, Monto, FechaCreacion,
    Plazo, InteresPorcentaje, Descripcion
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ID", sql.Int, id)
      .input("CedulaID", sql.NVarChar, CedulaID)
      .input("Nombre", sql.NVarChar, Nombre)
      .input("Producto", sql.NVarChar, Producto)
      .input("Monto", sql.Decimal(18, 2), Monto)
      .input("FechaCreacion", sql.Date, FechaCreacion)
      .input("Plazo", sql.Int, Plazo)
      .input("InteresPorcentaje", sql.Decimal(5, 2), InteresPorcentaje || 0)
      .input("Descripcion", sql.NVarChar(sql.MAX), Descripcion)
      .query(`
        UPDATE Financiamientos SET
          CedulaID = @CedulaID,
          Nombre = @Nombre,
          Producto = @Producto,
          Monto = @Monto,
          FechaCreacion = @FechaCreacion,
          Plazo = @Plazo,
          InteresPorcentaje = @InteresPorcentaje,
          Descripcion = @Descripcion
        WHERE ID = @ID
      `);

    res.json({ message: "Financiamiento actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando financiamiento:", error);
    res.status(500).json({ error: 'Error al actualizar financiamiento' });
  }
});

app.put("/api/vacaciones/editar", async (req, res) => {
  const { ID, FechaSalida, FechaEntrada, Detalle, DiasTomados } = req.body;

  console.log("Datos recibidos para actualizar:", { ID, FechaSalida, FechaEntrada, Detalle, DiasTomados })

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ID", sql.Int, ID)
      .input("FechaSalida", sql.Date, FechaSalida)
      .input("FechaEntrada", sql.Date, FechaEntrada)
      .input("Detalle", sql.NVarChar(sql.MAX), Detalle)
      .input("DiasTomados", sql.Int, DiasTomados)
      .query(`
        UPDATE BoletaVacaciones
        SET FechaSalida = @FechaSalida,
            FechaEntrada = @FechaEntrada,
            Detalle = @Detalle,
            DiasTomados = @DiasTomados
        WHERE ID = @ID
      `);
    res.json({ message: "Vacación actualizada correctamente" });
  } catch (error) {
    console.error("Error actualizando vacaciones:", error);
    res.status(500).json({ error: "Error al actualizar vacaciones" });
  }
});


app.post("/api/pagos-financiamiento", async (req, res) => {
  const { FinanciamientoID, FechaPago, MontoAplicado, Observaciones, Localidad } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    // 1. Insertar el pago en PagosFinanciamiento
    await pool.request()
      .input("FinanciamientoID", sql.Int, FinanciamientoID)
      .input("FechaPago", sql.Date, FechaPago)
      .input("MontoAplicado", sql.Decimal(18, 2), MontoAplicado)
      .input("Observaciones", sql.NVarChar(sql.MAX), Observaciones)
      .input("Localidad", sql.NVarChar, Localidad)
      .query(`
        INSERT INTO PagosFinanciamiento (FinanciamientoID, FechaPago, MontoAplicado, Observaciones, Localidad)
        VALUES (@FinanciamientoID, @FechaPago, @MontoAplicado, @Observaciones, @Localidad)
      `);

    // 2. Actualizar el monto pendiente
    await pool.request()
      .input("ID", sql.Int, FinanciamientoID)
      .input("MontoAplicado", sql.Decimal(18, 2), MontoAplicado)
      .query(`
        UPDATE Financiamientos
        SET MontoPendiente = ISNULL(MontoPendiente, 0) - @MontoAplicado
        WHERE ID = @ID
      `);

    // 3. Consultar si el saldo ya es cero o menor
    const result = await pool.request()
      .input("ID", sql.Int, FinanciamientoID)
      .query(`
        SELECT * FROM Financiamientos
        WHERE ID = @ID AND ISNULL(MontoPendiente, 0) <= 0
      `);

    if (result.recordset.length > 0) {
      const f = result.recordset[0];

      // 4. Registrar en tabla EliminadosFin, ahora incluyendo Localidad ✅
      await pool.request()
        .input("FinanciamientoID", sql.Int, f.ID)
        .input("CedulaID", sql.NVarChar(50), f.CedulaID)
        .input("Nombre", sql.NVarChar(100), f.Nombre)
        .input("MontoOriginal", sql.Decimal(18, 2), f.Monto)
        .input("FechaEliminacion", sql.Date, new Date())
        .input("Motivo", sql.NVarChar(sql.MAX), "Eliminado automáticamente tras pago completo desde Planilla")
        .input("Localidad", sql.NVarChar(100), Localidad) // ✅ CAMPO AÑADIDO
        .query(`
          INSERT INTO EliminadosFin (FinanciamientoID, CedulaID, Nombre, MontoOriginal, FechaEliminacion, Motivo, Localidad)
          VALUES (@FinanciamientoID, @CedulaID, @Nombre, @MontoOriginal, @FechaEliminacion, @Motivo, @Localidad)
        `);

      // 5. Eliminar de la tabla Financiamientos
      const deleteResult = await pool.request()
        .input("ID", sql.Int, f.ID)
        .query(`DELETE FROM Financiamientos WHERE ID = @ID`);

      console.log("Filas eliminadas en Financiamientos:", deleteResult.rowsAffected);
    }

    res.json({ message: "Pago aplicado correctamente" });

  } catch (err) {
    console.error("Error al aplicar el pago de financiamiento:", err);
    res.status(500).json({ error: "Error al aplicar el pago de financiamiento" });
  }
});

app.post('/api/financiamientos', async (req, res) => {
  const {
    CedulaID, Nombre, Producto, Monto, FechaCreacion,
    Plazo, InteresPorcentaje, Descripcion
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('CedulaID', sql.NVarChar, CedulaID)
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Producto', sql.NVarChar, Producto)
      .input('Monto', sql.Decimal(18, 2), Monto)
      .input('FechaCreacion', sql.Date, FechaCreacion)
      .input('Plazo', sql.Int, Plazo)
      .input('InteresPorcentaje', sql.Decimal(5, 2), InteresPorcentaje || 0)
      .input('Descripcion', sql.NVarChar(sql.MAX), Descripcion)
      .input('MontoPendiente', sql.Decimal(18, 2), Monto) // inicializa igual a Monto
      .query(`
        INSERT INTO Financiamientos (
          CedulaID, Nombre, Producto, Monto, FechaCreacion,
          Plazo, InteresPorcentaje, Descripcion, MontoPendiente
        )
        VALUES (
          @CedulaID, @Nombre, @Producto, @Monto, @FechaCreacion,
          @Plazo, @InteresPorcentaje, @Descripcion, @MontoPendiente
        )
      `);

    res.status(201).json({ message: 'Financiamiento guardado correctamente' });
  } catch (error) {
    console.error("Error al guardar financiamiento:", error);
    res.status(500).json({ error: 'Error al guardar financiamiento' });
  }
});

app.get("/api/abonos/:financiamientoId", async (req, res) => {
  const id = req.params.financiamientoId;
  try {
    const result = await sql.query`
      SELECT FechaPago, MontoAplicado, Observaciones
      FROM PagosFinanciamiento
      WHERE FinanciamientoID = ${id}
      ORDER BY FechaPago DESC
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener abonos:", err);
    res.status(500).json({ error: "Error al obtener abonos" });
  }
});


app.get('/api/aguinaldo/:cedula', async (req, res) => {
  const { cedula } = req.params;
  const { localidad } = req.query;

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('CedulaID', sql.VarChar, cedula)
      .input('Localidad', sql.NVarChar, localidad || '')
      .query(`
        SELECT 
          FechaRegistro,
          -- ✅ Salario mensual dividido entre 2 por ser quincena
          (ISNULL(SalarioBase, 0) / 2.0) +
          ISNULL(Comisiones, 0) +
          ISNULL(Viaticos, 0) +
          ISNULL(HorasExtra, 0) AS TotalBruto
        FROM PagoPlanilla
        WHERE CedulaID = @CedulaID 
          AND Localidad = @Localidad
          AND FechaRegistro >= DATEFROMPARTS(YEAR(GETDATE()) - 1, 12, 1)
          AND FechaRegistro <= DATEFROMPARTS(YEAR(GETDATE()), 11, 30)
      `);

    const pagos = result.recordset;

    const totalBruto = pagos.reduce((sum, p) => sum + (p.TotalBruto || 0), 0);
    const aguinaldo = totalBruto / 12;

    res.json({
      aguinaldo: aguinaldo.toFixed(2),
      pagos
    });

  } catch (error) {
    console.error("Error al calcular aguinaldo:", error);
    res.status(500).json({ error: "Error al calcular aguinaldo" });
  }
});


const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// API para consultar cédula en Hacienda desde el backend
app.post('/api/consultar-cedula-hacienda', async (req, res) => {
  const { cedula } = req.body;

  const clientId = 'TU_CLIENT_ID'; // ← Poner aquí tu ClientID
  const clientSecret = 'TU_CLIENT_SECRET'; // ← Poner aquí tu ClientSecret

  try {
    // Paso 1: Obtener el token
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);

    const tokenResponse = await fetch('https://idp.comprobanteselectronicos.go.cr/auth/realms/rut/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    if (!tokenResponse.ok) {
      console.error('Error al obtener token de Hacienda');
      return res.status(500).json({ error: 'Error obteniendo token' });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Paso 2: Consultar contribuyente
    const consultaResponse = await fetch(`https://api.comprobanteselectronicos.go.cr/recepcion/v1/consultas?identificacion=${cedula}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!consultaResponse.ok) {
      console.error('Error al consultar cédula:', await consultaResponse.text());
      return res.status(404).json({ error: 'Cédula no encontrada en Hacienda' });
    }

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Error al obtener token de Hacienda:', errorText);
      return res.status(500).json({ error: 'Error obteniendo token', detalle: errorText });
    }

    const consultaData = await consultaResponse.json();
    res.json(consultaData);

  } catch (error) {
    console.error('Error en consulta a Hacienda:', error);
    res.status(500).json({ error: 'Error en consulta a Hacienda' });
  }
});



// Insertar Localidad 

// En tu archivo routes o backend
app.post('/api/localidades', async (req, res) => {
  const {
    Empresa, Alias, TipoCedula, NumeroCedula, RazonSocial, Correo,
    Dirreccion, Telefono, Provincia, Canton, Distrito,
    Regimen, PieDocumento, PieProforma, LimiteFact, MontoLicencia,
    Cuenta1, Cuenta2, Banco2, Sinpe, Logo
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('Empresa', sql.NVarChar, Empresa || '')
      .input('Alias', sql.NVarChar, Alias || '')
      .input('TipoCedula', sql.NVarChar, TipoCedula || '')
      .input('NumeroCedula', sql.NVarChar, NumeroCedula)
      .input('RazonSocial', sql.NVarChar, RazonSocial || '')
      .input('Correo', sql.NVarChar, Correo || '')
      .input('Dirreccion', sql.NVarChar, Dirreccion || '')
      .input('Telefono', sql.NVarChar, Telefono || '')
      .input('Provincia', sql.NVarChar, Provincia || '')
      .input('Canton', sql.NVarChar, Canton || '')
      .input('Distrito', sql.NVarChar, Distrito || '')
      .input('Regimen', sql.NVarChar, Regimen || '')
      .input('PieDocumento', sql.NVarChar(sql.MAX), PieDocumento || '')
      .input('PieProforma', sql.NVarChar(sql.MAX), PieProforma || '')
      .input('LimiteFact', sql.Decimal(18, 2), parseFloat(LimiteFact) || 0)
      .input('MontoLicencia', sql.Decimal(18, 2), parseFloat(MontoLicencia) || 0)
      .input('Cuenta1', sql.NVarChar, Cuenta1 || '')
      .input('Cuenta2', sql.NVarChar, Cuenta2 || '')
      .input('Banco2', sql.NVarChar, Banco2 || '')
      .input('Sinpe', sql.NVarChar, Sinpe || '')
      .input('Logo', sql.NVarChar(sql.MAX), Logo || '')
      .query(`
        INSERT INTO Localidades (
  Empresa, Alias, TipoCedula, NumeroCedula, RazonSocial, Correo, Dirreccion, Telefono,
  Provincia, Canton, Distrito, Regimen, PieDocumento, PieProforma,
  LimiteFact, MontoLicencia, Cuenta1, Cuenta2, Banco2, Sinpe, Logo
) VALUES (
  @Empresa, @Alias, @TipoCedula, @NumeroCedula, @RazonSocial, @Correo, @Dirreccion, @Telefono,
  @Provincia, @Canton, @Distrito, @Regimen, @PieDocumento, @PieProforma,
  @LimiteFact, @MontoLicencia, @Cuenta1, @Cuenta2, @Banco2, @Sinpe, @Logo
)
      `);

    res.status(200).json({ message: 'Localidad guardada correctamente' });
  } catch (err) {
    console.error("Error al guardar localidad:", err);
    res.status(500).json({ error: "Error al guardar localidad" });
  }
});

app.get("/api/reporte-pagos", async (req, res) => {
  const { inicio, fin, localidad } = req.query;

  // Validación básica
  if (!inicio || !fin || isNaN(Date.parse(inicio)) || isNaN(Date.parse(fin))) {
    return res.status(400).json({ error: "Fechas inválidas o faltantes." });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("Inicio", sql.Date, new Date(inicio))
      .input("Fin", sql.Date, new Date(fin))
      .input("Localidad", sql.NVarChar, localidad)
      .query(`
        SELECT *
        FROM PagoPlanilla
        WHERE Localidad = @Localidad
          AND CONVERT(date, FechaRegistro) BETWEEN @Inicio AND @Fin
        ORDER BY FechaRegistro DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error en reporte-pagos:", err);
    res.status(500).json({ error: "Error interno al generar el reporte." });
  }
});

app.get("/api/vacaciones/ultimoboleta", async (req, res) => {
  const localidad = req.query.localidad;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("Localidad", sql.NVarChar, localidad)
      .query(`
        SELECT TOP 1 NumeroBoleta
        FROM BoletaVacaciones
        WHERE Empresa = @Localidad
        ORDER BY ID DESC
      `);

    const ultimo = result.recordset[0]?.NumeroBoleta || "Ninguno";
    res.json({ NumeroBoleta: ultimo });
  } catch (error) {
    console.error("Error al obtener el último número de boleta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


app.get("/api/localidades/:nombre", async (req, res) => {
  const nombre = req.params.nombre;

  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("Empresa", sql.NVarChar, nombre)
    .query("SELECT * FROM Localidades WHERE Empresa LIKE '%' + @Empresa + '%'");

  if (result.recordset.length > 0) {
    res.json(result.recordset[0]);
  } else {
    res.status(404).json({ message: "No se encontró la localidad" });
  }
});

app.get("/api/localidades", async (req, res) => {
  const nombre = req.query.nombre;
  if (!nombre) return res.status(400).json({ message: "Falta el nombre de la localidad" });

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("Empresa", sql.NVarChar, nombre)
      .query("SELECT TOP 1 * FROM Localidades WHERE Empresa = @Empresa");

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ message: "No se encontró la localidad" });
    }
  } catch (error) {
    console.error("Error al consultar localidad:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.get("/api/localidades", async (req, res) => {
  const nombre = req.query.nombre;
  if (!nombre) {
    return res.status(400).json({ message: "Falta el nombre de la localidad" });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("Empresa", sql.NVarChar, nombre)
      .query("SELECT * FROM Localidades WHERE Empresa = @Empresa");

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ message: "Localidad no encontrada" });
    }
  } catch (err) {
    console.error("Error al obtener localidad:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


app.get('/api/boletas-vacaciones', async (req, res) => {
  try {
    const { localidad } = req.query;
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("Empresa", sql.NVarChar, localidad)
      .query("SELECT * FROM BoletaVacaciones WHERE Empresa = @Empresa ORDER BY FechaSalida DESC");
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener boletas:", error);
    res.status(500).json({ error: "Error al obtener boletas" });
  }
});

// Endpoint para obtener datos del encabezado de boleta
app.get("/api/encabezado-localidad", async (req, res) => {
  const localidad = req.query.localidad;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("Localidad", sql.NVarChar, localidad)
      .query("SELECT TOP 1 * FROM Localidades WHERE Nombre = @Localidad");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Localidad no encontrada" });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error en /api/encabezado-localidad:", error);
    res.status(500).json({ message: "Error al obtener encabezado" });
  }
});

app.get("/api/financiamientos-localidad", async (req, res) => {
  try {
    const localidad = req.query.localidad;
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input("Localidad", sql.NVarChar, localidad)
      .query(`
        SELECT * FROM Financiamientos
        WHERE Localidad = @Localidad
        ORDER BY FechaCreacion DESC
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener financiamientos por localidad:", error);
    res.status(500).json({ error: "Error al obtener financiamientos por localidad" });
  }
});

app.get('/api/vales', async (req, res) => {
  const localidad = req.query.localidad || '';

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('Empresa', sql.NVarChar, localidad)
      .query(`
        SELECT * FROM Vales
        WHERE Empresa = @Empresa
        ORDER BY FechaRegistro DESC
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener lista de vales:", error);
    res.status(500).json({ message: "Error al obtener vales por localidad" });
  }
});

app.put('/api/vales/:id', async (req, res) => {
  const id = req.params.id;
  const { FechaRegistro, MontoVale, Motivo } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ID", sql.Int, id)
      .input("FechaRegistro", sql.Date, FechaRegistro)
      .input("MontoVale", sql.Decimal(18, 2), MontoVale)
      .input("Motivo", sql.NVarChar(sql.MAX), Motivo)
      .query(`
        UPDATE Vales
        SET FechaRegistro = @FechaRegistro,
            MontoVale = @MontoVale,
            Motivo = @Motivo
        WHERE ID = @ID
      `);

    res.json({ message: "Vale actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando vale:", error);
    res.status(500).json({ message: "Error actualizando vale" });
  }
});

app.delete('/api/vales/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('ID', sql.Int, id)
      .query('DELETE FROM Vales WHERE ID = @ID');

    res.status(200).json({ message: 'Vale eliminado correctamente' });
  } catch (err) {
    console.error("Error al eliminar vale:", err);
    res.status(500).json({ message: "Error al eliminar vale" });
  }
});

app.delete('/api/vacaciones/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const pool = await sql.connect(dbConfig);

    // ✅ 1. Verificar si existe la boleta
    const check = await pool.request()
      .input('ID', sql.Int, id)
      .query('SELECT * FROM BoletaVacaciones WHERE ID = @ID');

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: 'Boleta no encontrada.' });
    }

    const boleta = check.recordset[0];

    // ✅ 2. Verificar si la fecha de salida ya pasó
    const hoy = new Date();
    const fechaSalida = new Date(boleta.FechaSalida);
    if (fechaSalida <= hoy) {
      return res.status(400).json({ message: 'No se puede eliminar una boleta cuya fecha de salida ya ha pasado.' });
    }

    // ✅ 3. Validación opcional: evitar eliminar si fue usada en cálculo
    // Suponiendo que tenga algún campo como boleta.UsadaEnPago
    if (boleta.UsadaEnPago === 1) {
      return res.status(400).json({ message: 'Esta boleta ya fue utilizada en el cálculo de pago y no puede eliminarse.' });
    }

    // ✅ 4. Eliminar
    await pool.request()
      .input('ID', sql.Int, id)
      .query('DELETE FROM BoletaVacaciones WHERE ID = @ID');

    res.status(200).json({ message: 'Boleta eliminada correctamente.' });

  } catch (error) {
    console.error("❌ Error al eliminar boleta:", error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar.' });
  }
});



app.post("/api/financiamientos/aplicar-abono", async (req, res) => {
  const { FinanciamientoID, MontoAplicado, Observaciones, Localidad } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    // 1. Insertar abono en PagosFinanciamiento
    await pool.request()
      .input("FinanciamientoID", sql.Int, FinanciamientoID)
      .input("FechaPago", sql.Date, new Date())
      .input("MontoAplicado", sql.Decimal(18, 2), MontoAplicado)
      .input("Observaciones", sql.NVarChar(sql.MAX), Observaciones)
      .input("Localidad", sql.NVarChar, Localidad)
      .query(`
        INSERT INTO PagosFinanciamiento (FinanciamientoID, FechaPago, MontoAplicado, Observaciones, Localidad)
        VALUES (@FinanciamientoID, @FechaPago, @MontoAplicado, @Observaciones, @Localidad)
      `);

    // 2. Actualizar MontoPendiente
    await pool.request()
      .input("ID", sql.Int, FinanciamientoID)
      .input("MontoAplicado", sql.Decimal(18, 2), MontoAplicado)
      .query(`
        UPDATE Financiamientos
        SET MontoPendiente = ISNULL(MontoPendiente, 0) - @MontoAplicado
        WHERE ID = @ID
      `);

    // 3. Verificar si ya está en cero
    const result = await pool.request()
      .input("ID", sql.Int, FinanciamientoID)
      .query(`
        SELECT * FROM Financiamientos
        WHERE ID = @ID AND ISNULL(MontoPendiente, 0) <= 0
      `);

    if (result.recordset.length > 0) {
      const f = result.recordset[0];

      // 4. Registrar en tabla EliminadosFin, ahora incluyendo Localidad ✅
      await pool.request()
        .input("FinanciamientoID", sql.Int, f.ID)
        .input("CedulaID", sql.NVarChar(50), f.CedulaID)
        .input("Nombre", sql.NVarChar(100), f.Nombre)
        .input("MontoOriginal", sql.Decimal(18, 2), f.Monto)
        .input("FechaEliminacion", sql.Date, new Date())
        .input("Motivo", sql.NVarChar(sql.MAX), "Eliminado automáticamente tras pago completo desde Planilla")
        .input("Localidad", sql.NVarChar(100), Localidad)
        .query(`
      INSERT INTO EliminadosFin (FinanciamientoID, CedulaID, Nombre, MontoOriginal, FechaEliminacion, Motivo, Localidad)
      VALUES (@FinanciamientoID, @CedulaID, @Nombre, @MontoOriginal, @FechaEliminacion, @Motivo, @Localidad)
    `);

      // ✅ 5.1 Eliminar pagos relacionados para evitar error de clave foránea
      await pool.request()
        .input("FinanciamientoID", sql.Int, f.ID)
        .query(`DELETE FROM PagosFinanciamiento WHERE FinanciamientoID = @FinanciamientoID`);

      // ✅ 5.2 Ahora sí eliminar el financiamiento
      await pool.request()
        .input("ID", sql.Int, f.ID)
        .query(`DELETE FROM Financiamientos WHERE ID = @ID`);
    }

    res.json({ message: "Abono aplicado correctamente" });

  } catch (err) {
    console.error("❌ Error general al aplicar abono:", err);
    res.status(500).json({ error: "Error al aplicar el abono de financiamiento" });
  }
});


app.post("/api/vales/pagado", async (req, res) => {
  const {
    ValeID, CedulaID, Nombre, FechaPago,
    MontoAplicado, Observaciones, Empresa
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ValeID", sql.Int, ValeID)
      .input("CedulaID", sql.NVarChar, CedulaID)
      .input("Nombre", sql.NVarChar, Nombre)
      .input("FechaPago", sql.Date, FechaPago)
      .input("MontoAplicado", sql.Decimal(18, 2), MontoAplicado)
      .input("Observaciones", sql.NVarChar(sql.MAX), Observaciones)
      .input("Empresa", sql.NVarChar, Empresa)
      .query(`
        INSERT INTO ValesPagados (
          ValeID, CedulaID, Nombre, FechaPago,
          MontoAplicado, Observaciones, Empresa
        )
        VALUES (
          @ValeID, @CedulaID, @Nombre, @FechaPago,
          @MontoAplicado, @Observaciones, @Empresa
        )
      `);

    res.json({ message: "Vale registrado como pagado correctamente" });
  } catch (err) {
    console.error("Error al registrar vale pagado:", err);
    res.status(500).json({ error: "Error al registrar vale pagado" });
  }
});

app.put("/api/vales/:id", async (req, res) => {
  try {
    const { MontoVale } = req.body;
    const id = req.params.id;

    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ID", sql.Int, id)
      .input("MontoVale", sql.Decimal(18, 2), MontoVale)
      .query("UPDATE Vales SET MontoVale = @MontoVale WHERE ID = @ID");

    res.json({ message: "Vale actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando vale:", error);
    res.status(500).json({ error: "Error actualizando vale" });
  }
});

app.get("/api/vales/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ID", sql.Int, id)
      .query("SELECT * FROM Vales WHERE ID = @ID");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Vale no encontrado" });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error al obtener el vale:", error);
    res.status(500).json({ error: "Error al obtener el vale" });
  }
});


const guardarEdicionPago = async (pagoEditado) => {
  try {
    const response = await fetch("http://localhost:3001/api/pagos/editar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pagoEditado),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Pago actualizado correctamente.");
      setShowEditarPagoModal(false);
      obtenerPagosColaborador(); // refrescar lista
    } else {
      alert("Error al actualizar: " + data.error);
    }
  } catch (error) {
    console.error("Error al editar pago:", error);
    alert("Hubo un error al intentar editar el pago.");
  }
};


app.delete("/api/pagos/eliminar/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    // 1. Verificar que el pago sea de hoy
    const result = await pool
      .request()
      .input("ID", sql.Int, id)
      .query("SELECT * FROM PagoPlanilla WHERE ID = @ID");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    const pago = result.recordset[0];
    const fechaHoy = new Date().toISOString().slice(0, 10);
    const fechaPago = pago.FechaRegistro.toISOString().slice(0, 10);

    if (fechaHoy !== fechaPago) {
      return res.status(403).json({ error: "Solo se pueden eliminar pagos del día de hoy" });
    }

    // 2. Revertir financiamientos
    await pool
      .request()
      .input("PagoID", sql.Int, id)
      .query(`
        UPDATE f
        SET f.MontoPendiente = f.MontoPendiente + pf.MontoAplicado
        FROM Financiamientos f
        INNER JOIN PagosFinanciamiento pf ON pf.FinanciamientoID = f.ID
        WHERE pf.PagoID = @PagoID
      `);

    // 3. Eliminar registros de PagosFinanciamiento
    await pool
      .request()
      .input("PagoID", sql.Int, id)
      .query("DELETE FROM PagosFinanciamiento WHERE PagoID = @PagoID");

    // 4. Revertir Vales (suma de nuevo el monto aplicado)
    await pool
      .request()
      .input("PagoID", sql.Int, id)
      .query(`
        UPDATE v
        SET v.MontoVale = v.MontoVale + vp.MontoAplicado
        FROM Vales v
        INNER JOIN ValesPagados vp ON vp.ValeID = v.ID
        WHERE vp.PagoID = @PagoID
      `);

    // 5. Eliminar registros de ValesPagados
    await pool
      .request()
      .input("PagoID", sql.Int, id)
      .query("DELETE FROM ValesPagados WHERE PagoID = @PagoID");

    // 6. Eliminar el registro de PagoPlanilla
    await pool
      .request()
      .input("ID", sql.Int, id)
      .query("DELETE FROM PagoPlanilla WHERE ID = @ID");

    res.json({ message: "Pago eliminado y revertido correctamente" });

  } catch (err) {
    console.error("❌ Error al eliminar pago:", err);
    res.status(500).json({ error: "Error al eliminar el pago" });
  }
});

app.delete("/api/eliminar-pago-planilla/:id", async (req, res) => {
  const idPago = parseInt(req.params.id);
  if (isNaN(idPago)) return res.status(400).json({ error: "ID inválido" });

  try {
    const pool = await sql.connect(dbConfig);

    // 1. Obtener el pago
    const { recordset } = await pool.request()
      .input("ID", sql.Int, idPago)
      .query("SELECT * FROM PagoPlanilla WHERE ID = @ID");

    if (recordset.length === 0) return res.status(404).json({ error: "Pago no encontrado" });

    const pago = recordset[0];

    // 2. Verificar si es del día
    const hoy = new Date().toISOString().slice(0, 10);
    if (pago.FechaRegistro.slice(0, 10) !== hoy)
      return res.status(400).json({ error: "Solo se pueden eliminar pagos del día" });

    // 3. Revertir financiamientos
    if (pago.Prestamos > 0) {
      const pagosFin = await pool.request()
        .input("CedulaID", sql.NVarChar, pago.CedulaID)
        .query(`SELECT * FROM PagosFinanciamiento WHERE CedulaID = @CedulaID AND Observaciones = 'Aplicado desde Planilla' AND MontoAplicado > 0`);

      for (const abono of pagosFin.recordset) {
        // Revertir monto pendiente
        await pool.request()
          .input("ID", sql.Int, abono.FinanciamientoID)
          .input("Monto", sql.Decimal(18, 2), abono.MontoAplicado)
          .query(`UPDATE Financiamientos SET MontoPendiente = MontoPendiente + @Monto WHERE ID = @ID`);

        // Borrar abono
        await pool.request()
          .input("ID", sql.Int, abono.ID)
          .query(`DELETE FROM PagosFinanciamiento WHERE ID = @ID`);
      }
    }

    // 4. Revertir vales
    if (pago.Vales > 0) {
      const pagosVales = await pool.request()
        .input("CedulaID", sql.NVarChar, pago.CedulaID)
        .query(`SELECT * FROM ValesPagados WHERE CedulaID = @CedulaID AND Observaciones = 'Aplicado desde Planilla' AND MontoAplicado > 0`);

      for (const valePagado of pagosVales.recordset) {
        await pool.request()
          .input("ID", sql.Int, valePagado.ValeID)
          .input("Monto", sql.Decimal(18, 2), valePagado.MontoAplicado)
          .query(`UPDATE Vales SET MontoVale = MontoVale + @Monto WHERE ID = @ID`);

        await pool.request()
          .input("ID", sql.Int, valePagado.ID)
          .query(`DELETE FROM ValesPagados WHERE ID = @ID`);
      }
    }

    // 5. Eliminar el pago principal
    await pool.request()
      .input("ID", sql.Int, idPago)
      .query(`DELETE FROM PagoPlanilla WHERE ID = @ID`);

    res.json({ message: "Pago eliminado y saldos revertidos" });

  } catch (err) {
    console.error("❌ Error al eliminar pago:", err);
    res.status(500).json({ error: "Error al eliminar el pago" });
  }
});