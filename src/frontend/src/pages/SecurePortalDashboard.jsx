import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Package, DollarSign, TrendingUp, LogOut, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SecurePortalDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user] = useState(() => JSON.parse(localStorage.getItem('secure_user') || 'null'));
    const token = localStorage.getItem('secure_token');

    useEffect(() => {
        if (!user || !token) {
            navigate('/secure-portal/login');
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await fetch('/api/secure-portal/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                } else if (res.status === 403) {
                    navigate('/secure-portal/login');
                }
            } catch (err) {
                console.error("Secure portal error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, token, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('secure_token');
        localStorage.removeItem('secure_user');
        navigate('/secure-portal/login');
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="text-coral font-bold flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 animate-pulse" />
                    Verifying 2FA credentials...
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-red-400 font-bold">Access denied. 2FA verification required.</div>
                    <Link to="/secure-portal/login" className="text-coral underline text-sm">
                        Go to Secure Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 py-12 max-w-7xl">
            {/* Security Banner */}
            <div className="bg-coral/10 border border-coral/20 rounded-2xl py-3 px-6 mb-12 flex items-center justify-center gap-2 text-coral text-sm font-bold">
                <Lock className="w-4 h-4" />
                <span>SECURE SESSION - 2FA VERIFIED</span>
                <span className="mx-2 opacity-30">|</span>
                <span>User: {user?.username}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-coral font-black uppercase tracking-[0.3em] text-sm">
                        <ShieldCheck className="w-5 h-5" /> Secure Portal
                    </div>
                    <h1 className="text-5xl font-black text-hive-text uppercase tracking-tighter leading-none">
                        Protected Dashboard
                    </h1>
                </div>

                <div className="flex gap-4">
                    <Link
                        to="/admin"
                        className="flex items-center gap-2 bg-hive-medium/50 border border-hive-border/20 text-hive-muted px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-hive-medium transition-all"
                    >
                        Standard Admin
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-500/20 transition-all"
                    >
                        <LogOut className="w-4 h-4" /> End Session
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {[
                    { label: 'Colony Members', val: stats.counters.users, icon: Users, color: 'text-coral' },
                    { label: 'Total Orders', val: stats.counters.orders, icon: TrendingUp, color: 'text-blue-400' },
                    { label: 'Revenue', val: `$${stats.counters.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-yellow-400' },
                    { label: 'Products', val: stats.counters.products, icon: Package, color: 'text-purple-400' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-hive-medium/40 backdrop-blur border border-hive-border/20 p-8 rounded-3xl hover:-translate-y-1 transition-all">
                        <div className={`w-12 h-12 bg-hive-light/10 ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-hive-subtle mb-1">{item.label}</div>
                        <div className="text-3xl font-black text-hive-text">{item.val}</div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            {stats.recent_orders && stats.recent_orders.length > 0 && (
                <div className="bg-hive-medium/40 backdrop-blur border border-hive-border/20 rounded-3xl p-8 mb-16">
                    <h2 className="text-xl font-black text-hive-text uppercase tracking-tight mb-6">Recent Orders</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[10px] font-black uppercase tracking-widest text-hive-subtle border-b border-hive-border/20">
                                    <th className="pb-4">Order ID</th>
                                    <th className="pb-4">Total</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hive-border/10">
                                {stats.recent_orders.map((order) => (
                                    <tr key={order.id} className="text-hive-text">
                                        <td className="py-4 font-mono text-coral">#{order.id}</td>
                                        <td className="py-4">${order.total.toFixed(2)}</td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                                                order.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-hive-muted text-sm">
                                            {new Date(order.date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Link
                    to="/admin/users"
                    className="bg-hive-medium/40 backdrop-blur border border-hive-border/20 p-8 rounded-3xl hover:border-coral/30 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <Users className="w-10 h-10 text-coral group-hover:scale-110 transition-transform" />
                        <div>
                            <div className="font-black text-hive-text uppercase tracking-tight text-xl">User Management</div>
                            <div className="text-xs text-hive-subtle">View and manage colony members</div>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/admin/products"
                    className="bg-hive-medium/40 backdrop-blur border border-hive-border/20 p-8 rounded-3xl hover:border-coral/30 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <Package className="w-10 h-10 text-coral group-hover:scale-110 transition-transform" />
                        <div>
                            <div className="font-black text-hive-text uppercase tracking-tight text-xl">Product Inventory</div>
                            <div className="text-xs text-hive-subtle">Manage specimens</div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Security Notice */}
            <div className="mt-16 bg-coral/5 border border-coral/20 rounded-3xl p-8">
                <div className="flex items-center gap-3 text-coral mb-4">
                    <ShieldCheck className="w-6 h-6" />
                    <span className="font-black uppercase tracking-widest text-sm">Security Level: Maximum</span>
                </div>
                <p className="text-hive-muted text-sm">
                    This session is protected by two-factor authentication. All actions are logged and audited.
                    Your session will expire after 24 hours of inactivity.
                </p>
            </div>
        </div>
    );
};

export default SecurePortalDashboard;
