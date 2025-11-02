import React, { useState } from 'react';
import { User } from '../types';
import { CheckIcon, PlusIcon, EditIcon } from './Icons';

interface UserManagementModalProps {
    users: User[];
    activeUserId: string | null;
    onClose: () => void;
    onSwitchUser: (userId: string) => void;
    onAddUser: (name: string) => void;
    onRenameUser: (userId: string, newName: string) => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ users, activeUserId, onClose, onSwitchUser, onAddUser, onRenameUser }) => {
    const [newUserName, setNewUserName] = useState('');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editedUserName, setEditedUserName] = useState('');

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUserName.trim()) {
            onAddUser(newUserName.trim());
            setNewUserName('');
        }
    };

    const handleStartEditing = (user: User) => {
        setEditingUserId(user.id);
        setEditedUserName(user.name);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur(); // Trigger blur to save
        } else if (e.key === 'Escape') {
            setEditingUserId(null);
        }
    }

    const handleRenameUser = () => {
        if (editedUserName.trim() && editingUserId && editedUserName.trim() !== users.find(u => u.id === editingUserId)?.name) {
            onRenameUser(editingUserId, editedUserName.trim());
        }
        setEditingUserId(null);
    };


    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="modal-content-pane p-6 rounded-2xl max-w-sm w-full flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 flex-shrink-0">Switch User</h3>

                <ul className="flex-1 overflow-y-auto space-y-2 mb-4 -mr-2 pr-2">
                    {users.map(user => {
                        const isActive = user.id === activeUserId;
                        const isEditing = user.id === editingUserId;
                        return (
                            <li key={user.id}>
                                {isEditing ? (
                                    <div className="flex items-center gap-2 p-2">
                                        <input
                                            type="text"
                                            value={editedUserName}
                                            onChange={(e) => setEditedUserName(e.target.value)}
                                            onBlur={handleRenameUser}
                                            onKeyDown={handleKeyDown}
                                            autoFocus
                                            className="flex-1 p-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                        />
                                    </div>
                                ) : (
                                    <div className={`w-full flex items-center text-left rounded-lg transition-colors group ${isActive ? 'bg-[var(--accent-subtle)]' : 'hover:bg-[var(--bg)]'}`}>
                                        <button
                                            onClick={() => onSwitchUser(user.id)}
                                            className="flex-1 flex items-center gap-3 p-3 text-left"
                                        >
                                            <span className={`${isActive ? 'font-bold text-[var(--accent)]' : ''}`}>{user.name}</span>
                                        </button>
                                        <div className="flex items-center pr-3">
                                            {isActive && <CheckIcon className="h-5 w-5 text-[var(--accent)]" />}
                                            <button
                                                onClick={() => handleStartEditing(user)}
                                                className={`p-1 ml-2 text-[var(--secondary-text)] ${!isActive ? 'opacity-0 group-hover:opacity-100' : ''} focus:opacity-100 transition-opacity`}
                                                title={`Rename ${user.name}`}
                                            >
                                                <EditIcon />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>

                <div className="flex-shrink-0 border-t border-[var(--border)] pt-4">
                    <p className="text-sm font-semibold mb-2">Add New User</p>
                    <form onSubmit={handleAddUser} className="flex gap-3">
                        <input
                            type="text"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            className="flex-1 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                            placeholder="e.g., Rahul"
                        />
                        <button
                            type="submit"
                            className="py-3 px-5 bg-[var(--accent)] text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center"
                            disabled={!newUserName.trim()}
                            title="Add User"
                        >
                            <PlusIcon />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserManagementModal;