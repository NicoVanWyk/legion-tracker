// src/components/units/UnitForm.js (Updated version)
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, Tab, Tabs } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, collection, addDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import UnitTypes from '../../enums/UnitTypes';
import Factions from '../../enums/Factions';
import DefenseDice from '../../enums/DefenseDice';
import KeywordSelector from './KeywordSelector';
import WeaponSelector from './WeaponSelector';
import LoadingSpinner from '../layout/LoadingSpinner';

const UnitForm = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingUnit, setLoadingUnit] = useState(unitId ? true : false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    faction: Factions.REPUBLIC,
    type: UnitTypes.CORPS,
    points: 0,
    wounds: 1,
    courage: 1,
    speed: 2,
    defense: DefenseDice.WHITE,
    keywords: [],
    weapons: [],
    miniatures: '',
    notes: '',
  });
  
  // Form validation state
  const [validated, setValidated] = useState(false);

  // Load unit data if editing
  useEffect(() => {
    const fetchUnit = async () => {
      try {
        if (unitId && currentUser) {
          setLoadingUnit(true);
          
          // Get reference to the unit document
          const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
          
          // Get the unit data
          const unitDoc = await getDoc(unitRef);
          
          if (unitDoc.exists()) {
            const unitData = unitDoc.data();
            setFormData({
              ...unitData,
              // Ensure we have the required fields even if they're missing in the data
              keywords: unitData.keywords || [],
              weapons: unitData.weapons || []
            });
          } else {
            setError('Unit not found');
          }
        }
      } catch (err) {
        console.error('Error fetching unit:', err);
        setError('Failed to fetch unit details. Please try again later.');
      } finally {
        setLoadingUnit(false);
      }
    };

    fetchUnit();
  }, [currentUser, unitId]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (['points', 'wounds', 'courage', 'speed'].includes(name)) {
      const numValue = parseInt(value, 10);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle keyword changes
  const handleKeywordsChange = (keywords) => {
    setFormData(prev => ({ ...prev, keywords }));
  };
  
  // Handle weapons changes
  const handleWeaponsChange = (weapons) => {
    setFormData(prev => ({ ...prev, weapons }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (!currentUser) {
        throw new Error('You must be logged in to create a unit');
      }
      
      // Prepare data
      const unitToSave = {
        ...formData,
        userId: currentUser.uid,
        updatedAt: serverTimestamp()
      };
      
      if (unitId) {
        // Update existing unit
        const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
        await updateDoc(unitRef, unitToSave);
        setSuccess('Unit updated successfully!');
        
        // Navigate to unit details after short delay
        setTimeout(() => {
          navigate(`/units/${unitId}`);
        }, 1500);
      } else {
        // Create new unit
        unitToSave.createdAt = serverTimestamp();
        const unitRef = await addDoc(collection(db, 'users', currentUser.uid, 'units'), unitToSave);
        setSuccess('Unit created successfully!');
        
        // Reset form
        setFormData({
          name: '',
          faction: Factions.REPUBLIC,
          type: UnitTypes.CORPS,
          points: 0,
          wounds: 1,
          courage: 1,
          speed: 2,
          defense: DefenseDice.WHITE,
          keywords: [],
          weapons: [],
          miniatures: '',
          notes: '',
        });
        
        // Navigate to unit details after short delay
        setTimeout(() => {
          navigate(`/units/${unitRef.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving unit:', err);
      setError(`Failed to save unit: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loadingUnit) {
    return <LoadingSpinner text="Loading unit data..." />;
  }
  
  if (loading) {
    return <LoadingSpinner text={unitId ? 'Updating unit...' : 'Creating unit...'} />;
  }
  
  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        fill
      >
        <Tab eventKey="basic" title="Basic Info">
          <Card>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Unit Name</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter unit name"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter a unit name.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Faction</Form.Label>
                    <Form.Select
                      required
                      name="faction"
                      value={formData.faction}
                      onChange={handleChange}
                    >
                      <option value={Factions.REPUBLIC}>{Factions.getDisplayName(Factions.REPUBLIC)}</option>
                      <option value={Factions.SEPARATIST}>{Factions.getDisplayName(Factions.SEPARATIST)}</option>
                      <option value={Factions.REBEL}>{Factions.getDisplayName(Factions.REBEL)}</option>
                      <option value={Factions.EMPIRE}>{Factions.getDisplayName(Factions.EMPIRE)}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Unit Type</Form.Label>
                    <Form.Select
                      required
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value={UnitTypes.COMMAND}>{UnitTypes.getDisplayName(UnitTypes.COMMAND)}</option>
                      <option value={UnitTypes.CORPS}>{UnitTypes.getDisplayName(UnitTypes.CORPS)}</option>
                      <option value={UnitTypes.SPECIAL_FORCES}>{UnitTypes.getDisplayName(UnitTypes.SPECIAL_FORCES)}</option>
                      <option value={UnitTypes.SUPPORT}>{UnitTypes.getDisplayName(UnitTypes.SUPPORT)}</option>
                      <option value={UnitTypes.HEAVY}>{UnitTypes.getDisplayName(UnitTypes.HEAVY)}</option>
                      <option value={UnitTypes.OPERATIVE}>{UnitTypes.getDisplayName(UnitTypes.OPERATIVE)}</option>
                      <option value={UnitTypes.AUXILIARY}>{UnitTypes.getDisplayName(UnitTypes.AUXILIARY)}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Points Cost</Form.Label>
                    <Form.Control
                      required
                      type="number"
                      name="points"
                      value={formData.points}
                      onChange={handleChange}
                      min="0"
                      max="500"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Wounds</Form.Label>
                    <Form.Control
                      required
                      type="number"
                      name="wounds"
                      value={formData.wounds}
                      onChange={handleChange}
                      min="1"
                      max="20"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Courage</Form.Label>
                    <Form.Control
                      type="number"
                      name="courage"
                      value={formData.courage}
                      onChange={handleChange}
                      min="0"
                      max="5"
                    />
                    <Form.Text className="text-muted">
                      0 for units without courage
                    </Form.Text>
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Speed</Form.Label>
                    <Form.Control
                      required
                      type="number"
                      name="speed"
                      value={formData.speed}
                      onChange={handleChange}
                      min="0"
                      max="3"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Defense</Form.Label>
                    <Form.Select
                      required
                      name="defense"
                      value={formData.defense}
                      onChange={handleChange}
                    >
                      <option value={DefenseDice.WHITE}>White</option>
                      <option value={DefenseDice.RED}>Red</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="keywords" title="Keywords">
          <Card>
            <Card.Body>
              <KeywordSelector
                selectedKeywords={formData.keywords}
                onChange={handleKeywordsChange}
              />
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="weapons" title="Weapons">
          <Card>
            <Card.Body>
              <WeaponSelector
                weapons={formData.weapons}
                onChange={handleWeaponsChange}
              />
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="miniatures" title="Miniatures">
          <Card>
            <Card.Body>
              <Form.Group>
                <Form.Label>Miniature Proxy Information</Form.Label>
                <Form.Control
                  as="textarea"
                  name="miniatures"
                  value={formData.miniatures}
                  onChange={handleChange}
                  placeholder="Enter the miniature(s) used for this unit..."
                  rows={5}
                />
                <Form.Text className="text-muted">
                  Describe what miniatures are used to represent this unit on the battlefield.
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="notes" title="Notes">
          <Card>
            <Card.Body>
              <Form.Group>
                <Form.Label>Additional Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter any additional notes about this unit..."
                  rows={5}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={() => navigate('/units')}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {unitId ? 'Update Unit' : 'Create Unit'}
        </Button>
      </div>
    </Form>
  );
};

export default UnitForm;