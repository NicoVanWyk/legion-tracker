// src/components/units/UnitList.js
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import UnitTypes from '../../enums/UnitTypes';
import Factions from '../../enums/Factions';
import LoadingSpinner from '../layout/LoadingSpinner';

const UnitList = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterFaction, setFilterFaction] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [customUnitTypes, setCustomUnitTypes] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        
        // Create a reference to the user's units collection
        const unitsRef = collection(db, 'users', currentUser.uid, 'units');
        
        // Create a query against the collection
        const q = query(unitsRef);
        
        // Execute the query
        const querySnapshot = await getDocs(q);
        
        // Map through the documents
        const unitsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUnits(unitsList);
        setError('');
      } catch (err) {
        console.error('Error fetching units:', err);
        setError('Failed to fetch units. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCustomTypes = async () => {
    if (!currentUser) return;
      try {
          const typesSnap = await getDocs(collection(db, 'users', currentUser.uid, 'customUnitTypes'));
          setCustomUnitTypes(typesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
          console.error('Error fetching custom types:', err);
      }
    };
    fetchCustomTypes();

    if (currentUser) {
      fetchUnits();
    }
  }, [currentUser]);

  const getTypeDisplayName = (type) => {
    // Check if it's a system type
    if (Object.values(UnitTypes).includes(type)) {
        return UnitTypes.getDisplayName(type);
    }
    // Check if it's a custom type
    const customType = customUnitTypes.find(t => t.name === type);
    return customType ? customType.displayName : type;
  };

  // Apply filters
  const filteredUnits = units.filter(unit => {
    // Filter by faction
    if (filterFaction !== 'all' && unit.faction !== filterFaction) {
      return false;
    }
    
    // Filter by type
    if (filterType !== 'all' && unit.type !== filterType) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !unit.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Loading units..." />;
  }

  return (
    <>
      <Row className="mb-4">
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <h5>Filter Units</h5>
              <Row>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Faction</Form.Label>
                    <Form.Select 
                      value={filterFaction}
                      onChange={(e) => setFilterFaction(e.target.value)}
                    >
                      <option value="all">All Factions</option>
                      <option value={Factions.REPUBLIC}>{Factions.getDisplayName(Factions.REPUBLIC)}</option>
                      <option value={Factions.SEPARATIST}>{Factions.getDisplayName(Factions.SEPARATIST)}</option>
                      <option value={Factions.REBEL}>{Factions.getDisplayName(Factions.REBEL)}</option>
                      <option value={Factions.EMPIRE}>{Factions.getDisplayName(Factions.EMPIRE)}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Unit Type</Form.Label>
                    <Form.Select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <optgroup label="System Types">
                            {Object.values(UnitTypes).filter(t => typeof t !== 'function').map(t => (
                                <option key={t} value={t}>{UnitTypes.getDisplayName(t)}</option>
                            ))}
                        </optgroup>
                        {customUnitTypes.length > 0 && (
                            <optgroup label="Custom Types">
                                {customUnitTypes.map(t => (
                                    <option key={t.id} value={t.name}>{t.displayName}</option>
                                ))}
                            </optgroup>
                        )}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Search</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search unit name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <Button 
                          variant="outline-secondary"
                          onClick={() => setSearchTerm('')}
                        >
                          Clear
                        </Button>
                      )}
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {error && (
        <Row className="mb-4">
          <Col>
            <div className="alert alert-danger">{error}</div>
          </Col>
        </Row>
      )}
      
      {units.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4>No units found</h4>
            <p>You haven't created any units yet. Get started by creating your first unit!</p>
            <Button as={Link} to="/units/create" variant="primary">
              Create Unit
            </Button>
          </Card.Body>
        </Card>
      ) : filteredUnits.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4>No matching units</h4>
            <p>No units match your current filters. Try adjusting your filters.</p>
            <Button onClick={() => {
              setFilterFaction('all');
              setFilterType('all');
              setSearchTerm('');
            }} variant="outline-primary">
              Clear Filters
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {filteredUnits.map(unit => (
            <Col key={unit.id} md={6} lg={4} className="mb-4">
              <Card className={`unit-card unit-type-${unit.type}`}>
                <Card.Header className={`d-flex justify-content-between align-items-center faction-${unit.faction}`}>
                  <span>{unit.name}</span>
                  <Badge bg="secondary">{getTypeDisplayName(unit.type)}</Badge>
                </Card.Header>
                
                <Card.Body>
                  <div className="mb-2">
                    <strong>Faction:</strong> {Factions.getDisplayName(unit.faction)}
                  </div>
                  
                  <div className="mb-2">
                    <strong>Points:</strong> {unit.points || 0}
                  </div>
                  
                  <div className="mb-2">
                    <strong>Keywords:</strong><br />
                    {unit.keywords && unit.keywords.length > 0 ? (
                      unit.keywords.map((keyword, index) => (
                        <Badge key={index} bg="secondary" className="keyword-badge">
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted">None</span>
                    )}
                  </div>
                  
                  <Link to={`/units/${unit.id}`} className="btn btn-primary btn-sm mt-2">
                    View Details
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default UnitList;