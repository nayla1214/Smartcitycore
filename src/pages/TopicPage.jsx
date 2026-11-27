import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import { api } from '../services/api';

import ComplementaryVideos from '../components/ComplementaryVideos';
import TopicDetail from './TopicDetail';

const TopicPage = () => {
  const {
    moduleId,
    topicNumber,
  } = useParams();

  const [state, setState] = useState({
    loading: true,
    error: '',
    module: null,
    topic: null,
  });

  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    setState({
      loading: true,
      error: '',
      module: null,
      topic: null,
    });

    const load = async () => {
      try {
        const [
          moduleData,
          topics,
        ] = await Promise.all([
          api.get(`/modules/${moduleId}`),
          api.get(
            `/modules/${moduleId}/topics`
          ),
        ]);

        if (!Array.isArray(topics)) {
          throw new Error(
            'No se pudieron consultar los datos del tema.'
          );
        }

        const topic = topics.find(
          (item) =>
            String(item.topicNumber) ===
            String(topicNumber)
        );

        if (!topic) {
          throw new Error(
            'El tema solicitado no está registrado en este módulo.'
          );
        }

        if (active) {
          setState({
            loading: false,
            error: '',
            module: moduleData,
            topic,
          });
        }
      } catch (requestError) {
        if (active) {
          setState({
            loading: false,
            error:
              requestError.message ||
              'No se pudo consultar el tema.',
            module: null,
            topic: null,
          });
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [moduleId, topicNumber, retry]);

  if (state.loading) {
    return (
      <div className="container mt-4">
        <p role="status">
          Consultando tema…
        </p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container mt-4">
        <p role="alert">{state.error}</p>

        <button
          type="button"
          className="btn btn-primary mt-2"
          onClick={() =>
            setRetry(
              (current) => current + 1
            )
          }
        >
          Reintentar
        </button>
      </div>
    );
  }

  const isMainCourse =
    Number(state.module.courseId) === 1;

  return (
    <>
      <section
        className="container mt-4"
        aria-labelledby="managed-topic-title"
      >
        <div className="card">
          <p
            style={{
              color: '#2459a4',
              fontSize: '0.875rem',
              fontWeight: 800,
              marginBottom: '0.5rem',
            }}
          >
            TEMA {state.topic.topicNumber}
          </p>

          <h1 id="managed-topic-title">
            {state.topic.title}
          </h1>

          {state.topic.introduction && (
            <div
              style={{
                marginTop: '1rem',
              }}
            >
              {isMainCourse
                ? 'Presentación del tutor'
                : 'Contenido del tema'}

              <p
                style={{
                  marginTop: '0.75rem',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                {state.topic.introduction}
              </p>
            </div>
          )}
        </div>
      </section>

      <ComplementaryVideos
        key={`${moduleId}-${topicNumber}-complementary`}
        moduleId={moduleId}
        topicNumber={state.topic.topicNumber}
      />

      {isMainCourse ? (
        <TopicDetail
          key={`${moduleId}-${topicNumber}`}
        />
      ) : (
        <section className="container mt-4">
          <div className="card">
            <p>
              Este tema contiene material de lectura.
              Los videos obligatorios y las actividades
              se incorporarán posteriormente.
            </p>

            <Link
              to={
                `/course/${state.module.courseId}`
              }
              className="btn btn-primary mt-2"
            >
              Volver al curso
            </Link>
          </div>
        </section>
      )}
    </>
  );
};

export default TopicPage;