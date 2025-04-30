import React from 'react';
import { Routes, Route, BrowserRouter, NavLink } from "react-router-dom";
import { Dashboard } from '../Dashboard';
import { Footer } from '../layout/Footer';
import { Contacto } from '../Contacto';
import { HeaderNav } from '../layout/HeaderNav';
import { PanelPrincipal } from '../PanelPrincipal';
import { Tareas } from '../Tareas';
import { Estadisticas } from '../Estadisticas';
import { Calendario } from '../Calendario';
import { Registro } from '../Registro';
import { Horarios } from '../Horarios';

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
                        <Route path='/' element={<Estadisticas />} />
                        <Route path='/estadisticas' element={<Estadisticas />} />
                        <Route path='/dashboard' element={<Dashboard />} />
                        <Route path='/tareas' element={<Tareas />} />
                        <Route path='/calendario' element={<Calendario />} />
                        <Route path='/horario' element={<Horarios />} />
                        <Route path='/registro' element={<Registro />} />
                        <Route path='/contacto' element={<Contacto />} />
                        <Route path='/panel' element={<PanelPrincipal />} />
                        <Route path='/footer' element={<Footer />} />
                    </Routes>
                </section>

            </div>

        </BrowserRouter>

    )
}