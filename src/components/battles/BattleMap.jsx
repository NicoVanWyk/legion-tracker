import React, {useState, useEffect} from 'react';
import {Card, Button, Badge, ButtonGroup, Alert} from 'react-bootstrap';
import {doc, getDoc} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import PlayerSides from '../../enums/PlayerSides';
import Keywords from '../../enums/Keywords';

const DEPLOY_ZONE_WIDTH = 3;
const LEGION_ACTIONS = ['Move', 'Attack', 'Aim', 'Dodge', 'Standby', 'Recover', 'Coordinate'];

// ── Unit stat helpers ─────────────────────────────────────────────────────────
// Use ?? (not ||) so numeric 0 is not discarded as falsy
const getModelCount = unit => unit.currentModelCount ?? unit.minModelCount ?? 1;
const getUnitSizeX = unit => unit.battleMapSizeX ?? 1;
const getUnitSizeY = unit => unit.battleMapSizeY ?? 1;

// Speed in move-tool units; wheel mode bumps it to at least 3
const getUnitSpeed = (unit, wheelModeActive = false) => {
    const base = unit.speed ?? 2;
    const hasWheelMode = unit.keywords?.includes(Keywords.WHEEL_MODE);
    return (wheelModeActive && hasWheelMode) ? Math.max(base, 3) : base;
};

// Returns [{ key, modelIdx, isAnchor }] for every tile all placed models cover
const buildUnitTiles = unit => {
    if (!unit.mapPositions?.length) return [];
    const sx = getUnitSizeX(unit);
    const sy = getUnitSizeY(unit);
    const result = [];
    unit.mapPositions.forEach((pos, modelIdx) => {
        for (let dx = 0; dx < sx; dx++)
            for (let dy = 0; dy < sy; dy++)
                result.push({
                    key: `${pos.x + dx},${pos.y + dy}`,
                    modelIdx,
                    isAnchor: dx === 0 && dy === 0,
                });
    });
    return result;
};

// ── Component ─────────────────────────────────────────────────────────────────
const BattleMap = ({battle, onUnitUpdate, isDeploymentPhase = false}) => {
    const {currentUser} = useAuth();
    const [selectedUnit, setSelectedUnit] = useState(null);   // { unit, side }
    const [movingModelIdx, setMovingModelIdx] = useState(null);   // index into mapPositions
    const [reachable, setReachable] = useState(new Set());
    const [deployingUnit, setDeployingUnit] = useState(null);   // { unit, side }
    const [tileSize, setTileSize] = useState(42);
    const [wheelModeActive, setWheelModeActive] = useState(false);
    const [unitCache, setUnitCache] = useState({});     // unitId → full unit doc

    // Fetch live unit documents to supplement stale battle snapshots.
    // The battle stores unit copies at creation time; speed/size/modelCount
    // may be missing if the unit was edited after the battle was created.
    useEffect(() => {
        if (!currentUser || !battle) return;
        const allUnits = [...(battle.blueUnits || []), ...(battle.redUnits || [])];
        const toFetch = allUnits.filter(u => u.id && !unitCache[u.id]);
        if (!toFetch.length) return;

        Promise.all(
            toFetch.map(u =>
                getDoc(doc(db, 'users', currentUser.uid, 'units', u.id))
                    .then(snap => snap.exists() ? [u.id, snap.data()] : null)
                    .catch(() => null)
            )
        ).then(results => {
            const entries = Object.fromEntries(results.filter(Boolean));
            if (Object.keys(entries).length)
                setUnitCache(prev => ({...prev, ...entries}));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [battle.blueUnits, battle.redUnits, currentUser]);

    // Merge the live unit doc into the battle snapshot so stats are always current.
    const enrichUnit = unit => {
        const live = unitCache[unit.id];
        if (!live) return unit;
        return {
            ...unit,
            speed: unit.speed ?? live.speed ?? 2,
            currentModelCount: unit.currentModelCount ?? live.currentModelCount ?? live.minModelCount ?? 1,
            minModelCount: unit.minModelCount ?? live.minModelCount ?? 1,
            battleMapSizeX: unit.battleMapSizeX ?? live.battleMapSizeX ?? 1,
            battleMapSizeY: unit.battleMapSizeY ?? live.battleMapSizeY ?? 1,
            keywords: unit.keywords ?? live.keywords ?? [],
        };
    };

    const mapW = battle.mapConfig?.widthTools
        ? battle.mapConfig.widthTools * 3 : (battle.mapConfig?.width || 24);
    const mapH = battle.mapConfig?.heightTools
        ? battle.mapConfig.heightTools * 3 : (battle.mapConfig?.height || 12);

    // ── Occupied map ──────────────────────────────────────────────────────────
    // "x,y" → { unit, side, modelIdx, isAnchor, unitNumber }
    const buildOccupied = () => {
        const map = {};
        const add = (units, side) =>
            units?.forEach((rawUnit, unitIdx) => {
                const unit = enrichUnit(rawUnit);
                buildUnitTiles(unit).forEach(({key, modelIdx, isAnchor}) => {
                    map[key] = {unit, side, modelIdx, isAnchor, unitNumber: unitIdx + 1};
                });
            });
        add(battle.blueUnits, PlayerSides.BLUE);
        add(battle.redUnits, PlayerSides.RED);
        return map;
    };

    const getUndeployed = side =>
        (side === PlayerSides.BLUE ? battle.blueUnits : battle.redUnits)
            ?.filter(u => !u.mapPositions?.length).map(enrichUnit) || [];

    const getPartiallyDeployed = side =>
        (side === PlayerSides.BLUE ? battle.blueUnits : battle.redUnits)
            ?.filter(u => {
                const placed = u.mapPositions?.length || 0;
                return placed > 0 && placed < getModelCount(enrichUnit(u));
            }).map(enrichUnit) || [];

    // ── Footprint helpers ─────────────────────────────────────────────────────
    const singleFootprintFits = (unit, ax, ay, occupied, excludeUnitId = null) => {
        const sx = getUnitSizeX(unit);
        const sy = getUnitSizeY(unit);
        for (let dx = 0; dx < sx; dx++)
            for (let dy = 0; dy < sy; dy++) {
                const nx = ax + dx, ny = ay + dy;
                if (nx < 0 || nx >= mapW || ny < 0 || ny >= mapH) return false;
                const occ = occupied[`${nx},${ny}`];
                if (occ && occ.unit.id !== excludeUnitId) return false;
            }
        return true;
    };

    const footprintInDeployZone = (unit, ax, side) => {
        const sx = getUnitSizeX(unit);
        for (let dx = 0; dx < sx; dx++) {
            const nx = ax + dx;
            if (side === PlayerSides.BLUE ? nx >= DEPLOY_ZONE_WIDTH : nx < mapW - DEPLOY_ZONE_WIDTH)
                return false;
        }
        return true;
    };

    // ── Movement ──────────────────────────────────────────────────────────────
    // speed × 3 tiles because each tile = ⅓ of a move-1 tool
    const computeReachable = (unit, modelPos, occupied, useWheel = false) => {
        const spdTiles = getUnitSpeed(unit, useWheel) * 3;
        const tiles = new Set();
        for (let dx = -spdTiles; dx <= spdTiles; dx++)
            for (let dy = -(spdTiles - Math.abs(dx)); dy <= spdTiles - Math.abs(dx); dy++) {
                const nx = modelPos.x + dx, ny = modelPos.y + dy;
                if (singleFootprintFits(unit, nx, ny, occupied, unit.id))
                    tiles.add(`${nx},${ny}`);
            }
        tiles.delete(`${modelPos.x},${modelPos.y}`);
        return tiles;
    };

    const startMovingModel = (modelIdx, unit, useWheel = wheelModeActive) => {
        if (!unit.mapPositions?.[modelIdx]) return;
        setMovingModelIdx(modelIdx);
        setReachable(computeReachable(unit, unit.mapPositions[modelIdx], buildOccupied(), useWheel));
    };

    // ── Handlers ──────────────────────────────────────────────────────────────
    const clearSelection = () => {
        setSelectedUnit(null);
        setMovingModelIdx(null);
        setReachable(new Set());
        setWheelModeActive(false);
    };

    const handleSelectUnit = (unit, side) => {
        if (selectedUnit?.unit.id === unit.id) {
            clearSelection();
            return;
        }
        setSelectedUnit({unit: enrichUnit(unit), side});
        setMovingModelIdx(null);
        setReachable(new Set());
        setWheelModeActive(false);
    };

    const handleTileClick = (x, y) => {
        const occupied = buildOccupied();

        // Deployment: place one model footprint at a time
        if (deployingUnit) {
            const {unit, side} = deployingUnit;
            if (!singleFootprintFits(unit, x, y, occupied, unit.id)) return;
            if (!footprintInDeployZone(unit, x, side)) return;
            const updated = [...(unit.mapPositions || []), {x, y}];
            onUnitUpdate(side, unit.id, {mapPositions: updated});
            if (updated.length >= getModelCount(unit)) setDeployingUnit(null);
            return;
        }

        // Movement: reposition the selected model
        if (selectedUnit && movingModelIdx !== null && reachable.has(`${x},${y}`)) {
            const {unit, side} = selectedUnit;
            const newPositions = unit.mapPositions.map((pos, idx) =>
                idx === movingModelIdx ? {x, y} : pos
            );
            const updates = {mapPositions: newPositions, hasMoved: true};
            onUnitUpdate(side, unit.id, updates);
            setSelectedUnit(prev => ({...prev, unit: {...prev.unit, ...updates}}));
            setMovingModelIdx(null);
            setReachable(new Set());
        }
    };

    const toggleWheelMode = () => {
        if (!selectedUnit) return;
        const next = !wheelModeActive;
        setWheelModeActive(next);
        // If currently moving a model, recompute reachable with new speed
        if (movingModelIdx !== null && selectedUnit.unit.mapPositions?.[movingModelIdx]) {
            setReachable(computeReachable(
                selectedUnit.unit,
                selectedUnit.unit.mapPositions[movingModelIdx],
                buildOccupied(),
                next
            ));
        }
    };

    const handleAction = action => {
        if (!selectedUnit) return;
        const {unit, side} = selectedUnit;
        let updates = {};
        if (action === 'Move') {
            startMovingModel(0, unit);
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
        clearSelection();
    };

    // ── Tile colour ───────────────────────────────────────────────────────────
    const occupied = buildOccupied();

    const getTileBg = (x, y, occEntry) => {
        const key = `${x},${y}`;
        if (selectedUnit && occEntry?.unit.id === selectedUnit.unit.id) {
            if (occEntry.isAnchor && occEntry.modelIdx === movingModelIdx) return '#ffd700';
            return occEntry.side === PlayerSides.BLUE ? '#b8d4f0' : '#f0b8b8';
        }
        if (reachable.has(key)) return '#93c9ff';
        if (deployingUnit && !occEntry
            && singleFootprintFits(deployingUnit.unit, x, y, occupied, deployingUnit.unit.id)
            && footprintInDeployZone(deployingUnit.unit, x, deployingUnit.side))
            return '#b3ffb3';
        if (x < DEPLOY_ZONE_WIDTH) return '#d8eaf8';
        if (x >= mapW - DEPLOY_ZONE_WIDTH) return '#f8d8d8';
        return '#e6ede6';
    };

    // ── Token ─────────────────────────────────────────────────────────────────
    const getToken = occEntry => {
        const {unit, side, modelIdx, isAnchor, unitNumber} = occEntry;
        const isSelectedUnit = selectedUnit?.unit.id === unit.id;
        const isMovingModel = isSelectedUnit && modelIdx === movingModelIdx;
        const factionColor = side === PlayerSides.BLUE ? '#0d6efd' : '#dc3545';
        const subBg = side === PlayerSides.BLUE ? 'rgba(13,110,253,0.2)' : 'rgba(220,53,69,0.2)';

        // Sub-tiles of a model's footprint: tinted fill + unit number only
        if (!isAnchor) {
            return (
                <div style={{
                    width: '100%', height: '100%', backgroundColor: subBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: Math.max(10, tileSize * 0.32), fontWeight: 'bold',
                    color: factionColor, opacity: unit.hasActivated ? 0.5 : 0.9,
                }}>
                    {unitNumber}
                </div>
            );
        }

        // Anchor tile: circular token with unit number + initials
        const sz = Math.max(20, tileSize - 6);
        const initials = unit.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const canMove = isSelectedUnit && movingModelIdx === null && !unit.hasActivated;

        return (
            <div
                onClick={e => {
                    e.stopPropagation();
                    if (canMove) {
                        startMovingModel(modelIdx, unit);
                        return;
                    }
                    handleSelectUnit(unit, side);
                }}
                title={`${unit.name} — model ${modelIdx + 1}/${getModelCount(unit)}${canMove ? ' · Click to move' : ''}`}
                style={{
                    width: sz, height: sz, borderRadius: '50%',
                    backgroundColor: factionColor,
                    border: isMovingModel ? '3px solid #ffd700'
                        : isSelectedUnit ? '2px solid #fff'
                            : '2px solid rgba(0,0,0,.3)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#fff', userSelect: 'none', position: 'relative', flexShrink: 0,
                    opacity: unit.hasActivated ? 0.4 : 1,
                    cursor: canMove ? 'crosshair' : 'pointer',
                }}>
                <span style={{fontSize: Math.max(10, sz * 0.38), fontWeight: 'bold', lineHeight: 1}}>
                    {unitNumber}
                </span>
                <span style={{fontSize: Math.max(7, sz * 0.24), opacity: 0.8, lineHeight: 1}}>
                    {initials}
                </span>
                {unit.tokens?.aim > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4, width: 13, height: 13,
                        borderRadius: '50%', background: '#198754', fontSize: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                    }}>
                        {unit.tokens.aim}
                    </span>
                )}
                {unit.tokens?.dodge > 0 && (
                    <span style={{
                        position: 'absolute', bottom: -4, right: -4, width: 13, height: 13,
                        borderRadius: '50%', background: '#0dcaf0', fontSize: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000'
                    }}>
                        {unit.tokens.dodge}
                    </span>
                )}
            </div>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center py-2">
                <strong>Battle Map</strong>
                <div className="d-flex align-items-center gap-3">
                    <small className="text-muted">
                        {mapW}×{mapH} tiles · 1 tile ≈ 27mm · {Math.round(mapW / 3)}×{Math.round(mapH / 3)} move tools
                    </small>
                    <ButtonGroup size="sm">
                        <Button variant="outline-secondary"
                                onClick={() => setTileSize(t => Math.max(24, t - 4))}>−</Button>
                        <Button variant="outline-secondary"
                                onClick={() => setTileSize(t => Math.min(72, t + 4))}>+</Button>
                    </ButtonGroup>
                </div>
            </Card.Header>

            <Card.Body className="p-2">

                {/* ── Deployment panel ── */}
                {isDeploymentPhase && (
                    <div className="d-flex gap-3 mb-2">
                        {[PlayerSides.BLUE, PlayerSides.RED].map(side => {
                            const undeployed = getUndeployed(side);
                            const partial = getPartiallyDeployed(side);
                            const variant = side === PlayerSides.BLUE ? 'primary' : 'danger';
                            return (
                                <div key={side} style={{flex: 1}}>
                                    <small className={`fw-bold text-${variant}`}>
                                        {side === PlayerSides.BLUE ? 'Blue' : 'Red'} — select a unit, then click tiles
                                    </small>
                                    <div className="d-flex flex-wrap gap-1 mt-1">
                                        {[...partial, ...undeployed].map(u => {
                                            const placed = u.mapPositions?.length || 0;
                                            const total = getModelCount(u);
                                            const active = deployingUnit?.unit.id === u.id;
                                            return (
                                                <Badge key={u.id}
                                                       bg={active ? 'warning' : variant}
                                                       text={active ? 'dark' : undefined}
                                                       style={{cursor: 'pointer'}}
                                                       onClick={() => setDeployingUnit(
                                                           active ? null : {unit: enrichUnit(u), side}
                                                       )}>
                                                    {u.name} ({placed}/{total})
                                                </Badge>
                                            );
                                        })}
                                        {undeployed.length === 0 && partial.length === 0 && (
                                            <small className="text-muted">All deployed ✓</small>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Deploying unit banner ── */}
                {deployingUnit && (() => {
                    const placed = deployingUnit.unit.mapPositions?.length || 0;
                    const total = getModelCount(deployingUnit.unit);
                    const sx = getUnitSizeX(deployingUnit.unit);
                    const sy = getUnitSizeY(deployingUnit.unit);
                    return (
                        <Alert variant="info" className="py-1 px-2 mb-2 small">
                            Placing <strong>{deployingUnit.unit.name}</strong> — model{' '}
                            <strong>{placed + 1} of {total}</strong>{' '}
                            ({sx}×{sy} tiles each). Click a highlighted tile in the{' '}
                            <strong>{deployingUnit.side === PlayerSides.BLUE ? 'blue' : 'red'}</strong> zone.
                            <Button size="sm" variant="link" className="py-0 px-1"
                                    onClick={() => setDeployingUnit(null)}>Cancel</Button>
                        </Alert>
                    );
                })()}

                {/* ── Moving model banner ── */}
                {movingModelIdx !== null && selectedUnit && (() => {
                    const unit = selectedUnit.unit;
                    const spd = getUnitSpeed(unit, wheelModeActive);
                    return (
                        <Alert variant="primary" className="py-1 px-2 mb-2 small">
                            Moving model <strong>{movingModelIdx + 1}</strong> of{' '}
                            <strong>{unit.name}</strong> — click a blue tile.{' '}
                            Speed {spd} = <strong>{spd * 3} tiles</strong> range.
                            {wheelModeActive && <Badge bg="warning" text="dark" className="ms-2">Wheel Mode</Badge>}
                            <Button size="sm" variant="link" className="py-0 px-1"
                                    onClick={() => {
                                        setMovingModelIdx(null);
                                        setReachable(new Set());
                                    }}>
                                Cancel
                            </Button>
                        </Alert>
                    );
                })()}

                {/* ── Grid ── */}
                <div style={{overflowX: 'auto', overflowY: 'auto', maxHeight: 560}}>
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
                                            {occEntry && getToken(occEntry)}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Legend ── */}
                <div className="d-flex flex-wrap gap-2 mt-2" style={{fontSize: '0.72rem'}}>
                    <span style={{background: '#d8eaf8', padding: '2px 6px', borderRadius: 3}}>Blue zone</span>
                    <span style={{background: '#f8d8d8', padding: '2px 6px', borderRadius: 3}}>Red zone</span>
                    <span style={{background: '#93c9ff', padding: '2px 6px', borderRadius: 3}}>Move range</span>
                    <span style={{background: '#ffd700', padding: '2px 6px', borderRadius: 3}}>Moving model</span>
                    <span style={{background: '#b8d4f0', padding: '2px 6px', borderRadius: 3}}>Selected unit</span>
                    <span className="text-muted">№ = unit index per side</span>
                </div>

                {/* ── Action panel ── */}
                {selectedUnit && (() => {
                    const {unit, side} = selectedUnit;
                    const placed = unit.mapPositions?.length || 0;
                    const modelCount = getModelCount(unit);
                    const spd = getUnitSpeed(unit, wheelModeActive);
                    const hasWheelMode = unit.keywords?.includes(Keywords.WHEEL_MODE);

                    return (
                        <div className="p-2 border rounded mt-2"
                             style={{background: side === PlayerSides.BLUE ? '#f0f8ff' : '#fff0f0'}}>

                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <strong>{unit.name}</strong>
                                    <div className="small text-muted">
                                        {placed}/{modelCount} models · Spd {spd} ({spd * 3} tiles)
                                        {' · '}Def{' '}
                                        <span className={`fw-bold ${unit.defense === 'red' ? 'text-danger' : ''}`}>
                                            {(unit.defense || 'white').toUpperCase()}
                                        </span>
                                        {' · '}{unit.wounds || 1}W
                                        {' · '}Base {getUnitSizeX(unit)}×{getUnitSizeY(unit)} tiles
                                        {unit.hasMoved && (
                                            <Badge bg="secondary" className="ms-2" style={{fontSize: '0.65rem'}}>
                                                Moved
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Token badges */}
                                    <div className="small mt-1 d-flex flex-wrap gap-1">
                                        {unit.tokens?.aim > 0 && <Badge bg="success">Aim ×{unit.tokens.aim}</Badge>}
                                        {unit.tokens?.dodge > 0 && <Badge bg="info">Dodge ×{unit.tokens.dodge}</Badge>}
                                        {unit.tokens?.standby > 0 &&
                                            <Badge bg="warning" text="dark">Standby ×{unit.tokens.standby}</Badge>}
                                        {unit.tokens?.suppression > 0 &&
                                            <Badge bg="danger">Suppressed ×{unit.tokens.suppression}</Badge>}
                                        {unit.tokens?.ion > 0 && <Badge bg="secondary">Ion ×{unit.tokens.ion}</Badge>}
                                    </div>

                                    {/* Wheel Mode toggle */}
                                    {hasWheelMode && !unit.hasActivated && (
                                        <div className="mt-2">
                                            <Button size="sm"
                                                    variant={wheelModeActive ? 'warning' : 'outline-warning'}
                                                    style={{fontSize: '0.75rem'}}
                                                    onClick={toggleWheelMode}>
                                                ⚙ {wheelModeActive ? 'Wheel Mode ON — Spd 3' : 'Enter Wheel Mode'}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Per-model move buttons (multi-model units) */}
                                    {movingModelIdx === null && !unit.hasActivated && placed > 1 && (
                                        <div className="small mt-2 d-flex align-items-center flex-wrap gap-1">
                                            <span className="text-muted">Move model:</span>
                                            {unit.mapPositions.map((_, idx) => (
                                                <Button key={idx} size="sm" variant="outline-primary"
                                                        className="py-0 px-1" style={{fontSize: '0.7rem'}}
                                                        onClick={() => startMovingModel(idx, unit)}>
                                                    M{idx + 1}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Button size="sm" variant="outline-secondary" onClick={clearSelection}>✕</Button>
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