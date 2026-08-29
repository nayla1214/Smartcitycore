import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import styles from './VideoPlayer.module.css';

const VideoPlayer = ({ ytVideoId, dbVideoId, videoDuration, onComplete, onProgress }) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!isMounted || !containerRef.current) return;

      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
        playerRef.current = null;
      }

      const div = document.createElement('div');
      div.id = `yt-player-${dbVideoId}`;
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(div);

      playerRef.current = new window.YT.Player(`yt-player-${dbVideoId}`, {
        videoId: ytVideoId,
        playerVars: {
          controls: 1,
          disablekb: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            if (!isMounted) return;
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
              if (!isMounted) return;
              syncProgress(false);
            }, 3000);
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            if (event.data === window.YT.PlayerState.ENDED) {
              syncProgress(true);
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              syncProgress(false);
            }
          }
        }
      });
    };

    const syncProgress = async (isEnded) => {
      if (!playerRef.current?.getCurrentTime) return;

      try {
        const currentTime = Math.floor(playerRef.current.getCurrentTime() || 0);
        const ytDuration = Math.floor(playerRef.current.getDuration?.() || videoDuration || 300);

        if (currentTime === 0 && !isEnded) return;

        const isLocalCompleted = isEnded || (ytDuration > 0 && (currentTime / ytDuration) >= 0.8);

        if (isLocalCompleted && !completed && isMounted) {
          setCompleted(true);
          if (onProgress) {
            onProgress(dbVideoId, { time_watched: currentTime, percentage: 100, is_completed: true });
          }
          if (onComplete) onComplete();
        }

        const res = await api.post('/videos/progress', {
          videoId: dbVideoId,
          current_time: currentTime,
          duration: ytDuration,
          isEnded: isEnded
        });

        if (isMounted && onProgress) {
          onProgress(dbVideoId, res);
        }

        if (res.is_completed && !completed && isMounted) {
          setCompleted(true);
          if (onComplete) onComplete();
        }
      } catch (err) {
        console.error('Error syncing video progress', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      if (!document.getElementById('yt-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      isMounted = false;
      clearInterval(intervalRef.current);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [ytVideoId, dbVideoId, videoDuration]);

  return (
    <div className={styles.videoContainer}>
      <div ref={containerRef} className={styles.iframe}></div>
      {completed && <div className={styles.completedBadge}>✓ Video Completado</div>}
    </div>
  );
};

export default VideoPlayer;
