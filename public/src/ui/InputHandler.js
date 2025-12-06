import Vector2D from '../physics/Vector2D.js';

class InputHandler {
    constructor(canvas, camera, simulator) {
        this.canvas = canvas;
        this.camera = camera;
        this.simulator = simulator;

        this.isDragging = false;
        this.dragStartTime = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.init();
    }

    init() {
        // 1. ZOOM (Rueda del ratón)
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault(); // Evita que la página haga scroll

            // Si deltaY es negativo, subimos la rueda (Zoom In)
            // Ajusta la sensibilidad (0.001) si es muy rápido o muy lento
            const zoomSensitivity = 0.001;
            const zoomFactor = 1 - (e.deltaY * zoomSensitivity);

            this.camera.changeZoom(zoomFactor);
        }, { passive: false }); // 'passive: false' es importante para poder usar preventDefault

        // 2. INICIO DE ARRASTRE
        this.canvas.addEventListener('mousedown', (e) => {
            // SI ESTAMOS CREANDO UN PLANETA, NO ARRASTRAMOS LA CÁMARA
            if (this.simulator.creationState !== 'IDLE') {
                return;
            }

            this.isDragging = true;
            this.dragStartTime = Date.now();
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
        });

        // 3. MOVER CÁMARA
        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;

                this.camera.pan(deltaX, deltaY);

                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        window.addEventListener('mousemove', (e) => {
            // CALCULAR POSICIÓN EN EL MUNDO SIEMPRE (Útil para crear planetas)
            const rect = this.canvas.getBoundingClientRect();
            const worldPos = this.camera.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

            // 1. ENVIAR MOVIMIENTO AL SIMULADOR (Para la flecha o el fantasma)
            this.simulator.handleMouseMove(worldPos.x, worldPos.y);

            // 2. LOGICA DE ARRASTRE DE CÁMARA
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;
                this.camera.pan(deltaX, deltaY);
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        window.addEventListener('mouseup', (e) => {
            const dragDuration = Date.now() - this.dragStartTime;

            // CASO 1: ESTAMOS CREANDO UN PLANETA
            if (this.simulator.creationState !== 'IDLE') {
                const rect = this.canvas.getBoundingClientRect();
                const worldPos = this.camera.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

                // Avisamos al simulador que hicimos click (Fijar posición o Lanzar)
                this.simulator.handleMouseClick(worldPos.x, worldPos.y);
                return;
            }

            // CASO 2: SELECCIÓN NORMAL
            if (this.isDragging && dragDuration < 200) {
                this.handleClick(e.clientX, e.clientY);
            }

            this.isDragging = false;
            this.canvas.style.cursor = 'default';
        });

        // 4. FIN DE ARRASTRE O CLIC
        window.addEventListener('mouseup', (e) => {
            // Calculamos cuánto tiempo estuvo presionado el botón
            const dragDuration = Date.now() - this.dragStartTime;

            // Si el click fue rápido (menos de 200ms), es una SELECCIÓN, no un movimiento
            if (this.isDragging && dragDuration < 200) {
                this.handleClick(e.clientX, e.clientY);
            }

            this.isDragging = false;
            this.canvas.style.cursor = 'default';
        });
    }

    handleClick(screenX, screenY) {
        // ... igual que antes ...
        const rect = this.canvas.getBoundingClientRect();
        const worldPos = this.camera.screenToWorld(screenX - rect.left, screenY - rect.top);
        this.simulator.handleSelection(worldPos.x, worldPos.y);
    }

    handleClick(screenX, screenY) {
        // 1. Obtener coordenadas reales considerando la posición del canvas en la página
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = screenX - rect.left;
        const canvasY = screenY - rect.top;

        // 2. Convertir píxeles a coordenadas del mundo físico
        const worldPos = this.camera.screenToWorld(canvasX, canvasY);

        // 3. Pedir al simulador que busque si tocamos algo
        this.simulator.handleSelection(worldPos.x, worldPos.y);
    }
}

export default InputHandler;