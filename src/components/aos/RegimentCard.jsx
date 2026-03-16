import React, { useState } from 'react';
import { Card, Badge, ListGroup, Button, Collapse } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AoSFactionKeywords from '../../enums/aos/AoSFactionKeywords';

const RegimentCard = ({ regiment, units, content = [], onEdit, onDelete, showActions = true }) => {
  const [expanded, setExpanded] = useState(false);

  const getUnit = (unitId) => units.find(u => u.id === unitId);
  const getContent = (contentId) => content.find(c => c.id === contentId);

  const commander = getUnit(regiment.commander);
  const subCommanders = (regiment.subCommanders || []).map(getUnit).filter(Boolean);
  const troops = (regiment.troops || []).map(getUnit).filter(Boolean);
  const regimentAbility = getContent(regiment.regimentAbility);

  const getTroopSlots = () => {
    return troops.reduce((total, unit) => {
      return total + (unit?.isReinforced ? 2 : 1);
    }, 0);
  };

  const getHeroEquipment = (unitId) => {
    return regiment.heroEquipment?.[unitId] || {};
  };

  return (
    <Card className="regiment-card mb-3">
      <Card.Header 
        className="d-flex justify-content-between align-items-center"
        style={{ cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="d-flex align-items-center flex-grow-1">
          <i className={`bi bi-people-fill me-2`}></i>
          <h5 className="mb-0">{regiment.name || 'Unnamed Regiment'}</h5>
          <Badge bg="secondary" className="ms-3">
            {getTroopSlots()}/5 Troops
          </Badge>
          {regimentAbility && (
            <Badge bg="info" className="ms-2">
              {regimentAbility.name}
            </Badge>
          )}
        </div>
        <div className="d-flex align-items-center">
          {showActions && (
            <>
              <Button
                variant="outline-primary"
                size="sm"
                className="me-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(regiment);
                }}
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                className="me-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(regiment.id);
                }}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </>
          )}
          <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`}></i>
        </div>
      </Card.Header>

      <Collapse in={expanded}>
        <Card.Body>
          {/* Commander */}
          <div className="mb-3">
            <h6 className="text-muted mb-2">
              <i className="bi bi-star-fill me-2"></i>
              Commander
            </h6>
            {commander ? (
              <ListGroup>
                <ListGroup.Item>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{commander.name}</strong>
                      <div className="small text-muted mt-1">
                        {commander.factionKeywords?.map(kw => (
                          <Badge 
                            key={kw} 
                            bg="secondary" 
                            className="me-1"
                            style={{ 
                              backgroundColor: AoSFactionKeywords.getColor(kw),
                              fontSize: '0.7rem'
                            }}
                          >
                            {AoSFactionKeywords.getDisplayName(kw)}
                          </Badge>
                        ))}
                      </div>
                      {getHeroEquipment(commander.id).heroicTrait && (
                        <div className="mt-2">
                          <Badge bg="warning" text="dark">
                            <i className="bi bi-star me-1"></i>
                            {getContent(getHeroEquipment(commander.id).heroicTrait)?.name}
                          </Badge>
                        </div>
                      )}
                      {getHeroEquipment(commander.id).artefact && (
                        <div className="mt-1">
                          <Badge bg="primary">
                            <i className="bi bi-gem me-1"></i>
                            {getContent(getHeroEquipment(commander.id).artefact)?.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <Button
                      as={Link}
                      to={`/units/${commander.id}`}
                      variant="link"
                      size="sm"
                    >
                      View
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            ) : (
              <div className="text-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                No commander assigned
              </div>
            )}
          </div>

          {/* Sub-commanders */}
          {subCommanders.length > 0 && (
            <div className="mb-3">
              <h6 className="text-muted mb-2">
                <i className="bi bi-stars me-2"></i>
                Sub-commanders ({subCommanders.length}/2)
              </h6>
              <ListGroup>
                {subCommanders.map(unit => (
                  <ListGroup.Item key={unit.id}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{unit.name}</strong>
                        <div className="small text-muted mt-1">
                          {unit.factionKeywords?.map(kw => (
                            <Badge 
                              key={kw} 
                              bg="secondary" 
                              className="me-1"
                              style={{ 
                                backgroundColor: AoSFactionKeywords.getColor(kw),
                                fontSize: '0.7rem'
                              }}
                            >
                              {AoSFactionKeywords.getDisplayName(kw)}
                            </Badge>
                          ))}
                        </div>
                        {getHeroEquipment(unit.id).heroicTrait && (
                          <div className="mt-2">
                            <Badge bg="warning" text="dark">
                              <i className="bi bi-star me-1"></i>
                              {getContent(getHeroEquipment(unit.id).heroicTrait)?.name}
                            </Badge>
                          </div>
                        )}
                        {getHeroEquipment(unit.id).artefact && (
                          <div className="mt-1">
                            <Badge bg="primary">
                              <i className="bi bi-gem me-1"></i>
                              {getContent(getHeroEquipment(unit.id).artefact)?.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <Button
                        as={Link}
                        to={`/units/${unit.id}`}
                        variant="link"
                        size="sm"
                      >
                        View
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          {/* Troops */}
          <div className="mb-3">
            <h6 className="text-muted mb-2">
              <i className="bi bi-people me-2"></i>
              Troops ({getTroopSlots()}/5 slots)
            </h6>
            {troops.length > 0 ? (
              <ListGroup>
                {troops.map(unit => (
                  <ListGroup.Item key={unit.id}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{unit.name}</strong>
                        {unit.isReinforced && (
                          <Badge bg="success" className="ms-2">Reinforced (2 slots)</Badge>
                        )}
                        <div className="small text-muted mt-1">
                          {unit.factionKeywords?.map(kw => (
                            <Badge 
                              key={kw} 
                              bg="secondary" 
                              className="me-1"
                              style={{ 
                                backgroundColor: AoSFactionKeywords.getColor(kw),
                                fontSize: '0.7rem'
                              }}
                            >
                              {AoSFactionKeywords.getDisplayName(kw)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        as={Link}
                        to={`/units/${unit.id}`}
                        variant="link"
                        size="sm"
                      >
                        View
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="text-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                No troops assigned (minimum 2 required)
              </div>
            )}
          </div>

          {/* Regiment Ability */}
          {regimentAbility && (
            <div>
              <h6 className="text-muted mb-2">
                <i className="bi bi-lightning-charge-fill me-2"></i>
                Regiment Ability
              </h6>
              <Card bg="light">
                <Card.Body>
                  <h6>{regimentAbility.name}</h6>
                  <p className="mb-0 small">{regimentAbility.effectText}</p>
                </Card.Body>
              </Card>
            </div>
          )}
        </Card.Body>
      </Collapse>
    </Card>
  );
};

export default RegimentCard;