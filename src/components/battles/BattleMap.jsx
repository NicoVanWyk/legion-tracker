import React, {useState} from 'react';
import {Card, Button, Badge, ButtonGroup, Alert} from 'react-bootstrap';
import PlayerSides from '../../enums/PlayerSides';

const DEPLOY_ZONE_WIDTH = 3; // tiles from each edge
const LEGION_ACTIONS = ['Move', 'Attack', 'Aim', 'Dodge', 'Standby', 'Recover', 'Coordinate'];

// All tiles a unit covers given its anchor position and size
const getUnitTiles = unit => {
    if (!unit.mapPosition) return [];
    const sx = unit.battleMapSizeX || 1;
    const sy = unit.battleMapSizeY || 1;
    const tiles = [];
    for (let dx = 0; dx < sx; dx++)
        for (let dy = 0; dy < sy; dy++)
            tiles.push(`${unit.mapPosition.x + dx},${unit.mapPosition.y + dy}`);
    return tiles;
};

const BattleMap = ({battle, onUnitUpdate, isDeploymentPhase = false}) => {
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [reachable, setReachable] = useState(new Set());
    const [deployingUnit, setDeployingUnit] = useState(null);
    const [tileSize, setTileSize] = useState(28);

    // Support both old width/height and new widthTools/heightTools
    const mapW = battle.mapConfig?.widthTools
        ? battle.mapConfig.widthTools * 3
        : (battle.mapConfig?.width || 24);
    const mapH = battle.mapConfig?.heightTools
        ? battle.mapConfig.heightTools * 3
        : (battle.mapConfig?.height || 12);

    // Returns map of "x,y" -> { unit, side, isAnchor }
    const getOccupied = () => {
        const map = {};
        const add = (units, side) =>
            units?.forEach(unit => {
                getUnitTiles(unit).forEach((key, idx) => {
                    map[key] = {unit, side, isAnchor: idx === 0};
                });
            });
        add(battle.blueUnits, PlayerSides.BLUE);
        add(battle.redUnits, PlayerSides.RED);
        return map;
    };

    const getUndeployed = side =>
        (side === PlayerSides.BLUE ? battle.blueUnits : battle.redUnits)
            ?.filter(u => !u.mapPosition) || [];

    // Check the full footprint of a unit fits at anchor (ax, ay) and has no collisions
    const footprintFits = (unit, ax, ay, occupied, excludeId = null) => {
        const sx = unit.battleMapSizeX || 1;
        const sy = unit.battleMapSizeY || 1;
        for (let dx = 0; dx < sx; dx++)
            for (let dy = 0; dy < sy; dy++) {
                const nx = ax + dx, ny = ay + dy;
                if (nx < 0 || nx >= mapW || ny < 0 || ny >= mapH) return false;
                const occ = occupied[`${nx},${ny}`];
                if (occ && occ.unit.id !== excludeId) return false;
            }
        return true;
    };

    const allInDeployZone = (unit, ax, side) => {
        const sx = unit.battleMapSizeX || 1;
        for (let dx = 0; dx < sx; dx++) {
            const nx = ax + dx;
            if (side === PlayerSides.BLUE ? nx >= DEPLOY_ZONE_WIDTH : nx < mapW - DEPLOY_ZONE_WIDTH)
                return false;
        }
        return true;
    };

    const computeReachable = (unit, pos, occupied) => {
        const spd = unit.speed || 2;
        const tiles = new Set();
        for (let dx = -spd; dx <= spd; dx++)
            for (let dy = -(spd - Math.abs(dx)); dy <= spd - Math.abs(dx); dy++) {
                const nx = pos.x + dx, ny = pos.y + dy;
                if (footprintFits(unit, nx, ny, occupied, unit.id))
                    tiles.add(`${nx},${ny}`);
            }
        tiles.delete(`${pos.x},${pos.y}`);
        return tiles;
    };

    const handleSelectUnit = (unit, side) => {
        if (selectedUnit?.unit.id === unit.id) {
            setSelectedUnit(null);
            setReachable(new Set());
            return;
        }
        const occupied = getOccupied();
        setSelectedUnit({unit, side});
        setReachable(
            unit.mapPosition && !unit.hasActivated
                ? computeReachable(unit, unit.mapPosition, occupied)
                : new Set()
        );
    };

    const handleTileClick = (x, y) => {
        const occupied = getOccupied();

        if (deployingUnit) {
            const {unit, side} = deployingUnit;
            if (footprintFits(unit, x, y, occupied) && allInDeployZone(unit, x, side)) {
                onUnitUpdate(side, unit.id, {mapPosition: {x, y}});
                setDeployingUnit(null);
            }
            return;
        }

        if (selectedUnit && reachable.has(`${x},${y}`)) {
            const updates = {mapPosition: {x, y}, hasMoved: true};
            onUnitUpdate(selectedUnit.side, selectedUnit.unit.id, updates);
            const updatedUnit = {...selectedUnit.unit, ...updates};
            setSelectedUnit(prev => ({...prev, unit: updatedUnit}));
            setReachable(new Set());
        }
    };

    const handleAction = action => {
        if (!selectedUnit) return;
        const {unit, side} = selectedUnit;
        let updates = {};

        if (action === 'Move') {
            const occupied = getOccupied();
            setReachable(unit.mapPosition
                ? computeReachable(unit, unit.mapPosition, occupied) : new Set());
            return;
        }
        if (action === 'Aim') updates = {tokens: {...unit.tokens, aim: (unit.tokens?.aim || 0) + 1}};
        if (action === 'Dodge') updates = {tokens: {...unit.tokens, dodge: (unit.tokens?.dodge || 0) + 1}};
        if (action === 'Standby') updates = {tokens: {...unit.tokens, standby: (unit.tokens?.standby || 0) + 1}};
        if (action === 'Recover') updates = {
            tokens: {
                ...unit.tokens, ion: 0,
                suppression: Math.max(0, (unit.tokens?.suppression || 0) - 1)
            }
        };
        if (action === 'Coordinate') updates = {tokens: {...unit.tokens, aim: (unit.tokens?.aim || 0) + 1}};

        if (Object.keys(updates).length) {
            onUnitUpdate(side, unit.id, updates);
            setSelectedUnit(prev => ({...prev, unit: {...prev.unit, ...updates}}));
        }
    };

    const handleDeactivate = () => {
        if (!selectedUnit) return;
        onUnitUpdate(selectedUnit.side, selectedUnit.unit.id, {hasActivated: true});
        setSelectedUnit(null);
        setReachable(new Set());
    };

    const occupied = getOccupied();

    const getTileBg = (x, y, occEntry) => {
        const key = `${x},${y}`;
        const selPos = selectedUnit?.unit.mapPosition;
        if (selPos && x === selPos.x && y === selPos.y) return '#ffd700';
        if (reachable.has(key)) return '#93c9ff';
        if (deployingUnit && !occEntry) {
            if (footprintFits(deployingUnit.unit, x, y, occupied)
                && allInDeployZone(deployingUnit.unit, x, deployingUnit.side)) return '#b3ffb3';
        }
        if (x < DEPLOY_ZONE_WIDTH) return '#d8eaf8';
        if (x >= mapW - DEPLOY_ZONE_WIDTH) return '#f8d8d8';
        return '#e6ede6';
    };

    const getToken = (unit, side, isAnchor) => {
        if (!isAnchor) {
            // Sub-tile: show faction colour fill only
            const bg = side === PlayerSides.BLUE ? 'rgba(13,110,253,0.25)' : 'rgba(220,53,69,0.25)';
            return <div style={{width: '100%', height: '100%', backgroundColor: bg}}/>;
        }
        const isSelected = selectedUnit?.unit.id === unit.id;
        const bg = side === PlayerSides.BLUE ? '#0d6efd' : '#dc3545';
        const sz = Math.max(14, tileSize - 8);
        const initials = unit.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const sx = unit.battleMapSizeX || 1;
        const sy = unit.battleMapSizeY || 1;

        return (
            <div style={{
                width: sz, height: sz, borderRadius: '50%', backgroundColor: bg,
                border: isSelected ? '3px solid #ffd700' : '2px solid rgba(0,0,0,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: Math.max(7, sz * 0.32), fontWeight: 'bold',
                opacity: unit.hasActivated ? 0.42 : 1, userSelect: 'none', position: 'relative',
                flexShrink: 0,
            }}
                 title={`${unit.name} · Spd ${unit.speed || 2} · Def ${(unit.defense || 'W').toUpperCase()} · Size ${sx}×${sy} tiles`}>
                {initials}
                {(sx > 1 || sy > 1) && (
                    <span style={{
                        position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)',
                        fontSize: 6, color: 'rgba(255,255,255,.85)', whiteSpace: 'nowrap'
                    }}>
                        {sx}×{sy}
                    </span>
                )}
                {(unit.tokens?.aim > 0) && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4, width: 11, height: 11,
                        borderRadius: '50%', background: '#198754', fontSize: 7,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                    }}>
                        {unit.tokens.aim}
                    </span>
                )}
                {(unit.tokens?.dodge > 0) && (
                    <span style={{
                        position: 'absolute', bottom: -4, right: -4, width: 11, height: 11,
                        borderRadius: '50%', background: '#0dcaf0', fontSize: 7,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000'
                    }}>
                        {unit.tokens.dodge}
                    </span>
                )}
            </div>
        );
    };

    return (
        <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center py-2">
                <strong>Battle Map</strong>
                <div className="d-flex align-items-center gap-3">
                    <small className="text-muted">
                        {mapW}×{mapH} tiles
                        {' · '}1 tile ≈ 27mm (⅓ move tool)
                        {' · '}{Math.round(mapW / 3)}×{Math.round(mapH / 3)} move tools
                    </small>
                    <ButtonGroup size="sm">
                        <Button variant="outline-secondary"
                                onClick={() => setTileSize(t => Math.max(16, t - 4))}>−</Button>
                        <Button variant="outline-secondary"
                                onClick={() => setTileSize(t => Math.min(52, t + 4))}>+</Button>
                    </ButtonGroup>
                </div>
            </Card.Header>

            <Card.Body className="p-2">
                {isDeploymentPhase && (
                    <div className="d-flex gap-3 mb-2">
                        {[PlayerSides.BLUE, PlayerSides.RED].map(side => (
                            <div key={side} style={{flex: 1}}>
                                <small className={`fw-bold text-${side === PlayerSides.BLUE ? 'primary' : 'danger'}`}>
                                    {side === PlayerSides.BLUE ? 'Blue' : 'Red'} — click unit, then place in shaded zone
                                </small>
                                <div className="d-flex flex-wrap gap-1 mt-1">
                                    {getUndeployed(side).map(u => (
                                        <Badge key={u.id}
                                               bg={deployingUnit?.unit.id === u.id
                                                   ? 'warning'
                                                   : side === PlayerSides.BLUE ? 'primary' : 'danger'}
                                               text={deployingUnit?.unit.id === u.id ? 'dark' : undefined}
                                               style={{cursor: 'pointer'}}
                                               onClick={() => setDeployingUnit(
                                                   deployingUnit?.unit.id === u.id ? null : {unit: u, side}
                                               )}>
                                            {u.name}
                                            {((u.battleMapSizeX || 1) > 1 || (u.battleMapSizeY || 1) > 1) && (
                                                <span className="ms-1 opacity-75">
                                                    {u.battleMapSizeX || 1}×{u.battleMapSizeY || 1}
                                                </span>
                                            )}
                                        </Badge>
                                    ))}
                                    {getUndeployed(side).length === 0 &&
                                        <small className="text-muted">All deployed</small>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {deployingUnit && (
                    <Alert variant="info" className="py-1 px-2 mb-2 small">
                        Placing <strong>{deployingUnit.unit.name}</strong>{' '}
                        ({deployingUnit.unit.battleMapSizeX || 1}×{deployingUnit.unit.battleMapSizeY || 1} tiles)
                        — click a valid highlighted tile in the{' '}
                        <strong>{deployingUnit.side === PlayerSides.BLUE ? 'blue' : 'red'}</strong> zone.
                        <Button size="sm" variant="link" className="py-0 px-1"
                                onClick={() => setDeployingUnit(null)}>Cancel</Button>
                    </Alert>
                )}

                <div style={{overflowX: 'auto', overflowY: 'auto', maxHeight: 440}}>
                    <div style={{display: 'inline-flex', flexDirection: 'column'}}>
                        {Array.from({length: mapH}, (_, y) => (
                            <div key={y} style={{display: 'flex'}}>
                                {Array.from({length: mapW}, (_, x) => {
                                    const key = `${x},${y}`;
                                    const occEntry = occupied[key];
                                    return (
                                        <div key={key}
                                             style={{
                                                 width: tileSize, height: tileSize, flexShrink: 0,
                                                 border: '1px solid #bbb',
                                                 backgroundColor: getTileBg(x, y, occEntry),
                                                 cursor: 'pointer',
                                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                 padding: 0,
                                             }}
                                             onClick={() => occEntry
                                                 ? handleSelectUnit(occEntry.unit, occEntry.side)
                                                 : handleTileClick(x, y)
                                             }>
                                            {occEntry && getToken(occEntry.unit, occEntry.side, occEntry.isAnchor)}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-2" style={{fontSize: '0.72rem'}}>
                    <span style={{background: '#d8eaf8', padding: '2px 6px', borderRadius: 3}}>Blue deploy zone</span>
                    <span style={{background: '#f8d8d8', padding: '2px 6px', borderRadius: 3}}>Red deploy zone</span>
                    <span style={{background: '#93c9ff', padding: '2px 6px', borderRadius: 3}}>Move range</span>
                    <span style={{background: '#ffd700', padding: '2px 6px', borderRadius: 3}}>Selected</span>
                </div>

                {selectedUnit && (() => {
                    const {unit, side} = selectedUnit;
                    const sx = unit.battleMapSizeX || 1, sy = unit.battleMapSizeY || 1;
                    return (
                        <div className="p-2 border rounded mt-2"
                             style={{background: side === PlayerSides.BLUE ? '#f0f8ff' : '#fff0f0'}}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <strong>{unit.name}</strong>
                                    <div className="small text-muted">
                                        Spd {unit.speed || 2}
                                        {' · '}Def <span
                                        className={`fw-bold ${unit.defense === 'red' ? 'text-danger' : ''}`}>
                                            {(unit.defense || 'white').toUpperCase()}
                                        </span>
                                        {' · '}{unit.wounds || 1}W
                                        {' · '}Size {sx}×{sy} tiles ({Math.round(sx / 3 * 76)}×{Math.round(sy / 3 * 76)}mm)
                                        {unit.hasMoved && <Badge bg="secondary" className="ms-2"
                                                                 style={{fontSize: '0.65rem'}}>Moved</Badge>}
                                    </div>
                                    <div className="small mt-1 d-flex flex-wrap gap-1">
                                        {unit.tokens?.aim > 0 && <Badge bg="success">Aim ×{unit.tokens.aim}</Badge>}
                                        {unit.tokens?.dodge > 0 && <Badge bg="info">Dodge ×{unit.tokens.dodge}</Badge>}
                                        {unit.tokens?.standby > 0 &&
                                            <Badge bg="warning" text="dark">Standby ×{unit.tokens.standby}</Badge>}
                                        {unit.tokens?.suppression > 0 &&
                                            <Badge bg="danger">Suppressed ×{unit.tokens.suppression}</Badge>}
                                        {unit.tokens?.ion > 0 && <Badge bg="secondary">Ion ×{unit.tokens.ion}</Badge>}
                                    </div>
                                </div>
                                <Button size="sm" variant="outline-secondary"
                                        onClick={() => {
                                            setSelectedUnit(null);
                                            setReachable(new Set());
                                        }}>✕</Button>
                            </div>

                            {!unit.hasActivated ? (
                                <>
                                    <div className="small fw-bold mb-1">Actions (up to 2):</div>
                                    <div className="d-flex flex-wrap gap-1 mb-2">
                                        {LEGION_ACTIONS.map(action => (
                                            <Button key={action} size="sm"
                                                    variant={action === 'Move' ? 'outline-primary'
                                                        : action === 'Attack' ? 'outline-danger'
                                                            : 'outline-secondary'}
                                                    style={{fontSize: '0.75rem'}}
                                                    onClick={() => handleAction(action)}>
                                                {action}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button size="sm" variant="success" onClick={handleDeactivate}>
                                        ✓ Done — Mark Activated
                                    </Button>
                                </>
                            ) : (
                                <div className="text-muted small">Unit has activated this round.</div>
                            )}
                        </div>
                    );
                })()}
            </Card.Body>
        </Card>
    );
};

export default BattleMap;