import React from 'react';
import { Badge, Card, ListGroup } from 'react-bootstrap';
import WeaponRanges from '../../enums/WeaponRanges';
import AttackDice from '../../enums/AttackDice';
import WeaponKeywords from '../../enums/WeaponKeywords';

const WeaponAvailabilityDisplay = ({ unit, upgrades = [] }) => {
    const getAvailableWeapons = () => {
        if (!unit.models || unit.models.length === 0) {
            return unit.weapons?.map(w => ({ ...w, source: 'Base Unit', count: 1 })) || [];
        }

        const aliveModels = unit.models.filter(m => m.isAlive);
        const weaponCounts = {};

        // Count weapons from alive models
        aliveModels.forEach(model => {
            model.weapons?.forEach(weapon => {
                const key = `${weapon.name}-${model.source || 'Base Unit'}`;
                if (!weaponCounts[key]) {
                    weaponCounts[key] = {
                        ...weapon,
                        source: model.source || 'Base Unit',
                        count: 0
                    };
                }
                weaponCounts[key].count++;
            });
        });

        return Object.values(weaponCounts);
    };

    const availableWeapons = getAvailableWeapons();

    if (availableWeapons.length === 0) {
        return (
            <Card>
                <Card.Body className="text-center text-muted">
                    No weapons available
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card>
            <Card.Header>
                <h6 className="mb-0">Available Weapons</h6>
            </Card.Header>
            <ListGroup variant="flush">
                {availableWeapons.map((weapon, index) => (
                    <ListGroup.Item key={index}>
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <strong>{weapon.name}</strong>
                                {weapon.count > 1 && (
                                    <Badge bg="secondary" className="ms-1">x{weapon.count}</Badge>
                                )}
                                <div className="small text-muted">{weapon.source}</div>
                            </div>
                            <Badge bg="primary">
                                {weapon.dice?.[AttackDice.RED] || 0}R{' '}
                                {weapon.dice?.[AttackDice.BLACK] || 0}B{' '}
                                {weapon.dice?.[AttackDice.WHITE] || 0}W
                            </Badge>
                        </div>
                        <div className="small mt-1">
                            <span className="me-3">
                                {WeaponRanges.getDisplayName?.(weapon.range) || weapon.range}
                            </span>
                            {weapon.keywords?.map((kw, i) => (
                                <Badge key={i} bg="light" text="dark" className="me-1">
                                    {WeaponKeywords.getDisplayName?.(kw) || kw}
                                </Badge>
                            ))}
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Card>
    );
};

export default WeaponAvailabilityDisplay;