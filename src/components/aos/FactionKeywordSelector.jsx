import React, { useState, useEffect } from 'react';
import { Form, Badge, Card, Row, Col } from 'react-bootstrap';
import AoSFactionKeywords from '../../enums/aos/AoSFactionKeywords';
import AoSFactions from '../../enums/aos/AoSFactions';

const FactionKeywordSelector = ({ faction, selected = [], onChange }) => {
  const [availableKeywords, setAvailableKeywords] = useState([]);

  useEffect(() => {
    // Get faction-specific keywords
    const factionKeywords = AoSFactionKeywords.getKeywordsByFaction(faction);
    const universal = AoSFactionKeywords.getAllKeywords()
      .filter(k => AoSFactionKeywords.getType(k) === 'UNIVERSAL');
    
    setAvailableKeywords([...factionKeywords, ...universal]);
  }, [faction]);

  const handleToggle = (keyword) => {
    if (selected.includes(keyword)) {
      onChange(selected.filter(k => k !== keyword));
    } else {
      onChange([...selected, keyword]);
    }
  };

  const groupedKeywords = {
    grandAlliance: availableKeywords.filter(k => AoSFactionKeywords.getType(k) === 'GRAND_ALLIANCE'),
    faction: availableKeywords.filter(k => AoSFactionKeywords.getType(k) === 'FACTION'),
    subFaction: availableKeywords.filter(k => AoSFactionKeywords.getType(k) === 'SUB_FACTION'),
    universal: availableKeywords.filter(k => AoSFactionKeywords.getType(k) === 'UNIVERSAL')
  };

  return (
    <div className="faction-keyword-selector">
      <div className="mb-3">
        <strong>Selected Keywords:</strong>
        <div className="mt-2">
          {selected.length === 0 ? (
            <span className="text-muted">No keywords selected</span>
          ) : (
            selected.map(keyword => (
              <Badge
                key={keyword}
                style={{ 
                  backgroundColor: AoSFactionKeywords.getColor(keyword),
                  cursor: 'pointer'
                }}
                className="me-2 mb-2 p-2"
                onClick={() => handleToggle(keyword)}
              >
                {AoSFactionKeywords.getDisplayName(keyword)} ×
              </Badge>
            ))
          )}
        </div>
      </div>

      <Card>
        <Card.Body>
          <Row>
            {groupedKeywords.grandAlliance.length > 0 && (
              <Col md={6} className="mb-3">
                <h6>Grand Alliance</h6>
                {groupedKeywords.grandAlliance.map(keyword => (
                  <Form.Check
                    key={keyword}
                    type="checkbox"
                    id={`kw-${keyword}`}
                    label={AoSFactionKeywords.getDisplayName(keyword)}
                    checked={selected.includes(keyword)}
                    onChange={() => handleToggle(keyword)}
                  />
                ))}
              </Col>
            )}

            {groupedKeywords.faction.length > 0 && (
              <Col md={6} className="mb-3">
                <h6>Faction</h6>
                {groupedKeywords.faction.map(keyword => (
                  <Form.Check
                    key={keyword}
                    type="checkbox"
                    id={`kw-${keyword}`}
                    label={AoSFactionKeywords.getDisplayName(keyword)}
                    checked={selected.includes(keyword)}
                    onChange={() => handleToggle(keyword)}
                  />
                ))}
              </Col>
            )}

            {groupedKeywords.subFaction.length > 0 && (
              <Col md={6} className="mb-3">
                <h6>Sub-Faction</h6>
                {groupedKeywords.subFaction.map(keyword => (
                  <Form.Check
                    key={keyword}
                    type="checkbox"
                    id={`kw-${keyword}`}
                    label={AoSFactionKeywords.getDisplayName(keyword)}
                    checked={selected.includes(keyword)}
                    onChange={() => handleToggle(keyword)}
                  />
                ))}
              </Col>
            )}

            {groupedKeywords.universal.length > 0 && (
              <Col md={6} className="mb-3">
                <h6>Universal Keywords</h6>
                {groupedKeywords.universal.map(keyword => (
                  <Form.Check
                    key={keyword}
                    type="checkbox"
                    id={`kw-${keyword}`}
                    label={AoSFactionKeywords.getDisplayName(keyword)}
                    checked={selected.includes(keyword)}
                    onChange={() => handleToggle(keyword)}
                  />
                ))}
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      <Form.Text className="text-muted mt-2">
        Select keywords that apply to this unit
      </Form.Text>
    </div>
  );
};

export default FactionKeywordSelector;