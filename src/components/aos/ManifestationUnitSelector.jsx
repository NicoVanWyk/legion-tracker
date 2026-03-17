import React, {useState, useEffect} from 'react';
import {Form, Badge} from 'react-bootstrap';
import {collection, getDocs, query, where} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import AoSKeywords from '../../enums/aos/AoSKeywords';

const ManifestationUnitSelector = ({selectedUnitId, onChange}) => {
    const {currentUser} = useAuth();
    const [manifestationUnits, setManifestationUnits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchManifestationUnits = async () => {
            if (!currentUser) return;

            try {
                const unitsRef = collection(db, 'users', currentUser.uid, 'units');
                const unitsSnap = await getDocs(unitsRef);

                const units = unitsSnap.docs
                    .map(doc => ({id: doc.id, ...doc.data()}))
                    .filter(unit => unit.keywords?.includes(AoSKeywords.MANIFESTATION));

                setManifestationUnits(units);
            } catch (err) {
                console.error('Error fetching manifestation units:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchManifestationUnits();
    }, [currentUser]);

    if (loading) {
        return <Form.Text className="text-muted">Loading units...</Form.Text>;
    }

    if (manifestationUnits.length === 0) {
        return (
            <Form.Text className="text-warning">
                No units with MANIFESTATION keyword found. Create a unit with the Manifestation keyword first.
            </Form.Text>
        );
    }

    return (
        <Form.Group>
            <Form.Label>Linked Unit</Form.Label>
            <Form.Select
                value={selectedUnitId || ''}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">No unit linked</option>
                {manifestationUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.points} pts)
                    </option>
                ))}
            </Form.Select>
            <Form.Text className="text-muted">
                Link this manifestation to a unit card with the MANIFESTATION keyword
            </Form.Text>
        </Form.Group>
    );
};

export default ManifestationUnitSelector;