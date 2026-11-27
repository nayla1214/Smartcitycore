import logoSmartCity from '../assets/logo-smartcity-transparente.png';

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
  name,
  {
    courseName,
    finalScore,
    issueDate,
    uniqueCode,
  } = {}
) => {
  const score = Number(finalScore);
  const date = new Date(issueDate);

  if (
    !String(name || '').trim() ||
    !String(courseName || '').trim() ||
    finalScore === null ||
    finalScore === undefined ||
    !Number.isFinite(score) ||
    score < 0 ||
    score > 10 ||
    Number.isNaN(date.getTime()) ||
    !uniqueCode
  ) {
    throw new Error(
      'Faltan los datos de emisión del certificado.'
    );
  }

  const formattedScore = score.toLocaleString('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedDate = date.toLocaleDateString('es-EC', {
    timeZone: 'America/Guayaquil',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const logoUrl = new URL(
    logoSmartCity,
    window.location.href
  ).href;

  const decoration = `
    <svg viewBox="0 0 400 250"
      preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0 0H400V250C310 220 250 115 170 65S60 15 0 0Z"
        fill="#17345c"/>
      <path
        d="M65 0H400V180C295 146 230 60 65 0Z"
        fill="#294878"/>
      <path
        d="M0 0H35C190 45 250 170 400 220V234C245 185 185 58 0 0Z"
        fill="#c49a46"/>
      <path
        d="M155 0H177L400 116V128Z"
        fill="#e6c879"/>
    </svg>
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport"
    content="width=device-width, initial-scale=1">
  <title>Certificado de aprobación</title>

  <style>
    * { box-sizing: border-box; }

    body {
      margin: 0;
      background: #e9eef5;
      color: #17345c;
      font-family: Arial, Helvetica, sans-serif;
    }

    .toolbar {
      max-width: 1123px;
      margin: 18px auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      font-size: 13px;
      line-height: 1.6;
    }

    .toolbar p { margin: 0; }

    .toolbar button {
      min-height: 44px;
      padding: 10px 20px;
      border: none;
      border-radius: 10px;
      background: #17345c;
      color: white;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    .preview {
      padding: 0 20px 30px;
      overflow: auto;
    }

    .certificate {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 297mm;
      height: 210mm;
      margin: 0 auto;
      padding: 12mm 25mm 10mm;
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

    .decoration svg {
      width: 100%;
      height: 100%;
    }

    .top { top: 0; right: 0; }

    .bottom {
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
      display: flex;
      justify-content: center;
    }

    .logo {
      display: block;
      width: 26mm;
      height: 26mm;
      object-fit: contain;
    }

    .content {
      flex: 1;
      padding-top: 3mm;
      text-align: center;
    }

    h1 {
      margin: 0;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 48px;
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
      margin: 4mm auto;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 33px;
      font-style: italic;
      font-weight: 400;
      line-height: 1.25;
      overflow-wrap: anywhere;
    }

    .description {
      margin: 0;
      color: #526178;
      font-size: 13px;
      line-height: 1.7;
    }

    .course {
      margin: 3mm auto 4mm;
      font-size: 22px;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .project {
      max-width: 205mm;
      margin: 0 auto;
      color: #526178;
      font-size: 11px;
      line-height: 1.8;
    }

    .grade {
      display: inline-block;
      margin-top: 5mm;
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

    .date {
      margin: 4mm 0 0;
      color: #526178;
      font-size: 11px;
    }

    .footer {
      padding-top: 3mm;
      text-align: center;
    }

    .signature-space { height: 11mm; }

    .signature-line {
      width: 75mm;
      height: 1px;
      margin: 0 auto 3mm;
      background: #8b98a8;
    }

    .footer strong {
      display: block;
      font-size: 14px;
    }

    .position {
      display: block;
      margin-top: 5px;
      color: #647187;
      font-size: 11px;
    }

    .code {
      margin: 5mm 0 0;
      color: #647187;
      font-size: 9px;
      line-height: 1.6;
      overflow-wrap: anywhere;
    }

    @page {
      size: A4 landscape;
      margin: 0;
    }

    @media print {
      body { background: white; }
      .toolbar { display: none; }
      .preview { padding: 0; overflow: visible; }

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
      <strong>Certificado emitido.</strong><br>
      Para descargarlo, selecciona «Guardar como PDF».
    </p>

    <button type="button" onclick="window.print()">
      Imprimir / Guardar PDF
    </button>
  </div>

  <div class="preview">
    <main class="certificate"
      aria-label="Certificado de aprobación">
      <div class="frame" aria-hidden="true"></div>

      <div class="decoration top">${decoration}</div>
      <div class="decoration bottom">${decoration}</div>

      <header class="heading">
        <img class="logo"
          src="${escapeHtml(logoUrl)}"
          alt="SMART CITY CORE">
      </header>

      <section class="content">
        <h1>CERTIFICADO</h1>
        <p class="subtitle">DE APROBACIÓN</p>

        <div class="ornament" aria-hidden="true"></div>

        <p class="grant">
          Se otorga el presente certificado a
        </p>

        <h2 class="name">${escapeHtml(name)}</h2>

        <p class="description">
          Por haber completado y aprobado satisfactoriamente el curso
        </p>

        <h3 class="course">${escapeHtml(courseName)}</h3>

        <p class="project">
          desarrollado en el marco del proyecto
          «${escapeHtml(PROJECT_NAME)}».
        </p>

        <div class="grade">
          Calificación general:
          <strong>${escapeHtml(formattedScore)}/10</strong>
        </div>

        <p class="date">
          Fecha de emisión: ${escapeHtml(formattedDate)}
        </p>
      </section>

      <footer class="footer">
        <div class="signature-space" aria-hidden="true"></div>
        <div class="signature-line" aria-hidden="true"></div>

        <strong>ING. CHRISTIAN RUPERTO CAICEDO PLÚA, PhD</strong>
        <span class="position">
          Director del proyecto de vinculación
        </span>

        <p class="code">
          Código único: ${escapeHtml(uniqueCode)}
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
    finalScore,
    issueDate,
    uniqueCode,
    targetWindow = null,
  } = {}
) => {
  const html = buildCertificateExample(name, {
    courseName,
    finalScore,
    issueDate,
    uniqueCode,
  });

  const preview =
    targetWindow || window.open('', '_blank');

  if (!preview || preview.closed) {
    throw new Error(
      'Permite las ventanas emergentes para abrir el certificado.'
    );
  }

  preview.opener = null;
  preview.document.open();
  preview.document.write(html);
  preview.document.close();

  const ready = async () => {
    await Promise.all(
      [...preview.document.images].map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve();
            } else {
              img.addEventListener('load', resolve, {
                once: true,
              });

              img.addEventListener('error', resolve, {
                once: true,
              });
            }
          })
      )
    );

    if (preview.document.fonts?.ready) {
      await preview.document.fonts.ready;
    }

    if (!preview.closed) {
      preview.focus();

      if (print) preview.print();
    }
  };

  ready().catch(() => {
    // El botón de impresión permanece disponible.
  });

  return preview;
};