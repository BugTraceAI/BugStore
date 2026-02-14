import React, { useState, useEffect } from 'react';
import { Users, Shield, Mail, Calendar, Search, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/admin');
            return;
        }

        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (err) {
                console.error("Admin user list error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentUser, navigate]);

    if (loading) return <div className="p-20 text-center font-sans text-hive-text">Enumerating the hive members...</div>;

    return (
        <div className="container mx-auto p-4 py-12 max-w-6xl">
            <Link to="/admin" className="group inline-flex items-center gap-2 text-hive-muted font-black uppercase tracking-widest text-xs mb-12 hover:text-coral transition-all">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to command core
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-coral font-black uppercase tracking-[0.3em] text-sm">
                        <Users className="w-5 h-5" /> Population Control
                    </div>
                    <h1 className="text-6xl font-black text-hive-text uppercase tracking-tighter leading-none">Colony <br /> Registry</h1>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-hive-subtle group-focus-within:text-coral transition-colors" />
                    <input
                        type="text"
                        placeholder="Search member name..."
                        className="input-dark border border-hive-border/40 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 w-full sm:w-64 font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {users.map((user) => (
                    <div key={user.id} className="glass-card rounded-3xl p-8 hover:-translate-y-1 transition-all">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-hive-deep flex items-center justify-center overflow-hidden border border-hive-border/40 shadow-sm">
                                <img
                                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                    alt={user.username}
                                />
                            </div>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                {user.role}
                            </span>
                        </div>

                        <div className="space-y-4 mb-8">
                            <h3 className="text-2xl font-black text-hive-text leading-none tracking-tight truncate">{user.name || user.username}</h3>
                            <p className="text-hive-subtle font-bold text-sm tracking-tight flex items-center gap-2">
                                <Shield className="w-4 h-4 opacity-30" /> @{user.username}
                            </p>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-hive-border/40">
                            <div className="flex items-center gap-3 text-xs text-hive-subtle font-medium">
                                <Mail className="w-4 h-4 opacity-40" /> {user.email}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-hive-subtle font-medium">
                                <Calendar className="w-4 h-4 opacity-40" /> Active since {new Date(user.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button className="grow bg-hive-light/40 text-hive-text font-black uppercase tracking-widest text-[9px] py-3 rounded-xl hover:bg-coral hover:text-white transition-all shadow-sm">
                                Edit Rank
                            </button>
                            <button className="grow border border-hive-border/40 text-hive-muted font-black uppercase tracking-widest text-[9px] py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all">
                                Evict
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminUsers;
