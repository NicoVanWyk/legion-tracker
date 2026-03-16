import React from 'react';
import { Form, Badge } from 'react-bootstrap';
import AoSAbilityKeywords from '../../enums/aos/AoSAbilityKeywords';

const AbilityKeywordSelector = ({ selected = [], onChange }) => {
  const allKeywords = AoSAbilityKeywords.getAllKeywords();

  const handleToggle = (keyword) => {
    if (selected.includes(keyword)) {
      onChange(selected.filter(k => k !== keyword));
    } else {
      onChange([...selected, keyword]);
    }
  };

  return (
    <div className="ability-keyword-selector">
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
                  backgroundColor: AoSAbilityKeywords.getColor(keyword),
                  cursor: 'pointer'
                }}
                className="me-2 mb-2 p-2"
                onClick={() => handleToggle(keyword)}
              >
                {AoSAbilityKeywords.getDisplayName(keyword)} ×
              </Badge>
            ))
          )}
        </div>
      </div>

      <div>
        <strong>Available Keywords:</strong>
        <div className="mt-2">
          {allKeywords
            .filter(k => !selected.includes(k))
            .map(keyword => (
              <Badge
                key={keyword}
                bg="light"
                text="dark"
                className="me-2 mb-2 p-2"
                style={{ cursor: 'pointer' }}
                onClick={() => handleToggle(keyword)}
              >
                + {AoSAbilityKeywords.getDisplayName(keyword)}
              </Badge>
            ))}
        </div>
      </div>

      <Form.Text className="text-muted">
        Click keywords to add/remove them
      </Form.Text>
    </div>
  );
};

export default AbilityKeywordSelector;