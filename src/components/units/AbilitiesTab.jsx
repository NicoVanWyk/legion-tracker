import React from 'react';
import {Card} from 'react-bootstrap';
import AbilitySelector from '../abilities/AbilitySelector';

const AbilitiesTab = ({abilities, onChange}) => {
    return (
        <Card>
            <Card.Body>
                <AbilitySelector
                    selectedAbilities={abilities}
                    onChange={onChange}
                />
            </Card.Body>
        </Card>
    );
};

export default AbilitiesTab;