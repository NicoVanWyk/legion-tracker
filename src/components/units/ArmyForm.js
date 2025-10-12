// src/components/units/ArmyForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, collection, addDoc, updateDoc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import Factions from '../../enums/Factions';
import UnitTypes from '../../enums/UnitTypes';
import LoadingSpinner from '../layout/LoadingSpinner';

const ArmyForm = () => {
  const { armyId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingArmy, setLoadingArmy] = useState(armyId ? true : false);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [customUnitTypes, setCustomUnitTypes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    faction: Factions.REPUBLIC,
    description: '',
    units: [], // Array of unit IDs
    totalPoints: 0
  });

  // Available units
  const [availableUnits, setAvailableUnits] = useState([]);
  
  // Selected units with details
  const [selectedUnits, setSelectedUnits] = useState([]);
  
  // Form validation state
  const [validated, setValidated] = useState(false);

  // Load army data if editing
  useEffect(() => {
    const fetchArmy = async () => {
      try {
        if (armyId && currentUser) {
          setLoadingArmy(true);
          
          // Get reference to the army document
          const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
          
          // Get the army data
          const armyDoc = await getDoc(armyRef);
          
          if (armyDoc.exists()) {
            const armyData = armyDoc.data();
            setFormData({
              ...armyData,
              // Ensure we have the required fields even if they're missing in the data
              units: armyData.units || [],
            });

            // Fetch selected units' details
            const unitIds = armyData.units || [];
            const unitDetails = [];

            for (const unitId of unitIds) {
              const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
              const unitDoc = await getDoc(unitRef);
              
              if (unitDoc.exists()) {
                unitDetails.push({
                  id: unitDoc.id,
                  ...unitDoc.data()
                });
              }
            }

            // Fetch custom unit types for display
            const typesSnap = await getDocs(collection(db, 'users', currentUser.uid, 'customUnitTypes'));
            const customTypes = typesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setCustomUnitTypes(customTypes);

            setSelectedUnits(unitDetails);
          } else {
            setError('Army not found');
          }
        }
      } catch (err) {
        console.error('Error fetching army:', err);
        setError('Failed to fetch army details. Please try again later.');
      } finally {
        setLoadingArmy(false);
      }
    };

    fetchArmy();
  }, [currentUser, armyId]);

  // Load available units based on faction
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoadingUnits(true);
        
        if (!currentUser) return;
        
        // Create a reference to the user's units collection
        const unitsRef = collection(db, 'users', currentUser.uid, 'units');
        
        // Create a query for units of the selected faction
        const q = query(unitsRef, where('faction', '==', formData.faction));
        
        // Execute the query
        const querySnapshot = await getDocs(q);
        
        // Map through the documents
        const unitsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by unit type
        unitsList.sort((a, b) => {
          // Order: Command, Corps, Special Forces, Support, Heavy, Operative, Auxiliary
          const typeOrder = {
              [UnitTypes.COMMAND]: 1,
              [UnitTypes.CORPS]: 2,
              [UnitTypes.SPECIAL_FORCES]: 3,
              [UnitTypes.SUPPORT]: 4,
              [UnitTypes.HEAVY]: 5,
              [UnitTypes.OPERATIVE]: 6,
              [UnitTypes.AUXILIARY]: 7
          };
          customUnitTypes.forEach(ct => {
              typeOrder[ct.name] = ct.sortOrder + 100;
          });
          
          return typeOrder[a.type] - typeOrder[b.type] || a.name.localeCompare(b.name);
        });
        
        setAvailableUnits(unitsList);
      } catch (err) {
        console.error('Error fetching units:', err);
        setError('Failed to fetch available units. Please try again later.');
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchUnits();
  }, [currentUser, formData.faction]);

  const getTypeDisplayName = (type) => {
    if (Object.values(UnitTypes).includes(type)) {
        return UnitTypes.getDisplayName(type);
    }
    const customType = customUnitTypes.find(t => t.name === type);
    return customType ? customType.displayName : type;
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'faction') {
      // Reset selected units when faction changes
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        units: [],
        totalPoints: 0
      }));
      setSelectedUnits([]);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle adding a unit to the army
  const handleAddUnit = (unit) => {
    // Check if unit is already selected
    if (formData.units.includes(unit.id)) {
      return;
    }
    
    // Add unit to the army
    setFormData(prev => ({
      ...prev,
      units: [...prev.units, unit.id],
      totalPoints: prev.totalPoints + (unit.points || 0)
    }));
    
    // Add unit to the selected units
    setSelectedUnits(prev => [...prev, unit]);
  };
  
  // Handle removing a unit from the army
  const handleRemoveUnit = (unitId) => {
    // Find the unit in selected units
    const unit = selectedUnits.find(u => u.id === unitId);
    
    if (!unit) return;
    
    // Remove unit from the army
    setFormData(prev => ({
      ...prev,
      units: prev.units.filter(id => id !== unitId),
      totalPoints: prev.totalPoints - (unit.points || 0)
    }));
    
    // Remove unit from the selected units
    setSelectedUnits(prev => prev.filter(u => u.id !== unitId));
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
        throw new Error('You must be logged in to create an army');
      }
      
      // Prepare data
      const armyToSave = {
        ...formData,
        userId: currentUser.uid,
        updatedAt: serverTimestamp()
      };
      
      if (armyId) {
        // Update existing army
        const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
        await updateDoc(armyRef, armyToSave);
        setSuccess('Army updated successfully!');
        
        // Navigate to army details after short delay
        setTimeout(() => {
          navigate(`/armies/${armyId}`);
        }, 1500);
      } else {
        // Create new army
        armyToSave.createdAt = serverTimestamp();
        const armyRef = await addDoc(collection(db, 'users', currentUser.uid, 'armies'), armyToSave);
        setSuccess('Army created successfully!');
        
        // Reset form
        setFormData({
          name: '',
          faction: Factions.REPUBLIC,
          description: '',
          units: [],
          totalPoints: 0
        });
        
        setSelectedUnits([]);
        
        // Navigate to army details after short delay
        setTimeout(() => {
          navigate(`/armies/${armyRef.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving army:', err);
      setError(`Failed to save army: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate counts of each unit type
  const unitTypeCounts = selectedUnits.reduce((counts, unit) => {
    const type = unit.type;
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});
  
  if (loadingArmy) {
    return <LoadingSpinner text="Loading army data..." />;
  }
  
  if (loading) {
    return <LoadingSpinner text={armyId ? 'Updating army...' : 'Creating army...'} />;
  }
  
  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Row>
        <Col md={7}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Army Details</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Army Name</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter army name"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter an army name.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Faction</Form.Label>
                    <Form.Select
                      required
                      name="faction"
                      value={formData.faction}
                      onChange={handleChange}
                      disabled={selectedUnits.length > 0}
                    >
                      <option value={Factions.REPUBLIC}>{Factions.getDisplayName(Factions.REPUBLIC)}</option>
                      <option value={Factions.SEPARATIST}>{Factions.getDisplayName(Factions.SEPARATIST)}</option>
                      <option value={Factions.REBEL}>{Factions.getDisplayName(Factions.REBEL)}</option>
                      <option value={Factions.EMPIRE}>{Factions.getDisplayName(Factions.EMPIRE)}</option>
                    </Form.Select>
                    {selectedUnits.length > 0 && (
                      <Form.Text className="text-muted">
                        Cannot change faction while units are selected.
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter a description for your army..."
                  rows={3}
                />
              </Form.Group>
              
              <Row>
                <Col>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5>Selected Units ({selectedUnits.length})</h5>
                    <span className="fw-bold">
                      Total Points: {formData.totalPoints}
                    </span>
                  </div>
                  
                  {/* Unit type counts */}
                  <div className="mb-3">
                    {Object.entries(unitTypeCounts).map(([type, count]) => (
                      <Badge 
                        key={type}
                        bg="secondary" 
                        className={`me-2 unit-type-${type}`}
                        style={{
                          fontSize: '0.85rem',
                          padding: '0.25rem 0.5rem'
                        }}
                      >
                        {getTypeDisplayName(type)}: {count}
                      </Badge>
                    ))}
                  </div>
                  
                  {selectedUnits.length === 0 ? (
                    <Alert variant="info">
                      No units selected. Add units from the list on the right.
                    </Alert>
                  ) : (
                    <ListGroup variant="flush" className="border rounded">
                      {selectedUnits.map(unit => (
                        <ListGroup.Item 
                          key={unit.id}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <div className="fw-bold">{unit.name}</div>
                            <div className="small text-muted">
                              {getTypeDisplayName(unit.type)} • {unit.points || 0} points
                            </div>
                          </div>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRemoveUnit(unit.id)}
                          >
                            Remove
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <div className="d-flex justify-content-between">
            <Button variant="secondary" onClick={() => navigate('/armies')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {armyId ? 'Update Army' : 'Create Army'}
            </Button>
          </div>
        </Col>
        
        <Col md={5}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Available Units</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loadingUnits ? (
                <div className="text-center py-4">
                  <LoadingSpinner text="Loading units..." />
                </div>
              ) : availableUnits.length === 0 ? (
                <div className="text-center py-4">
                  <p className="mb-0">No units available for the selected faction.</p>
                  <Button 
                    as="a" 
                    href="/units/create" 
                    variant="link"
                  >
                    Create a new unit
                  </Button>
                </div>
              ) : (
                <>
                  {/* Group units by type */}
                  {Object.values(UnitTypes)
                    .filter(type => typeof type === 'string' && type !== 'getDisplayName')
                    .map(unitType => {
                      const unitsOfType = availableUnits.filter(unit => unit.type === unitType);
                      
                      if (unitsOfType.length === 0) {
                        return null;
                      }
                      
                      return (
                        <div key={unitType}>
                          <div className="bg-light p-2 fw-bold">
                            {getTypeDisplayName(unitType)}
                          </div>
                          <ListGroup variant="flush">
                            {unitsOfType.map(unit => (
                              <ListGroup.Item 
                                key={unit.id}
                                className="d-flex justify-content-between align-items-center"
                              >
                                <div>
                                  <div className="fw-bold">{unit.name}</div>
                                  <div className="small text-muted">
                                    {unit.points || 0} points
                                  </div>
                                </div>
                                <Button 
                                  variant={formData.units.includes(unit.id) ? "outline-success" : "outline-primary"}
                                  size="sm"
                                  onClick={() => handleAddUnit(unit)}
                                  disabled={formData.units.includes(unit.id)}
                                >
                                  {formData.units.includes(unit.id) ? "Added" : "Add"}
                                </Button>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </div>
                      );
                    })}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

export default ArmyForm;