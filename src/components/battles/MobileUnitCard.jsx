// src/components/battles/MobileUnitCard.jsx
import React, { useState } from 'react';
import { Card, Badge, Button, Row, Col, Collapse, ListGroup, Form, InputGroup } from 'react-bootstrap';
import Keywords from '../../enums/Keywords';
import WeaponKeywords from '../../enums/WeaponKeywords';
import WeaponRanges from '../../enums/WeaponRanges';
import AttackDice from '../../enums/AttackDice';
import DefenseDice from '../../enums/DefenseDice';
import WeaponKeywordHelper from '../common/WeaponKeywordHelper';

const MobileUnitCard = ({ unit, onUpdate, canEdit = false }) => {
    const [showWeapons, setShowWeapons] = useState(false);
    const [showKeywords, setShowKeywords] = useState(false);
    const [tokens, setTokens] = useState({
        aim: unit.tokens?.aim || 0,
        dodge: unit.tokens?.dodge || 0,
        surge: unit.tokens?.surge || 0,
        shield: unit.tokens?.shield || 0,
        ion: unit.tokens?.ion || 0,
        smoke: unit.tokens?.smoke || 0,
        standby: unit.tokens?.standby || 0
    });

    // Get available weapons based on casualties
    const getAvailableWeapons = () => {
        if (!unit.models || unit.models.length === 0) {
            return unit.weapons || [];
        }

        // Get weapons from alive models
        const aliveModels = unit.models.filter(m => m.isAlive);
        const availableWeapons = [];

        // Add base unit weapons if any models are alive
        if (aliveModels.length > 0 && unit.weapons) {
            unit.weapons.forEach(weapon => {
                availableWeapons.push({
                    ...weapon,
                    source: 'Base Unit',
                    count: aliveModels.filter(m => m.type === 'base').length
                });
            });
        }

        // Add upgrade weapons from alive models
        aliveModels.forEach(model => {
            if (model.weapons) {
                model.weapons.forEach(weapon => {
                    const existing = availableWeapons.find(w => 
                        w.name === weapon.name && w.source === model.source
                    );
                    
                    if (existing) {
                        existing.count = (existing.count || 1) + 1;
                    } else {
                        availableWeapons.push({
                            ...weapon,
                            source: model.source || 'Upgrade',
                            count: 1
                        });
                    }
                });
            }
        });

        return availableWeapons;
    };

    // Handle token updates
    const updateToken = (tokenType, change) => {
        if (!canEdit) return;

        const newValue = Math.max(0, tokens[tokenType] + change);
        const newTokens = { ...tokens, [tokenType]: newValue };
        setTokens(newTokens);

        onUpdate({ tokens: newTokens });
    };

    // Handle wound/suppression updates
    const updateValue = (field, change) => {
        if (!canEdit) return;

        let newValue;
        if (field === 'currentWounds') {
            newValue = Math.max(0, Math.min(unit.wounds, (unit.currentWounds || unit.wounds) + change));
        } else if (field === 'suppression') {
            newValue = Math.max(0, (unit.suppression || 0) + change);
        }

        onUpdate({ [field]: newValue });
    };

    const availableWeapons = getAvailableWeapons();
    const aliveModels = unit.models?.filter(m => m.isAlive).length || unit.minModelCount || 1;
    const totalModels = unit.models?.length || unit.minModelCount || 1;

    return (
        <div className="mobile-unit-card">
            {/* Unit Header */}
            <Card className="mb-3">
                <Card.Header className="p-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">{unit.name}</h6>
                        <Badge bg="secondary">{unit.points} pts</Badge>
                    </div>
                </Card.Header>
                <Card.Body className="p-2">
                    <Row className="text-center">
                        <Col xs={3}>
                            <div className="small text-muted">Wounds</div>
                            <div className="d-flex align-items-center justify-content-center">
                                {canEdit && (
                                    <Button 
                                        size="sm" 
                                        variant="outline-danger"
                                        onClick={() => updateValue('currentWounds', -1)}
                                        disabled={unit.currentWounds <= 0}
                                    >
                                        -
                                    </Button>
                                )}
                                <span className="mx-2">
                                    <strong>{unit.currentWounds || unit.wounds}/{unit.wounds}</strong>
                                </span>
                                {canEdit && (
                                    <Button 
                                        size="sm" 
                                        variant="outline-success"
                                        onClick={() => updateValue('currentWounds', 1)}
                                        disabled={unit.currentWounds >= unit.wounds}
                                    >
                                        +
                                    </Button>
                                )}
                            </div>
                        </Col>
                        
                        <Col xs={3}>
                            <div className="small text-muted">Models</div>
                            <strong>{aliveModels}/{totalModels}</strong>
                        </Col>
                        
                        <Col xs={3}>
                            <div className="small text-muted">Defense</div>
                            <strong className={DefenseDice.getColorClass(unit.defense)}>
                                {unit.defense === 'white' ? 'White' : 'Red'}
                            </strong>
                        </Col>
                        
                        <Col xs={3}>
                            <div className="small text-muted">Speed</div>
                            <strong>{unit.speed || 2}</strong>
                        </Col>
                    </Row>

                    {/* Suppression */}
                    <Row className="mt-2">
                        <Col>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="small">
                                    Suppression: <strong>{unit.suppression || 0}</strong>
                                    {unit.suppression >= 3 && (
                                        <Badge bg="warning" className="ms-1 small">Suppressed</Badge>
                                    )}
                                    {unit.suppression >= 6 && (
                                        <Badge bg="danger" className="ms-1 small">Panicked</Badge>
                                    )}
                                </span>
                                {canEdit && (
                                    <div>
                                        <Button 
                                            size="sm" 
                                            variant="outline-secondary"
                                            onClick={() => updateValue('suppression', -1)}
                                            disabled={unit.suppression <= 0}
                                        >
                                            -
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline-secondary"
                                            className="ms-1"
                                            onClick={() => updateValue('suppression', 1)}
                                        >
                                            +
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Tokens */}
            <Card className="mb-3">
                <Card.Header className="p-2">
                    <h6 className="mb-0">Tokens</h6>
                </Card.Header>
                <Card.Body className="p-2">
                    <Row className="g-2">
                        {Object.entries(tokens).map(([tokenType, count]) => {
                            if (count === 0 && !canEdit) return null;
                            
                            const tokenInfo = {
                                aim: { name: 'Aim', bg: 'primary', icon: '🎯' },
                                dodge: { name: 'Dodge', bg: 'success', icon: '🛡️' },
                                surge: { name: 'Surge', bg: 'warning', icon: '⚡' },
                                shield: { name: 'Shield', bg: 'info', icon: '🔵' },
                                ion: { name: 'Ion', bg: 'danger', icon: '⚡' },
                                smoke: { name: 'Smoke', bg: 'secondary', icon: '💨' },
                                standby: { name: 'Standby', bg: 'dark', icon: '⏸️' }
                            };

                            const token = tokenInfo[tokenType];
                            
                            return (
                                <Col xs={6} key={tokenType}>
                                    <div className="d-flex justify-content-between align-items-center small">
                                        <span>
                                            <Badge bg={token.bg} className="me-1">{token.icon}</Badge>
                                            {token.name}
                                        </span>
                                        <div className="d-flex align-items-center">
                                            {canEdit && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline-secondary"
                                                    onClick={() => updateToken(tokenType, -1)}
                                                    disabled={count <= 0}
                                                >
                                                    -
                                                </Button>
                                            )}
                                            <span className="mx-2"><strong>{count}</strong></span>
                                            {canEdit && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline-secondary"
                                                    onClick={() => updateToken(tokenType, 1)}
                                                >
                                                    +
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </Card.Body>
            </Card>

            {/* Weapons */}
            <Card className="mb-3">
                <Card.Header 
                    className="p-2 d-flex justify-content-between align-items-center"
                    onClick={() => setShowWeapons(!showWeapons)}
                    style={{ cursor: 'pointer' }}
                >
                    <h6 className="mb-0">Weapons ({availableWeapons.length})</h6>
                    <i className={`bi bi-chevron-${showWeapons ? 'up' : 'down'}`}></i>
                </Card.Header>
                <Collapse in={showWeapons}>
                    <Card.Body className="p-0">
                        <ListGroup variant="flush">
                            {availableWeapons.map((weapon, index) => (
                                <ListGroup.Item key={index} className="p-2">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <strong>{weapon.name}</strong>
                                            {weapon.count > 1 && (
                                                <Badge bg="secondary" className="ms-1 small">x{weapon.count}</Badge>
                                            )}
                                            <div className="small text-muted">{weapon.source}</div>
                                        </div>
                                    </div>
                                    <div className="small mt-1">
                                        <span className="me-3">
                                            {WeaponRanges.getDisplayName ? 
                                                WeaponRanges.getDisplayName(weapon.range) : weapon.range}
                                        </span>
                                        <span>
                                            {weapon.dice?.[AttackDice.RED] > 0 && 
                                                <span className="text-danger">{weapon.dice[AttackDice.RED]}R </span>
                                            }
                                            {weapon.dice?.[AttackDice.BLACK] > 0 && 
                                                <span>{weapon.dice[AttackDice.BLACK]}B </span>
                                            }
                                            {weapon.dice?.[AttackDice.WHITE] > 0 && 
                                                <span className="text-muted">{weapon.dice[AttackDice.WHITE]}W</span>
                                            }
                                        </span>
                                    </div>
                                    {weapon.keywords?.length > 0 && (
                                        <div className="small mt-1">
                                            <WeaponKeywordHelper keywords={weapon.keywords} variant="badge" />
                                        </div>
                                    )}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Body>
                </Collapse>
            </Card>

            {/* Keywords */}
            {unit.keywords?.length > 0 && (
                <Card className="mb-3">
                    <Card.Header 
                        className="p-2 d-flex justify-content-between align-items-center"
                        onClick={() => setShowKeywords(!showKeywords)}
                        style={{ cursor: 'pointer' }}
                    >
                        <h6 className="mb-0">Keywords ({unit.keywords.length})</h6>
                        <i className={`bi bi-chevron-${showKeywords ? 'up' : 'down'}`}></i>
                    </Card.Header>
                    <Collapse in={showKeywords}>
                        <Card.Body className="p-2">
                            <div className="d-flex flex-wrap gap-1">
                                {unit.keywords.map((keyword, index) => (
                                    <Badge key={index} bg="secondary">
                                        {Keywords.getDisplayName ? 
                                            Keywords.getDisplayName(keyword) : keyword}
                                    </Badge>
                                ))}
                            </div>
                        </Card.Body>
                    </Collapse>
                </Card>
            )}
        </div>
    );
};

export default MobileUnitCard;