import Vector2D from './Vector2D.js';

class AstroBody {
    constructor(mass, x, y, vx = 0, vy = 0, color = '#FFFFFF', radius = 5) {
        this.mass = mass;
        this.color = color;
        this.radius = radius;

        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(vx, vy);
        this.acceleration = new Vector2D(0, 0);

        // --- NUEVO: Configuración de Estelas ---
        this.trail = []; // Aquí guardaremos el historial
        this.maxTrailLength = 1000; // Cuántos puntos guardar (más = estela más larga)
    }

    applyForce(forceVector) {
        const f = forceVector.scale(1 / this.mass);
        this.acceleration = this.acceleration.add(f);
    }

    update(deltaTime) {
        // --- NUEVO: Guardar la posición ANTES de moverse ---
        // Clonamos el vector actual (x, y)
        this.trail.push(new Vector2D(this.position.x, this.position.y));

        // Limitamos el tamaño para que la memoria no explote
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift(); // Elimina el punto más viejo (el primero)
        }

        // Movimiento normal
        this.velocity = this.velocity.add(this.acceleration.scale(deltaTime));
        this.position = this.position.add(this.velocity.scale(deltaTime));
        this.acceleration = new Vector2D(0, 0);
    }
}

export default AstroBody;