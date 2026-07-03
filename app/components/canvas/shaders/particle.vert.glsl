uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;
varying float vAlpha;

void main() {
    // Начальная позиция частицы
    vec3 pos = position;

    // Легкий дрейф по синусоиде
    pos.x += sin(uTime * 0.1 + aRandomness.x * 6.28) * 0.2;
    pos.y += cos(uTime * 0.15 + aRandomness.y * 6.28) * 0.2;
    pos.z += sin(uTime * 0.08 + aRandomness.z * 6.28) * 0.2;

    // Проекция в пространство камеры
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Вычисление размера точки с учетом дистанции до камеры
    gl_PointSize = uSize * aScale * uPixelRatio * (300.0 / -mvPosition.z);

    // Цвет частицы
    vColor = vec3(0.23, 0.51, 0.96); // #3B82F6 в RGB (0.23, 0.51, 0.96)
    
    // Плавное угасание по глубине
    vAlpha = clamp(1.0 - (-mvPosition.z / 35.0), 0.0, 1.0);
}
