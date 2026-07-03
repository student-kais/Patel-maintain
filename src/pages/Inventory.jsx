import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { Search, Plus, Filter, Edit, Trash2 } from 'lucide-react';
import '../index.css';

const Inventory = () => {
    const [searchParams] = useSearchParams();
    const filterType = searchParams.get('filter');

    const { inventory, addProduct, updateStock, deleteProduct, updateProduct } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Restock State
    const [restockItem, setRestockItem] = useState(null);
    const [restockQty, setRestockQty] = useState('');

    // Edit State
    const [editingItem, setEditingItem] = useState(null);

    const [newProduct, setNewProduct] = useState({
        name: '',
        category: '',
        stock: 0,
        price: 0,
        status: 'In Stock'
    });

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterType === 'low_stock') {
            return matchesSearch && item.stock < 10;
        }

        return matchesSearch;
    });

    const handleAddProduct = (e) => {
        e.preventDefault();
        const productToAdd = {
            ...newProduct,
            stock: Number(newProduct.stock),
            price: Number(newProduct.price),
            status: Number(newProduct.stock) > 0 ? (Number(newProduct.stock) < 10 ? 'Low Stock' : 'In Stock') : 'Out of Stock'
        };
        addProduct(productToAdd);
        setShowAddForm(false);
        setNewProduct({ name: '', category: '', stock: 0, price: 0, status: 'In Stock' });
    };

    const handleRestockSubmit = (e) => {
        e.preventDefault();
        if (restockItem && restockQty) {
            updateStock(restockItem.id, parseInt(restockQty));
            setRestockItem(null);
            setRestockQty('');
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            deleteProduct(id);
        }
    };

    const handleEditClick = (item) => {
        setEditingItem({ ...item });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        updateProduct(editingItem.id, editingItem);
        setEditingItem(null);
    };

    return (
        <div className="dashboard-container animate-fade-in relative">
            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="glass-panel p-6 w-full max-w-md m-4 animate-fade-in">
                        <h3 className="text-xl font-bold mb-4 text-white">Edit Part</h3>
                        <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-dim text-sm block mb-1">Part Name</label>
                                <input
                                    type="text"
                                    className="input-glass"
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-dim text-sm block mb-1">Category</label>
                                <input
                                    type="text"
                                    className="input-glass"
                                    value={editingItem.category}
                                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-dim text-sm block mb-1">Price</label>
                                <input
                                    type="number"
                                    className="input-glass"
                                    value={editingItem.price}
                                    onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setEditingItem(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Restock Modal */}
            {restockItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="glass-panel p-6 w-full max-w-sm m-4 animate-fade-in">
                        <h3 className="text-xl font-bold mb-4 text-white">Add Stock</h3>
                        <p className="text-dim mb-4">Adding stock for: <span className="text-white font-medium">{restockItem.name}</span></p>
                        <form onSubmit={handleRestockSubmit}>
                            <div className="mb-4">
                                <label className="text-dim text-sm block mb-2">Quantity to Add</label>
                                <input
                                    type="number"
                                    className="input-glass"
                                    autoFocus
                                    min="1"
                                    required
                                    value={restockQty}
                                    onChange={(e) => setRestockQty(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setRestockItem(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Update Stock
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
                    <p className="text-dim">Track your stock levels</p>
                </div>
                <button
                    className={`btn ${showAddForm ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    <Plus size={18} className={showAddForm ? 'rotate-45' : ''} />
                    {showAddForm ? 'Cancel' : 'Add New Part'}
                </button>
            </div>

            {showAddForm && (
                <div className="glass-panel p-6 mb-6 animate-fade-in">
                    <h3 className="text-xl font-bold mb-4 text-white">Add New Part</h3>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-dim text-sm">Part Name</label>
                            <input
                                type="text"
                                className="input-glass"
                                required
                                value={newProduct.name}
                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                placeholder="e.g. Brake Pads"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-dim text-sm">Category</label>
                            <input
                                type="text"
                                className="input-glass"
                                list="categories"
                                required
                                value={newProduct.category}
                                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                placeholder="Select or type category"
                            />
                            <datalist id="categories">
                                <option value="Brakes" />
                                <option value="Engine" />
                                <option value="Lights" />
                                <option value="Accessories" />
                                <option value="Electrical" />
                            </datalist>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-dim text-sm">Initial Stock</label>
                            <input
                                type="number"
                                className="input-glass"
                                required
                                min="0"
                                value={newProduct.stock}
                                onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-dim text-sm">Price per Unit (₹)</label>
                            <input
                                type="number"
                                className="input-glass"
                                required
                                min="0"
                                step="0.01"
                                value={newProduct.price}
                                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 mt-4 flex justify-end">
                            <button type="submit" className="btn btn-primary">
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-panel p-4 mb-6 flex justify-between gap-4">
                <div className="search-bar w-full max-w-md">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search parts by name or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-secondary">
                    <Filter size={18} /> Filter
                </button>
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Stock Level</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map((item) => (
                                <tr key={item.id}>
                                    <td className="font-medium text-white">{item.name}</td>
                                    <td><span className="text-dim bg-slate-800 px-2 py-1 rounded text-xs">{item.category}</span></td>
                                    <td className={item.stock < 10 ? 'text-red-400 font-bold' : 'text-green-400'}>
                                        {item.stock} units
                                    </td>
                                    <td className="font-medium text-white">₹{item.price.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${item.stock === 0 ? 'badge-danger' :
                                            (item.stock < 10 ? 'badge-warning' : 'badge-success')
                                            }`}>
                                            {item.stock === 0 ? 'Out of Stock' : (item.stock < 10 ? 'Low Stock' : 'In Stock')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn-xs btn-primary"
                                                title="Add Stock"
                                                onClick={() => setRestockItem(item)}
                                            >
                                                <Plus size={14} /> Stock In
                                            </button>
                                            <button
                                                className="icon-btn text-blue-400 hover:bg-blue-500/20"
                                                onClick={() => handleEditClick(item)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="icon-btn text-red-400 hover:bg-red-500/20"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredInventory.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center text-dim p-6">
                                        No parts found. Try adding one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
