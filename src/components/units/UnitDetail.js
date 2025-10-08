// src/components/units/UnitDetail.js (Updated with upgrade weapons)
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Alert, ListGroup, Accordion } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import UnitTypes from '../../enums/UnitTypes';
import Factions from '../../enums/Factions';
import DefenseDice from '../../enums/DefenseDice';
import UpgradeCardTypes from '../../enums/UpgradeCardTypes';
import Keywords from '../../enums/Keywords';
import WeaponRanges from '../../enums/WeaponRanges';
import AttackDice from '../../enums/AttackDice';
import WeaponKeywords from '../../enums/WeaponKeywords';
import LoadingSpinner from '../layout/LoadingSpinner';

const UnitDetail = ({ unitId }) => {
  const [unit, setUnit] = useState(null);
  const [abilities, setAbilities] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [customKeywords, setCustomKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch unit
        const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
        const unitDoc = await getDoc(unitRef);

        if (unitDoc.exists()) {
          const unitData = { id: unitDoc.id, ...unitDoc.data() };
          setUnit(unitData);

          // Fetch abilities
          if (unitData.abilities?.length > 0) {
            const abilitiesRef = collection(db, 'users', currentUser.uid, 'abilities');
            const abilitiesSnapshot = await getDocs(abilitiesRef);
            const abilitiesList = abilitiesSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(ability => unitData.abilities.includes(ability.id));
            setAbilities(abilitiesList);
          }

          // Fetch upgrade cards for equipped upgrades
          const allEquippedUpgrades = [];
          unitData.upgradeSlots?.forEach(slot => {
            if (slot.equippedUpgrades) allEquippedUpgrades.push(...slot.equippedUpgrades);
          });

          if (allEquippedUpgrades.length > 0) {
            const upgradesRef = collection(db, 'users', currentUser.uid, 'upgradeCards');
            const upgradesSnapshot = await getDocs(upgradesRef);
            const upgradesList = upgradesSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(upgrade => allEquippedUpgrades.includes(upgrade.id));
            setUpgrades(upgradesList);
          }

          // Fetch custom keywords
          const keywordsRef = collection(db, 'users', currentUser.uid, 'customKeywords');
          const keywordsSnapshot = await getDocs(keywordsRef);
          const keywordsList = keywordsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCustomKeywords(keywordsList);
        } else {
          setError('Unit not found');
        }
      } catch (err) {
        console.error('Error fetching unit:', err);
        setError('Failed to fetch unit details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && unitId) fetchData();
  }, [currentUser, unitId]);

  const handleEdit = () => navigate(`/units/edit/${unitId}`);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'users', currentUser.uid, 'units', unitId));
      navigate('/units');
    } catch (err) {
      console.error('Error deleting unit:', err);
      setError('Failed to delete unit. Please try again later.');
      setLoading(false);
    }
  };

  const cancelDelete = () => setConfirmDelete(false);

  const getKeywordDisplay = keyword => {
    if (keyword.startsWith('custom:')) {
      const customId = keyword.replace('custom:', '');
      const customKeyword = customKeywords.find(k => k.id === customId);
      return customKeyword ? (
        <>
          {customKeyword.name}
          <span className="ms-1" title="Custom Keyword">
            ★
          </span>
        </>
      ) : (
        keyword
      );
    }
    return Keywords.getDisplayName(keyword);
  };

  const calculateModifiedStats = () => {
    if (!unit) return null;

    let stats = {
      wounds: unit.wounds || 1,
      courage: unit.courage || 1,
      speed: unit.speed || 2,
      modelCount: unit.currentModelCount || 1,
      totalPoints: unit.points || 0
    };

    // Apply upgrade modifications
    unit.upgradeSlots?.forEach(slot => {
      slot.equippedUpgrades?.forEach(upgradeId => {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (upgrade) {
          stats.totalPoints += upgrade.pointsCost || 0;

          if (upgrade.effects?.statModifiers) {
            stats.wounds += upgrade.effects.statModifiers.wounds || 0;
            stats.courage += upgrade.effects.statModifiers.courage || 0;
            stats.speed += upgrade.effects.statModifiers.speed || 0;
          }

          stats.modelCount += upgrade.effects?.modelCountChange || 0;
        }
      });
    });

    return stats;
  };

  // 🧩 NEW: Combine base weapons with upgrade weapons
  const calculateModifiedWeapons = () => {
    if (!unit) return [];

    const baseWeapons = unit.weapons || [];
    const upgradeWeapons = [];

    unit.upgradeSlots?.forEach(slot => {
      slot.equippedUpgrades?.forEach(upgradeId => {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (upgrade?.effects?.addWeapons?.length > 0) {
          upgrade.effects.addWeapons.forEach(weapon => {
            upgradeWeapons.push({
              ...weapon,
              source: upgrade.name
            });
          });
        }
      });
    });

    return [...baseWeapons.map(w => ({ ...w, source: 'Base Unit' })), ...upgradeWeapons];
  };

  if (loading) return <LoadingSpinner text="Loading unit details..." />;

  if (error)
    return (
      <Alert variant="danger">
        {error}
        <div className="mt-3">
          <Button variant="primary" onClick={() => navigate('/units')}>
            Back to Units
          </Button>
        </div>
      </Alert>
    );

  if (!unit)
    return (
      <Alert variant="warning">
        Unit not found.
        <div className="mt-3">
          <Button variant="primary" onClick={() => navigate('/units')}>
            Back to Units
          </Button>
        </div>
      </Alert>
    );

  const modifiedStats = calculateModifiedStats();
  const modifiedWeapons = calculateModifiedWeapons();

  return (
    <>
      {confirmDelete && (
        <Alert variant="danger">
          <Alert.Heading>Confirm Delete</Alert.Heading>
          <p>Are you sure you want to delete this unit? This action cannot be undone.</p>
          <div className="d-flex justify-content-end">
            <Button variant="outline-secondary" onClick={cancelDelete} className="me-2">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Unit
            </Button>
          </div>
        </Alert>
      )}

      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>{unit.name}</h2>
            <div>
              <Button variant="outline-primary" onClick={handleEdit} className="me-2">
                Edit
              </Button>
              <Button variant="outline-danger" onClick={handleDelete}>
                {confirmDelete ? 'Confirm Delete' : 'Delete'}
              </Button>
            </div>
          </div>

          {/* --- UNIT INFO --- */}
          <Card className="mb-4">
            <Card.Header className={`faction-${unit.faction}`}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Unit Information</h5>
                <Badge bg="secondary">{UnitTypes.getDisplayName(unit.type)}</Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <p>
                    <strong>Faction:</strong> {Factions.getDisplayName(unit.faction)}
                  </p>
                </Col>
                <Col md={3}>
                  <p>
                    <strong>Points:</strong> {unit.points || 0}
                    {modifiedStats.totalPoints !== unit.points && (
                      <span className="text-primary"> → {modifiedStats.totalPoints}</span>
                    )}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Stats:</strong>{' '}
                    {modifiedStats.wounds !== unit.wounds && (
                      <span className="text-primary">{modifiedStats.wounds}</span>
                    )}
                    {modifiedStats.wounds === unit.wounds && (unit.wounds || 1)}W /{' '}
                    {unit.courage ? (
                      <>
                        {modifiedStats.courage !== unit.courage && (
                          <span className="text-primary">{modifiedStats.courage}</span>
                        )}
                        {modifiedStats.courage === unit.courage && unit.courage}C /{' '}
                      </>
                    ) : (
                      ' - /'
                    )}{' '}
                    {modifiedStats.speed !== unit.speed && (
                      <span className="text-primary">{modifiedStats.speed}</span>
                    )}
                    {modifiedStats.speed === unit.speed && (unit.speed || 2)}S /{' '}
                    <span className={DefenseDice.getColorClass(unit.defense)}>
                      {unit.defense === 'white' ? 'W' : 'R'}
                    </span>{' '}
                    Defense
                  </p>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <p>
                    <strong>Model Count:</strong> Min: {unit.minModelCount || 1} | Current:{' '}
                    {unit.currentModelCount || 1}
                    {modifiedStats.modelCount !== unit.currentModelCount && (
                      <span className="text-primary"> → {modifiedStats.modelCount}</span>
                    )}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* --- KEYWORDS --- */}
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Keywords</h5>
                </Card.Header>
                <Card.Body>
                  {unit.keywords && unit.keywords.length > 0 ? (
                    <div>
                      {unit.keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          bg={keyword.startsWith('custom:') ? 'info' : 'secondary'}
                          className="me-2 mb-2 p-2"
                        >
                          {getKeywordDisplay(keyword)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No keywords assigned to this unit.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* --- WEAPONS (Base + Upgrades) --- */}
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Weapons</h5>
                </Card.Header>
                <Card.Body>
                  {modifiedWeapons.length > 0 ? (
                    <ListGroup variant="flush">
                      {modifiedWeapons.map((weapon, index) => (
                        <ListGroup.Item key={index}>
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">{weapon.name}</h6>
                            <Badge bg={weapon.source === 'Base Unit' ? 'secondary' : 'info'}>
                              {weapon.source}
                            </Badge>
                          </div>
                          <div className="small text-muted">
                            <strong>Range:</strong>{' '}
                            {WeaponRanges.getDisplayName
                              ? WeaponRanges.getDisplayName(weapon.range)
                              : weapon.range}
                          </div>
                          <div className="small">
                            <strong>Dice:</strong>
                            {weapon.dice?.[AttackDice.RED] > 0 && (
                              <span className="text-danger"> {weapon.dice[AttackDice.RED]}R</span>
                            )}
                            {weapon.dice?.[AttackDice.BLACK] > 0 && (
                              <span> {weapon.dice[AttackDice.BLACK]}B</span>
                            )}
                            {weapon.dice?.[AttackDice.WHITE] > 0 && (
                              <span className="text-muted"> {weapon.dice[AttackDice.WHITE]}W</span>
                            )}
                          </div>
                          {weapon.keywords?.length > 0 && (
                            <div className="small">
                              <strong>Keywords:</strong>{' '}
                              {weapon.keywords
                                .map(kw =>
                                  WeaponKeywords.getDisplayName
                                    ? WeaponKeywords.getDisplayName(kw)
                                    : kw
                                )
                                .join(', ')}
                            </div>
                          )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p className="text-muted">No weapons assigned to this unit.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* --- ABILITIES, UPGRADES, NOTES, etc --- */}
          {abilities.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Abilities</h5>
              </Card.Header>
              <Card.Body>
                <Accordion>
                  {abilities.map((ability, index) => (
                    <Accordion.Item key={ability.id} eventKey={index.toString()}>
                      <Accordion.Header>
                        <strong>{ability.name}</strong>
                      </Accordion.Header>
                      <Accordion.Body>
                        <p className="mb-2 text-muted">{ability.description}</p>
                        <div className="mb-2">{ability.rulesText}</div>
                        {ability.reminders?.length > 0 && (
                          <div className="mt-3">
                            <strong className="small">Reminders:</strong>
                            <div className="mt-1">
                              {ability.reminders.map((reminder, idx) => (
                                <div key={idx} className="small text-muted mb-1">
                                  • {reminder.text}
                                  {reminder.condition && (
                                    <span className="fst-italic"> ({reminder.condition})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card.Body>
            </Card>
          )}

          {unit.upgradeSlots && unit.upgradeSlots.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Upgrade Slots</h5>
              </Card.Header>
              <Card.Body>
                {unit.upgradeSlots.map((slot, index) => {
                  const equippedUpgrades = upgrades.filter(u =>
                    slot.equippedUpgrades?.includes(u.id)
                  );

                  return (
                    <div key={index} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Badge bg={UpgradeCardTypes.getBadgeColor(slot.type)}>
                          <i
                            className={UpgradeCardTypes.getIconClass(slot.type) + ' me-1'}
                          ></i>
                          {UpgradeCardTypes.getDisplayName(slot.type)}
                        </Badge>
                        <span className="small text-muted">
                          {slot.equippedUpgrades?.length || 0} / {slot.maxCount} equipped
                        </span>
                      </div>

                      {equippedUpgrades.length > 0 ? (
                        <ListGroup variant="flush">
                          {equippedUpgrades.map(upgrade => (
                            <ListGroup.Item key={upgrade.id} className="py-2">
                              <div className="d-flex justify-content-between">
                                <strong>{upgrade.name}</strong>
                                <Badge bg="warning" text="dark">
                                  {upgrade.pointsCost} pts
                                </Badge>
                              </div>
                              <div className="small text-muted">{upgrade.description}</div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      ) : (
                        <p className="small text-muted mb-0">No upgrades equipped</p>
                      )}
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          )}

          {unit.miniatures && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Miniature Information</h5>
              </Card.Header>
              <Card.Body>
                <p style={{ whiteSpace: 'pre-line' }}>{unit.miniatures}</p>
              </Card.Body>
            </Card>
          )}

          {unit.notes && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Notes</h5>
              </Card.Header>
              <Card.Body>
                <p style={{ whiteSpace: 'pre-line' }}>{unit.notes}</p>
              </Card.Body>
            </Card>
          )}

          <div className="d-flex justify-content-start mt-4">
            <Button variant="secondary" onClick={() => navigate('/units')}>
              Back to Units
            </Button>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default UnitDetail;