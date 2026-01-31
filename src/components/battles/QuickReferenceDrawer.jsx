// src/components/battles/QuickReferenceDrawer.jsx - Updated Version
import React, { useState } from 'react';
import { Offcanvas, Tab, Tabs, Card, Form, ListGroup, Badge, Accordion, Button } from 'react-bootstrap';
import Keywords from '../../enums/Keywords';
import WeaponKeywords from '../../enums/WeaponKeywords';
import BattlePhases from '../../enums/BattlePhases';
import CommandCards from '../../enums/CommandCards';

const QuickReferenceDrawer = ({ show, onHide, battle, reminders = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('weapon-keywords');

    // Search filter function
    const filterItems = (items, searchField = 'name') => {
        if (!searchTerm) return items;
        return items.filter(item => 
            item[searchField]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (typeof item === 'string' && item.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    // Get all unit keywords with descriptions
    const getAllUnitKeywords = () => {
        return Keywords.getAllKeywordsFlat().map(keyword => ({
            name: Keywords.getDisplayName(keyword),
            description: Keywords.getDescription(keyword),
            category: 'Unit Keywords',
            id: keyword,
            searchText: `${Keywords.getDisplayName(keyword)} ${Keywords.getDescription(keyword)}`
        }));
    };

    // Get all weapon keywords with descriptions
    const getAllWeaponKeywords = () => {
        return WeaponKeywords.getAllKeywordsFlat().map(keyword => ({
            name: WeaponKeywords.getDisplayName(keyword),
            description: WeaponKeywords.getDescription(keyword),
            category: 'Weapon Keywords',
            id: keyword,
            searchText: `${WeaponKeywords.getDisplayName(keyword)} ${WeaponKeywords.getDescription(keyword)}`
        }));
    };

    // Get battle phases info
    const getBattlePhases = () => {
        return [
            BattlePhases.COMMAND,
            BattlePhases.ACTIVATION,
            BattlePhases.END
        ].map(phase => ({
            name: BattlePhases.getDisplayName(phase),
            description: BattlePhases.getDescription(phase),
            category: 'Battle Phases',
            id: phase,
            searchText: `${BattlePhases.getDisplayName(phase)} ${BattlePhases.getDescription(phase)}`
        }));
    };

    // Get current command cards
    const getCurrentCommandCards = () => {
        const cards = [];
        
        if (battle.blueCommandCard) {
            const cardName = battle.blueCommandCardDetails?.name || 
                CommandCards.getDisplayName(battle.blueCommandCard);
            const description = battle.blueCommandCardDetails?.description || 
                CommandCards.getDescription(battle.blueCommandCard);
            
            cards.push({
                name: `${battle.bluePlayer}: ${cardName}`,
                description: description,
                player: 'Blue',
                pips: battle.blueCommandCardDetails?.pips || 
                    CommandCards.getPips(battle.blueCommandCard),
                searchText: `${cardName} ${description}`
            });
        }

        if (battle.redCommandCard) {
            const cardName = battle.redCommandCardDetails?.name || 
                CommandCards.getDisplayName(battle.redCommandCard);
            const description = battle.redCommandCardDetails?.description || 
                CommandCards.getDescription(battle.redCommandCard);
            
            cards.push({
                name: `${battle.redPlayer}: ${cardName}`,
                description: description,
                player: 'Red',
                pips: battle.redCommandCardDetails?.pips || 
                    CommandCards.getPips(battle.redCommandCard),
                searchText: `${cardName} ${description}`
            });
        }

        return cards;
    };

    const weaponKeywords = getAllWeaponKeywords();
    const unitKeywords = getAllUnitKeywords();
    const battlePhases = getBattlePhases();
    const commandCards = getCurrentCommandCards();

    // Filter each category separately
    const filteredWeaponKeywords = filterItems(weaponKeywords, 'searchText');
    const filteredUnitKeywords = filterItems(unitKeywords, 'searchText');
    const filteredBattlePhases = filterItems(battlePhases, 'searchText');
    const filteredCommandCards = filterItems(commandCards, 'searchText');

    const renderKeywordAccordion = (keywords, accordionId) => {
        if (keywords.length === 0) {
            return (
                <div className="text-center text-muted py-3">
                    No keywords found matching "{searchTerm}"
                </div>
            );
        }

        return (
            <Accordion flush id={accordionId}>
                {keywords.map((item, index) => (
                    <Accordion.Item eventKey={index.toString()} key={item.id}>
                        <Accordion.Header>
                            <div className="d-flex justify-content-between w-100 me-3">
                                <strong>{item.name}</strong>
                                <Badge 
                                    bg={item.category === 'Weapon Keywords' ? 'danger' : 'secondary'} 
                                    className="small"
                                >
                                    {item.category}
                                </Badge>
                            </div>
                        </Accordion.Header>
                        <Accordion.Body>
                            <p className="mb-0">{item.description}</p>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>
        );
    };

    return (
        <Offcanvas 
            show={show} 
            onHide={onHide} 
            placement="bottom"
            style={{ height: '85vh' }}
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Quick Reference</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {/* Search Bar */}
                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Search keywords, rules, abilities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    {searchTerm && (
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="mt-2"
                            onClick={() => setSearchTerm('')}
                        >
                            Clear Search
                        </Button>
                    )}
                </Form.Group>

                <Tabs 
                    activeKey={activeTab} 
                    onSelect={setActiveTab}
                    className="mb-3"
                >
                    {/* Weapon Keywords Tab - Now First! */}
                    <Tab eventKey="weapon-keywords" title={`Weapon Keywords (${filteredWeaponKeywords.length})`}>
                        <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                            {renderKeywordAccordion(filteredWeaponKeywords, 'weapon-keywords-accordion')}
                        </div>
                    </Tab>

                    {/* Unit Keywords Tab */}
                    <Tab eventKey="unit-keywords" title={`Unit Keywords (${filteredUnitKeywords.length})`}>
                        <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                            {renderKeywordAccordion(filteredUnitKeywords, 'unit-keywords-accordion')}
                        </div>
                    </Tab>

                    {/* Command Cards Tab */}
                    <Tab eventKey="commands" title={`Command Cards (${commandCards.length})`}>
                        <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                            {commandCards.length === 0 ? (
                                <div className="text-center text-muted py-3">
                                    No command cards played this round
                                </div>
                            ) : filteredCommandCards.length === 0 ? (
                                <div className="text-center text-muted py-3">
                                    No command cards found matching "{searchTerm}"
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredCommandCards.map((card, index) => (
                                        <Card key={index} className="mb-2">
                                            <Card.Body className="p-3">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 className="mb-0">{card.name}</h6>
                                                    <Badge 
                                                        bg={card.player === 'Blue' ? 'primary' : 'danger'}
                                                    >
                                                        {card.pips} pip{card.pips !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                                <p className="mb-0 text-muted small">
                                                    {card.description}
                                                </p>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Tab>

                    {/* Battle Phases Tab */}
                    <Tab eventKey="phases" title={`Battle Phases (${filteredBattlePhases.length})`}>
                        <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                            {renderKeywordAccordion(filteredBattlePhases, 'phases-accordion')}
                        </div>
                    </Tab>

                    {/* Reminders Tab */}
                    <Tab eventKey="reminders" title={`Reminders (${reminders.length})`}>
                        <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                            {reminders.length === 0 ? (
                                <div className="text-center text-muted py-3">
                                    No active reminders for this phase
                                </div>
                            ) : (
                                <ListGroup variant="flush">
                                    {reminders
                                        .filter(reminder => !searchTerm || 
                                            reminder.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            reminder.source.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((reminder, index) => (
                                            <ListGroup.Item key={index} className="border-0 px-0">
                                                <div className="mb-2">
                                                    <Badge 
                                                        bg="info" 
                                                        className="me-2"
                                                    >
                                                        {reminder.source}
                                                    </Badge>
                                                    {reminder.condition && (
                                                        <Badge bg="secondary" className="small">
                                                            {reminder.condition}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mb-0">{reminder.text}</p>
                                            </ListGroup.Item>
                                        ))}
                                </ListGroup>
                            )}
                        </div>
                    </Tab>

                    {/* Combat Reference Tab */}
                    <Tab eventKey="combat" title="Combat">
                        <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                            <Card className="mb-3">
                                <Card.Header>
                                    <h6 className="mb-0">Attack Sequence</h6>
                                </Card.Header>
                                <Card.Body>
                                    <ol className="mb-0 small">
                                        <li>Declare Defender</li>
                                        <li>Form Attack Pool</li>
                                        <li>Roll Attack Dice</li>
                                        <li>Apply Dodge and Cover</li>
                                        <li>Modify Attack Dice</li>
                                        <li>Count Hits and Crits</li>
                                        <li>Roll Defense Dice</li>
                                        <li>Modify Defense Dice</li>
                                        <li>Compare Results</li>
                                        <li>Convert and Assign Wounds</li>
                                    </ol>
                                </Card.Body>
                            </Card>

                            <Card className="mb-3">
                                <Card.Header>
                                    <h6 className="mb-0">Cover Values</h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="row small">
                                        <div className="col-6">
                                            <strong>Light Cover:</strong> +1 block
                                        </div>
                                        <div className="col-6">
                                            <strong>Heavy Cover:</strong> +2 blocks
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>

                            <Card className="mb-3">
                                <Card.Header>
                                    <h6 className="mb-0">Suppression</h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="small">
                                        <div className="mb-1"><strong>1-2:</strong> No effect</div>
                                        <div className="mb-1"><strong>3+:</strong> Suppressed (limited actions)</div>
                                        <div><strong>6+:</strong> Panicked (no actions)</div>
                                    </div>
                                </Card.Body>
                            </Card>

                            <Card>
                                <Card.Header>
                                    <h6 className="mb-0">Common Weapon Keywords</h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="small">
                                        <div className="mb-1"><strong>Pierce X:</strong> Ignore up to X block results</div>
                                        <div className="mb-1"><strong>Impact X:</strong> Convert X hits to crits vs armor</div>
                                        <div className="mb-1"><strong>Blast:</strong> Ignore cover when attacking</div>
                                        <div className="mb-1"><strong>Suppressive:</strong> Defender gains 1 suppression</div>
                                        <div><strong>Critical X:</strong> Convert X hits to crits</div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Tab>
                </Tabs>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default QuickReferenceDrawer;