import React, { useState } from 'react';

export const Localidades = () => {
  const [form, setForm] = useState({
    Empresa: '', Alias: '', TipoCedula: '', NumeroCedula: '', RazonSocial: '', Correo: '',
    Dirreccion: '', Telefono: '', Provincia: '', Canton: '', Distrito: '', Regimen: '',
    PieDocumento: '', PieProforma: '', LimiteFact: '', MontoLicencia: '',
    Cuenta1: '', Cuenta2: '', Banco2: '', Sinpe: '', Logo: ''
  });

  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'Logo' && files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm({ ...form, Logo: reader.result });
      };
      reader.readAsDataURL(files[0]);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/api/localidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setMensaje('✅ Localidad guardada correctamente');
        setForm({
          Empresa: '', Alias: '', TipoCedula: '', NumeroCedula: '', RazonSocial: '', Correo: '',
          Dirreccion: '', Telefono: '', Provincia: '', Canton: '', Distrito: '', Regimen: '',
          PieDocumento: '', PieProforma: '', LimiteFact: '', MontoLicencia: '',
          Cuenta1: '', Cuenta2: '', Banco2: '', Sinpe: '', Logo: ''
        });
      } else {
        const data = await response.json();
        setMensaje('❌ Error: ' + (data.error || 'Error al guardar'));
      }
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al conectar con el servidor');
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Registrar Localidad</h3>
        {mensaje && <div className="alert alert-info mb-0 py-1 px-3">{mensaje}</div>}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {[
            ['Empresa', 'Empresa'], ['Alias', 'Alias'], ['TipoCedula', 'Tipo de Cédula'],
            ['NumeroCedula', 'Número de Cédula'], ['RazonSocial', 'Razón Social'], ['Correo', 'Correo'],
            ['Dirreccion', 'Dirección'], ['Telefono', 'Teléfono'], ['Provincia', 'Provincia'],
            ['Canton', 'Cantón'], ['Distrito', 'Distrito'], ['Regimen', 'Régimen'],
            ['LimiteFact', 'Límite de Facturación'], ['MontoLicencia', 'Monto de Licencia'],
            ['Cuenta1', 'Cuenta 1'], ['Cuenta2', 'Cuenta 2'], ['Banco2', 'Banco 2'], ['Sinpe', 'SINPE']
          ].map(([name, label]) => (
            <div className="col-md-4 mb-3" key={name}>
              <label>{label}:</label>
              {name === 'TipoCedula' ? (
                <select name={name} className="form-select" value={form[name]} onChange={handleChange} required>
                  <option value="">Seleccione</option>
                  <option value="Cédula Física">Cédula Física</option>
                  <option value="Cédula Jurídica">Cédula Jurídica</option>
                </select>
              ) : name === 'Regimen' ? (
                <select name={name} className="form-select" value={form[name]} onChange={handleChange}>
                  <option value="">Seleccione</option>
                  <option value="Simplificado">Simplificado</option>
                  <option value="Tradicional">Tradicional</option>
                </select>
              ) : (
                <input
                  name={name}
                  className="form-control"
                  type={name.includes('Monto') || name.includes('Limite') ? 'number' : 'text'}
                  value={form[name]}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}

          <div className="col-md-4 mb-3">
            <label>Pie Documento:</label>
            <textarea
              name="PieDocumento"
              className="form-control"
              value={form.PieDocumento}
              onChange={handleChange}
              rows="2"
            ></textarea>
          </div>

          <div className="col-md-4 mb-3">
            <label>Pie Proforma:</label>
            <textarea
              name="PieProforma"
              className="form-control"
              value={form.PieProforma}
              onChange={handleChange}
              rows="2"
            ></textarea>
          </div>

          <div className="col-md-4 mb-3">
            <label>Logo (JPG o PNG):</label>
            <input
              type="file"
              name="Logo"
              className="form-control"
              onChange={handleChange}
              accept="image/*"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary mt-3">Guardar</button>
      </form>
    </div>
  );
};