import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Store,
    Activity,
    MoreVertical,
    Database,
    X,
    User,
    Phone,
    Mail,
    MapPin,
    CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminShops = () => {
    // Persistent state for shops
    const [shops, setShops] = useState(() => {
        const saved = localStorage.getItem('automate_all_shops');
        return saved ? JSON.parse(saved) : [
            { id: 'S-7721', name: 'Patel Auto Parts', owner: 'Mr. Patel', plan: 'Pro', status: 'Active', usage: 85, revenue: '₹1.2L', mobile: '9724679050' },
            { id: 'S-8832', name: 'Kumar Garage', owner: 'Rahul Kumar', plan: 'Basics', status: 'Pending', usage: 12, revenue: '₹0', mobile: '8800112233' },
            { id: 'S-1102', name: 'Mumbai Spares', owner: 'Sanjay Gupta', plan: 'Enterprise', status: 'Active', usage: 44, revenue: '₹5.4L', mobile: '9988776655' }
        ];
    });

    const [showModal, setShowModal] = useState(false);
    const [newShop, setNewShop] = useState({
        name: '',
        owner: '',
        mobile: '',
        email: '',
        plan: 'Basics',
        location: ''
    });

    // Persistence
    useEffect(() => {
        localStorage.setItem('automate_all_shops', JSON.stringify(shops));
    }, [shops]);

    const handleAddShop = (e) => {
        e.preventDefault();
        const shopId = `S-${Math.floor(1000 + Math.random() * 9000)}`;
        const shopToAdd = {
            ...newShop,
            id: shopId,
            status: 'Active',
            usage: 0,
            revenue: '₹0',
            lastActive: 'Just now'
        };

        setShops([shopToAdd, ...shops]);
        setShowModal(false);
        setNewShop({ name: '', owner: '', mobile: '', email: '', plan: 'Basics', location: '' });
        toast.success(`Success! ${newShop.name} has been activated.`);
    };

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Shop Tenants</h1>
                    <p className="text-dim mt-1">Manage and monitor all garage accounts globally</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Plus size={18} /> Add New Shop
                    </button>
                    <button className="btn bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all">
                        Export Platform Data
                    </button>
                </div>
            </div>

            {/* Shop Management Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-lg p-6 animate-scale-in border border-white/10 shadow-2xl relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-dim hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus className="text-blue-400" size={24} /> Register New Garage
                            </h2>
                            <p className="text-dim text-sm mt-1">Onboard a new merchant to the Auto Mate platform</p>
                        </div>

                        <form onSubmit={handleAddShop} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormGroup label="Shop Name" icon={Store}>
                                    <input
                                        type="text" required className="input-glass" placeholder="Patel Spares"
                                        value={newShop.name} onChange={e => setNewShop({ ...newShop, name: e.target.value })}
                                    />
                                </FormGroup>
                                <FormGroup label="Owner Name" icon={User}>
                                    <input
                                        type="text" required className="input-glass" placeholder="Kaisar Patel"
                                        value={newShop.owner} onChange={e => setNewShop({ ...newShop, owner: e.target.value })}
                                    />
                                </FormGroup>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormGroup label="Mobile Number" icon={Phone}>
                                    <input
                                        type="tel" required className="input-glass" placeholder="97246XXXXX"
                                        value={newShop.mobile} onChange={e => setNewShop({ ...newShop, mobile: e.target.value })}
                                    />
                                </FormGroup>
                                <FormGroup label="Email Address" icon={Mail}>
                                    <input
                                        type="email" required className="input-glass" placeholder="owner@garage.com"
                                        value={newShop.email} onChange={e => setNewShop({ ...newShop, email: e.target.value })}
                                    />
                                </FormGroup>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormGroup label="Location / City" icon={MapPin}>
                                    <input
                                        type="text" className="input-glass" placeholder="Ahmedabad"
                                        value={newShop.location} onChange={e => setNewShop({ ...newShop, location: e.target.value })}
                                    />
                                </FormGroup>
                                <FormGroup label="Subscription Plan" icon={CreditCard}>
                                    <select
                                        className="input-glass"
                                        value={newShop.plan} onChange={e => setNewShop({ ...newShop, plan: e.target.value })}
                                    >
                                        <option value="Basics">Basics (₹499/mo)</option>
                                        <option value="Pro">Pro (₹1,499/mo)</option>
                                        <option value="Enterprise">Enterprise (Custom)</option>
                                        <option value="Trial">Free Trial (14 Days)</option>
                                    </select>
                                </FormGroup>
                            </div>

                            <button type="submit" className="btn btn-primary w-full h-12 mt-4 shadow-xl">
                                Create Account & Send Login
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-white/10 flex flex-wrap gap-4 justify-between items-center bg-white/5">
                    <div className="search-bar w-full max-w-sm">
                        <Search className="search-icon" size={18} />
                        <input type="text" placeholder="Search by shop name, owner or ID..." className="bg-transparent border-none outline-none text-white w-full" />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">All Shops</button>
                        <button className="px-4 py-2 rounded-lg bg-white/5 text-dim text-xs font-bold hover:text-white transition-colors">Active Only</button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-dim">Tenant Info</th>
                                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-dim">Subscription</th>
                                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-dim">Platform Usage</th>
                                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-dim">Revenue Share</th>
                                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-dim">Status</th>
                                <th className="text-right p-4 text-[10px] font-bold uppercase tracking-widest text-dim">Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shops.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-dim">No shops registered yet. Click "Add New Shop" to get started.</td>
                                </tr>
                            ) : (
                                shops.map(shop => (
                                    <tr key={shop.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                                                    <Store size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{shop.name}</div>
                                                    <div className="text-[10px] text-dim flex items-center gap-1">
                                                        <span className="text-blue-400">{shop.id}</span> • {shop.owner}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-bold ${shop.plan === 'Enterprise' ? 'text-purple-400' :
                                                        shop.plan === 'Pro' ? 'text-blue-400' : 'text-dim'
                                                    }`}>{shop.plan}</span>
                                                <span className="text-[10px] text-dim">{shop.mobile || 'No Mobile'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[100px]">
                                                    <div
                                                        className={`h-full rounded-full ${shop.usage > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${shop.usage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-white">{shop.usage}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-white text-sm font-medium">{shop.revenue}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${shop.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    shop.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                        'bg-red-500/10 text-red-100 border border-red-500/20'
                                                }`}>
                                                {shop.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-blue-600 rounded-lg text-dim hover:text-white transition-all" title="Manage Features"><Database size={16} /></button>
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-dim hover:text-white transition-all"><MoreVertical size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const FormGroup = ({ label, icon: Icon, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase font-bold text-dim tracking-widest flex items-center gap-1.5">
            <Icon size={12} className="text-blue-400" /> {label}
        </label>
        {children}
    </div>
);

// eslint-disable-next-line
const AdminStatCard = ({ title, value, icon: IconComponent, color, bg }) => (
    <div className="glass-panel p-6 flex items-center gap-4 hover:border-white/20 transition-all cursor-default">
        <div className={`p-4 rounded-2xl ${bg} ${color}`}>
            <IconComponent size={28} />
        </div>
        <div>
            <p className="text-dim text-xs font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-black text-white">{value}</h3>
        </div>
    </div>
);

export default AdminShops;
