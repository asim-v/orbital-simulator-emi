class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // --- Operaciones Básicas ---

    // Suma otro vector a este (ej: Posición + Velocidad)
    add(otherVector) {
        return new Vector2D(this.x + otherVector.x, this.y + otherVector.y);
    }

    // Resta otro vector (ej: Posición Planeta - Posición Sol = Vector Distancia)
    sub(otherVector) {
        return new Vector2D(this.x - otherVector.x, this.y - otherVector.y);
    }

    // Multiplica por un número escalar (ej: Velocidad * Tiempo)
    scale(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    // --- Operaciones de Magnitud (Importantes para la Gravedad) ---

    // Calcula la longitud del vector (Hipotenusa)
    // Se usa para saber la distancia 'r' entre dos planetas
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Devuelve un vector de longitud 1 con la misma dirección
    // Se usa para aplicar la fuerza en la dirección correcta sin cambiar su valor
    normalize() {
        const m = this.mag();
        if (m !== 0) {
            return this.scale(1 / m);
        }
        return new Vector2D(0, 0); // Evitar división por cero
    }
    
    // Método estático de utilidad para calcular distancia entre dos vectores
    static distance(vec1, vec2) {
        return vec1.sub(vec2).mag();
    }
}

// Exportamos la clase para poder usarla en otros archivos
export default Vector2D;