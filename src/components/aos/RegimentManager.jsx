// src/components/regiments/RegimentManager.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Alert, Row, Col, Form } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import RegimentBuilder from './RegimentBuilder';
import RegimentCard from './RegimentCard';
import LoadingSpinner from '../layout/LoadingSpinner';
import GameSystems from '../../enums/GameSystems';
import AoSKeywords from '../../enums/aos/AoSKeywords';

const RegimentManager = () => {
  const { armyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const [army, setArmy] = useState(null);
  const [units, setUnits] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingRegiment, setEditingRegiment] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [generalUnitId, setGeneralUnitId] = useState(null);

  useEffect(() => {
    const fetchArmyData = async () => {
      if (!currentUser || !armyId) return;

      try {
        setLoading(true);
        
        const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
        const armyDoc = await getDoc(armyRef);

        if (!armyDoc.exists()) {
          setError('Army not found');
          return;
        }

        const armyData = { id: armyDoc.id, ...armyDoc.data() };
        
        if (armyData.gameSystem !== GameSystems.AOS) {
          setError('Regiment management is only available for Age of Sigmar armies');
          return;
        }

        setArmy(armyData);
        setGeneralUnitId(armyData.generalUnitId || null);

        const unitPromises = (armyData.units || []).map(async (unitId) => {
          const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
          const unitDoc = await getDoc(unitRef);
          return unitDoc.exists() ? { id: unitDoc.id, ...unitDoc.data() } : null;
        });
        
        const unitsData = (await Promise.all(unitPromises)).filter(Boolean);
        setUnits(unitsData);

        const contentRef = collection(db, 'users', currentUser.uid, 'armyContent');
        const contentQuery = query(contentRef, where('gameSystem', '==', GameSystems.AOS));
        const contentSnapshot = await getDocs(contentQuery);
        const contentList = contentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setContent(contentList);

      } catch (err) {
        console.error('Error fetching army data:', err);
        setError('Failed to load army data');
      } finally {
        setLoading(false);
      }
    };

    fetchArmyData();
  }, [armyId, currentUser]);

  useEffect(() => {
    if (location.state?.editingRegiment && !showBuilder) {
      setEditingRegiment(location.state.editingRegiment);
      setShowBuilder(true);
    }
  }, [location.state]);

  const availableUnits = useMemo(() => {
    if (!army) return units;
    
    const usedUnitIds = new Set();
    (army.regiments || []).forEach(reg => {
      if (editingRegiment?.id !== reg.id) {
        if (reg.commander) usedUnitIds.add(reg.commander);
        (reg.units || []).forEach(({unitId}) => usedUnitIds.add(unitId));
      }
    });
    (army.auxiliaryUnits || []).forEach(id => usedUnitIds.add(id));
    
    return units.filter(u => !usedUnitIds.has(u.id));
  }, [army, units, editingRegiment]);

  const handleSaveRegiment = async (regimentData) => {
    try {
      setSaving(true);
      setError('');

      const regiments = [...(army.regiments || [])];
      
      if (editingRegiment) {
        const index = regiments.findIndex(r => r.id === editingRegiment.id);
        if (index >= 0) {
          regiments[index] = { ...regimentData, id: editingRegiment.id };
        }
      } else {
        regiments.push({
          ...regimentData,
          id: `regiment-${Date.now()}`
        });
      }

      const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
      await updateDoc(armyRef, { regiments });

      setArmy({ ...army, regiments });
      setSuccess(editingRegiment ? 'Regiment updated!' : 'Regiment created!');
      setShowBuilder(false);
      setEditingRegiment(null);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving regiment:', err);
      setError('Failed to save regiment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRegiment = async (regimentId) => {
    if (!window.confirm('Delete this regiment?')) return;

    try {
      setSaving(true);
      const regiments = (army.regiments || []).filter(r => r.id !== regimentId);
      
      const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
      await updateDoc(armyRef, { regiments });

      setArmy({ ...army, regiments });
      setSuccess('Regiment deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting regiment:', err);
      setError('Failed to delete regiment');
    } finally {
      setSaving(false);
    }
  };

  const handleEditRegiment = (regiment) => {
    setEditingRegiment(regiment);
    setShowBuilder(true);
  };

  const handleCancelBuilder = () => {
    setShowBuilder(false);
    setEditingRegiment(null);
  };

  const handleGeneralChange = async (newGeneralId) => {
    setGeneralUnitId(newGeneralId || null);
    
    try {
      const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
      await updateDoc(armyRef, { generalUnitId: newGeneralId || null });
      setSuccess('General updated');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Error updating general:', err);
      setError('Failed to update general');
    }
  };

  if (loading) return <LoadingSpinner text="Loading regiments..." />;

  if (error && !army) {
    return (
      <Alert variant="danger">
        {error}
        <div className="mt-3">
          <Button variant="primary" onClick={() => navigate('/armies')}>
            Back to Armies
          </Button>
        </div>
      </Alert>
    );
  }

  const heroUnits = units.filter(u => u.keywords?.includes(AoSKeywords.HERO));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Regiment Management</h2>
          <p className="text-muted mb-0">{army?.name}</p>
        </div>
        <div>
          <Button
            variant="outline-secondary"
            onClick={() => navigate(`/armies/${armyId}`)}
            className="me-2"
          >
            Back to Army
          </Button>
          {!showBuilder && (
            <Button
              variant="primary"
              onClick={() => setShowBuilder(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              New Regiment
            </Button>
          )}
        </div>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {!showBuilder && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Army General</h5>
          </Card.Header>
          <Card.Body>
            <Form.Select
              value={generalUnitId || ''}
              onChange={(e) => handleGeneralChange(e.target.value)}
            >
              <option value="">No general selected</option>
              {heroUnits.map(hero => (
                <option key={hero.id} value={hero.id}>
                  {hero.name}
                  {hero.keywords?.includes(AoSKeywords.WARMASTER) && ' (WARMASTER)'}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              The general's regiment gets 4 unit slots instead of 3
            </Form.Text>
          </Card.Body>
        </Card>
      )}

      {showBuilder ? (
        <RegimentBuilder
          regiment={editingRegiment}
          availableUnits={availableUnits}
          availableContent={content}
          onSave={handleSaveRegiment}
          onCancel={handleCancelBuilder}
          saving={saving}
          generalUnitId={generalUnitId}
        />
      ) : (
        <>
          {(army?.regiments || []).length === 0 ? (
            <Alert variant="info">
              <h5>No Regiments Created</h5>
              <p>Age of Sigmar armies are organized into regiments. Each regiment must have:</p>
              <ul>
                <li>1 Commander (HERO)</li>
                <li>0-3 Units (0-4 for general's regiment)</li>
                <li>Heroes can join as sub-commanders if their battle profile allows</li>
                <li>1 Regiment Ability (optional)</li>
              </ul>
            </Alert>
          ) : (
            <Row>
              <Col>
                {(army.regiments || []).map(regiment => (
                  <RegimentCard
                    key={regiment.id}
                    regiment={regiment}
                    units={units}
                    content={content}
                    generalUnitId={generalUnitId}
                    onEdit={handleEditRegiment}
                    onDelete={handleDeleteRegiment}
                  />
                ))}
              </Col>
            </Row>
          )}

          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">Available Units ({availableUnits.length})</h5>
            </Card.Header>
            <Card.Body>
              {availableUnits.length === 0 ? (
                <p className="text-muted mb-0">All units assigned to regiments</p>
              ) : (
                <Row>
                  {availableUnits.map(unit => (
                    <Col md={6} lg={4} key={unit.id} className="mb-2">
                      <Card bg="light">
                        <Card.Body className="p-2">
                          <strong>{unit.name}</strong>
                          <div className="small text-muted">{unit.points} pts</div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default RegimentManager;