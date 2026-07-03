varying vec3 vColor;
varying float vAlpha;

void main() {
    // Вычисляем расстояние от центра точки (gl_PointCoord идет от 0 до 1)
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    
    // Мягкий круглый градиент (затухание к краям)
    float strength = 0.05 / distanceToCenter;
    strength = pow(strength, 2.0);
    strength = clamp(strength - 0.1, 0.0, 1.0);
    
    // Дополнительный градиент для сглаживания жестких краев
    float circle = 1.0 - smoothstep(0.15, 0.5, distanceToCenter);

    gl_FragColor = vec4(vColor, strength * circle * vAlpha * 0.75);
}
