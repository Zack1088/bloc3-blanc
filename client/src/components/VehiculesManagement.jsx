import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VehiculesManagement.css';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const VehiculesManagement = () => {
  const [vehicules, setVehicules] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicule, setEditingVehicule] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // États pour le formulaire
  const [formData, setFormData] = useState({
    plaque_immatriculation: '',
    marque: '',
    modele: '',
    annee: '',
    client_id: ''
  });

  const navigate = useNavigate();

  // Récupérer le token CSRF
  const fetchCSRFToken = async () => {
    try {
      const response = await fetch(baseURI + 'api/csrf', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.token);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token CSRF:', error);
    }
  };

  // Récupérer la liste des véhicules
  const fetchVehicules = async () => {
    try {
      const response = await fetch(baseURI + 'api/vehicules', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setVehicules(data);
      } else if (response.status === 401) {
        navigate('/');
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la récupération des véhicules' });
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      setMessage({ type: 'error', text: 'Erreur réseau' });
    }
  };

  // Récupérer la liste des clients
  const fetchClients = async () => {
    try {
      const response = await fetch(baseURI + 'api/clients', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchCSRFToken(),
        fetchVehicules(),
        fetchClients()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Gérer les changements dans le formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      plaque_immatriculation: '',
      marque: '',
      modele: '',
      annee: '',
      client_id: ''
    });
    setEditingVehicule(null);
    setShowAddForm(false);
  };

  // Ajouter un véhicule
  const handleAddVehicule = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(baseURI + 'api/vehicules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          token: csrfToken,
          annee: formData.annee ? parseInt(formData.annee) : null,
          client_id: formData.client_id || null
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Véhicule ajouté avec succès' });
        resetForm();
        fetchVehicules(); // Recharger la liste
        fetchCSRFToken(); // Renouveler le token CSRF
      } else {
        const errorText = await response.text();
        setMessage({ type: 'error', text: errorText });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'ajout du véhicule' });
    }
  };

  // Modifier un véhicule
  const handleEditVehicule = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(baseURI + `api/vehicules/${editingVehicule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          token: csrfToken,
          annee: formData.annee ? parseInt(formData.annee) : null,
          client_id: formData.client_id || null
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Véhicule modifié avec succès' });
        resetForm();
        fetchVehicules(); // Recharger la liste
        fetchCSRFToken(); // Renouveler le token CSRF
      } else {
        const errorText = await response.text();
        setMessage({ type: 'error', text: errorText });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la modification du véhicule' });
    }
  };

  // Supprimer un véhicule
  const handleDeleteVehicule = async (vehiculeId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      return;
    }

    try {
      const response = await fetch(baseURI + `api/vehicules/${vehiculeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token: csrfToken })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Véhicule supprimé avec succès' });
        fetchVehicules(); // Recharger la liste
        fetchCSRFToken(); // Renouveler le token CSRF
      } else {
        const errorText = await response.text();
        setMessage({ type: 'error', text: errorText });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression du véhicule' });
    }
  };

  // Préparer l'édition d'un véhicule
  const startEditVehicule = (vehicule) => {
    setFormData({
      plaque_immatriculation: vehicule.plaque_immatriculation,
      marque: vehicule.marque,
      modele: vehicule.modele,
      annee: vehicule.annee?.toString() || '',
      client_id: vehicule.client_id?.toString() || ''
    });
    setEditingVehicule(vehicule);
    setShowAddForm(true);
  };

  // Fermer les messages
  const closeMessage = () => {
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="vehicules-container">
        <div className="loading">Chargement des véhicules...</div>
      </div>
    );
  }

  return (
    <div className="vehicules-container">
      <div className="vehicules-header">
        <h1>Gestion des Véhicules</h1>
        <div className="header-actions">
          <button 
            className="btn-back" 
            onClick={() => navigate('/dashboard')}
          >
            ← Retour au tableau de bord
          </button>
          <button 
            className="btn-primary" 
            onClick={() => setShowAddForm(true)}
          >
            + Ajouter un véhicule
          </button>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`message ${message.type}`}>
          <span>{message.text}</span>
          <button onClick={closeMessage} className="close-message">×</button>
        </div>
      )}

      {/* Formulaire d'ajout/modification */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingVehicule ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h2>
              <button className="close-modal" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={editingVehicule ? handleEditVehicule : handleAddVehicule}>
              <div className="form-group">
                <label htmlFor="plaque_immatriculation">Plaque d'immatriculation *</label>
                <input
                  type="text"
                  id="plaque_immatriculation"
                  name="plaque_immatriculation"
                  value={formData.plaque_immatriculation}
                  onChange={handleFormChange}
                  required
                  placeholder="AB-123-CD"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="marque">Marque *</label>
                  <input
                    type="text"
                    id="marque"
                    name="marque"
                    value={formData.marque}
                    onChange={handleFormChange}
                    required
                    placeholder="Peugeot"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modele">Modèle *</label>
                  <input
                    type="text"
                    id="modele"
                    name="modele"
                    value={formData.modele}
                    onChange={handleFormChange}
                    required
                    placeholder="308"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="annee">Année</label>
                  <input
                    type="number"
                    id="annee"
                    name="annee"
                    value={formData.annee}
                    onChange={handleFormChange}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    placeholder="2020"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="client_id">Client</label>
                  <select
                    id="client_id"
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleFormChange}
                  >
                    <option value="">Aucun client associé</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.firstname} {client.lastname} ({client.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingVehicule ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des véhicules */}
      <div className="vehicules-list">
        <div className="list-header">
          <h2>Liste des véhicules ({vehicules.length})</h2>
        </div>

        {vehicules.length === 0 ? (
          <div className="empty-state">
            <p>Aucun véhicule enregistré</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="vehicules-table">
              <thead>
                <tr>
                  <th>Plaque</th>
                  <th>Marque</th>
                  <th>Modèle</th>
                  <th>Année</th>
                  <th>Client</th>
                  <th>Date d'ajout</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicules.map(vehicule => (
                  <tr key={vehicule.id}>
                    <td className="plaque">{vehicule.plaque_immatriculation}</td>
                    <td>{vehicule.marque}</td>
                    <td>{vehicule.modele}</td>
                    <td>{vehicule.annee || '-'}</td>
                    <td>
                      {vehicule.client_nom ? (
                        <span className="client-info">
                          {vehicule.client_nom}
                          <small>{vehicule.client_email}</small>
                        </span>
                      ) : (
                        <span className="no-client">Non associé</span>
                      )}
                    </td>
                    <td>{new Date(vehicule.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="actions">
                      <button 
                        className="btn-edit"
                        onClick={() => startEditVehicule(vehicule)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteVehicule(vehicule.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiculesManagement;