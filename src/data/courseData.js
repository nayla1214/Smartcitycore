/**
 * Datos del curso utilizados por el frontend.
 *
 * El progreso, las preguntas y las calificaciones se consultan
 * al backend. Los IDs registrados se conservan aquí.
 */

export const COURSES = [
  {
    id: 1,
    name: 'Introducción a Ciudades Inteligentes',
    description:
      'Conoce los fundamentos de las ciudades inteligentes y su aplicación para mejorar la gestión y los servicios municipales.',

    modules: [
      {
        id: 1,
        courseId: 1,
        order_number: 1,
        title: 'Fundamentos de Ciudades Inteligentes',
        description:
          'Introducción a los conceptos clave de las ciudades inteligentes y cómo se aplican en Ecuador.',

        videos: [
          {
            id: 1,
            moduleId: 1,
            order_number: 1,
            title: 'Video 1: ¿Qué es una Ciudad Inteligente?',
            description:
              'Visión general del concepto de ciudad inteligente y sus componentes principales.',
            url: '2HS6SITpfOY',
            duration: 180,
          },
          {
            id: 2,
            moduleId: 1,
            order_number: 2,
            title:
              'Tema 1.2: Gobernanza inteligente y ciudadanía digital',
            description:
              'Gobernanza inteligente, gobierno abierto y ciudadanía digital.',
            url: 't7Yng5_mHzw',
            duration: 163,
          },
          {
            id: 3,
            moduleId: 1,
            order_number: 3,
            title:
              'Tema 1.3: Evolución de las ciudades tradicionales a ciudades inteligentes',
            description:
              'De la ciudad tradicional a la ciudad digital, conectada e inteligente.',
            url: '1u7iqnn2Saw',
            duration: 374,
          },
          {
            id: 4,
            moduleId: 1,
            order_number: 4,
            title:
              'Tema 1.4: Plataforma web de urbanismo inteligente',
            description:
              'Información territorial, mapas e indicadores para apoyar las decisiones municipales.',
            url: '9oOPvXQliTo',
            duration: 429,
          },
        ],

        // Se conserva para los componentes del tema 1.1.
        evaluation: {
          id: 1,
          moduleId: 1,
          courseId: 1,
          title:
            'Evaluación — Tema 1.1: Concepto de Ciudad Inteligente',
          is_final: false,
        },

        evaluations: [
          {
            id: 1,
            moduleId: 1,
            courseId: 1,
            topicNumber: '1.1',
            title:
              'Evaluación — Tema 1.1: Concepto de Ciudad Inteligente',
            is_final: false,
          },
          {
            id: 2,
            moduleId: 1,
            courseId: 1,
            topicNumber: '1.2',
            title:
              'Evaluación — Tema 1.2: Gobernanza inteligente y ciudadanía digital',
            is_final: false,
          },
          {
            id: 3,
            moduleId: 1,
            courseId: 1,
            topicNumber: '1.3',
            title:
              'Evaluación — Tema 1.3: Evolución de las ciudades tradicionales a ciudades inteligentes',
            is_final: false,
          },
          {
            id: 4,
            moduleId: 1,
            courseId: 1,
            topicNumber: '1.4',
            title:
              'Evaluación — Tema 1.4: Plataforma web de urbanismo inteligente',
            is_final: false,
          },
        ],
      },

      {
        id: 2,
        courseId: 1,
        order_number: 2,
        title: 'Infraestructura Sostenible y Movilidad',
        description:
          'Infraestructura verde, transporte sostenible y espacios urbanos para mejorar la calidad de vida.',

        videos: [
          {
            id: 5,
            moduleId: 2,
            order_number: 1,
            title: 'Tema 2.1: Infraestructura verde',
            description:
              'Infraestructura verde y su contribución a la sostenibilidad y la calidad de vida en las ciudades.',
            url: 'Fiy6pRrVWnA',
            duration: 392,
          },
        ],

        // Agregaremos la evaluación cuando quede registrada.
        evaluations: [],
      },

      {
        id: 3,
        courseId: 1,
        order_number: 3,
        title: 'Inteligencia Artificial y Aprendizaje',
        description:
          'Inteligencia artificial aplicada a los servicios urbanos, educación inteligente y gemelos digitales.',

        // Los videos se incorporarán al desarrollar estos temas.
        videos: [],
        evaluations: [],
      },
    ],
  },
];

export const getCourseById = (courseId) =>
  COURSES.find(
    (course) => course.id === Number(courseId)
  ) || null;

export const getModuleById = (moduleId) => {
  for (const course of COURSES) {
    const module = course.modules.find(
      (item) => item.id === Number(moduleId)
    );

    if (module) {
      return {
        ...module,
        courseId: course.id,
      };
    }
  }

  return null;
};

export const getModulesByCourse = (courseId) => {
  const course = getCourseById(courseId);

  return course ? course.modules : [];
};

export const getVideoById = (videoId) => {
  for (const course of COURSES) {
    for (const module of course.modules) {
      const video = (module.videos || []).find(
        (item) => item.id === Number(videoId)
      );

      if (video) return video;
    }
  }

  return null;
};

export const getEvaluationById = (evaluationId) => {
  const requestedId = Number(evaluationId);

  for (const course of COURSES) {
    for (const module of course.modules) {
      if (module.evaluation?.id === requestedId) {
        return module.evaluation;
      }

      const evaluation = (module.evaluations || []).find(
        (item) => item.id === requestedId
      );

      if (evaluation) return evaluation;
    }

    if (course.finalEvaluation?.id === requestedId) {
      return course.finalEvaluation;
    }
  }

  return null;
};

export const getEvaluationByCourseId = (courseId) => {
  const course = getCourseById(courseId);

  return course?.finalEvaluation || null;
};