// src/components/units/KeywordSelector.js
import React, { useState } from 'react';
import { Form, Button, Badge, Accordion, ListGroup } from 'react-bootstrap';
import Keywords from '../../enums/Keywords';

const KeywordSelector = ({ selectedKeywords = [], onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const keywordsByCategory = Keywords.getAllKeywords();

  const handleKeywordToggle = (keyword) => {
    if (selectedKeywords.includes(keyword)) {
      // Remove keyword if already selected
      onChange(selectedKeywords.filter(k => k !== keyword));
    } else {
      // Add keyword if not selected
      onChange([...selectedKeywords, keyword]);
    }
  };

  const filteredKeywords = searchTerm.trim() === '' 
    ? keywordsByCategory // Show all keywords if no search term
    : Object.keys(keywordsByCategory).reduce((filtered, category) => {
        const matchingKeywords = keywordsByCategory[category].filter(keyword => 
          Keywords.getDisplayName(keyword).toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (matchingKeywords.length > 0) {
          filtered[category] = matchingKeywords;
        }
        return filtered;
      }, {});

  return (
    <div>
      {/* Selected Keywords Display */}
      <div className="mb-3">
        <h5>Selected Keywords</h5>
        <div>
          {selectedKeywords.length === 0 ? (
            <p className="text-muted">No keywords selected</p>
          ) : (
            selectedKeywords.map(keyword => (
              <Badge 
                key={keyword} 
                bg="primary" 
                className="me-2 mb-2 p-2"
                style={{ cursor: 'pointer' }}
                onClick={() => handleKeywordToggle(keyword)}
              >
                {Keywords.getDisplayName(keyword)} &times;
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Search Bar */}
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      {/* Keywords by Category */}
      <Accordion className="mb-3">
        {Object.entries(filteredKeywords).map(([category, keywords]) => (
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
                    active={selectedKeywords.includes(keyword)}
                    onClick={() => handleKeywordToggle(keyword)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>{Keywords.getDisplayName(keyword)}</strong>
                      <Button 
                        variant={selectedKeywords.includes(keyword) ? "danger" : "primary"}
                        size="sm"
                      >
                        {selectedKeywords.includes(keyword) ? "Remove" : "Add"}
                      </Button>
                    </div>
                    <small className="text-muted d-block mt-1">
                      {Keywords.getDescription(keyword)}
                    </small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};

export default KeywordSelector;