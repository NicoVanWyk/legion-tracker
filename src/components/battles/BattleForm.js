// src/components/battles/BattleForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, getDocs, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import BattlePhases from '../../enums/BattlePhases';
import PlayerSides from '../../enums/PlayerSides';
import LoadingSpinner from '../layout/LoadingSpinner';

const BattleForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingArmies, setLoadingArmies] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Get armyId from URL query parameter if available
  const queryParams = new URLSearchParams(location.search);
  const preselectedArmyId = queryParams.get('armyId');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    bluePlayer: '',
    redPlayer: '',
    blueArmyId: preselectedArmyId || '',
    redArmyId: '',
    blueArmy: '',
    redArmy: '',
    currentRound: 1,
    currentPhase: BattlePhases.COMMAND,
    activePlayer: PlayerSides.BLUE,
    blueUnits: [],
    redUnits: [],
    objectives: {
      primary: '',
      secondary: '',
      deployment: ''
    }
  });
  
  // Available armies for selection
  const [availableArmies, setAvailableArmies] = useState([]);
  
  // Form validation state
  const [validated, setValidated] = useState(false);
  
  // Load user's armies
  useEffect(() => {
    const fetchArmies = async () => {
      try {
        setLoadingArmies(true);
        
        // Create a reference to the user's armies collection
        const armiesRef = collection(db, 'users', currentUser.uid, 'armies');
        
        // Execute the query
        const querySnapshot = await getDocs(armiesRef);
        
        // Map through the documents
        const armiesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAvailableArmies(armiesList);
        
        // If preselected army, set blue army name
        if (preselectedArmyId) {
          const preselectedArmy = armiesList.find(army => army.id === preselectedArmyId);
          if (preselectedArmy) {
            setFormData(prev => ({
              ...prev,
              blueArmy: preselectedArmy.name
            }));
            
            // Load blue army units
            await loadArmyUnits(preselectedArmyId, 'blue');
          }
        }
      } catch (err) {
        console.error('Error fetching armies:', err);
        setError('Failed to fetch armies. Please try again later.');
      } finally {
        setLoadingArmies(false);
      }
    };

    if (currentUser) {
      fetchArmies();
    }
  }, [currentUser, preselectedArmyId]);
  
  // Handle loading army units
  const loadArmyUnits = async (armyId, side) => {
    if (!armyId) return;
    
    try {
      // Get the army document
      const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
      const armyDoc = await getDoc(armyRef);
      
      if (!armyDoc.exists()) {
        throw new Error('Army not found');
      }
      
      const armyData = armyDoc.data();
      const unitIds = armyData.units || [];
      const units = [];
      
      // Fetch each unit's details
      for (const unitId of unitIds) {
        const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
        const unitDoc = await getDoc(unitRef);
        
        if (unitDoc.exists()) {
          const unitData = unitDoc.data();
          units.push({
            id: unitDoc.id,
            name: unitData.name,
            type: unitData.type,
            hasOrder: false,
            hasActivated: false,
            wounds: unitData.wounds || 1,
            currentWounds: unitData.wounds || 1,
            suppression: 0,
            tokens: {
              aim: 0,
              dodge: 0,
              surge: 0,
              shield: unitData.keywords?.includes('shielded_1') ? 1 : (unitData.keywords?.includes('shielded_2') ? 2 : 0),
              ion: 0,
              smoke: 0,
              standby: 0
            }
          });
        }
      }
      
      // Update the form data
      setFormData(prev => {
        if (side === 'blue') {
          return {
            ...prev,
            blueUnits: units,
            blueArmy: armyData.name
          };
        } else {
          return {
            ...prev,
            redUnits: units,
            redArmy: armyData.name
          };
        }
      });
    } catch (err) {
      console.error(`Error loading ${side} army units:`, err);
      setError(`Failed to load ${side} army units. Please try again.`);
    }
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'blueArmyId') {
      setFormData(prev => ({ ...prev, [name]: value }));
      loadArmyUnits(value, 'blue');
    } else if (name === 'redArmyId') {
      setFormData(prev => ({ ...prev, [name]: value }));
      loadArmyUnits(value, 'red');
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle nested input changes (objectives)
  const handleObjectiveChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      objectives: {
        ...prev.objectives,
        [name]: value
      }
    }));
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
        throw new Error('You must be logged in to create a battle');
      }
      
      // Validate that both armies have units
      if (formData.blueUnits.length === 0) {
        throw new Error('Blue army must have units');
      }
      
      if (formData.redUnits.length === 0) {
        throw new Error('Red army must have units');
      }
      
      // Prepare data for save
      const battleToSave = {
        ...formData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        isComplete: false,
        winner: null
      };
      
      // Create the battle document
      const battleRef = await addDoc(collection(db, 'users', currentUser.uid, 'battles'), battleToSave);
      
      setSuccess('Battle created successfully!');
      
      // Navigate to battle page after short delay
      setTimeout(() => {
        navigate(`/battles/${battleRef.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error creating battle:', err);
      setError(`Failed to create battle: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner text="Creating battle..." />;
  }
  
  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Battle Information</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Battle Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter a name for this battle"
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a battle name.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Card className="mb-3" border="primary">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Blue Player</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Player Name</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      name="bluePlayer"
                      value={formData.bluePlayer}
                      onChange={handleChange}
                      placeholder="Enter blue player's name"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter the blue player's name.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Select Army</Form.Label>
                    <Form.Select
                      required
                      name="blueArmyId"
                      value={formData.blueArmyId}
                      onChange={handleChange}
                    >
                      <option value="">Select an Army</option>
                      {availableArmies.map(army => (
                        <option key={army.id} value={army.id}>
                          {army.name} ({army.totalPoints || 0} pts)
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Please select an army for the blue player.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <div className="mb-3">
                    <strong>Units:</strong> {formData.blueUnits.length}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="mb-3" border="danger">
                <Card.Header className="bg-danger text-white">
                  <h5 className="mb-0">Red Player</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Player Name</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      name="redPlayer"
                      value={formData.redPlayer}
                      onChange={handleChange}
                      placeholder="Enter red player's name"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter the red player's name.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Select Army</Form.Label>
                    <Form.Select
                      required
                      name="redArmyId"
                      value={formData.redArmyId}
                      onChange={handleChange}
                    >
                      <option value="">Select an Army</option>
                      {availableArmies
                        .filter(army => army.id !== formData.blueArmyId) // Exclude blue's army
                        .map(army => (
                        <option key={army.id} value={army.id}>
                          {army.name} ({army.totalPoints || 0} pts)
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Please select an army for the red player.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <div className="mb-3">
                    <strong>Units:</strong> {formData.redUnits.length}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Battle Objectives</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Primary Objective</Form.Label>
                <Form.Control
                  type="text"
                  name="primary"
                  value={formData.objectives.primary}
                  onChange={handleObjectiveChange}
                  placeholder="E.g., Key Positions"
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Secondary Objective</Form.Label>
                <Form.Control
                  type="text"
                  name="secondary"
                  value={formData.objectives.secondary}
                  onChange={handleObjectiveChange}
                  placeholder="E.g., Breakthrough"
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Deployment</Form.Label>
                <Form.Control
                  type="text"
                  name="deployment"
                  value={formData.objectives.deployment}
                  onChange={handleObjectiveChange}
                  placeholder="E.g., Major Offensive"
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <div className="d-flex justify-content-between">
        <Button variant="secondary" onClick={() => navigate('/battles')}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Start Battle
        </Button>
      </div>
    </Form>
  );
};

export default BattleForm;