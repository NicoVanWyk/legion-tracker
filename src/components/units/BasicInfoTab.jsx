import React from 'react';
import {Card, Row, Col, Form} from 'react-bootstrap';
import Factions from '../../enums/Factions';
import AoSFactions from '../../enums/aos/AoSFactions';
import UnitTypes from '../../enums/UnitTypes';
import AoSUnitTypes from '../../enums/aos/AoSUnitTypes';
import AoSFactionKeywords from '../../enums/aos/AoSFactionKeywords';
import AoSStatsSection from './AoSStatsSection';
import LegionStatsSection from './LegionStatsSection';
import ModelCountSection from './ModelCountSection';

const BasicInfoTab = ({
                          formData,
                          setFormData,
                          handleChange,
                          handleCheckboxChange,
                          customUnitTypes,
                          calculateTotalPoints,
                          isAoS,
                          isLegion
                      }) => {
    const FactionEnum = isLegion ? Factions : AoSFactions;
    const TypeEnum = isLegion ? UnitTypes : AoSUnitTypes;

    return (
        <Card>
            <Card.Body>
                <Row>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Unit Name</Form.Label>
                            <Form.Control
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter unit name"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Faction</Form.Label>
                            <Form.Select name="faction" value={formData.faction} onChange={handleChange}>
                                {Object.values(FactionEnum).filter(f => typeof f === 'string').map(f => (
                                    <option key={f} value={f}>{FactionEnum.getDisplayName(f)}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Unit Type</Form.Label>
                            <Form.Select name="type" value={formData.type} onChange={handleChange}>
                                {Object.values(TypeEnum).filter(t => typeof t !== 'function' && typeof t === 'string').map(t => (
                                    <option key={t} value={t}>{TypeEnum.getDisplayName(t)}</option>
                                ))}
                                {customUnitTypes.map(t => (
                                    <option key={t.id} value={t.name}>{t.displayName}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Points</Form.Label>
                            <Form.Control
                                name="points"
                                type="number"
                                value={formData.points}
                                onChange={handleChange}
                            />
                            <Form.Text>Total: {calculateTotalPoints()} pts</Form.Text>
                        </Form.Group>
                    </Col>
                </Row>

                {isAoS && (
                    <Row className="mt-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Grand Alliance</Form.Label>
                                <Form.Select
                                    name="grandAlliance"
                                    value={formData.grandAlliance}
                                    onChange={handleChange}
                                >
                                    <option value="">Select...</option>
                                    <option value={AoSFactionKeywords.ORDER}>Order</option>
                                    <option value={AoSFactionKeywords.CHAOS}>Chaos</option>
                                    <option value={AoSFactionKeywords.DEATH}>Death</option>
                                    <option value={AoSFactionKeywords.DESTRUCTION}>Destruction</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Subfaction (Optional)</Form.Label>
                                <div className="border rounded p-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                                    {AoSFactionKeywords.getKeywordsByFaction(
                                        formData.faction === 'stormcast_eternals' ? 'STORMCAST_ETERNALS' :
                                            formData.faction === 'ossiarch_bonereapers' ? 'OSSIARCH_BONEREAPERS' : ''
                                    )
                                        .filter(kw => AoSFactionKeywords.getType(kw) === 'SUB_FACTION')
                                        .map(kw => (
                                            <Form.Check
                                                key={kw}
                                                type="checkbox"
                                                id={`subfaction-${kw}`}
                                                label={AoSFactionKeywords.getDisplayName(kw)}
                                                checked={Array.isArray(formData.subfaction) ? formData.subfaction.includes(kw) : formData.subfaction === kw}
                                                onChange={(e) => {
                                                    const currentSubfactions = Array.isArray(formData.subfaction) ? formData.subfaction : (formData.subfaction ? [formData.subfaction] : []);
                                                    const newSubfactions = e.target.checked
                                                        ? [...currentSubfactions, kw]
                                                        : currentSubfactions.filter(s => s !== kw);
                                                    setFormData(prev => ({...prev, subfaction: newSubfactions}));
                                                }}
                                            />
                                        ))
                                    }
                                    {AoSFactionKeywords.getKeywordsByFaction(
                                        formData.faction === 'stormcast_eternals' ? 'STORMCAST_ETERNALS' :
                                            formData.faction === 'ossiarch_bonereapers' ? 'OSSIARCH_BONEREAPERS' : ''
                                    ).filter(kw => AoSFactionKeywords.getType(kw) === 'SUB_FACTION').length === 0 && (
                                        <div className="text-muted small">No subfactions available for this
                                            faction</div>
                                    )}
                                </div>
                                <Form.Text className="text-muted">
                                    Select one or more subfactions (e.g., The Blacktalons, Mortis Praetorians)
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                )}

                {isLegion && (
                    <LegionStatsSection
                        formData={formData}
                        handleChange={handleChange}
                        handleCheckboxChange={handleCheckboxChange}
                    />
                )}

                {isAoS && (
                    <AoSStatsSection
                        formData={formData}
                        handleChange={handleChange}
                        handleCheckboxChange={handleCheckboxChange}
                    />
                )}

                <ModelCountSection
                    formData={formData}
                    handleChange={handleChange}
                    isAoS={isAoS}
                />
            </Card.Body>
        </Card>
    );
};

export default BasicInfoTab;