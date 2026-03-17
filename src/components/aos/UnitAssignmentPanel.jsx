import React from 'react';
import {Card, ListGroup, Badge, Button, Row, Col} from 'react-bootstrap';
import AoSKeywords from '../../enums/aos/AoSKeywords';
import AoSUnitTypes from '../../enums/aos/AoSUnitTypes';

const UnitAssignmentPanel = ({
                                 availableUnits,
                                 commander,
                                 subCommanders = [],
                                 troops = [],
                                 onAssignment
                             }) => {
    const getUnit = (id) => availableUnits.find(u => u.id === id);

    const assignedIds = new Set([commander, ...subCommanders, ...troops].filter(Boolean));
    const unassignedUnits = availableUnits.filter(u => !assignedIds.has(u.id));
    const isHero = (unit) => unit?.keywords?.includes(AoSKeywords.HERO);

    const handleAssignCommander = (unitId) => {
        onAssignment('commander', [unitId]);
    };

    const handleAssignSubCommander = (unitId) => {
        if (subCommanders.length < 2) {
            onAssignment('subCommanders', [...subCommanders, unitId]);
        }
    };

    const handleRemoveSubCommander = (unitId) => {
        onAssignment('subCommanders', subCommanders.filter(id => id !== unitId));
    };

    const handleAssignTroop = (unitId) => {
        const unit = getUnit(unitId);
        const currentSlots = troops.reduce((total, id) => {
            const u = getUnit(id);
            return total + (u?.isReinforced ? 2 : 1);
        }, 0);
        const newSlots = unit?.isReinforced ? 2 : 1;

        if (currentSlots + newSlots <= 5) {
            onAssignment('troops', [...troops, unitId]);
        }
    };

    const handleRemoveTroop = (unitId) => {
        onAssignment('troops', troops.filter(id => id !== unitId));
    };

    const getTroopSlots = () => {
        return troops.reduce((total, id) => {
            const unit = getUnit(id);
            return total + (unit?.isReinforced ? 2 : 1);
        }, 0);
    };

    const UnitListItem = ({unit, onAssign, variant = 'primary', disabled = false}) => (
        <ListGroup.Item className="d-flex justify-content-between align-items-center">
            <div>
                <strong>{unit.name}</strong>
                <div className="small text-muted">
                    {AoSUnitTypes.getDisplayName(unit.type)} • {unit.points} pts
                    {unit.isReinforced && <Badge bg="success" className="ms-2">Reinforced</Badge>}
                </div>
                {unit.keywords && unit.keywords.length > 0 && (
                    <div className="mt-1">
                        {unit.keywords.slice(0, 3).map(kw => (
                            <Badge key={kw} bg="secondary" className="me-1" style={{fontSize: '0.65rem'}}>
                                {AoSKeywords.getDisplayName(kw)}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
            <Button variant={variant} size="sm" onClick={() => onAssign(unit.id)} disabled={disabled}>
                Assign
            </Button>
        </ListGroup.Item>
    );

    const AssignedUnitItem = ({unit, onRemove}) => (
        <ListGroup.Item className="d-flex justify-content-between align-items-center">
            <div>
                <strong>{unit.name}</strong>
                <div className="small text-muted">
                    {unit.points} pts
                    {unit.isReinforced && <Badge bg="success" className="ms-2">Reinforced (2 slots)</Badge>}
                </div>
            </div>
            <Button variant="outline-danger" size="sm" onClick={() => onRemove(unit.id)}>
                Remove
            </Button>
        </ListGroup.Item>
    );

    return (
        <Row>
            <Col md={8}>
                <Card className="mb-3">
                    <Card.Header className="bg-warning text-dark">
                        <strong>Commander (Required)</strong>
                    </Card.Header>
                    <Card.Body className="p-2">
                        {commander ? (
                            <ListGroup variant="flush">
                                <AssignedUnitItem
                                    unit={getUnit(commander)}
                                    onRemove={() => onAssignment('commander', [])}
                                />
                            </ListGroup>
                        ) : (
                            <div className="text-danger p-2">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                No commander assigned
                            </div>
                        )}
                    </Card.Body>
                </Card>

                <Card className="mb-3">
                    <Card.Header>
                        <strong>Sub-commanders ({subCommanders.length}/2)</strong>
                    </Card.Header>
                    <Card.Body className="p-2">
                        {subCommanders.length === 0 ? (
                            <div className="text-muted p-2">No sub-commanders assigned</div>
                        ) : (
                            <ListGroup variant="flush">
                                {subCommanders.map(id => (
                                    <AssignedUnitItem
                                        key={id}
                                        unit={getUnit(id)}
                                        onRemove={handleRemoveSubCommander}
                                    />
                                ))}
                            </ListGroup>
                        )}
                    </Card.Body>
                </Card>

                <Card className="mb-3">
                    <Card.Header className="bg-primary text-white">
                        <strong>Troops ({getTroopSlots()}/5 slots, need 2-5)</strong>
                    </Card.Header>
                    <Card.Body className="p-2">
                        {troops.length === 0 ? (
                            <div className="text-warning p-2">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                No troops assigned (minimum 2 slots required)
                            </div>
                        ) : (
                            <ListGroup variant="flush">
                                {troops.map(id => (
                                    <AssignedUnitItem key={id} unit={getUnit(id)} onRemove={handleRemoveTroop}/>
                                ))}
                            </ListGroup>
                        )}
                    </Card.Body>
                </Card>
            </Col>

            <Col md={4}>
                <Card>
                    <Card.Header>
                        <strong>Available Units ({unassignedUnits.length})</strong>
                    </Card.Header>
                    <Card.Body className="p-0" style={{maxHeight: '600px', overflowY: 'auto'}}>
                        {unassignedUnits.length === 0 ? (
                            <div className="p-3 text-muted">All units assigned</div>
                        ) : (
                            <>
                                {unassignedUnits.filter(isHero).length > 0 && (
                                    <>
                                        <div className="px-3 pt-3 pb-1 bg-light">
                                            <small className="text-muted">HEROES</small>
                                        </div>
                                        <ListGroup variant="flush">
                                            {unassignedUnits.filter(isHero).map(unit => (
                                                <UnitListItem
                                                    key={unit.id}
                                                    unit={unit}
                                                    onAssign={(id) => {
                                                        if (!commander) {
                                                            handleAssignCommander(id);
                                                        } else if (subCommanders.length < 2) {
                                                            handleAssignSubCommander(id);
                                                        }
                                                    }}
                                                    variant={!commander ? 'warning' : 'info'}
                                                    disabled={commander && subCommanders.length >= 2}
                                                />
                                            ))}
                                        </ListGroup>
                                    </>
                                )}

                                {unassignedUnits.filter(u => !isHero(u)).length > 0 && (
                                    <>
                                        <div className="px-3 pt-3 pb-1 bg-light">
                                            <small className="text-muted">TROOPS</small>
                                        </div>
                                        <ListGroup variant="flush">
                                            {unassignedUnits.filter(u => !isHero(u)).map(unit => (
                                                <UnitListItem
                                                    key={unit.id}
                                                    unit={unit}
                                                    onAssign={handleAssignTroop}
                                                    disabled={getTroopSlots() >= 5}
                                                />
                                            ))}
                                        </ListGroup>
                                    </>
                                )}
                            </>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default UnitAssignmentPanel;