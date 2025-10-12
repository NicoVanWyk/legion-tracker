// src/components/units/ArmyDetail.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Alert, Table, ListGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import UnitTypes from '../../enums/UnitTypes';
import Factions from '../../enums/Factions';
import DefenseDice from '../../enums/DefenseDice';
import LoadingSpinner from '../layout/LoadingSpinner';

const ArmyDetail = ({ armyId }) => {
  const [army, setArmy] = useState(null);
  const [unitDetails, setUnitDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [customUnitTypes, setCustomUnitTypes] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArmy = async () => {
      try {
        setLoading(true);
        
        // Get reference to the army document
        const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
        
        // Get the army data
        const armyDoc = await getDoc(armyRef);
        
        if (armyDoc.exists()) {
          const armyData = {
            id: armyDoc.id,
            ...armyDoc.data()
          };
          
          setArmy(armyData);
          
          // Fetch unit details
          const unitIds = armyData.units || [];
          const units = [];
          
          for (const unitId of unitIds) {
            const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
            const unitDoc = await getDoc(unitRef);
            
            if (unitDoc.exists()) {
              units.push({
                id: unitDoc.id,
                ...unitDoc.data()
              });
            }
          }

          const typesSnap = await getDocs(collection(db, 'users', currentUser.uid, 'customUnitTypes'));
          setCustomUnitTypes(typesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          
          // Sort units by type
          units.sort((a, b) => {
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
          
          setUnitDetails(units);
        } else {
          setError('Army not found');
        }
      } catch (err) {
        console.error('Error fetching army:', err);
        setError('Failed to fetch army details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && armyId) {
      fetchArmy();
    }
  }, [currentUser, armyId]);

  const handleEdit = () => {
    navigate(`/armies/edit/${armyId}`);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete the army document
      await deleteDoc(doc(db, 'users', currentUser.uid, 'armies', armyId));
      
      // Navigate back to the armies list
      navigate('/armies');
    } catch (err) {
      console.error('Error deleting army:', err);
      setError('Failed to delete army. Please try again later.');
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
  };

  const startBattle = () => {
    navigate(`/battles/create?armyId=${armyId}`);
  };

  const getTypeDisplayName = (type) => {
    if (Object.values(UnitTypes).includes(type)) {
        return UnitTypes.getDisplayName(type);
    }
    const customType = customUnitTypes.find(t => t.name === type);
    return customType ? customType.displayName : type;
  };

  const printArmy = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner text="Loading army details..." />;
  }

  if (error) {
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

  if (!army) {
    return (
      <Alert variant="warning">
        Army not found.
        <div className="mt-3">
          <Button variant="primary" onClick={() => navigate('/armies')}>
            Back to Armies
          </Button>
        </div>
      </Alert>
    );
  }

  // Calculate counts of each unit type
  const unitTypeCounts = unitDetails.reduce((counts, unit) => {
    const type = unit.type;
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});

  return (
    <>
      {confirmDelete && (
        <Alert variant="danger">
          <Alert.Heading>Confirm Delete</Alert.Heading>
          <p>Are you sure you want to delete this army? This action cannot be undone.</p>
          <div className="d-flex justify-content-end">
            <Button variant="outline-secondary" onClick={cancelDelete} className="me-2">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Army
            </Button>
          </div>
        </Alert>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{army.name}</h2>
        <div>
          <Button variant="outline-primary" onClick={printArmy} className="me-2">
            Print
          </Button>
          <Button variant="outline-success" onClick={startBattle} className="me-2">
            Start Battle
          </Button>
          <Button variant="outline-primary" onClick={handleEdit} className="me-2">
            Edit
          </Button>
          <Button variant="outline-danger" onClick={handleDelete}>
            {confirmDelete ? 'Confirm Delete' : 'Delete'}
          </Button>
        </div>
      </div>
      
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header className={`faction-${army.faction}`}>
              <h5 className="mb-0">Army Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Faction:</strong><br />
                    {Factions.getDisplayName(army.faction)}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Total Points:</strong><br />
                    {army.totalPoints || 0}
                  </p>
                </Col>
              </Row>
              
              {army.description && (
                <Row>
                  <Col>
                    <p>
                      <strong>Description:</strong><br />
                      {army.description}
                    </p>
                  </Col>
                </Row>
              )}
              
              <Row>
                <Col>
                  <strong>Unit Composition:</strong><br />
                  <div className="mb-2">
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
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Unit Summary</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Type</th>
                    <th>Points</th>
                    <th>Wounds</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {unitDetails.map(unit => (
                    <tr key={unit.id}>
                      <td>{unit.name}</td>
                      <td>{getTypeDisplayName(unit.type)}</td>
                      <td>{unit.points || 0}</td>
                      <td>{unit.wounds || 1}</td>
                      <td>
                        <Button 
                          as={Link}
                          to={`/units/${unit.id}`}
                          variant="link"
                          size="sm"
                          className="p-0 text-decoration-none"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <h3>Unit Details</h3>
      
      {/* Group units by type */}
      {Object.values(UnitTypes)
        .filter(type => typeof type === 'string' && type !== 'getDisplayName')
        .map(unitType => {
          const unitsOfType = unitDetails.filter(unit => unit.type === unitType);
          
          if (unitsOfType.length === 0) {
            return null;
          }
          
          return (
            <Card key={unitType} className="mb-4">
              <Card.Header className={`unit-type-${unitType}`}>
                <h5 className="mb-0">{getTypeDisplayName(unitType)}</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {unitsOfType.map(unit => (
                    <Col key={unit.id} md={6} lg={4} className="mb-4">
                      <Card className="h-100">
                        <Card.Header>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">{unit.name}</span>
                            <span>{unit.points || 0} pts</span>
                          </div>
                        </Card.Header>
                        <Card.Body className="p-3">
                          <div className="small mb-2">
                            <strong>Stats:</strong> {unit.wounds || 1}W / 
                            {unit.courage ? ` ${unit.courage}C /` : ' - /'} 
                            {unit.speed || 2}S / 
                            <span className={DefenseDice.getColorClass(unit.defense)}>
                              {unit.defense === DefenseDice.WHITE ? 'W' : 'R'}
                            </span> Defense
                          </div>
                          
                          {unit.keywords && unit.keywords.length > 0 && (
                            <div className="small mb-2">
                              <strong>Keywords:</strong><br />
                              <div className="mt-1">
                                {unit.keywords.map((keyword, index) => (
                                  <Badge key={index} bg="secondary" className="me-1 mb-1">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {unit.weapons && unit.weapons.length > 0 && (
                            <div className="small">
                              <strong>Weapons:</strong>
                              <ListGroup variant="flush" className="mt-1">
                                {unit.weapons.map((weapon, index) => (
                                  <ListGroup.Item key={index} className="p-2">
                                    <div className="fw-bold">{weapon.name}</div>
                                    <div>{weapon.range}</div>
                                    {weapon.keywords && weapon.keywords.length > 0 && (
                                      <div>
                                        {weapon.keywords.join(', ')}
                                      </div>
                                    )}
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
                            </div>
                          )}
                        </Card.Body>
                        <Card.Footer className="p-2">
                          <Link 
                            to={`/units/${unit.id}`}
                            className="btn btn-sm btn-outline-primary w-100"
                          >
                            View Details
                          </Link>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          );
        })}
      
      <div className="d-flex justify-content-start mt-4">
        <Button variant="secondary" onClick={() => navigate('/armies')}>
          Back to Armies
        </Button>
      </div>
    </>
  );
};

export default ArmyDetail;