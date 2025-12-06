# Simulador Web de Órbitas Planetarias 2D

## 🌌 Descripción del Proyecto

El Simulador Web de Órbitas Planetarias 2D es una aplicación educativa e interactiva diseñada para visualizar las leyes de la **Mecánica Celeste** y la **Ley de Gravitación Universal** de Newton en un entorno bidimensional. El proyecto está construido con **JavaScript Nativo** (Vanilla JS) y utiliza el **Canvas API** para el renderizado, garantizando un alto rendimiento y una interfaz fluida.

---

## 🚀 Funcionalidades Clave

Este simulador ofrece control total sobre la escena y los cuerpos celestes:

### Interacción y Visualización

1.  **Motor Físico N-Cuerpos:** Calcula la interacción gravitacional entre *todos* los cuerpos presentes en la simulación.
2.  **Visualización de Órbitas:** Los cuerpos dejan un **rastro (estela)** que visualiza la trayectoria elíptica o parabólica de la órbita.
3.  **Sistema de Cámara:**
    * **Panoramización:** Permite desplazarse por el espacio arrastrando el ratón.
    * **Zoom:** Control de acercamiento y alejamiento mediante la rueda del ratón.
    * **Mini-mapa (Radar):** Un *overlay* en la esquina superior derecha que muestra la posición actual de la cámara respecto al centro del universo.

### Edición y Creación

4.  **Selección y Edición:** Permite hacer clic en cualquier cuerpo para **seleccionarlo** y editar sus propiedades clave (Masa, Color, Radio) en el panel de control.
5.  **Creación Interactiva de Planetas:**
    * Al activar el modo, el usuario **define la posición** con un primer clic.
    * Luego, **define el vector de velocidad** arrastrando el mouse (mostrado con una flecha amarilla) con un segundo clic para lanzar el planeta.
6.  **Control de Flujo:** Botones para **Pausar/Reanudar** la simulación y **Eliminar** cuerpos.

---

## ⚙️ Arquitectura y Estructura Modular

El proyecto sigue una arquitectura modular clara en JavaScript, separando la lógica central de la visualización y el control, lo que facilita el mantenimiento y la escalabilidad.

### Estructura de Archivos