// src/components/units/UnitDetail.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Alert, ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import UnitTypes from '../../enums/UnitTypes';
import Factions from '../../enums/Factions';
import DefenseDice from '../../enums/DefenseDice';
import LoadingSpinner from '../layout/LoadingSpinner';

const UnitDetail = ({ unitId }) => {
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        setLoading(true);
        
        const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
        const unitDoc = await getDoc(unitRef);
        
        if (unitDoc.exists()) {
          setUnit({
            id: unitDoc.id,
            ...unitDoc.data()
          });
        } else {
          setError('Unit not found');
        }
      } catch (err) {
        console.error('Error fetching unit:', err);
        setError('Failed to fetch unit details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && unitId) {
      fetchUnit();
    }
  }, [currentUser, unitId]);

  const handleEdit = () => {
    navigate(`/units/edit/${unitId}`);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'users', currentUser.uid, 'units', unitId));
      navigate('/units');
    } catch (err) {
      console.error('Error deleting unit:', err);
      setError('Failed to delete unit. Please try again later.');
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
  };

  if (loading) {
    return <LoadingSpinner text="Loading unit details..." />;
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
        <div className="mt-3">
          <Button variant="primary" onClick={() => navigate('/units')}>
            Back to Units
          </Button>
        </div>
      </Alert>
    );
  }

  if (!unit) {
    return (
      <Alert variant="warning">
        Unit not found.
        <div className="mt-3">
          <Button variant="primary" onClick={() => navigate('/units')}>
            Back to Units
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <>
      {confirmDelete && (
        <Alert variant="danger">
          <Alert.Heading>Confirm Delete</Alert.Heading>
          <p>Are you sure you want to delete this unit? This action cannot be undone.</p>
          <div className="d-flex justify-content-end">
            <Button variant="outline-secondary" onClick={cancelDelete} className="me-2">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Unit
            </Button>
          </div>
        </Alert>
      )}
      
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>{unit.name}</h2>
            <div>
              <Button variant="outline-primary" onClick={handleEdit} className="me-2">
                Edit
              </Button>
              <Button variant="outline-danger" onClick={handleDelete}>
                {confirmDelete ? 'Confirm Delete' : 'Delete'}
              </Button>
            </div>
          </div>
          
          <Card className="mb-4">
            <Card.Header className={`faction-${unit.faction}`}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Unit Information</h5>
                <Badge bg="secondary">{UnitTypes.getDisplayName(unit.type)}</Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <p><strong>Faction:</strong> {Factions.getDisplayName(unit.faction)}</p>
                </Col>
                <Col md={3}>
                  <p><strong>Points:</strong> {unit.points || 0}</p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Stats:</strong> {unit.wounds || 1}W / 
                    {unit.courage ? ` ${unit.courage}C /` : ' - /'} 
                    {unit.speed || 2}S / 
                    <span className={DefenseDice.getColorClass(unit.defense)}>
                      {unit.defense === 'white' ? 'W' : 'R'}
                    </span> Defense
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Keywords</h5>
                </Card.Header>
                <Card.Body>
                  {unit.keywords && unit.keywords.length > 0 ? (
                    <div>
                      {unit.keywords.map((keyword, index) => (
                        <Badge 
                          key={index} 
                          bg="secondary" 
                          className="me-2 mb-2 p-2"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No keywords assigned to this unit.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Weapons</h5>
                </Card.Header>
                <Card.Body>
                  {unit.weapons && unit.weapons.length > 0 ? (
                    <ListGroup variant="flush">
                      {unit.weapons.map((weapon, index) => (
                        <ListGroup.Item key={index}>
                          <h6>{weapon.name}</h6>
                          <div className="small">
                            <strong>Range:</strong> {weapon.range}
                          </div>
                          <div className="small">
                            <strong>Dice:</strong> 
                            {weapon.dice?.red > 0 && <span className="text-danger"> {weapon.dice.red}R</span>}
                            {weapon.dice?.black > 0 && <span> {weapon.dice.black}B</span>}
                            {weapon.dice?.white > 0 && <span className="text-muted"> {weapon.dice.white}W</span>}
                          </div>
                          {weapon.keywords && weapon.keywords.length > 0 && (
                            <div className="small">
                              <strong>Keywords:</strong>{' '}
                              {weapon.keywords.join(', ')}
                            </div>
                          )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p className="text-muted">No weapons assigned to this unit.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {unit.miniatures && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Miniature Information</h5>
              </Card.Header>
              <Card.Body>
                <p>{unit.miniatures}</p>
              </Card.Body>
            </Card>
          )}
          
          {unit.notes && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Notes</h5>
              </Card.Header>
              <Card.Body>
                <p>{unit.notes}</p>
              </Card.Body>
            </Card>
          )}
          
          <div className="d-flex justify-content-start mt-4">
            <Button variant="secondary" onClick={() => navigate('/units')}>
              Back to Units
            </Button>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default UnitDetail;