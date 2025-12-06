# Simulador de Órbitas Planetarias 2D

## Descripción General

Este proyecto es una simulación web interactiva de mecánica celeste en dos dimensiones. Utiliza JavaScript nativo (Vanilla JS) y la API Canvas de HTML5 para renderizar cuerpos astronómicos y calcular sus trayectorias en tiempo real basándose en la física newtoniana. El objetivo es proporcionar una herramienta visual para experimentar con la gravedad, las órbitas y la dinámica de sistemas de múltiples cuerpos sin depender de librerías externas.

## Arquitectura del Proyecto

El código está estructurado bajo un patrón modular que separa claramente la lógica física, el renderizado gráfico y el control de la interfaz de usuario.

### Módulo de Física (Physics)

Este módulo es el núcleo matemático de la aplicación. Su responsabilidad es puramente numérica y no tiene dependencia del DOM ni del canvas.

**AstroBody.js:** Define la clase `AstroBody`, que representa un objeto celeste. Almacena propiedades físicas como masa, posición (vector), velocidad (vector) y aceleración (vector). También mantiene un historial de posiciones pasadas para generar estelas visuales.

**Vector2D.js:** Una clase utilitaria para el manejo de álgebra vectorial bidimensional. Proporciona métodos para operaciones fundamentales como suma, resta, multiplicación por escalares, cálculo de magnitud y normalización de vectores.

**PhysicsEngine.js:** Gestiona las interacciones fundamentales. Contiene la lógica para calcular la atracción gravitacional entre todos los pares de cuerpos y ejecuta el paso de integración numérica para actualizar el estado de la simulación.

### Módulo de Renderizado (Rendering)

Este módulo se encarga de la representación visual de los datos calculados por el módulo de física.

**Renderer.js:** Administra el contexto 2D del elemento Canvas. Dibuja el fondo dinámico (gradientes), los cuerpos planetarios con efectos de resplandor (shadows), las estelas de órbita y los elementos de la interfaz superpuesta como el mini-mapa y los vectores de creación.

**Camera.js:** Actúa como intermediario entre el sistema de coordenadas del mundo físico y el sistema de coordenadas de la pantalla (píxeles). Gestiona la transformación de vistas permitiendo operaciones de desplazamiento (pan) y acercamiento (zoom).

### Módulo de Interfaz y Control (UI)

Este módulo gestiona la entrada del usuario y coordina el bucle principal.

**Simulator.js:** Es la clase principal que orquesta la aplicación. Inicializa los otros módulos, mantiene la lista de cuerpos celestes y ejecuta el bucle de animación (Game Loop).

**InputHandler.js:** Escucha los eventos del ratón (clics, movimiento, rueda) y los traduce en acciones concretas como mover la cámara, seleccionar cuerpos o definir vectores de lanzamiento para nuevos planetas.

**UIManager.js:** Vincula los elementos HTML del panel de control con la lógica de la simulación. Permite la edición en tiempo real de las propiedades de los cuerpos seleccionados y la gestión de estados de la aplicación.

## Flujo de Ejecución

La simulación opera mediante un bucle continuo gestionado por `requestAnimationFrame`. En cada iteración del bucle ocurren tres fases secuenciales.

**1. Fase de Entrada:** El sistema procesa las interacciones del usuario capturadas por el `InputHandler`. Esto incluye la actualización de la posición de la cámara si el usuario está arrastrando el mapa o el cambio del factor de escala si se utiliza el zoom. También se detectan clics para la selección de objetos mediante algoritmos de detección de distancia (Raycasting inverso).

**2. Fase de Actualización Física:** El `Simulator` invoca al `PhysicsEngine` para avanzar el tiempo un paso discreto ($\Delta t$). El motor calcula todas las fuerzas gravitacionales entre pares únicos de cuerpos y actualiza sus vectores de velocidad y posición utilizando integración numérica.

**3. Fase de Renderizado:** El `Renderer` limpia el lienzo y redibuja la escena completa basándose en las nuevas posiciones actualizadas. Se aplica la transformación de coordenadas de la `Camera` para asegurar que los objetos se dibujen en la posición correcta relativa al punto de vista del usuario. Finalmente, se dibujan capas de interfaz como el mini-mapa y los indicadores de selección.

## Fundamentos Físicos y Matemáticos

La simulación se rige por leyes físicas clásicas implementadas mediante métodos computacionales.

### Ley de Gravitación Universal

La fuerza de atracción entre dos cuerpos se calcula utilizando la Ley de Gravitación Universal de Newton. Para dos cuerpos con masas $m_1$ y $m_2$ separados por una distancia $r$, la magnitud de la fuerza $F$ está dada por:

$$F = G \frac{m_1 m_2}{r^2}$$

Donde $G$ es la constante de gravitación universal (ajustada para propósitos de la simulación). La dirección de la fuerza se determina mediante el vector unitario que une ambos cuerpos.

### Integración Numérica (Método de Euler Semi-Implícito)

Para simular el movimiento a lo largo del tiempo, no se resuelven las ecuaciones diferenciales analíticamente, sino que se aproximan numéricamente paso a paso. Se utiliza el método de Euler Semi-Implícito debido a su simplicidad y mayor estabilidad energética comparada con el Euler básico para sistemas orbitales.

Primero se calcula la aceleración $a$ basada en la fuerza total $F$ aplicada al cuerpo:

$$a = \frac{F}{m}$$

Luego se actualiza la velocidad $v$ utilizando la aceleración y el paso de tiempo $\Delta t$:

$$v_{t+1} = v_t + a \cdot \Delta t$$

Finalmente se actualiza la posición $x$ utilizando la **nueva** velocidad calculada:

$$x_{t+1} = x_t + v_{t+1} \cdot \Delta t$$

## Instrucciones de Instalación

Debido al uso de Módulos ES6 (import/export), este proyecto no puede ejecutarse abriendo directamente el archivo `index.html` en el navegador debido a las políticas de seguridad CORS (Cross-Origin Resource Sharing) para archivos locales.

Para ejecutar el simulador es necesario servir los archivos a través de un servidor HTTP local. Si tiene Python instalado, puede ejecutar el siguiente comando en la raíz del directorio del proyecto:

`python -m http.server`

Alternativamente, si utiliza entornos de desarrollo como Visual Studio Code, puede utilizar extensiones como "Live Server" para lanzar la aplicación.