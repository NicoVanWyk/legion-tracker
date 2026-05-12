import React, {useState, useEffect} from 'react';
import {Badge, Modal, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {doc, getDoc} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import Keywords from '../../enums/Keywords';
import AoSKeywords from '../../enums/aos/AoSKeywords';
import {useGameSystem} from '../../contexts/GameSystemContext';
import GameSystems from '../../enums/GameSystems';

const KeywordBadge = ({keyword, customKeywords = [], className = '', bg, style = {}, children}) => {
    const [showModal, setShowModal]         = useState(false);
    const [fetchedCustom, setFetchedCustom] = useState(null); // { name, description }
    const {currentSystem} = useGameSystem();
    const {currentUser}   = useAuth();
    const KeywordEnum = currentSystem === GameSystems.AOS ? AoSKeywords : Keywords;

    const isCustom   = keyword.startsWith('custom:');
    const customId   = isCustom ? keyword.replace('custom:', '') : null;

    // If it's a custom keyword and not supplied via prop, fetch it from Firestore
    useEffect(() => {
        if (!isCustom || !currentUser || !customId) return;
        const fromProp = customKeywords.find(k => k.id === customId);
        if (fromProp) { setFetchedCustom(fromProp); return; }

        getDoc(doc(db, 'users', currentUser.uid, 'customKeywords', customId))
            .then(snap => {
                if (snap.exists()) setFetchedCustom({id: snap.id, ...snap.data()});
            })
            .catch(() => {});
    }, [isCustom, customId, currentUser, customKeywords]);

    const resolve = () => {
        if (isCustom) {
            const custom = fetchedCustom ?? customKeywords.find(k => k.id === customId);
            return {name: custom?.name ?? keyword, description: custom?.description ?? ''};
        }
        return {
            name:        KeywordEnum.getDisplayName(keyword),
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
            onClick={e => {
                e.stopPropagation();
                if (description) setShowModal(true);
            }}
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

            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                size="sm"
                onClick={e => e.stopPropagation()}
            >
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