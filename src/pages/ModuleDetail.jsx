import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { getModuleById, getModulesByCourse } from '../data/courseData';
import VideoPlayer from '../components/VideoPlayer';
import EvaluationForm from '../components/EvaluationForm';
import styles from './Module.module.css';

const ModuleDetail = () => {
  const { moduleId } = useParams();

  const [moduleData, setModuleData] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});
  const [evaluationPassed, setEvaluationPassed] = useState(false);
  const [nextModule, setNextModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setModuleData(null);
    setVideoProgress({});
    setEvaluationPassed(false);
    setNextModule(null);
    setLoading(true);

    fetchAll();
  }, [moduleId]);

  const fetchAll = async () => {
    try {
      let data = getModuleById(moduleId);

      if (!data) {
        try {
          data = await api.get(`/modules/${moduleId}`);
        } catch (e) {
          console.error('Module API error:', e);
        }
      }

      if (!data) {
        setLoading(false);
        return;
      }

      const videoList = data.videos || data.Videos || [];

      // Obtener progreso de todos los videos en paralelo de la API
      const progressEntries = await Promise.all(
        videoList.map(v =>
          api.get(`/videos/${v.id}/progress`)
            .then(p => [v.id, p])
            .catch(() => [v.id, { time_watched: 0, percentage: 0, is_completed: false }])
        )
      );
      const progressMap = Object.fromEntries(progressEntries);

      // Buscar siguiente módulo
      const allModules = getModulesByCourse(data.courseId);
      const currentIndex = allModules.findIndex(m => m.id === parseInt(moduleId));
      const next = currentIndex !== -1 && currentIndex < allModules.length - 1
        ? allModules[currentIndex + 1]
        : null;

      setModuleData(data);
      setVideoProgress(progressMap);
      setNextModule(next);
    } catch (error) {
      console.error('Error cargando módulo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoComplete = async (videoId) => {
    setVideoProgress(prev => ({
      ...prev,
      [videoId]: { time_watched: 9999, percentage: 100, is_completed: true }
    }));
    try {
      await api.get(`/videos/${videoId}/progress`);
    } catch (err) {}
  };

  const handleProgress = (videoId, progressData) => {
    setVideoProgress(prev => {
      const current = prev[videoId];
      const isDone = current?.is_completed || progressData?.is_completed;
      return {
        ...prev,
        [videoId]: {
          ...progressData,
          percentage: isDone ? 100 : Math.max(current?.percentage || 0, progressData?.percentage || 0),
          is_completed: isDone || false
        }
      };
    });
  };

  const [evalScore, setEvalScore] = useState(null);

  const handleEvaluationSuccess = (res) => {
    setEvaluationPassed(true);
    if (res?.percentage !== undefined) {
      setEvalScore(res.percentage);
    }
  };

  const videoList = moduleData?.videos || moduleData?.Videos || [];
  const allVideosCompleted = videoList.length > 0 && videoList.every(v => videoProgress[v.id]?.is_completed);

  const evaluationInfo = moduleData?.evaluation || moduleData?.Evaluation;

  if (loading) {
    return (
      <div className="container mt-4">
        <div className={styles.loadingBox}>
          <div className={styles.spinner}></div>
          <p>Cargando módulo...</p>
        </div>
      </div>
    );
  }

  if (!moduleData) return <div className="container mt-4">Módulo no encontrado</div>;

  return (
    <div className="container mt-4">
      <Link to={`/course/${moduleData.courseId}`} className={styles.backLink}>
        ← Volver al Curso
      </Link>

      <div className="card mt-2">
        <h1>{moduleData.title}</h1>
        <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>{moduleData.description}</p>

        {/* Videos */}
        <div className="mt-4">
          <h3>Videos del Módulo</h3>
          {videoList.length === 0 && <p className="mt-2">Este módulo no tiene videos.</p>}
          {videoList.map((video, idx) => {
            const prog = videoProgress[video.id];
            const currentPct = prog?.percentage ? Math.min(100, Math.round(prog.percentage)) : 0;

            return (
              <div key={video.id} className={styles.videoWrapper}>
                <div className={styles.videoHeader}>
                  <h4>{idx + 1}. {video.title}</h4>
                  <div className={styles.progressBadge}>
                    {prog?.is_completed ? (
                      <span className={styles.badgeSuccess}>✓ Completado</span>
                    ) : (
                      <>
                        <div className={styles.progressBarContainer}>
                          <div
                            className={styles.progressBarFill}
                            style={{ width: `${currentPct}%` }}
                          ></div>
                        </div>
                        <span className={styles.badgeWarning}>
                          {currentPct}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>
                  {video.description}
                </p>
                <VideoPlayer
                  key={`${moduleId}-${video.id}`}
                  ytVideoId={video.url}
                  dbVideoId={video.id}
                  videoDuration={video.duration}
                  onProgress={handleProgress}
                  onComplete={() => handleVideoComplete(video.id)}
                />
              </div>
            );
          })}
        </div>

        {/* Evaluación */}
        <div className={styles.evalSection}>
          <h3>Evaluación del Módulo</h3>

          {evaluationPassed ? (
            <div className={styles.successBox}>
              <div className={styles.successIcon}>🎉</div>
              <div style={{ flex: 1 }}>
                <strong>¡Evaluación aprobada {evalScore !== null ? `con ${evalScore.toFixed(0)}%` : ''}!</strong>
                <p>Has completado este módulo correctamente.</p>
              </div>
              {nextModule ? (
                <Link to={`/module/${nextModule.id}`} className="btn btn-primary" style={{ padding: '0.75rem 1.25rem', fontSize: '1rem' }}>
                  Avanzar al Siguiente Módulo ({nextModule.title}) →
                </Link>
              ) : (
                <Link to={`/course/${moduleData.courseId}`} className="btn btn-primary" style={{ padding: '0.75rem 1.25rem', fontSize: '1rem' }}>
                  Ir a Evaluación Final del Curso →
                </Link>
              )}
            </div>
          ) : !evaluationInfo ? (
            <p className="mt-2">Este módulo no tiene evaluación. Puedes continuar al siguiente.</p>
          ) : !allVideosCompleted ? (
            <div className={styles.warningBox}>
              <span>⚠️</span>
              <div>
                <strong>Debes ver todos los videos antes de la evaluación.</strong>
                <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
                  El sistema registra tu progreso real. Avanza la barra de video para completar.
                </p>
                <div className={styles.progressList}>
                  {videoList.map(v => (
                    <div key={v.id} className={styles.progressItem}>
                      <span>{v.title}</span>
                      {videoProgress[v.id]?.is_completed
                        ? <span className={styles.badgeSuccess}>✓</span>
                        : <span className={styles.badgePending}>{Math.min(100, Math.round(videoProgress[v.id]?.percentage || 0))}%</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <EvaluationForm
              evaluationId={evaluationInfo.id}
              courseId={moduleData.courseId}
              onSuccess={handleEvaluationSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;
