// src/components/profile/UserStats.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ListGroup, Spinner, Alert, Button } from 'react-bootstrap';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import PlayerSides from '../../enums/PlayerSides';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserStats = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    const [battleStats, setBattleStats] = useState({
        totalBattles: 0,
        wins: 0,
        losses: 0,
        draws: 0
    });

    const [factionStats, setFactionStats] = useState({});
    const [recentBattles, setRecentBattles] = useState([]);
    const [mostUsedUnits, setMostUsedUnits] = useState([]);

    const fetchUserStats = async () => {
        setLoading(true);
        setError('');

        try {
            // Fix: Correct path to the battles collection
            const battlesCollection = collection(db, 'users', currentUser.uid, 'battles');

            // Create a query for completed battles
            const battlesQuery = query(
                battlesCollection,
                where('isComplete', '==', true),  // Use the correct field for completion status
                orderBy('lastUpdated', 'desc'),   // Order by date for recent battles
                limit(30)                         // Limit to reasonable number for calculation
            );

            const battlesSnapshot = await getDocs(battlesQuery);

            let battlesData = [];
            let totalBattles = 0;
            let wins = 0;
            let losses = 0;
            let draws = 0;

            // Faction play count
            const factionCounts = {
                'republic': 0,
                'separatist': 0,
                'rebel': 0,
                'empire': 0
            };

            // Unit usage tracking
            const unitUsage = {};

            // Process battle data
            battlesSnapshot.forEach(doc => {
                const battle = { id: doc.id, ...doc.data() };

                // Convert Firestore timestamps to JS Date objects
                if (battle.createdAt) {
                    battle.date = battle.createdAt.toDate ? battle.createdAt.toDate() : new Date(battle.createdAt);
                } else if (battle.lastUpdated) {
                    battle.date = battle.lastUpdated.toDate ? battle.lastUpdated.toDate() : new Date(battle.lastUpdated);
                } else {
                    battle.date = new Date();
                }

                totalBattles++;
                battlesData.push(battle);

                // Determine win/loss/draw based on battle.winner or similar field
                if (battle.winner === null || battle.winner === undefined) {
                    // If no winner is set, count as a draw
                    draws++;
                } else if (battle.winner === currentUser.uid ||
                    (battle.winner === PlayerSides.BLUE && battle.activePlayer === PlayerSides.BLUE) ||
                    (battle.winner === PlayerSides.RED && battle.activePlayer === PlayerSides.RED)) {
                    wins++;
                } else {
                    losses++;
                }

                // Track faction usage - find the faction the user played
                const userArmy = battle.blueUnits ? 'blue' : 'red'; // Assume blue is user
                const userFaction = userArmy === 'blue' ?
                    (battle.blueArmy || '').toLowerCase() :
                    (battle.redArmy || '').toLowerCase();

                if (userFaction && factionCounts.hasOwnProperty(userFaction)) {
                    factionCounts[userFaction]++;
                }

                // Track unit usage
                const userUnits = userArmy === 'blue' ? battle.blueUnits : battle.redUnits;
                if (userUnits && Array.isArray(userUnits)) {
                    userUnits.forEach(unit => {
                        const unitId = unit.id || unit.name;
                        if (unitId) {
                            unitUsage[unitId] = (unitUsage[unitId] || 0) + 1;
                        }
                    });
                }
            });

            // Sort battles by date (most recent first)
            battlesData.sort((a, b) => b.date - a.date);

            // Get recent battles
            const recent = battlesData.slice(0, 5);

            // Sort most used units
            const unitList = Object.entries(unitUsage)
                .map(([unitId, count]) => ({ unitId, count }))
                .filter(item => item.unitId);

            unitList.sort((a, b) => b.count - a.count);

            // Update state with calculated stats
            setBattleStats({
                totalBattles,
                wins,
                losses,
                draws
            });

            setFactionStats(factionCounts);
            setRecentBattles(recent);
            setMostUsedUnits(unitList.slice(0, 5)); // Top 5 most used units

        } catch (error) {
            console.error('Error fetching user stats:', error);
            setError('Failed to load statistics: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchUserStats();
        }
    }, [currentUser, retryCount]);

    // Prepare chart data
    const battleResultsData = {
        labels: ['Wins', 'Losses', 'Draws'],
        datasets: [
            {
                data: [battleStats.wins, battleStats.losses, battleStats.draws],
                backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
                borderWidth: 1
            },
        ],
    };

    // Prepare faction usage chart
    const factionLabels = Object.keys(factionStats).filter(faction => factionStats[faction] > 0);
    const factionData = {
        labels: factionLabels.map(faction =>
            faction.charAt(0).toUpperCase() + faction.slice(1)
        ),
        datasets: [
            {
                label: 'Battles Played',
                data: factionLabels.map(faction => factionStats[faction]),
                backgroundColor: [
                    '#2196F3', // Republic
                    '#FF5722', // Separatist
                    '#8BC34A', // Rebel Alliance
                    '#607D8B'  // Empire
                ],
                borderWidth: 1
            },
        ],
    };

    if (loading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" />
                <p>Loading statistics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Error Loading Statistics</Alert.Heading>
                <p>{error}</p>
                <div className="d-flex justify-content-end">
                    <Button
                        variant="outline-danger"
                        onClick={() => setRetryCount(prev => prev + 1)}
                    >
                        Retry Loading
                    </Button>
                </div>
            </Alert>
        );
    }

    return (
        <div className="user-stats">
            <h3 className="mb-4">Battle Statistics</h3>

            {battleStats.totalBattles === 0 ? (
                <Alert variant="info">
                    <Alert.Heading>No Battle Data</Alert.Heading>
                    <p>You haven't completed any battles yet. Start and finish a battle to see your statistics!</p>
                    <hr />
                    <div className="d-flex justify-content-end">
                        <Button variant="outline-primary" href="/battles/create">
                            Create New Battle
                        </Button>
                    </div>
                </Alert>
            ) : (
                <>
                    <Row className="mb-4">
                        <Col md={6}>
                            <Card>
                                <Card.Header>Battle Results</Card.Header>
                                <Card.Body>
                                    <div style={{ height: '250px' }}>
                                        <Pie
                                            data={battleResultsData}
                                            options={{
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'right',
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </Card.Body>
                                <Card.Footer className="text-center">
                                    <small className="text-muted">
                                        Win Rate: {battleStats.totalBattles ? ((battleStats.wins / battleStats.totalBattles) * 100).toFixed(1) : 0}%
                                    </small>
                                </Card.Footer>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card>
                                <Card.Header>Faction Usage</Card.Header>
                                <Card.Body>
                                    <div style={{ height: '250px' }}>
                                        {factionLabels.length > 0 ? (
                                            <Bar
                                                data={factionData}
                                                options={{
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            display: false
                                                        }
                                                    },
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            ticks: {
                                                                stepSize: 1
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="text-center text-muted h-100 d-flex align-items-center justify-content-center">
                                                <div>
                                                    <p>No faction data available</p>
                                                    <small>Complete more battles to see faction statistics</small>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={12}>
                            <Card>
                                <Card.Header>Recent Battles</Card.Header>
                                {recentBattles.length > 0 ? (
                                    <ListGroup variant="flush">
                                        {recentBattles.map(battle => {
                                            // Extract battle details safely with fallbacks
                                            const bluePlayer = battle.bluePlayer || 'Blue Player';
                                            const redPlayer = battle.redPlayer || 'Red Player';
                                            const blueArmy = battle.blueArmy || 'Blue Army';
                                            const redArmy = battle.redArmy || 'Red Army';
                                            const date = battle.date || new Date();
                                            const battleName = battle.name || `${blueArmy} vs ${redArmy}`;

                                            // Determine win/loss status
                                            let resultClass = 'text-info';
                                            let resultText = 'Draw';

                                            if (battle.winner === PlayerSides.BLUE) {
                                                resultClass = 'text-success';
                                                resultText = 'Victory';
                                            } else if (battle.winner === PlayerSides.RED) {
                                                resultClass = 'text-danger';
                                                resultText = 'Defeat';
                                            }

                                            return (
                                                <ListGroup.Item key={battle.id || `battle-${Math.random()}`}>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6 className="mb-0">{battleName}</h6>
                                                            <small className="text-muted">
                                                                {date.toLocaleDateString()} • {battle.scenario || 'Standard Battle'}
                                                            </small>
                                                            <div>
                                                                <small>
                                                                    {blueArmy} ({bluePlayer}) vs. {redArmy} ({redPlayer})
                                                                </small>
                                                            </div>
                                                        </div>
                                                        <span className={resultClass}>{resultText}</span>
                                                    </div>
                                                </ListGroup.Item>
                                            );
                                        })}
                                    </ListGroup>
                                ) : (
                                    <Card.Body>
                                        <p className="text-center text-muted">No recent battles found</p>
                                    </Card.Body>
                                )}
                            </Card>
                        </Col>
                    </Row>

                    {mostUsedUnits.length > 0 && (
                        <Card>
                            <Card.Header>Most Used Units</Card.Header>
                            <ListGroup variant="flush">
                                {mostUsedUnits.map((unit, index) => (
                                    <ListGroup.Item key={unit.unitId || `unit-${index}`}>
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <h6 className="mb-0">{unit.unitId}</h6>
                                                <small className="text-muted">Used in {unit.count} battles</small>
                                            </div>
                                            <span className="text-muted">#{index + 1}</span>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

export default UserStats;