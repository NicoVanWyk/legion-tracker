import React, {useState, useEffect} from 'react';
import {Form, Badge, Alert, Button, ListGroup, Modal, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {collection, getDocs, query, where} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import Keywords from '../../enums/Keywords';
import AoSKeywords from '../../enums/aos/AoSKeywords';
import {useGameSystem} from '../../contexts/GameSystemContext';
import GameSystems from '../../enums/GameSystems';
import KeywordBadge from './KeywordBadge';

const KeywordSelector = ({selectedKeywords = [], onChange}) => {
    const [customKeywords, setCustomKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalKeyword, setModalKeyword] = useState(null); // { name, description, isCustom }
    const {currentUser} = useAuth();
    const {currentSystem} = useGameSystem();

    const isAoS = currentSystem === GameSystems.AOS;
    const KeywordEnum = isAoS ? AoSKeywords : Keywords;

    useEffect(() => {
        const fetchCustomKeywords = async () => {
            if (!currentUser) return;
            try {
                const q = query(
                    collection(db, 'users', currentUser.uid, 'customKeywords'),
                    where('gameSystem', '==', currentSystem)
                );
                const snapshot = await getDocs(q);
                setCustomKeywords(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
            } catch (err) {
                console.error('Error fetching custom keywords:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomKeywords();
    }, [currentUser, currentSystem]);

    const toggleKeyword = keyword => {
        onChange(selectedKeywords.includes(keyword)
            ? selectedKeywords.filter(k => k !== keyword)
            : [...selectedKeywords, keyword]);
    };

    const getKeywordInfo = keyword => {
        if (keyword.startsWith('custom:')) {
            const custom = customKeywords.find(k => k.id === keyword.replace('custom:', ''));
            return {name: custom?.name ?? keyword, description: custom?.description ?? ''};
        }
        return {
            name: KeywordEnum.getDisplayName(keyword),
            description: KeywordEnum.getDescription?.(keyword) ?? '',
        };
    };

    const openModal = (keyword, isCustom = false) => {
        const info = isCustom
            ? {name: keyword.name, description: keyword.description ?? ''}
            : getKeywordInfo(keyword);
        setModalKeyword(info);
    };

    const SystemKeywordCheck = ({keyword}) => {
        const description = KeywordEnum.getDescription?.(keyword) ?? '';
        const label = KeywordEnum.getDisplayName(keyword);

        const checkbox = (
            <div className="d-flex align-items-center gap-1">
                <Form.Check
                    type="checkbox"
                    id={`keyword-${keyword}`}
                    label={label}
                    checked={selectedKeywords.includes(keyword)}
                    onChange={() => toggleKeyword(keyword)}
                />
                {description && (
                    <Button
                        variant="link"
                        size="sm"
                        className="p-0 ms-1 text-muted"
                        style={{fontSize: '0.75rem', lineHeight: 1}}
                        onClick={() => openModal(keyword)}
                        tabIndex={-1}
                        title="View definition"
                    >
                        ?
                    </Button>
                )}
            </div>
        );

        if (!description) return checkbox;

        return (
            <OverlayTrigger
                placement="top"
                delay={{show: 300, hide: 100}}
                overlay={
                    <Tooltip id={`tip-sys-${keyword}`}>
                        {description.length > 120 ? description.slice(0, 117) + '…' : description}
                    </Tooltip>
                }
            >
                <div>{checkbox}</div>
            </OverlayTrigger>
        );
    };

    const systemKeywords = Object.values(KeywordEnum).filter(k => typeof k === 'string');

    return (
        <div className="keyword-selector">
            {/* Selected keywords */}
            <div className="mb-3">
                <h5>Selected Keywords</h5>
                {selectedKeywords.length === 0 ? (
                    <p className="text-muted">No keywords selected</p>
                ) : (
                    <div>
                        {selectedKeywords.map((keyword, index) => (
                            <KeywordBadge
                                key={index}
                                keyword={keyword}
                                customKeywords={customKeywords}
                                className="me-2 mb-2 p-2"
                                style={{cursor: 'pointer'}}
                            >
                                {getKeywordInfo(keyword).name} ×{/* keep the remove-on-click by wrapping */}
                            </KeywordBadge>
                        ))}
                    </div>
                )}
            </div>

            {/* System keywords */}
            <div className="mb-4">
                <h5>{isAoS ? 'Age of Sigmar' : 'Star Wars: Legion'} Keywords</h5>
                <div className="d-flex flex-wrap gap-2">
                    {systemKeywords.map(keyword => (
                        <SystemKeywordCheck key={keyword} keyword={keyword}/>
                    ))}
                </div>
            </div>

            {/* Custom keywords */}
            {customKeywords.length > 0 && (
                <div>
                    <h5>Custom Keywords</h5>
                    <ListGroup>
                        {customKeywords.map(custom => {
                            const customValue = `custom:${custom.id}`;
                            const isSelected = selectedKeywords.includes(customValue);
                            return (
                                <ListGroup.Item key={custom.id} action active={isSelected}
                                                onClick={() => toggleKeyword(customValue)}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong
                                                style={{cursor: custom.description ? 'help' : 'default'}}
                                                onClick={e => {
                                                    if (!custom.description) return;
                                                    e.stopPropagation();
                                                    openModal(custom, true);
                                                }}
                                            >
                                                {custom.name}
                                                {custom.description && (
                                                    <small className="ms-1 opacity-75">ⓘ</small>
                                                )}
                                            </strong>
                                            {custom.description && (
                                                <div className="small text-muted">{custom.description}</div>
                                            )}
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
                    <Button variant="outline-primary" size="sm"
                            onClick={() => window.open('/keywords/create', '_blank')}>
                        Create Custom Keyword
                    </Button>
                </Alert>
            )}

            {/* Definition modal */}
            <Modal show={!!modalKeyword} onHide={() => setModalKeyword(null)} centered size="sm">
                <Modal.Header closeButton>
                    <Modal.Title style={{fontSize: '1rem'}}>{modalKeyword?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalKeyword?.description
                        ? <p className="mb-0" style={{whiteSpace: 'pre-line'}}>{modalKeyword.description}</p>
                        : <p className="text-muted mb-0">No definition available.</p>
                    }
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default KeywordSelector;