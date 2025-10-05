// src/components/battles/BattleControls.js
import React from 'react';
import { Row, Col, Button, Card, Badge } from 'react-bootstrap';
import BattlePhases from '../../enums/BattlePhases';
import PlayerSides from '../../enums/PlayerSides';

const BattleControls = ({ battle, onAdvancePhase, onChangeActivePlayer, onEndBattle }) => {
  // Get next phase name for button
  const getNextPhaseName = () => {
    const nextPhase = BattlePhases.getNextPhase(battle.currentPhase);
    
    if (battle.currentPhase === BattlePhases.END && nextPhase === BattlePhases.COMMAND) {
      return `Start Round ${battle.currentRound + 1}`;
    }
    
    return `Advance to ${BattlePhases.getDisplayName(nextPhase)}`;
  };
  
  // Helper to get player name and army
  const getPlayerInfo = (side) => {
    if (side === PlayerSides.BLUE) {
      return {
        name: battle.bluePlayer,
        army: battle.blueArmy,
        units: battle.blueUnits,
        color: 'primary',
        bgColor: '#f0f8ff'
      };
    } else {
      return {
        name: battle.redPlayer,
        army: battle.redArmy,
        units: battle.redUnits,
        color: 'danger',
        bgColor: '#fff0f0'
      };
    }
  };
  
  // Get active player info
  const activePlayerInfo = getPlayerInfo(battle.activePlayer);
  
  // Count activated units for each side
  const blueActivatedCount = battle.blueUnits.filter(unit => unit.hasActivated).length;
  const redActivatedCount = battle.redUnits.filter(unit => unit.hasActivated).length;
  
  // Count units with orders for each side
  const blueOrdersCount = battle.blueUnits.filter(unit => unit.hasOrder).length;
  const redOrdersCount = battle.redUnits.filter(unit => unit.hasOrder).length;
  
  // Calculate total units for each side
  const blueTotalUnits = battle.blueUnits.length;
  const redTotalUnits = battle.redUnits.length;
  
  // Check if all units of the active player have been activated
  const allActivePlayerUnitsActivated = battle.activePlayer === PlayerSides.BLUE
    ? blueActivatedCount === blueTotalUnits
    : redActivatedCount === redTotalUnits;
  
  return (
    <>
      <Row className="mb-4">
        {/* Battle Statistics */}
        <Col md={8}>
          <Card>
            <Card.Body>
              <Row>
                <Col sm={6}>
                  <div className="p-3" style={{ background: '#f0f8ff', borderRadius: '5px' }}>
                    <h5 className="text-primary">
                      {battle.bluePlayer}
                      {battle.activePlayer === PlayerSides.BLUE && (
                        <Badge bg="primary" className="ms-2">Active</Badge>
                      )}
                    </h5>
                    <div>
                      <strong>Army:</strong> {battle.blueArmy}
                    </div>
                    <div>
                      <strong>Units:</strong> {battle.blueUnits.length}
                    </div>
                    <div>
                      <strong>Activated:</strong> {blueActivatedCount}/{blueTotalUnits}
                    </div>
                    <div>
                      <strong>Orders:</strong> {blueOrdersCount}/{blueTotalUnits}
                    </div>
                  </div>
                </Col>
                
                <Col sm={6}>
                  <div className="p-3" style={{ background: '#fff0f0', borderRadius: '5px' }}>
                    <h5 className="text-danger">
                      {battle.redPlayer}
                      {battle.activePlayer === PlayerSides.RED && (
                        <Badge bg="danger" className="ms-2">Active</Badge>
                      )}
                    </h5>
                    <div>
                      <strong>Army:</strong> {battle.redArmy}
                    </div>
                    <div>
                      <strong>Units:</strong> {battle.redUnits.length}
                    </div>
                    <div>
                      <strong>Activated:</strong> {redActivatedCount}/{redTotalUnits}
                    </div>
                    <div>
                      <strong>Orders:</strong> {redOrdersCount}/{redTotalUnits}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Active Player */}
        <Col md={4}>
          <Card className={`border-${activePlayerInfo.color}`}>
            <Card.Header className={`bg-${activePlayerInfo.color} text-white`}>
              <h5 className="mb-0">Active Player</h5>
            </Card.Header>
            <Card.Body className="text-center" style={{ background: activePlayerInfo.bgColor }}>
              <h4 className={`text-${activePlayerInfo.color} mb-3`}>
                {activePlayerInfo.name}
              </h4>
              <div className="mb-3">
                {activePlayerInfo.army}
              </div>
              <Button
                variant="outline-secondary"
                onClick={onChangeActivePlayer}
                size="sm"
              >
                Switch Active Player
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col>
          <div className="battle-phase-description p-3 mb-3" style={{ background: '#f8f9fa', borderRadius: '5px' }}>
            <h5>{BattlePhases.getDisplayName(battle.currentPhase)}</h5>
            <p className="mb-0">
              {BattlePhases.getDescription(battle.currentPhase)}
            </p>
          </div>
          
          <div className="d-flex justify-content-between">
            <div>
              <Button
                variant="primary"
                onClick={onAdvancePhase}
                disabled={battle.currentPhase === BattlePhases.ACTIVATION && !allActivePlayerUnitsActivated}
              >
                {getNextPhaseName()}
              </Button>
              
              {battle.currentPhase === BattlePhases.ACTIVATION && !allActivePlayerUnitsActivated && (
                <small className="d-block text-muted mt-1">
                  All {battle.activePlayer === PlayerSides.BLUE ? 'Blue' : 'Red'} units must be activated 
                  before advancing to the next phase.
                </small>
              )}
            </div>
            
            <Button
              variant="danger"
              onClick={onEndBattle}
            >
              End Battle
            </Button>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default BattleControls;