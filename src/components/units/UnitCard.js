// src/components/units/UnitCard.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import Factions from '../../enums/Factions';
import UnitTypes from '../../enums/UnitTypes';
import DefenseDice from '../../enums/DefenseDice';
import Keywords from '../../enums/Keywords';
import WeaponRanges from '../../enums/WeaponRanges';
import AttackDice from '../../enums/AttackDice';
import WeaponKeywords from '../../enums/WeaponKeywords';

const UnitCard = ({ unit, customUnitTypes }) => {
  const [flipped, setFlipped] = useState(false);
  const [customKeywords, setCustomKeywords] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [abilities, setAbilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Fetch custom keywords, equipped upgrades, and abilities
    const fetchData = async () => {
      if (!currentUser || !unit) return;
      
      try {
        setLoading(true);
        
        // Fetch custom keywords
        const keywordsRef = collection(db, 'users', currentUser.uid, 'customKeywords');
        const keywordsSnapshot = await getDocs(keywordsRef);
        const keywordsList = keywordsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCustomKeywords(keywordsList);
        
        // Fetch equipped upgrade cards
        const allEquippedUpgrades = [];
        unit.upgradeSlots?.forEach(slot => {
          if (slot.equippedUpgrades) allEquippedUpgrades.push(...slot.equippedUpgrades);
        });
        
        if (allEquippedUpgrades.length > 0) {
          const upgradesData = [];
          for (const upgradeId of allEquippedUpgrades) {
            const upgradeRef = doc(db, 'users', currentUser.uid, 'upgradeCards', upgradeId);
            const upgradeDoc = await getDoc(upgradeRef);
            
            if (upgradeDoc.exists()) {
              upgradesData.push({
                id: upgradeDoc.id,
                ...upgradeDoc.data()
              });
            }
          }
          setUpgrades(upgradesData);
        }
        
        // Fetch abilities
        if (unit.abilities?.length > 0) {
          const abilitiesData = [];
          for (const abilityId of unit.abilities) {
            const abilityRef = doc(db, 'users', currentUser.uid, 'abilities', abilityId);
            const abilityDoc = await getDoc(abilityRef);
            
            if (abilityDoc.exists()) {
              abilitiesData.push({
                id: abilityDoc.id,
                ...abilityDoc.data()
              });
            }
          }
          setAbilities(abilitiesData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser, unit]);

  if (!unit) return null;

  // Function to get all keywords including those from upgrades
  const getAllKeywords = () => {
    if (!unit) return [];
    
    let allKeywords = [...(unit.keywords || [])];
    
    // Add keywords from equipped upgrades
    unit.upgradeSlots?.forEach(slot => {
      slot.equippedUpgrades?.forEach(upgradeId => {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (upgrade?.effects?.addKeywords?.length > 0) {
          allKeywords = [...allKeywords, ...upgrade.effects.addKeywords];
        }
      });
    });
    
    // Remove duplicates
    return [...new Set(allKeywords)];
  };

  // Get all weapons including those from upgrades
  const getAllWeapons = () => {
    if (!unit) return [];
    
    // Start with base unit weapons
    let allWeapons = [...(unit.weapons || [])].map(weapon => ({
      ...weapon,
      source: 'Base Unit'
    }));
    
    // Add weapons from equipped upgrades
    unit.upgradeSlots?.forEach(slot => {
      slot.equippedUpgrades?.forEach(upgradeId => {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (upgrade?.effects?.addWeapons?.length > 0) {
          const upgradeWeapons = upgrade.effects.addWeapons.map(weapon => ({
            ...weapon,
            source: upgrade.name
          }));
          allWeapons = [...allWeapons, ...upgradeWeapons];
        }
      });
    });
    
    return allWeapons;
  };

  // Function to check if keyword is from an upgrade
  const isKeywordFromUpgrade = (keyword) => {
    if (!unit?.keywords) return false;
    return !unit.keywords.includes(keyword);
  };

  // Function to get the proper display name for keywords
  const getKeywordDisplayName = (keyword) => {
    if (keyword.startsWith('custom:')) {
      const customId = keyword.replace('custom:', '');
      const customKeyword = customKeywords.find(k => k.id === customId);
      return customKeyword ? customKeyword.name : customId;
    }
    return Keywords.getDisplayName(keyword);
  };

  const getTypeDisplayName = (type) => {
    if (Object.values(UnitTypes).includes(type)) {
      return UnitTypes.getDisplayName(type);
    }
    const customType = customUnitTypes?.find(t => t.name === type);
    return customType ? customType.displayName : type;
  };

  // Default background based on faction if none selected
  const getDefaultBackground = () => {
    switch (unit.faction) {
      case Factions.REPUBLIC:
        return '/assets/cardbackgrounds/republic-default.png';
      case Factions.SEPARATIST:
        return '/assets/cardbackgrounds/separatist-default.png';
      case Factions.REBEL:
        return '/assets/cardbackgrounds/rebel-default.png';
      case Factions.EMPIRE:
        return '/assets/cardbackgrounds/empire-default.png';
      default:
        return '/assets/cardbackgrounds/neutral-default.png';
    }
  };

  // Get card background
  const cardBackground = unit.cardBackground || getDefaultBackground();
  
  // Get unit icon or default
  const unitIcon = unit.unitIcon || '/assets/uniticons/default-icon.png';
  
  // Get all keywords including those from upgrades
  const allKeywords = getAllKeywords();
  
  // Get all weapons including those from upgrades
  const allWeapons = getAllWeapons();

  return (
    <div className="unit-card-container mb-4">
      <div className="d-flex justify-content-center mb-3">
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={() => setFlipped(!flipped)}
        >
          {flipped ? 'Show Front' : 'Show Back'}
        </Button>
      </div>
      
      <div className="position-relative" style={{ perspective: '1000px' }}>
        <div 
          className="unit-card" 
          style={{
            transition: 'transform 0.8s',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : ''
          }}
        >
          {/* Card Front */}
          <div 
            className="card-face front" 
            style={{
              position: flipped ? 'absolute' : 'relative',
              backfaceVisibility: 'hidden',
              width: '100%',
              height: '100%'
            }}
          >
            <Card 
              className={`unit-card-front faction-${unit.faction}-border`} 
              style={{ overflow: 'hidden' }}
            >
              {/* Card Background Image */}
              <div 
                className="card-background" 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${cardBackground})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.1,
                  zIndex: 0
                }}
              />
              
              <Card.Header className={`faction-${unit.faction} d-flex justify-content-between align-items-center`}>
                <h5 className="mb-0">{unit.name}</h5>
                <div className="d-flex align-items-center">
                  <div className="me-2">{unit.points} pts</div>
                  <div 
                    className="unit-icon-container"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: `2px solid ${Factions.getColor(unit.faction)}`
                    }}
                  >
                    <img 
                      src={unitIcon} 
                      alt={unit.name} 
                      style={{
                        maxWidth: '80%',
                        maxHeight: '80%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>
              </Card.Header>
              
              <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                <Row>
                  <Col>
                    <div className="mb-3">
                      <strong>{getTypeDisplayName(unit.type)}</strong>
                      {unit.isVehicle && <span className="ms-2 badge bg-info">Vehicle</span>}
                    </div>
                    
                    <div className="mb-3">
                      <div><strong>Faction:</strong> {Factions.getDisplayName(unit.faction)}</div>
                      <div>
                        <strong>Stats:</strong> {unit.wounds}W /
                          {unit.isVehicle ?
                              ` ${unit.resilience === 0 ? '-' : unit.resilience}R` :
                              ` ${unit.courage === 0 ? '-' : unit.courage}C`} /
                          {unit.speed}S / 
                        <span className={DefenseDice.getColorClass(unit.defense)}>
                          {unit.defense === 'white' ? 'W' : 'R'}
                        </span> Defense
                      </div>
                      <div><strong>Models:</strong> {unit.currentModelCount}</div>
                    </div>
                    
                    {allKeywords.length > 0 && (
                      <div className="mb-3">
                        <strong>Keywords:</strong>
                        <div className="mt-1">
                          {allKeywords.map((keyword, index) => {
                            const isCustom = keyword.startsWith('custom:');
                            const isFromUpgrade = isKeywordFromUpgrade(keyword);
                            
                            return (
                              <span 
                                key={index} 
                                className={`badge ${isCustom ? 'bg-info' : (isFromUpgrade ? 'bg-success' : 'bg-secondary')} me-1 mb-1`}
                              >
                                {getKeywordDisplayName(keyword)}
                                {isCustom && <span className="ms-1" title="Custom Keyword">★</span>}
                                {isFromUpgrade && <span className="ms-1" title="From Upgrade">+</span>}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Col>
                </Row>
                
                {allWeapons.length > 0 && (
                  <div className="mt-3">
                    <strong>Weapons:</strong>
                    <ul className="list-group list-group-flush mt-1">
                      {allWeapons.map((weapon, index) => (
                        <li key={index} className="list-group-item p-2 bg-transparent">
                          <div className="d-flex justify-content-between">
                            <span className="fw-bold">{weapon.name}</span>
                            {weapon.source !== 'Base Unit' && (
                              <small className="text-success">
                                {weapon.source}
                              </small>
                            )}
                          </div>
                          <div className="small">
                            <span>
                              {WeaponRanges.getDisplayName ? 
                                WeaponRanges.getDisplayName(weapon.range) : 
                                weapon.range
                              }
                            </span>
                            <span className="ms-2">
                              {weapon.dice?.[AttackDice.RED] > 0 && 
                                <span className="text-danger">{weapon.dice[AttackDice.RED]}R </span>
                              }
                              {weapon.dice?.[AttackDice.BLACK] > 0 && 
                                <span>{weapon.dice[AttackDice.BLACK]}B </span>
                              }
                              {weapon.dice?.[AttackDice.WHITE] > 0 && 
                                <span className="text-muted">{weapon.dice[AttackDice.WHITE]}W</span>
                              }
                            </span>
                          </div>
                          {weapon.keywords?.length > 0 && (
                            <div className="small">
                              {weapon.keywords.map((kw, i) => (
                                <span key={i} className="badge bg-light text-dark me-1 mb-1">
                                  {WeaponKeywords.getDisplayName ? 
                                    WeaponKeywords.getDisplayName(kw) : kw
                                  }
                                </span>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
          
          {/* Card Back */}
          <div 
            className="card-face back" 
            style={{
              position: flipped ? 'relative' : 'absolute',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              width: '100%',
              height: '100%'
            }}
          >
            <Card 
              className={`unit-card-back faction-${unit.faction}-border h-100`} 
              style={{ overflow: 'hidden' }}
            >
              {/* Card Background Image */}
              <div 
                className="card-background" 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${cardBackground})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.2,
                  zIndex: 0
                }}
              />
              
              <Card.Header className={`faction-${unit.faction}`}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{unit.name}</h5>
                  <div 
                    className="unit-icon-container"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: `2px solid ${Factions.getColor(unit.faction)}`
                    }}
                  >
                    <img 
                      src={unitIcon} 
                      alt={unit.name} 
                      style={{
                        maxWidth: '80%',
                        maxHeight: '80%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>
              </Card.Header>
              
              <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                {abilities.length > 0 && (
                  <div className="mb-3">
                    <strong>Abilities:</strong>
                    <ul className="list-group list-group-flush mt-1">
                      {abilities.map((ability, index) => (
                        <li key={index} className="list-group-item p-2 bg-transparent">
                          <div className="fw-bold">{ability.name}</div>
                          <div className="small">{ability.description}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {unit.upgradeSlots && unit.upgradeSlots.length > 0 && (
                  <div className="mb-3">
                    <strong>Upgrade Slots:</strong>
                    <div className="mt-1">
                      {unit.upgradeSlots.map((slot, index) => {
                        const equippedUpgrades = upgrades.filter(u => 
                          slot.equippedUpgrades?.includes(u.id)
                        );
                        
                        return (
                          <div key={index} className="mb-2">
                            <span className="badge bg-secondary me-1">
                              {slot.type}
                            </span>
                            <small>
                              ({slot.equippedUpgrades?.length || 0}/{slot.maxCount})
                            </small>
                            
                            {equippedUpgrades.length > 0 && (
                              <div className="ms-3 small">
                                {equippedUpgrades.map((upgrade, i) => (
                                  <div key={i} className="text-muted">
                                    • {upgrade.name} ({upgrade.pointsCost} pts)
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {unit.notes && (
                  <div className="mb-3">
                    <strong>Notes:</strong>
                    <div className="mt-1 small" style={{ whiteSpace: 'pre-line' }}>
                      {unit.notes}
                    </div>
                  </div>
                )}
                
                {unit.miniatures && (
                  <div>
                    <strong>Miniature Information:</strong>
                    <div className="mt-1 small" style={{ whiteSpace: 'pre-line' }}>
                      {unit.miniatures}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitCard;