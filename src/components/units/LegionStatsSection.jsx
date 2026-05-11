import React from 'react';
import {Row, Col, Form, Badge} from 'react-bootstrap';
import DefenseDice from '../../enums/DefenseDice';
import GameSystems from '../../enums/GameSystems';

const LegionStatsSection = ({formData, handleChange, handleCheckboxChange}) => {
    return (
        <>
            <Row className="mt-3">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Defense Dice</Form.Label>
                        <Form.Select
                            name="defense"
                            value={formData.defense}
                            onChange={handleChange}
                        >
                            {Object.values(DefenseDice).filter(f => typeof f === 'string').map(f => (
                                <option key={f} value={f}>{DefenseDice.getDisplayName(f)}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Wounds</Form.Label>
                        <Form.Control
                            name="wounds"
                            type="number"
                            value={formData.wounds}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>
                            {formData.isVehicle ? 'Resilience' : 'Courage'}
                            <Badge bg="info" className="ms-2">
                                {formData.isVehicle ? 'Vehicle' : 'Trooper'}
                            </Badge>
                        </Form.Label>
                        <Form.Control
                            name={formData.isVehicle ? 'resilience' : 'courage'}
                            type="number"
                            value={formData.isVehicle ? formData.resilience : formData.courage}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>

                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Speed</Form.Label>
                        <Form.Control
                            name="speed"
                            type="number"
                            value={formData.speed}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <Form.Label>
                        Battle Map Footprint (tiles)
                        <small className="text-muted ms-2">1 tile ≈ 27mm = ⅓ of a 76mm move tool</small>
                    </Form.Label>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small">Length (front–back)</Form.Label>
                        <Form.Control type="number" name="battleMapSizeX"
                                      value={formData.battleMapSizeX} onChange={handleChange} min={1} max={18}/>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small">Width (side-to-side)</Form.Label>
                        <Form.Control type="number" name="battleMapSizeY"
                                      value={formData.battleMapSizeY} onChange={handleChange} min={1} max={18}/>
                    </Form.Group>
                </Col>
                <Col md={6} className="d-flex align-items-center">
                    <small className="text-muted">
                        ≈ {Math.round((formData.battleMapSizeX || 1) / 3 * 76)}mm
                        × {Math.round((formData.battleMapSizeY || 1) / 3 * 76)}mm
                        &nbsp;({formData.battleMapSizeX || 1}×{formData.battleMapSizeY || 1} tiles)
                    </small>
                </Col>
            </Row>

            <Row className="mt-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Surge Tokens</Form.Label>
                        <div>
                            <Form.Check
                                type="checkbox"
                                id="surge-attack"
                                label="Surge to Attack"
                                name="surgeAttack"
                                checked={formData.surgeAttack}
                                onChange={handleCheckboxChange}
                                className="mb-2"
                            />
                            <Form.Check
                                type="checkbox"
                                id="surge-defense"
                                label="Surge to Defense"
                                name="surgeDefense"
                                checked={formData.surgeDefense}
                                onChange={handleCheckboxChange}
                            />
                        </div>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Vehicle Type</Form.Label>
                        <Form.Check
                            type="checkbox"
                            id="is-vehicle"
                            label="This unit is a vehicle"
                            name="isVehicle"
                            checked={formData.isVehicle}
                            onChange={handleCheckboxChange}
                            className="mb-2"
                        />
                        <Form.Text className="text-muted">
                            Vehicles use Resilience instead of Courage.
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>
        </>
    );
};

export default LegionStatsSection;