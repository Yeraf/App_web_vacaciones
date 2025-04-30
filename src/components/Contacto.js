import React from 'react';
import { Footer } from './layout/Footer';

export const Contacto = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '90vh', padding: '20px', backgroundColor: '#f7f9fc' }}>
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '15px' }}>
        <div className="text-center mb-4">
          <img src="/images/alpaca.png" className='logo-contacto'></img>
          <h2 className="fw-bold">Yoku Studios</h2>
          <p className="text-muted">Tu aliado en tecnología y creatividad</p>
        </div>

        <div className="mb-3">
          <h5 className="fw-bold">Información de Contacto:</h5>
          <p className="mb-1">📞 <strong>Teléfono:</strong> 8726-1983</p>
          <p className="mb-1">📧 <strong>Correo:</strong> yerafarceguerrero9@gmail.com</p>
          <p className="mb-1">📍 <strong>Ubicación:</strong> San José, Costa Rica</p>
        </div>

        <div className='text-mision'>
          <h5 className="fw-bold">Nuestra Misión:</h5>
          <div className='text-mision-div'>
            <p style={{ fontSize: '0.95rem' }}>
              En Yoku Studios nos enfocamos en transformar ideas en realidades digitales, combinando innovación, creatividad y tecnología para potenciar a nuestros clientes en un mundo en constante evolución.
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};