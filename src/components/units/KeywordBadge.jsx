import React, {useState} from 'react';
import {Badge, Modal, OverlayTrigger, Tooltip} from 'react-bootstrap';
import Keywords from '../../enums/Keywords';
import AoSKeywords from '../../enums/aos/AoSKeywords';
import {useGameSystem} from '../../contexts/GameSystemContext';
import GameSystems from '../../enums/GameSystems';

const KeywordBadge = ({keyword, customKeywords = [], className = '', bg, style = {}, children}) => {
    const [showModal, setShowModal] = useState(false);
    const {currentSystem} = useGameSystem();
    const KeywordEnum = currentSystem === GameSystems.AOS ? AoSKeywords : Keywords;

    const resolve = () => {
        if (keyword.startsWith('custom:')) {
            const custom = customKeywords.find(k => k.id === keyword.replace('custom:', ''));
            return {name: custom?.name ?? keyword, description: custom?.description ?? ''};
        }
        return {
            name: KeywordEnum.getDisplayName(keyword),
            description: KeywordEnum.getDescription?.(keyword) ?? '',
        };
    };

    const {name, description} = resolve();
    const displayBg = bg ?? (keyword.startsWith('custom:') ? 'info' : 'secondary');

    const badge = (
        <Badge
            bg={displayBg}
            className={className}
            style={{cursor: description ? 'help' : 'default', ...style}}
            onClick={() => description && setShowModal(true)}
        >
            {children ?? name}
        </Badge>
    );

    if (!description) return badge;

    return (
        <>
            <OverlayTrigger
                placement="top"
                delay={{show: 250, hide: 100}}
                overlay={
                    <Tooltip id={`kw-tip-${keyword}`}>
                        <strong>{name}</strong>
                        <div style={{marginTop: 2}}>
                            {description.length > 120 ? description.slice(0, 117) + '…' : description}
                        </div>
                    </Tooltip>
                }
            >
                {badge}
            </OverlayTrigger>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="sm">
                <Modal.Header closeButton>
                    <Modal.Title style={{fontSize: '1rem'}}>{name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0" style={{whiteSpace: 'pre-line'}}>{description}</p>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default KeywordBadge;