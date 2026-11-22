const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]
  );

export const buildCertificateExample = (
  name = 'Nombre del participante'
) => {
  const participant = escapeHtml(
    name.trim() || 'Nombre del participante'
  );

  const date = new Date().toLocaleDateString(
    'es-EC',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Guayaquil',
    }
  );

  return `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    >

    <title>Ejemplo de certificado SMARTCITYCORE</title>

    <style>
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #eaf0f7;
        color: #15233b;
        font-family: Arial, Helvetica, sans-serif;
      }

      .toolbar {
        max-width: 1123px;
        margin: 20px auto;
        padding: 0 18px;

        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;

        font-size: 13px;
        line-height: 1.5;
      }

      .toolbar button {
        padding: 13px 18px;

        border: none;
        border-radius: 9px;
        background: #2563eb;
        color: #ffffff;

        font: inherit;
        font-weight: 700;

        cursor: pointer;
      }

      .preview {
        overflow: auto;
        padding: 0 20px 24px;
      }

      .certificate {
        position: relative;
        isolation: isolate;

        width: 297mm;
        height: 210mm;
        margin: 0 auto;
        padding: 18mm 21mm;

        display: flex;
        flex-direction: column;

        overflow: hidden;
        background: #ffffff;
        box-shadow: 0 10px 35px #15233b16;
      }

      .certificate::before {
        position: absolute;
        inset: 8mm;
        z-index: -1;

        border: 1px solid #cbd8eb;

        content: '';
        pointer-events: none;
      }

      .stripe {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;

        width: 7mm;
        background: #163d7c;
      }

      .corner {
        position: absolute;
        top: 0;
        right: 0;
        z-index: -1;

        width: 65mm;
        height: 26mm;

        background: #edf5f3;
        clip-path: polygon(
          30% 0,
          100% 0,
          100% 100%
        );
      }

      .watermark {
        position: absolute;
        top: 99mm;
        right: 0;
        left: 0;
        z-index: -1;

        transform: rotate(-22deg);

        color: rgba(37, 99, 235, 0.055);
        font-size: 100px;
        font-weight: 800;
        letter-spacing: 12px;
        text-align: center;
      }

      .heading {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 20px;
      }

      .brand {
        color: #163d7c;
        font-size: 22px;
        font-weight: 800;
        letter-spacing: 2px;
      }

      .brand small {
        display: block;
        margin-top: 7px;

        color: #667b94;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 1.2px;
      }

      .institution {
        color: #415773;
        font-size: 11px;
        font-weight: 700;
        line-height: 1.6;
        text-align: right;
      }

      .sample {
        display: inline-block;
        margin-top: 10px;
        padding: 5px 10px;

        border: 1px solid #cfdbed;
        border-radius: 20px;

        color: #526b8d;
        font-size: 9px;
        letter-spacing: 1px;
      }

      .content {
        flex: 1;
        padding-top: 12mm;
        text-align: center;
      }

      .eyebrow {
        color: #168467;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 4px;
      }

      h1 {
        margin: 4mm 0 0;

        color: #163d7c;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 43px;
        letter-spacing: 4px;
      }

      .subtitle {
        margin-top: 2mm;

        color: #6e829d;
        font-size: 11px;
        letter-spacing: 5px;
      }

      .rule {
        width: 52mm;
        height: 2px;
        margin: 6mm auto;

        background: #168467;
      }

      .grant {
        margin: 0;

        color: #667b94;
        font-size: 13px;
      }

      .name {
        max-width: 242mm;
        margin: 4mm auto 3mm;

        color: #15233b;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 29px;
        font-weight: 700;
        line-height: 1.3;
        overflow-wrap: anywhere;
      }

      .description {
        max-width: 210mm;
        margin: 0 auto;

        color: #52657d;
        font-size: 13px;
        line-height: 1.8;
      }

      .course {
        margin: 3mm 0 4mm;

        color: #163d7c;
        font-size: 20px;
        font-weight: 700;
      }

      .details {
        margin-top: 5mm;

        display: flex;
        justify-content: center;
        gap: 8mm;

        color: #52657d;
        font-size: 10px;
      }

      .details strong {
        color: #163d7c;
      }

      .signatures {
        margin-top: 7mm;

        display: flex;
        justify-content: space-around;
        gap: 20mm;

        text-align: center;
      }

      .signature {
        width: 67mm;
        padding-top: 3mm;

        border-top: 1px solid #8296b0;

        color: #415773;
        font-size: 10px;
      }

      .signature span {
        display: block;
        margin-top: 5px;

        color: #8290a3;
        font-size: 9px;
      }

      .footnote {
        margin: 6mm 0 0;

        color: #8290a3;
        font-size: 9px;
        line-height: 1.5;
        text-align: center;
      }

      @page {
        size: A4 landscape;
        margin: 0;
      }

      @media print {
        body {
          background: #ffffff;
        }

        .toolbar {
          display: none;
        }

        .preview {
          padding: 0;
          overflow: visible;
        }

        .certificate {
          margin: 0;
          box-shadow: none;

          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }

      @media screen and (max-width: 700px) {
        .toolbar {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    </style>
  </head>

  <body>
    <div class="toolbar">
      <span>
        <strong>Certificado de ejemplo.</strong>
        Para obtener el PDF, selecciona
        «Guardar como PDF» en la ventana de impresión.
      </span>

      <button
        type="button"
        onclick="window.print()"
      >
        Imprimir / Guardar PDF
      </button>
    </div>

    <div class="preview">
      <main
        class="certificate"
        aria-label="Ejemplo de certificado"
      >
        <div class="stripe"></div>
        <div class="corner"></div>

        <div
          class="watermark"
          aria-hidden="true"
        >
          EJEMPLO
        </div>

        <header class="heading">
          <div class="brand">
            SMARTCITYCORE

            <small>
              RECURSOS EDUCATIVOS · CIUDADES INTELIGENTES
            </small>
          </div>

          <div class="institution">
            UNIVERSIDAD ESTATAL DEL SUR DE MANABÍ
            <br>
            UNESUM
            <br>

            <span class="sample">
              MODELO DE DISEÑO · SIN VALIDEZ
            </span>
          </div>
        </header>

        <section class="content">
          <div class="eyebrow">
            FORMACIÓN Y APRENDIZAJE
          </div>

          <h1>CERTIFICADO</h1>

          <div class="subtitle">
            DE APROBACIÓN
          </div>

          <div class="rule"></div>

          <p class="grant">
            Se otorga el presente certificado a
          </p>

          <div class="name">
            ${participant}
          </div>

          <p class="description">
            Por haber aprobado el curso
          </p>

          <h2 class="course">
            Introducción a Ciudades Inteligentes
          </h2>

          <p class="description">
            Desarrollado en el marco del proyecto
            SMARTCITYCORE – UNESUM,
            <br>
            con contenidos de infraestructura sostenible,
            movilidad, inteligencia artificial y servicios urbanos.
          </p>

          <div class="details">
            <span>
              Nota final:
              <strong>por definir</strong>
            </span>

            <span>
              Fecha del ejemplo:
              <strong>${escapeHtml(date)}</strong>
            </span>
          </div>
        </section>

        <footer>
          <div class="signatures">
            <div class="signature">
              Coordinación del proyecto

              <span>
                Espacio para firma autorizada
              </span>
            </div>

            <div class="signature">
              Responsable de capacitación

              <span>
                Espacio para firma autorizada
              </span>
            </div>
          </div>

          <p class="footnote">
            EJEMPLO DE DISEÑO.
            No acredita aprobación ni constituye un certificado emitido.
            <br>
            Las firmas, la nota final y los datos de emisión
            se incorporarán en la versión definitiva.
          </p>
        </footer>
      </main>
    </div>
  </body>
</html>
`;
};

export const openCertificateExample = (
  name,
  { print = false } = {}
) => {
  const preview = window.open('', '_blank');

  if (!preview) {
    throw new Error(
      'Permite las ventanas emergentes para abrir el certificado de ejemplo.'
    );
  }

  preview.opener = null;

  if (print) {
    preview.addEventListener(
      'load',
      () => {
        preview.focus();
        preview.print();
      },
      {
        once: true,
      }
    );
  }

  preview.document.open();

  preview.document.write(
    buildCertificateExample(name)
  );

  preview.document.close();
  preview.focus();
};