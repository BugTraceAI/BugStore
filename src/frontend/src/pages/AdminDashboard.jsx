import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, ShoppingBag, DollarSign, Package, ExternalLink, ShieldAlert, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
            navigate('/login');
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                } else {
                    console.error("Failed to fetch admin stats");
                }
            } catch (err) {
                console.error("Admin dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, navigate]);

    if (loading) return <div className="p-20 text-center font-sans text-hive-text">Accessing high-privilege sectors...</div>;
    if (!stats) return <div className="p-20 text-center text-red-400 font-bold">Unauthorized access detected in the hive core.</div>;

    return (
        <div className="container mx-auto p-4 py-12 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-coral font-black uppercase tracking-[0.3em] text-sm italic">
                        <LayoutDashboard className="w-5 h-5" /> Hive Core Command
                    </div>
                    <h1 className="text-6xl font-black text-hive-text uppercase tracking-tighter leading-none">Swarm <br /> Dashboard</h1>
                </div>

                <div className="bg-hive-deep/80 p-4 rounded-3xl border border-hive-border/40 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-coral flex items-center justify-center text-white font-black">
                        {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-hive-subtle uppercase tracking-widest leading-none mb-1">Active Commander</div>
                        <div className="text-hive-text font-bold leading-none">{user.username} ({user.role})</div>
                    </div>
                </div>
            </div>

            {/* Counter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {[
                    { label: 'Colony Members', val: stats.counters.users, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Total Deployments', val: stats.counters.orders, icon: ShoppingBag, color: 'text-coral', bg: 'bg-coral/10' },
                    { label: 'Bee Revenue', val: `$${stats.counters.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Active Specimens', val: stats.counters.products, icon: Package, color: 'text-hive-muted', bg: 'bg-hive-light/20' }
                ].map((item, idx) => (
                    <div key={idx} className="glass-card p-8 rounded-3xl group hover:-translate-y-2 transition-all">
                        <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-hive-subtle mb-1">{item.label}</div>
                        <div className="text-3xl font-black text-hive-text">{item.val}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Recent Orders */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-black text-hive-text uppercase tracking-tight flex items-center gap-3">
                            <TrendingUp className="w-5 h-5" /> Recent Deployments
                        </h3>
                        <Link to="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-hive-muted hover:text-coral transition-colors flex items-center gap-1">
                            View All <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="glass-card rounded-3xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-hive-light/20 text-[10px] font-black uppercase tracking-widest text-hive-muted">
                                    <th className="px-8 py-5">Order ID</th>
                                    <th className="px-8 py-5">Total</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hive-border/30">
                                {stats.recent_orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-hive-light/10 transition-colors">
                                        <td className="px-8 py-5 font-bold text-hive-text">#{order.id}</td>
                                        <td className="px-8 py-5 font-black text-hive-text">${order.total.toFixed(2)}</td>
                                        <td className="px-8 py-5">
                                            <span className="bg-hive-light/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter text-hive-muted">
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-hive-subtle text-xs font-medium">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-hive-text hover:text-coral transition-colors">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Links / Maintenance */}
                <div className="space-y-8">
                    <h3 className="text-xl font-black text-hive-text uppercase tracking-tight flex items-center gap-3 mb-2 underline skew-x-[-12deg]">
                        Maintenance Sector
                    </h3>

                    <div className="space-y-4">
                        <Link to="/admin/users" className="block p-6 glass-card rounded-3xl border border-hive-border/40 hover:border-coral/60 transition-all group">
                            <div className="flex items-center gap-4">
                                <Users className="w-8 h-8 text-coral group-hover:rotate-12 transition-transform" />
                                <div>
                                    <div className="font-black text-hive-text uppercase tracking-tight">Colony Management</div>
                                    <div className="text-[10px] font-bold text-hive-subtle">Manage all inhabitant data</div>
                                </div>
                            </div>
                        </Link>

                        <Link to="/admin/products" className="block p-6 glass-card rounded-3xl border border-hive-border/40 hover:border-coral/60 transition-all group">
                            <div className="flex items-center gap-4">
                                <Package className="w-8 h-8 text-coral group-hover:rotate-12 transition-transform" />
                                <div>
                                    <div className="font-black text-hive-text uppercase tracking-tight">Specimen Inventory</div>
                                    <div className="text-[10px] font-bold text-hive-subtle">Add or retire colony bugs</div>
                                </div>
                            </div>
                        </Link>

                        <div className="p-8 bg-red-500/10 rounded-3xl border border-red-500/20 mt-12">
                            <div className="flex items-center gap-3 text-red-400 mb-4">
                                <ShieldAlert className="w-6 h-6 animate-pulse" />
                                <span className="font-black uppercase tracking-widest text-xs">Security Advisory</span>
                            </div>
                            <p className="text-xs text-red-300 font-medium leading-relaxed opacity-70">
                                Warning: Debug endpoints currently exposed in sector 7-A (V-012). Maintain low observability metrics during maintenance.
                            </p>
                            <a href="/api/admin/vulnerable-debug-stats" target="_blank" className="mt-6 inline-block text-[9px] font-black uppercase tracking-[0.2em] text-red-400 underline">
                                Leak Investigation Access
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
