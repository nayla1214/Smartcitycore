/**
 * DATOS DE CURSOS HARDCODEADOS
 * Todo el contenido educativo (cursos, módulos, videos, evaluaciones)
 * está definido aquí en el código, sin necesidad de base de datos.
 *
 * Para agregar/editar contenido, solo modifica este archivo.
 */

export const COURSES = [
  {
    id: 1,
    name: 'Ciudades Inteligentes y Gobierno Digital',
    description: 'Aprende los conceptos fundamentales de las ciudades inteligentes, transformación digital en el sector público y gestión eficiente de los Gobiernos Autónomos Descentralizados (GADs).',
    image_url: null,
    modules: [
      // ─── MÓDULO 1 ───────────────────────────────────────────────
      {
        id: 1,
        courseId: 1,
        order_number: 1,
        title: 'Fundamentos de Ciudades Inteligentes',
        description: 'Introducción a los conceptos clave de las ciudades inteligentes y cómo se aplican en Ecuador.',
        videos: [
          {
            id: 1,
            moduleId: 1,
            order_number: 1,
            title: 'Video 1: ¿Qué es una Ciudad Inteligente?',
            description: 'Visión general del concepto de ciudad inteligente y sus componentes principales.',
            url: 'M7lc1UVf-VE', // YouTube Player Demo ID
            duration: 180,
          },
        ],
        evaluation: {
          id: 1,
          moduleId: 1,
          title: 'Evaluación: Fundamentos de Ciudades Inteligentes',
          is_final: false,
          questions: [
            {
              id: 1,
              evaluationId: 1,
              text: '¿Cuál de las siguientes opciones describe mejor una ciudad inteligente?',
              score: 1,
              options: [
                { id: 1, text: 'Una ciudad con muchos edificios altos y modernos', is_correct: false },
                { id: 2, text: 'Una ciudad que usa tecnología y datos para mejorar la calidad de vida de sus ciudadanos', is_correct: true },
                { id: 3, text: 'Una ciudad con una gran población y alta densidad', is_correct: false },
                { id: 4, text: 'Una ciudad completamente automatizada sin intervención humana', is_correct: false },
              ],
            },
            {
              id: 2,
              evaluationId: 1,
              text: '¿Qué significa IoT en el contexto de ciudades inteligentes?',
              score: 1,
              options: [
                { id: 5, text: 'Internet of Traffic (Internet de Tráfico)', is_correct: false },
                { id: 6, text: 'Institute of Technology (Instituto de Tecnología)', is_correct: false },
                { id: 7, text: 'Internet of Things (Internet de las Cosas)', is_correct: true },
                { id: 8, text: 'Integration of Technologies (Integración de Tecnologías)', is_correct: false },
              ],
            },
            {
              id: 3,
              evaluationId: 1,
              text: '¿Cuál es el objetivo principal del uso de Big Data en una ciudad inteligente?',
              score: 1,
              options: [
                { id: 9, text: 'Reemplazar a todos los funcionarios públicos con algoritmos', is_correct: false },
                { id: 10, text: 'Analizar grandes volúmenes de datos para tomar mejores decisiones en la gestión urbana', is_correct: true },
                { id: 11, text: 'Vender información personal de los ciudadanos', is_correct: false },
                { id: 12, text: 'Almacenar fotos de la ciudad en la nube', is_correct: false },
              ],
            },
            {
              id: 4,
              evaluationId: 1,
              text: '¿Cuál de las siguientes NO es una tecnología habilitadora de ciudades inteligentes?',
              score: 1,
              options: [
                { id: 13, text: 'Inteligencia Artificial (IA)', is_correct: false },
                { id: 14, text: 'Internet de las Cosas (IoT)', is_correct: false },
                { id: 15, text: 'Máquinas de escribir mecánicas', is_correct: true },
                { id: 16, text: 'Big Data', is_correct: false },
              ],
            },
            {
              id: 5,
              evaluationId: 1,
              text: '¿Qué beneficio principal aporta la tecnología IoT a los servicios municipales?',
              score: 1,
              options: [
                { id: 17, text: 'Aumentar el número de empleados municipales', is_correct: false },
                { id: 18, text: 'Monitorear y gestionar servicios en tiempo real (agua, luz, tráfico)', is_correct: true },
                { id: 19, text: 'Eliminar la necesidad de infraestructura física', is_correct: false },
                { id: 20, text: 'Crear más papeles y burocracia', is_correct: false },
              ],
            },
          ],
        },
      },

      // ─── MÓDULO 2 ───────────────────────────────────────────────
      {
        id: 2,
        courseId: 1,
        order_number: 2,
        title: 'Gobierno Digital y Transformación Pública',
        description: 'Aprende cómo los GADs pueden implementar el gobierno digital para mejorar sus servicios ciudadanos.',
        videos: [
          {
            id: 2,
            moduleId: 2,
            order_number: 1,
            title: 'Video 1: Qué es el Gobierno Digital',
            description: 'Conceptos de e-government y transformación digital en el sector público ecuatoriano.',
            url: 'aqz-KE-bpKQ', // Video 100% embebible garantizado (Big Buck Bunny)
            duration: 600,
          },
        ],
        evaluation: {
          id: 2,
          moduleId: 2,
          title: 'Evaluación: Gobierno Digital',
          is_final: false,
          questions: [
            {
              id: 6,
              evaluationId: 2,
              text: '¿Qué es el gobierno digital (e-government)?',
              score: 1,
              options: [
                { id: 21, text: 'Un gobierno formado únicamente por empresas tecnológicas', is_correct: false },
                { id: 22, text: 'El uso de tecnologías digitales para mejorar la administración pública y los servicios a ciudadanos', is_correct: true },
                { id: 23, text: 'Un sistema que elimina completamente los trámites presenciales', is_correct: false },
                { id: 24, text: 'Un partido político basado en tecnología', is_correct: false },
              ],
            },
            {
              id: 7,
              evaluationId: 2,
              text: '¿Cuál es una ventaja directa del gobierno digital para el ciudadano?',
              score: 1,
              options: [
                { id: 25, text: 'Mayor tiempo de espera en oficinas', is_correct: false },
                { id: 26, text: 'Más formularios físicos que llenar', is_correct: false },
                { id: 27, text: 'Acceso a servicios desde cualquier lugar y en cualquier momento', is_correct: true },
                { id: 28, text: 'Reducción del acceso a la información pública', is_correct: false },
              ],
            },
            {
              id: 8,
              evaluationId: 2,
              text: '¿Cuál de los siguientes es un ejemplo de servicio digital municipal?',
              score: 1,
              options: [
                { id: 29, text: 'Pago de impuestos prediales en línea', is_correct: true },
                { id: 30, text: 'Trámites solo con firma notarial física', is_correct: false },
                { id: 31, text: 'Atención únicamente en horario de oficina', is_correct: false },
                { id: 32, text: 'Uso exclusivo de correo postal para comunicaciones', is_correct: false },
              ],
            },
            {
              id: 9,
              evaluationId: 2,
              text: '¿Qué implica la "transformación digital" en un GAD?',
              score: 1,
              options: [
                { id: 33, text: 'Comprar computadoras para todos los funcionarios', is_correct: false },
                { id: 34, text: 'Cambiar la cultura, los procesos y los sistemas para aprovechar la tecnología y servir mejor al ciudadano', is_correct: true },
                { id: 35, text: 'Crear una página web institucional básica', is_correct: false },
                { id: 36, text: 'Digitalizar documentos físicos sin cambiar los procesos', is_correct: false },
              ],
            },
            {
              id: 10,
              evaluationId: 2,
              text: '¿Qué principio es fundamental en la implementación de gobierno digital?',
              score: 1,
              options: [
                { id: 37, text: 'Exclusión de ciudadanos sin internet', is_correct: false },
                { id: 38, text: 'Centralización absoluta de toda la información', is_correct: false },
                { id: 39, text: 'Transparencia, participación ciudadana e inclusión digital', is_correct: true },
                { id: 40, text: 'Reducción de la oferta de servicios públicos', is_correct: false },
              ],
            },
          ],
        },
      },

      // ─── MÓDULO 3 ───────────────────────────────────────────────
      {
        id: 3,
        courseId: 1,
        order_number: 3,
        title: 'Gestión Sostenible y Participación Ciudadana',
        description: 'Estrategias para involucrar a los ciudadanos en la gestión del GAD y promover el desarrollo sostenible.',
        videos: [
          {
            id: 3,
            moduleId: 3,
            order_number: 1,
            title: 'Video 1: Participación Ciudadana y Sostenibilidad',
            description: 'Mecanismos modernos para involucrar a la comunidad en la toma de decisiones del GAD.',
            url: 'dQw4w9WgXcQ', // YouTube test video
            duration: 210,
          },
        ],
        evaluation: {
          id: 3,
          moduleId: 3,
          title: 'Evaluación: Gestión Sostenible',
          is_final: false,
          questions: [
            {
              id: 11,
              evaluationId: 3,
              text: '¿Qué es la participación ciudadana en el contexto de un GAD?',
              score: 1,
              options: [
                { id: 41, text: 'La participación de ciudadanos solo en elecciones', is_correct: false },
                { id: 42, text: 'El derecho y la práctica de los ciudadanos de involucrarse activamente en la toma de decisiones públicas', is_correct: true },
                { id: 43, text: 'La participación de empresas privadas en el gobierno', is_correct: false },
                { id: 44, text: 'El voto en asambleas municipales una vez por año', is_correct: false },
              ],
            },
            {
              id: 12,
              evaluationId: 3,
              text: '¿Cuál de los siguientes es un mecanismo moderno de participación ciudadana?',
              score: 1,
              options: [
                { id: 45, text: 'Tablón de anuncios en el municipio', is_correct: false },
                { id: 46, text: 'Presupuesto participativo digital con votación en línea', is_correct: true },
                { id: 47, text: 'Reuniones mensuales a las que solo asisten funcionarios', is_correct: false },
                { id: 48, text: 'Boletines impresos distribuidos en el mercado', is_correct: false },
              ],
            },
            {
              id: 13,
              evaluationId: 3,
              text: '¿Qué es el desarrollo sostenible en el contexto municipal?',
              score: 1,
              options: [
                { id: 49, text: 'El crecimiento económico sin límites a costa del medio ambiente', is_correct: false },
                { id: 50, text: 'Satisfacer las necesidades del presente sin comprometer la capacidad de las generaciones futuras', is_correct: true },
                { id: 51, text: 'Prohibir toda actividad industrial en el municipio', is_correct: false },
                { id: 52, text: 'Importar tecnología extranjera para resolver problemas locales', is_correct: false },
              ],
            },
            {
              id: 14,
              evaluationId: 3,
              text: '¿Cuál de las siguientes acciones promueve la sostenibilidad ambiental en un GAD?',
              score: 1,
              options: [
                { id: 53, text: 'Eliminar todas las áreas verdes para construir más infraestructura', is_correct: false },
                { id: 54, text: 'Implementar sistemas de reciclaje, energías renovables y gestión eficiente del agua', is_correct: true },
                { id: 55, text: 'Aumentar el número de vehículos municipales a gasolina', is_correct: false },
                { id: 56, text: 'Ignorar las regulaciones ambientales nacionales', is_correct: false },
              ],
            },
            {
              id: 15,
              evaluationId: 3,
              text: '¿Por qué es importante la transparencia en la gestión del GAD?',
              score: 1,
              options: [
                { id: 57, text: 'Para ocultar información sensible de los ciudadanos', is_correct: false },
                { id: 58, text: 'No es importante; los ciudadanos no necesitan conocer el uso de los recursos públicos', is_correct: false },
                { id: 59, text: 'Para generar confianza, prevenir la corrupción y fortalecer la democracia local', is_correct: true },
                { id: 60, text: 'Para cumplir con requisitos burocráticos sin impacto real', is_correct: false },
              ],
            },
          ],
        },
      },
    ],

    // ─── EVALUACIÓN FINAL DEL CURSO ─────────────────────────────
    finalEvaluation: {
      id: 10,
      courseId: 1,
      title: 'Evaluación Final: Ciudades Inteligentes y Gobierno Digital',
      is_final: true,
      questions: [
        {
          id: 16,
          evaluationId: 10,
          text: '¿Cuál es el pilar tecnológico más importante de una ciudad inteligente?',
          score: 1,
          options: [
            { id: 61, text: 'La cantidad de semáforos instalados', is_correct: false },
            { id: 62, text: 'La conectividad, los datos y la capacidad de respuesta en tiempo real', is_correct: true },
            { id: 63, text: 'El número de empleados públicos', is_correct: false },
            { id: 64, text: 'La extensión geográfica del municipio', is_correct: false },
          ],
        },
        {
          id: 17,
          evaluationId: 10,
          text: '¿Cómo contribuye el gobierno digital a la reducción de la corrupción?',
          score: 1,
          options: [
            { id: 65, text: 'No tiene ningún impacto en la corrupción', is_correct: false },
            { id: 66, text: 'Mediante la automatización de procesos, trazabilidad de trámites y transparencia en el uso de recursos', is_correct: true },
            { id: 67, text: 'Aumentando el número de formularios que deben llenarse', is_correct: false },
            { id: 68, text: 'Contratando más auditores gubernamentales', is_correct: false },
          ],
        },
        {
          id: 18,
          evaluationId: 10,
          text: '¿Qué rol cumplen los ciudadanos en el modelo de ciudad inteligente?',
          score: 1,
          options: [
            { id: 69, text: 'Son únicamente receptores pasivos de los servicios', is_correct: false },
            { id: 70, text: 'Son actores activos que contribuyen con datos, retroalimentación y participación en la gobernanza', is_correct: true },
            { id: 71, text: 'No tienen ningún rol en la gestión de la ciudad', is_correct: false },
            { id: 72, text: 'Solo participan en elecciones cada cuatro años', is_correct: false },
          ],
        },
        {
          id: 19,
          evaluationId: 10,
          text: '¿Cuál es el objetivo principal de la Agenda 2030 de la ONU en relación con las ciudades?',
          score: 1,
          options: [
            { id: 73, text: 'Construir más autopistas en países en desarrollo', is_correct: false },
            { id: 74, text: 'Lograr que las ciudades y los asentamientos humanos sean inclusivos, seguros, resilientes y sostenibles (ODS 11)', is_correct: true },
            { id: 75, text: 'Centralizar toda la gestión urbana en gobiernos nacionales', is_correct: false },
            { id: 76, text: 'Promover la migración del campo a la ciudad', is_correct: false },
          ],
        },
        {
          id: 20,
          evaluationId: 10,
          text: '¿Qué es la interoperabilidad en el contexto del gobierno digital?',
          score: 1,
          options: [
            { id: 77, text: 'La capacidad de un sistema informático de funcionar sin internet', is_correct: false },
            { id: 78, text: 'La capacidad de diferentes sistemas y organizaciones de trabajar juntos e intercambiar información de manera efectiva', is_correct: true },
            { id: 79, text: 'El uso de un único proveedor tecnológico para todos los sistemas del Estado', is_correct: false },
            { id: 80, text: 'La prohibición de compartir datos entre entidades públicas', is_correct: false },
          ],
        },
        {
          id: 21,
          evaluationId: 10,
          text: '¿Cuál de los siguientes indicadores mide la eficiencia de un GAD en el uso de tecnología?',
          score: 1,
          options: [
            { id: 81, text: 'El número total de empleados municipales', is_correct: false },
            { id: 82, text: 'El porcentaje de trámites ciudadanos que pueden realizarse en línea', is_correct: true },
            { id: 83, text: 'El presupuesto total del municipio', is_correct: false },
            { id: 84, text: 'La cantidad de metros cuadrados de la sede municipal', is_correct: false },
          ],
        },
        {
          id: 22,
          evaluationId: 10,
          text: '¿Qué principio de la Ciudad Inteligente asegura que todos los ciudadanos puedan beneficiarse de la tecnología?',
          score: 1,
          options: [
            { id: 85, text: 'Exclusividad tecnológica', is_correct: false },
            { id: 86, text: 'Inclusión digital y acceso equitativo', is_correct: true },
            { id: 87, text: 'Privatización de los servicios urbanos', is_correct: false },
            { id: 88, text: 'Concentración de beneficios en el centro urbano', is_correct: false },
          ],
        },
        {
          id: 23,
          evaluationId: 10,
          text: '¿Cuál es la función del "gemelo digital" (digital twin) de una ciudad?',
          score: 1,
          options: [
            { id: 89, text: 'Crear una ciudad virtual de entretenimiento', is_correct: false },
            { id: 90, text: 'Simular y modelar la ciudad en tiempo real para planificación, gestión y toma de decisiones', is_correct: true },
            { id: 91, text: 'Reemplazar físicamente a los funcionarios públicos', is_correct: false },
            { id: 92, text: 'Duplicar todos los archivos físicos del municipio en formato digital', is_correct: false },
          ],
        },
        {
          id: 24,
          evaluationId: 10,
          text: 'En el marco de la sostenibilidad, ¿qué significa la "resiliencia urbana"?',
          score: 1,
          options: [
            { id: 93, text: 'La capacidad de la ciudad de resistir, adaptarse y recuperarse de crisis o desastres', is_correct: true },
            { id: 94, text: 'La resistencia de los edificios a terremotos únicamente', is_correct: false },
            { id: 95, text: 'La negativa de la ciudad a adoptar cambios tecnológicos', is_correct: false },
            { id: 96, text: 'El uso de materiales resistentes en la construcción pública', is_correct: false },
          ],
        },
        {
          id: 25,
          evaluationId: 10,
          text: '¿Cuál es el primer paso recomendado para que un GAD inicie su transformación digital?',
          score: 1,
          options: [
            { id: 97, text: 'Comprar equipos tecnológicos de última generación inmediatamente', is_correct: false },
            { id: 98, text: 'Diagnosticar la situación actual, definir una visión estratégica y capacitar al talento humano', is_correct: true },
            { id: 99, text: 'Contratar a una empresa extranjera para que gestione todos los sistemas', is_correct: false },
            { id: 100, text: 'Esperar a que el gobierno nacional indique qué sistemas usar', is_correct: false },
          ],
        },
      ],
    },
  },
];

/**
 * Helpers para buscar datos por ID
 */
export const getCourseById = (courseId) =>
  COURSES.find(c => c.id === parseInt(courseId)) || null;

export const getModuleById = (moduleId) => {
  for (const course of COURSES) {
    const mod = course.modules.find(m => m.id === parseInt(moduleId));
    if (mod) return { ...mod, courseId: course.id };
  }
  return null;
};

export const getModulesByCourse = (courseId) => {
  const course = getCourseById(courseId);
  return course ? course.modules : [];
};

export const getVideoById = (videoId) => {
  for (const course of COURSES) {
    for (const mod of course.modules) {
      const video = mod.videos.find(v => v.id === parseInt(videoId));
      if (video) return video;
    }
  }
  return null;
};

export const getEvaluationById = (evaluationId) => {
  for (const course of COURSES) {
    if (course.finalEvaluation && course.finalEvaluation.id === parseInt(evaluationId)) {
      return course.finalEvaluation;
    }
    for (const mod of course.modules) {
      if (mod.evaluation && mod.evaluation.id === parseInt(evaluationId)) {
        return mod.evaluation;
      }
    }
  }
  return null;
};

export const getEvaluationByCourseId = (courseId) => {
  const course = getCourseById(courseId);
  return course ? course.finalEvaluation : null;
};
