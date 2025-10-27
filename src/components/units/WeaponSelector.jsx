// src/components/units/WeaponSelector.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Badge, Modal, ListGroup } from 'react-bootstrap';
import WeaponRanges from '../../enums/WeaponRanges';
import AttackDice from '../../enums/AttackDice';
import WeaponKeywords from '../../enums/WeaponKeywords';
import { Accordion } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

const WeaponSelector = ({ weapons = [], onChange }) => {
  // State for the current editing weapon
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentWeapon, setCurrentWeapon] = useState({
    id: '',
    name: '',
    range: WeaponRanges.MELEE,
    dice: {
      [AttackDice.RED]: 0,
      [AttackDice.BLACK]: 0,
      [AttackDice.WHITE]: 0
    },
    keywords: []
  });

  // Open the modal for a new weapon
  const handleAddWeapon = () => {
    setEditingIndex(null);
    setCurrentWeapon({
      id: uuidv4(),
      name: '',
      range: WeaponRanges.MELEE,
      dice: {
        [AttackDice.RED]: 0,
        [AttackDice.BLACK]: 0,
        [AttackDice.WHITE]: 0
      },
      keywords: []
    });
    setShowModal(true);
  };

  // Open the modal for editing an existing weapon
  const handleEditWeapon = (index) => {
    setEditingIndex(index);
    setCurrentWeapon({ ...weapons[index] });
    setShowModal(true);
  };

  // Delete a weapon
  const handleDeleteWeapon = (index) => {
    const newWeapons = [...weapons];
    newWeapons.splice(index, 1);
    onChange(newWeapons);
  };

  useEffect(() => {
  if (editingIndex !== null) {
      const updatedWeapons = [...weapons];
      updatedWeapons[editingIndex] = currentWeapon;
      onChange(updatedWeapons);
    }
  }, [currentWeapon]);

  // Save the current weapon
  const handleSaveWeapon = () => {
    // Validate the weapon
    if (!currentWeapon.name.trim()) {
      alert('Weapon name is required');
      return;
    }

    // Check if we have at least one die
    const totalDice = 
      currentWeapon.dice[AttackDice.RED] +
      currentWeapon.dice[AttackDice.BLACK] +
      currentWeapon.dice[AttackDice.WHITE];
      
    if (totalDice <= 0) {
      alert('Weapon must have at least one attack die');
      return;
    }

    // Update the weapons array
    const newWeapons = [...weapons];
    if (editingIndex !== null) {
      // Update existing weapon
      newWeapons[editingIndex] = currentWeapon;
    } else {
      // Add new weapon
      newWeapons.push(currentWeapon);
    }

    onChange(newWeapons);
    setShowModal(false);
  };

  // Handle input changes for the current weapon
  const handleWeaponChange = (e) => {
    const { name, value } = e.target;
    setCurrentWeapon((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes to attack dice
  const handleDiceChange = (diceType, value) => {
    const numValue = parseInt(value, 10) || 0;
    setCurrentWeapon((prev) => ({
      ...prev,
      dice: {
        ...prev.dice,
        [diceType]: numValue
      }
    }));
  };

  // Handle toggling a keyword
  const handleKeywordToggle = (keyword) => {
    setCurrentWeapon((prev) => {
      const keywords = prev.keywords.includes(keyword)
        ? prev.keywords.filter(k => k !== keyword)
        : [...prev.keywords, keyword];
        
      return { ...prev, keywords };
    });
  };

  return (
    <div className="weapon-selector">
      {/* Weapons List */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Weapons</h5>
          <Button variant="primary" onClick={handleAddWeapon}>
            Add Weapon
          </Button>
        </div>

        {weapons.length === 0 ? (
          <Card>
            <Card.Body className="text-center">
              <p className="text-muted mb-0">No weapons added yet</p>
            </Card.Body>
          </Card>
        ) : (
          <ListGroup>
            {weapons.map((weapon, index) => (
              <ListGroup.Item key={weapon.id || index} className="d-flex justify-content-between align-items-start">
                <div className="ms-2 me-auto">
                  <div className="fw-bold">{weapon.name}</div>
                  <div>
                    <small className="text-muted">
                      {WeaponRanges.getDisplayName(weapon.range)} | 
                      {weapon.dice[AttackDice.RED] > 0 && (
                        <span className="attack-red mx-1">{weapon.dice[AttackDice.RED]}R</span>
                      )}
                      {weapon.dice[AttackDice.BLACK] > 0 && (
                        <span className="attack-black mx-1">{weapon.dice[AttackDice.BLACK]}B</span>
                      )}
                      {weapon.dice[AttackDice.WHITE] > 0 && (
                        <span className="attack-white mx-1">{weapon.dice[AttackDice.WHITE]}W</span>
                      )}
                    </small>
                  </div>
                  <div className="mt-1">
                    {weapon.keywords.map((keyword, kidx) => (
                      <Badge key={kidx} bg="info" className="me-1 mb-1">
                        {WeaponKeywords.getDisplayName(keyword)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleEditWeapon(index)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDeleteWeapon(index)}
                  >
                    Delete
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>

      {/* Weapon Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingIndex !== null ? 'Edit Weapon' : 'Add Weapon'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Weapon Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentWeapon.name}
                onChange={handleWeaponChange}
                placeholder="Enter weapon name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Range</Form.Label>
              <Form.Select
                name="range"
                value={currentWeapon.range}
                onChange={handleWeaponChange}
              >
                {Object.keys(WeaponRanges)
                  .filter(key => typeof WeaponRanges[key] === 'string')
                  .map(key => (
                    <option key={key} value={WeaponRanges[key]}>
                      {WeaponRanges.getDisplayName(WeaponRanges[key])}
                    </option>
                  ))
                }
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Attack Dice</Form.Label>
              <Row>
                <Col md={4}>
                  <Form.Label className="text-danger">Red Dice</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="5"
                    value={currentWeapon.dice[AttackDice.RED]}
                    onChange={(e) => handleDiceChange(AttackDice.RED, e.target.value)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="text-dark">Black Dice</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="5"
                    value={currentWeapon.dice[AttackDice.BLACK]}
                    onChange={(e) => handleDiceChange(AttackDice.BLACK, e.target.value)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="text-secondary">White Dice</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="5"
                    value={currentWeapon.dice[AttackDice.WHITE]}
                    onChange={(e) => handleDiceChange(AttackDice.WHITE, e.target.value)}
                  />
                </Col>
              </Row>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Keywords</Form.Label>
              <Card>
                <Card.Body className="p-2">
                  <div className="mb-2">
                    <strong>Selected Keywords:</strong>
                    {currentWeapon.keywords.length === 0 ? (
                      <span className="text-muted ms-2">None</span>
                    ) : (
                      <div className="mt-1">
                        {currentWeapon.keywords.map((keyword, index) => (
                          <Badge 
                            key={index}
                            bg="info"
                            className="me-1 mb-1 p-2"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleKeywordToggle(keyword)}
                          >
                            {WeaponKeywords.getDisplayName(keyword)} &times;
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Accordion>
                    {Object.entries(WeaponKeywords.getAllKeywords()).map(([category, keywords]) => (
                      <Accordion.Item key={category} eventKey={category}>
                        <Accordion.Header>
                          {category.charAt(0).toUpperCase() + category.slice(1)} Keywords
                        </Accordion.Header>
                        <Accordion.Body className="p-0">
                          <ListGroup variant="flush">
                            {keywords.map(keyword => (
                              <ListGroup.Item 
                                key={keyword} 
                                action
                                active={currentWeapon.keywords.includes(keyword)}
                                onClick={() => handleKeywordToggle(keyword)}
                                className="py-2"
                              >
                                {WeaponKeywords.getDisplayName(keyword)}
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveWeapon}>
            Save Weapon
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WeaponSelector;