# 2D Orbital Simulator

Un simulador de física gravitacional de N-cuerpos implementado en JavaScript vanilla utilizando la API de Canvas de HTML5. El proyecto está estructurado modularmente para separar la lógica de cálculo físico, el renderizado gráfico y la gestión de la interfaz de usuario.

## Arquitectura del Proyecto

El sistema sigue un patrón de diseño modular. La lógica se divide en tres dominios principales:

### 1. Física (`src/physics/`)
Este módulo maneja los datos puros y las leyes deterministas de la simulación. No tiene dependencia del DOM ni del renderizado.

* **`Vector2D`**: Clase utilitaria para operaciones de álgebra vectorial (suma, resta, producto escalar, normalización).
* **`AstroBody`**: Estructura de datos que representa un cuerpo celeste. Almacena vectores de estado (posición, velocidad, aceleración), masa y un historial de posiciones (`trail`) para visualización de trayectoria.
* **`PhysicsEngine`**: Contiene la lógica de interacción gravitacional. Itera sobre los cuerpos para calcular fuerzas acumuladas y resolver la integración numérica.

### 2. Renderizado (`src/rendering/`)
Responsable de la representación visual del estado físico en el elemento `<canvas>`.

* **`Camera`**: Gestiona la transformación de coordenadas entre el "Espacio Universal" (físico) y el "Espacio de Pantalla" (píxeles). Controla el desplazamiento (`x`, `y`) y el factor de escala (`zoom`).
* **`Renderer`**: Orquesta el ciclo de dibujo. Limpia el lienzo, dibuja el fondo (gradiente), las estelas, los cuerpos planetarios y los elementos de interfaz superpuestos (UI overlay) como el minimapa o vectores de creación.

### 3. Interfaz y Control (`src/ui/`)
Maneja la entrada del usuario y el bucle principal de la aplicación.

* **`Simulator`**: Clase principal (Singleton implícito). Inicializa los subsistemas, mantiene la lista de cuerpos y ejecuta el bucle de animación (`requestAnimationFrame`). Actúa como puente entre la física y el renderizado.
* **`InputHandler`**: Escucha eventos del DOM (mouse/teclado) y los traduce en acciones de cámara o comandos de simulación.
* **`UIManager`**: Sincroniza el estado de los objetos seleccionados con el panel HTML lateral, permitiendo la edición de propiedades en tiempo real.

---

## Implementación Matemática

### 1. Ley de Gravitación Universal
La fuerza de atracción entre dos cuerpos se calcula utilizando la Ley de Newton. Para evitar cálculos redundantes, la fuerza se calcula una vez por par de cuerpos y se aplica con signo opuesto a cada uno (Tercera Ley de Newton).

La magnitud de la fuerza escalar $F$ es:

$$F = G \frac{m_1 m_2}{r^2}$$

Donde:
* $G$: Constante gravitacional (ajustada para la escala de la simulación).
* $m_1, m_2$: Masas de los cuerpos.
* $r$: Distancia euclidiana entre los cuerpos.

#### Implementación Vectorial
Para aplicar esta fuerza en el espacio 2D, se descompone en vectores:

1.  **Vector Distancia ($\vec{r}$)**: $\vec{r} = \vec{pos}_2 - \vec{pos}_1$
2.  **Distancia Escalar ($d$)**: $d = |\vec{r}| = \sqrt{r_x^2 + r_y^2}$
3.  **Dirección Normalizada ($\hat{u}$)**: $\hat{u} = \frac{\vec{r}}{d}$
4.  **Vector Fuerza ($\vec{F}$)**: $\vec{F} = \hat{u} \cdot (G \frac{m_1 m_2}{d^2})$

### 2. Integración Numérica (Método de Euler Semi-Implícito)
El simulador utiliza el método de Euler Semi-Implícito (o Simpléctico) para actualizar la posición de los cuerpos. Este método ofrece mayor estabilidad energética que el Euler explícito estándar para sistemas orbitales.

Para cada paso de tiempo ($\Delta t$):

1.  **Cálculo de Aceleración**:
    $$\vec{a} = \frac{\vec{F}_{total}}{m}$$
2.  **Actualización de Velocidad**:
    $$\vec{v}_{t+1} = \vec{v}_t + \vec{a} \cdot \Delta t$$
3.  **Actualización de Posición** (usando la nueva velocidad):
    $$\vec{pos}_{t+1} = \vec{pos}_t + \vec{v}_{t+1} \cdot \Delta t$$

### 3. Transformación de Coordenadas (Cámara)
Para renderizar la simulación, las coordenadas del mundo físico ($x_w, y_w$) deben transformarse a coordenadas de pantalla ($x_s, y_s$).

$$x_s = (x_w - camera_x) \cdot zoom + \frac{viewport_w}{2}$$
$$y_s = (y_w - camera_y) \cdot zoom + \frac{viewport_h}{2}$$

El proceso inverso (`screenToWorld`) se utiliza para detectar clics del ratón sobre objetos en el espacio físico.

---

## Flujo de Interacción y Estados

La clase `Simulator` gestiona una máquina de estados finita simple para controlar la creación de planetas:

1.  **IDLE**: Estado por defecto. Los clics del ratón se interpretan como selección de objetos mediante *raycasting* (cálculo de distancia entre el puntero y los cuerpos).
2.  **PLACING**: Iniciado al solicitar un nuevo planeta. El cuerpo sigue la posición del cursor sin física aplicada.
3.  **AIMING**: Iniciado tras el primer clic en `PLACING`. La posición se fija y el movimiento del ratón define el vector de velocidad inicial ($\vec{v}$) basado en la diferencia entre el centro del cuerpo y el cursor.

## Requisitos de Ejecución

El proyecto utiliza **Módulos ES6** (`import` / `export`). Debido a las políticas de seguridad de CORS (Cross-Origin Resource Sharing) en los navegadores modernos, la aplicación no puede ejecutarse abriendo directamente el archivo `index.html` desde el sistema de archivos (`file://`).

Es necesario servir los archivos a través de un servidor HTTP local.

### Opciones para ejecutar:

**Con Python 3:**
```bash
python -m http.server