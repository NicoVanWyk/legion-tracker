import React from 'react';
import {Badge} from 'react-bootstrap';
import ArmyContentKeywords from '../../enums/aos/ArmyContentKeywords';

const ArmyContentKeywordSelector = ({selected = [], onChange}) => {
    const allKeywords = ArmyContentKeywords.getAllKeywords();

    const handleToggle = (keyword) => {
        if (selected.includes(keyword)) {
            onChange(selected.filter(k => k !== keyword));
        } else {
            onChange([...selected, keyword]);
        }
    };

    return (
        <div>
            <div className="mb-3">
                <strong>Selected Keywords:</strong>
                <div className="mt-2">
                    {selected.length === 0 ? (
                        <span className="text-muted">No keywords selected</span>
                    ) : (
                        selected.map(keyword => (
                            <Badge
                                key={keyword}
                                bg="primary"
                                className="me-2 mb-2 p-2"
                                style={{cursor: 'pointer'}}
                                onClick={() => handleToggle(keyword)}
                            >
                                {ArmyContentKeywords.getDisplayName(keyword)} ×
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
                                style={{cursor: 'pointer'}}
                                onClick={() => handleToggle(keyword)}
                            >
                                + {ArmyContentKeywords.getDisplayName(keyword)}
                            </Badge>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default ArmyContentKeywordSelector;