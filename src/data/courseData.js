/**
 * Datos de cursos utilizados por el frontend.
 *
 * Las preguntas de la evaluación 1.1 se consultan al backend.
 * Las evaluaciones de 1.2, 1.3, 1.4 y la evaluación final del
 * módulo se agregarán cuando desarrollemos esos contenidos.
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
        ],

        evaluation: {
          id: 1,
          moduleId: 1,
          courseId: 1,
          title: 'Evaluación — Tema 1.1: Concepto de Ciudad Inteligente',
          is_final: false,
        },
      },

      {
        id: 2,
        courseId: 1,
        order_number: 2,
        title: 'Gobierno Digital y Transformación Pública',
        description:
          'Aprende cómo los GADs pueden implementar el gobierno digital para mejorar sus servicios ciudadanos.',

        videos: [
          {
            id: 2,
            moduleId: 2,
            order_number: 1,
            title: 'Video 1: Qué es el Gobierno Digital',
            description:
              'Conceptos de e-government y transformación digital en el sector público ecuatoriano.',
            url: 'aqz-KE-bpKQ',
            duration: 600,
          },
        ],
      },

      {
        id: 3,
        courseId: 1,
        order_number: 3,
        title: 'Gestión Sostenible y Participación Ciudadana',
        description:
          'Estrategias para involucrar a los ciudadanos en la gestión del GAD y promover el desarrollo sostenible.',

        videos: [
          {
            id: 3,
            moduleId: 3,
            order_number: 1,
            title: 'Video 1: Participación Ciudadana y Sostenibilidad',
            description:
              'Mecanismos modernos para involucrar a la comunidad en la toma de decisiones del GAD.',
            url: 'dQw4w9WgXcQ',
            duration: 210,
          },
        ],
      },
    ],
  },
];

export const getCourseById = (courseId) =>
  COURSES.find((course) => course.id === Number(courseId)) || null;

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
      const video = module.videos.find(
        (item) => item.id === Number(videoId)
      );

      if (video) return video;
    }
  }

  return null;
};

export const getEvaluationById = (evaluationId) => {
  for (const course of COURSES) {
    for (const module of course.modules) {
      if (module.evaluation?.id === Number(evaluationId)) {
        return module.evaluation;
      }
    }
  }

  return null;
};

export const getEvaluationByCourseId = (courseId) => {
  const course = getCourseById(courseId);
  return course?.finalEvaluation || null;
};