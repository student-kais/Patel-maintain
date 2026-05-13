import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Plus, Search, Trash2, FileText, CheckCircle, Clock, AlertTriangle, PenTool, Calendar, LayoutDashboard } from 'lucide-react';
import '../index.css';



const Services = () => {
    const { services, addJobCard, updateJobCard, deleteJobCard } = useInventory();
    const [showJobForm, setShowJobForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [historyTimeframe, setHistoryTimeframe] = useState('all');

    // New Job Card State
    const [newJob, setNewJob] = useState({
        customerName: '',
        mobile: '',
        vehicleModel: '',
        vehicleNumber: '',
        issues: ''
    });

    // Helper to check date range
    const isInTimeframe = (timestamp, timeframe) => {
        if (!timestamp) return true;
        const now = new Date();
        const date = new Date(timestamp);

        switch (timeframe) {
            case 'today':
                return date.toDateString() === now.toDateString();
            case 'week': {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return date >= oneWeekAgo;
            }
            case 'month': {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(now.getMonth() - 1);
                return date >= oneMonthAgo;
            }
            default:
                return true;
        }
    };

    // Stats calculations
    const stats = useMemo(() => {
        const now = new Date();
        const todayStr = now.toDateString();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);

        return services.reduce((acc, job) => {
            const jobDate = job.timestamp ? new Date(job.timestamp) : new Date(job.entryDate);

            if (jobDate.toDateString() === todayStr) acc.today++;
            if (jobDate >= oneWeekAgo) acc.week++;
            if (jobDate >= oneMonthAgo) acc.month++;
            return acc;
        }, { today: 0, week: 0, month: 0 });
    }, [services]);

    const filteredServices = services.filter(service => {
        const matchesSearch = service.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTimeframe = isInTimeframe(service.timestamp, historyTimeframe);

        return matchesSearch && matchesTimeframe;
    }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const handleCreateJob = (e) => {
        e.preventDefault();
        addJobCard(newJob);
        setNewJob({ customerName: '', mobile: '', vehicleModel: '', vehicleNumber: '', issues: '' });
        setShowJobForm(false);
    };

    const handleStatusChange = (id, newStatus) => {
        updateJobCard(id, { status: newStatus });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this job card?')) {
            deleteJobCard(id);
        }
    };

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Garage Job Cards</h1>
                    <p className="text-dim">Manage service requests and vehicle issues</p>
                </div>
                <button
                    className={`btn ${showJobForm ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => setShowJobForm(!showJobForm)}
                >
                    <Plus size={18} className={showJobForm ? 'rotate-45' : ''} />
                    {showJobForm ? 'Cancel' : 'New Job Card'}
                </button>
            </div>

            {/* Timeframe Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="glass-panel p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-dim text-xs uppercase tracking-wider font-semibold">Today's Jobs</p>
                        <h3 className="text-2xl font-bold text-white">{stats.today}</h3>
                    </div>
                </div>
                <div className="glass-panel p-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-dim text-xs uppercase tracking-wider font-semibold">Weekly Jobs</p>
                        <h3 className="text-2xl font-bold text-white">{stats.week}</h3>
                    </div>
                </div>
                <div className="glass-panel p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                        <LayoutDashboard size={24} />
                    </div>
                    <div>
                        <p className="text-dim text-xs uppercase tracking-wider font-semibold">Monthly Jobs</p>
                        <h3 className="text-2xl font-bold text-white">{stats.month}</h3>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-4 w-full max-w-md">
                    <Search className="text-dim" size={20} />
                    <input
                        type="text"
                        className="bg-transparent border-none outline-none text-white w-full"
                        placeholder="Search job cards..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    {['all', 'today', 'week', 'month'].map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setHistoryTimeframe(tf)}
                            className={`px-4 py-1.5 rounded-md text-sm transition-all capitalize ${historyTimeframe === tf
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-dim hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            {showJobForm && (
                <div className="glass-panel p-6 mb-6 animate-fade-in">
                    <h3 className="text-xl font-bold mb-4 text-white">Create New Job Card</h3>
                    <form onSubmit={handleCreateJob} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1">
                            <label className="text-dim text-sm block mb-1">Customer Name</label>
                            <input
                                type="text"
                                className="input-glass"
                                required
                                value={newJob.customerName}
                                onChange={e => setNewJob({ ...newJob, customerName: e.target.value })}
                                placeholder="e.g. Rahul Kumar"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-dim text-sm block mb-1">Mobile Number</label>
                            <input
                                type="tel"
                                className="input-glass"
                                value={newJob.mobile}
                                onChange={e => setNewJob({ ...newJob, mobile: e.target.value })}
                                placeholder="e.g. 9876543210"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-dim text-sm block mb-1">Vehicle Model</label>
                            <input
                                type="text"
                                className="input-glass"
                                required
                                value={newJob.vehicleModel}
                                onChange={e => setNewJob({ ...newJob, vehicleModel: e.target.value })}
                                placeholder="e.g. Honda City"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-dim text-sm block mb-1">Vehicle Number</label>
                            <input
                                type="text"
                                className="input-glass"
                                required
                                value={newJob.vehicleNumber}
                                onChange={e => setNewJob({ ...newJob, vehicleNumber: e.target.value })}
                                placeholder="e.g. GJ-01-AB-1234"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-dim text-sm block mb-1">Reported Issues / Demands</label>
                            <textarea
                                className="input-glass h-24 resize-none"
                                required
                                value={newJob.issues}
                                onChange={e => setNewJob({ ...newJob, issues: e.target.value })}
                                placeholder="List the issues (e.g. Oil Change, Brake Noise, General Service)"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button type="submit" className="btn btn-primary">
                                Create Job Card
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Kanban / List Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pending Column */}
                <div className="glass-panel p-4 h-full">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="text-yellow-400" size={20} /> Pending
                    </h3>
                    <div className="space-y-4">
                        {filteredServices.filter(s => s.status === 'Pending').map(job => (
                            <ServiceCard key={job.id} job={job} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                        ))}
                        {filteredServices.filter(s => s.status === 'Pending').length === 0 && (
                            <p className="text-dim text-sm text-center py-4">No pending jobs.</p>
                        )}
                    </div>
                </div>

                {/* In Progress Column */}
                <div className="glass-panel p-4 h-full">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <PenTool className="text-blue-400" size={20} /> In Progress
                    </h3>
                    <div className="space-y-4">
                        {filteredServices.filter(s => s.status === 'In Progress').map(job => (
                            <ServiceCard key={job.id} job={job} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                        ))}
                        {filteredServices.filter(s => s.status === 'In Progress').length === 0 && (
                            <p className="text-dim text-sm text-center py-4">No jobs in progress.</p>
                        )}
                    </div>
                </div>

                {/* Completed Column */}
                <div className="glass-panel p-4 h-full">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="text-green-400" size={20} /> Completed
                    </h3>
                    <div className="space-y-4">
                        {filteredServices.filter(s => s.status === 'Completed').map(job => (
                            <ServiceCard key={job.id} job={job} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                        ))}
                        {filteredServices.filter(s => s.status === 'Completed').length === 0 && (
                            <p className="text-dim text-sm text-center py-4">No completed jobs yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ServiceCard = ({ job, onStatusChange, onDelete }) => (
    <div className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all">
        <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-white">{job.vehicleModel}</h4>
            <span className="text-xs text-dim bg-white/10 px-2 py-1 rounded">{job.vehicleNumber}</span>
        </div>
        <p className="text-sm text-white mb-1">{job.customerName}</p>
        <div className="bg-black/20 p-2 rounded text-xs text-dim mb-3">
            <p className="font-medium text-white/70 mb-1">Demands / Issues:</p>
            {job.issues}
        </div>

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
            <div className="text-xs text-dim">{job.entryDate}</div>
            <div className="flex gap-2">
                {job.status === 'Pending' && (
                    <button
                        onClick={() => onStatusChange(job.id, 'In Progress')}
                        className="btn-xs btn-primary bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30"
                    >
                        Start
                    </button>
                )}
                {job.status === 'In Progress' && (
                    <button
                        onClick={() => onStatusChange(job.id, 'Completed')}
                        className="btn-xs btn-success bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30"
                    >
                        Done
                    </button>
                )}
                <button
                    onClick={() => onDelete(job.id)}
                    className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    </div>
);

export default Services;
