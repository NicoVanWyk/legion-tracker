import React from 'react';
import {Card} from 'react-bootstrap';
import WeaponSelector from './WeaponSelector';

const WeaponsTab = ({weapons, onChange}) => {
    return (
        <Card>
            <Card.Body>
                <WeaponSelector weapons={weapons} onChange={onChange}/>
            </Card.Body>
        </Card>
    );
};

export default WeaponsTab;