import React, { useState, useRef, useEffect } from 'react';
import { DotsVerticalIcon } from './icons/DotsVerticalIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface DropdownMenuProps {
    onView: () => void;
    onExport: () => void;
    canExport: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ onView, onExport, canExport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleView = () => {
        onView();
        setIsOpen(false);
    };

    const handleExport = () => {
        onExport();
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <div>
                <button
                    type="button"
                    className="flex items-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 p-1"
                    id="menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="sr-only">Open options</span>
                    <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
                </button>
            </div>
            {isOpen && (
                <div
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    <div className="py-1" role="none">
                        <button
                            onClick={handleView}
                            className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            role="menuitem"
                        >
                            View Details / Invoice
                        </button>
                        {canExport && (
                            <button
                                onClick={handleExport}
                                className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                role="menuitem"
                            >
                                <span className="flex items-center">
                                    <DownloadIcon className="h-4 w-4 mr-2" />
                                    Export for QuickBooks
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;