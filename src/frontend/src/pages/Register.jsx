import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const validate = () => {
        if (formData.password !== formData.confirmPassword) return "Passwords do not match in our colony.";
        if (formData.password.length < 6) return "Password must be at least 6 characters (strength protocol).";
        if (!formData.email.includes('@')) return "Invalid email address detected.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const valError = validate();
        if (valError) {
            setError(valError);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    name: formData.name
                })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/');
            } else {
                setError(data.detail || "Registration failed. The swarm rejected the new member.");
            }
        } catch (err) {
            setError("Communication failure with the hive.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-hive-deep/80">
            <div className="w-full max-w-md bg-hive-medium/60 backdrop-blur-xl rounded-3xl p-10 shadow-card border border-hive-border/40 relative overflow-hidden">
                {/* Abstract design elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-coral/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-coral/10 rounded-full -ml-12 -mb-12"></div>

                <div className="relative">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-coral rounded-2xl text-white">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black text-hive-text uppercase tracking-tight">Join the Swarm</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-hive-subtle group-focus-within:text-coral transition-colors" />
                            <input
                                type="text" name="name" placeholder="Display Name" required
                                onChange={handleChange} value={formData.name}
                                className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 transition-all font-medium text-hive-text placeholder:text-hive-subtle"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-hive-subtle group-focus-within:text-coral transition-colors flex items-center justify-center font-black text-xs">@</div>
                            <input
                                type="text" name="username" placeholder="Unique Username" required
                                onChange={handleChange} value={formData.username}
                                className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 transition-all font-medium text-hive-text placeholder:text-hive-subtle"
                            />
                        </div>

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-hive-subtle group-focus-within:text-coral transition-colors" />
                            <input
                                type="email" name="email" placeholder="Email Address" required
                                onChange={handleChange} value={formData.email}
                                className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 transition-all font-medium text-hive-text placeholder:text-hive-subtle"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-hive-subtle group-focus-within:text-coral transition-colors" />
                            <input
                                type="password" name="password" placeholder="Password (Min 6 chars)" required
                                onChange={handleChange} value={formData.password}
                                className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 transition-all font-medium text-hive-text placeholder:text-hive-subtle"
                            />
                        </div>

                        <div className="relative group">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-hive-subtle group-focus-within:text-coral transition-colors" />
                            <input
                                type="password" name="confirmPassword" placeholder="Confirm Password" required
                                onChange={handleChange} value={formData.confirmPassword}
                                className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 transition-all font-medium text-hive-text placeholder:text-hive-subtle"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-xs font-bold border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-coral text-white py-5 rounded-2xl font-black text-lg hover:bg-coral-hover shadow-card transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        >
                            {loading ? "Initializing..." : "Register Now"} <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <div className="mt-8 text-center space-y-3">
                        <p className="text-sm text-hive-subtle font-medium">
                            Already a member? <Link to="/login" className="text-coral font-bold hover:underline">Sign In to the Hive</Link>
                        </p>
                        <p className="text-[10px] text-hive-subtle/60 font-bold uppercase tracking-widest">
                            A <a href="https://bugtraceai.com" target="_blank" rel="noopener noreferrer" className="text-coral/60 hover:text-coral transition-colors">BugTraceAI</a> Security Playground
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
