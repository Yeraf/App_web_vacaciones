import React from 'react';
import { Routes, Route, BrowserRouter, NavLink } from "react-router-dom";
import { Dashboard } from '../Dashboard';
import { Footer } from '../layout/Footer';
import { Contacto } from '../Contacto';
import { HeaderNav } from '../layout/HeaderNav';
import { Login } from '../Login';
import { PanelPrincipal } from '../PanelPrincipal';

export const MisRutas = () => {
    return (

        <BrowserRouter>

            <div className="app-container">
                {/* { HEADER Y NAVEGACIÓN } */}
                <HeaderNav />

                {/* { CONTENIDO CENTRAL } */}
                <section className='content_section'>
                    <Routes>
                        {/* <Route path='/' element={<Login />} /> */}
                        <Route path='/' element={<Dashboard />} />
                        <Route path='/panel' element={<PanelPrincipal />} />
                        <Route path='/dashboard' element={<Dashboard />} />
                        <Route path='/contacto' element={<Contacto />} />
                        <Route path='/footer' element={<Footer />} />
                    </Routes>
                </section>

            </div>

        </BrowserRouter>

    )
}