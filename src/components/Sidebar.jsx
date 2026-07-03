import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Wrench,
    BarChart3,
    Settings,
    LogOut,
    Shield,
    Users,
    X,
    MapPin,
    Phone,
    Building
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { createPortal } from 'react-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, isAdmin, logout } = useAuth();
    const { shopDetails } = useInventory();
    const [showShopInfo, setShowShopInfo] = React.useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const ownerMenuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Package, label: 'Inventory', path: '/inventory' },
        { icon: ShoppingCart, label: 'Billing', path: '/billing' },
        { icon: Wrench, label: 'Services', path: '/services' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const adminMenuItems = [
        { icon: LayoutDashboard, label: 'System Overview', path: '/' },
        { icon: Users, label: 'Shop Tenants', path: '/admin/shops' },
        { icon: Settings, label: 'Global Setup', path: '/settings' },
    ];

    const currentMenu = isAdmin ? adminMenuItems : ownerMenuItems;

    return (
        <>
            {isOpen && (
                <div 
                    className="sidebar-overlay" 
                    onClick={() => setIsOpen(false)}
                />
            )}
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="logo-box">
                            <Shield size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <div className="logo-text">Auto Mate</div>
                            <div className="logo-sub">{isAdmin ? 'Platform Admin' : 'Garage Manager'}</div>
                        </div>
                    </div>
                    <button 
                        className="mobile-close-btn text-dim hover:text-white"
                        onClick={() => setIsOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div
                    className="user-profile-sm px-4 py-3 border-b border-white/5 bg-white/5 mb-4 text-center cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => setShowShopInfo(true)}
                    title="View Shop Details"
                >
                    <p className="text-[10px] uppercase tracking-widest text-dim font-bold mb-1">Logged in as</p>
                    <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-blue-400 font-medium">{isAdmin ? 'System Administrator' : 'Merchant Account'}</p>
                </div>

                {showShopInfo && createPortal(
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowShopInfo(false)}>
                        <div className="glass-panel w-full max-w-md p-6 animate-fade-in relative" onClick={e => e.stopPropagation()}>
                            <button
                                className="absolute top-4 right-4 text-dim hover:text-white"
                                onClick={() => setShowShopInfo(false)}
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-3 border border-blue-500/30">
                                    <Building size={32} className="text-blue-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white">{shopDetails?.name || 'My Shop'}</h2>
                                <p className="text-dim text-sm">{shopDetails?.subline || 'Automotive Service Center'}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-start gap-3">
                                    <MapPin size={18} className="text-dim mt-0.5" />
                                    <div>
                                        <p className="text-xs text-dim uppercase font-bold mb-1">Address</p>
                                        <p className="text-sm text-white">{shopDetails?.address || 'Address not set'}</p>
                                    </div>
                                </div>

                                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-start gap-3">
                                    <Phone size={18} className="text-dim mt-0.5" />
                                    <div>
                                        <p className="text-xs text-dim uppercase font-bold mb-1">Contact</p>
                                        <p className="text-sm text-white">{shopDetails?.contact || 'Phone not available'}</p>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary w-full mt-2"
                                    onClick={() => {
                                        navigate('/settings');
                                        setShowShopInfo(false);
                                    }}
                                >
                                    Edit Shop Details
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                <nav className="nav-menu">
                    {currentMenu.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="icon"><item.icon size={20} /></span>
                            <span className="label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item logout-btn w-full" onClick={handleLogout}>
                        <span className="icon"><LogOut size={20} /></span>
                        <span className="label">Exit Platform</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;

