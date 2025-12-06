class Renderer {
    constructor(canvasElement, camera) { // <--- AHORA RECIBE LA CÁMARA
        this.canvas = canvasElement;
        this.camera = camera;        // <--- Guardamos la referencia
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.selectedBody = null; // Guardamos quién está seleccionado
    }

    setSelection(body) {
        this.selectedBody = body;
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Actualizamos el tamaño del viewport de la cámara
        if (this.camera) {
            this.camera.viewportWidth = this.width;
            this.camera.viewportHeight = this.height;
        }
    }

    clear() {
        // 1. Crear el objeto Gradiente
        // Usaremos un Gradiente Radial para dar la impresión de un centro de galaxia
        // El centro del gradiente debe ser el centro de la pantalla (o el centro de la cámara)

        // Creamos el gradiente radial:
        // createRadialGradient(x0, y0, r0, x1, y1, r1)
        // x0, y0, r0: coordenadas y radio del círculo interior (inicio)
        // x1, y1, r1: coordenadas y radio del círculo exterior (fin)
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,                      // Centro de pantalla, radio 0
            this.width / 2, this.height / 2, Math.max(this.width, this.height) // Centro de pantalla, radio grande
        );

        // 2. Definir los colores del Gradiente (Tonalidades Cósmicas)
        gradient.addColorStop(0, '#02001A');   // 0% - Azul muy oscuro (casi negro) en el centro
        gradient.addColorStop(0.3, '#100C30'); // 30% - Azul púrpura oscuro
        gradient.addColorStop(0.7, '#2A004A'); // 70% - Púrpura profundo
        gradient.addColorStop(1, '#000000');   // 100% - Negro total en los bordes

        // 3. Aplicar el Gradiente
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    render(bodies) {
        // 1. PRIMERO LIMPIAMOS
        this.clear();
        // 1. Dibujar cuerpos existentes
        for (const body of bodies) {
            if (body.trail.length > 1) this.drawTrail(body);
            this.drawBody(body);
            if (body === this.selectedBody) this.drawSelectionRing(body);
        }
        // 2. DIBUJAR SIMULACIÓN (Estelas y Cuerpos)
        for (const body of bodies) {
            if (body.trail.length > 1) this.drawTrail(body);
            this.drawBody(body);

            // 3. DIBUJAR ANILLO DE SELECCIÓN AQUÍ (Después de limpiar)
            if (body === this.selectedBody) {
                this.drawSelectionRing(body);
            }
        }

        // 4. DIBUJAR INTERFAZ (MINI-MAPA)
        this.drawMiniMap(bodies);
    }
    drawCreationOverlay(state, pos, vel, scale) {
        if (state === 'IDLE') return;

        const screenPos = this.camera.worldToScreen(pos.x, pos.y);

        // Dibujar el planeta "Fantasma"
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, 15 * this.camera.zoom, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // Verde semitransparente
        this.ctx.fill();
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.stroke();
        this.ctx.closePath();

        // Si estamos apuntando, dibujar la flecha (Vector)
        if (state === 'AIMING') {
            const endX = pos.x + vel.x; // Donde termina la flecha en mundo
            const endY = pos.y + vel.y;

            const screenEnd = this.camera.worldToScreen(endX, endY);

            this.drawArrow(screenPos.x, screenPos.y, screenEnd.x, screenEnd.y);

            // Texto de velocidad
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px monospace';
            const velMag = Math.sqrt(vel.x * vel.x + vel.y * vel.y).toFixed(1);
            this.ctx.fillText(`Vel: ${velMag}`, screenEnd.x + 10, screenEnd.y);
        }
    }
    drawArrow(fromX, fromY, toX, toY) {
        const headlen = 10; // Tamaño de la punta
        const angle = Math.atan2(toY - fromY, toX - fromX);

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#FFFF00'; // Amarillo
        this.ctx.lineWidth = 2;

        // Línea principal
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);

        // Punta de la flecha
        this.ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));

        this.ctx.stroke();
    }
    drawSelectionRing(body) {
        const screenPos = this.camera.worldToScreen(body.position.x, body.position.y);
        const radius = (body.radius * this.camera.zoom) + 5; // Un poco más grande que el planeta

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#00FF00'; // Verde brillante
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]); // Línea punteada
        this.ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]); // Resetear línea sólida
        this.ctx.closePath();
    }

    drawBody(body) {
        // Usamos la cámara para obtener coordenadas de pantalla
        const screenPos = this.camera.worldToScreen(body.position.x, body.position.y);

        // Si el planeta está fuera de la pantalla por mucho, no lo dibujamos (Optimización)
        if (screenPos.x < -50 || screenPos.x > this.width + 50 ||
            screenPos.y < -50 || screenPos.y > this.height + 50) return;

        // El radio visual escala con el zoom
        const visualRadius = Math.max(1, body.radius * this.camera.zoom);

        // --- APLICAR EL EFECTO DE RESPLANDOR (GLOW) ---

        // 1. Definir el color y la difusión de la sombra
        this.ctx.shadowColor = body.color; // El brillo es del mismo color del planeta
        this.ctx.shadowBlur = visualRadius * 1.5; // El radio de la sombra (1.5x el radio del cuerpo)
        this.ctx.shadowOffsetX = 0; // Desplazamiento X (0 para que el brillo sea uniforme)
        this.ctx.shadowOffsetY = 0; // Desplazamiento Y (0 para que el brillo sea uniforme)

        // ---------------------------------------------

        this.ctx.beginPath();

        this.ctx.arc(screenPos.x, screenPos.y, visualRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = body.color;
        this.ctx.fill();

        this.ctx.closePath();

        // --- RESTABLECER LA SOMBRA ---
        // ¡Importante! Si no restableces la sombra, afectará a la estela y al minimapa.
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }

    drawTrail(body) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = body.color;
        this.ctx.lineWidth = 2 * this.camera.zoom; // Línea escala con zoom
        this.ctx.globalAlpha = 0.4;

        // Primer punto
        const start = this.camera.worldToScreen(body.trail[0].x, body.trail[0].y);
        this.ctx.moveTo(start.x, start.y);

        // Resto de puntos
        for (let i = 1; i < body.trail.length; i++) {
            const pos = this.camera.worldToScreen(body.trail[i].x, body.trail[i].y);
            this.ctx.lineTo(pos.x, pos.y);
        }

        // Conexión final
        const current = this.camera.worldToScreen(body.position.x, body.position.y);
        this.ctx.lineTo(current.x, current.y);

        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
    }

    // --- EL MINI-MAPA ---
    drawMiniMap(bodies) {
        const mapSize = 150; // Tamaño del cuadro (px)
        const margin = 20;   // Margen desde la esquina

        // Posición en pantalla (Esquina Superior Derecha)
        const mapX = this.width - mapSize - margin;
        const mapY = margin;

        // Guardamos el contexto para no afectar al resto del dibujo
        this.ctx.save();

        // 1. Fondo del Mapa
        this.ctx.fillStyle = 'rgba(20, 20, 40, 0.8)'; // Azul oscuro semitransparente
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(mapX, mapY, mapSize, mapSize);
        this.ctx.strokeRect(mapX, mapY, mapSize, mapSize);

        // Recortamos para que nada se salga del cuadrito
        this.ctx.beginPath();
        this.ctx.rect(mapX, mapY, mapSize, mapSize);
        this.ctx.clip();

        // 2. Definir escala del Mini-mapa
        // Imaginemos que el mini-mapa cubre 5000 unidades de espacio espacial
        const miniMapScale = mapSize / 5000;
        const miniMapCenter = mapSize / 2;

        // 3. Dibujar los cuerpos en el Mini-mapa (relativo al centro del mapa)
        for (const body of bodies) {
            const mx = mapX + miniMapCenter + (body.position.x * miniMapScale);
            const my = mapY + miniMapCenter + (body.position.y * miniMapScale);

            this.ctx.fillStyle = body.color;
            this.ctx.beginPath();
            this.ctx.arc(mx, my, 2, 0, Math.PI * 2); // Puntos pequeños
            this.ctx.fill();
        }

        // 4. Dibujar el cuadro de "Cámara Actual" (Viewport)
        // Calculamos dónde está la cámara respecto al centro (0,0)
        // y qué tan grande es el área que ve.

        const viewX = mapX + miniMapCenter + (this.camera.x * miniMapScale);
        const viewY = mapY + miniMapCenter + (this.camera.y * miniMapScale);

        // El tamaño del rectángulo depende del zoom inverso
        // (Si hay mucho zoom, el cuadro es pequeño)
        const viewW = (this.width / this.camera.zoom) * miniMapScale;
        const viewH = (this.height / this.camera.zoom) * miniMapScale;

        this.ctx.strokeStyle = '#00FF00'; // Verde tipo radar
        this.ctx.lineWidth = 1;
        // Dibujamos el rectángulo centrado en viewX, viewY
        this.ctx.strokeRect(viewX - viewW / 2, viewY - viewH / 2, viewW, viewH);

        this.ctx.restore(); // Restaurar estado original
    }
}

export default Renderer;