import Simulator from './ui/Simulator.js';

// Esperamos a que la página cargue completamente
window.addEventListener('load', () => {
    // Instanciamos el simulador pasándole el ID del canvas
    const sim = new Simulator('simCanvas');
    
    // Arrancamos
    sim.initialize();
});