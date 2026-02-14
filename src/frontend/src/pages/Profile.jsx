import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Edit3, Camera, Save, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        avatar_url: ''
    });

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await fetch('/api/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setFormData({
                    name: data.name || '',
                    bio: data.bio || '',
                    avatar_url: data.avatar_url || ''
                });
            } else {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsEditing(false);
                fetchProfile();
            }
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    if (loading) return <div className="p-20 text-center font-sans text-hive-text">Scanning colony member...</div>;
    if (!profile) return null;

    return (
        <div className="container mx-auto p-4 py-12 max-w-4xl">
            <div className="bg-hive-medium/60 backdrop-blur-xl rounded-3xl shadow-card border border-hive-border/40 overflow-hidden">
                {/* Profile Header Background */}
                <div className="h-48 bg-gradient-to-br from-hive-deep via-hive-medium to-coral/20 relative">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                </div>

                <div className="px-8 md:px-12 pb-12 relative">
                    {/* Avatar positioning */}
                    <div className="flex flex-col md:flex-row items-end gap-6 -mt-16 mb-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-hive-deep border-4 border-hive-border/40 shadow-card overflow-hidden">
                                <img
                                    src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                                    alt={profile.username}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {isEditing && (
                                <button className="absolute bottom-0 right-0 p-2 bg-hive-medium/60 rounded-xl shadow-lg border border-hive-border/40 hover:text-coral transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="grow pb-2">
                            <h1 className="text-3xl font-black text-hive-text flex items-center gap-3">
                                {profile.name || profile.username}
                                <span className="text-xs bg-hive-light/40 px-3 py-1 rounded-full text-hive-muted uppercase tracking-widest font-black">{profile.role}</span>
                            </h1>
                            <p className="text-hive-muted font-bold">@{profile.username}</p>
                        </div>

                        <div className="flex gap-2 pb-2">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-hive-light/40 text-hive-text px-6 py-2 rounded-xl font-bold hover:bg-coral hover:text-white transition-all flex items-center gap-2"
                                >
                                    <Edit3 className="w-4 h-4" /> Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-50 text-red-500 px-6 py-2 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8 border-t border-hive-border/40">
                        {/* Sidebar Stats */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-hive-muted font-bold text-sm">
                                <Mail className="w-4 h-4" /> {profile.email}
                            </div>
                            <div className="flex items-center gap-3 text-hive-muted font-bold text-sm">
                                <Calendar className="w-4 h-4" /> Joined {new Date(profile.created_at).toLocaleDateString()}
                            </div>
                            <div className="pt-6">
                                <button
                                    onClick={handleLogout}
                                    className="text-hive-subtle hover:text-red-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
                                >
                                    Terminate Session <LogOut className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="md:col-span-2">
                            {isEditing ? (
                                <form onSubmit={handleUpdate} className="space-y-6 animate-in fade-in duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-hive-muted">Display Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 text-hive-text placeholder:text-hive-subtle"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-hive-muted">Bio (The Hive Story)</label>
                                        <textarea
                                            rows="4"
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 resize-none text-hive-text placeholder:text-hive-subtle"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-hive-muted">Avatar URL</label>
                                        <input
                                            type="text"
                                            value={formData.avatar_url}
                                            onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                            className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 font-mono text-xs text-hive-text placeholder:text-hive-subtle"
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button type="submit" className="grow bg-coral text-white py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2">
                                            <Save className="w-5 h-5" /> Save Colony Data
                                        </button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="bg-hive-light/40 text-hive-muted px-8 py-4 rounded-2xl font-bold">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="space-y-4">
                                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-hive-muted">About this Member:</h3>
                                        <p className="text-hive-text/80 leading-relaxed text-lg whitespace-pre-line bg-hive-light/20 p-6 rounded-3xl italic">
                                            {profile.bio || "No colony bio provided yet. Every bug has its secrets."}
                                        </p>
                                    </div>

                                    <div className="bg-hive-light/20 rounded-3xl p-6 border border-hive-border/40 border-dashed flex items-center gap-4">
                                        <Shield className="w-10 h-10 text-coral opacity-30" />
                                        <div>
                                            <h4 className="font-black text-hive-text text-sm">Security Clearance</h4>
                                            <p className="text-[10px] text-hive-muted font-medium">Verified inhabitant of The Hive. JWT Protocol active.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
