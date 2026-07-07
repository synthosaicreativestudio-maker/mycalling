/**
 * Конфигурация интерфейса и визуальных модулей
 */
export const designConfig = {
  // Включение/выключение трехмерных частиц WebGL на фоне
  enableParticles: false,

  // Параметры по умолчанию
  particleColor: '#3B82F6',
  
  // Профили производительности
  performanceProfiles: {
    ultra: {
      particleCount: 250000,
      enablePostprocessing: true,
      enableBloom: true,
      enableDOF: true,
    },
    high: {
      particleCount: 150000,
      enablePostprocessing: true,
      enableBloom: true,
      enableDOF: false,
    },
    medium: {
      particleCount: 80000,
      enablePostprocessing: false,
      enableBloom: false,
      enableDOF: false,
    },
    low: {
      particleCount: 40000,
      enablePostprocessing: false,
      enableBloom: false,
      enableDOF: false,
    },
    mobile: {
      particleCount: 18000,
      enablePostprocessing: false,
      enableBloom: false,
      enableDOF: false,
    }
  }
};
