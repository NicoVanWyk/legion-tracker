import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Alert, Row, Col, Badge, ListGroup, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, addDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useGameSystem } from '../../contexts/GameSystemContext';
import AoSFactions from '../../enums/aos/AoSFactions';
import AoSContentTypes from '../../enums/aos/AoSContentTypes';
import GameSystems from '../../enums/GameSystems';
import AoSFactionKeywords from '../../enums/aos/AoSFactionKeywords';

const ArmyContentForm = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { currentSystem } = useGameSystem();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contentType: AoSContentTypes.BATTLE_TRAIT,
    faction: '',
    description: '',
    effectText: '',
    restrictions: [],
    pointsCost: 0,
    // Spell/Prayer specific
    spells: [],
    prayers: [],
    // Manifestation specific
    manifestationType: 'ENDLESS_SPELL',
    summoningCost: 0,
    manifestationMove: 0,
    manifestationSave: 0,
    manifestationHealth: 0,
    // Battle Formation specific
    formationRequirements: '',
    // Command specific
    commandValue: 1
  });

  const [newSpell, setNewSpell] = useState({ name: '', castingValue: 6, range: '', effect: '' });
  const [newPrayer, setNewPrayer] = useState({ name: '', prayerValue: 3, range: '', effect: '' });

  const fetchContent = useCallback(async () => {
    if (!contentId || !currentUser || currentSystem !== GameSystems.AOS) return;

    try {
      setLoading(true);
      const contentRef = doc(db, 'users', currentUser.uid, 'armyContent', contentId);
      const contentDoc = await getDoc(contentRef);

      if (contentDoc.exists()) {
        const data = contentDoc.data();
        setFormData({
          name: data.name || '',
          contentType: data.contentType || AoSContentTypes.BATTLE_TRAIT,
          faction: data.faction || '',
          description: data.description || '',
          effectText: data.effectText || '',
          restrictions: data.restrictions || [],
          pointsCost: data.pointsCost || 0,
          spells: data.spells || [],
          prayers: data.prayers || [],
          manifestationType: data.manifestationType || 'ENDLESS_SPELL',
          summoningCost: data.summoningCost || 0,
          manifestationMove: data.manifestationMove || 0,
          manifestationSave: data.manifestationSave || 0,
          manifestationHealth: data.manifestationHealth || 0,
          formationRequirements: data.formationRequirements || '',
          commandValue: data.commandValue || 1
        });
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [contentId, currentUser, currentSystem]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  if (currentSystem !== GameSystems.AOS) {
    return (
      <Alert variant="info">
        <h4>Army Content is only available for Age of Sigmar</h4>
        <Button onClick={() => navigate('/')} variant="secondary">Back</Button>
      </Alert>
    );
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleRestrictionToggle = (restriction) => {
    setFormData(prev => ({
      ...prev,
      restrictions: prev.restrictions.includes(restriction)
        ? prev.restrictions.filter(r => r !== restriction)
        : [...prev.restrictions, restriction]
    }));
  };

  const addSpell = () => {
    if (!newSpell.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      spells: [...prev.spells, { ...newSpell }]
    }));
    setNewSpell({ name: '', castingValue: 6, range: '', effect: '' });
  };

  const removeSpell = (index) => {
    setFormData(prev => ({
      ...prev,
      spells: prev.spells.filter((_, i) => i !== index)
    }));
  };

  const addPrayer = () => {
    if (!newPrayer.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      prayers: [...prev.prayers, { ...newPrayer }]
    }));
    setNewPrayer({ name: '', prayerValue: 3, range: '', effect: '' });
  };

  const removePrayer = (index) => {
    setFormData(prev => ({
      ...prev,
      prayers: prev.prayers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError('You must be logged in');
      return;
    }

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const contentData = {
        name: formData.name.trim(),
        contentType: formData.contentType,
        faction: formData.faction,
        description: formData.description.trim(),
        effectText: formData.effectText.trim(),
        restrictions: formData.restrictions,
        pointsCost: formData.pointsCost,
        gameSystem: GameSystems.AOS,
        lastUpdated: serverTimestamp(),
        userId: currentUser.uid
      };

      // Add type-specific fields
      if (formData.contentType === AoSContentTypes.SPELL_LORE) {
        contentData.spells = formData.spells;
      } else if (formData.contentType === AoSContentTypes.PRAYER_LORE) {
        contentData.prayers = formData.prayers;
      } else if (formData.contentType === AoSContentTypes.MANIFESTATION) {
        contentData.manifestationType = formData.manifestationType;
        contentData.summoningCost = formData.summoningCost;
        contentData.manifestationMove = formData.manifestationMove;
        contentData.manifestationSave = formData.manifestationSave;
        contentData.manifestationHealth = formData.manifestationHealth;
      } else if (formData.contentType === AoSContentTypes.BATTLE_FORMATION) {
        contentData.formationRequirements = formData.formationRequirements;
      } else if (formData.contentType === AoSContentTypes.COMMAND) {
        contentData.commandValue = formData.commandValue;
      }

      if (contentId) {
        await updateDoc(
          doc(db, 'users', currentUser.uid, 'armyContent', contentId),
          contentData
        );
        setSuccess('Content updated successfully!');
      } else {
        contentData.createdAt = serverTimestamp();
        await addDoc(
          collection(db, 'users', currentUser.uid, 'armyContent'),
          contentData
        );
        setSuccess('Content created successfully!');
        
        // Reset form
        setFormData({
          name: '',
          contentType: AoSContentTypes.BATTLE_TRAIT,
          faction: '',
          description: '',
          effectText: '',
          restrictions: [],
          pointsCost: 0,
          spells: [],
          prayers: [],
          manifestationType: 'ENDLESS_SPELL',
          summoningCost: 0,
          manifestationMove: 0,
          manifestationSave: 0,
          manifestationHealth: 0,
          formationRequirements: '',
          commandValue: 1
        });
      }

      setTimeout(() => {
        navigate('/army-content');
      }, 1500);
    } catch (err) {
      console.error('Error saving content:', err);
      setError('Failed to save: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (formData.contentType) {
      case AoSContentTypes.SPELL_LORE:
        return (
          <Card className="mb-3">
            <Card.Header>Spells</Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Control
                    placeholder="Spell name"
                    value={newSpell.name}
                    onChange={(e) => setNewSpell(prev => ({ ...prev, name: e.target.value }))}
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="Cast"
                    value={newSpell.castingValue}
                    onChange={(e) => setNewSpell(prev => ({ ...prev, castingValue: parseInt(e.target.value) }))}
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    placeholder="Range"
                    value={newSpell.range}
                    onChange={(e) => setNewSpell(prev => ({ ...prev, range: e.target.value }))}
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    placeholder="Effect"
                    value={newSpell.effect}
                    onChange={(e) => setNewSpell(prev => ({ ...prev, effect: e.target.value }))}
                  />
                </Col>
                <Col md={1}>
                  <Button onClick={addSpell}>Add</Button>
                </Col>
              </Row>
              {formData.spells.length > 0 && (
                <ListGroup>
                  {formData.spells.map((spell, i) => (
                    <ListGroup.Item key={i} className="d-flex justify-content-between">
                      <div>
                        <strong>{spell.name}</strong> - Cast {spell.castingValue}, {spell.range}
                        <div className="small text-muted">{spell.effect}</div>
                      </div>
                      <Button variant="outline-danger" size="sm" onClick={() => removeSpell(i)}>×</Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        );

      case AoSContentTypes.PRAYER_LORE:
        return (
          <Card className="mb-3">
            <Card.Header>Prayers</Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Control
                    placeholder="Prayer name"
                    value={newPrayer.name}
                    onChange={(e) => setNewPrayer(prev => ({ ...prev, name: e.target.value }))}
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="Prayer"
                    value={newPrayer.prayerValue}
                    onChange={(e) => setNewPrayer(prev => ({ ...prev, prayerValue: parseInt(e.target.value) }))}
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    placeholder="Range"
                    value={newPrayer.range}
                    onChange={(e) => setNewPrayer(prev => ({ ...prev, range: e.target.value }))}
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    placeholder="Effect"
                    value={newPrayer.effect}
                    onChange={(e) => setNewPrayer(prev => ({ ...prev, effect: e.target.value }))}
                  />
                </Col>
                <Col md={1}>
                  <Button onClick={addPrayer}>Add</Button>
                </Col>
              </Row>
              {formData.prayers.length > 0 && (
                <ListGroup>
                  {formData.prayers.map((prayer, i) => (
                    <ListGroup.Item key={i} className="d-flex justify-content-between">
                      <div>
                        <strong>{prayer.name}</strong> - Prayer {prayer.prayerValue}, {prayer.range}
                        <div className="small text-muted">{prayer.effect}</div>
                      </div>
                      <Button variant="outline-danger" size="sm" onClick={() => removePrayer(i)}>×</Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        );

      case AoSContentTypes.MANIFESTATION:
        return (
          <>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select name="manifestationType" value={formData.manifestationType} onChange={handleChange}>
                    <option value="ENDLESS_SPELL">Endless Spell</option>
                    <option value="INVOCATION">Invocation</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Summoning Cost</Form.Label>
                  <Form.Control type="number" name="summoningCost" value={formData.summoningCost} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Move</Form.Label>
                  <Form.Control type="number" name="manifestationMove" value={formData.manifestationMove} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Save</Form.Label>
                  <Form.Control type="number" name="manifestationSave" value={formData.manifestationSave} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Health</Form.Label>
                  <Form.Control type="number" name="manifestationHealth" value={formData.manifestationHealth} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>
          </>
        );

      case AoSContentTypes.BATTLE_FORMATION:
        return (
          <Form.Group className="mb-3">
            <Form.Label>Formation Requirements</Form.Label>
            <Form.Control
              as="textarea"
              name="formationRequirements"
              value={formData.formationRequirements}
              onChange={handleChange}
              placeholder="e.g., 1 HERO, 3 BATTLELINE units, 1000+ points"
              rows={2}
            />
          </Form.Group>
        );

      case AoSContentTypes.COMMAND:
        return (
          <Form.Group className="mb-3">
            <Form.Label>Command Value (1-4)</Form.Label>
            <Form.Control
              type="number"
              name="commandValue"
              value={formData.commandValue}
              onChange={handleChange}
              min="1"
              max="4"
            />
            <Form.Text>Command point cost</Form.Text>
          </Form.Group>
        );

      case AoSContentTypes.ARTEFACT:
        return (
          <Form.Group className="mb-3">
            <Form.Label>Points Cost</Form.Label>
            <Form.Control
              type="number"
              name="pointsCost"
              value={formData.pointsCost}
              onChange={handleChange}
            />
          </Form.Group>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <Card.Header>
        <h3 className="mb-0">{contentId ? 'Edit' : 'Create'} Army Content</h3>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name*</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Content Type*</Form.Label>
                <Form.Select name="contentType" value={formData.contentType} onChange={handleChange}>
                  {AoSContentTypes.getAllTypes().map(type => (
                    <option key={type} value={type}>
                      {AoSContentTypes.getDisplayName(type)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Faction</Form.Label>
                <Form.Select name="faction" value={formData.faction} onChange={handleChange}>
                  <option value="">Universal</option>
                  {Object.values(AoSFactions).filter(f => typeof f === 'string').map(faction => (
                    <option key={faction} value={faction}>
                      {AoSFactions.getDisplayName(faction)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Effect Text</Form.Label>
            <Form.Control
              as="textarea"
              name="effectText"
              value={formData.effectText}
              onChange={handleChange}
              rows={4}
            />
          </Form.Group>

          {renderTypeSpecificFields()}

          <Form.Group className="mb-3">
            <Form.Label>Restrictions</Form.Label>
            <div>
              {[AoSFactionKeywords.HERO, AoSFactionKeywords.WIZARD, AoSFactionKeywords.PRIEST].map(kw => (
                <Form.Check
                  key={kw}
                  inline
                  type="checkbox"
                  id={`restriction-${kw}`}
                  label={AoSFactionKeywords.getDisplayName(kw)}
                  checked={formData.restrictions.includes(kw)}
                  onChange={() => handleRestrictionToggle(kw)}
                />
              ))}
            </div>
          </Form.Group>

          <div className="d-flex justify-content-between">
            <Button variant="secondary" onClick={() => navigate('/army-content')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : (contentId ? 'Update' : 'Create')}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ArmyContentForm;