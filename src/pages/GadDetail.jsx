import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const GadDetail = () => {
  const { name } = useParams();
  const [gad, setGad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGad = async () => {
      try {
        const data = await api.get(`/gads/${name}`);
        setGad(data);
      } catch (err) {
        setError('No se pudo cargar la información del GAD');
      } finally {
        setLoading(false);
      }
    };
    fetchGad();
  }, [name]);

  if (loading) return <div className="container mt-4">Cargando...</div>;
  if (error) return <div className="container mt-4 text-center"><h2>{error}</h2><button className="btn btn-primary" onClick={() => navigate(-1)}>Volver</button></div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <h1>{gad.name}</h1>
        <p className="mt-2 text-light">{gad.description}</p>
        
        <h3 className="mt-4">Información Institucional</h3>
        <p>{gad.institutional_info}</p>
        
        <h3 className="mt-4">Proyectos Destacados</h3>
        <p>{gad.projects ? JSON.stringify(gad.projects) : 'No hay proyectos registrados.'}</p>
      </div>
    </div>
  );
};

export default GadDetail;
