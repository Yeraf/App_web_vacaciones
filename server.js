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
  console.log("Boleta recibida:", req.body);
  try {
    const pool = await sql.connect(dbConfig); // ← necesario aquí
    await pool.request()
      .input("CedulaID", CedulaID)
      .input("Nombre", Nombre)
      .input("FechaIngreso", FechaIngreso)
      .input("FechaSalida", FechaSalida)
      .input("FechaEntrada", FechaEntrada)
      .input("DiasTomados", DiasTomados)
      .input("Detalle", Detalle)
      .input("NumeroBoleta", sql.NVarChar, NumeroBoleta)
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
      .query("SELECT ID, FechaSalida, FechaEntrada, DiasTomados, Detalle FROM BoletaVacaciones WHERE CedulaID = @CedulaID ORDER BY FechaSalida DESC");

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
  Plazo, InteresPorcentaje, Descripcion, MontoPendiente
)
VALUES (
  @CedulaID, @Nombre, @Producto, @Monto, @FechaCreacion,
  @Plazo, @InteresPorcentaje, @Descripcion, @Monto
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

app.get("/api/vacaciones/numeroboleta", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("SELECT TOP 1 NumeroBoleta FROM BoletaVacaciones ORDER BY ID DESC");

    let ultimoNumero = result.recordset.length > 0 ? result.recordset[0].NumeroBoleta : null;

    let nuevoNumero;
    if (ultimoNumero && ultimoNumero.startsWith("NB")) {
      const numero = parseInt(ultimoNumero.substring(2)) + 1;
      nuevoNumero = `NB${numero.toString().padStart(3, '0')}`;
    } else {
      nuevoNumero = "NB001"; // Valor inicial si no hay registros
    }

    res.json({ numeroBoleta: nuevoNumero });
  } catch (error) {
    console.error("Error generando número de boleta:", error);
    res.status(500).json({ error: "Error interno generando número de boleta" });
  }
});

app.get('/api/financiamientos', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT * FROM Financiamientos ORDER BY FechaCreacion DESC");
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



// ...resto de tu Server.js arriba intacto...

app.post("/api/pagos-financiamiento", async (req, res) => {
  const { FinanciamientoID, FechaPago, MontoAplicado, Observaciones } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    // 1. Insertar el pago
    await pool.request()
      .input("FinanciamientoID", sql.Int, FinanciamientoID)
      .input("FechaPago", sql.Date, FechaPago)
      .input("MontoAplicado", sql.Decimal(18, 2), MontoAplicado)
      .input("Observaciones", sql.NVarChar(sql.MAX), Observaciones)
      .query(`
        INSERT INTO PagosFinanciamiento (FinanciamientoID, FechaPago, MontoAplicado, Observaciones)
        VALUES (@FinanciamientoID, @FechaPago, @MontoAplicado, @Observaciones)
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

    res.json({ message: "Pago aplicado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al aplicar el pago" });
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
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`
      SELECT TotalPago, FechaRegistro 
      FROM PagoPlanilla 
      WHERE CedulaID = ${cedula}
        AND FechaRegistro >= DATEFROMPARTS(YEAR(GETDATE()) - 1, 12, 1)
        AND FechaRegistro <= DATEFROMPARTS(YEAR(GETDATE()), 11, 30)
    `;

    const pagos = result.recordset;
    const total = pagos.reduce((sum, pago) => sum + pago.TotalPago, 0);
    const aguinaldo = total / 12; // ajustado para quincenal

    res.json({ aguinaldo, pagos });
  } catch (err) {
    console.error("Error al calcular aguinaldo:", err);
    res.status(500).json({ error: "Error al calcular aguinaldo" });
  }
});

app.get('/api/aguinaldo/:cedula', async (req, res) => {
  const { cedula } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('CedulaID', sql.VarChar, cedula)
      .query(`
        SELECT FechaRegistro, TotalPago
        FROM PagoPlanilla
        WHERE CedulaID = @CedulaID AND YEAR(FechaRegistro) = YEAR(GETDATE())
      `);

    const pagos = result.recordset;

    // Filtrar pagos válidos (excluye vales si se almacenan como parte)
    const totalAguinaldo = pagos.reduce((sum, pago) => sum + (pago.TotalPago || 0), 0) / 12;

    res.json({
      aguinaldo: totalAguinaldo.toFixed(2),
      pagos
    });

  } catch (error) {
    console.error("Error al calcular aguinaldo:", error);
    res.status(500).json({ error: "Error al calcular aguinaldo" });
  }
});

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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

// Login

app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("Correo", sql.VarChar, correo)
      .input("Contrasena", sql.VarChar, contrasena)
      .query(`
        SELECT ID, Nombre, Correo
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