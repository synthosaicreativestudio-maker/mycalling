varying vec3 vColor;
varying float vAlpha;
varying float vSpeed;

void main() {
    // Вычисляем расстояние от центра точки для рисования круга
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    
    // Мягкое свечение без резких границ
    float strength = 0.04 / distanceToCenter;
    strength = pow(strength, 2.2);
    strength = clamp(strength - 0.05, 0.0, 1.0);
    
    // Создаем идеальную сферическую форму
    float circle = 1.0 - smoothstep(0.18, 0.5, distanceToCenter);

    // Цвет частиц: если скорость высокая (частица летит в потоке), делаем ее цвет чуть ярче/белее
    vec3 finalColor = mix(vColor, vec3(0.95, 0.98, 1.0), clamp(vSpeed * 0.2, 0.0, 0.5));

    gl_FragColor = vec4(finalColor, strength * circle * vAlpha * 0.7);
}
