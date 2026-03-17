// src/components/units/RegimentRulesTab.jsx
import React, { useState } from 'react';
import { Card, Form, Badge, Alert } from 'react-bootstrap';
import AoSFactionKeywords from '../../enums/aos/AoSFactionKeywords';
import AoSKeywords from '../../enums/aos/AoSKeywords';

const RegimentRulesTab = ({ battleProfile, onChange, faction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const profile = battleProfile || {
    allowedKeywords: [],
    canSubCommander: false
  };
  
  // Get all available keywords
  const factionKeywords = AoSFactionKeywords.getAllKeywords();
  const unitKeywords = Object.values(AoSKeywords)
    .filter(v => typeof v === 'string')
    .filter(k => !['HERO', 'UNIQUE', 'WARMASTER'].includes(k)); // Exclude role keywords
  
  const allKeywords = [...new Set([...factionKeywords, ...unitKeywords])];
  
  const handleToggleKeyword = (keyword) => {
    const current = profile.allowedKeywords || [];
    const updated = current.includes(keyword)
      ? current.filter(k => k !== keyword)
      : [...current, keyword];
    
    onChange({
      ...profile,
      allowedKeywords: updated
    });
  };
  
  const handleSubCommanderToggle = (checked) => {
    onChange({
      ...profile,
      canSubCommander: checked
    });
  };
  
  const getSuggestions = () => {
    // Suggest main faction keyword by default
    const suggestions = [];
    if (faction) {
      const factionKey = faction.toUpperCase();
      if (allKeywords.includes(factionKey)) {
        suggestions.push(factionKey);
      }
    }
    return suggestions;
  };
  
  const suggestions = getSuggestions();
  const filteredKeywords = allKeywords.filter(k => 
    k.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Card>
      <Card.Body>
        <Alert variant="info">
          <strong>What are regiment rules?</strong>
          <p className="mb-0 mt-2">
            Define which units this hero can lead in their regiment. Units must have at least one of the selected keywords to join this hero's regiment.
            Leave empty to allow any unit from your faction.
          </p>
        </Alert>
        
        <h5>Allowed Unit Keywords</h5>
        <p className="text-muted">Select keywords that units must have to join this hero's regiment</p>
        
        {suggestions.length > 0 && profile.allowedKeywords.length === 0 && (
          <Alert variant="secondary">
            <strong>Suggested:</strong> Most heroes allow units with the{' '}
            <Badge bg="primary">{suggestions[0]}</Badge> keyword.
            Click to add.
            {suggestions.map(s => (
              <Badge 
                key={s}
                bg="light" 
                text="dark"
                className="ms-2"
                style={{ cursor: 'pointer' }}
                onClick={() => handleToggleKeyword(s)}
              >
                + {AoSFactionKeywords.getDisplayName(s)}
              </Badge>
            ))}
          </Alert>
        )}
        
        <div className="mb-3">
          <strong>Selected Keywords ({profile.allowedKeywords.length}):</strong>
          <div className="mt-2">
            {profile.allowedKeywords.length === 0 ? (
              <span className="text-muted">No keywords selected (allows any faction unit)</span>
            ) : (
              profile.allowedKeywords.map(keyword => (
                <Badge
                  key={keyword}
                  bg="primary"
                  className="me-2 mb-2 p-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleToggleKeyword(keyword)}
                >
                  {AoSFactionKeywords.getDisplayName(keyword) || keyword} ×
                </Badge>
              ))
            )}
          </div>
        </div>
        
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>
        
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filteredKeywords
            .filter(k => !profile.allowedKeywords.includes(k))
            .map(keyword => (
              <Badge
                key={keyword}
                bg="light"
                text="dark"
                className="me-2 mb-2 p-2"
                style={{ cursor: 'pointer' }}
                onClick={() => handleToggleKeyword(keyword)}
              >
                + {AoSFactionKeywords.getDisplayName(keyword) || keyword}
              </Badge>
            ))}
        </div>
        
        <hr />
        
        <h5>Sub-Commander Rules</h5>
        <Form.Check
          type="checkbox"
          id="canSubCommander"
          label="This hero can join another hero's regiment as a sub-commander"
          checked={profile.canSubCommander}
          onChange={(e) => handleSubCommanderToggle(e.target.checked)}
        />
        <Form.Text className="text-muted">
          Most heroes cannot do this. Only select if this hero's warscroll specifically allows it (rare in 4E).
        </Form.Text>
      </Card.Body>
    </Card>
  );
};

export default RegimentRulesTab;