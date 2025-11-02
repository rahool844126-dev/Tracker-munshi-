import React, { useState } from 'react';
import { ClothTypePreset } from '../types';
import { getStrings } from '../constants';
import { PlusIcon, EditIcon, TrashIcon, CheckIcon } from './Icons';

type Strings = ReturnType<typeof getStrings>;

interface ManageClothTypesModalProps {
    presets: ClothTypePreset[];
    onClose: () => void;
    onSave: (newPresets: ClothTypePreset[]) => void;
    strings: Strings;
}

const ManageClothTypesModal: React.FC<ManageClothTypesModalProps> = ({ presets, onClose, onSave, strings }) => {
    const [newPresetName, setNewPresetName] = useState('');
    const [newPresetRate, setNewPresetRate] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editingRate, setEditingRate] = useState('');

    const handleAddPreset = () => {
        if (!newPresetName.trim()) return;
        const rate = parseFloat(newPresetRate);
        const newPreset: ClothTypePreset = {
            id: `preset-${Date.now()}`,
            name: newPresetName.trim(),
            rate: isNaN(rate) || rate < 0 ? 0 : rate,
        };
        onSave([...presets, newPreset]);
        setNewPresetName('');
        setNewPresetRate('');
    };
    
    const handleDeletePreset = (id: string) => {
        const presetToDelete = presets.find(p => p.id === id);
        if (!presetToDelete) return;
        const confirmMsg = strings.deletePresetConfirmation.replace('{presetName}', presetToDelete.name);
        if (window.confirm(confirmMsg)) {
            onSave(presets.filter(p => p.id !== id));
        }
    };
    
    const startEditing = (preset: ClothTypePreset) => {
        setEditingId(preset.id);
        setEditingName(preset.name);
        setEditingRate(String(preset.rate || ''));
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingName('');
        setEditingRate('');
    };

    const handleUpdatePreset = () => {
        if (!editingId || !editingName.trim()) return;
        const rate = parseFloat(editingRate);
        const updatedPresets = presets.map(p => 
            p.id === editingId 
            ? { ...p, name: editingName.trim(), rate: isNaN(rate) || rate < 0 ? 0 : rate }
            : p
        );
        onSave(updatedPresets);
        cancelEditing();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="modal-content-pane p-6 rounded-2xl max-w-sm w-full flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{strings.clothTypePresets}</h3>

                <div className="flex-1 overflow-y-auto space-y-2 mb-4 -mr-2 pr-2">
                    {presets.length > 0 ? presets.map(preset => (
                        <div key={preset.id} className="bg-[var(--bg)] p-2 rounded-lg group">
                           {editingId === preset.id ? (
                                <div className="space-y-2">
                                    <input type="text" value={editingName} onChange={e => setEditingName(e.target.value)} className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded-md" placeholder={strings.clothTypeName} />
                                    <input type="number" value={editingRate} onChange={e => setEditingRate(e.target.value)} className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded-md" placeholder={strings.ratePerPiece} />
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={cancelEditing} className="py-1 px-3 text-sm font-semibold">{strings.cancel}</button>
                                        <button onClick={handleUpdatePreset} className="py-1 px-3 bg-[var(--accent)] text-white text-sm rounded-md font-semibold">{strings.save}</button>
                                    </div>
                                </div>
                           ) : (
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{preset.name}</p>
                                        <p className="text-sm text-[var(--secondary-text)]">{`₹${preset.rate || 0} / piece`}</p>
                                    </div>
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEditing(preset)} className="p-2 text-[var(--secondary-text)] hover:text-[var(--accent)]" title={strings.editPreset}><EditIcon/></button>
                                        <button onClick={() => handleDeletePreset(preset.id)} className="p-2 text-[var(--secondary-text)] hover:text-red-500" title={strings.deletePreset}><TrashIcon /></button>
                                    </div>
                                </div>
                           )}
                        </div>
                    )) : (
                        <p className="text-sm text-center text-[var(--secondary-text)] py-8">{strings.noPresets}</p>
                    )}
                </div>

                <div className="flex-shrink-0 border-t border-[var(--border)] pt-4">
                    <p className="text-sm font-semibold mb-2">{strings.addPreset}</p>
                    <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                            <input type="text" value={newPresetName} onChange={e => setNewPresetName(e.target.value)} placeholder={strings.newPresetName} className="w-full p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg"/>
                            <input type="number" value={newPresetRate} onChange={e => setNewPresetRate(e.target.value)} placeholder={strings.ratePerPiece} className="w-full p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg"/>
                        </div>
                        <button onClick={handleAddPreset} className="h-12 w-12 mt-[44px] flex-shrink-0 bg-[var(--accent)] text-white rounded-lg flex items-center justify-center disabled:opacity-50" disabled={!newPresetName.trim()}><PlusIcon className="w-6 h-6"/></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageClothTypesModal;