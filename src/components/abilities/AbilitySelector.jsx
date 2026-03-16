// src/components/abilities/AbilitySelector.jsx
import React, {useState, useEffect} from 'react';
import {Card, ListGroup, Form, InputGroup, Button, Alert, Badge} from 'react-bootstrap';
import {collection, getDocs, query, orderBy, where} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import ReminderTypes from '../../enums/ReminderTypes';
import LoadingSpinner from '../layout/LoadingSpinner';
import {useGameSystem} from '../../contexts/GameSystemContext';
import AoSAbilityKeywords from '../../enums/aos/AoSAbilityKeywords';
import GameSystems from '../../enums/GameSystems';
import AoSPhases from '../../enums/aos/AoSPhases';
import AoSAbilityFrequency from '../../enums/aos/AoSAbilityFrequency';

const AbilitySelector = ({selectedAbilities = [], onChange}) => {
    const [abilities, setAbilities] = useState([]);
    const [filteredAbilities, setFilteredAbilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTiming, setFilterTiming] = useState('all');
    const [filterPhase, setFilterPhase] = useState('all');
    const {currentUser} = useAuth();
    const {currentSystem} = useGameSystem();

    const isAoS = currentSystem === GameSystems.AOS;
    const isLegion = currentSystem === GameSystems.LEGION;

    useEffect(() => {
        fetchAbilities();
    }, [currentUser, currentSystem]);

    useEffect(() => {
        filterAbilitiesList();
    }, [abilities, searchTerm, filterTiming, filterPhase]);

    const fetchAbilities = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const abilitiesRef = collection(db, 'users', currentUser.uid, 'abilities');
            const q = query(
                abilitiesRef,
                where('gameSystem', '==', currentSystem),
                orderBy('name', 'asc')
            );
            const snapshot = await getDocs(q);

            const abilitiesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setAbilities(abilitiesList);
            setError('');
        } catch (err) {
            console.error('Error fetching abilities:', err);
            setError('Failed to fetch abilities');
        } finally {
            setLoading(false);
        }
    };

    const filterAbilitiesList = () => {
        let filtered = abilities;

        // Filter by timing (Legion) or phase (AoS)
        if (isLegion && filterTiming !== 'all') {
            filtered = filtered.filter(a => a.timing === filterTiming);
        }

        if (isAoS && filterPhase !== 'all') {
            filtered = filtered.filter(a => a.phase === filterPhase);
        }

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(a =>
                a.name.toLowerCase().includes(term) ||
                a.description?.toLowerCase().includes(term) ||
                a.rulesText?.toLowerCase().includes(term) ||
                a.effectText?.toLowerCase().includes(term)
            );
        }

        setFilteredAbilities(filtered);
    };

    const toggleAbility = (abilityId) => {
        if (selectedAbilities.includes(abilityId)) {
            onChange(selectedAbilities.filter(id => id !== abilityId));
        } else {
            onChange([...selectedAbilities, abilityId]);
        }
    };

    if (loading) {
        return <LoadingSpinner text="Loading abilities..."/>;
    }

    return (
        <div className="ability-selector">
            <div className="mb-3">
                <h5>Selected Abilities</h5>
                <div>
                    {selectedAbilities.length === 0 ? (
                        <p className="text-muted">No abilities selected</p>
                    ) : (
                        abilities
                            .filter(ability => selectedAbilities.includes(ability.id))
                            .map(ability => (
                                <Badge
                                    key={ability.id}
                                    bg={isAoS && ability.phase ?
                                        AoSPhases.getColor(ability.phase).replace('#', '') :
                                        ReminderTypes.getBadgeColor(ability.timing)
                                    }
                                    className="me-2 mb-2 p-2"
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: isAoS && ability.phase ? AoSPhases.getColor(ability.phase) : undefined
                                    }}
                                    onClick={() => toggleAbility(ability.id)}
                                >
                                    {ability.name} ×
                                </Badge>
                            ))
                    )}
                </div>
            </div>

            <Form.Group className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Search abilities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Form.Group>

            {isLegion && (
                <Form.Group className="mb-3">
                    <Form.Label>Filter by Timing</Form.Label>
                    <Form.Select
                        value={filterTiming}
                        onChange={(e) => setFilterTiming(e.target.value)}
                    >
                        <option value="all">All Timings</option>
                        {ReminderTypes.getAllTypes().map(type => (
                            <option key={type} value={type}>
                                {ReminderTypes.getDisplayName(type)}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            )}

            {isAoS && (
                <Form.Group className="mb-3">
                    <Form.Label>Filter by Phase</Form.Label>
                    <Form.Select
                        value={filterPhase}
                        onChange={(e) => setFilterPhase(e.target.value)}
                    >
                        <option value="all">All Phases</option>
                        {Object.values(AoSPhases).filter(p => typeof p === 'string').map(phase => (
                            <option key={phase} value={phase}>
                                {AoSPhases.getDisplayName(phase)}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            )}

            {abilities.length === 0 ? (
                <Alert variant="info">
                    <p className="mb-2">You haven't created any abilities yet.</p>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        as={Link}
                        to="/abilities/create"
                    >
                        Create Ability
                    </Button>
                </Alert>
            ) : filteredAbilities.length === 0 ? (
                <Alert variant="warning">
                    <p className="mb-0">No abilities match your filters.</p>
                </Alert>
            ) : (
                <ListGroup className="ability-list">
                    {filteredAbilities.map(ability => (
                        <ListGroup.Item
                        key={ability.id}
                        className={selectedAbilities.includes(ability.id) ? 'border-primary' : ''}
                        >
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                            <div className="fw-bold">{ability.name}</div>
                            <div className="small text-muted">{ability.description}</div>

                            <div className="mt-2">
                                {isAoS && ability.phase && (
                                <Badge
                                    className="me-1"
                                    style={{backgroundColor: AoSPhases.getColor(ability.phase)}}
                                >
                                    {AoSPhases.getDisplayName(ability.phase)}
                                </Badge>
                                )}

                                {isAoS && ability.frequency && (
                                <Badge bg="secondary" className="me-1">
                                    {AoSAbilityFrequency.getDisplayName(ability.frequency)}
                                </Badge>
                                )}
                                
                                {isAoS && ability.abilityKeywords?.length > 0 && (
                                <>
                                    {ability.abilityKeywords.map(kw => (
                                    <Badge 
                                        key={kw}
                                        className="me-1"
                                        style={{ 
                                        backgroundColor: AoSAbilityKeywords.getColor(kw),
                                        fontSize: '0.7rem'
                                        }}
                                    >
                                        {AoSAbilityKeywords.getDisplayName(kw)}
                                    </Badge>
                                    ))}
                                </>
                                )}

                                {isLegion && ability.timing && (
                                <Badge bg={ReminderTypes.getBadgeColor(ability.timing)}>
                                    {ReminderTypes.getDisplayName(ability.timing)}
                                </Badge>
                                )}
                            </div>
                            </div>
                            <Button
                            variant={selectedAbilities.includes(ability.id) ? "danger" : "primary"}
                            size="sm"
                            onClick={() => toggleAbility(ability.id)}
                            >
                            {selectedAbilities.includes(ability.id) ? "Remove" : "Add"}
                            </Button>
                        </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};

export default AbilitySelector;