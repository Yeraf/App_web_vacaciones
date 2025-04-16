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

// GET - Obtener todos los colaboradores
app.get('/api/colaboradores', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(
      `SELECT ID, Nombre, Apellidos, CedulaID, Telefono, Direccion, Contrasena, Correo, FechaIngreso, Empresa,Foto, IDColaborador, Contrato, Cuenta, SalarioBase FROM Colaboradores`
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

// POST - Guardar boleta de vacaciones
app.post("/api/vacaciones", async (req, res) => {
  const {
    CedulaID, Nombre, FechaIngreso,
    FechaSalida, FechaEntrada, DiasTomados,
    Detalle, NumeroBoleta
  } = req.body;

  try {
    await pool.request()
      .input("CedulaID", CedulaID)
      .input("Nombre", Nombre)
      .input("FechaIngreso", FechaIngreso)
      .input("FechaSalida", FechaSalida)
      .input("FechaEntrada", FechaEntrada)
      .input("DiasTomados", DiasTomados)
      .input("Detalle", Detalle)
      .input("NumeroBoleta", NumeroBoleta) // 👈 Asegúrate de incluirlo
      .query(`
        INSERT INTO BoletaVacaciones (
          CedulaID, Nombre, FechaIngreso,
          FechaSalida, FechaEntrada, DiasTomados,
          Detalle, NumeroBoleta
        )
        VALUES (
          @CedulaID, @Nombre, @FechaIngreso,
          @FechaSalida, @FechaEntrada, @DiasTomados,
          @Detalle, @NumeroBoleta
        )
      `);

    res.status(200).json({ message: "Boleta guardada exitosamente" });
  } catch (error) {
    console.error("Error insertando boleta:", error);
    res.status(500).json({ error: "Error al guardar boleta" });
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
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("CedulaID", sql.NVarChar, cedula)
      .query("SELECT FechaSalida, FechaEntrada, DiasTomados, Detalle FROM BoletaVacaciones WHERE CedulaID = @CedulaID ORDER BY FechaSalida DESC");

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener detalles de vacaciones:", error);
    res.status(500).json({ error: "Error al obtener detalles" });
  }
});

app.post("/api/pago-planilla", async (req, res) => {
  const {
    CedulaID, Nombre, FechaIngreso, Contrato, Cuenta, SalarioBase, TipoPago,
    HorasTrabajadas, HorasExtra, Comisiones, Viaticos, CCSS, Prestamos, Vales, Adelantos, Ahorro, TotalPago
  } = req.body;

  try {
    await sql.query`
        INSERT INTO PagoPlanilla (
          CedulaID, Nombre, FechaIngreso, Contrato, Cuenta, SalarioBase, TipoPago,
          HorasTrabajadas, HorasExtra, Comisiones, Viaticos, CCSS, Prestamos, Vales, Adelantos, Ahorro, TotalPago
        )
        VALUES (
          ${CedulaID}, ${Nombre}, ${FechaIngreso}, ${Contrato}, ${Cuenta}, ${SalarioBase}, ${TipoPago},
          ${HorasTrabajadas}, ${HorasExtra}, ${Comisiones}, ${Viaticos}, ${CCSS}, ${Prestamos}, ${Vales}, ${Adelantos}, ${Ahorro}, ${TotalPago}
        )
      `;
    res.json({ message: "Pago registrado exitosamente." });
  } catch (err) {
    console.error("Error al guardar pago:", err);
    res.status(500).json({ message: "Error al guardar el pago." });
  }
});

app.get("/api/pago-planilla/:cedula", async (req, res) => {
  const cedula = req.params.cedula;
  try {
    const result = await sql.query`
      SELECT Nombre, CedulaID, TotalPago, FechaRegistro, HorasTrabajadas, HorasExtra, 
             Comisiones, Viaticos, CCSS, Prestamos, Vales, Adelantos, Ahorro
      FROM PagoPlanilla
      WHERE CedulaID = ${cedula}
      ORDER BY FechaRegistro DESC
    `;
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
      .query(`
        INSERT INTO Financiamientos (
          CedulaID, Nombre, Producto, Monto, FechaCreacion,
          Plazo, InteresPorcentaje, Descripcion
        )
        VALUES (
          @CedulaID, @Nombre, @Producto, @Monto, @FechaCreacion,
          @Plazo, @InteresPorcentaje, @Descripcion
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

  try {
    const result = await sql.query`
      SELECT ID, Producto, Monto, FechaCreacion, Plazo, InteresPorcentaje, Descripcion, Estado
      FROM Financiamientos
      WHERE CedulaID = ${cedula}
      ORDER BY FechaCreacion DESC
    `;
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
      .query(`SELECT * FROM Vales WHERE CedulaID = @CedulaID ORDER BY FechaRegistro DESC`);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener vales:", error);
    res.status(500).json({ message: 'Error al obtener vales' });
  }
});