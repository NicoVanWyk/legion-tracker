// src/components/profile/UserStats.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserStats = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [battleStats, setBattleStats] = useState({
    totalBattles: 0,
    wins: 0,
    losses: 0,
    draws: 0
  });
  
  const [factionStats, setFactionStats] = useState({});
  const [recentBattles, setRecentBattles] = useState([]);
  const [mostUsedUnits, setMostUsedUnits] = useState([]);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // Fetch battles where user is player1 or player2
        const battlesQuery = query(
          collection(db, 'battles'),
          where('status', '==', 'Completed')
        );
        const battlesSnapshot = await getDocs(battlesQuery);
        
        let battlesData = [];
        let totalBattles = 0;
        let wins = 0;
        let losses = 0;
        let draws = 0;
        
        // Faction play count
        const factionCounts = {};
        
        // Unit usage tracking
        const unitUsage = {};
        
        battlesSnapshot.forEach(doc => {
          const battle = { id: doc.id, ...doc.data() };
          
          // Only count battles where the current user participated
          if (battle.player1.userId === currentUser.uid || battle.player2.userId === currentUser.uid) {
            totalBattles++;
            battlesData.push(battle);
            
            // Determine win/loss/draw
            if (battle.winner === 'draw') {
              draws++;
            } else if (
              (battle.winner === 'player1' && battle.player1.userId === currentUser.uid) ||
              (battle.winner === 'player2' && battle.player2.userId === currentUser.uid)
            ) {
              wins++;
            } else {
              losses++;
            }
            
            // Track faction usage
            const userFaction = battle.player1.userId === currentUser.uid 
              ? battle.player1.armyFaction 
              : battle.player2.armyFaction;
              
            if (!factionCounts[userFaction]) {
              factionCounts[userFaction] = 1;
            } else {
              factionCounts[userFaction]++;
            }
            
            // Track unit usage from army composition if available
            // This would require army reference data not shown here
          }
        });
        
        // Sort battles by date (most recent first)
        battlesData.sort((a, b) => b.date.toDate() - a.date.toDate());
        
        // Get recent battles
        const recent = battlesData.slice(0, 5);
        
        // Sort most used units
        const unitList = Object.entries(unitUsage).map(([unitId, count]) => ({ unitId, count }));
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
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setError('Failed to load statistics. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchUserStats();
  }, [currentUser]);

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
  const factionLabels = Object.keys(factionStats);
  const factionData = {
    labels: factionLabels,
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
      <div className="text-center">
        <Spinner animation="border" />
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="user-stats">
      <h3 className="mb-4">Battle Statistics</h3>
      
      {battleStats.totalBattles === 0 ? (
        <Alert variant="info">
          You haven't played any battles yet. Start a battle to see your statistics!
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
                    Win Rate: {((battleStats.wins / battleStats.totalBattles) * 100).toFixed(1)}%
                  </small>
                </Card.Footer>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card>
                <Card.Header>Faction Usage</Card.Header>
                <Card.Body>
                  <div style={{ height: '250px' }}>
                    {Object.keys(factionStats).length > 0 ? (
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
                      <p className="text-center text-muted">No faction data available</p>
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
                      const isPlayer1 = battle.player1.userId === currentUser.uid;
                      const userArmy = isPlayer1 ? battle.player1.armyName : battle.player2.armyName;
                      const opponentArmy = isPlayer1 ? battle.player2.armyName : battle.player1.armyName;
                      const userFaction = isPlayer1 ? battle.player1.armyFaction : battle.player2.armyFaction;
                      const opponentFaction = isPlayer1 ? battle.player2.armyFaction : battle.player1.armyFaction;
                      
                      let resultClass = 'text-info';
                      let resultText = 'Draw';
                      
                      if (battle.winner === 'player1') {
                        resultClass = isPlayer1 ? 'text-success' : 'text-danger';
                        resultText = isPlayer1 ? 'Victory' : 'Defeat';
                      } else if (battle.winner === 'player2') {
                        resultClass = isPlayer1 ? 'text-danger' : 'text-success';
                        resultText = isPlayer1 ? 'Defeat' : 'Victory';
                      }
                      
                      return (
                        <ListGroup.Item key={battle.id}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-0">{battle.name}</h6>
                              <small className="text-muted">
                                {battle.date.toDate().toLocaleDateString()} · {battle.scenario}
                              </small>
                              <div>
                                <small>
                                  {userArmy} ({userFaction}) vs. {opponentArmy} ({opponentFaction})
                                </small>
                              </div>
                            </div>
                            <span className={`badge ${resultClass}`}>{resultText}</span>
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
                  <ListGroup.Item key={unit.unitId}>
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