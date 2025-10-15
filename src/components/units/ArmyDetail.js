// src/components/units/ArmyDetail.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Alert, Table, ListGroup, Accordion } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import UnitTypes from '../../enums/UnitTypes';
import Factions from '../../enums/Factions';
import DefenseDice from '../../enums/DefenseDice';
import Keywords from '../../enums/Keywords';
import WeaponKeywords from '../../enums/WeaponKeywords';
import WeaponRanges from '../../enums/WeaponRanges';
import AttackDice from '../../enums/AttackDice';
import LoadingSpinner from '../layout/LoadingSpinner';

const ArmyDetail = ({ armyId }) => {
  const [army, setArmy] = useState(null);
  const [unitDetails, setUnitDetails] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [customKeywords, setCustomKeywords] = useState([]);
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
          
          // Fetch custom keywords
          const keywordsRef = collection(db, 'users', currentUser.uid, 'customKeywords');
          const keywordsSnapshot = await getDocs(keywordsRef);
          const keywordsList = keywordsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCustomKeywords(keywordsList);

          // Fetch custom unit types
          const typesRef = collection(db, 'users', currentUser.uid, 'customUnitTypes');
          const typesSnapshot = await getDocs(typesRef);
          const typesList = typesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCustomUnitTypes(typesList);

          // Fetch all upgrades
          const upgradesRef = collection(db, 'users', currentUser.uid, 'upgradeCards');
          const upgradesSnapshot = await getDocs(upgradesRef);
          const upgradesList = upgradesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUpgrades(upgradesList);
          
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
            typesList.forEach(ct => {
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

  // Handle custom keywords
  const getKeywordDisplay = (keyword) => {
    if (keyword.startsWith('custom:')) {
      const customId = keyword.replace('custom:', '');
      const customKeyword = customKeywords.find(k => k.id === customId);
      return customKeyword ? (
        <>
          {customKeyword.name}
          <span className="ms-1" title="Custom Keyword">★</span>
        </>
      ) : keyword;
    }
    return Keywords.getDisplayName(keyword);
  };

  // Get all keywords including those from upgrades
  const getAllKeywords = (unit) => {
    if (!unit) return [];

    let allKeywords = [...(unit.keywords || [])];

    // Add keywords from equipped upgrades
    unit.upgradeSlots?.forEach(slot => {
      slot.equippedUpgrades?.forEach(upgradeId => {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (upgrade?.effects?.addKeywords?.length > 0) {
          allKeywords = [...allKeywords, ...upgrade.effects.addKeywords];
        }
      });
    });

    // Remove duplicates
    return [...new Set(allKeywords)];
  };

  // Get all equipped upgrades for a unit
  const getEquippedUpgrades = (unit) => {
    if (!unit || !unit.upgradeSlots) return [];

    const equippedUpgrades = [];
    unit.upgradeSlots.forEach(slot => {
      if (slot.equippedUpgrades) {
        slot.equippedUpgrades.forEach(upgradeId => {
          const upgrade = upgrades.find(u => u.id === upgradeId);
          if (upgrade) {
            equippedUpgrades.push({
              ...upgrade,
              slotType: slot.type
            });
          }
        });
      }
    });

    return equippedUpgrades;
  };

  // Combine base weapons with upgrade weapons
  const getAllWeapons = (unit) => {
    if (!unit) return [];

    const baseWeapons = unit.weapons || [];
    const upgradeWeapons = [];

    unit.upgradeSlots?.forEach(slot => {
      slot.equippedUpgrades?.forEach(upgradeId => {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (upgrade?.effects?.addWeapons?.length > 0) {
          upgrade.effects.addWeapons.forEach(weapon => {
            upgradeWeapons.push({
              ...weapon,
              source: upgrade.name
            });
          });
        }
      });
    });

    return [...baseWeapons.map(w => ({ ...w, source: 'Base Unit' })), ...upgradeWeapons];
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
                    <th>{/* Stats */}</th>
                    <th>{/* Actions */}</th>
                  </tr>
                </thead>
                <tbody>
                  {unitDetails.map(unit => (
                    <tr key={unit.id}>
                      <td>{unit.name}</td>
                      <td>{getTypeDisplayName(unit.type)}</td>
                      <td>{unit.points || 0}</td>
                      <td>{unit.wounds || 1}</td>
                      <td className="small text-nowrap">
                        {unit.isVehicle ? (
                          <span>{unit.resilience || 0}R</span>
                        ) : (
                          <span>{unit.courage || 0}C</span>
                        )} / {unit.speed || 2}S
                      </td>
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
                            {unit.isVehicle ? (
                              ` ${unit.resilience || 0}R /`
                            ) : (
                              ` ${unit.courage || 0}C /`
                            )} 
                            {unit.speed || 2}S / 
                            <span className={DefenseDice.getColorClass(unit.defense)}>
                              {unit.defense === DefenseDice.WHITE ? 'W' : 'R'}
                            </span> Defense
                          </div>
                          
                          {/* Keywords (including from upgrades) */}
                          {getAllKeywords(unit).length > 0 && (
                            <div className="small mb-2">
                              <strong>Keywords:</strong><br />
                              <div className="mt-1">
                                {getAllKeywords(unit).map((keyword, index) => (
                                  <Badge 
                                    key={`${unit.id}-kw-${index}`}
                                    bg={keyword.startsWith('custom:') ? 'info' : (
                                      unit.keywords && unit.keywords.includes(keyword) ? 'secondary' : 'success'
                                    )}
                                    className="me-1 mb-1"
                                  >
                                    {getKeywordDisplay(keyword)}
                                    {!unit.keywords?.includes(keyword) && (
                                      <span className="ms-1" title="From Upgrade">+</span>
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Weapons (including from upgrades) */}
                          {getAllWeapons(unit).length > 0 && (
                            <div className="small">
                              <strong>Weapons:</strong>
                              <Accordion className="mt-1">
                                <Accordion.Item eventKey="0">
                                  <Accordion.Header>
                                    <span className="small">{getAllWeapons(unit).length} weapon{getAllWeapons(unit).length !== 1 ? 's' : ''}</span>
                                  </Accordion.Header>
                                  <Accordion.Body className="p-0">
                                    <ListGroup variant="flush">
                                      {getAllWeapons(unit).map((weapon, index) => (
                                        <ListGroup.Item key={`${unit.id}-weapon-${index}`} className="p-2">
                                          <div className="d-flex justify-content-between">
                                            <strong>{weapon.name}</strong>
                                            <Badge bg={weapon.source === 'Base Unit' ? 'secondary' : 'info'} className="small">
                                              {weapon.source}
                                            </Badge>
                                          </div>
                                          <div>
                                            {WeaponRanges.getDisplayName ? WeaponRanges.getDisplayName(weapon.range) : weapon.range} | 
                                            {weapon.dice?.[AttackDice.RED] > 0 && (
                                              <span className="text-danger"> {weapon.dice[AttackDice.RED]}R</span>
                                            )}
                                            {weapon.dice?.[AttackDice.BLACK] > 0 && (
                                              <span> {weapon.dice[AttackDice.BLACK]}B</span>
                                            )}
                                            {weapon.dice?.[AttackDice.WHITE] > 0 && (
                                              <span className="text-muted"> {weapon.dice[AttackDice.WHITE]}W</span>
                                            )}
                                          </div>
                                          {weapon.keywords?.length > 0 && (
                                            <div className="small text-muted">
                                              {weapon.keywords.map(keyword => 
                                                WeaponKeywords.getDisplayName ? WeaponKeywords.getDisplayName(keyword) : keyword
                                              ).join(', ')}
                                            </div>
                                          )}
                                        </ListGroup.Item>
                                      ))}
                                    </ListGroup>
                                  </Accordion.Body>
                                </Accordion.Item>
                              </Accordion>
                            </div>
                          )}
                          
                          {/* Equipped upgrades */}
                          {getEquippedUpgrades(unit).length > 0 && (
                            <div className="small mt-2">
                              <strong>Upgrades:</strong>
                              <Accordion className="mt-1">
                                <Accordion.Item eventKey="0">
                                  <Accordion.Header>
                                    <span className="small">{getEquippedUpgrades(unit).length} upgrade{getEquippedUpgrades(unit).length !== 1 ? 's' : ''}</span>
                                  </Accordion.Header>
                                  <Accordion.Body className="p-0">
                                    <ListGroup variant="flush">
                                      {getEquippedUpgrades(unit).map((upgrade, index) => (
                                        <ListGroup.Item key={`${unit.id}-upgrade-${index}`} className="p-2">
                                          <div className="d-flex justify-content-between align-items-center">
                                            <strong>{upgrade.name}</strong>
                                            <Badge bg="warning" text="dark">
                                              {upgrade.pointsCost || 0} pts
                                            </Badge>
                                          </div>
                                          <div className="text-muted">{upgrade.description}</div>
                                        </ListGroup.Item>
                                      ))}
                                    </ListGroup>
                                  </Accordion.Body>
                                </Accordion.Item>
                              </Accordion>
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
      
      {/* Display custom unit types */}
      {customUnitTypes.map(customType => {
        const unitsOfType = unitDetails.filter(unit => unit.type === customType.name);
        
        if (unitsOfType.length === 0) {
          return null;
        }
        
        return (
          <Card key={customType.id} className="mb-4">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">{customType.displayName}</h5>
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
                          {unit.isVehicle ? (
                            ` ${unit.resilience || 0}R /`
                          ) : (
                            ` ${unit.courage || 0}C /`
                          )} 
                          {unit.speed || 2}S / 
                          <span className={DefenseDice.getColorClass(unit.defense)}>
                            {unit.defense === DefenseDice.WHITE ? 'W' : 'R'}
                          </span> Defense
                        </div>
                        
                        {/* Keywords (including from upgrades) */}
                        {getAllKeywords(unit).length > 0 && (
                          <div className="small mb-2">
                            <strong>Keywords:</strong><br />
                            <div className="mt-1">
                              {getAllKeywords(unit).map((keyword, index) => (
                                <Badge 
                                  key={`${unit.id}-kw-${index}`}
                                  bg={keyword.startsWith('custom:') ? 'info' : (
                                    unit.keywords && unit.keywords.includes(keyword) ? 'secondary' : 'success'
                                  )}
                                  className="me-1 mb-1"
                                >
                                  {getKeywordDisplay(keyword)}
                                  {!unit.keywords?.includes(keyword) && (
                                    <span className="ms-1" title="From Upgrade">+</span>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Weapons (including from upgrades) */}
                        {getAllWeapons(unit).length > 0 && (
                          <div className="small">
                            <strong>Weapons:</strong>
                            <Accordion className="mt-1">
                              <Accordion.Item eventKey="0">
                                <Accordion.Header>
                                  <span className="small">{getAllWeapons(unit).length} weapon{getAllWeapons(unit).length !== 1 ? 's' : ''}</span>
                                </Accordion.Header>
                                <Accordion.Body className="p-0">
                                  <ListGroup variant="flush">
                                    {getAllWeapons(unit).map((weapon, index) => (
                                      <ListGroup.Item key={`${unit.id}-weapon-${index}`} className="p-2">
                                        <div className="d-flex justify-content-between">
                                          <strong>{weapon.name}</strong>
                                          <Badge bg={weapon.source === 'Base Unit' ? 'secondary' : 'info'} className="small">
                                            {weapon.source}
                                          </Badge>
                                        </div>
                                        <div>
                                          {WeaponRanges.getDisplayName ? WeaponRanges.getDisplayName(weapon.range) : weapon.range} | 
                                          {weapon.dice?.[AttackDice.RED] > 0 && (
                                            <span className="text-danger"> {weapon.dice[AttackDice.RED]}R</span>
                                          )}
                                          {weapon.dice?.[AttackDice.BLACK] > 0 && (
                                            <span> {weapon.dice[AttackDice.BLACK]}B</span>
                                          )}
                                          {weapon.dice?.[AttackDice.WHITE] > 0 && (
                                            <span className="text-muted"> {weapon.dice[AttackDice.WHITE]}W</span>
                                          )}
                                        </div>
                                        {weapon.keywords?.length > 0 && (
                                          <div className="small text-muted">
                                            {weapon.keywords.map(keyword => 
                                              WeaponKeywords.getDisplayName ? WeaponKeywords.getDisplayName(keyword) : keyword
                                            ).join(', ')}
                                          </div>
                                        )}
                                      </ListGroup.Item>
                                    ))}
                                  </ListGroup>
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
                          </div>
                        )}
                        
                        {/* Equipped upgrades */}
                        {getEquippedUpgrades(unit).length > 0 && (
                          <div className="small mt-2">
                            <strong>Upgrades:</strong>
                            <Accordion className="mt-1">
                              <Accordion.Item eventKey="0">
                                <Accordion.Header>
                                  <span className="small">{getEquippedUpgrades(unit).length} upgrade{getEquippedUpgrades(unit).length !== 1 ? 's' : ''}</span>
                                </Accordion.Header>
                                <Accordion.Body className="p-0">
                                  <ListGroup variant="flush">
                                    {getEquippedUpgrades(unit).map((upgrade, index) => (
                                      <ListGroup.Item key={`${unit.id}-upgrade-${index}`} className="p-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                          <strong>{upgrade.name}</strong>
                                          <Badge bg="warning" text="dark">
                                            {upgrade.pointsCost || 0} pts
                                          </Badge>
                                        </div>
                                        <div className="text-muted">{upgrade.description}</div>
                                      </ListGroup.Item>
                                    ))}
                                  </ListGroup>
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
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