import React, {useState, useEffect} from 'react';
import {Card, Form, Button, Alert, Row, Col} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import {collection, addDoc, getDocs, query, where, getDoc, doc, serverTimestamp} from 'firebase/firestore';
import {db} from '../../../firebase/config';
import {useAuth} from '../../../contexts/AuthContext';
import GameSystems from '../../../enums/GameSystems';
import AoSBattlePhases from '../../../enums/aos/AoSBattlePhases';
import AoSGrandStrategies from '../../../enums/aos/AoSGrandStrategies';

const AoSBattleCreate = () => {
    const {currentUser} = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [armies, setArmies] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        battlePointsLimit: 2000,
        player1ArmyId: '',
        player2ArmyId: '',
        player1Name: currentUser?.displayName || 'Player 1',
        player2Name: 'Player 2',
        player1GrandStrategy: '',
        player2GrandStrategy: ''
    });

    useEffect(() => {
        fetchArmies();
    }, [currentUser]);

    const fetchArmies = async () => {
        if (!currentUser) return;

        try {
            const armiesRef = collection(db, 'users', currentUser.uid, 'armies');
            const q = query(armiesRef, where('gameSystem', '==', GameSystems.AOS));
            const snapshot = await getDocs(q);

            setArmies(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));
        } catch (err) {
            console.error('Error fetching armies:', err);
            setError('Failed to load armies');
        }
    };

    const loadArmyUnits = async (armyId) => {
        const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
        const armyDoc = await getDoc(armyRef);

        if (!armyDoc.exists()) return [];

        const armyData = armyDoc.data();
        const unitPromises = (armyData.units || []).map(async (unitId) => {
            const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
            const unitDoc = await getDoc(unitRef);

            if (!unitDoc.exists()) return null;

            const unitData = unitDoc.data();
            const hasBattleDamaged = (unitData.abilities || []).some(ability =>
                ability.description?.toLowerCase().includes('battle damaged')
            );

            // Get wounds and model count from top-level fields
            const woundsPerModel = unitData.health || unitData.wounds || 0;
            const modelCount = unitData.minModelCount || unitData.modelCount || 1;

            return {
                unitId: unitDoc.id,
                name: unitData.name,
                startingModels: modelCount,
                currentModels: modelCount,
                isDefeated: false,
                hasBattleDamaged,
                currentWounds: woundsPerModel,
                maxWounds: woundsPerModel
            };
        });

        return (await Promise.all(unitPromises)).filter(Boolean);
    };

    const calculateStartingCP = (points) => {
        if (points < 2000) return 0;
        if (points < 3000) return 1;
        return 2;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.player1ArmyId || !formData.player2ArmyId) {
            setError('Please select armies for both players');
            return;
        }

        try {
            setLoading(true);

            const [player1Units, player2Units] = await Promise.all([
                loadArmyUnits(formData.player1ArmyId),
                loadArmyUnits(formData.player2ArmyId)
            ]);

            const player1Army = armies.find(a => a.id === formData.player1ArmyId);
            const player2Army = armies.find(a => a.id === formData.player2ArmyId);

            const player1HasAuxiliary = (player1Army.auxiliaryUnits || []).length > 0;
            const player2HasAuxiliary = (player2Army.auxiliaryUnits || []).length > 0;

            const startingCP = calculateStartingCP(formData.battlePointsLimit);

            const battleData = {
                name: formData.name,
                gameSystem: GameSystems.AOS,
                battlePointsLimit: formData.battlePointsLimit,

                player1: {
                    userId: currentUser.uid,
                    name: formData.player1Name,
                    armyId: formData.player1ArmyId,
                    armyName: player1Army.name,
                    faction: player1Army.faction,
                    grandStrategy: formData.player1GrandStrategy
                },
                player2: {
                    name: formData.player2Name,
                    armyId: formData.player2ArmyId,
                    armyName: player2Army.name,
                    faction: player2Army.faction,
                    grandStrategy: formData.player2GrandStrategy
                },

                currentRound: 1,
                currentPhase: AoSBattlePhases.SETUP,
                priorityPlayer: null,

                startingCPPlayer1: startingCP,
                startingCPPlayer2: startingCP,
                player1CommandPoints: startingCP,
                player2CommandPoints: startingCP,
                player1HasAuxiliary,
                player2HasAuxiliary,

                player1VictoryPoints: 0,
                player2VictoryPoints: 0,
                player1BattleTactic: '',
                player2BattleTactic: '',

                player1Units,
                player2Units,

                usedAbilitiesThisPhase: {
                    player1: [],
                    player2: []
                },

                usedOncePerBattle: {
                    player1: [],
                    player2: []
                },

                roundHistory: [],
                cpHistory: [],

                isSharedBattle: false,
                isComplete: false,
                winner: null,
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp()
            };

            const battleRef = await addDoc(
                collection(db, 'users', currentUser.uid, 'aosBattles'),
                battleData
            );

            navigate(`/aos/battles/${battleRef.id}`);
        } catch (err) {
            console.error('Error creating battle:', err);
            setError('Failed to create battle: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Card.Header>
                <h3>Create AoS Battle</h3>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Battle Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Battle Size (Points)</Form.Label>
                        <Form.Control
                            type="number"
                            step="500"
                            value={formData.battlePointsLimit}
                            onChange={(e) => setFormData({...formData, battlePointsLimit: parseInt(e.target.value)})}
                            required
                        />
                        <Form.Text>
                            Starting CP: {calculateStartingCP(formData.battlePointsLimit)}
                            {' '}(&lt;2000: 0 CP, 2000-2999: 1 CP, 3000+: 2 CP)
                        </Form.Text>
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <h5>Player 1</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.player1Name}
                                    onChange={(e) => setFormData({...formData, player1Name: e.target.value})}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Army</Form.Label>
                                <Form.Select
                                    value={formData.player1ArmyId}
                                    onChange={(e) => setFormData({...formData, player1ArmyId: e.target.value})}
                                    required
                                >
                                    <option value="">Select army...</option>
                                    {armies.map(army => (
                                        <option key={army.id} value={army.id}>
                                            {army.name} ({army.totalPoints || 0} pts)
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Grand Strategy</Form.Label>
                                <Form.Select
                                    value={formData.player1GrandStrategy}
                                    onChange={(e) => setFormData({...formData, player1GrandStrategy: e.target.value})}
                                >
                                    <option value="">Choose strategy...</option>
                                    {AoSGrandStrategies.getAllStrategies().map(strategy => (
                                        <option key={strategy} value={strategy}>
                                            {AoSGrandStrategies.getDisplayName(strategy)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <div className="mb-3 p-2 bg-light rounded" style={{maxHeight: '200px', overflowY: 'auto'}}>
                                <small className="fw-bold d-block mb-2">Available Strategies:</small>
                                {AoSGrandStrategies.getAllStrategies().map(strategy => (
                                    <div
                                        key={strategy}
                                        className={`small mb-2 p-1 ${formData.player1GrandStrategy === strategy ? 'bg-primary text-white rounded' : ''}`}
                                    >
                                        <strong>{AoSGrandStrategies.getDisplayName(strategy)}:</strong>{' '}
                                        {AoSGrandStrategies.getDescription(strategy)}
                                    </div>
                                ))}
                            </div>
                        </Col>

                        <Col md={6}>
                            <h5>Player 2</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.player2Name}
                                    onChange={(e) => setFormData({...formData, player2Name: e.target.value})}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Army</Form.Label>
                                <Form.Select
                                    value={formData.player2ArmyId}
                                    onChange={(e) => setFormData({...formData, player2ArmyId: e.target.value})}
                                    required
                                >
                                    <option value="">Select army...</option>
                                    {armies.map(army => (
                                        <option key={army.id} value={army.id}>
                                            {army.name} ({army.totalPoints || 0} pts)
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Grand Strategy</Form.Label>
                                <Form.Select
                                    value={formData.player2GrandStrategy}
                                    onChange={(e) => setFormData({...formData, player2GrandStrategy: e.target.value})}
                                >
                                    <option value="">Choose strategy...</option>
                                    {AoSGrandStrategies.getAllStrategies().map(strategy => (
                                        <option key={strategy} value={strategy}>
                                            {AoSGrandStrategies.getDisplayName(strategy)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <div className="mb-3 p-2 bg-light rounded" style={{maxHeight: '200px', overflowY: 'auto'}}>
                                <small className="fw-bold d-block mb-2">Available Strategies:</small>
                                {AoSGrandStrategies.getAllStrategies().map(strategy => (
                                    <div
                                        key={strategy}
                                        className={`small mb-2 p-1 ${formData.player2GrandStrategy === strategy ? 'bg-primary text-white rounded' : ''}`}
                                    >
                                        <strong>{AoSGrandStrategies.getDisplayName(strategy)}:</strong>{' '}
                                        {AoSGrandStrategies.getDescription(strategy)}
                                    </div>
                                ))}
                            </div>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-between">
                        <Button variant="secondary" onClick={() => navigate('/battles')}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Battle'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default AoSBattleCreate;