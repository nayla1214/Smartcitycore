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

const PROJECT_NAME =
  'Plataforma web de urbanismo inteligente para el fortalecimiento de servicios tecnológicos aplicado a municipios del sur de Manabí, fase III';

export const buildCertificateExample = (
  name = 'Nombre del participante',
  {
    courseName = 'Ciudades Inteligentes y Gobierno Digital',
    finalScore = null,
  } = {}
) => {
  const participant = escapeHtml(
    String(name || '').trim() || 'Nombre del participante'
  );

  // finalScore debe recibirse expresamente en escala de 0 a 10.
  const numericScore =
    finalScore === null ||
    finalScore === undefined ||
    String(finalScore).trim() === ''
      ? null
      : Number(finalScore);

  const validScore =
    numericScore !== null &&
    Number.isFinite(numericScore) &&
    numericScore >= 0 &&
    numericScore <= 10;

  const score = validScore
    ? `${numericScore.toLocaleString('es-EC', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}/10`
    : 'Pendiente de registro';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >
  <title>Vista previa del certificado</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #e9eef5;
      color: #18304f;
      font-family: Arial, Helvetica, sans-serif;
    }

    .toolbar {
      max-width: 1123px;
      margin: 20px auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      font-size: 13px;
      line-height: 1.6;
    }

    .toolbar p {
      margin: 0;
    }

    .toolbar button {
      min-height: 44px;
      padding: 12px 20px;
      flex-shrink: 0;
      border: none;
      border-radius: 10px;
      background: #17345c;
      color: white;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    .toolbar button:focus-visible {
      outline: 3px solid #2563eb;
      outline-offset: 4px;
    }

    .preview {
      padding: 0 20px 30px;
      overflow: auto;
    }

    .certificate {
      position: relative;
      width: 297mm;
      height: 210mm;
      margin: 0 auto;
      padding: 17mm 25mm 13mm;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 15px 45px #17345c20;
    }

    .frame {
      position: absolute;
      inset: 8mm;
      border: 1px solid #d9bd77;
      pointer-events: none;
    }

    .decoration {
      position: absolute;
      width: 100mm;
      height: 65mm;
      pointer-events: none;
    }

    .top-decoration {
      top: 0;
      right: 0;
    }

    .bottom-decoration {
      bottom: 0;
      left: 0;
      transform: rotate(180deg);
    }

    .heading,
    .content,
    .footer {
      position: relative;
      z-index: 1;
    }

    .heading {
      min-height: 17mm;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20mm;
    }

    .brand {
      color: #17345c;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 2px;
    }

    .brand small {
      display: block;
      margin-top: 6px;
      color: #77633c;
      font-size: 8px;
      font-weight: 600;
      letter-spacing: 2px;
    }

    .institution {
      max-width: 65mm;
      margin-right: 18mm;
      color: #40516a;
      font-size: 9px;
      line-height: 1.6;
      text-align: right;
    }

    .content {
      flex: 1;
      padding-top: 7mm;
      text-align: center;
    }

    .eyebrow {
      margin: 0 0 3mm;
      color: #8c6a28;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 4px;
    }

    h1 {
      margin: 0;
      color: #17345c;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 49px;
      font-weight: 400;
      letter-spacing: 5px;
    }

    .subtitle {
      margin: 2mm 0 0;
      color: #8c6a28;
      font-size: 12px;
      letter-spacing: 6px;
    }

    .ornament {
      width: 52mm;
      height: 1px;
      margin: 5mm auto;
      background: #c49a46;
    }

    .grant {
      margin: 0;
      color: #667287;
      font-size: 13px;
    }

    .name {
      max-width: 235mm;
      margin: 4mm auto;
      color: #17345c;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 34px;
      font-style: italic;
      font-weight: 400;
      line-height: 1.25;
      overflow-wrap: anywhere;
    }

    .description {
      margin: 0 auto;
      color: #526178;
      font-size: 13px;
      line-height: 1.7;
    }

    .course {
      max-width: 220mm;
      margin: 3mm auto 4mm;
      color: #17345c;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .project {
      max-width: 205mm;
      margin: 0 auto;
      color: #526178;
      font-size: 12px;
      line-height: 1.8;
    }

    .project strong {
      color: #34465f;
      font-weight: 600;
    }

    .grade {
      margin: 5mm auto 0;
      display: inline-block;
      padding: 9px 22px;
      border: 1px solid #e6d7b3;
      border-radius: 5px;
      background: #fcf9f1;
      color: #5a5140;
      font-size: 12px;
    }

    .grade strong {
      margin-left: 6px;
      color: #17345c;
      font-size: 16px;
    }

    .footer {
      padding-top: 5mm;
      text-align: center;
    }

    .signature {
      width: 90mm;
      margin: 0 auto;
    }

    .signature-space {
      height: 13mm;
    }

    .signature-line {
      width: 75mm;
      height: 1px;
      margin: 0 auto 3mm;
      background: #8b98a8;
    }

    .signature strong {
      display: block;
      color: #17345c;
      font-size: 14px;
    }

    .signature span {
      display: block;
      margin-top: 5px;
      color: #647187;
      font-size: 11px;
    }

    .sample-note {
      margin: 6mm 0 0;
      color: #6b7280;
      font-size: 8px;
      letter-spacing: .5px;
      line-height: 1.5;
    }

    @page {
      size: A4 landscape;
      margin: 0;
    }

    @media print {
      body {
        background: #fff;
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
    <p>
      <strong>Vista previa del diseño.</strong><br>
      Para descargarlo, selecciona «Guardar como PDF»
      en la ventana de impresión.
    </p>

    <button type="button" onclick="window.print()">
      Imprimir / Guardar PDF
    </button>
  </div>

  <div class="preview">
    <main
      class="certificate"
      aria-label="Modelo de certificado de aprobación"
    >
      <div class="frame" aria-hidden="true"></div>

      <svg
        class="decoration top-decoration"
        viewBox="0 0 400 250"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 0H400V250C310 220 250 115 170 65S60 15 0 0Z"
          fill="#17345c"
        />
        <path
          d="M65 0H400V180C295 146 230 60 65 0Z"
          fill="#294878"
        />
        <path
          d="M0 0H35C190 45 250 170 400 220V234C245 185 185 58 0 0Z"
          fill="#c49a46"
        />
        <path
          d="M155 0H177L400 116V128Z"
          fill="#e6c879"
        />
      </svg>

      <svg
        class="decoration bottom-decoration"
        viewBox="0 0 400 250"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 0H400V250C310 220 250 115 170 65S60 15 0 0Z"
          fill="#17345c"
        />
        <path
          d="M65 0H400V180C295 146 230 60 65 0Z"
          fill="#294878"
        />
        <path
          d="M0 0H35C190 45 250 170 400 220V234C245 185 185 58 0 0Z"
          fill="#c49a46"
        />
      </svg>

      <header class="heading">
        <div class="brand">
          SMARTCITYCORE
          <small>FORMACIÓN · INNOVACIÓN · TERRITORIO</small>
        </div>

        <div class="institution">
          UNIVERSIDAD ESTATAL DEL SUR DE MANABÍ<br>
          <strong>UNESUM</strong>
        </div>
      </header>

      <section class="content">
        <p class="eyebrow">VINCULACIÓN CON LA SOCIEDAD</p>

        <h1>CERTIFICADO</h1>
        <p class="subtitle">DE APROBACIÓN</p>

        <div class="ornament" aria-hidden="true"></div>

        <p class="grant">Se otorga el presente certificado a</p>

        <h2 class="name">${participant}</h2>

        <p class="description">
          Por haber completado y aprobado satisfactoriamente el curso
        </p>

        <h3 class="course">${escapeHtml(courseName)}</h3>

        <p class="project">
          desarrollado en el marco del proyecto
          <strong>«${escapeHtml(PROJECT_NAME)}»</strong>.
        </p>

        <div class="grade">
          Calificación final:
          <strong>${escapeHtml(score)}</strong>
        </div>
      </section>

      <footer class="footer">
        <div class="signature">
          <div class="signature-space" aria-hidden="true"></div>
          <div class="signature-line" aria-hidden="true"></div>

          <strong>Dr. Christhian Caicedo</strong>
          <span>Director del proyecto de vinculación</span>
        </div>

        <p class="sample-note">
          VISTA PREVIA DEL DISEÑO · SIN VALIDEZ DE EMISIÓN<br>
          La firma autorizada, la fecha y el código de emisión
          se incorporarán al conectar el certificado definitivo.
        </p>
      </footer>
    </main>
  </div>
</body>
</html>`;
};

export const openCertificateExample = (
  name,
  {
    print = false,
    courseName,
    finalScore = null,
  } = {}
) => {
  const preview = window.open('', '_blank');

  if (!preview) {
    throw new Error(
      'Permite las ventanas emergentes para abrir el certificado.'
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
      { once: true }
    );
  }

  preview.document.open();

  preview.document.write(
    buildCertificateExample(name, {
      courseName,
      finalScore,
    })
  );

  preview.document.close();
  preview.focus();
};