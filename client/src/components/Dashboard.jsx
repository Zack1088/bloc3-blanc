import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import './Dashboard.css';
const baseURI = import.meta.env.VITE_API_BASE_URL;

const AdminDashboard = () => {
  const [clientCount, setClientCount] = useState(0);
  const [vehiculeCount, setVehiculeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Récupérer le nombre de clients
        const clientResponse = await fetch(baseURI + 'api/clients/count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        // Récupérer le nombre de véhicules
        const vehiculeResponse = await fetch(baseURI + 'api/vehicules/count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (clientResponse.ok && vehiculeResponse.ok) {
          const clientData = await clientResponse.json();
          const vehiculeData = await vehiculeResponse.json();
          
          setClientCount(clientData.count);
          setVehiculeCount(vehiculeData.count);
        } else {
          alert('Erreur lors de la récupération des données');
          navigate('/');
        }
      } catch (error) {
        console.error('Erreur réseau:', error);
        alert('Erreur réseau');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleGestionVehicules = () => {
    navigate('/dashboard/vehicules');
  };

  const handleGestionClients = () => {
    navigate('/dashboard/clients'); // Route à créer si besoin
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tableau de bord administrateur</h1>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Clients inscrits</h3>
          <div className="stat-value">{clientCount}</div>
          <div className="stat-description">Nombre total de clients enregistrés</div>
        </div>
        
        <div className="stat-card">
          <h3>Véhicules enregistrés</h3>
          <div className="stat-value">{vehiculeCount}</div>
          <div className="stat-description">Nombre total de véhicules dans la base</div>
        </div>
        
        <div className="stat-card">
          <h3>État du système</h3>
          <div className="stat-value">Actif</div>
          <div className="stat-description">Tous les services fonctionnent normalement</div>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <button 
          className="action-button" 
          onClick={handleGestionClients}
        >
          Gérer les clients
        </button>
        <button 
          className="action-button" 
          onClick={handleGestionVehicules}
        >
          Gérer les Véhicules
        </button>
        <button className="action-button" disabled>Rapports</button>
      </div>
    </div>
  );
};

export default AdminDashboard;