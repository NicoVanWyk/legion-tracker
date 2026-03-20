import React, {useState, useEffect} from 'react';
import {Form, Button, Alert, Tab, Tabs} from 'react-bootstrap';
import {useNavigate, useParams} from 'react-router-dom';
import {doc, collection, addDoc, updateDoc, getDoc, getDocs, serverTimestamp} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import LoadingSpinner from '../layout/LoadingSpinner';
import {useGameSystem} from '../../contexts/GameSystemContext';
import GameSystems from '../../enums/GameSystems';
import BasicInfoTab from './BasicInfoTab';
import KeywordsTab from './KeywordsTab';
import WeaponsTab from './WeaponsTab';
import AbilitiesTab from './AbilitiesTab';
import UpgradesTab from './UpgradesTab';
import AppearanceTab from './AppearanceTab';
import NotesTab from './NotesTab';
import RegimentRulesTab from './RegimentRulesTab';
import Factions from '../../enums/Factions';
import AoSFactions from '../../enums/aos/AoSFactions';
import UnitTypes from '../../enums/UnitTypes';
import AoSUnitTypes from '../../enums/aos/AoSUnitTypes';
import DefenseDice from '../../enums/DefenseDice';

const UnitForm = () => {
    const {currentSystem} = useGameSystem();
    const {unitId} = useParams();
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingUnit, setLoadingUnit] = useState(!!unitId);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('basic');
    const [customUnitTypes, setCustomUnitTypes] = useState([]);
    const [availableUpgrades, setAvailableUpgrades] = useState([]);

    const isAoS = currentSystem === GameSystems.AOS;
    const isLegion = currentSystem === GameSystems.LEGION;

    const [formData, setFormData] = useState({
        name: '',
        faction: isLegion ? Factions.REPUBLIC : AoSFactions.STORMCAST_ETERNALS,
        type: isLegion ? UnitTypes.CORPS : AoSUnitTypes.BATTLELINE,
        points: 0,
        wounds: 1,
        courage: 1,
        resilience: 0,
        ward: 6,
        defense: DefenseDice.WHITE,
        isVehicle: false,
        surgeAttack: false,
        surgeDefense: false,
        health: 1,
        move: 5,
        save: 4,
        control: 1,
        banishment: 0,
        baseSize: '32mm',
        reinforceable: false,
        grandAlliance: '',
        subfaction: [],
        speed: 2,
        minModelCount: 1,
        currentModelCount: 1,
        keywords: [],
        weapons: [],
        abilities: [],
        upgradeSlots: [],
        miniatures: '',
        notes: '',
        unitIcon: '',
        cardBackground: '',
        battleProfile: {
            allowedKeywords: [],
            canSubCommander: false,
            allowsSubCommanders: false,
            maxSubCommanders: 1,
            isRegimentOfRenown: false,
            requiredUnits: [],
            requiredRegimentAbility: ''
        }
    });

    const [validated, setValidated] = useState(false);

    useEffect(() => {
        const fetchUnit = async () => {
            if (!unitId || !currentUser) return;
            try {
                const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
                const unitDoc = await getDoc(unitRef);
                if (unitDoc.exists()) {
                    const unitData = unitDoc.data();
                    setFormData({
                        ...unitData,
                        keywords: unitData.keywords || [],
                        weapons: unitData.weapons || [],
                        abilities: unitData.abilities || [],
                        upgradeSlots: unitData.upgradeSlots || [],
                        minModelCount: unitData.minModelCount || 1,
                        currentModelCount: unitData.currentModelCount || unitData.minModelCount || 1,
                        isVehicle: unitData.isVehicle || false,
                        surgeAttack: unitData.surgeAttack || false,
                        surgeDefense: unitData.surgeDefense || false,
                        courage: unitData.isVehicle ? 0 : (unitData.courage !== undefined ? unitData.courage : 1),
                        resilience: unitData.isVehicle ? (unitData.resilience !== undefined ? unitData.resilience : 0) : 0,
                        health: unitData.health || unitData.wounds || 1,
                        move: unitData.move || 5,
                        save: unitData.save || 4,
                        control: unitData.control || 1,
                        banishment: unitData.banishment || 0,
                        baseSize: unitData.baseSize || '32mm',
                        reinforceable: unitData.reinforceable || false,
                        grandAlliance: unitData.grandAlliance || '',
                        subfaction: Array.isArray(unitData.subfaction) ? unitData.subfaction : (unitData.subfaction ? [unitData.subfaction] : []),
                        unitIcon: unitData.unitIcon || '',
                        cardBackground: unitData.cardBackground || '',
                        battleProfile: unitData.battleProfile || {
                            allowedKeywords: [],
                            canSubCommander: false,
                            allowsSubCommanders: false,
                            maxSubCommanders: 1,
                            isRegimentOfRenown: false,
                            requiredUnits: [],
                            requiredRegimentAbility: ''
                        }
                    });
                } else {
                    setError('Unit not found');
                }
            } catch (err) {
                console.error('Error fetching unit:', err);
                setError('Failed to fetch unit details.');
            } finally {
                setLoadingUnit(false);
            }
        };
        fetchUnit();
    }, [currentUser, unitId]);

    useEffect(() => {
        const fetchAvailableOptions = async () => {
            if (!currentUser) return;
            try {
                const customTypesSnap = await getDocs(collection(db, 'users', currentUser.uid, 'customUnitTypes'));
                setCustomUnitTypes(customTypesSnap.docs.map(d => ({id: d.id, ...d.data()})));
                const upgradesSnap = await getDocs(collection(db, 'users', currentUser.uid, 'upgradeCards'));
                setAvailableUpgrades(upgradesSnap.docs.map(d => ({id: d.id, ...d.data()})));
            } catch (err) {
                console.error('Error fetching options:', err);
            }
        };
        fetchAvailableOptions();
    }, [currentUser]);

    useEffect(() => {
        const calcModelCount = async () => {
            if (!currentUser) return;
            let total = formData.minModelCount || 1;

            for (const slot of formData.upgradeSlots) {
                for (const id of slot.equippedUpgrades || []) {
                    const upgradeDoc = await getDoc(doc(db, 'users', currentUser.uid, 'upgradeCards', id));
                    if (upgradeDoc.exists()) {
                        const effects = upgradeDoc.data().effects;
                        if (effects?.modelCountChange) total += effects.modelCountChange;
                    }
                }
            }
            setFormData(prev => ({...prev, currentModelCount: total}));
        };
        calcModelCount();
    }, [formData.upgradeSlots, formData.minModelCount, currentUser]);

    useEffect(() => {
        if (formData.keywords?.includes('manifestation') && formData.control !== 0) {
            setFormData(prev => ({...prev, control: 0}));
        }
    }, [formData.keywords]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['points', 'wounds', 'courage', 'resilience', 'speed', 'minModelCount', 'health', 'move', 'save', 'control', 'banishment'].includes(name)
                ? (value === '' ? 0 : parseInt(value, 10))
                : value
        }));
    };

    const handleCheckboxChange = (e) => {
        const {name, checked} = e.target;
        setFormData(prev => ({...prev, [name]: checked}));
    };

    const calculateTotalPoints = () => {
        let total = formData.points || 0;
        formData.upgradeSlots?.forEach(slot =>
            slot.equippedUpgrades?.forEach(id => {
                const up = availableUpgrades.find(u => u.id === id);
                if (up) total += up.pointsCost || 0;
            })
        );
        return total;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (formData.minModelCount < 1) {
            setError('Minimum model count must be at least 1');
            return;
        }

        try {
            setLoading(true);
            const dataToSave = {
                ...formData,
                gameSystem: currentSystem,
                totalPoints: calculateTotalPoints(),
                updatedAt: serverTimestamp(),
                userId: currentUser.uid
            };

            if (unitId) {
                await updateDoc(doc(db, 'users', currentUser.uid, 'units', unitId), dataToSave);
                setSuccess('Unit updated!');
            } else {
                dataToSave.createdAt = serverTimestamp();
                const ref = await addDoc(collection(db, 'users', currentUser.uid, 'units'), dataToSave);
                setSuccess('Unit created!');
                navigate(`/units/${ref.id}`);
            }
        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to save unit.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingUnit) return <LoadingSpinner text="Loading unit..."/>;
    if (loading) return <LoadingSpinner text="Saving..."/>;

    return (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3" fill>
                <Tab eventKey="basic" title="Basic Info">
                    <BasicInfoTab
                        formData={formData}
                        setFormData={setFormData}
                        handleChange={handleChange}
                        handleCheckboxChange={handleCheckboxChange}
                        customUnitTypes={customUnitTypes}
                        calculateTotalPoints={calculateTotalPoints}
                        isAoS={isAoS}
                        isLegion={isLegion}
                    />
                </Tab>

                <Tab eventKey="keywords" title="Keywords">
                    <KeywordsTab
                        keywords={formData.keywords}
                        onChange={(keywords) => setFormData(prev => ({...prev, keywords}))}
                        isAoS={isAoS}
                    />
                </Tab>

                <Tab eventKey="weapons" title="Weapons">
                    <WeaponsTab
                        weapons={formData.weapons}
                        onChange={(weapons) => setFormData(prev => ({...prev, weapons}))}
                    />
                </Tab>

                <Tab eventKey="abilities" title={`Abilities (${formData.abilities?.length || 0})`}>
                    <AbilitiesTab
                        abilities={formData.abilities}
                        onChange={(abilities) => setFormData(prev => ({...prev, abilities}))}
                    />
                </Tab>

                {formData.type === AoSUnitTypes.HERO && isAoS && (
                    <Tab eventKey="regiment" title="Regiment Rules">
                        <RegimentRulesTab
                            battleProfile={formData.battleProfile}
                            onChange={(profile) => setFormData(prev => ({...prev, battleProfile: profile}))}
                            faction={formData.faction}
                            unitId={unitId}
                        />
                    </Tab>
                )}

                {isLegion && (
                    <Tab eventKey="upgrades" title={`Upgrades (${formData.upgradeSlots?.length || 0})`}>
                        <UpgradesTab
                            upgradeSlots={formData.upgradeSlots}
                            setFormData={setFormData}
                            availableUpgrades={availableUpgrades}
                        />
                    </Tab>
                )}

                <Tab eventKey="appearance" title="Appearance">
                    <AppearanceTab
                        formData={formData}
                        setFormData={setFormData}
                        customUnitTypes={customUnitTypes}
                    />
                </Tab>

                <Tab eventKey="notes" title="Notes">
                    <NotesTab
                        miniatures={formData.miniatures}
                        notes={formData.notes}
                        handleChange={handleChange}
                    />
                </Tab>
            </Tabs>

            <div className="d-flex justify-content-between mt-3">
                <Button variant="secondary" onClick={() => navigate('/units')}>Cancel</Button>
                <Button type="submit" variant="primary">{unitId ? 'Update Unit' : 'Create Unit'}</Button>
            </div>
        </Form>
    );
};

export default UnitForm;