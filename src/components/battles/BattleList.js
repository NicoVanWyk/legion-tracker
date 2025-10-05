// src/components/battles/BattleList.js
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import BattlePhases from '../../enums/BattlePhases';
import PlayerSides from '../../enums/PlayerSides';
import LoadingSpinner from '../layout/LoadingSpinner';

const BattleList = () => {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchBattles = async () => {
      try {
        setLoading(true);
        
        // Create a reference to the user's battles collection
        const battlesRef = collection(db, 'users', currentUser.uid, 'battles');
        
        // Create a query against the collection, ordered by creation date
        const q = query(battlesRef, orderBy('createdAt', 'desc'));
        
        // Execute the query
        const querySnapshot = await getDocs(q);
        
        // Map through the documents
        const battlesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
        }));
        
        setBattles(battlesList);
        setError('');
      } catch (err) {
        console.error('Error fetching battles:', err);
        setError('Failed to fetch battles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchBattles();
    }
  }, [currentUser]);

  // Helper to determine if a battle is active
  const isBattleActive = (battle) => {
    // A battle is considered active if it has not reached the last round
    // or if it doesn't have a winner set
    return !battle.isComplete && !battle.winner;
  };

  // Apply filters
  const filteredBattles = battles.filter(battle => {
    // Filter by status
    if (filterStatus === 'active' && !isBattleActive(battle)) {
      return false;
    }
    
    if (filterStatus === 'completed' && isBattleActive(battle)) {
      return false;
    }
    
    // Filter by search term (match name, blue player, red player, or army names)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const nameMatches = battle.name?.toLowerCase().includes(searchLower);
      const bluePlayerMatches = battle.bluePlayer?.toLowerCase().includes(searchLower);
      const redPlayerMatches = battle.redPlayer?.toLowerCase().includes(searchLower);
      const blueArmyMatches = battle.blueArmy?.toLowerCase().includes(searchLower);
      const redArmyMatches = battle.redArmy?.toLowerCase().includes(searchLower);
      
      if (!nameMatches && !bluePlayerMatches && !redPlayerMatches && 
          !blueArmyMatches && !redArmyMatches) {
        return false;
      }
    }
    
    return true;
  });

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <LoadingSpinner text="Loading battles..." />;
  }

  return (
    <>
      <Row className="mb-4">
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={4} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Battles</option>
                      <option value="active">Active Battles</option>
                      <option value="completed">Completed Battles</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={5} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label>Search</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search battle name or players"
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
                
                <Col md={3} className="text-end">
                  <Button 
                    as={Link} 
                    to="/battles/create" 
                    variant="primary"
                    className="mt-3 mt-md-0"
                  >
                    New Battle
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
      
      {battles.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4>No battles found</h4>
            <p>You haven't created any battles yet. Start your first battle to track your games!</p>
            <Button as={Link} to="/battles/create" variant="primary">
              Start New Battle
            </Button>
          </Card.Body>
        </Card>
      ) : filteredBattles.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4>No matching battles</h4>
            <p>No battles match your current filters. Try adjusting your search criteria.</p>
            <Button onClick={() => {
              setFilterStatus('all');
              setSearchTerm('');
            }} variant="outline-primary">
              Clear Filters
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {filteredBattles.map(battle => (
            <Col key={battle.id} md={6} className="mb-4">
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span>{battle.name || 'Untitled Battle'}</span>
                  <Badge 
                    bg={isBattleActive(battle) ? "success" : "secondary"}
                  >
                    {isBattleActive(battle) ? "Active" : "Completed"}
                  </Badge>
                </Card.Header>
                
                <Card.Body>
                  <Row className="mb-3">
                    <Col xs={6}>
                      <div className="p-2" style={{ background: PlayerSides.getColor(PlayerSides.BLUE) + '20', borderRadius: '5px' }}>
                        <div className="fw-bold text-primary">{battle.bluePlayer || 'Blue Player'}</div>
                        <div className="small">{battle.blueArmy || 'Unknown Army'}</div>
                        {battle.winner === PlayerSides.BLUE && (
                          <Badge bg="primary" className="mt-1">Winner</Badge>
                        )}
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="p-2" style={{ background: PlayerSides.getColor(PlayerSides.RED) + '20', borderRadius: '5px' }}>
                        <div className="fw-bold text-danger">{battle.redPlayer || 'Red Player'}</div>
                        <div className="small">{battle.redArmy || 'Unknown Army'}</div>
                        {battle.winner === PlayerSides.RED && (
                          <Badge bg="danger" className="mt-1">Winner</Badge>
                        )}
                      </div>
                    </Col>
                  </Row>
                  
                  {isBattleActive(battle) && (
                    <div className="mb-3">
                      <strong>Current Status:</strong><br />
                      Round {battle.currentRound || 1}, {BattlePhases.getDisplayName(battle.currentPhase || BattlePhases.COMMAND)}
                      <div className="mt-2">
                        <strong>Active Player:</strong>{' '}
                        <span className={battle.activePlayer === PlayerSides.BLUE ? 'text-primary' : 'text-danger'}>
                          {battle.activePlayer === PlayerSides.BLUE ? battle.bluePlayer : battle.redPlayer}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <strong>Created:</strong> {formatDate(battle.createdAt)}<br />
                    <strong>Last Updated:</strong> {formatDate(battle.lastUpdated)}
                  </div>
                  
                  <div className="d-flex">
                    <Link to={`/battles/${battle.id}`} className="btn btn-primary btn-sm me-2">
                      {isBattleActive(battle) ? 'Continue Battle' : 'View Details'}
                    </Link>
                    {isBattleActive(battle) && (
                      <Link to={`/battles/${battle.id}/edit`} className="btn btn-outline-secondary btn-sm">
                        Edit Details
                      </Link>
                    )}
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

export default BattleList;