// Математические генераторы координат для морфинга частиц

export type Vector3Array = [number, number, number];

// Вспомогательная функция генерации случайной точки на сфере (метод Мюллера)
function getRandomSpherePoint(cx: number, cy: number, cz: number, r: number): Vector3Array {
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  const x = cx + r * Math.sin(phi) * Math.cos(theta);
  const y = cy + r * Math.sin(phi) * Math.sin(theta);
  const z = cz + r * Math.cos(phi);
  return [x, y, z];
}

// Вспомогательная функция для генерации точки внутри цилиндра
function getRandomCylinderPoint(cx: number, cy: number, cz: number, r: number, h: number): Vector3Array {
  const theta = Math.random() * 2 * Math.PI;
  const rad = Math.sqrt(Math.random()) * r;
  const x = cx + rad * Math.cos(theta);
  const y = cy + (Math.random() - 0.5) * h;
  const z = cz + rad * Math.sin(theta);
  return [x, y, z];
}

// 1. ПОТОК ЧАСТИЦ (Хаотичное космическое облако)
export function generateSpaceCloud(count: number): Float32Array {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = (0.3 + 0.7 * Math.pow(Math.random(), 1.5)) * 18; // неравномерное распределение
    arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6; // слегка сплюснутое
    arr[i * 3 + 2] = r * Math.cos(phi) * 0.7 - 2;
  }
  return arr;
}

// 2. БАЗОВЫЙ СИЛУЭТ ЧЕЛОВЕКА С АТРИБУТАМИ ПРОФЕССИЙ
// i - индекс частицы, count - общее число частиц, profession - тип профессии
export function generateHumanSilhouette(count: number, profession: string): Float32Array {
  const arr = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    let p: Vector3Array = [0, 0, 0];
    const pct = i / count;

    // Распределяем частицы по сегментам тела человека
    if (pct < 0.15) {
      // ГОЛОВА (сфера вверху)
      p = getRandomSpherePoint(0, 4.2, 0, 0.85);
    } else if (pct < 0.18) {
      // ШЕЯ (узкий цилиндр)
      p = getRandomCylinderPoint(0, 3.2, 0, 0.25, 0.4);
    } else if (pct < 0.52) {
      // ТУЛОВИЩЕ (эллипсоид в центре)
      const y = 0.5 + (Math.random() - 0.5) * 3.0; // от -1.0 до 2.0
      // Ширина сужается к талии
      const factor = 1.0 - Math.abs(y - 0.5) * 0.12;
      const theta = Math.random() * 2 * Math.PI;
      const rad = Math.sqrt(Math.random()) * 0.9 * factor;
      p = [
        rad * Math.cos(theta),
        y + 1.0,
        rad * Math.sin(theta) * 0.8
      ];
    } else if (pct < 0.72) {
      // РУКИ (две руки)
      const side = i % 2 === 0 ? 1 : -1;
      const progress = Math.random(); // от плеча к кисти
      
      // В зависимости от профессии руки могут находиться в разных положениях
      if (profession === 'musician') {
        // Держит воображаемый инструмент
        const angle = side > 0 ? 0.3 : 1.2;
        p = [
          side * (0.8 + progress * 1.2 * Math.sin(angle)),
          2.0 - progress * 1.0 + Math.sin(progress * 3) * 0.2,
          side * 0.4 + Math.cos(progress * 2) * 0.3
        ];
      } else if (profession === 'teacher' || profession === 'entrepreneur') {
        // Одна рука приподнята в жесте / указывает на график
        if (side > 0) { // правая рука вверх-вправо
          p = [
            0.8 + progress * 1.5,
            2.2 + progress * 1.2,
            progress * 0.2
          ];
        } else { // левая опущена
          p = [
            -0.8 - progress * 0.6,
            2.2 - progress * 2.0,
            -progress * 0.2
          ];
        }
      } else if (profession === 'builder' || profession === 'engineer') {
        // Руки держат что-то перед собой
        p = [
          side * (0.8 + progress * 0.7),
          2.2 - progress * 1.2,
          progress * 0.8
        ];
      } else {
        // Обычное положение: слегка разведенные в стороны руки
        p = [
          side * (0.8 + progress * 0.9),
          2.2 - progress * 2.2,
          side * 0.15 * Math.sin(progress * Math.PI)
        ];
      }
    } else if (pct < 0.90) {
      // НОГИ (две ноги)
      const side = i % 2 === 0 ? 1 : -1;
      const progress = Math.random(); // от бедра к стопе
      // Ноги слегка расставлены
      p = [
        side * (0.4 + progress * 0.3),
        -0.5 - progress * 3.2,
        (Math.random() - 0.5) * 0.3
      ];
    } else {
      // АТРИБУТЫ ПРОФЕССИИ (10% частиц уходят на специальный объект)
      p = generateProfessionProps(i, count, profession);
    }

    arr[i * 3 + 0] = p[0];
    arr[i * 3 + 1] = p[1];
    arr[i * 3 + 2] = p[2];
  }

  return arr;
}

// Генерация малых атрибутов профессий у силуэта человека
function generateProfessionProps(i: number, count: number, profession: string): Vector3Array {
  const subIdx = i % 500;
  const angle = (subIdx / 500) * 2 * Math.PI;

  switch (profession) {
    case 'builder':
      // Каска строителя (оранжевый купол на голове)
      const theta = (subIdx / 500) * Math.PI;
      const phi = Math.random() * Math.PI; // только верхняя полусфера
      return [
        0.8 * Math.sin(phi) * Math.cos(theta),
        4.8 + 0.5 * Math.abs(Math.sin(phi) * Math.sin(theta)),
        0.8 * Math.cos(phi)
      ];

    case 'doctor':
      // Стетоскоп (дуга на шее и нити к груди)
      if (subIdx < 250) {
        // Воротниковая дуга вокруг шеи
        const neckAngle = (subIdx / 250) * Math.PI + Math.PI * 0.0;
        return [
          0.4 * Math.cos(neckAngle),
          3.3 - 0.2 * Math.sin(neckAngle),
          0.35 + 0.2 * Math.sin(neckAngle)
        ];
      } else {
        // Уходящая нить и мембрана на груди
        const t = (subIdx - 250) / 250;
        return [
          -0.1 + t * 0.2,
          2.6 - t * 0.8,
          0.55 + Math.sin(t * Math.PI) * 0.05
        ];
      }

    case 'lawyer':
      // Маленькие весы в руке (правой: x > 0)
      if (subIdx < 150) {
        // Вертикальная стойка весов
        const t = subIdx / 150;
        return [1.8, 1.0 + t * 1.5, 0.4];
      } else if (subIdx < 300) {
        // Горизонтальное коромысло
        const t = (subIdx - 150) / 150;
        return [1.3 + t * 1.0, 2.3, 0.4];
      } else {
        // Две чаши весов
        const side = subIdx % 2 === 0 ? 1.3 : 2.3;
        const t = (subIdx - 300) / 200; // нити и чаши
        if (t < 0.7) {
          return [side + (Math.random() - 0.5) * 0.1, 2.3 - t * 0.6, 0.4];
        } else {
          // Плоская чаша
          const cAngle = (t / 0.3) * 2 * Math.PI;
          return [side + 0.2 * Math.cos(cAngle), 1.7, 0.4 + 0.2 * Math.sin(cAngle)];
        }
      }

    case 'teacher':
      // Книга в руках перед грудью
      const sideU = subIdx % 2 === 0 ? 1 : -1;
      const u = Math.random();
      const v = Math.random() * 0.8;
      // Две наклонные плоскости раскрытой книги
      return [
        sideU * (u * 0.6),
        1.8 + v * 0.5 + sideU * u * 0.1,
        0.8 + u * 0.2
      ];

    case 'scientist':
      // Орбита атома вокруг головы
      const orb = subIdx % 2;
      const rotAngle = orb === 0 ? 0.6 : -0.6;
      const r = 1.3;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      return [
        x * Math.cos(rotAngle),
        4.2 + y,
        x * Math.sin(rotAngle)
      ];

    case 'architect':
      // Чертежный планшет/ватман в левой руке
      const ax = (subIdx % 20) / 20 * 1.2 - 0.6;
      const ay = Math.floor(subIdx / 20) / 25 * 0.9;
      return [
        -1.3 + ax * 0.8,
        1.5 + ay * 0.8,
        0.5 + ax * 0.2
      ];

    case 'engineer':
      // Шестеренка за спиной
      const engR = 1.0 + (subIdx % 2 === 0 ? 0.15 : 0) * Math.sin(angle * 8); // 8 зубьев
      return [
        1.2 * Math.cos(angle) * engR,
        2.0 + 1.2 * Math.sin(angle) * engR,
        -0.8
      ];

    case 'musician':
      // Гитара/Инструмент наискосок корпуса
      const gt = subIdx / 500;
      const gX = -1.2 + gt * 2.4;
      const gY = 2.3 - gt * 1.5;
      const gZ = 0.6 + Math.sin(gt * Math.PI) * 0.2;
      // Добавим деку в центре гитары
      if (gt > 0.3 && gt < 0.6) {
        const dAngle = (gt / 0.3) * 2 * Math.PI;
        return [gX + 0.3 * Math.cos(dAngle), gY + 0.3 * Math.sin(dAngle), gZ + 0.1];
      }
      return [gX, gY, gZ];

    case 'it':
      // Светящийся виртуальный интерфейс / код перед руками
      const itX = (subIdx % 25) / 25 * 1.8 - 0.9;
      const itY = Math.floor(subIdx / 25) / 20 * 1.0;
      return [
        itX,
        1.2 + itY,
        1.0 + (Math.random() - 0.5) * 0.05
      ];

    case 'entrepreneur':
      // Растущий график (стрелка вверх-вправо от руки)
      const graphT = subIdx / 500;
      const grX = 0.8 + graphT * 1.8;
      const grY = 1.5 + Math.pow(graphT, 1.8) * 2.2;
      const grZ = 0.5;
      // Стрелочка на конце
      if (graphT > 0.95) {
        const arrowSide = subIdx % 2 === 0 ? 1 : -1;
        return [
          grX - 0.2,
          grY + (arrowSide * 0.15) - 0.1,
          grZ
        ];
      }
      return [grX, grY, grZ];

    default:
      return getRandomSpherePoint(0, 0, 0, 1.0);
  }
}

// 3. ОБЪЕМНЫЕ СИМВОЛЫ ОТРАСЛЕЙ
export function generateIndustrySymbol(count: number, symbolType: string): Float32Array {
  const arr = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let p: Vector3Array = [0, 0, 0];
    const angle = (i / count) * 2 * Math.PI;

    switch (symbolType) {
      case 'atom': {
        // Ученый: Атом. Центральное ядро + 3 пересекающиеся орбиты
        const group = i % 4;
        if (group === 0) {
          // Ядро
          p = getRandomSpherePoint(0, 0, 0, 1.2);
        } else {
          // Три орбиты под углами 0, 120, 240 градусов
          const theta = angle * 3; // оборот
          const r = 4.2 + (Math.random() - 0.5) * 0.15;
          const x = r * Math.cos(theta);
          const y = r * Math.sin(theta);
          const angleOffset = (group * Math.PI) / 3;
          p = [
            x * Math.cos(angleOffset),
            y,
            x * Math.sin(angleOffset)
          ];
        }
        break;
      }

      case 'dna': {
        // Врач: Спираль ДНК. Две закрученные нити + мостики
        const group = i % 5;
        const y = (i / count) * 10 - 5; // Высота от -5 до +5
        const twist = y * 1.5; // угол закрутки
        const r = 2.0;

        if (group === 0) {
          // Первая нить спирали
          p = [r * Math.cos(twist), y, r * Math.sin(twist)];
        } else if (group === 1) {
          // Вторая нить (сдвиг 180 градусов)
          p = [r * Math.cos(twist + Math.PI), y, r * Math.sin(twist + Math.PI)];
        } else {
          // Перемычки (мостики) между ними
          const progress = Math.random(); // положение на перемычке от 0 до 1
          const posX = mix(r * Math.cos(twist), r * Math.cos(twist + Math.PI), progress);
          const posZ = mix(r * Math.sin(twist), r * Math.sin(twist + Math.PI), progress);
          p = [posX, y, posZ];
        }
        break;
      }

      case 'medical': {
        // Врач/Медицина: Змея и жезл Асклепия (чаша или жезл)
        // Сделаем Жезл (цилиндр по оси Y) и обвивающую змею
        const group = i % 3;
        if (group === 0) {
          // Жезл
          p = getRandomCylinderPoint(0, 0, 0, 0.25, 8.5);
        } else {
          // Змея, обвивающая жезл
          const y = (i / count) * 8.0 - 4.0;
          const sAngle = y * 2.8; // шаг витков
          const r = 0.95 + Math.sin(y * 0.5) * 0.1;
          p = [
            r * Math.cos(sAngle),
            y + 0.5,
            r * Math.sin(sAngle)
          ];
        }
        break;
      }

      case 'scales': {
        // Юрист: Весы Фемиды
        const group = i % 5;
        if (group === 0) {
          // Стойка весов
          p = getRandomCylinderPoint(0, -1.0, 0, 0.2, 6.0);
        } else if (group === 1) {
          // Основание (диск внизу)
          const baseAngle = Math.random() * 2 * Math.PI;
          const baseR = Math.sqrt(Math.random()) * 1.5;
          p = [baseR * Math.cos(baseAngle), -4.0, baseR * Math.sin(baseAngle)];
        } else if (group === 2) {
          // Главная перекладина (коромысло)
          const progress = (i % (count / 5)) / (count / 5) * 6.5 - 3.25;
          p = [progress, 2.0, 0];
        } else {
          // Две чаши
          const side = group === 3 ? -3.0 : 3.0;
          const sub = i % 300;
          if (sub < 100) {
            // Нити чаши
            const t = sub / 100;
            const wireAngle = (sub % 3) * (2 * Math.PI / 3);
            p = [side + 0.6 * Math.cos(wireAngle) * t, 2.0 - t * 2.0, 0.6 * Math.sin(wireAngle) * t];
          } else {
            // Сама чаша
            const t = (sub - 100) / 200;
            const bowlAngle = t * 2 * Math.PI;
            const bowlR = Math.sqrt(Math.random()) * 0.85;
            p = [side + bowlR * Math.cos(bowlAngle), 0.0 + (Math.random() - 0.5) * 0.1, bowlR * Math.sin(bowlAngle)];
          }
        }
        break;
      }

      case 'gear': {
        // Инженер: Шестерня. Диск с зубьями
        const rBase = 3.5;
        const teeth = 10;
        const toothDepth = 0.55;
        // Модифицируем радиус по синусоиде зуба
        const toothFactor = Math.sin(angle * teeth) > 0.0 ? toothDepth : -toothDepth;
        const r = rBase + toothFactor + (Math.random() - 0.5) * 0.15;
        
        const group = i % 4;
        if (group === 0) {
          // Внешний контур шестерни с зубьями
          p = [r * Math.cos(angle), r * Math.sin(angle), (Math.random() - 0.5) * 0.6];
        } else if (group === 1) {
          // Внутреннее отверстие (ось)
          const innerR = 1.0;
          p = [innerR * Math.cos(angle), innerR * Math.sin(angle), (Math.random() - 0.5) * 0.8];
        } else {
          // Соединительные спицы (4 спицы)
          const spoke = i % 4;
          const progress = Math.random() * 2.5 + 1.0;
          const spokeAngle = (spoke * Math.PI) / 2;
          p = [
            progress * Math.cos(spokeAngle) + (Math.random() - 0.5) * 0.25,
            progress * Math.sin(spokeAngle) + (Math.random() - 0.5) * 0.25,
            (Math.random() - 0.5) * 0.3
          ];
        }
        break;
      }

      case 'palette': {
        // Художник/Музыкант: Палитра с кистью
        const group = i % 3;
        if (group === 0) {
          // Палитра в форме кардиоиды/почки
          const r = (1.5 + Math.cos(angle) * 1.5) * 1.2;
          p = [r * Math.cos(angle), r * Math.sin(angle) * 0.85, (Math.random() - 0.5) * 0.15];
        } else if (group === 1) {
          // Краски на палитре (несколько цветных концентрированных кружков)
          const spot = i % 5;
          const spotAngles = [0.2, 1.2, 2.2, 3.2, 4.2];
          const sa = spotAngles[spot];
          const sr = 2.4;
          const spotX = sr * Math.cos(sa) + (Math.random() - 0.5) * 0.35;
          const spotY = sr * Math.sin(sa) * 0.85 + (Math.random() - 0.5) * 0.35;
          p = [spotX, spotY, 0.1];
        } else {
          // Кисточка, пересекающая палитру
          const t = (i % (count / 3)) / (count / 3) * 6.5 - 3.25;
          p = [t - 0.5, t * 0.8 + 0.2, t * 0.15 + 0.2];
        }
        break;
      }

      case 'chart': {
        // Предприниматель: Восходящий график роста (3D стрелка)
        const group = i % 4;
        if (group < 2) {
          // Оси координат (X и Y)
          const t = Math.random() * 6.5 - 3.25;
          if (group === 0) {
            p = [t, -2.5, -2.5]; // Ось X
          } else {
            p = [-2.5, t + 0.75, -2.5]; // Ось Y
          }
        } else {
          // График-кривая и стрелка
          const t = (i % (count / 2)) / (count / 2);
          const x = t * 6.0 - 2.5;
          // Экспоненциальный рост
          const y = Math.pow(t, 2.0) * 4.8 - 2.25;
          const z = t * 1.5 - 2.0;

          if (t > 0.96) {
            // Стрелка на конце
            const aIdx = i % 3;
            if (aIdx === 0) p = [x - 0.4, y, z];
            else if (aIdx === 1) p = [x, y - 0.4, z];
            else p = [x, y, z];
          } else {
            p = [x + (Math.random() - 0.5) * 0.1, y + (Math.random() - 0.5) * 0.1, z];
          }
        }
        break;
      }

      case 'book': {
        // Учитель: Книга. Раскрытые страницы
        const group = i % 3;
        const z = (i / count) * 4.8 - 2.4; // Глубина книги

        if (group === 0) {
          // Левый разворот страниц (наклон влево)
          const progress = Math.random();
          p = [-progress * 3.5, progress * 0.65, z];
        } else if (group === 1) {
          // Правый разворот страниц (наклон вправо)
          const progress = Math.random();
          p = [progress * 3.5, progress * 0.65, z];
        } else {
          // Обложка книги снизу
          const progress = Math.random() * 3.6 - 1.8;
          p = [progress * 2.0, -0.45 + Math.abs(progress) * 0.08, z * 1.05];
        }
        break;
      }

      case 'dialog': {
        // Коммуникации: Облако диалога
        const group = i % 3;
        if (group === 0) {
          // Основной большой эллипс
          const rX = 3.6;
          const rY = 2.4;
          p = [
            rX * Math.cos(angle) + (Math.random() - 0.5) * 0.1,
            rY * Math.sin(angle) + (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.4
          ];
        } else if (group === 1) {
          // Меньший эллипс-сосед
          const rX = 2.2;
          const rY = 1.5;
          p = [
            2.2 + rX * Math.cos(angle),
            1.2 + rY * Math.sin(angle),
            -0.5 + (Math.random() - 0.5) * 0.3
          ];
        } else {
          // "Хвостик" диалога (треугольник внизу слева)
          const t = Math.random();
          p = [
            -1.0 - t * 1.2,
            -2.0 - t * 1.0,
            (Math.random() - 0.5) * 0.2
          ];
        }
        break;
      }

      case 'chip': {
        // IT: Микросхема. Центральный квадратный чип и отходящие проводники
        const group = i % 4;
        if (group === 0) {
          // Квадратный кристалл в центре (заполненный кубик)
          p = [
            (Math.random() - 0.5) * 2.8,
            (Math.random() - 0.5) * 2.8,
            (Math.random() - 0.5) * 0.8
          ];
        } else {
          // Отходящие шины/дорожки (8 разных линий)
          const line = i % 8;
          const t = Math.random() * 3.5 + 1.4; // длина проводников
          const spacing = 0.5;
          const offset = ((line % 3) - 1) * spacing;
          
          if (line < 2) {
            // Вверх
            p = [offset, t, 0];
          } else if (line < 4) {
            // Вниз
            p = [offset, -t, 0];
          } else if (line < 6) {
            // Вправо
            p = [t, offset, 0];
          } else {
            // Влево
            p = [-t, offset, 0];
          }
          
          // Маленькие контакты-точки на концах дорожек
          if (Math.random() > 0.85) {
            p[0] *= 1.1;
            p[1] *= 1.1;
          }
        }
        break;
      }

      default:
        // Резервный вариант: Сфера
        p = getRandomSpherePoint(0, 0, 0, 3.5);
    }

    arr[i * 3 + 0] = p[0];
    arr[i * 3 + 1] = p[1];
    arr[i * 3 + 2] = p[2];
  }

  return arr;
}

// Линейная интерполяция
function mix(start: number, end: number, amt: number): number {
  return (1 - amt) * start + amt * end;
}
