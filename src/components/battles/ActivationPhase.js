// src/components/battles/ActivationPhase.js
import React, { useState } from 'react';
import { Row, Col, Card, ListGroup, Button, Badge, Form } from 'react-bootstrap';
import PlayerSides from '../../enums/PlayerSides';
import UnitTracker from './UnitTracker';

const ActivationPhase = ({ battle, onUnitUpdate, onSetSelectedUnit }) => {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedSide, setSelectedSide] = useState(null);
  
  // Handle unit activation
  const activateUnit = (side, unitId) => {
    const units = side === PlayerSides.BLUE ? battle.blueUnits : battle.redUnits;
    const unit = units.find(u => u.id === unitId);
    
    if (unit) {
      // Set unit as activated
      onUnitUpdate(side, unitId, { hasActivated: true });
      
      // Show unit tracker
      setSelectedUnit(unit);
      setSelectedSide(side);
    }
  };
  
  // Handle unit updates from the tracker
  const handleUnitTrackerUpdate = (updates) => {
    if (selectedUnit && selectedSide) {
      onUnitUpdate(selectedSide, selectedUnit.id, updates);
      
      // Update the selected unit locally to reflect changes in the tracker
      setSelectedUnit(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleSelectUnit = (unit, side) => {
    setSelectedUnit(unit);
    setSelectedSide(side);

    // Notify parent component about selected unit for reminders
    if (onSetSelectedUnit) {
        onSetSelectedUnit(unit);
    }
  };
  
  // Close the unit tracker
  const closeUnitTracker = () => {
    setSelectedUnit(null);
    setSelectedSide(null);
  };
  
  // Render units for a specific side
  const renderUnits = (side) => {
    const units = side === PlayerSides.BLUE ? battle.blueUnits : battle.redUnits;
    const player = side === PlayerSides.BLUE ? battle.bluePlayer : battle.redPlayer;
    const color = side === PlayerSides.BLUE ? 'primary' : 'danger';
    const isActivePlayer = battle.activePlayer === side;
    
    return (
      <Card className={`mb-4 ${isActivePlayer ? `border-${color}` : ''}`}>
        <Card.Header 
          className={`${isActivePlayer ? `bg-${color} text-white` : ''} d-flex justify-content-between align-items-center`}
        >
          <h5 className="mb-0">{player}'s Units</h5>
          <div>
            {isActivePlayer && <Badge bg="success">Active Player</Badge>}
          </div>
        </Card.Header>
        <Card.Body className={isActivePlayer ? '' : 'opacity-75'}>
          <div className="mb-3">
            <strong>Activated:</strong> {units.filter(u => u.hasActivated).length}/{units.length} Units
          </div>
          
          <ListGroup>
            {units.map(unit => {
              const hasOrder = unit.hasOrder;
              const hasActivated = unit.hasActivated;
              
              return (
                <ListGroup.Item 
                  key={unit.id} 
                  className="d-flex justify-content-between align-items-center"
                  variant={hasActivated ? 'light' : (hasOrder ? 'info' : 'white')}
                >
                  <div>
                    <div className="fw-bold">
                      {unit.name}
                    </div>
                    <div className="small">
                      Wounds: {unit.currentWounds}/{unit.wounds} | 
                      Suppression: {unit.suppression || 0}
                    </div>
                    {hasActivated && <Badge bg="secondary" className="me-1">Activated</Badge>}
                    {hasOrder && <Badge bg="info" className="me-1">Order</Badge>}
                    {unit.suppression >= 3 && <Badge bg="warning">Suppressed</Badge>}
                    {unit.suppression >= 6 && <Badge bg="danger">Panicked</Badge>}
                  </div>
                  
                  <div>
                      <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleSelectUnit(unit, side)}
                          className="me-2"
                          disabled={!isActivePlayer}
                      >
                          View
                      </Button>
                    
                    <Button
                      variant={hasActivated ? "secondary" : "success"}
                      size="sm"
                      onClick={() => activateUnit(side, unit.id)}
                      disabled={hasActivated || !isActivePlayer}
                    >
                      {hasActivated ? "Activated" : "Activate"}
                    </Button>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Card.Body>
      </Card>
    );
  };
  
  return (
    <div className="activation-phase mt-4">
      <h4 className="mb-3">Activation Phase</h4>
      <p className="mb-4">
        Activate units to perform actions. Each unit can be activated once per round.
      </p>
      
      <Row>
        <Col md={6}>
          {renderUnits(PlayerSides.BLUE)}
        </Col>
        
        <Col md={6}>
          {renderUnits(PlayerSides.RED)}
        </Col>
      </Row>
      
      {/* Unit Tracker Modal */}
      {selectedUnit && (
        <Card className="mt-4">
          <Card.Header className={`bg-${selectedSide === PlayerSides.BLUE ? 'primary' : 'danger'} text-white d-flex justify-content-between align-items-center`}>
            <h5 className="mb-0">Unit Tracker: {selectedUnit.name}</h5>
            <Button 
              variant="outline-light" 
              size="sm"
              onClick={closeUnitTracker}
            >
              Close Tracker
            </Button>
          </Card.Header>
          <Card.Body>
            <UnitTracker 
              unit={selectedUnit} 
              onUpdate={handleUnitTrackerUpdate}
            />
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ActivationPhase;