// src/components/units/WeaponSelector.jsx
import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Badge, Modal, ListGroup, Accordion, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { useGameSystem } from '../../contexts/GameSystemContext';
import GameSystems from '../../enums/GameSystems';
import WeaponRanges from '../../enums/WeaponRanges';
import AttackDice from '../../enums/AttackDice';
import WeaponKeywords from '../../enums/WeaponKeywords';
import AoSWeaponAbilities from '../../enums/aos/AoSWeaponAbilities';

const WeaponSelector = ({ weapons = [], onChange }) => {
  const { currentSystem, config } = useGameSystem();
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Get default weapon structure based on game system
  const getDefaultWeapon = () => {
    if (currentSystem === GameSystems.LEGION) {
      return {
        id: uuidv4(),
        name: '',
        range: WeaponRanges.MELEE,
        dice: {
          [AttackDice.RED]: 0,
          [AttackDice.BLACK]: 0,
          [AttackDice.WHITE]: 0
        },
        keywords: []
      };
    }

    // AOS weapon structure
    if (currentSystem === GameSystems.AOS) {
      return {
        id: uuidv4(),
        name: '',
        range: 1,
        attacks: 1,
        attacksType: 'fixed', // 'fixed' or 'dice'
        toHit: 4,
        toWound: 4,
        rend: 0,
        damage: 1,
        damageType: 'fixed', // 'fixed' or 'dice'
        keywords: []
      };
    }
  };

  const [currentWeapon, setCurrentWeapon] = useState(getDefaultWeapon());

  const handleAddWeapon = () => {
    setEditingIndex(null);
    setCurrentWeapon(getDefaultWeapon());
    setShowModal(true);
  };

  const handleEditWeapon = (index) => {
    setEditingIndex(index);
    const weapon = { ...weapons[index] };
    
    // Add backwards compatibility for existing weapons without attacksType/damageType
    if (currentSystem === GameSystems.AOS) {
      if (!weapon.attacksType) {
        weapon.attacksType = 'fixed';
      }
      if (!weapon.damageType) {
        weapon.damageType = 'fixed';
      }
    }
    
    setCurrentWeapon(weapon);
    setShowModal(true);
  };

  const handleDeleteWeapon = (index) => {
    const newWeapons = [...weapons];
    newWeapons.splice(index, 1);
    onChange(newWeapons);
  };

  const handleSaveWeapon = () => {
    if (!currentWeapon.name.trim()) {
      alert('Weapon name is required');
      return;
    }

    // Legion validation
    if (currentSystem === GameSystems.LEGION) {
      const totalDice = 
        currentWeapon.dice[AttackDice.RED] +
        currentWeapon.dice[AttackDice.BLACK] +
        currentWeapon.dice[AttackDice.WHITE];
      
      if (totalDice <= 0) {
        alert('Weapon must have at least one attack die');
        return;
      }
    }

    const newWeapons = [...weapons];
    if (editingIndex !== null) {
      newWeapons[editingIndex] = currentWeapon;
    } else {
      newWeapons.push(currentWeapon);
    }

    onChange(newWeapons);
    setShowModal(false);
  };

  const handleWeaponChange = (e) => {
    const {name, value} = e.target;

    // Handle attacks/damage type changes
    if (name === 'attacksType' || name === 'damageType') {
      setCurrentWeapon((prev) => ({
        ...prev,
        [name]: value,
        // Reset the corresponding value when switching types
        [name.replace('Type', '')]: value === 'dice' ? 'D3' : 1
      }));
      return;
    }

    // Parse numeric fields for AoS weapons (but only if they're in 'fixed' mode)
    if (currentSystem === GameSystems.AOS) {
      if (name === 'attacks' && currentWeapon.attacksType === 'fixed') {
        setCurrentWeapon((prev) => ({
          ...prev,
          [name]: value === '' ? 0 : parseInt(value, 10)
        }));
        return;
      }
      if (name === 'damage' && currentWeapon.damageType === 'fixed') {
        setCurrentWeapon((prev) => ({
          ...prev,
          [name]: value === '' ? 0 : parseInt(value, 10)
        }));
        return;
      }
      if (['range', 'toHit', 'toWound', 'rend'].includes(name)) {
        setCurrentWeapon((prev) => ({
          ...prev,
          [name]: value === '' ? 0 : parseInt(value, 10)
        }));
        return;
      }
    }

    setCurrentWeapon((prev) => ({...prev, [name]: value}));
  };

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

  const handleKeywordToggle = (keyword) => {
    setCurrentWeapon((prev) => {
      const keywords = prev.keywords.includes(keyword)
        ? prev.keywords.filter(k => k !== keyword)
        : [...prev.keywords, keyword];
      return { ...prev, keywords };
    });
  };

  // Render weapon display based on game system
  const renderWeaponDisplay = (weapon) => {
    if (currentSystem === GameSystems.LEGION) {
      return (
        <>
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
            {weapon.keywords?.map((keyword, kidx) => (
              <Badge key={kidx} bg="info" className="me-1 mb-1">
                {WeaponKeywords.getDisplayName(keyword)}
              </Badge>
            ))}
          </div>
        </>
      );
    }

    if (currentSystem === GameSystems.AOS) {
      // Handle both new format (with type) and legacy format (without type)
      const attacksDisplay = weapon.attacksType === 'dice' 
        ? weapon.attacks 
        : (typeof weapon.attacks === 'string' && weapon.attacks.includes('D') 
            ? weapon.attacks 
            : `${weapon.attacks}A`);
      
      const damageDisplay = weapon.damageType === 'dice' 
        ? weapon.damage 
        : (typeof weapon.damage === 'string' && weapon.damage.includes('D') 
            ? weapon.damage 
            : weapon.damage);
      
      return (
        <>
          <div className="fw-bold">{weapon.name}</div>
          <div>
            <small className="text-muted">
              {weapon.range}" | {attacksDisplay} | {weapon.toHit}+/{weapon.toWound}+ | 
              Rend: {weapon.rend === 0 ? '-' : weapon.rend} | Dmg: {damageDisplay}
            </small>
          </div>
          <div className="mt-1">
            {weapon.keywords?.map((keyword, kidx) => (
              <Badge key={kidx} bg="info" className="me-1 mb-1">
                {AoSWeaponAbilities.getDisplayName(keyword)}
              </Badge>
            ))}
          </div>
        </>
      );
    }
  };

  // Render weapon form based on game system
  const renderWeaponForm = () => {
    if (currentSystem === GameSystems.LEGION) {
      return (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Range</Form.Label>
            <Form.Select name="range" value={currentWeapon.range} onChange={handleWeaponChange}>
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
                  {currentWeapon.keywords?.length === 0 ? (
                    <span className="text-muted ms-2">None</span>
                  ) : (
                    <div className="mt-1">
                      {currentWeapon.keywords?.map((keyword, index) => (
                        <Badge 
                          key={index}
                          bg="info"
                          className="me-1 mb-1 p-2"
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleKeywordToggle(keyword);
                          }}
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
                              active={currentWeapon.keywords?.includes(keyword)}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleKeywordToggle(keyword);
                              }}
                              className="py-2"
                              as="div"
                              style={{ cursor: 'pointer' }}
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
        </>
      );
    }

    if (currentSystem === GameSystems.AOS) {
      return (
        <>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Range</Form.Label>
                <Form.Control
                  type="number"
                  name="range"
                  min="1"
                  value={currentWeapon.range}
                  onChange={handleWeaponChange}
                />
                <Form.Text>In inches (1" for melee)</Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Attacks</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select 
                    name="attacksType" 
                    value={currentWeapon.attacksType || 'fixed'} 
                    onChange={handleWeaponChange}
                    style={{ maxWidth: '90px' }}
                  >
                    <option value="fixed">Fixed</option>
                    <option value="dice">Dice</option>
                  </Form.Select>
                  {currentWeapon.attacksType === 'dice' ? (
                    <Form.Select
                      name="attacks"
                      value={currentWeapon.attacks}
                      onChange={handleWeaponChange}
                    >
                      <option value="D3">D3</option>
                      <option value="D6">D6</option>
                      <option value="2D3">2D3</option>
                      <option value="2D6">2D6</option>
                      <option value="3D6">3D6</option>
                    </Form.Select>
                  ) : (
                    <Form.Control
                      type="number"
                      name="attacks"
                      min="1"
                      value={currentWeapon.attacks}
                      onChange={handleWeaponChange}
                    />
                  )}
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>To Hit</Form.Label>
                <Form.Select name="toHit" value={currentWeapon.toHit} onChange={handleWeaponChange}>
                  {[2, 3, 4, 5, 6].map(val => (
                    <option key={val} value={val}>{val}+</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>To Wound</Form.Label>
                <Form.Select name="toWound" value={currentWeapon.toWound} onChange={handleWeaponChange}>
                  {[2, 3, 4, 5, 6].map(val => (
                    <option key={val} value={val}>{val}+</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Rend</Form.Label>
                <Form.Select name="rend" value={currentWeapon.rend} onChange={handleWeaponChange}>
                  {[0, -1, -2, -3, -4, -5].map(val => (
                    <option key={val} value={val}>{val === 0 ? '-' : val}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Damage</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select 
                    name="damageType" 
                    value={currentWeapon.damageType || 'fixed'} 
                    onChange={handleWeaponChange}
                    style={{ maxWidth: '90px' }}
                  >
                    <option value="fixed">Fixed</option>
                    <option value="dice">Dice</option>
                  </Form.Select>
                  {(currentWeapon.damageType === 'dice') ? (
                    <Form.Select
                      name="damage"
                      value={currentWeapon.damage}
                      onChange={handleWeaponChange}
                    >
                      <option value="D3">D3</option>
                      <option value="D6">D6</option>
                      <option value="2D3">2D3</option>
                      <option value="2D6">2D6</option>
                      <option value="3D6">3D6</option>
                    </Form.Select>
                  ) : (
                    <Form.Control
                      type="number"
                      name="damage"
                      min="1"
                      value={currentWeapon.damage}
                      onChange={handleWeaponChange}
                    />
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Weapon Abilities</Form.Label>
            <Card>
              <Card.Body className="p-2">
                <div className="mb-2">
                  <strong>Selected Abilities:</strong>
                  {currentWeapon.keywords?.length === 0 ? (
                    <span className="text-muted ms-2">None</span>
                  ) : (
                    <div className="mt-1">
                      {currentWeapon.keywords?.map((keyword, index) => (
                        <Badge 
                          key={index}
                          bg="info"
                          className="me-1 mb-1 p-2"
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleKeywordToggle(keyword);
                          }}
                        >
                          {AoSWeaponAbilities.getDisplayName(keyword)} &times;
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <Accordion>
                  {Object.entries(AoSWeaponAbilities.getAllAbilities()).map(([category, abilities]) => (
                    <Accordion.Item key={category} eventKey={category}>
                      <Accordion.Header>
                        {category.charAt(0).toUpperCase() + category.slice(1)} Abilities
                      </Accordion.Header>
                      <Accordion.Body className="p-0">
                        <ListGroup variant="flush">
                          {abilities.map(ability => {
                            const description = AoSWeaponAbilities.getDescription(ability);
                            const displayName = AoSWeaponAbilities.getDisplayName(ability);
                            
                            return (
                              <OverlayTrigger
                                key={ability}
                                placement="right"
                                overlay={
                                  <Tooltip id={`tooltip-${ability}`}>
                                    {description}
                                  </Tooltip>
                                }
                              >
                                <ListGroup.Item 
                                  action
                                  active={currentWeapon.keywords?.includes(ability)}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleKeywordToggle(ability);
                                  }}
                                  className="py-2"
                                  as="div"
                                  style={{ cursor: 'pointer' }}
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span>{displayName}</span>
                                    <i className="bi bi-info-circle text-muted"></i>
                                  </div>
                                </ListGroup.Item>
                              </OverlayTrigger>
                            );
                          })}
                        </ListGroup>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card.Body>
            </Card>
          </Form.Group>
        </>
      );
    }
  };

  return (
    <div className="weapon-selector">
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Weapons</h5>
          <Button variant="primary" onClick={handleAddWeapon}>Add Weapon</Button>
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
                  {renderWeaponDisplay(weapon)}
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

            {renderWeaponForm()}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveWeapon}>Save Weapon</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WeaponSelector;