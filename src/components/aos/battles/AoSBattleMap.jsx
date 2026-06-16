import React, {useState, useEffect, useRef} from 'react';
import {Card, Button, Badge, ButtonGroup} from 'react-bootstrap';
import {doc, getDoc} from 'firebase/firestore';
import {db} from '../../../firebase/config';
import {useAuth} from '../../../contexts/AuthContext';

// Zone granularity: 25mm per zone — matches the smallest common base size so
// every standard base (25, 32, 40, 50, 60, 100, 130, 160mm) maps to a distinct
// number of zones rather than all rounding up to 1.
//   25mm → 1 zone   32mm → 2   40mm → 2   50mm → 2
//   60mm → 3        100mm → 4  130mm → 6  160mm → 7
// Board: 44" = 1117mm → 45 zones wide (tile-size auto-scaler handles the grid width).
const MM_PER_ZONE = 25;
const DEPLOY_MM   = 305;  // 12" deployment zone in mm

// Parse baseSize into { wMm, hMm }.
// Handles: "32mm", "100mm", "32mm x 44mm", "32mm X 44mm"
const parseBaseSizeMm = (baseSize) => {
    if (!baseSize) return {wMm: 32, hMm: 32};
    const nums = String(baseSize).match(/(\d+(\.\d+)?)/g);
    if (!nums || nums.length === 0) return {wMm: 32, hMm: 32};
    const w = parseFloat(nums[0]);
    const h = nums.length >= 2 ? parseFloat(nums[1]) : w;
    return {wMm: w, hMm: h};
};

// Convert a mm dimension to the number of zones it spans (min 1).
const mmToZones = (mm) => Math.max(1, Math.ceil(mm / MM_PER_ZONE));

// Return { spanX, spanY } zone footprint for a unit's base size.
const baseSizeToSpan = (baseSize) => {
    const {wMm, hMm} = parseBaseSizeMm(baseSize);
    return {spanX: mmToZones(wMm), spanY: mmToZones(hMm)};
};

// Return all {x, y} zone coordinates that a unit's footprint covers,
// given its anchor (top-left) position.
const getUnitZones = (unit) => {
    if (unit.mapX === undefined || unit.mapX === null) return [];
    const {spanX, spanY} = baseSizeToSpan(unit.baseSize);
    const zones = [];
    for (let dx = 0; dx < spanX; dx++)
        for (let dy = 0; dy < spanY; dy++)
            zones.push({x: unit.mapX + dx, y: unit.mapY + dy});
    return zones;
};

// Build a lookup map: "x,y" → { unit, player, index } for every occupied zone
const buildOccupiedMap = (player1Units, player2Units) => {
    const map = {};
    const add = (units, player) => {
        (units || []).forEach((u, i) => {
            getUnitZones(u).forEach(({x, y}) => {
                map[`${x},${y}`] = {unit: u, player, index: i};
            });
        });
    };
    add(player1Units, 1);
    add(player2Units, 2);
    return map;
};

// Check whether placing a unit with given spanX/spanY at (anchorX, anchorY) would
// overlap any already-placed unit (excluding itself by index+player).
const wouldOverlap = (occupiedMap, anchorX, anchorY, spanX, spanY, excludePlayer, excludeIndex) => {
    for (let dx = 0; dx < spanX; dx++) {
        for (let dy = 0; dy < spanY; dy++) {
            const key = `${anchorX + dx},${anchorY + dy}`;
            const hit = occupiedMap[key];
            if (hit && !(hit.player === excludePlayer && hit.index === excludeIndex))
                return true;
        }
    }
    return false;
};

// Check whether a rectangular footprint fits within board bounds
const fitsOnBoard = (anchorX, anchorY, spanX, spanY, boardW, boardH) =>
    anchorX >= 0 && anchorY >= 0 &&
    anchorX + spanX <= boardW &&
    anchorY + spanY <= boardH;

const AoSBattleMap = ({battle, onUnitUpdate}) => {
    const {currentUser} = useAuth();
    const containerRef = useRef(null);
    const [tileSize, setTileSize] = useState(48);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [placingUnit, setPlacingUnit] = useState(null);
    const [unitCache, setUnitCache] = useState({});

    // Derive board dimensions from mapConfig (stored in inches, converted to mm).
    // Fall back to the standard Contest of Generals size (44"×30") if absent.
    const widthIn  = battle.mapConfig?.widthIn  || 44;
    const heightIn = battle.mapConfig?.heightIn || 30;
    const widthMm  = widthIn  * 25.4;
    const heightMm = heightIn * 25.4;
    const BOARD_W     = Math.ceil(widthMm  / MM_PER_ZONE);
    const BOARD_H     = Math.ceil(heightMm / MM_PER_ZONE);
    const DEPLOY_DEPTH = Math.ceil(DEPLOY_MM / MM_PER_ZONE); // 305mm / 25 = 13 zones ≈ 12"

    // Fetch live unit docs to get fields (like baseSize) that may not have been
    // copied onto the battle snapshot at creation time — same pattern as Legion's BattleMap.
    useEffect(() => {
        if (!currentUser || !battle) return;
        const allUnits = [...(battle.player1Units || []), ...(battle.player2Units || [])];
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
    }, [battle?.player1Units, battle?.player2Units, currentUser]);

    // Always take baseSize from the live unit doc — the battle snapshot copy
    // either lacks it or carries the form default ('32mm') regardless of the
    // real value, since battle creation typically only copies combat fields.
    const enrichUnit = (unit) => {
        const live = unitCache[unit.id];
        if (!live) return unit;
        return {
            ...unit,
            baseSize: live.baseSize || unit.baseSize,
        };
    };

    // Auto-scale tile size to container width
    useEffect(() => {
        const calc = () => {
            if (!containerRef.current) return;
            const avail = Math.floor(containerRef.current.getBoundingClientRect().width) - 8;
            setTileSize(Math.max(24, Math.min(60, Math.floor(avail / BOARD_W))));
        };
        const raf = requestAnimationFrame(calc);
        const ro = new ResizeObserver(calc);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
        };
    }, [BOARD_W]);

    const enrichedP1 = (battle.player1Units || []).map(enrichUnit);
    const enrichedP2 = (battle.player2Units || []).map(enrichUnit);

    const occupiedMapRef = useRef({});
    const occupiedMap = buildOccupiedMap(enrichedP1, enrichedP2);
    occupiedMapRef.current = occupiedMap;

    // Returns the entry for the anchor tile of whatever unit is at (x,y)
    const getUnitAtZone = (x, y) => occupiedMap[`${x},${y}`] ?? null;

    // Use a ref so handleTileClick always reads the latest placingUnit
    // without needing to be recreated on every render.
    const placingUnitRef = useRef(null);
    useEffect(() => {
        placingUnitRef.current = placingUnit;
    }, [placingUnit]);

    // Track double-click to prevent the two preceding single-clicks from firing
    const clickTimerRef = useRef(null);

    const handleTileClick = (x, y) => {
        // Debounce: wait 200ms to see if a dblclick follows — if so, ignore
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        clickTimerRef.current = setTimeout(() => {
            const current = placingUnitRef.current;
            const oMap = occupiedMapRef.current;
            if (current) {
                const {player, index, spanX, spanY} = current;
                console.log('[AoSBattleMap] drop attempt', {x, y, player, index, spanX, spanY,
                    fits: fitsOnBoard(x, y, spanX, spanY, BOARD_W, BOARD_H),
                    overlaps: wouldOverlap(oMap, x, y, spanX, spanY, player, index)
                });
                if (!fitsOnBoard(x, y, spanX, spanY, BOARD_W, BOARD_H)) return;
                if (wouldOverlap(oMap, x, y, spanX, spanY, player, index)) return;
                onUnitUpdate(player, index, {mapX: x, mapY: y});
                setPlacingUnit(null);
                setSelectedUnit(null);
                return;
            }
            const hit = oMap[`${x},${y}`] ?? null;
            if (hit && selectedUnit && hit.unit.name === selectedUnit.unit.name) {
                setSelectedUnit(null);
            } else {
                setSelectedUnit(hit || null);
            }
        }, 200);
    };

    const handleTileDoubleClick = (x, y) => {
        // Cancel the pending single-click so it doesn't interfere
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        const hit = getUnitAtZone(x, y);
        if (!hit) return;
        const {spanX, spanY} = baseSizeToSpan(hit.unit.baseSize);
        setSelectedUnit(hit);
        setPlacingUnit({...hit, spanX, spanY});
    };

    const getTileBg = (x, y) => {
        const hit = occupiedMap[`${x},${y}`];

        if (placingUnit) {
            const {player, index, spanX, spanY} = placingUnit;
            if (!fitsOnBoard(x, y, spanX, spanY, BOARD_W, BOARD_H)) return '#e0e0e0';
            if (wouldOverlap(occupiedMap, x, y, spanX, spanY, player, index)) return '#e0e0e0';
            if (player === 1 && y >= DEPLOY_DEPTH) return '#ffd0d0';
            if (player === 2 && y < BOARD_H - DEPLOY_DEPTH) return '#ffd0d0';
            return '#c8f0c8';
        }

        if (hit) {
            const isSelected = selectedUnit && selectedUnit.unit.name === hit.unit.name;
            if (isSelected) return '#ffd700';
            return hit.player === 1 ? '#4a90d9' : '#d9534a';
        }

        if (y < DEPLOY_DEPTH) return '#ddeeff';
        if (y >= BOARD_H - DEPLOY_DEPTH) return '#ffddd8';
        return '#f5f5f5';
    };

    // Only show label text on the anchor tile (top-left of the footprint)
    const isAnchorTile = (x, y) => {
        const hit = occupiedMap[`${x},${y}`];
        return hit && hit.unit.mapX === x && hit.unit.mapY === y;
    };

    const undeployed1 = enrichedP1
        .map((u, i) => ({...u, _index: i}))
        .filter(u => u.mapX === undefined || u.mapX === null);

    const undeployed2 = enrichedP2
        .map((u, i) => ({...u, _index: i}))
        .filter(u => u.mapX === undefined || u.mapX === null);

    const handleRemoveFromMap = () => {
        if (!selectedUnit) return;
        onUnitUpdate(selectedUnit.player, selectedUnit.index, {mapX: undefined, mapY: undefined});
        setSelectedUnit(null);
    };

    return (
        <Card className="mt-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                    <i className="bi bi-map me-2"></i>Battle Map
                </h5>
                <small className="text-muted">
                    {placingUnit
                        ? `Placing ${placingUnit.unit.name} (${placingUnit.spanX}×${placingUnit.spanY} zones) — click target zone`
                        : 'Click unit to select · Double-click to move · Click Move on Map in panel below'}
                </small>
            </Card.Header>

            <Card.Body ref={containerRef}>
                {/* Undeployed units */}
                {(undeployed1.length > 0 || undeployed2.length > 0) && (
                    <div className="mb-3 p-2 bg-light rounded d-flex flex-wrap align-items-center gap-1">
                        <span className="small fw-bold text-muted me-1">Not yet placed:</span>
                        {undeployed1.map(u => {
                            const {wMm, hMm} = parseBaseSizeMm(u.baseSize);
                            const label = wMm === hMm ? `${wMm}mm` : `${wMm}×${hMm}mm`;
                            return (
                                <Button key={u.name} size="sm" variant="outline-primary"
                                    style={{fontSize: '0.72rem'}}
                                    onClick={() => {
                                        const {spanX, spanY} = baseSizeToSpan(u.baseSize);
                                        setPlacingUnit({unit: u, player: 1, index: u._index, spanX, spanY});
                                        setSelectedUnit(null);
                                    }}>
                                    {u.name}
                                    <span style={{opacity: 0.6, marginLeft: 3}}>({label})</span>
                                </Button>
                            );
                        })}
                        {undeployed2.map(u => {
                            const {wMm, hMm} = parseBaseSizeMm(u.baseSize);
                            const label = wMm === hMm ? `${wMm}mm` : `${wMm}×${hMm}mm`;
                            return (
                                <Button key={u.name} size="sm" variant="outline-danger"
                                    style={{fontSize: '0.72rem'}}
                                    onClick={() => {
                                        const {spanX, spanY} = baseSizeToSpan(u.baseSize);
                                        setPlacingUnit({unit: u, player: 2, index: u._index, spanX, spanY});
                                        setSelectedUnit(null);
                                    }}>
                                    {u.name}
                                    <span style={{opacity: 0.6, marginLeft: 3}}>({label})</span>
                                </Button>
                            );
                        })}
                    </div>
                )}

                {/* Cancel placement banner */}
                {placingUnit && (() => {
                    const {wMm, hMm} = parseBaseSizeMm(placingUnit.unit.baseSize);
                    const label = wMm === hMm ? `${wMm}mm` : `${wMm}×${hMm}mm`;
                    return (
                        <div className="mb-2 d-flex align-items-center gap-2">
                            <Badge bg="warning" text="dark" className="p-2">
                                <i className="bi bi-cursor me-1"></i>
                                Placing: {placingUnit.unit.name} — {label} base
                                ({placingUnit.spanX}×{placingUnit.spanY} zones)
                            </Badge>
                            <Button size="sm" variant="outline-secondary"
                                onClick={() => setPlacingUnit(null)}>
                                Cancel
                            </Button>
                        </div>
                    );
                })()}

                {/* Zone grid */}
                <div style={{display: 'flex', flexDirection: 'column', border: '2px solid #999', width: 'fit-content'}}>
                    {Array.from({length: BOARD_H}, (_, y) => (
                        <div key={y} style={{display: 'flex'}}>
                            {Array.from({length: BOARD_W}, (_, x) => {
                                const hit = occupiedMap[`${x},${y}`];
                                const anchor = isAnchorTile(x, y);
                                const isSelected = selectedUnit && hit &&
                                    selectedUnit.unit.name === hit.unit.name;
                                const bg = getTileBg(x, y);
                                const isMidline = y === Math.floor(BOARD_H / 2) - 1;

                                // Draw border between tiles of the same unit vs different cells
                                const rightNeighbor = occupiedMap[`${x + 1},${y}`];
                                const bottomNeighbor = occupiedMap[`${x},${y + 1}`];
                                const sameUnitRight = hit && rightNeighbor &&
                                    hit.unit.name === rightNeighbor.unit.name;
                                const sameUnitBottom = hit && bottomNeighbor &&
                                    hit.unit.name === bottomNeighbor.unit.name;

                                return (
                                    <div key={x}
                                        onClick={() => handleTileClick(x, y)}
                                        onDoubleClick={() => handleTileDoubleClick(x, y)}
                                        title={hit
                                            ? (() => { const {wMm, hMm} = parseBaseSizeMm(hit.unit.baseSize); const bl = wMm === hMm ? `${wMm}mm` : `${wMm}×${hMm}mm`; return `${hit.unit.name} (P${hit.player} · ${bl} base)`; })()
                                            : `Zone ${x},${y}`}
                                        style={{
                                            width: tileSize,
                                            height: tileSize,
                                            flexShrink: 0,
                                            borderTop: isSelected ? '2px solid #ffd700' : '1px solid #ddd',
                                            borderLeft: isSelected ? '2px solid #ffd700' : '1px solid #ddd',
                                            borderRight: sameUnitRight
                                                ? '1px solid rgba(255,255,255,0.3)'
                                                : isSelected ? '2px solid #ffd700' : '1px solid #ddd',
                                            borderBottom: isMidline && !sameUnitBottom
                                                ? '2px dashed #aaa'
                                                : sameUnitBottom
                                                    ? '1px solid rgba(255,255,255,0.3)'
                                                    : isSelected ? '2px solid #ffd700' : '1px solid #ddd',
                                            backgroundColor: bg,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: tileSize > 36 ? '0.6rem' : '0.5rem',
                                            textAlign: 'center',
                                            padding: 1,
                                            color: hit ? '#fff' : '#bbb',
                                            fontWeight: 'bold',
                                            overflow: 'hidden',
                                            lineHeight: 1.1,
                                            transition: 'background-color 0.1s',
                                        }}>
                                        {anchor
                                            ? hit.unit.name.slice(0, tileSize > 40 ? 5 : 3)
                                            : (!hit && !placingUnit && tileSize > 40
                                                ? <span style={{opacity: 0.3, fontSize: '0.5rem'}}>{x},{y}</span>
                                                : null)
                                        }
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="d-flex flex-wrap gap-2 mt-2" style={{fontSize: '0.72rem'}}>
                    <span style={{background: '#ddeeff', padding: '2px 6px', borderRadius: 3, border: '1px solid #ccc'}}>
                        {battle.player1.name} deploy zone
                    </span>
                    <span style={{background: '#ffddd8', padding: '2px 6px', borderRadius: 3, border: '1px solid #ccc'}}>
                        {battle.player2.name} deploy zone
                    </span>
                    <span style={{background: '#4a90d9', padding: '2px 6px', borderRadius: 3, color: '#fff'}}>
                        {battle.player1.name}
                    </span>
                    <span style={{background: '#d9534a', padding: '2px 6px', borderRadius: 3, color: '#fff'}}>
                        {battle.player2.name}
                    </span>
                    <span style={{background: '#ffd700', padding: '2px 6px', borderRadius: 3}}>
                        Selected
                    </span>
                    <span className="text-muted">
                        Each zone = 25mm · Board: {widthIn}" × {heightIn}" ({BOARD_W}×{BOARD_H} zones)
                    </span>
                </div>

                {/* Selected unit action panel */}
                {selectedUnit && !placingUnit && (() => {
                    const {wMm, hMm} = parseBaseSizeMm(selectedUnit.unit.baseSize);
                    const {spanX, spanY} = baseSizeToSpan(selectedUnit.unit.baseSize);
                    const baseLabel = wMm === hMm ? `${wMm}mm` : `${wMm}×${hMm}mm`;
                    return (
                        <div className="mt-3 p-2 border rounded"
                            style={{background: selectedUnit.player === 1 ? '#f0f8ff' : '#fff0f0'}}>
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <strong>{selectedUnit.unit.name}</strong>
                                    <div className="small text-muted">
                                        Player {selectedUnit.player}
                                        {selectedUnit.unit.mapX !== undefined &&
                                            ` · Anchor (${selectedUnit.unit.mapX}, ${selectedUnit.unit.mapY})`}
                                        {` · Base: ${baseLabel}`}
                                        {` · Footprint: ${spanX}×${spanY} zones`}
                                        {` · Models: ${selectedUnit.unit.currentModels ?? selectedUnit.unit.startingModels}/${selectedUnit.unit.startingModels}`}
                                    </div>
                                    {selectedUnit.unit.isDefeated && (
                                        <Badge bg="danger" className="mt-1">Defeated</Badge>
                                    )}
                                </div>
                                <Button size="sm" variant="outline-secondary"
                                    onClick={() => setSelectedUnit(null)}>✕</Button>
                            </div>
                            <ButtonGroup size="sm" className="mt-2">
                                <Button variant="outline-primary"
                                    onClick={() => setPlacingUnit({...selectedUnit, spanX, spanY})}>
                                    <i className="bi bi-arrows-move me-1"></i>Move on Map
                                </Button>
                                <Button variant="outline-danger"
                                    onClick={handleRemoveFromMap}>
                                    <i className="bi bi-x-circle me-1"></i>Remove from Map
                                </Button>
                            </ButtonGroup>
                        </div>
                    );
                })()}
            </Card.Body>
        </Card>
    );
};

export default AoSBattleMap;