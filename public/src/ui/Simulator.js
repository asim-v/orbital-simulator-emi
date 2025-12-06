import PhysicsEngine from '../physics/PhysicsEngine.js';
import Renderer from '../rendering/Renderer.js';
import AstroBody from '../physics/AstroBody.js';
// Importamos Vector2D solo si necesitamos hacer cálculos matemáticos iniciales aquí
import Vector2D from '../physics/Vector2D.js';
import UIManager from './UIManager.js';          // <--- IMPORTAR
import Camera from '../rendering/Camera.js';          // <--- IMPORTAR
import InputHandler from './InputHandler.js';
class Simulator {
    constructor(canvasId) {
        const canvas = document.getElementById(canvasId);

        this.camera = new Camera(canvas.clientWidth, canvas.clientHeight);
        this.physics = new PhysicsEngine();
        this.renderer = new Renderer(canvas, this.camera);

        // Pasamos 'this' (el simulador) al InputHandler
        this.inputHandler = new InputHandler(canvas, this.camera, this); // Asegúrate de pasar 'this' aquí también

        // --- FALTA ESTA LÍNEA CRUCIAL ---
        // Iniciamos el Gestor de Interfaz
        this.uiManager = new UIManager(this);
        // --------------------------------

        this.bodies = [];
        this.isRunning = false;

        window.addEventListener('resize', () => {
            this.renderer.resize();
        });
        // ESTADO DE CREACIÓN
        this.creationState = 'IDLE'; // 'IDLE', 'PLACING', 'AIMING'
        this.newPlanetPos = { x: 0, y: 0 }; // Donde va a nacer el planeta
        this.newPlanetVel = { x: 0, y: 0 }; // Vector visual
    }

    initialize() {
        // --- ESCENARIO INICIAL ---

        // 1. El Sol (Estático en el centro)
        // Masa: 10,000 | Pos: 0,0 | Vel: 0,0 | Color: Amarillo | Radio: 20
        const sun = new AstroBody(10000, 0, 0, 0, 0, '#FFD700', 20);
        this.bodies.push(sun);

        // 2. El Planeta (Tierra)
        // Vamos a calcular la velocidad EXACTA para una órbita circular perfecta.
        // Fórmula de velocidad orbital: v = raíz( (G * M_sol) / distancia )

        const distance = 300; // Distancia en píxeles/unidades desde el centro
        const G = this.physics.G; // 100 según definimos antes
        const M = sun.mass; // 10000

        // v = sqrt(100 * 10000 / 300) = sqrt(3333.33) ≈ 57.7
        const velocityMagnitude = Math.sqrt((G * M) / distance);

        // Creamos el planeta:
        // Posición: (300, 0) -> A la derecha del sol
        // Velocidad: (0, velocityMagnitude) -> Hacia abajo (perpendicular a la posición)
        const earth = new AstroBody(100, distance, 0, 0, velocityMagnitude, '#0099FF', 10);
        this.bodies.push(earth);

        // Comenzamos el bucle
        this.start();
    }



    stop() {
        this.isRunning = false;
    }
    togglePause() {
        this.isRunning = !this.isRunning;
        if (this.isRunning) this.loop();
    }

    addBody(body) {
        this.bodies.push(body);
    }

    removeBody(body) {
        // Filtramos el array para quitar el cuerpo
        this.bodies = this.bodies.filter(b => b !== body);
    }

    // Lógica para encontrar qué planeta se clickeó
    handleSelection(worldX, worldY) {
        // Tolerancia de click (para no tener que ser pixel perfect)
        // Escalamos la tolerancia con el zoom para que sea fácil clickear desde lejos
        const clickTolerance = 20 / this.camera.zoom;

        // Buscar el cuerpo más cercano al click
        let clickedBody = null;

        // Iteramos al revés para seleccionar primero los que se dibujan encima
        for (let i = this.bodies.length - 1; i >= 0; i--) {
            const b = this.bodies[i];
            const dx = b.position.x - worldX;
            const dy = b.position.y - worldY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Si la distancia es menor que su radio (o tolerancia mínima)
            if (dist < Math.max(b.radius, clickTolerance)) {
                clickedBody = b;
                break; // Encontramos uno, dejamos de buscar
            }
        }

        if (clickedBody) {
            this.uiManager.selectBody(clickedBody);
            this.renderer.setSelection(clickedBody); // Avisar al renderer (ver paso 6)
        } else {
            this.uiManager.deselect();
            this.renderer.setSelection(null);
        }
    }
    // Usamos una función flecha (arrow function) para mantener el contexto de 'this'
    start() {
        this.isRunning = true;
        this.loop();
    }

    loop = () => {
        // if (!this.isRunning) return; // <--- COMENTA O QUITA ESTO si quieres dibujar mientras está pausado

        // Solo actualizamos física si está corriendo
        if (this.isRunning) {
            this.physics.update(this.bodies, 0.016);
        }

        // PERO SIEMPRE DIBUJAMOS
        this.renderer.render(this.bodies);

        // Y dibujamos el overlay de creación
        this.renderer.drawCreationOverlay(
            this.creationState,
            this.newPlanetPos,
            this.newPlanetVel
        );

        requestAnimationFrame(this.loop);
    }

    startPlanetCreation() {
        this.creationState = 'PLACING';
        // Pausamos la simulación para que sea más fácil apuntar
        this.wasRunningBeforeCreation = this.isRunning;
        this.isRunning = false;
    }

    cancelCreation() {
        this.creationState = 'IDLE';
        if (this.wasRunningBeforeCreation) this.isRunning = true;
    }

    // Este método lo llamará el InputHandler cuando movamos el mouse
    handleMouseMove(worldX, worldY) {
        if (this.creationState === 'PLACING') {
            this.newPlanetPos = { x: worldX, y: worldY };
        }
        else if (this.creationState === 'AIMING') {
            // Calcular vector desde la posición del planeta hasta el mouse
            // Factor 0.5 para que la velocidad no sea exagerada
            this.newPlanetVel = {
                x: (worldX - this.newPlanetPos.x) * 0.5,
                y: (worldY - this.newPlanetPos.y) * 0.5
            };
        }
    }

    // Este método lo llamará el InputHandler al hacer click
    handleMouseClick(worldX, worldY) {
        if (this.creationState === 'PLACING') {
            // 1. Fijamos la posición
            this.newPlanetPos = { x: worldX, y: worldY };
            this.creationState = 'AIMING';
        }
        else if (this.creationState === 'AIMING') {
            // 2. Creamos el planeta final
            const p = this.newPlanetPos;
            const v = this.newPlanetVel;

            // Crear el cuerpo (Masa 50 por defecto, radio 15)
            const newBody = new AstroBody(50, p.x, p.y, v.x, v.y, '#00FF00', 15);
            this.addBody(newBody);

            // Seleccionarlo en el inspector
            this.uiManager.selectBody(newBody);

            // Volver a la normalidad
            this.creationState = 'IDLE';
            if (this.wasRunningBeforeCreation) this.isRunning = true;
        }
        else {
            // Si estamos en IDLE, el click se usa para seleccionar (lógica antigua)
            this.handleSelection(worldX, worldY);
        }
    }
}

export default Simulator;