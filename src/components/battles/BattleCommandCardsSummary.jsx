// src/components/battles/BattleCommandCardsSummary.js
import React from 'react';
import { Card, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import PlayerSides from '../../enums/PlayerSides';
import CommandCards from '../../enums/CommandCards';

/**
 * Component to display the command card usage summary for a completed battle
 */
const BattleCommandCardsSummary = ({ battle, commandCardsHistory = [] }) => {
    if (!battle) return null;

    // Helper to get card name
    const getCardName = (cardId, cardDetails) => {
        if (!cardId) return 'None';

        // For system cards
        if (CommandCards.getAllSystemCards().includes(cardId)) {
            return CommandCards.getDisplayName(cardId);
        }

        // For custom cards
        return cardDetails?.name || 'Custom Card';
    };

    // Helper to get pips string
    const getPipsString = (cardId, cardDetails) => {
        if (!cardId) return '';

        // Get pip count from system cards or card details
        const pips = CommandCards.getAllSystemCards().includes(cardId)
            ? CommandCards.getPips(cardId)
            : cardDetails?.pips || 0;

        return pips > 0 ? "●".repeat(pips) : '';
    };

    // Render a single round's command cards
    const renderRoundCards = (round) => {
        const blueCard = round.blueCommandCard;
        const redCard = round.redCommandCard;
        const blueDetails = round.blueCommandCardDetails;
        const redDetails = round.redCommandCardDetails;

        // Skip if no cards were played this round
        if (!blueCard && !redCard) return null;

        return (
            <Row className="mb-2">
                <Col xs={2} className="d-flex align-items-center justify-content-center">
                    <Badge bg="secondary" className="p-2">Round {round.roundNumber}</Badge>
                </Col>
                <Col xs={5}>
                    <div className="p-2" style={{ background: '#f0f8ff', borderRadius: '5px' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span>{getCardName(blueCard, blueDetails)}</span>
                            <span className="text-muted">{getPipsString(blueCard, blueDetails)}</span>
                        </div>
                        {blueDetails?.description && (
                            <div className="small text-muted">{blueDetails.description}</div>
                        )}
                    </div>
                </Col>
                <Col xs={5}>
                    <div className="p-2" style={{ background: '#fff0f0', borderRadius: '5px' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span>{getCardName(redCard, redDetails)}</span>
                            <span className="text-muted">{getPipsString(redCard, redDetails)}</span>
                        </div>
                        {redDetails?.description && (
                            <div className="small text-muted">{redDetails.description}</div>
                        )}
                    </div>
                </Col>
            </Row>
        );
    };

    return (
        <Card className="mb-4">
            <Card.Header>
                <h5 className="mb-0">Command Cards History</h5>
            </Card.Header>
            <Card.Body>
                {/* Header Row */}
                <Row className="mb-3">
                    <Col xs={2}>
                        <strong>Round</strong>
                    </Col>
                    <Col xs={5}>
                        <div className="d-flex align-items-center">
                            <span className="text-primary me-2">●</span>
                            <strong>{battle.bluePlayer}</strong>
                        </div>
                    </Col>
                    <Col xs={5}>
                        <div className="d-flex align-items-center">
                            <span className="text-danger me-2">●</span>
                            <strong>{battle.redPlayer}</strong>
                        </div>
                    </Col>
                </Row>

                {/* Current round cards (if any) */}
                {(battle.blueCommandCard || battle.redCommandCard) && !battle.isComplete && (
                    renderRoundCards({
                        roundNumber: battle.currentRound,
                        blueCommandCard: battle.blueCommandCard,
                        redCommandCard: battle.redCommandCard,
                        blueCommandCardDetails: battle.blueCommandCardDetails,
                        redCommandCardDetails: battle.redCommandCardDetails
                    })
                )}

                {/* Historical cards */}
                {commandCardsHistory.map((roundData, index) => renderRoundCards(roundData))}

                {/* Show message if no cards used yet */}
                {(!battle.blueCommandCard && !battle.redCommandCard && commandCardsHistory.length === 0) && (
                    <div className="text-center text-muted">
                        No command cards have been used yet
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default BattleCommandCardsSummary;