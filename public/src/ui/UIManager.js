import AstroBody from '../physics/AstroBody.js';
import Vector2D from '../physics/Vector2D.js';

class UIManager {
    constructor(simulator) {
        this.sim = simulator;
        this.selectedBody = null;

        // Referencias al DOM
        this.panelSelection = document.getElementById('selection-controls');
        this.panelNoSelection = document.getElementById('no-selection');

        this.inpMass = document.getElementById('inp-mass');
        this.inpColor = document.getElementById('inp-color');
        this.inpRadius = document.getElementById('inp-radius');

        this.initEvents();
    }

    initEvents() {
        // --- EVENTOS DEL FORMULARIO ---
        // Cuando cambias un input, actualizamos el planeta seleccionado

        this.inpMass.addEventListener('input', (e) => {
            if (this.selectedBody) this.selectedBody.mass = parseFloat(e.target.value);
        });

        this.inpColor.addEventListener('input', (e) => {
            if (this.selectedBody) this.selectedBody.color = e.target.value;
        });

        this.inpRadius.addEventListener('input', (e) => {
            if (this.selectedBody) this.selectedBody.radius = parseFloat(e.target.value);
        });

        // Botón Eliminar
        document.getElementById('btn-delete').addEventListener('click', () => {
            if (this.selectedBody) {
                this.sim.removeBody(this.selectedBody);
                this.deselect();
            }
        });

        // Botón Nuevo Planeta
        document.getElementById('btn-add-planet').addEventListener('click', () => {
            // Lógica antigua: this.addNewPlanet();  <-- BORRAR O COMENTAR

            // Lógica nueva:
            this.sim.startPlanetCreation();

            // Opcional: Cerrar panel de selección si estaba abierto
            this.deselect();
        });

        // Botón Pausa
        document.getElementById('btn-pause').addEventListener('click', () => {
            this.sim.togglePause();
        });
    }

    // Llamado cuando el usuario hace clic en un planeta
    selectBody(body) {
        this.selectedBody = body;

        // Mostrar panel de edición
        this.panelSelection.style.display = 'block';
        this.panelNoSelection.style.display = 'none';

        // Llenar inputs con datos actuales
        this.inpMass.value = body.mass;
        this.inpColor.value = body.color;
        this.inpRadius.value = body.radius;
    }

    deselect() {
        this.selectedBody = null;
        this.panelSelection.style.display = 'none';
        this.panelNoSelection.style.display = 'block';
    }

    addNewPlanet() {
        // Crear planeta en una posición visible (centro de la cámara + offset random)
        const camX = this.sim.camera.x;
        const camY = this.sim.camera.y;

        const x = camX + (Math.random() * 200 - 100);
        const y = camY + (Math.random() * 200 - 100);

        // Velocidad aleatoria pequeña
        const vx = (Math.random() - 0.5) * 2;
        const vy = (Math.random() - 0.5) * 2;

        const newBody = new AstroBody(50, x, y, vx, vy, '#00FF00', 15);
        this.sim.addBody(newBody);

        // Seleccionarlo automáticamente
        this.selectBody(newBody);
    }
}

export default UIManager;