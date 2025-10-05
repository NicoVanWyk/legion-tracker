// src/components/battles/EndPhase.js
import React from 'react';
import { Row, Col, Card, ListGroup, Button, Badge } from 'react-bootstrap';
import PlayerSides from '../../enums/PlayerSides';
import UnitTracker from './UnitTracker';

const EndPhase = ({ battle, onUnitUpdate }) => {
  // Handle removing all tokens from a unit
  const handleRemoveAllTokens = (side, unitId) => {
    onUnitUpdate(side, unitId, {
      tokens: {
        aim: 0,
        dodge: 0,
        surge: 0,
        // Don't reset shield tokens if the unit has Generator keyword
        shield: side === PlayerSides.BLUE
          ? battle.blueUnits.find(u => u.id === unitId)?.tokens?.shield || 0
          : battle.redUnits.find(u => u.id === unitId)?.tokens?.shield || 0,
        ion: 0,
        smoke: 0,
        standby: 0
      }
    });
  };
  
  // Handle removing suppression tokens
  const handleRallyStep = (side, unitId) => {
    const units = side === PlayerSides.BLUE ? battle.blueUnits : battle.redUnits;
    const unit = units.find(u => u.id === unitId);
    
    if (unit) {
      // In the Rally step, a unit can remove up to one suppression token
      const newSuppression = Math.max(0, (unit.suppression || 0) - 1);
      onUnitUpdate(side, unitId, { suppression: newSuppression });
    }
  };
  
  // Handle recover step (remove all suppression)
  const handleRecover = (side, unitId) => {
    const units = side === PlayerSides.BLUE ? battle.blueUnits : battle.redUnits;
    const unit = units.find(u => u.id === unitId);
    
    if (unit) {
      // Perform a recover action - remove all suppression
      onUnitUpdate(side, unitId, { suppression: 0 });
    }
  };
  
  // Render units for a specific side
  const renderUnits = (side) => {
    const units = side === PlayerSides.BLUE ? battle.blueUnits : battle.redUnits;
    const player = side === PlayerSides.BLUE ? battle.bluePlayer : battle.redPlayer;
    const color = side === PlayerSides.BLUE ? 'primary' : 'danger';
    
    return (
      <Card className="mb-4">
        <Card.Header className={`bg-${color} text-white`}>
          <h5 className="mb-0">{player}'s Units</h5>
        </Card.Header>
        <Card.Body>
          {units.map(unit => (
            <Card key={unit.id} className="mb-3">
              <Card.Header>
                <h6 className="mb-0">{unit.name}</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="fw-bold">Unit Status:</div>
                  <div>Wounds: {unit.currentWounds}/{unit.wounds}</div>
                  <div>
                    Suppression: {unit.suppression || 0}
                    {unit.suppression >= 3 && (
                      <Badge bg="warning" className="ms-2">Suppressed</Badge>
                    )}
                    {unit.suppression >= 6 && (
                      <Badge bg="danger" className="ms-2">Panicked</Badge>
                    )}
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="fw-bold">Tokens:</div>
                  <div className="d-flex flex-wrap">
                    {unit.tokens?.aim > 0 && (
                      <Badge bg="primary" className="me-2 mb-1">Aim: {unit.tokens.aim}</Badge>
                    )}
                    {unit.tokens?.dodge > 0 && (
                      <Badge bg="success" className="me-2 mb-1">Dodge: {unit.tokens.dodge}</Badge>
                    )}
                    {unit.tokens?.surge > 0 && (
                      <Badge bg="warning" className="me-2 mb-1">Surge: {unit.tokens.surge}</Badge>
                    )}
                    {unit.tokens?.shield > 0 && (
                      <Badge bg="info" className="me-2 mb-1">Shield: {unit.tokens.shield}</Badge>
                    )}
                    {unit.tokens?.ion > 0 && (
                      <Badge bg="danger" className="me-2 mb-1">Ion: {unit.tokens.ion}</Badge>
                    )}
                    {unit.tokens?.smoke > 0 && (
                      <Badge bg="secondary" className="me-2 mb-1">Smoke: {unit.tokens.smoke}</Badge>
                    )}
                    {unit.tokens?.standby > 0 && (
                      <Badge bg="dark" className="me-2 mb-1">Standby: {unit.tokens.standby}</Badge>
                    )}
                  </div>
                </div>
                
                <div className="d-flex flex-wrap">
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className="me-2 mb-2"
                    onClick={() => handleRallyStep(side, unit.id)}
                    disabled={(unit.suppression || 0) === 0}
                  >
                    Rally Step (-1 Suppression)
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className="me-2 mb-2"
                    onClick={() => handleRecover(side, unit.id)}
                    disabled={(unit.suppression || 0) === 0}
                  >
                    Recover (Clear Suppression)
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className="mb-2"
                    onClick={() => handleRemoveAllTokens(side, unit.id)}
                  >
                    Remove Unspent Tokens
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </Card.Body>
      </Card>
    );
  };
  
  return (
    <div className="end-phase mt-4">
      <h4 className="mb-3">End Phase</h4>
      <p className="mb-4">
        Remove unspent tokens, perform the Rally step for suppressed units, and prepare for the next round.
      </p>
      
      <Row>
        <Col md={6}>
          {renderUnits(PlayerSides.BLUE)}
        </Col>
        
        <Col md={6}>
          {renderUnits(PlayerSides.RED)}
        </Col>
      </Row>
    </div>
  );
};

export default EndPhase;