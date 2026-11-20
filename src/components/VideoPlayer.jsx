import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import styles from './VideoPlayer.module.css';

let youtubeApiPromise = null;

const loadYouTubeApi = () => {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      try {
        previousReady?.();
      } catch (error) {
        console.error(
          'Error en el inicializador anterior de YouTube:',
          error
        );
      }

      resolve(window.YT);
    };

    let script = document.getElementById('yt-api-script');

    if (!script) {
      script = document.createElement('script');
      script.id = 'yt-api-script';
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }

    script.addEventListener(
      'error',
      () => {
        youtubeApiPromise = null;

        reject(
          new Error('No se pudo cargar el reproductor de YouTube.')
        );
      },
      { once: true }
    );
  });

  return youtubeApiPromise;
};

const VideoPlayer = ({
  ytVideoId,
  dbVideoId,
  videoDuration,
  onComplete,
  onProgress,
}) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const callbacksRef = useRef({
    onComplete,
    onProgress,
  });

  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    callbacksRef.current = {
      onComplete,
      onProgress,
    };
  }, [onComplete, onProgress]);

  useEffect(() => {
    let active = true;
    let player = null;
    let interval = null;

    let ready = false;
    let requestRunning = false;
    let pendingEnded = false;
    let completedLocally = false;
    let completionNotified = false;
    let lastSavedPosition = 0;

    setCompleted(false);
    setMessage('');
    setLoading(true);

    const reportProgress = (progress) => {
      if (!active) return;

      lastSavedPosition = Math.max(
        lastSavedPosition,
        Number(progress?.time_watched) || 0
      );

      if (progress?.is_completed === true) {
        completedLocally = true;
        setCompleted(true);
        setMessage('');

        clearInterval(interval);
        interval = null;
      }

      try {
        callbacksRef.current.onProgress?.(
          dbVideoId,
          progress
        );
      } catch (error) {
        console.error(
          'Error notificando el avance del video:',
          error
        );
      }

      if (
        progress?.is_completed === true &&
        !completionNotified
      ) {
        completionNotified = true;

        try {
          const callbackResult =
            callbacksRef.current.onComplete?.();

          Promise.resolve(callbackResult).catch((error) => {
            console.error(
              'Error notificando la finalización:',
              error
            );
          });
        } catch (error) {
          console.error(
            'Error notificando la finalización:',
            error
          );
        }
      }
    };

    const restoreSavedPosition = (text) => {
      if (!active || !ready || !player) return;

      pendingEnded = false;

      try {
        player.pauseVideo();

        // Retrocedemos un segundo para retomar desde
        // una posición que el servidor ya verificó.
        player.seekTo(
          Math.max(0, lastSavedPosition - 1),
          true
        );
      } catch (error) {
        console.error(
          'No se pudo recuperar la posición guardada:',
          error
        );
      }

      setMessage(text);
    };

    const syncProgress = async (isEnded = false) => {
      if (
        !active ||
        !ready ||
        !player ||
        completedLocally
      ) {
        return;
      }

      // Si termina mientras se guarda un avance,
      // enviamos la finalización después.
      if (requestRunning) {
        if (isEnded) {
          pendingEnded = true;
        }

        return;
      }

      const state = player.getPlayerState();

      // No actualizamos periódicamente mientras
      // el video está pausado o cargando.
      if (
        !isEnded &&
        state !== window.YT.PlayerState.PLAYING
      ) {
        return;
      }

      const actualDuration = Number(
        player.getDuration?.()
      );

      const duration =
        Number.isFinite(actualDuration) && actualDuration > 0
          ? actualDuration
          : Number(videoDuration);

      const currentTime = Number(
        player.getCurrentTime?.()
      );

      if (
        !Number.isFinite(duration) ||
        duration <= 0 ||
        !Number.isFinite(currentTime) ||
        currentTime < 0
      ) {
        return;
      }

      requestRunning = true;

      try {
        const progress = await api.post('/videos/progress', {
          videoId: Number(dbVideoId),
          current_time: Math.min(currentTime, duration),
          duration,
          isEnded,
        });

        if (!active) return;

        reportProgress(progress);

        if (progress?.is_completed === true) {
          return;
        }

        const verifiedPosition =
          Number(progress?.time_watched) || 0;

        // El controlador devuelve el avance anterior
        // cuando rechaza un salto. Recuperamos ese punto
        // para que el progreso no quede atascado.
        if (currentTime > verifiedPosition + 2) {
          restoreSavedPosition(
            'El último tramo no quedó verificado. Retomamos desde tu avance guardado; presiona reproducir para continuar. Adelantar el video no cuenta como tiempo visto.'
          );
        } else if (isEnded) {
          setMessage(
            'El servidor todavía no confirmó la finalización. Puedes presionar “Comprobar finalización” para volver a intentarlo.'
          );
        }
      } catch (error) {
        console.error(
          'Error guardando el avance del video:',
          error
        );

        if (active) {
          restoreSavedPosition(
            'No se pudo guardar el avance. Retomamos desde la última posición confirmada. Comprueba tu conexión y presiona reproducir para continuar.'
          );
        }
      } finally {
        requestRunning = false;

        if (
          active &&
          pendingEnded &&
          !completedLocally
        ) {
          pendingEnded = false;
          void syncProgress(true);
        }
      }
    };

    const initialize = async () => {
      try {
        if (!ytVideoId || !dbVideoId) {
          throw new Error(
            'Faltan los datos necesarios para cargar el video.'
          );
        }

        // Primero recuperamos el avance del servidor.
        const savedProgress = await api.get(
          `/videos/${dbVideoId}/progress`
        );

        if (!active) return;

        reportProgress(savedProgress);

        const YT = await loadYouTubeApi();

        if (!active || !containerRef.current) return;

        const mount = document.createElement('div');

        containerRef.current.replaceChildren(mount);

        player = new YT.Player(mount, {
          videoId: ytVideoId,
          playerVars: {
            controls: 1,
            fs: 1,
            disablekb: 0,
            rel: 0,
            iv_load_policy: 3,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (!active) return;

              ready = true;
              setLoading(false);

              if (
                !completedLocally &&
                lastSavedPosition > 0
              ) {
                event.target.seekTo(
                  Math.max(0, lastSavedPosition - 1),
                  true
                );
              }

              if (!completedLocally) {
                interval = window.setInterval(() => {
                  if (!active || !ready) return;

                  const state = player.getPlayerState();

                  if (state === YT.PlayerState.PLAYING) {
                    void syncProgress(false);
                  } else if (
                    state === YT.PlayerState.ENDED
                  ) {
                    // Reintenta si la primera petición final
                    // no pudo confirmar la finalización.
                    void syncProgress(true);
                  }
                }, 3000);
              }
            },

            onStateChange: (event) => {
              if (
                !active ||
                !ready ||
                completedLocally
              ) {
                return;
              }

              if (event.data === YT.PlayerState.ENDED) {
                void syncProgress(true);
              } else if (
                event.data === YT.PlayerState.PLAYING
              ) {
                setMessage('');
                void syncProgress(false);
              }
            },

            onError: (event) => {
              if (!active) return;

              setLoading(false);
              setMessage(
                `YouTube no pudo reproducir el video. Código: ${event.data}. Puedes volver a cargar el reproductor.`
              );
            },
          },
        });

        playerRef.current = player;
      } catch (error) {
        console.error(
          'Error inicializando el reproductor:',
          error
        );

        if (active) {
          setLoading(false);
          setMessage(
            error.message ||
              'No se pudo cargar el video y tu avance.'
          );
        }
      }
    };

    initialize();

    return () => {
      active = false;
      ready = false;
      pendingEnded = false;

      clearInterval(interval);

      if (player) {
        try {
          player.destroy();
        } catch (error) {
          console.error(
            'Error cerrando el reproductor:',
            error
          );
        }
      }

      if (playerRef.current === player) {
        playerRef.current = null;
      }
    };
  }, [ytVideoId, dbVideoId, videoDuration, retry]);

  const checkCompletion = async () => {
    try {
      const progress = await api.get(
        `/videos/${dbVideoId}/progress`
      );

      if (progress?.is_completed === true) {
        // Al recargar se recupera el estado confirmado
        // y se notifican los callbacks desde el efecto.
        setRetry((value) => value + 1);
      } else {
        setMessage(
          'El video todavía no figura como completado. Si está detenido al final, espera unos segundos. Si falta un tramo verificado, vuelve a cargar para retomarlo.'
        );
      }
    } catch (error) {
      setMessage(
        error.message ||
          'No se pudo consultar la finalización del video.'
      );
    }
  };

  return (
    <div className={styles.videoContainer}>
      <div
        ref={containerRef}
        className={styles.iframe}
      />

      {loading && (
        <p role="status">
          Cargando el video y tu avance...
        </p>
      )}

      {completed && (
        <div className={styles.completedBadge}>
          ✓ Video completado
        </div>
      )}

      {message && (
        <div
          role="status"
          style={{
            padding: '0.85rem',
            background: '#fff8e6',
            color: '#754c12',
          }}
        >
          <p>{message}</p>

          <button
            type="button"
            onClick={checkCompletion}
            style={{ marginRight: '0.75rem' }}
          >
            Comprobar finalización
          </button>

          <button
            type="button"
            onClick={() =>
              setRetry((value) => value + 1)
            }
          >
            Volver a cargar
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;