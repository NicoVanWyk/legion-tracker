import React, {useState, useMemo} from 'react';
import {Card, ListGroup, Badge, Button, Form, Alert, Collapse} from 'react-bootstrap';
import RegimentRecommendationEngine from '../../utils/RegimentRecommendationEngine';
import AoSKeywords from '../../enums/aos/AoSKeywords';

const RegimentRecommender = ({commander, availableUnits, existingUnitIds = [], onAddUnit}) => {
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [maxResults, setMaxResults] = useState(5);
    const [recommendationType, setRecommendationType] = useState('units'); // 'units' or 'subcommanders'

    const recommendations = useMemo(() => {
        if (!commander) return [];

        if (recommendationType === 'subcommanders') {
            const heroes = availableUnits.filter(u => u.keywords?.includes(AoSKeywords.HERO));
            return RegimentRecommendationEngine.recommendSubCommanders(commander, heroes);
        }

        return RegimentRecommendationEngine.recommendUnits(
            commander,
            availableUnits,
            existingUnitIds,
            maxResults
        );
    }, [commander, availableUnits, existingUnitIds, maxResults, recommendationType]);

    if (!commander) {
        return (
            <Alert variant="info">
                Select a commander to see unit recommendations
            </Alert>
        );
    }

    const canRecommendSubCommanders = commander.battleProfile?.allowsSubCommanders;

    return (
        <Card>
            <Card.Header
                className="d-flex justify-content-between align-items-center"
                style={{cursor: 'pointer'}}
                onClick={() => setShowRecommendations(!showRecommendations)}
            >
                <h6 className="mb-0">
                    <i className="bi bi-lightbulb me-2"></i>
                    Recommended Units for {commander.name}
                </h6>
                <i className={`bi bi-chevron-${showRecommendations ? 'up' : 'down'}`}></i>
            </Card.Header>

            <Collapse in={showRecommendations}>
                <Card.Body>
                    <div className="mb-3">
                        <Form.Group className="mb-2">
                            <Form.Label className="small">Recommendation Type</Form.Label>
                            <div>
                                <Form.Check
                                    inline
                                    type="radio"
                                    label="Regular Units"
                                    checked={recommendationType === 'units'}
                                    onChange={() => setRecommendationType('units')}
                                />
                                {canRecommendSubCommanders && (
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="Sub-Commanders"
                                        checked={recommendationType === 'subcommanders'}
                                        onChange={() => setRecommendationType('subcommanders')}
                                    />
                                )}
                            </div>
                        </Form.Group>

                        {recommendationType === 'units' && (
                            <Form.Group>
                                <Form.Label className="small">Max Results</Form.Label>
                                <Form.Range
                                    min={3}
                                    max={15}
                                    value={maxResults}
                                    onChange={(e) => setMaxResults(parseInt(e.target.value))}
                                />
                                <Form.Text>{maxResults} units</Form.Text>
                            </Form.Group>
                        )}
                    </div>

                    {recommendations.length === 0 ? (
                        <Alert variant="warning">
                            No compatible {recommendationType === 'units' ? 'units' : 'sub-commanders'} found
                        </Alert>
                    ) : (
                        <ListGroup>
                            {recommendations.map(({unit, score, reasons}) => (
                                <ListGroup.Item key={unit.id}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center">
                                                <strong>{unit.name}</strong>
                                                <Badge bg="success" className="ms-2">
                                                    {score} pts
                                                </Badge>
                                                <span className="ms-2 small text-muted">
                                                    {unit.points} pts
                                                </span>
                                            </div>
                                            <div className="mt-1">
                                                {reasons.map((reason, idx) => (
                                                    <Badge key={idx} bg="secondary" className="me-1"
                                                           style={{fontSize: '0.7rem'}}>
                                                        {reason}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="mt-1 small text-muted">
                                                Move {unit.move}" | {unit.type}
                                            </div>
                                        </div>
                                        {onAddUnit && (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => onAddUnit(unit.id)}
                                            >
                                                Add
                                            </Button>
                                        )}
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Card.Body>
            </Collapse>
        </Card>
    );
};

export default RegimentRecommender;