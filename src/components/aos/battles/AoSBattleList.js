import React, {useState, useEffect} from 'react';
import {Row, Col, Card, Button, Form, InputGroup, Alert, Table, Badge} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {collection, query, orderBy, getDocs} from 'firebase/firestore';
import {db} from '../../../firebase/config';
import {useAuth} from '../../../contexts/AuthContext';
import AoSBattlePhases from '../../../enums/aos/AoSBattlePhases';
import AoSGrandStrategies from '../../../enums/aos/AoSGrandStrategies';
import LoadingSpinner from '../../layout/LoadingSpinner';

const AoSBattleList = () => {
    const [battles, setBattles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCompleted, setShowCompleted] = useState(false);
    const {currentUser} = useAuth();

    useEffect(() => {
        if (currentUser) {
            fetchBattles();
        }
    }, [currentUser]);

    const fetchBattles = async () => {
        try {
            setLoading(true);
            const battlesRef = collection(db, 'users', currentUser.uid, 'aosBattles');
            const q = query(battlesRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            const battlesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
            }));

            setBattles(battlesList);
            setError('');
        } catch (err) {
            console.error('Error fetching battles:', err);
            setError('Failed to fetch battles');
        } finally {
            setLoading(false);
        }
    };

    const isBattleActive = (battle) => {
        return !battle.isComplete && !battle.winner;
    };

    const filteredBattles = battles.filter(battle => {
        if (!showCompleted && !isBattleActive(battle)) return false;

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                battle.name?.toLowerCase().includes(searchLower) ||
                battle.player1?.name?.toLowerCase().includes(searchLower) ||
                battle.player2?.name?.toLowerCase().includes(searchLower) ||
                battle.player1?.armyName?.toLowerCase().includes(searchLower) ||
                battle.player2?.armyName?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });

    const formatDate = (date) => {
        if (!date) return 'Unknown';
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    };

    if (loading) return <LoadingSpinner text="Loading battles..."/>;

    return (
        <>
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col md={6} className="mb-3 mb-md-0">
                                    <Form.Group>
                                        <Form.Label>Search Battles</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="text"
                                                placeholder="Search by name, player, or army..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            {searchTerm && (
                                                <Button
                                                    variant="outline-secondary"
                                                    onClick={() => setSearchTerm('')}
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                <Col md={3} className="mb-3 mb-md-0">
                                    <Form.Group>
                                        <Form.Label>&nbsp;</Form.Label>
                                        <Form.Check
                                            type="checkbox"
                                            id="showCompleted"
                                            label="Show Completed Battles"
                                            checked={showCompleted}
                                            onChange={(e) => setShowCompleted(e.target.checked)}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={3} className="text-end">
                                    <Form.Label className="d-block">&nbsp;</Form.Label>
                                    <Button
                                        as={Link}
                                        to="/aos/battles/create"
                                        variant="primary"
                                    >
                                        New Battle
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {error && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger">{error}</Alert>
                    </Col>
                </Row>
            )}

            {battles.length === 0 ? (
                <Card>
                    <Card.Body className="text-center py-5">
                        <h4>No battles found</h4>
                        <p>You haven't created any AoS battles yet.</p>
                        <Button as={Link} to="/aos/battles/create" variant="primary">
                            Start New Battle
                        </Button>
                    </Card.Body>
                </Card>
            ) : filteredBattles.length === 0 ? (
                <Card>
                    <Card.Body className="text-center py-5">
                        <h4>No matching battles</h4>
                        <p>No battles match your current filters.</p>
                        <Button onClick={() => {
                            setSearchTerm('');
                            setShowCompleted(true);
                        }} variant="outline-primary">
                            Clear Filters
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Card>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead>
                                <tr>
                                    <th>Battle</th>
                                    <th>Players</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredBattles.map(battle => (
                                    <tr key={battle.id}>
                                        <td>
                                            <div className="fw-bold">{battle.name || 'Untitled Battle'}</div>
                                            <div className="small text-muted">
                                                {battle.battlePointsLimit} pts
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <strong>{battle.player1?.name || 'Player 1'}</strong>
                                                {battle.winner === 1 && (
                                                    <Badge bg="success" className="ms-2">Winner</Badge>
                                                )}
                                            </div>
                                            <div className="small text-muted">{battle.player1?.armyName}</div>
                                            <div className="mt-2">
                                                <strong>{battle.player2?.name || 'Player 2'}</strong>
                                                {battle.winner === 2 && (
                                                    <Badge bg="success" className="ms-2">Winner</Badge>
                                                )}
                                            </div>
                                            <div className="small text-muted">{battle.player2?.armyName}</div>
                                        </td>
                                        <td>
                                            <div>
                                                <Badge bg="primary">{battle.player1VictoryPoints || 0} VP</Badge>
                                                <Badge bg="info"
                                                       className="ms-1">{battle.player1CommandPoints || 0} CP</Badge>
                                            </div>
                                            <div className="mt-2">
                                                <Badge bg="primary">{battle.player2VictoryPoints || 0} VP</Badge>
                                                <Badge bg="info"
                                                       className="ms-1">{battle.player2CommandPoints || 0} CP</Badge>
                                            </div>
                                        </td>
                                        <td>
                                            {isBattleActive(battle) ? (
                                                <>
                                                    <Badge bg="success" className="d-block mb-1">Active</Badge>
                                                    <div className="small">
                                                        Round {battle.currentRound || 1}
                                                    </div>
                                                    <Badge
                                                        bg="secondary"
                                                        className="mt-1"
                                                        style={{backgroundColor: AoSBattlePhases.getColor(battle.currentPhase)}}
                                                    >
                                                        {AoSBattlePhases.getDisplayName(battle.currentPhase).replace(' Phase', '')}
                                                    </Badge>
                                                    {battle.priorityPlayer && (
                                                        <div className="small mt-1 text-muted">
                                                            Priority: {battle.priorityPlayer === 1 ? battle.player1?.name : battle.player2?.name}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <Badge bg="secondary" className="d-block mb-1">Completed</Badge>
                                                    <div className="small text-muted">
                                                        {battle.currentRound || 1} rounds
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                        <td>
                                            <div className="small">{formatDate(battle.lastUpdated)}</div>
                                        </td>
                                        <td>
                                            <Link
                                                to={`/aos/battles/${battle.id}`}
                                                className="btn btn-primary btn-sm"
                                            >
                                                {isBattleActive(battle) ? 'Continue' : 'View'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </>
    );
};

export default AoSBattleList;