import {
  useEffect,
  useRef,
  useState,
} from 'react';

const STORAGE_KEY = 'smartcity-accessibility';

const DEFAULT_SETTINGS = {
  textSize: 'normal',
  highContrast: false,
  reduceMotion: false,
};

const readSettings = () => {
  try {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || 'null'
    );

    return {
      textSize: ['normal', 'large', 'larger'].includes(
        stored?.textSize
      )
        ? stored.textSize
        : 'normal',
      highContrast: stored?.highContrast === true,
      reduceMotion: stored?.reduceMotion === true,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

// Divide textos largos en fragmentos para su lectura.
const splitText = (text) => {
  const words = text.trim().split(/\s+/);
  const chunks = [];
  let current = '';

  words.forEach((word) => {
    if (
      current &&
      `${current} ${word}`.length > 240
    ) {
      chunks.push(current);
      current = word;
    } else {
      current = current
        ? `${current} ${word}`
        : word;
    }
  });

  if (current) chunks.push(current);

  return chunks;
};

const AccessibilityPanel = () => {
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);

  const selectedTextRef = useRef('');
  const utteranceRef = useRef(null);
  const readingSessionRef = useRef(0);

  const [settings, setSettings] = useState(readSettings);
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const [selectedText, setSelectedText] = useState('');
  const [readingStatus, setReadingStatus] = useState('idle');
  const [readingMessage, setReadingMessage] = useState('');
  const [readingError, setReadingError] = useState('');
  const [speed, setSpeed] = useState(1);

  const speechSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;

  const readingActive =
    readingStatus === 'reading' ||
    readingStatus === 'paused';

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.a11yText = settings.textSize;

    root.classList.toggle(
      'a11y-high-contrast',
      settings.highContrast
    );

    root.classList.toggle(
      'a11y-reduce-motion',
      settings.reduceMotion
    );

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch {
      // Los ajustes funcionan aunque no puedan guardarse.
    }
  }, [settings]);

  // Conserva la selección cuando se abre el panel.
  useEffect(() => {
    const rememberSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || !selection?.anchorNode) return;

      const content = document.querySelector(
        '[data-accessibility-content]'
      );

      if (
        !content?.contains(selection.anchorNode) ||
        !selection.focusNode ||
        !content.contains(selection.focusNode)
      ) {
        return;
      }

      selectedTextRef.current = text;
      setSelectedText(text);
    };

    document.addEventListener(
      'selectionchange',
      rememberSelection
    );

    return () => {
      document.removeEventListener(
        'selectionchange',
        rememberSelection
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      readingSessionRef.current += 1;

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      utteranceRef.current = null;
    };
  }, []);

  const updateSetting = (name, value, message) => {
    setSettings((current) => ({
      ...current,
      [name]: value,
    }));

    setAnnouncement(message);
  };

  const openPanel = () => {
    const dialog = dialogRef.current;

    if (!dialog || dialog.open) return;

    dialog.showModal();
    setOpen(true);
  };

  const closePanel = () => {
    dialogRef.current?.close();
  };

  const handleClose = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const resetSettings = () => {
    setSettings({ ...DEFAULT_SETTINGS });
    setAnnouncement(
      'Se restablecieron los ajustes de accesibilidad.'
    );
  };

  const stopReading = () => {
    readingSessionRef.current += 1;

    if (speechSupported) {
      window.speechSynthesis.cancel();
    }

    utteranceRef.current = null;
    setReadingStatus('idle');
    setReadingMessage('Lectura detenida.');
  };

  const startReading = (text, source) => {
    setReadingError('');

    if (!speechSupported) {
      setReadingError(
        'La lectura en voz alta no está disponible en este navegador.'
      );
      return;
    }

    if (!text?.trim()) {
      setReadingError(
        source === 'selection'
          ? 'Primero selecciona un texto de la página y vuelve a abrir Accesibilidad.'
          : 'No se encontró texto para leer en esta página.'
      );
      return;
    }

    const synthesizer = window.speechSynthesis;
    const chunks = splitText(text);

    readingSessionRef.current += 1;
    const session = readingSessionRef.current;

    synthesizer.cancel();

    const voices = synthesizer.getVoices();

    const spanishVoice =
      voices.find(
        (voice) =>
          voice.lang.toLowerCase() === 'es-ec'
      ) ||
      voices.find(
        (voice) =>
          voice.lang.toLowerCase().startsWith('es')
      );

    setReadingStatus('reading');
    setReadingMessage(
      source === 'selection'
        ? 'Leyendo el texto seleccionado.'
        : 'Leyendo el contenido de la página.'
    );

    const readChunk = (index) => {
      if (session !== readingSessionRef.current) return;

      if (index >= chunks.length) {
        utteranceRef.current = null;
        setReadingStatus('idle');
        setReadingMessage('Lectura finalizada.');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(
        chunks[index]
      );

      utterance.lang = spanishVoice?.lang || 'es-ES';
      utterance.rate = speed;
      utterance.pitch = 1;
      utterance.volume = 1;

      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      utterance.onend = () => {
        readChunk(index + 1);
      };

      utterance.onerror = (event) => {
        if (session !== readingSessionRef.current) return;

        if (
          event.error === 'canceled' ||
          event.error === 'interrupted'
        ) {
          return;
        }

        readingSessionRef.current += 1;
        synthesizer.cancel();

        utteranceRef.current = null;
        setReadingStatus('idle');
        setReadingMessage('');
        setReadingError(
          'No se pudo reproducir la lectura. Comprueba el sonido del dispositivo e inténtalo nuevamente.'
        );
      };

      utteranceRef.current = utterance;
      synthesizer.speak(utterance);
    };

    readChunk(0);
  };

  const readPage = () => {
    const content = document.getElementById(
      'main-content'
    );

    startReading(content?.innerText || '', 'page');
  };

  const pauseReading = () => {
    if (!speechSupported || readingStatus !== 'reading') {
      return;
    }

    window.speechSynthesis.pause();
    setReadingStatus('paused');
    setReadingMessage('Lectura pausada.');
  };

  const resumeReading = () => {
    if (!speechSupported || readingStatus !== 'paused') {
      return;
    }

    window.speechSynthesis.resume();
    setReadingStatus('reading');
    setReadingMessage('Lectura reanudada.');
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="accessibility-trigger"
        onClick={openPanel}
        aria-haspopup="dialog"
        aria-controls="accessibility-dialog"
        aria-expanded={open}
      >
        <svg
          viewBox="0 0 24 24"
          width="23"
          height="23"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="4" r="2" />
          <path d="M4 8l8 2 8-2M12 10v5M12 15l-4 7M12 15l4 7" />
        </svg>

        <span>Accesibilidad</span>
      </button>

      <dialog
        ref={dialogRef}
        id="accessibility-dialog"
        className="accessibility-dialog"
        aria-labelledby="accessibility-title"
        aria-describedby="accessibility-description"
        onClose={handleClose}
        onCancel={() => setOpen(false)}
      >
        <div className="accessibility-header">
          <div>
            <span className="accessibility-eyebrow">
              PERSONALIZA TU EXPERIENCIA
            </span>

            <h2 id="accessibility-title">
              Accesibilidad
            </h2>
          </div>

          <button
            type="button"
            className="accessibility-close"
            onClick={closePanel}
            aria-label="Cerrar ajustes de accesibilidad"
            autoFocus
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <p
          id="accessibility-description"
          className="accessibility-description"
        >
          Ajusta la presentación de la plataforma
          o escucha su contenido.
          Tus preferencias visuales se guardan en
          este navegador.
        </p>

        {/* Lectura en voz alta */}

        <section
          className="accessibility-reading"
          aria-labelledby="reading-title"
        >
          <h3 id="reading-title">
            Lectura en voz alta
          </h3>

          {speechSupported ? (
            <>
              <p>
                Selecciona un texto antes de abrir
                este panel para escucharlo. También
                puedes escuchar el contenido de la página.
              </p>

              <div className="accessibility-reading-buttons">
                <button
                  type="button"
                  className="accessibility-done"
                  disabled={!selectedText}
                  onClick={() =>
                    startReading(
                      selectedTextRef.current,
                      'selection'
                    )
                  }
                  aria-describedby="selected-text-info"
                >
                  Escuchar selección
                </button>

                <button
                  type="button"
                  className="accessibility-reset"
                  onClick={readPage}
                >
                  Escuchar página
                </button>
              </div>

              <p
                id="selected-text-info"
                className="accessibility-selection-info"
              >
                {selectedText
                  ? `Texto guardado: ${selectedText.length} caracteres.`
                  : 'Todavía no has seleccionado un texto.'}
              </p>

              <label
                className="accessibility-speed"
                htmlFor="reading-speed"
              >
                <span>Velocidad de lectura</span>

                <select
                  id="reading-speed"
                  value={speed}
                  disabled={readingActive}
                  onChange={(event) =>
                    setSpeed(Number(event.target.value))
                  }
                >
                  <option value={0.75}>
                    Lenta
                  </option>

                  <option value={1}>
                    Normal
                  </option>

                  <option value={1.25}>
                    Rápida
                  </option>
                </select>
              </label>

              <div className="accessibility-reading-buttons">
                {readingStatus === 'paused' ? (
                  <button
                    type="button"
                    className="accessibility-reset"
                    onClick={resumeReading}
                  >
                    Continuar lectura
                  </button>
                ) : (
                  <button
                    type="button"
                    className="accessibility-reset"
                    onClick={pauseReading}
                    disabled={readingStatus !== 'reading'}
                  >
                    Pausar
                  </button>
                )}

                <button
                  type="button"
                  className="accessibility-reset"
                  onClick={stopReading}
                  disabled={!readingActive}
                >
                  Detener
                </button>
              </div>

              <p
                className="accessibility-reading-status"
                role="status"
                aria-live="polite"
              >
                {readingMessage}
              </p>

              {readingError && (
                <p
                  className="accessibility-reading-error"
                  role="alert"
                >
                  {readingError}
                </p>
              )}

              <p className="accessibility-selection-info">
                La voz depende de las voces instaladas
                en tu dispositivo. La lectura no reproduce
                el audio de videos ni de documentos externos.
              </p>
            </>
          ) : (
            <p role="status">
              Este navegador no dispone de lectura
              en voz alta. Puedes utilizar el lector
              de pantalla de tu dispositivo.
            </p>
          )}
        </section>

        {/* Tamaño de texto */}

        <fieldset className="accessibility-group">
          <legend>Tamaño del texto</legend>

          <div className="accessibility-text-options">
            {[
              { value: 'normal', label: 'Normal' },
              { value: 'large', label: 'Grande' },
              { value: 'larger', label: 'Muy grande' },
            ].map((option) => (
              <label
                key={option.value}
                className="accessibility-radio"
              >
                <input
                  type="radio"
                  name="accessibility-text-size"
                  value={option.value}
                  checked={
                    settings.textSize === option.value
                  }
                  onChange={() =>
                    updateSetting(
                      'textSize',
                      option.value,
                      `Tamaño de texto: ${option.label}.`
                    )
                  }
                />

                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="accessibility-toggle">
          <span>
            <strong>Alto contraste</strong>

            <small>
              Fondo oscuro, texto claro y enlaces
              destacados.
            </small>
          </span>

          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(event) =>
              updateSetting(
                'highContrast',
                event.target.checked,
                event.target.checked
                  ? 'Alto contraste activado.'
                  : 'Alto contraste desactivado.'
              )
            }
          />
        </label>

        <label className="accessibility-toggle">
          <span>
            <strong>Reducir animaciones</strong>

            <small>
              Reduce los movimientos y las transiciones
              de la interfaz.
            </small>
          </span>

          <input
            type="checkbox"
            checked={settings.reduceMotion}
            onChange={(event) =>
              updateSetting(
                'reduceMotion',
                event.target.checked,
                event.target.checked
                  ? 'Reducción de animaciones activada.'
                  : 'Reducción de animaciones desactivada.'
              )
            }
          />
        </label>

        <p className="accessibility-help">
          Puedes navegar con Tab y Mayús + Tab.
          Presiona Escape para cerrar este panel.
          La lectura continúa al cerrarlo; vuelve
          a abrirlo para pausarla o detenerla.
        </p>

        <div className="accessibility-actions">
          <button
            type="button"
            className="accessibility-reset"
            onClick={resetSettings}
          >
            Restablecer ajustes
          </button>

          <button
            type="button"
            className="accessibility-done"
            onClick={closePanel}
          >
            Listo
          </button>
        </div>

        <p
          className="accessibility-sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {announcement}
        </p>
      </dialog>
    </>
  );
};

export default AccessibilityPanel;