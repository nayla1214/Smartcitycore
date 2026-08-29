import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <Outlet />
      </main>
      <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '2rem 0', textAlign: 'center' }}>
        <div className="container">
          <p>© 2026 GAD Capacitación. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
