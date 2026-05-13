import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
    DollarSign,
    Package,
    Users,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    Shield
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const HealthRow = ({ label, status, level, isWarning }) => (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
        <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{label}</span>
            <span className={`text-[10px] uppercase font-bold ${isWarning ? 'text-yellow-400' : 'text-green-400'}`}>{status}</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${isWarning ? 'bg-yellow-400' : 'bg-green-400'}`} style={{ width: `${level}%` }}></div>
            </div>
            <span className="text-xs text-dim">{level}%</span>
        </div>
    </div>
);

const LogRow = ({ event, tenant, status, time, isAlert }) => (
    <tr className="border-b border-white/5">
        <td className="p-3 text-sm font-medium text-white">{event}</td>
        <td className="p-3 text-sm text-dim">{tenant}</td>
        <td className="p-3">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAlert ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                {status}
            </span>
        </td>
        <td className="p-3 text-xs text-dim">{time}</td>
    </tr>
);

const Dashboard = () => {
    const { user, isAdmin } = useAuth();
    const { inventory, services, invoices, shopDetails } = useInventory();

    // Stats calculations
    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
    const activeJobs = services.filter(s => s.status !== 'Completed').length;
    const totalStockValue = inventory.reduce((total, item) => total + (item.price * item.stock), 0);
    const lowStockCount = inventory.filter(i => i.stock < 10).length;
    const investment = shopDetails?.investment || 1000000;
    const roi = ((totalRevenue / investment) * 100).toFixed(1);

    // Recent activities (Combining invoices and services)
    const recentActivities = useMemo(() => {
        const jobs = services.slice(0, 5).map(s => ({
            id: s.id,
            type: 'service',
            title: `${s.vehicleModel} - ${s.customerName}`,
            subtitle: `Status: ${s.status}`,
            time: s.entryDate,
            timestamp: s.timestamp || 0
        }));

        const recentInvoices = invoices.slice(0, 5).map(inv => ({
            id: inv.id,
            type: 'invoice',
            title: `Payment: ₹${inv.total.toLocaleString()}`,
            subtitle: `${inv.customerName} - ${inv.id}`,
            time: inv.date,
            timestamp: inv.timestamp || 0
        }));

        return [...jobs, ...recentInvoices]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 8);
    }, [services, invoices]);

    // Mock Data for Chart (Daily revenue for last 7 days)
    const chartData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const last7Days = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dayName = days[d.getDay()];

            const dayRevenue = invoices
                .filter(inv => {
                    const invDate = inv.timestamp ? new Date(inv.timestamp) : new Date(inv.date);
                    return invDate.toDateString() === d.toDateString();
                })
                .reduce((acc, inv) => acc + inv.total, 0);

            last7Days.push({ name: dayName, revenue: dayRevenue, profit: dayRevenue * 0.3 }); // Profit estimate 30%
        }
        return last7Days;
    }, [invoices]);

    if (isAdmin) {
        return (
            <div className="dashboard-container animate-fade-in">
                <div className="header-mb">
                    <h1>SaaS System Overview</h1>
                    <p className="text-dim">Global platform monitoring and infrastructure health</p>
                </div>

                {/* Core Platform Metrics */}
                <div className="grid stats-grid mb-8">
                    <StatCard
                        title="Registered Shops"
                        value="12"
                        change="+2 this week"
                        isPositive={true}
                        icon={Users}
                    />
                    <StatCard
                        title="Platform Revenue"
                        value="₹4,85,000"
                        change="+15% growth"
                        isPositive={true}
                        icon={DollarSign}
                    />
                    <StatCard
                        title="System Uptime"
                        value="99.99%"
                        change="Stable"
                        isPositive={true}
                        icon={Activity}
                    />
                    <StatCard
                        title="Waitlist"
                        value="84"
                        change="High Demand"
                        isPositive={true}
                        icon={TrendingUp}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Live Usage Monitor */}
                    <div className="glass-panel p-6">
                        <div className="section-header">
                            <h3>Real-time Usage (API Calls)</h3>
                            <span className="badge badge-success">Live</span>
                        </div>
                        <div className="chart-container" style={{ height: '240px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                    { time: '10:00', calls: 450 },
                                    { time: '11:00', calls: 820 },
                                    { time: '12:00', calls: 610 },
                                    { time: '13:00', calls: 950 },
                                    { time: '14:00', calls: 1200 },
                                    { time: '15:00', calls: 1100 },
                                    { time: '16:00', calls: 1400 }
                                ]}>
                                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                    <Area type="monotone" dataKey="calls" stroke="#6366f1" fill="rgba(99, 102, 241, 0.1)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Infrastructure Health */}
                    <div className="glass-panel p-6">
                        <div className="section-header">
                            <h3>Infrastructure Status</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            <HealthRow label="Primary Database" status="Operational" level={98} />
                            <HealthRow label="Media Storage" status="Operational" level={92} />
                            <HealthRow label="Auth Service" status="Operational" level={100} />
                            <HealthRow label="Email Queue" status="Degraded" level={45} isWarning={true} />
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <div className="section-header">
                        <h3>Critical System Logs</h3>
                        <NavLink to="/admin/shops" className="text-blue-400 text-sm font-bold">Manage All Tenants →</NavLink>
                    </div>
                    <div className="table-container">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="p-3 text-left">Event</th>
                                    <th className="p-3 text-left">Tenant</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                <LogRow event="Shop Registration" tenant="Patel Auto" status="Success" time="2 mins ago" />
                                <LogRow event="Database Backup" tenant="Global" status="Completed" time="15 mins ago" />
                                <LogRow event="Subscription Renew" tenant="Kumar Garage" status="Success" time="1 hour ago" />
                                <LogRow event="API Limit Warning" tenant="Mumbai Spares" status="Alert" time="3 hours ago" isAlert={true} />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="header-mb">
                <h1>Dashboard Overview</h1>
                <p className="text-dim">Welcome back, {user?.name || 'Owner'}</p>
            </div>

            <div className="grid stats-grid">
                <StatCard
                    title="Total Revenue"
                    value={`₹${totalRevenue.toLocaleString()}`}
                    change={`${((totalRevenue / investment) * 100).toFixed(1)}%`}
                    isPositive={true}
                    icon={DollarSign}
                />
                <StatCard
                    title="Active Jobs"
                    value={activeJobs.toString()}
                    change={`${services.filter(s => s.status === 'Pending').length} pending`}
                    isPositive={true}
                    icon={Activity}
                />
                <StatCard
                    title="Total Investment"
                    value={`₹${investment.toLocaleString()}`}
                    change={`Stock: ₹${totalStockValue.toLocaleString()}`}
                    isPositive={true}
                    icon={TrendingUp}
                />
                <StatCard
                    title="Return on Investment (ROI)"
                    value={`${roi}%`}
                    change="Lifetime"
                    isPositive={Number(roi) > 0}
                    icon={TrendingUp}
                />
            </div>

            <div className="glass-panel charts-section">
                <div className="section-header">
                    <h3>Revenue Analytics (Last 7 Days)</h3>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 text-xs text-dim">
                            <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Revenue
                        </div>
                        <div className="flex items-center gap-2 text-xs text-dim">
                            <span className="w-3 h-3 rounded-full bg-pink-500"></span> Profit Est.
                        </div>
                    </div>
                </div>
                <div className="chart-container" style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                itemStyle={{ color: '#f1f5f9' }}
                                formatter={(value) => [`₹${value}`, "Amount"]}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" />
                            <Area type="monotone" dataKey="profit" stroke="#ec4899" fillOpacity={1} fill="url(#colorProfit)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="recent-activity-grid">
                <div className="glass-panel p-6">
                    <div className="section-header">
                        <h3>Low Stock Alerts <span className="badge badge-danger">{lowStockCount}</span></h3>
                    </div>
                    <div className="stock-list">
                        {inventory.filter(i => i.stock < 10).map(item => (
                            <div key={item.id} className="stock-item item-row">
                                <div className="info">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-dim text-xs">{item.category}</div>
                                </div>
                                <div className="stock-count danger">{item.stock} left</div>
                            </div>
                        ))}
                        {lowStockCount === 0 && <p className="text-dim p-4">Everything is well stocked!</p>}
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <div className="section-header">
                        <h3>Recent Activity</h3>
                    </div>
                    <ul className="activity-list">
                        {recentActivities.map((act) => (
                            <li key={act.id} className="activity-item">
                                <div className={`icon-circle ${act.type === 'service' ? 'primary' : 'success'}`}>
                                    {act.type === 'service' ? <Activity size={16} /> : <DollarSign size={16} />}
                                </div>
                                <div className="info">
                                    <p className="font-medium">{act.title}</p>
                                    <p className="text-dim text-xs">{act.subtitle} • {act.time}</p>
                                </div>
                            </li>
                        ))}
                        {recentActivities.length === 0 && (
                            <li className="text-dim p-4 text-center">No recent activity found</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// eslint-disable-next-line
const StatCard = ({ title, value, change, isPositive, icon: IconComponent }) => (
    <div className="glass-panel stat-card">
        <div className="card-top">
            <div>
                <p className="text-dim text-sm">{title}</p>
                <h3 className="card-value">{value}</h3>
            </div>
            <div className={`icon-box ${isPositive ? 'primary' : 'secondary'}`}>
                <IconComponent size={20} />
            </div>
        </div>
        <div className="card-bottom">
            <span className={`change-badge ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}
            </span>
            <span className="text-dim text-xs ml-2">vs last month</span>
        </div>
    </div>
);

export default Dashboard;
