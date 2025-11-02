import React from 'react';
import { ClothTypePreset } from '../types';
import { getStrings } from '../constants';

type Strings = ReturnType<typeof getStrings>;

interface SelectClothTypeModalProps {
    presets: ClothTypePreset[];
    onClose: () => void;
    onSelect: (preset: ClothTypePreset) => void;
    strings: Strings;
}

const SelectClothTypeModal: React.FC<SelectClothTypeModalProps> = ({ presets, onClose, onSelect, strings }) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="modal-content-pane p-6 rounded-2xl max-w-sm w-full flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{strings.selectClothType}</h3>
                
                <div className="flex-1 overflow-y-auto -mx-2">
                    {presets.length > 0 ? (
                        <ul className="space-y-2">
                            {presets.map(preset => (
                                <li key={preset.id}>
                                    <button 
                                        onClick={() => onSelect(preset)}
                                        className="w-full text-left p-3 rounded-lg hover:bg-[var(--bg)] transition-colors"
                                    >
                                        <p className="font-semibold">{preset.name}</p>
                                        <p className="text-sm text-[var(--secondary-text)]">{`₹${preset.rate || 0} / piece`}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-10">
                            <p className="font-medium text-[var(--secondary-text)]">{strings.noPresets}</p>
                            <p className="text-sm text-[var(--tertiary-text)] mt-1">{strings.goToLogScreenToAdd}</p>
                        </div>
                    )}
                </div>
                
                <div className="flex-shrink-0 border-t border-[var(--border)] pt-4 mt-2">
                     <button onClick={onClose} className="w-full py-3 bg-[var(--bg)] rounded-lg font-semibold transition-colors hover:opacity-80">
                        {strings.cancel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectClothTypeModal;