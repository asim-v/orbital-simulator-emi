class Camera {
    constructor(width, height) {
        this.x = 0; // Posición X del centro de la cámara en el mundo
        this.y = 0; // Posición Y del centro de la cámara en el mundo
        this.zoom = 1.0; // Factor de zoom (1 = escala real)
        
        this.viewportWidth = width;
        this.viewportHeight = height;
    }

    // Convierte una coordenada del MUNDO FÍSICO a PÍXELES DE PANTALLA
    worldToScreen(worldX, worldY) {
        // 1. Restamos la posición de la cámara (traslación)
        // 2. Multiplicamos por el zoom (escala)
        // 3. Sumamos la mitad de la pantalla (para que (0,0) esté en el centro)
        const screenX = (worldX - this.x) * this.zoom + (this.viewportWidth / 2);
        const screenY = (worldY - this.y) * this.zoom + (this.viewportHeight / 2);
        return { x: screenX, y: screenY };
    }

    // Convierte PÍXELES DE PANTALLA a coordenada del MUNDO FÍSICO
    // (Útil si quisiéramos hacer click en un planeta)
    screenToWorld(screenX, screenY) {
        const worldX = (screenX - (this.viewportWidth / 2)) / this.zoom + this.x;
        const worldY = (screenY - (this.viewportHeight / 2)) / this.zoom + this.y;
        return { x: worldX, y: worldY };
    }

    // Métodos para controlar la cámara
    pan(dx, dy) {
        // Al movernos, debemos ajustar según el zoom.
        // Si estamos muy cerca (zoom alto), movemos menos terreno.
        this.x -= dx / this.zoom;
        this.y -= dy / this.zoom;
    }

    changeZoom(factor) {
        // Multiplicamos el zoom actual por un factor (ej: 1.1 para acercar)
        const newZoom = this.zoom * factor;
        
        // Ponemos límites para no romper la simulación
        if (newZoom > 0.1 && newZoom < 50) {
            this.zoom = newZoom;
        }
    }
}

export default Camera;