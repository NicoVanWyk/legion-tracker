import React, {useState, useEffect} from 'react';
import {Card, Accordion, Badge, ListGroup, Collapse, Button} from 'react-bootstrap';
import {collection, getDocs, doc, getDoc} from 'firebase/firestore';
import {db} from '../../../firebase/config';
import {useAuth} from '../../../contexts/AuthContext';
import AoSPhases from '../../../enums/aos/AoSPhases';
import AoSBattlePhases from '../../../enums/aos/AoSBattlePhases';
import AoSCommandAbilities from '../../../enums/aos/AoSCommandAbilities';
import AoSContentTypes from '../../../enums/aos/AoSContentTypes';

const AoSPhaseReference = ({battle, currentPhase, onToggleOncePerBattle}) => {
    const {currentUser} = useAuth();
    const [player1Content, setPlayer1Content] = useState([]);
    const [player2Content, setPlayer2Content] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedLore, setExpandedLore] = useState(null);

    useEffect(() => {
        if (battle) {
            loadArmyContent();
        }
    }, [battle, currentPhase]);

    const mapBattlePhaseToContentPhase = (battlePhase) => {
        const mapping = {
            [AoSBattlePhases.HERO]: AoSPhases.HERO,
            [AoSBattlePhases.MOVEMENT]: AoSPhases.MOVEMENT,
            [AoSBattlePhases.SHOOTING]: AoSPhases.SHOOTING,
            [AoSBattlePhases.CHARGE]: AoSPhases.CHARGE,
            [AoSBattlePhases.COMBAT]: AoSPhases.COMBAT,
            [AoSBattlePhases.END_OF_TURN]: AoSPhases.END_OF_TURN,
            [AoSBattlePhases.PRIORITY]: AoSPhases.START_OF_TURN,
        };
        return mapping[battlePhase] || battlePhase;
    };

    const loadArmyContent = async () => {
        try {
            const p1Army = await getDoc(doc(db, 'users', currentUser.uid, 'armies', battle.player1.armyId));
            if (p1Army.exists()) {
                const p1Content = await loadContentForArmy(p1Army.data(), battle.player1Units);
                setPlayer1Content(p1Content);
            }

            if (battle.player2.userId) {
                const p2Army = await getDoc(doc(db, 'users', battle.player2.userId, 'armies', battle.player2.armyId));
                if (p2Army.exists()) {
                    const p2Content = await loadContentForArmy(p2Army.data(), battle.player2Units);
                    setPlayer2Content(p2Content);
                }
            }
        } catch (err) {
            console.error('Error loading army content:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadContentForArmy = async (armyData, units) => {
        const contentIds = [
            ...(armyData.battleTraits || []),
            ...(armyData.battleFormations || []),
            ...(armyData.spellLores || []),
            ...(armyData.prayerLores || []),
            ...(armyData.manifestations || [])
        ];

        const contentPromises = contentIds.map(async (id) => {
            const contentDoc = await getDoc(doc(db, 'users', currentUser.uid, 'armyContent', id));
            return contentDoc.exists() ? {id: contentDoc.id, ...contentDoc.data()} : null;
        });

        const armyContent = (await Promise.all(contentPromises)).filter(Boolean);

        const unitAbilities = [];
        for (const unit of units || []) {
            for (const ability of unit.abilities || []) {
                if (ability.phase) {
                    unitAbilities.push({
                        ...ability,
                        fromUnit: unit.name,
                        isUnitAbility: true
                    });
                }
            }
        }

        return [...armyContent, ...unitAbilities];
    };

    const filterContentByPhase = (content) => {
        const mappedPhase = mapBattlePhaseToContentPhase(currentPhase);

        return content.filter(item => {
            if (!item.phase) return false;
            return item.phase === mappedPhase ||
                item.phase === AoSPhases.PASSIVE ||
                item.phase === AoSPhases.ANY;
        });
    };

    const isLoreType = (contentType) => {
        return [
            AoSContentTypes.SPELL_LORE,
            AoSContentTypes.PRAYER_LORE,
            AoSContentTypes.MANIFESTATION
        ].includes(contentType);
    };

    const toggleLore = (loreId) => {
        setExpandedLore(expandedLore === loreId ? null : loreId);
    };

    const coreCommands = AoSCommandAbilities.getAbilitiesByPhase(currentPhase);
    const p1Relevant = filterContentByPhase(player1Content);
    const p2Relevant = filterContentByPhase(player2Content);

    if (loading) return null;
    if (p1Relevant.length === 0 && p2Relevant.length === 0 && coreCommands.length === 0) {
        return null;
    }

    const renderContent = (item, playerNumber) => {
        const isLore = isLoreType(item.contentType);
        const isUnitAbility = item.isUnitAbility;
        const isOncePerBattle = item.frequency?.toLowerCase().replace(/_/g, ' ').includes('once per battle');

        const usedField = playerNumber === 1 ? 'player1' : 'player2';
        const usedAbilities = battle.usedOncePerBattle?.[usedField] || [];
        const usedInfo = usedAbilities.find(used => used.abilityId === (item.id || item.name));
        const isUsed = !!usedInfo;

        return (
            <ListGroup.Item
                key={item.id || item.name}
                className={isUsed ? 'opacity-50' : ''}
            >
                <div
                    className="d-flex justify-content-between align-items-start"
                    onClick={() => isLore && toggleLore(item.id)}
                    style={{cursor: isLore ? 'pointer' : 'default'}}
                >
                    <div className="flex-grow-1">
                        <div className="d-flex align-items-center">
                            <strong className={isUsed ? 'text-muted text-decoration-line-through' : ''}>
                                {item.name}
                            </strong>
                            {isLore && (
                                <i className={`bi bi-chevron-${expandedLore === item.id ? 'up' : 'down'} ms-2`}></i>
                            )}
                            {isUsed && (
                                <Badge bg="danger" className="ms-2">Used</Badge>
                            )}
                        </div>
                        {isUnitAbility && (
                            <div className="small text-info">From: {item.fromUnit}</div>
                        )}
                        {isUsed && usedInfo && (
                            <div className="small text-muted">
                                Used in
                                Round {usedInfo.usedInRound}, {AoSBattlePhases.getDisplayName(usedInfo.usedInPhase)}
                            </div>
                        )}
                        <div className="small text-muted mt-1">{item.description}</div>
                        {!isLore && item.effectText && (
                            <div className="small mt-2" style={{whiteSpace: 'pre-wrap'}}>
                                {item.effectText}
                            </div>
                        )}
                    </div>
                    <div className="ms-2">
                        <Badge bg="info">{AoSPhases.getDisplayName(item.phase)}</Badge>
                        {item.frequency && (
                            <Badge bg="secondary" className="ms-1">{item.frequency}</Badge>
                        )}
                        {item.abilityKeywords && item.abilityKeywords.length > 0 && (
                            <div className="mt-1">
                                {item.abilityKeywords.map((kw, idx) => (
                                    <Badge key={idx} bg="warning" text="dark" className="me-1">
                                        {kw}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {isOncePerBattle && onToggleOncePerBattle && (
                            <div className="mt-2">
                                <Button
                                    size="sm"
                                    variant={isUsed ? 'outline-success' : 'outline-danger'}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleOncePerBattle(playerNumber, item.id || item.name);
                                    }}
                                >
                                    {isUsed ? 'Restore' : 'Mark Used'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {isLore && (
                    <Collapse in={expandedLore === item.id}>
                        <div className="mt-3 ps-3">
                            {item.contentType === AoSContentTypes.SPELL_LORE && item.spells && (
                                <div>
                                    {item.spells.map((spell, idx) => (
                                        <div key={idx} className="mb-3 p-2 bg-light rounded">
                                            <div className="fw-bold">{spell.name}</div>
                                            {spell.castingValue && (
                                                <div className="small text-muted">Casting
                                                    Value: {spell.castingValue}</div>
                                            )}
                                            {spell.range && (
                                                <div className="small text-muted">Range: {spell.range}</div>
                                            )}
                                            <div className="small mt-1">{spell.effect}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {item.contentType === AoSContentTypes.PRAYER_LORE && item.prayers && (
                                <div>
                                    {item.prayers.map((prayer, idx) => (
                                        <div key={idx} className="mb-3 p-2 bg-light rounded">
                                            <div className="fw-bold">{prayer.name}</div>
                                            {prayer.answerValue && (
                                                <div className="small text-muted">Answer
                                                    Value: {prayer.answerValue}</div>
                                            )}
                                            {prayer.range && (
                                                <div className="small text-muted">Range: {prayer.range}</div>
                                            )}
                                            <div className="small mt-1">{prayer.effect}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {item.contentType === AoSContentTypes.MANIFESTATION && item.manifestations && (
                                <div>
                                    {item.manifestations.map((manifestation, idx) => (
                                        <div key={idx} className="mb-3 p-2 bg-light rounded">
                                            <div className="fw-bold">{manifestation.name}</div>
                                            {manifestation.summoningValue && (
                                                <div className="small text-muted">Summoning
                                                    Value: {manifestation.summoningValue}</div>
                                            )}
                                            {manifestation.move && (
                                                <div className="small text-muted">Move: {manifestation.move}"</div>
                                            )}
                                            <div className="small mt-1">{manifestation.effect}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Collapse>
                )}
            </ListGroup.Item>
        );
    };

    return (
        <Card className="mt-3">
            <Card.Header>
                <h5 className="mb-0">
                    <i className="bi bi-book me-2"></i>
                    {AoSPhases.getDisplayName(mapBattlePhaseToContentPhase(currentPhase))} Reference
                </h5>
            </Card.Header>
            <Card.Body>
                <Accordion defaultActiveKey="0">
                    {coreCommands.length > 0 && (
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                Core Commands ({coreCommands.length})
                            </Accordion.Header>
                            <Accordion.Body>
                                <ListGroup variant="flush">
                                    {coreCommands.map(cmd => (
                                        <ListGroup.Item key={cmd.id}>
                                            <div className="d-flex justify-content-between">
                                                <strong>{cmd.name}</strong>
                                                <Badge bg="secondary">{cmd.cost} CP</Badge>
                                            </div>
                                            <small className="text-muted">{cmd.description}</small>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Accordion.Body>
                        </Accordion.Item>
                    )}

                    {p1Relevant.length > 0 && (
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>
                                {battle.player1.name} - Army Abilities ({p1Relevant.length})
                            </Accordion.Header>
                            <Accordion.Body>
                                <ListGroup variant="flush">
                                    {p1Relevant.map(item => renderContent(item, 1))}
                                </ListGroup>
                            </Accordion.Body>
                        </Accordion.Item>
                    )}

                    {p2Relevant.length > 0 && (
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>
                                {battle.player2.name} - Army Abilities ({p2Relevant.length})
                            </Accordion.Header>
                            <Accordion.Body>
                                <ListGroup variant="flush">
                                    {p2Relevant.map(item => renderContent(item, 2))}
                                </ListGroup>
                            </Accordion.Body>
                        </Accordion.Item>
                    )}
                </Accordion>
            </Card.Body>
        </Card>
    );
};

export default AoSPhaseReference;