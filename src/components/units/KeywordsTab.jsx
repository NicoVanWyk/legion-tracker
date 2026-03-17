import React from 'react';
import {Card, Form} from 'react-bootstrap';
import KeywordSelector from './KeywordSelector';

const KeywordsTab = ({keywords, onChange, isAoS}) => {
    return (
        <Card>
            <Card.Body>
                <KeywordSelector selectedKeywords={keywords} onChange={onChange}/>
                <Form.Text className="text-muted">
                    {isAoS ? 'Include HERO, WIZARD, PRIEST, FLY, MONSTER, etc.' : 'Select unit keywords'}
                </Form.Text>
            </Card.Body>
        </Card>
    );
};

export default KeywordsTab;