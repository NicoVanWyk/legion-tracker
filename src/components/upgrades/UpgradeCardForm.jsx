// src/components/upgrades/UpgradeCardForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Card, Alert, Row, Col, ListGroup, Badge, Accordion, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, addDoc, updateDoc, getDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import UpgradeCardTypes from '../../enums/UpgradeCardTypes';
import ReminderTypes from '../../enums/ReminderTypes';
import WeaponRanges from '../../enums/WeaponRanges';
import AttackDice from '../../enums/AttackDice';
import WeaponKeywords from '../../enums/WeaponKeywords';
import { v4 as uuidv4 } from 'uuid';

// Child modal component
const WeaponEditorModal = ({ show, onClose, onSave, weapon, setWeapon }) => {
  const allKeywords = useMemo(() => WeaponKeywords.getAllKeywords(), []);

  const handleWeaponChange = (e) => {
    const { name, value } = e.target;
    setWeapon((prev) => ({ ...prev, [name]: value }));
  };

  const handleWeaponDiceChange = (diceType, value) => {
    const numValue = parseInt(value, 10) || 0;
    setWeapon((prev) => ({
      ...prev,
      dice: { ...prev.dice, [diceType]: numValue },
    }));
  };

  const handleWeaponKeywordToggle = (keyword) => {
    setWeapon((prev) => {
      const keywords = prev.keywords.includes(keyword)
        ? prev.keywords.filter((k) => k !== keyword)
        : [...prev.keywords, keyword];
      return { ...prev, keywords };
    });
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{weapon.id ? 'Edit Weapon' : 'Add Weapon'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => e.preventDefault()}>
          <Form.Group className="mb-3">
            <Form.Label>Weapon Name*</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={weapon.name}
              onChange={handleWeaponChange}
              placeholder="Enter weapon name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Range</Form.Label>
            <Form.Select name="range" value={weapon.range} onChange={handleWeaponChange}>
              {Object.keys(WeaponRanges)
                .filter((key) => typeof WeaponRanges[key] === 'string')
                .map((key) => (
                  <option key={key} value={WeaponRanges[key]}>
                    {WeaponRanges.getDisplayName(WeaponRanges[key])}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Attack Dice</Form.Label>
            <Row>
              {[
                [AttackDice.RED, 'text-danger', 'Red Dice'],
                [AttackDice.BLACK, 'text-dark', 'Black Dice'],
                [AttackDice.WHITE, 'text-secondary', 'White Dice'],
              ].map(([dice, color, label]) => (
                <Col md={4} key={dice}>
                  <Form.Label className={color}>{label}</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="10"
                    value={weapon.dice[dice]}
                    onChange={(e) => handleWeaponDiceChange(dice, e.target.value)}
                  />
                </Col>
              ))}
            </Row>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Keywords</Form.Label>
            <Card>
              <Card.Body className="p-2">
                <div className="mb-2">
                  <strong>Selected Keywords:</strong>
                  {weapon.keywords.length === 0 ? (
                    <span className="text-muted ms-2">None</span>
                  ) : (
                    <div className="mt-1">
                      {weapon.keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          bg="info"
                          className="me-1 mb-1 p-2"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleWeaponKeywordToggle(keyword)}
                        >
                          {WeaponKeywords.getDisplayName(keyword)} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Accordion>
                  {Object.entries(allKeywords).map(([category, keywords]) => (
                    <Accordion.Item key={category} eventKey={category}>
                      <Accordion.Header>
                        {category.charAt(0).toUpperCase() + category.slice(1)} Keywords
                      </Accordion.Header>
                      <Accordion.Body className="p-0">
                        <ListGroup variant="flush">
                          {keywords.map((keyword) => (
                            <ListGroup.Item
                              key={keyword}
                              action
                              active={weapon.keywords.includes(keyword)}
                              onClick={() => handleWeaponKeywordToggle(keyword)}
                              className="py-2"
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <span>{WeaponKeywords.getDisplayName(keyword)}</span>
                                {weapon.keywords.includes(keyword) && <Badge bg="success">Selected</Badge>}
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card.Body>
            </Card>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onSave(weapon)}>
          Save Weapon
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const UpgradeCardForm = () => {
  const { upgradeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showWeaponModal, setShowWeaponModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    upgradeType: UpgradeCardTypes.GEAR,
    pointsCost: 0,
    description: '',
    effects: {
      modelCountChange: 0,
      addWeapons: [],
      addKeywords: [],
      addAbilities: [],
      statModifiers: {},
    },
    reminders: [],
  });

  const [availableKeywords, setAvailableKeywords] = useState([]);
  const [availableAbilities, setAvailableAbilities] = useState([]);
  const [currentWeapon, setCurrentWeapon] = useState({
    id: '',
    name: '',
    range: WeaponRanges.MELEE,
    dice: { [AttackDice.RED]: 0, [AttackDice.BLACK]: 0, [AttackDice.WHITE]: 0 },
    keywords: [],
  });
  const [editingWeaponIndex, setEditingWeaponIndex] = useState(null);

  useEffect(() => {
    if (upgradeId && currentUser) fetchUpgrade();
  }, [upgradeId]);

  useEffect(() => {
    if (currentUser) fetchAvailableOptions();
  }, []); // only once

  const fetchUpgrade = async () => {
    try {
      const ref = doc(db, 'users', currentUser.uid, 'upgradeCards', upgradeId);
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        setFormData(docSnap.data());
      } else setError('Upgrade not found.');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch upgrade.');
    }
  };

  const fetchAvailableOptions = async () => {
    try {
      const keywordsSnap = await getDocs(collection(db, 'users', currentUser.uid, 'customKeywords'));
      setAvailableKeywords(keywordsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const abilitiesSnap = await getDocs(collection(db, 'users', currentUser.uid, 'abilities'));
      setAvailableAbilities(abilitiesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEffectChange = (field, value) =>
    setFormData((prev) => ({
      ...prev,
      effects: { ...prev.effects, [field]: value },
    }));

  const handleAddWeapon = () => {
    setEditingWeaponIndex(null);
    setCurrentWeapon({
      id: uuidv4(),
      name: '',
      range: WeaponRanges.MELEE,
      dice: { [AttackDice.RED]: 0, [AttackDice.BLACK]: 0, [AttackDice.WHITE]: 0 },
      keywords: [],
    });
    setShowWeaponModal(true);
  };

  const handleEditWeapon = (index) => {
    setEditingWeaponIndex(index);
    setCurrentWeapon({ ...formData.effects.addWeapons[index] });
    setShowWeaponModal(true);
  };

  const handleSaveWeapon = (weapon) => {
    if (!weapon.name.trim()) return setError('Weapon name required.');
    const totalDice = weapon.dice[AttackDice.RED] + weapon.dice[AttackDice.BLACK] + weapon.dice[AttackDice.WHITE];
    if (totalDice <= 0) return setError('Weapon must have at least one attack die.');

    const newWeapons = [...(formData.effects.addWeapons || [])];
    if (editingWeaponIndex !== null) newWeapons[editingWeaponIndex] = weapon;
    else newWeapons.push(weapon);
    handleEffectChange('addWeapons', newWeapons);
    setShowWeaponModal(false);
    setError('');
  };

  const handleDeleteWeapon = (index) => {
    const newWeapons = [...formData.effects.addWeapons];
    newWeapons.splice(index, 1);
    handleEffectChange('addWeapons', newWeapons);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError('Upgrade name is required.');

    try {
      setLoading(true);
      const upgradeData = {
        ...formData,
        lastUpdated: serverTimestamp(),
        userId: currentUser.uid,
        isCustom: true,
      };

      if (upgradeId) {
        await updateDoc(doc(db, 'users', currentUser.uid, 'upgradeCards', upgradeId), upgradeData);
        setSuccess('Upgrade updated!');
      } else {
        await addDoc(collection(db, 'users', currentUser.uid, 'upgradeCards'), {
          ...upgradeData,
          createdAt: serverTimestamp(),
        });
        setSuccess('Upgrade created!');
      }

      setTimeout(() => navigate('/upgrades'), 1000);
    } catch (err) {
      console.error(err);
      setError('Failed to save upgrade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <Card.Header>
          <h3>{upgradeId ? 'Edit' : 'Create'} Upgrade Card</h3>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Upgrade Name*</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Upgrade Type*</Form.Label>
                  <Form.Select
                    value={formData.upgradeType}
                    onChange={(e) => setFormData({ ...formData, upgradeType: e.target.value })}
                  >
                    {UpgradeCardTypes.getAllTypes().map((type) => (
                      <option key={type} value={type}>
                        {UpgradeCardTypes.getDisplayName(type)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Points</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.pointsCost}
                    onChange={(e) => setFormData({ ...formData, pointsCost: parseInt(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label>Description*</Form.Label>
              <Form.Control
                as="textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </Form.Group>

            {/* --- EFFECTS --- */}
            <Card className="mt-4">
              <Card.Header>
                <strong>Effects</strong>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Model Count Change</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.effects.modelCountChange}
                        onChange={(e) =>
                          handleEffectChange('modelCountChange', parseInt(e.target.value) || 0)
                        }
                        placeholder="e.g. +1 for Heavy Weapon"
                      />
                      <Form.Text className="text-muted">
                        Increase/decrease number of models in the unit (e.g. +1 for Heavy Weapon).
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Weapons */}
            <Card className="mt-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>Weapons ({formData.effects.addWeapons.length})</span>
                <Button variant="primary" size="sm" onClick={handleAddWeapon}>
                  Add Weapon
                </Button>
              </Card.Header>
              {formData.effects.addWeapons.length > 0 && (
                <ListGroup variant="flush">
                  {formData.effects.addWeapons.map((weapon, i) => (
                    <ListGroup.Item key={weapon.id}>
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="fw-bold">{weapon.name}</div>
                          <div className="small text-muted">
                            {WeaponRanges.getDisplayName(weapon.range)} |{' '}
                            {weapon.dice[AttackDice.RED]}R {weapon.dice[AttackDice.BLACK]}B {weapon.dice[AttackDice.WHITE]}W
                          </div>
                        </div>
                        <div>
                          <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => handleEditWeapon(i)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteWeapon(i)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card>

            <div className="d-flex justify-content-between mt-4">
              <Button variant="secondary" onClick={() => navigate('/upgrades')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : upgradeId ? 'Update Upgrade' : 'Create Upgrade'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Modal */}
      <WeaponEditorModal
        show={showWeaponModal}
        onClose={() => setShowWeaponModal(false)}
        onSave={handleSaveWeapon}
        weapon={currentWeapon}
        setWeapon={setCurrentWeapon}
      />
    </>
  );
};

export default UpgradeCardForm;