import React, { useMemo, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import {
    BarChart3,
    TrendingUp,
    ShoppingBag,
    Wrench,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Calendar,
    Filter
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';

const Reports = () => {
    const { inventory, invoices, services, shopDetails } = useInventory();
    const [filterTime, setFilterTime] = useState('month');

    // --- Data Calculations ---

    const stats = useMemo(() => {
        const now = new Date();
        const investment = shopDetails?.investment || 1000000;

        const filteredInvoices = invoices.filter(inv => {
            const date = inv.timestamp ? new Date(inv.timestamp) : new Date(inv.date);
            if (filterTime === 'today') return date.toDateString() === now.toDateString();
            if (filterTime === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                return date >= weekAgo;
            }
            if (filterTime === 'month') {
                const monthAgo = new Date();
                monthAgo.setMonth(now.getMonth() - 1);
                return date >= monthAgo;
            }
            return true;
        });

        const revenue = filteredInvoices.reduce((acc, inv) => acc + inv.total, 0);
        const itemSales = filteredInvoices.reduce((acc, inv) => acc + inv.items.reduce((sum, i) => sum + i.quantity, 0), 0);
        const serviceIncome = filteredInvoices.reduce((acc, inv) => acc + (inv.serviceCharge || 0), 0);

        const completedServices = services.filter(s => s.status === 'Completed').length;
        const totalStockValue = inventory.reduce((total, item) => total + (item.price * item.stock), 0);

        return {
            revenue,
            itemSales,
            serviceIncome,
            completedServices,
            totalStockValue,
            investment,
            roi: ((revenue / investment) * 100).toFixed(1)
        };
    }, [invoices, services, inventory, shopDetails, filterTime]);

    // Data for Category breakdown
    const categoryData = useMemo(() => {
        const cats = {};
        inventory.forEach(item => {
            cats[item.category] = (cats[item.category] || 0) + (item.stock * item.price);
        });
        return Object.keys(cats).map(name => ({ name, value: cats[name] }));
    }, [inventory]);

    // Data for Sales Trend
    const salesTrend = useMemo(() => {
        const last7Days = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const amt = invoices
                .filter(inv => {
                    const invDate = inv.timestamp ? new Date(inv.timestamp) : new Date(inv.date);
                    return invDate.toDateString() === d.toDateString();
                })
                .reduce((acc, inv) => acc + inv.total, 0);
            last7Days.push({ name: days[d.getDay()], amount: amt });
        }
        return last7Days;
    }, [invoices]);

    const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Business Reports</h1>
                    <p className="text-dim mt-1">Deep insights into your shop's financial performance</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shadow-2xl">
                    {['today', 'week', 'month', 'all'].map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setFilterTime(tf)}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filterTime === tf
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-dim hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tf === 'all' ? 'All Time' : tf}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <ReportStat
                    title="Total Revenue"
                    value={`₹${stats.revenue.toLocaleString()}`}
                    icon={TrendingUp}
                    color="text-green-400"
                    bg="bg-green-400/10"
                />
                <ReportStat
                    title="Items Sold"
                    value={stats.itemSales.toString()}
                    icon={ShoppingBag}
                    color="text-blue-400"
                    bg="bg-blue-400/10"
                />
                <ReportStat
                    title="Service Revenue"
                    value={`₹${stats.serviceIncome.toLocaleString()}`}
                    icon={Wrench}
                    color="text-purple-400"
                    bg="bg-purple-400/10"
                />
                <ReportStat
                    title="ROI Progress"
                    value={`${stats.roi}%`}
                    icon={BarChart3}
                    color="text-orange-400"
                    bg="bg-orange-400/10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 glass-panel p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Calendar size={18} className="text-blue-400" /> Weekly Sales Trend
                        </h3>
                        <div className="text-xs text-dim bg-white/5 px-3 py-1 rounded-full border border-white/10 font-mono">
                            UPDATED LIVE
                        </div>
                    </div>
                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                                    {salesTrend.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Inventory Value Breakdown */}
                <div className="glass-panel p-6 shadow-2xl flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Filter size={18} className="text-pink-400" /> Stock Value by Category
                    </h3>
                    <div className="flex-1 flex flex-col justify-center">
                        <div style={{ height: '250px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 mt-4">
                            {categoryData.map((cat, i) => (
                                <div key={cat.name} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-dim">{cat.name}</span>
                                    </div>
                                    <span className="text-white font-medium">₹{cat.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Profit Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="glass-panel p-6 border-l-4 border-l-blue-500">
                    <h4 className="text-dim text-sm uppercase font-bold tracking-widest mb-4">Financial Health</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-dim">Initial Investment</span>
                            <span className="text-white font-bold">₹{stats.investment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-white/5 rounded-lg border-b border-blue-500/30">
                            <span className="text-dim">Recovered Revenue</span>
                            <span className="text-blue-400 font-bold">₹{stats.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-dim">Current Inventory Value</span>
                            <span className="text-green-400 font-bold">₹{stats.totalStockValue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 flex flex-col justify-center items-center text-center">
                    <div className="p-4 bg-orange-500/10 rounded-full mb-4">
                        <TrendingUp size={32} className="text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Investment Recovery</h3>
                    <p className="text-dim text-sm mb-6 max-w-xs">You have recovered {stats.roi}% of your initial shop investment through sales alone.</p>
                    <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-orange-500 to-yellow-400 h-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, Number(stats.roi))}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <button className="btn btn-secondary flex items-center gap-2 px-8" onClick={() => window.print()}>
                    <Download size={18} /> Export Full Report PDF
                </button>
            </div>
        </div>
    );
};

function ReportStat(props) {
    const { title, value, color, bg } = props;
    const Icon = props.icon;
    return (
        <div className="glass-panel p-6 group hover:border-white/20 transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-dim text-xs uppercase tracking-wider font-bold mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-white">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
                <ArrowUpRight size={14} />
                <span>Live Data Tracking</span>
            </div>
        </div>
    );
}

export default Reports;
