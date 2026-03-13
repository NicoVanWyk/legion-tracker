// src/components/units/KeywordSelector.jsx
import React, {useState, useEffect} from 'react';
import {Form, Badge, Alert, Button, ListGroup} from 'react-bootstrap';
import {collection, getDocs, query, where} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import Keywords from '../../enums/Keywords';
import AoSKeywords from '../../enums/aos/AoSKeywords';
import {useGameSystem} from '../../contexts/GameSystemContext';
import GameSystems from '../../enums/GameSystems';

const KeywordSelector = ({selectedKeywords = [], onChange}) => {
    const [customKeywords, setCustomKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const {currentUser} = useAuth();
    const {currentSystem} = useGameSystem();

    const isAoS = currentSystem === GameSystems.AOS;
    const isLegion = currentSystem === GameSystems.LEGION;
    const KeywordEnum = isAoS ? AoSKeywords : Keywords;

    useEffect(() => {
        const fetchCustomKeywords = async () => {
            if (!currentUser) return;

            try {
                const keywordsRef = collection(db, 'users', currentUser.uid, 'customKeywords');
                const q = query(keywordsRef, where('gameSystem', '==', currentSystem));
                const snapshot = await getDocs(q);

                const keywordsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setCustomKeywords(keywordsList);
            } catch (err) {
                console.error('Error fetching custom keywords:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomKeywords();
    }, [currentUser, currentSystem]);

    const toggleKeyword = (keyword) => {
        if (selectedKeywords.includes(keyword)) {
            onChange(selectedKeywords.filter(k => k !== keyword));
        } else {
            onChange([...selectedKeywords, keyword]);
        }
    };

    const toggleCustomKeyword = (keywordId) => {
        const customKeywordValue = `custom:${keywordId}`;
        toggleKeyword(customKeywordValue);
    };

    const systemKeywords = Object.values(KeywordEnum).filter(k => typeof k === 'string');

    return (
        <div className="keyword-selector">
            <div className="mb-3">
                <h5>Selected Keywords</h5>
                <div>
                    {selectedKeywords.length === 0 ? (
                        <p className="text-muted">No keywords selected</p>
                    ) : (
                        selectedKeywords.map((keyword, index) => {
                            const isCustom = keyword.startsWith('custom:');
                            let displayName = keyword;

                            if (isCustom) {
                                const customId = keyword.replace('custom:', '');
                                const custom = customKeywords.find(k => k.id === customId);
                                displayName = custom ? custom.name : customId;
                            } else {
                                displayName = KeywordEnum.getDisplayName(keyword);
                            }

                            return (
                                <Badge
                                    key={index}
                                    bg={isCustom ? 'info' : 'secondary'}
                                    className="me-2 mb-2 p-2"
                                    style={{cursor: 'pointer'}}
                                    onClick={() => toggleKeyword(keyword)}
                                >
                                    {displayName} ×
                                </Badge>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="mb-4">
                <h5>{isAoS ? 'Age of Sigmar' : 'Star Wars: Legion'} Keywords</h5>
                <div className="d-flex flex-wrap gap-2">
                    {systemKeywords.map(keyword => (
                        <Form.Check
                            key={keyword}
                            type="checkbox"
                            id={`keyword-${keyword}`}
                            label={KeywordEnum.getDisplayName(keyword)}
                            checked={selectedKeywords.includes(keyword)}
                            onChange={() => toggleKeyword(keyword)}
                        />
                    ))}
                </div>
            </div>

            {customKeywords.length > 0 && (
                <div>
                    <h5>Custom Keywords</h5>
                    <ListGroup>
                        {customKeywords.map(custom => {
                            const customValue = `custom:${custom.id}`;
                            const isSelected = selectedKeywords.includes(customValue);

                            return (
                                <ListGroup.Item
                                    key={custom.id}
                                    action
                                    active={isSelected}
                                    onClick={() => toggleCustomKeyword(custom.id)}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{custom.name}</strong>
                                            <div className="small text-muted">{custom.description}</div>
                                        </div>
                                        <Badge bg={isSelected ? 'danger' : 'primary'}>
                                            {isSelected ? 'Remove' : 'Add'}
                                        </Badge>
                                    </div>
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                </div>
            )}

            {customKeywords.length === 0 && !loading && (
                <Alert variant="info">
                    <p className="mb-2">No custom keywords created yet.</p>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => window.open('/keywords/create', '_blank')}
                    >
                        Create Custom Keyword
                    </Button>
                </Alert>
            )}
        </div>
    );
};

export default KeywordSelector;