// src/components/battles/MobileActivationPhase.jsx
import React, { useState } from 'react';
import { Card, Button, Badge, ListGroup, Alert, Offcanvas } from 'react-bootstrap';
import PlayerSides from '../../enums/PlayerSides';
import MobileUnitCard from './MobileUnitCard';
import CasualtyQuickLogger from './CasualtyQuickLogger';

const MobileActivationPhase = ({ battle, onUnitUpdate, onSetSelectedUnit, userTurn }) => {
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedSide, setSelectedSide] = useState(null);
    const [showUnitDetail, setShowUnitDetail] = useState(false);
    const [showCasualtyLogger, setShowCasualtyLogger] = useState(false);

    // Get user's units based on active player
    const getUserUnits = () => {
        return battle.activePlayer === PlayerSides.BLUE ? battle.blueUnits : battle.redUnits;
    };

    // Get opponent's units
    const getOpponentUnits = () => {
        return battle.activePlayer === PlayerSides.BLUE ? battle.redUnits : battle.blueUnits;
    };

    // Handle unit activation
    const activateUnit = (unitId) => {
        const side = battle.activePlayer;
        const unit = getUserUnits().find(u => u.id === unitId);
        
        if (unit && !unit.hasActivated) {
            onUnitUpdate(side, unitId, { hasActivated: true });
        }
    };

    // Handle selecting a unit for details
    const handleSelectUnit = (unit, side) => {
        setSelectedUnit(unit);
        setSelectedSide(side);
        setShowUnitDetail(true);
        
        if (onSetSelectedUnit) {
            onSetSelectedUnit(unit);
        }
    };

    // Get random unactivated unit without orders
    const getRandomUnit = () => {
        const userUnits = getUserUnits();
        const eligibleUnits = userUnits.filter(unit => 
            !unit.hasActivated && !unit.hasOrder
        );
        
        if (eligibleUnits.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * eligibleUnits.length);
        return eligibleUnits[randomIndex];
    };

    // Handle casualty logging
    const handleLogCasualty = (unit, side) => {
        setSelectedUnit(unit);
        setSelectedSide(side);
        setShowCasualtyLogger(true);
    };

    const userUnits = getUserUnits();
    const opponentUnits = getOpponentUnits();
    const activatedCount = userUnits.filter(u => u.hasActivated).length;
    const totalUnits = userUnits.length;
    const randomUnit = getRandomUnit();

    return (
        <div className="mobile-activation-phase">
            {/* Phase Header */}
            <Card className="mb-3">
                <Card.Header className="bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Activation Phase</h6>
                        <Badge bg="light" text="dark">
                            {activatedCount}/{totalUnits} Activated
                        </Badge>
                    </div>
                </Card.Header>
                <Card.Body className="p-2">
                    <div className="progress mb-2">
                        <div 
                            className="progress-bar" 
                            role="progressbar" 
                            style={{ width: `${(activatedCount / totalUnits) * 100}%` }}
                        >
                            {Math.round((activatedCount / totalUnits) * 100)}%
                        </div>
                    </div>
                    
                    {userTurn ? (
                        <div className="text-center">
                            <small className="text-muted">
                                Activate your units or pass turn to opponent
                            </small>
                        </div>
                    ) : (
                        <Alert variant="info" className="mb-0 p-2">
                            <small>
                                Waiting for {battle.activePlayer === PlayerSides.BLUE ? battle.bluePlayer : battle.redPlayer} to activate units
                            </small>
                        </Alert>
                    )}
                </Card.Body>
            </Card>

            {/* Random Unit Selector */}
            {userTurn && randomUnit && (
                <Card className="mb-3">
                    <Card.Header className="bg-warning text-dark p-2">
                        <h6 className="mb-0">Random Activation</h6>
                    </Card.Header>
                    <Card.Body className="p-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{randomUnit.name}</strong>
                                <div className="small text-muted">No order token</div>
                            </div>
                            <Button 
                                size="sm"
                                variant="warning"
                                onClick={() => activateUnit(randomUnit.id)}
                            >
                                Activate
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Your Units */}
            {userTurn && (
                <Card className="mb-3">
                    <Card.Header className="bg-success text-white p-2">
                        <h6 className="mb-0">Your Units</h6>
                    </Card.Header>
                    <ListGroup variant="flush">
                        {userUnits.map(unit => (
                            <ListGroup.Item 
                                key={unit.id}
                                className="d-flex justify-content-between align-items-center p-2"
                            >
                                <div className="flex-grow-1" onClick={() => handleSelectUnit(unit, battle.activePlayer)}>
                                    <div className="d-flex justify-content-between">
                                        <strong>{unit.name}</strong>
                                        <div className="d-flex gap-1">
                                            {unit.hasOrder && <Badge bg="info" className="small">Order</Badge>}
                                            {unit.hasActivated && <Badge bg="secondary" className="small">Done</Badge>}
                                            {unit.suppression >= 3 && <Badge bg="warning" className="small">Suppressed</Badge>}
                                        </div>
                                    </div>
                                    <div className="small text-muted">
                                        {unit.currentWounds}/{unit.wounds} wounds
                                        {unit.suppression > 0 && ` • ${unit.suppression} suppression`}
                                    </div>
                                </div>
                                
                                <div className="d-flex gap-1">
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLogCasualty(unit, battle.activePlayer);
                                        }}
                                    >
                                        <i className="bi bi-heart-break"></i>
                                    </Button>
                                    
                                    {!unit.hasActivated && (
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                activateUnit(unit.id);
                                            }}
                                        >
                                            Activate
                                        </Button>
                                    )}
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card>
            )}

            {/* Opponent Units (View Only) */}
            <Card className="mb-3">
                <Card.Header className="bg-danger text-white p-2">
                    <h6 className="mb-0">
                        {battle.activePlayer === PlayerSides.BLUE ? battle.redPlayer : battle.bluePlayer}'s Units
                    </h6>
                </Card.Header>
                <ListGroup variant="flush">
                    {opponentUnits.map(unit => (
                        <ListGroup.Item 
                            key={unit.id}
                            className="d-flex justify-content-between align-items-center p-2"
                            onClick={() => handleSelectUnit(unit, battle.activePlayer === PlayerSides.BLUE ? PlayerSides.RED : PlayerSides.BLUE)}
                        >
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between">
                                    <strong>{unit.name}</strong>
                                    <div className="d-flex gap-1">
                                        {unit.hasOrder && <Badge bg="info" className="small">Order</Badge>}
                                        {unit.hasActivated && <Badge bg="secondary" className="small">Done</Badge>}
                                    </div>
                                </div>
                                <div className="small text-muted">
                                    {unit.currentWounds}/{unit.wounds} wounds
                                </div>
                            </div>
                            
                            <Button
                                size="sm"
                                variant="outline-primary"
                            >
                                <i className="bi bi-eye"></i>
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card>

            {/* Unit Detail Offcanvas */}
            <Offcanvas 
                show={showUnitDetail} 
                onHide={() => setShowUnitDetail(false)}
                placement="bottom"
                style={{ height: '70vh' }}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{selectedUnit?.name}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {selectedUnit && (
                        <MobileUnitCard 
                            unit={selectedUnit}
                            onUpdate={(updates) => onUnitUpdate(selectedSide, selectedUnit.id, updates)}
                            canEdit={userTurn && selectedSide === battle.activePlayer}
                        />
                    )}
                </Offcanvas.Body>
            </Offcanvas>

            {/* Casualty Logger Offcanvas */}
            <Offcanvas
                show={showCasualtyLogger}
                onHide={() => setShowCasualtyLogger(false)}
                placement="bottom"
                style={{ height: '50vh' }}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Log Casualties - {selectedUnit?.name}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {selectedUnit && (
                        <CasualtyQuickLogger
                            unit={selectedUnit}
                            onUpdateModels={(models) => onUnitUpdate(selectedSide, selectedUnit.id, { models })}
                            onClose={() => setShowCasualtyLogger(false)}
                        />
                    )}
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
};

export default MobileActivationPhase;