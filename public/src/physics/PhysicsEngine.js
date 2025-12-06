import Vector2D from './Vector2D.js';

class PhysicsEngine {
    constructor() {
        // La Constante Gravitacional.
        // Puedes ajustar esto para hacer la gravedad más fuerte o débil.
        this.G = 100; 
    }

    // Método principal que llama el simulador en cada frame
    update(bodies, deltaTime) {
        // 1. Calcular fuerzas de gravedad entre TODOS los pares de cuerpos
        this.calculateAllForces(bodies);

        // 2. Mover cada cuerpo según su nueva aceleración
        bodies.forEach(body => {
            body.update(deltaTime);
        });
    }

    calculateAllForces(bodies) {
        // Necesitamos comparar cada cuerpo con todos los demás.
        // Usamos un bucle anidado.
        
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                // j = i + 1 evita:
                // a) Comparar un cuerpo consigo mismo.
                // b) Calcular doble (A-B y luego B-A). Calculamos una vez y aplicamos a ambos.
                
                const bodyA = bodies[i];
                const bodyB = bodies[j];

                this.applyGravity(bodyA, bodyB);
            }
        }
    }

    applyGravity(bodyA, bodyB) {
        // Paso 1: Obtener el vector de dirección y distancia
        // Vector que va de A hacia B
        const distanceVector = bodyB.position.sub(bodyA.position);
        
        // Distancia (magnitud r)
        const distance = distanceVector.mag();

        // GUARDRAIL: Evitar división por cero si chocan o están en el mismo punto
        if (distance === 0) return; 

        // Paso 2: Calcular la magnitud de la fuerza (F = G * m1 * m2 / r^2)
        // A veces se añade un "softening" (suavizado) al divisor para estabilidad numérica
        const forceMagnitude = (this.G * bodyA.mass * bodyB.mass) / (distance * distance);

        // Paso 3: Calcular el Vector de Fuerza
        // Normalizamos el vector de distancia para tener solo la dirección
        const direction = distanceVector.normalize();
        
        // Creamos el vector fuerza multiplicando dirección por magnitud
        const forceVector = direction.scale(forceMagnitude);

        // Paso 4: Aplicar la fuerza (3ª Ley de Newton: Acción y Reacción)
        // A es atraído hacia B (Fuerza positiva en la dirección calculada)
        bodyA.applyForce(forceVector);
        
        // B es atraído hacia A (Fuerza opuesta/negativa)
        // .scale(-1) invierte el vector
        bodyB.applyForce(forceVector.scale(-1));
    }
}

export default PhysicsEngine;