// src/components/aos/RequiredKeywordsSelector.jsx
import React, { useState } from 'react';
import { Badge, Form } from 'react-bootstrap';
import AoSKeywords from '../../enums/aos/AoSKeywords';

const RequiredKeywordsSelector = ({ selected = [], onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const commonRequirements = [
        AoSKeywords.WIZARD1,
        AoSKeywords.PRIEST,
        AoSKeywords.INFANTRY,
        AoSKeywords.CAVALRY,
        AoSKeywords.MONSTER,
        AoSKeywords.FLY,
    ].filter(Boolean);

    const allKeywords = Object.values(AoSKeywords)
        .filter(v => typeof v === 'string')
        .filter(k => !['HERO', 'UNIQUE', 'WARMASTER'].includes(k));

    const handleToggle = (keyword) => {
        onChange(
            selected.includes(keyword)
                ? selected.filter(k => k !== keyword)
                : [...selected, keyword]
        );
    };

    const filteredKeywords = allKeywords.filter(k =>
        k.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="mb-3">
                <strong>Selected ({selected.length}):</strong>
                <div className="mt-2">
                    {selected.length === 0 ? (
                        <span className="text-muted">No requirements</span>
                    ) : (
                        selected.map(keyword => (
                            <Badge
                                key={keyword}
                                bg="primary"
                                className="me-2 mb-2 p-2"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleToggle(keyword)}
                            >
                                {AoSKeywords.getDisplayName(keyword)} ×
                            </Badge>
                        ))
                    )}
                </div>
            </div>

            <Form.Control
                type="text"
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
            />

            <div>
                <strong>Common:</strong>
                <div className="mt-2 mb-3">
                    {commonRequirements
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
                                + {AoSKeywords.getDisplayName(keyword)}
                            </Badge>
                        ))}
                </div>

                <strong>All Keywords:</strong>
                <div className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredKeywords
                        .filter(k => !selected.includes(k))
                        .filter(k => !commonRequirements.includes(k))
                        .map(keyword => (
                            <Badge
                                key={keyword}
                                bg="light"
                                text="dark"
                                className="me-2 mb-2 p-2"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleToggle(keyword)}
                            >
                                + {AoSKeywords.getDisplayName(keyword)}
                            </Badge>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default RequiredKeywordsSelector;