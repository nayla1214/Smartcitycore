import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AccessibilityPanel from '../components/AccessibilityPanel';

const MainLayout = () => {
  const skipToContent = () => {
    document
      .getElementById('main-content')
      ?.focus();
  };

  return (
    <>
      <div
        className="app-layout"
        data-accessibility-content
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <a
          href="#main-content"
          className="skip-to-content"
          onClick={skipToContent}
        >
          Saltar al contenido principal
        </a>

        <Navbar />

        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            padding: '2rem 0',
          }}
        >
          <Outlet />
        </main>

        <footer
          style={{
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '2rem 0',
            textAlign: 'center',
          }}
        >
          <div className="container">
            <p>
              © 2026 GAD Capacitación.
              Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>

      <AccessibilityPanel />
    </>
  );
};

export default MainLayout;