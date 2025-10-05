// src/components/units/ArmyList.js
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import Factions from '../../enums/Factions';
import LoadingSpinner from '../layout/LoadingSpinner';

const ArmyList = () => {
  const [armies, setArmies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterFaction, setFilterFaction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchArmies = async () => {
      try {
        setLoading(true);
        
        // Create a reference to the user's armies collection
        const armiesRef = collection(db, 'users', currentUser.uid, 'armies');
        
        // Create a query against the collection
        const q = query(armiesRef);
        
        // Execute the query
        const querySnapshot = await getDocs(q);
        
        // Map through the documents
        const armiesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          unitCount: doc.data().units ? doc.data().units.length : 0,
          totalPoints: doc.data().totalPoints || 0
        }));
        
        setArmies(armiesList);
        setError('');
      } catch (err) {
        console.error('Error fetching armies:', err);
        setError('Failed to fetch armies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchArmies();
    }
  }, [currentUser]);

  // Apply filters
  const filteredArmies = armies.filter(army => {
    // Filter by faction
    if (filterFaction !== 'all' && army.faction !== filterFaction) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !army.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Loading armies..." />;
  }

  return (
    <>
      <Row className="mb-4">
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={5} className="mb-3 mb-md-0">
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
                
                <Col md={5} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label>Search</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search army name"
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
                
                <Col md={2} className="text-end">
                  <Button 
                    as={Link} 
                    to="/armies/create" 
                    variant="primary"
                    className="mt-3 mt-md-0"
                  >
                    Create Army
                  </Button>
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
      
      {armies.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4>No armies found</h4>
            <p>You haven't created any armies yet. Get started by creating your first army!</p>
            <Button as={Link} to="/armies/create" variant="primary">
              Create Army
            </Button>
          </Card.Body>
        </Card>
      ) : filteredArmies.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4>No matching armies</h4>
            <p>No armies match your current filters. Try adjusting your filters.</p>
            <Button onClick={() => {
              setFilterFaction('all');
              setSearchTerm('');
            }} variant="outline-primary">
              Clear Filters
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {filteredArmies.map(army => (
            <Col key={army.id} md={6} lg={4} className="mb-4">
              <Card className={`army-card faction-${army.faction}`}>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span>{army.name}</span>
                  <Badge 
                    bg="secondary"
                    style={{ 
                      backgroundColor: Factions.getColor(army.faction),
                      color: ['republic', 'rebel'].includes(army.faction) ? 'white' : 'white'
                    }}
                  >
                    {Factions.getDisplayName(army.faction)}
                  </Badge>
                </Card.Header>
                
                <Card.Body>
                  <div className="mb-2">
                    <strong>Points:</strong> {army.totalPoints || 0}
                  </div>
                  
                  <div className="mb-2">
                    <strong>Units:</strong> {army.unitCount || 0}
                  </div>
                  
                  <div className="mb-3">
                    <strong>Last Updated:</strong>{' '}
                    {army.updatedAt ? new Date(army.updatedAt.toDate()).toLocaleDateString() : 'Never'}
                  </div>
                  
                  <div className="d-flex">
                    <Link to={`/armies/${army.id}`} className="btn btn-primary btn-sm me-2">
                      View Details
                    </Link>
                    <Link to={`/armies/edit/${army.id}`} className="btn btn-outline-secondary btn-sm">
                      Edit
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default ArmyList;