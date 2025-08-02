import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const ModalContraseña = ({ show, onSuccess, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const verificar = async () => {
    const res = await fetch('http://localhost:3001/api/verificar-acceso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modulo: 'localidad', contraseña: password })
    });

    const data = await res.json();
    if (res.ok && data.acceso) {
      onSuccess(); // permite el acceso
    } else {
      setError(data.message || 'Error desconocido');
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton><Modal.Title>Ingrese la contraseña</Modal.Title></Modal.Header>
      <Modal.Body>
        <input type="password" className="form-control" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="text-danger mt-2">{error}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={verificar}>Entrar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalContraseña;