import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Save, Store, Truck, Phone } from 'lucide-react';
import '../index.css';

const Settings = () => {
    const { shopDetails, setShopDetails } = useInventory();

    const [formData, setFormData] = useState(shopDetails);

    // Update form if shopDetails changes (e.g. on load)
    useEffect(() => {
        setFormData(shopDetails);
    }, [shopDetails]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShopDetails(formData);
        alert('Shop details updated successfully!');
    };

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-dim">Configure your shop details for invoices</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Store className="text-blue-400" size={20} /> Shop Details
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-dim text-sm block mb-1">Shop Name</label>
                            <input
                                type="text"
                                className="input-glass"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your Shop Name"
                            />
                        </div>

                        <div>
                            <label className="text-dim text-sm block mb-1">Tagline / Subheader</label>
                            <input
                                type="text"
                                className="input-glass"
                                value={formData.subline}
                                onChange={e => setFormData({ ...formData, subline: e.target.value })}
                                placeholder="e.g. Auto Rickshaw Specialist"
                            />
                        </div>

                        <div>
                            <label className="text-dim text-sm block mb-1">Contact / Address Line</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-dim" size={16} />
                                <input
                                    type="text"
                                    className="input-glass pl-10"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Phone: +91 ..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-dim text-sm block mb-1">GST / Tax ID (Optional)</label>
                            <input
                                type="text"
                                className="input-glass"
                                value={formData.gst || ''}
                                onChange={e => setFormData({ ...formData, gst: e.target.value })}
                                placeholder="GSTIN..."
                            />
                        </div>

                        <div>
                            <label className="text-dim text-sm block mb-1">Total Shop Investment (₹)</label>
                            <input
                                type="number"
                                className="input-glass"
                                value={formData.investment || ''}
                                onChange={e => setFormData({ ...formData, investment: Number(e.target.value) })}
                                placeholder="1000000"
                            />
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="btn btn-primary w-full">
                                <Save size={18} /> Save Settings
                            </button>
                        </div>
                    </form>
                </div>

                <div className="glass-panel p-6 flex flex-col justify-center items-center text-center opacity-70">
                    <Truck size={48} className="text-dim mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Invoice Preview</h3>
                    <div className="bg-white p-6 text-black rounded shadow-lg w-full max-w-sm mt-4 text-left">
                        <h4 className="font-bold text-lg text-center">{formData.name || 'Shop Name'}</h4>
                        <p className="text-center text-xs text-gray-600 mb-2">{formData.subline || 'Tagline'}</p>
                        <div className="border-b border-gray-300 my-2"></div>
                        <p className="text-xs text-center">{formData.address || 'Address / Phone'}</p>
                        {formData.gst && <p className="text-xs text-center mt-1">GSTIN: {formData.gst}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
