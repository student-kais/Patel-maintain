import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const InventoryContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
    const [inventory, setInventory] = useState(() => {
        try {
            const saved = localStorage.getItem('inventory');
            return saved ? JSON.parse(saved) : [
                { id: 1, name: 'Brake Pads (Front)', category: 'Brakes', stock: 45, price: 1200, status: 'In Stock' },
                { id: 2, name: 'Oil Filter', category: 'Engine', stock: 12, price: 350, status: 'Low Stock' },
                { id: 3, name: 'Headlight Bulb H4', category: 'Lights', stock: 8, price: 250, status: 'Low Stock' },
                { id: 4, name: 'Wiper Blades', category: 'Accessories', stock: 22, price: 600, status: 'In Stock' },
                { id: 5, name: 'Battery 12V', category: 'Electrical', stock: 0, price: 4500, status: 'Out of Stock' },
            ];
        } catch {
            console.error("Failed to parse inventory");
            return [];
        }
    });

    const [services, setServices] = useState(() => {
        try {
            const saved = localStorage.getItem('services');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [invoices, setInvoices] = useState(() => {
        try {
            const saved = localStorage.getItem('invoices');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [shopDetails, setShopDetails] = useState(() => {
        try {
            const saved = localStorage.getItem('shopDetails');
            return saved ? JSON.parse(saved) : {
                name: 'Patel Auto Parts and Accessories',
                subline: 'Auto Rickshaw & Three-Wheeler Specialist',
                address: 'Mo: 9724679050, 8401855782',
                investment: 1000000,
                gst: ''
            };
        } catch {
            return {
                name: 'Patel Auto Parts and Accessories',
                investment: 1000000
            };
        }
    });

    useEffect(() => {
        localStorage.setItem('inventory', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem('invoices', JSON.stringify(invoices));
    }, [invoices]);

    useEffect(() => {
        localStorage.setItem('services', JSON.stringify(services));
    }, [services]);

    useEffect(() => {
        localStorage.setItem('shopDetails', JSON.stringify(shopDetails));
    }, [shopDetails]);

    const addProduct = useCallback((product) => {
        setInventory(prev => [...prev, { ...product, id: Date.now() }]);
    }, []);

    const updateStock = useCallback((id, quantity) => {
        setInventory(prevInventory => prevInventory.map(item => {
            if (item.id === id) {
                const newStock = Math.max(0, item.stock + quantity);
                const newStatus = newStock === 0 ? 'Out of Stock' : (newStock < 10 ? 'Low Stock' : 'In Stock');
                return { ...item, stock: newStock, status: newStatus };
            }
            return item;
        }));
    }, []);

    const deleteProduct = useCallback((id) => {
        setInventory(prev => prev.filter(item => item.id !== id));
    }, []);

    const updateProduct = useCallback((id, updatedData) => {
        setInventory(prev => prev.map(item => {
            if (item.id === id) {
                const newStock = Number(updatedData.stock);
                const newStatus = newStock === 0 ? 'Out of Stock' : (newStock < 10 ? 'Low Stock' : 'In Stock');
                return { ...item, ...updatedData, stock: newStock, status: newStatus };
            }
            return item;
        }));
    }, []);

    const addJobCard = useCallback((jobCard) => {
        const newJob = {
            ...jobCard,
            id: `JOB-${Date.now()}`,
            entryDate: new Date().toLocaleDateString(),
            timestamp: Date.now(),
            status: 'Pending'
        };
        setServices(prev => [newJob, ...prev]);
    }, []);

    const updateJobCard = useCallback((id, updatedData) => {
        setServices(prev => prev.map(job =>
            job.id === id ? { ...job, ...updatedData } : job
        ));
    }, []);

    const deleteJobCard = useCallback((id) => {
        setServices(prev => prev.filter(job => job.id !== id));
    }, []);

    const addInvoice = useCallback((items, customerName, serviceCharge = 0, vehicleNumber = '', customerMobile = '') => {
        const itemsTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const newInvoice = {
            id: `INV-${Date.now()}`,
            customerName,
            customerMobile,
            vehicleNumber,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now(),
            items,
            serviceCharge: Number(serviceCharge),
            total: itemsTotal + Number(serviceCharge),
            status: 'Paid'
        };
        setInvoices(prev => [newInvoice, ...prev]);

        // Update stock levels
        items.forEach(invoiceItem => {
            updateStock(invoiceItem.id, -invoiceItem.quantity);
        });
    }, [updateStock]); // updateStock is a dependency here

    const getLowStockItems = useCallback(() => {
        return inventory.filter(item => item.stock < 10);
    }, [inventory]);

    const value = useMemo(() => ({
        inventory,
        services,
        invoices,
        shopDetails,
        setShopDetails,
        setInventory,
        setServices,
        setInvoices,
        addInvoice,
        addProduct,
        updateStock,
        deleteProduct,
        updateProduct,
        addJobCard,
        updateJobCard,
        deleteJobCard,
        getLowStockItems
    }), [inventory, services, invoices, shopDetails, addInvoice, addProduct, updateStock, deleteProduct, updateProduct, addJobCard, updateJobCard, deleteJobCard, getLowStockItems]);

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
};
