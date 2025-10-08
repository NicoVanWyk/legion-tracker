import React, { useState, useEffect } from 'react';

// Component to track individual model casualties
const ModelCasualtyTracker = ({ unit, upgrades = [], onUpdateModels }) => {
    const [models, setModels] = useState([]);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        initializeModels();
    }, [unit, upgrades]);

    const initializeModels = () => {
        if (unit.models && unit.models.length > 0) {
            setModels(unit.models);
            return;
        }

        const modelsList = [];
        let modelId = 0;

        // Add base unit models
        const baseModelCount = unit.minModelCount || 1;
        for (let i = 0; i < baseModelCount; i++) {
            modelsList.push({
                id: modelId++,
                name: `${unit.name} #${i + 1}`,
                type: 'base',
                source: 'Base Unit',
                isAlive: true,
                weapons: unit.weapons || [],
                abilities: unit.abilities || [],
                keywords: unit.keywords || []
            });
        }

        // Add models from upgrades
        unit.upgradeSlots?.forEach(slot => {
            slot.equippedUpgrades?.forEach(upgradeId => {
                const upgrade = upgrades.find(u => u.id === upgradeId);
                if (upgrade?.effects?.modelCountChange > 0) {
                    for (let i = 0; i < upgrade.effects.modelCountChange; i++) {
                        modelsList.push({
                            id: modelId++,
                            name: `${upgrade.name} #${i + 1}`,
                            type: 'upgrade',
                            source: upgrade.name,
                            upgradeId: upgrade.id,
                            isAlive: true,
                            weapons: upgrade.effects.addWeapons || [],
                            abilities: upgrade.effects.addAbilities || [],
                            keywords: upgrade.effects.addKeywords || []
                        });
                    }
                }
            });
        });

        setModels(modelsList);
        onUpdateModels(modelsList);
    };

    const toggleModelStatus = (modelId) => {
        const updatedModels = models.map(model =>
            model.id === modelId ? { ...model, isAlive: !model.isAlive } : model
        );
        setModels(updatedModels);
        onUpdateModels(updatedModels);
    };

    const killMultipleModels = (count) => {
        let remainingKills = count;
        const updatedModels = [...models];

        for (let i = 0; i < updatedModels.length && remainingKills > 0; i++) {
            if (updatedModels[i].isAlive) {
                updatedModels[i].isAlive = false;
                remainingKills--;
            }
        }

        setModels(updatedModels);
        onUpdateModels(updatedModels);
    };

    const reviveAllModels = () => {
        const updatedModels = models.map(model => ({ ...model, isAlive: true }));
        setModels(updatedModels);
        onUpdateModels(updatedModels);
    };

    const getActiveWeapons = () => {
        return models
            .filter(m => m.isAlive)
            .flatMap(m => m.weapons)
            .filter((weapon, index, self) =>
                index === self.findIndex(w => w.name === weapon.name)
            );
    };

    const aliveCount = models.filter(m => m.isAlive).length;
    const deadCount = models.filter(m => !m.isAlive).length;
    const totalCount = models.length;

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* Main Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Model Casualties</h3>
                        <p className="text-sm text-gray-600">
                            {aliveCount} alive / {deadCount} casualties / {totalCount} total
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            {showDetails ? 'Hide' : 'View'} Details
                        </button>
                        {deadCount > 0 && (
                            <button
                                onClick={reviveAllModels}
                                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Revive All
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-4">
                    <div className="mb-4">
                        <p className="font-semibold mb-2">Quick Kill:</p>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 5].map(count => (
                                <button
                                    key={count}
                                    onClick={() => killMultipleModels(count)}
                                    disabled={aliveCount === 0}
                                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Kill {count}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-sm">
                            <span className="font-semibold">Base Models:</span> {models.filter(m => m.type === 'base' && m.isAlive).length} / {models.filter(m => m.type === 'base').length}
                        </div>
                        <div className="text-sm">
                            <span className="font-semibold">Upgrade Models:</span> {models.filter(m => m.type === 'upgrade' && m.isAlive).length} / {models.filter(m => m.type === 'upgrade').length}
                        </div>
                    </div>

                    {deadCount > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                            <p className="font-semibold text-yellow-800">Effects Lost:</p>
                            <ul className="mt-1 text-yellow-700 list-disc list-inside">
                                <li>{models.filter(m => !m.isAlive).flatMap(m => m.weapons).length} weapon(s)</li>
                                <li>{models.filter(m => !m.isAlive).flatMap(m => m.abilities).length} ability(ies)</li>
                                <li>{models.filter(m => !m.isAlive).flatMap(m => m.keywords).length} keyword(s)</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed View */}
            {showDetails && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                        <h4 className="font-bold">Model Details - {unit.name}</h4>
                    </div>

                    <div className="p-4">
                        <div className="mb-4">
                            <h5 className="font-semibold mb-2">Model Status</h5>
                            <div className="space-y-2">
                                {models.map(model => (
                                    <div
                                        key={model.id}
                                        className={`p-3 rounded border ${model.isAlive ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200'} flex justify-between items-center`}
                                    >
                                        <div className="flex-1">
                                            <div className="font-semibold flex items-center gap-2">
                                                {model.name}
                                                {!model.isAlive && (
                                                    <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded">KIA</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600">Source: {model.source}</div>
                                            {model.weapons.length > 0 && (
                                                <div className="text-sm">Weapons: {model.weapons.map(w => w.name).join(', ')}</div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => toggleModelStatus(model.id)}
                                            className={`px-3 py-1 text-sm rounded ${
                                                model.isAlive
                                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                            }`}
                                        >
                                            {model.isAlive ? "Mark KIA" : "Revive"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <h5 className="font-semibold mb-2">Active Weapons</h5>
                            {getActiveWeapons().length === 0 ? (
                                <p className="text-sm text-gray-500">No weapons available from surviving models</p>
                            ) : (
                                <div className="space-y-2">
                                    {getActiveWeapons().map((weapon, idx) => (
                                        <div key={idx} className="p-2 border border-gray-200 rounded">
                                            <div className="font-semibold">{weapon.name}</div>
                                            <div className="text-sm text-gray-600">
                                                {weapon.range} | R:{weapon.dice?.red || 0} B:{weapon.dice?.black || 0} W:{weapon.dice?.white || 0}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <h5 className="font-semibold mb-2">Active Keywords</h5>
                            <div className="flex flex-wrap gap-2">
                                {models.filter(m => m.isAlive).flatMap(m => m.keywords).length === 0 ? (
                                    <p className="text-sm text-gray-500">No keywords from surviving models</p>
                                ) : (
                                    models.filter(m => m.isAlive).flatMap(m => m.keywords).map((keyword, idx) => (
                                        <span key={idx} className="px-2 py-1 text-sm bg-gray-200 text-gray-800 rounded">
                      {keyword}
                    </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Demo component
const ModelTrackerDemo = () => {
    const [unit, setUnit] = useState({
        id: 'unit-1',
        name: 'Clone Troopers',
        minModelCount: 4,
        weapons: [
            { name: 'DC-15A Blaster Rifle', range: 'Range 1-3', dice: { red: 1, black: 1, white: 0 } }
        ],
        abilities: ['Reliable 1'],
        keywords: ['Clone Trooper'],
        upgradeSlots: [
            {
                type: 'heavy',
                equippedUpgrades: ['upgrade-1']
            },
            {
                type: 'personnel',
                equippedUpgrades: ['upgrade-2']
            }
        ]
    });

    const upgrades = [
        {
            id: 'upgrade-1',
            name: 'Z-6 Trooper',
            effects: {
                modelCountChange: 1,
                addWeapons: [
                    { name: 'Z-6 Rotary Blaster', range: 'Range 1-3', dice: { red: 0, black: 6, white: 0 }, keywords: ['Fixed: Front'] }
                ]
            }
        },
        {
            id: 'upgrade-2',
            name: 'Clone Medic',
            effects: {
                modelCountChange: 1,
                addAbilities: ['Treat 1: Capacity 1'],
                addKeywords: ['Medic']
            }
        }
    ];

    const handleUpdateModels = (models) => {
        setUnit(prev => ({ ...prev, models }));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-4">Model Casualty Tracker</h1>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h2 className="font-bold text-blue-900 mb-2">Demo Instructions:</h2>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Use "Quick Kill" buttons to mark models as casualties in order</li>
                        <li>• Click "View Details" to see individual model status and toggle specific models</li>
                        <li>• The tracker automatically removes weapons, abilities, and keywords from dead models</li>
                        <li>• This demo shows a Clone Trooper unit with Z-6 and Medic upgrades</li>
                    </ul>
                </div>

                <ModelCasualtyTracker
                    unit={unit}
                    upgrades={upgrades}
                    onUpdateModels={handleUpdateModels}
                />

                <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                        <h3 className="font-bold">Current Unit State (Debug)</h3>
                    </div>
                    <div className="p-4">
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
              {JSON.stringify(unit.models, null, 2)}
            </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModelTrackerDemo;