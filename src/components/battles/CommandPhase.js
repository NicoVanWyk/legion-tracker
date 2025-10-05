// src/components/battles/CommandPhase.js
import React, { useState } from 'react';
import { Row, Col, Card, ListGroup, Button, Form, Badge } from 'react-bootstrap';
import UnitTypes from '../../enums/UnitTypes';
import PlayerSides from '../../enums/PlayerSides';

const CommandPhase = ({ battle, onUnitUpdate }) => {
  const [selectedCommandCards, setSelectedCommandCards] = useState({
    blue: '',
    red: ''
  });
  
  // Toggle order status for a unit
  const toggleUnitOrder = (side, unitId) => {
    const units = side === PlayerSides.BLUE ? battle.blueUnits : battle.redUnits;
    const unit = units.find(u => u.id === unitId);
    
    if (unit) {
      onUnitUpdate(side, unitId, { hasOrder: !unit.hasOrder });
    }
  };
  
  // Handle command card selection
  const handleCommandCardChange = (side, value) => {
    setSelectedCommandCards(prev => ({
      ...prev,
      [side.toLowerCase()]: value
    }));
  };
  
  // Render units by type for a specific side
  const renderUnitsByType = (side) => {
    const units = side === PlayerSides.BLUE ? battle.blueUnits : battle.redUnits;
    const player = side === PlayerSides.BLUE ? battle.bluePlayer : battle.redPlayer;
    const color = side === PlayerSides.BLUE ? 'primary' : 'danger';
    
    // Group units by type
    const unitsByType = units.reduce((acc, unit) => {
      const type = unit.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(unit);
      return acc;
    }, {});
    
    // Sort unit types by priority
    const sortedTypes = Object.keys(unitsByType).sort((a, b) => {
      const typeOrder = {
        [UnitTypes.COMMAND]: 1,
        [UnitTypes.CORPS]: 2,
        [UnitTypes.SPECIAL_FORCES]: 3,
        [UnitTypes.SUPPORT]: 4,
        [UnitTypes.HEAVY]: 5,
        [UnitTypes.OPERATIVE]: 6,
        [UnitTypes.AUXILIARY]: 7
      };
      
      return typeOrder[a] - typeOrder[b];
    });
    
    return (
      <>
        <Card className="mb-3">
          <Card.Header className={`bg-${color} text-white d-flex justify-content-between align-items-center`}>
            <h5 className="mb-0">{player}'s Command Card</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group>
              <Form.Control
                as="select"
                value={selectedCommandCards[side.toLowerCase()]}
                onChange={(e) => handleCommandCardChange(side, e.target.value)}
              >
                <option value="">Select Command Card</option>
                <option value="Ambush">Ambush (0 Pips)</option>
                <option value="Push">Push (1 Pip)</option>
                <option value="Assault">Assault (2 Pips)</option>
                <option value="Standing Orders">Standing Orders (4 Pips)</option>
                <option value="Custom">Custom Command Card</option>
              </Form.Control>
            </Form.Group>
          </Card.Body>
        </Card>
      
        {sortedTypes.map(type => (
          <Card key={type} className="mb-3">
            <Card.Header className={`bg-${color} text-white d-flex justify-content-between align-items-center`}>
              <span>{UnitTypes.getDisplayName(type)}</span>
              <span>
                {unitsByType[type].filter(unit => unit.hasOrder).length}/{unitsByType[type].length} Orders
              </span>
            </Card.Header>
            <ListGroup variant="flush">
              {unitsByType[type].map(unit => (
                <ListGroup.Item 
                  key={unit.id} 
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    {unit.name}
                    {unit.hasOrder && <Badge bg="success" className="ms-2">Order</Badge>}
                  </div>
                  <Button 
                    variant={unit.hasOrder ? "outline-success" : "outline-secondary"} 
                    size="sm"
                    onClick={() => toggleUnitOrder(side, unit.id)}
                  >
                    {unit.hasOrder ? "Remove Order" : "Issue Order"}
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        ))}
      </>
    );
  };
  
  return (
    <div className="command-phase mt-4">
      <h4 className="mb-3">Command Phase</h4>
      <p className="mb-4">
        Select command cards and issue orders to units on the battlefield.
      </p>
      
      <Row>
        <Col md={6}>
          <h5 className="text-primary mb-3">Blue Side: {battle.bluePlayer}</h5>
          {renderUnitsByType(PlayerSides.BLUE)}
        </Col>
        
        <Col md={6}>
          <h5 className="text-danger mb-3">Red Side: {battle.redPlayer}</h5>
          {renderUnitsByType(PlayerSides.RED)}
        </Col>
      </Row>
    </div>
  );
};

export default CommandPhase;