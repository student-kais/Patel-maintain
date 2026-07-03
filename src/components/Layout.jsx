import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Outlet, useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import Sidebar from './Sidebar';
import { Bell, User, Menu } from 'lucide-react';
import './Layout.css';

const Layout = () => {
    const { user } = useAuth();
    const { inventory } = useInventory();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const lowStockCount = inventory.filter(i => i.stock < 10).length;
    return (
        <div className="app-container">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main className="main-content">
                <header className="top-bar glass-panel">
                    <div className="mobile-menu-btn">
                        <button className="icon-btn" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>
                    </div>

                    <div className="top-actions">
                        <button
                            className="icon-btn relative"
                            title={lowStockCount > 0 ? `${lowStockCount} Low Stock Alerts` : 'No Notifications'}
                            onClick={() => lowStockCount > 0 && navigate('/inventory?filter=low_stock')}
                        >
                            <Bell size={20} />
                            {lowStockCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                    {lowStockCount}
                                </span>
                            )}
                        </button>
                        <div className="user-profile">
                            <div className="avatar">
                                <User size={20} />
                            </div>
                            <span className="username">{user?.name || 'User'}</span>
                        </div>
                    </div>
                </header>

                <div className="content-scroll">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
