import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import Factions from '../../enums/Factions';
import UnitTypes from '../../enums/UnitTypes';
import DefenseDice from '../../enums/DefenseDice';
import Keywords from '../../enums/Keywords';
import WeaponRanges from '../../enums/WeaponRanges';
import AttackDice from '../../enums/AttackDice';
import WeaponKeywords from '../../enums/WeaponKeywords';
import KeywordUtils from '../../utils/KeywordUtils';

const UnitCard = ({ unit, customUnitTypes }) => {
    const [flipped, setFlipped] = useState(false);
    const [customKeywords, setCustomKeywords] = useState([]);
    const [upgrades, setUpgrades] = useState([]);
    const [abilities, setAbilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        // Fetch custom keywords, equipped upgrades, and abilities
        const fetchData = async () => {
            if (!currentUser || !unit) return;

            try {
                setLoading(true);

                // Fetch custom keywords
                const keywordsRef = collection(db, 'users', currentUser.uid, 'customKeywords');
                const keywordsSnapshot = await getDocs(keywordsRef);
                const keywordsList = keywordsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCustomKeywords(keywordsList);

                // Fetch equipped upgrade cards
                const allEquippedUpgrades = [];
                unit.upgradeSlots?.forEach(slot => {
                    if (slot.equippedUpgrades) allEquippedUpgrades.push(...slot.equippedUpgrades);
                });

                if (allEquippedUpgrades.length > 0) {
                    const upgradesData = [];
                    for (const upgradeId of allEquippedUpgrades) {
                        const upgradeRef = doc(db, 'users', currentUser.uid, 'upgradeCards', upgradeId);
                        const upgradeDoc = await getDoc(upgradeRef);

                        if (upgradeDoc.exists()) {
                            upgradesData.push({
                                id: upgradeDoc.id,
                                ...upgradeDoc.data()
                            });
                        }
                    }
                    setUpgrades(upgradesData);
                }

                // Fetch abilities
                if (unit.abilities?.length > 0) {
                    const abilitiesData = [];
                    for (const abilityId of unit.abilities) {
                        const abilityRef = doc(db, 'users', currentUser.uid, 'abilities', abilityId);
                        const abilityDoc = await getDoc(abilityRef);

                        if (abilityDoc.exists()) {
                            abilitiesData.push({
                                id: abilityDoc.id,
                                ...abilityDoc.data()
                            });
                        }
                    }
                    setAbilities(abilitiesData);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser, unit]);

    if (!unit) return null;

    // Function to get all keywords including those from upgrades, with stacking
    const getAllKeywords = () => {
        if (!unit) return [];
        return KeywordUtils.getAllKeywords(unit, upgrades);
    };

    // Get all weapons including those from upgrades
    const getAllWeapons = () => {
        if (!unit) return [];

        // Start with base unit weapons
        let allWeapons = [...(unit.weapons || [])].map(weapon => ({
            ...weapon,
            source: 'Base Unit'
        }));

        // Add weapons from equipped upgrades
        unit.upgradeSlots?.forEach(slot => {
            slot.equippedUpgrades?.forEach(upgradeId => {
                const upgrade = upgrades.find(u => u.id === upgradeId);
                if (upgrade?.effects?.addWeapons?.length > 0) {
                    const upgradeWeapons = upgrade.effects.addWeapons.map(weapon => ({
                        ...weapon,
                        source: upgrade.name
                    }));
                    allWeapons = [...allWeapons, ...upgradeWeapons];
                }
            });
        });

        return allWeapons;
    };

    // Calculate total points including upgrades
    const calculateTotalPoints = () => {
        let total = unit.points || 0;

        // Add upgrade costs
        unit.upgradeSlots?.forEach(slot => {
            slot.equippedUpgrades?.forEach(upgradeId => {
                const upgrade = upgrades.find(u => u.id === upgradeId);
                if (upgrade) {
                    total += upgrade.pointsCost || 0;
                }
            });
        });

        return total;
    };

    // Calculate modified stats based on upgrades
    const calculateModifiedStats = () => {
        const stats = {
            wounds: unit.wounds || 1,
            courage: unit.isVehicle ? 0 : (unit.courage !== undefined ? unit.courage : 1),
            resilience: unit.isVehicle ? (unit.resilience !== undefined ? unit.resilience : 0) : 0,
            speed: unit.speed || 2,
            modelCount: unit.minModelCount || 1,
            surgeAttack: unit.surgeAttack || false,
            surgeDefense: unit.surgeDefense || false,
            upgrades: []
        };

        // Apply upgrade modifications
        unit.upgradeSlots?.forEach(slot => {
            slot.equippedUpgrades?.forEach(upgradeId => {
                const upgrade = upgrades.find(u => u.id === upgradeId);
                const effects = upgrade?.effects || {};
                if (effects.statModifiers) {
                    const mods = effects.statModifiers;

                    // Store which upgrade modified what stat for displaying tooltips
                    if (mods.wounds) {
                        stats.wounds += mods.wounds;
                        stats.upgrades.push({ stat: 'wounds', name: upgrade.name, value: mods.wounds });
                    }

                    if (unit.isVehicle && (mods.resilience || mods.courage)) {
                        stats.resilience += mods.resilience || mods.courage || 0;
                        stats.upgrades.push({
                            stat: 'resilience',
                            name: upgrade.name,
                            value: mods.resilience || mods.courage || 0
                        });
                    } else if (!unit.isVehicle && mods.courage) {
                        stats.courage += mods.courage;
                        stats.upgrades.push({ stat: 'courage', name: upgrade.name, value: mods.courage });
                    }

                    if (mods.speed) {
                        stats.speed += mods.speed;
                        stats.upgrades.push({ stat: 'speed', name: upgrade.name, value: mods.speed });
                    }

                    if (mods.surgeAttack) {
                        stats.surgeAttack = true;
                        stats.upgrades.push({ stat: 'surgeAttack', name: upgrade.name, value: true });
                    }

                    if (mods.surgeDefense) {
                        stats.surgeDefense = true;
                        stats.upgrades.push({ stat: 'surgeDefense', name: upgrade.name, value: true });
                    }
                }

                // Track model count changes
                if (typeof effects.modelCountChange === 'number') {
                    stats.modelCount += effects.modelCountChange;
                    stats.upgrades.push({
                        stat: 'modelCount',
                        name: upgrade.name,
                        value: effects.modelCountChange
                    });
                }
            });
        });

        return stats;
    };

    // Function to check if keyword is from an upgrade
    const isKeywordFromUpgrade = (keyword) => {
        if (!unit?.keywords) return false;
        return !unit.keywords.includes(keyword);
    };

    // Function to get the proper display name for keywords
    const getKeywordDisplayName = (keyword) => {
        if (keyword.startsWith('custom:')) {
            const customId = keyword.replace('custom:', '');
            const customKeyword = customKeywords.find(k => k.id === customId);
            return customKeyword ? customKeyword.name : customId;
        }
        return Keywords.getDisplayName(keyword);
    };

    const getTypeDisplayName = (type) => {
        if (Object.values(UnitTypes).includes(type)) {
            return UnitTypes.getDisplayName(type);
        }
        const customType = customUnitTypes?.find(t => t.name === type);
        return customType ? customType.displayName : type;
    };

    // Default background based on faction if none selected
    const getDefaultBackground = () => {
        switch (unit.faction) {
            case Factions.REPUBLIC:
                return '/assets/cardbackgrounds/republic-default.png';
            case Factions.SEPARATIST:
                return '/assets/cardbackgrounds/separatist-default.png';
            case Factions.REBEL:
                return '/assets/cardbackgrounds/rebel-default.png';
            case Factions.EMPIRE:
                return '/assets/cardbackgrounds/empire-default.png';
            default:
                return '/assets/cardbackgrounds/neutral-default.png';
        }
    };

    // Get upgrade source data for tooltip display
    const getUpgradeSourcesForStat = (statName) => {
        const modifiedStats = calculateModifiedStats();
        const sources = modifiedStats.upgrades.filter(u => u.stat === statName);

        if (sources.length === 0) return null;

        return sources.map(source => {
            const prefix = source.value > 0 ? '+' : '';
            return `${source.name}: ${prefix}${source.value}`;
        }).join(', ');
    };

    // Get card background
    const cardBackground = unit.cardBackground || getDefaultBackground();

    // Get unit icon or default
    const unitIcon = unit.unitIcon || '/assets/uniticons/default-icon.png';

    // Get all keywords including those from upgrades
    const allKeywords = getAllKeywords();

    // Get all weapons including those from upgrades
    const allWeapons = getAllWeapons();

    // Calculate the modified stats based on upgrades
    const modifiedStats = calculateModifiedStats();

    // Get total points
    const totalPoints = calculateTotalPoints();

    // Stat display with tooltip for modified stats
    const StatValue = ({ original, modified, statName, modPrefix = true }) => {
        const hasChange = original !== modified;
        const sourcesText = hasChange ? getUpgradeSourcesForStat(statName) : null;

        if (!hasChange || !sourcesText) {
            return <span>{modified === 0 && ['courage', 'resilience'].includes(statName) ? '-' : modified}</span>;
        }

        return (
            <OverlayTrigger
                placement="top"
                overlay={
                    <Tooltip id={`tooltip-${statName}`}>
                        Base: {original === 0 && ['courage', 'resilience'].includes(statName) ? '-' : original}<br />
                        Modified by: {sourcesText}
                    </Tooltip>
                }
            >
        <span className="text-primary">
          {modified === 0 && ['courage', 'resilience'].includes(statName) ? '-' : modified}
            {hasChange && (
                <small className="ms-1">
                    <i className="bi bi-info-circle-fill"></i>
                </small>
            )}
        </span>
            </OverlayTrigger>
        );
    };

    return (
        <div className="unit-card-container mb-4">
            <div className="d-flex justify-content-center mb-3">
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setFlipped(!flipped)}
                >
                    {flipped ? 'Show Front' : 'Show Back'}
                </Button>
            </div>

            <div className="position-relative" style={{ perspective: '1000px' }}>
                <div
                    className="unit-card"
                    style={{
                        transition: 'transform 0.8s',
                        transformStyle: 'preserve-3d',
                        transform: flipped ? 'rotateY(180deg)' : ''
                    }}
                >
                    {/* Card Front */}
                    <div
                        className="card-face front"
                        style={{
                            position: flipped ? 'absolute' : 'relative',
                            backfaceVisibility: 'hidden',
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <Card
                            className={`unit-card-front faction-${unit.faction}-border`}
                            style={{ overflow: 'hidden' }}
                        >
                            {/* Card Background Image */}
                            <div
                                className="card-background"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundImage: `url(${cardBackground})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    opacity: 0.1,
                                    zIndex: 0
                                }}
                            />

                            <Card.Header className={`faction-${unit.faction} d-flex justify-content-between align-items-center`}>
                                <h5 className="mb-0">{unit.name}</h5>
                                <div className="d-flex align-items-center">
                                    {totalPoints !== unit.points ? (
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={
                                                <Tooltip id="tooltip-points">
                                                    Base: {unit.points} pts<br />
                                                    Upgrades: {totalPoints - unit.points} pts
                                                </Tooltip>
                                            }
                                        >
                                            <div className="me-2">
                                                <span className="text-light">
                                                {totalPoints} pts
                                                <small className="ms-1">
                                                    <i className="bi bi-info-circle-fill"></i>
                                                </small>
                                                </span>
                                            </div>
                                        </OverlayTrigger>
                                    ) : (
                                        <div className="me-2">{unit.points} pts</div>
                                    )}
                                    <div
                                        className="unit-icon-container"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                            border: `2px solid ${Factions.getColor(unit.faction)}`
                                        }}
                                    >
                                        <img
                                            src={unitIcon}
                                            alt={unit.name}
                                            style={{
                                                maxWidth: '80%',
                                                maxHeight: '80%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </div>
                                </div>
                            </Card.Header>

                            <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                                <Row>
                                    <Col>
                                        <div className="mb-3">
                                            <strong>{getTypeDisplayName(unit.type)}</strong>
                                            {unit.isVehicle && <span className="ms-2 badge bg-info">Vehicle</span>}
                                        </div>

                                        <div className="mb-3">
                                            <div><strong>Faction:</strong> {Factions.getDisplayName(unit.faction)}</div>
                                            <div>
                                                <strong>Stats:</strong>{' '}
                                                <StatValue original={unit.wounds || 1} modified={modifiedStats.wounds} statName="wounds" />W /{' '}
                                                {unit.isVehicle ? (
                                                    <><StatValue original={unit.resilience || 0} modified={modifiedStats.resilience} statName="resilience" />R</>
                                                ) : (
                                                    <><StatValue original={unit.courage || 1} modified={modifiedStats.courage} statName="courage" />C</>
                                                )} /{' '}
                                                <StatValue original={unit.speed || 2} modified={modifiedStats.speed} statName="speed" />S /{' '}
                                                <span className={DefenseDice.getColorClass(unit.defense)}>
                          {unit.defense === 'white' ? 'W' : 'R'}
                        </span> Defense
                                            </div>
                                            <div>
                                                <strong>Models:</strong>{' '}
                                                <StatValue
                                                    original={unit.minModelCount || 1}
                                                    modified={modifiedStats.modelCount}
                                                    statName="modelCount"
                                                />
                                            </div>
                                            <div>
                                                <strong>Surge:</strong>{' '}
                                                {(unit.surgeAttack || modifiedStats.surgeAttack) ? (
                                                    <span className="text-success">
                            Attack{' '}
                                                        {!unit.surgeAttack && (
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={
                                                                    <Tooltip id="tooltip-surge-attack">
                                                                        From: {getUpgradeSourcesForStat('surgeAttack')}
                                                                    </Tooltip>
                                                                }
                                                            >
                                                                <small><i className="bi bi-info-circle-fill"></i></small>
                                                            </OverlayTrigger>
                                                        )}
                          </span>
                                                ) : (
                                                    <span className="text-muted">No Attack</span>
                                                )}
                                                {' | '}
                                                {(unit.surgeDefense || modifiedStats.surgeDefense) ? (
                                                    <span className="text-success">
                            Defense{' '}
                                                        {!unit.surgeDefense && (
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={
                                                                    <Tooltip id="tooltip-surge-defense">
                                                                        From: {getUpgradeSourcesForStat('surgeDefense')}
                                                                    </Tooltip>
                                                                }
                                                            >
                                                                <small><i className="bi bi-info-circle-fill"></i></small>
                                                            </OverlayTrigger>
                                                        )}
                          </span>
                                                ) : (
                                                    <span className="text-muted">No Defense</span>
                                                )}
                                            </div>
                                        </div>

                                        {allKeywords.length > 0 && (
                                            <div className="mb-3">
                                                <strong>Keywords:</strong>
                                                <div className="mt-1">
                                                    {allKeywords.map((keyword, index) => {
                                                        const isCustom = keyword.startsWith('custom:');
                                                        const isFromUpgrade = isKeywordFromUpgrade(keyword);

                                                        const keywordElement = (
                                                            <span
                                                                key={index}
                                                                className={`badge ${isCustom ? 'bg-info' : (isFromUpgrade ? 'bg-success' : 'bg-secondary')} me-1 mb-1`}
                                                            >
                                {getKeywordDisplayName(keyword)}
                                                                {isCustom && <span className="ms-1" title="Custom Keyword">★</span>}
                                                                {isFromUpgrade && <span className="ms-1" title="From Upgrade">+</span>}
                              </span>
                                                        );

                                                        return isFromUpgrade ? (
                                                            <OverlayTrigger
                                                                key={index}
                                                                placement="top"
                                                                overlay={
                                                                    <Tooltip id={`tooltip-kw-${index}`}>
                                                                        Added by upgrade
                                                                    </Tooltip>
                                                                }
                                                            >
                                                                {keywordElement}
                                                            </OverlayTrigger>
                                                        ) : keywordElement;
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </Col>
                                </Row>

                                {allWeapons.length > 0 && (
                                    <div className="mt-3">
                                        <strong>Weapons:</strong>
                                        <ul className="list-group list-group-flush mt-1">
                                            {allWeapons.map((weapon, index) => (
                                                <li key={index} className="list-group-item p-2 bg-transparent">
                                                    <div className="d-flex justify-content-between">
                                                        <span className="fw-bold">{weapon.name}</span>
                                                        {weapon.source !== 'Base Unit' && (
                                                            <small className="text-success">
                                                                {weapon.source}
                                                            </small>
                                                        )}
                                                    </div>
                                                    <div className="small">
                            <span>
                              {WeaponRanges.getDisplayName ?
                                  WeaponRanges.getDisplayName(weapon.range) :
                                  weapon.range
                              }
                            </span>
                                                        <span className="ms-2">
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
                                                        <div className="small">
                                                            {weapon.keywords.map((kw, i) => (
                                                                <span key={i} className="badge bg-light text-dark me-1 mb-1">
                                  {WeaponKeywords.getDisplayName ?
                                      WeaponKeywords.getDisplayName(kw) : kw
                                  }
                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Card Back */}
                    <div
                        className="card-face back"
                        style={{
                            position: flipped ? 'relative' : 'absolute',
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <Card
                            className={`unit-card-back faction-${unit.faction}-border h-100`}
                            style={{ overflow: 'hidden' }}
                        >
                            {/* Card Background Image */}
                            <div
                                className="card-background"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundImage: `url(${cardBackground})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    opacity: 0.2,
                                    zIndex: 0
                                }}
                            />

                            <Card.Header className={`faction-${unit.faction}`}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{unit.name}</h5>
                                    {totalPoints !== unit.points ? (
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={
                                                <Tooltip id="tooltip-points-back">
                                                    Base: {unit.points} pts<br />
                                                    Upgrades: {totalPoints - unit.points} pts
                                                </Tooltip>
                                            }
                                        >
                                            <div className="me-2">
                                                <span className="text-light">
                                                {totalPoints} pts
                                                <small className="ms-1">
                                                    <i className="bi bi-info-circle-fill"></i>
                                                </small>
                                                </span>
                                            </div>
                                        </OverlayTrigger>
                                    ) : (
                                        <div className="me-2">{unit.points} pts</div>
                                    )}
                                    <div
                                        className="unit-icon-container"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                            border: `2px solid ${Factions.getColor(unit.faction)}`
                                        }}
                                    >
                                        <img
                                            src={unitIcon}
                                            alt={unit.name}
                                            style={{
                                                maxWidth: '80%',
                                                maxHeight: '80%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </div>
                                </div>
                            </Card.Header>

                            <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                                {abilities.length > 0 && (
                                    <div className="mb-3">
                                        <strong>Abilities:</strong>
                                        <ul className="list-group list-group-flush mt-1">
                                            {abilities.map((ability, index) => (
                                                <li key={index} className="list-group-item p-2 bg-transparent">
                                                    <div className="fw-bold">{ability.name}</div>
                                                    <div className="small">{ability.description}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {unit.upgradeSlots && unit.upgradeSlots.length > 0 && upgrades.length > 0 && (
                                    <div className="mb-3">
                                        <strong>Equipped Upgrades:</strong>
                                        <ul className="list-group list-group-flush mt-1">
                                            {upgrades.map((upgrade, index) => (
                                                <li key={index} className="list-group-item p-2 bg-transparent">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <strong>{upgrade.name}</strong>
                                                        <Badge bg="warning" text="dark">{upgrade.pointsCost} pts</Badge>
                                                    </div>
                                                    {upgrade.description && (
                                                        <div className="small text-muted">{upgrade.description}</div>
                                                    )}
                                                    {upgrade.effects && (() => {
                                                        const effects = upgrade.effects || {};
                                                        const mods = effects.statModifiers || {};

                                                        return (
                                                            <div className="small mt-1">
                                                            {/* Stat Modifiers */}
                                                            {Object.entries(mods)
                                                                .filter(([_, value]) => value !== undefined && value !== null && value !== 0)
                                                                .map(([key, value], idx) => {
                                                                let statName;
                                                                switch (key) {
                                                                    case 'wounds': statName = 'Wounds'; break;
                                                                    case 'courage': statName = unit.isVehicle ? 'Resilience' : 'Courage'; break;
                                                                    case 'resilience': statName = 'Resilience'; break;
                                                                    case 'speed': statName = 'Speed'; break;
                                                                    case 'surgeAttack': statName = 'Surge Attack'; break;
                                                                    case 'surgeDefense': statName = 'Surge Defense'; break;
                                                                    default: statName = key.charAt(0).toUpperCase() + key.slice(1);
                                                                }

                                                                // Boolean values like surges
                                                                if (typeof value === 'boolean') {
                                                                    return (
                                                                    <Badge key={idx} bg="info" className="me-1 mb-1">
                                                                        Adds {statName}
                                                                    </Badge>
                                                                    );
                                                                }

                                                                // Numeric values
                                                                const prefix = value > 0 ? '+' : '';
                                                                return (
                                                                    <Badge key={idx} bg="info" className="me-1 mb-1">
                                                                    {statName} {prefix}{value}
                                                                    </Badge>
                                                                );
                                                                })}

                                                            {/* Model Count Change */}
                                                            {typeof effects.modelCountChange === 'number' && effects.modelCountChange !== 0 && (
                                                                <Badge bg="info" className="me-1 mb-1">
                                                                Models {effects.modelCountChange > 0 ? '+' : ''}{effects.modelCountChange}
                                                                </Badge>
                                                            )}

                                                            {/* Added Keywords */}
                                                            {Array.isArray(effects.addKeywords) && effects.addKeywords.length > 0 && (
                                                                <Badge bg="info" className="me-1 mb-1">
                                                                Adds {effects.addKeywords.length} Keyword{effects.addKeywords.length !== 1 ? 's' : ''}
                                                                </Badge>
                                                            )}

                                                            {/* Added Weapons */}
                                                            {Array.isArray(effects.addWeapons) && effects.addWeapons.length > 0 && (
                                                                <Badge bg="info" className="me-1 mb-1">
                                                                Adds {effects.addWeapons.length} Weapon{effects.addWeapons.length !== 1 ? 's' : ''}
                                                                </Badge>
                                                            )}
                                                            </div>
                                                        );
                                                        })()}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {unit.notes && (
                                    <div className="mb-3">
                                        <strong>Notes:</strong>
                                        <div className="mt-1 small" style={{ whiteSpace: 'pre-line' }}>
                                            {unit.notes}
                                        </div>
                                    </div>
                                )}

                                {unit.miniatures && (
                                    <div>
                                        <strong>Miniature Information:</strong>
                                        <div className="mt-1 small" style={{ whiteSpace: 'pre-line' }}>
                                            {unit.miniatures}
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnitCard;