import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, User, Lock, ArrowRight, Bug } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/');
            } else {
                setError(data.detail || "Access denied. Are you a registered member of the colony?");
            }
        } catch (err) {
            setError("The hive communication channel is blocked.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-hive-deep/80">
            <div className="w-full max-w-md bg-hive-medium/60 backdrop-blur-xl rounded-3xl p-10 shadow-card border border-hive-border/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-hive-deep via-hive-medium to-coral/20"></div>

                <div className="relative text-center mb-10">
                    <div className="w-20 h-20 bg-coral rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-card shadow-coral/20 rotate-12">
                        <Bug className="w-10 h-10 text-white -rotate-12" />
                    </div>
                    <h1 className="text-3xl font-black text-hive-text uppercase tracking-tight">Hive Access</h1>
                    <p className="text-hive-muted font-medium mt-2 italic">Enter your credentials to manage your colony.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-hive-subtle group-focus-within:text-coral transition-colors" />
                        <input
                            type="text" name="username" placeholder="Username" required
                            onChange={handleChange} value={formData.username}
                            className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 transition-all font-medium text-hive-text placeholder:text-hive-subtle"
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-hive-subtle group-focus-within:text-coral transition-colors" />
                        <input
                            type="password" name="password" placeholder="Password" required
                            onChange={handleChange} value={formData.password}
                            className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 transition-all font-medium text-hive-text placeholder:text-hive-subtle"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-xs font-bold border border-red-500/20 flex items-center gap-2">
                            <span className="text-lg">⚠️</span> {error}
                        </div>
                    )}

                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-coral text-white py-5 rounded-2xl font-black text-lg hover:bg-coral-hover shadow-card transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? "Authenticating..." : "Sign In"} <ArrowRight className="w-5 h-5" />
                    </button>
                </form>

                <div className="mt-10 text-center space-y-4">
                    <p className="text-sm text-hive-subtle font-medium">
                        New to the habitat? <Link to="/register" className="text-coral font-bold hover:underline">Register your territory</Link>
                    </p>
                    <div className="pt-4 border-t border-hive-border/40 space-y-3">
                        <Link to="/" className="block text-[10px] text-hive-subtle uppercase font-black tracking-widest hover:text-coral transition-colors">
                            Continue as Guest
                        </Link>
                        <a href="https://bugtraceai.com" target="_blank" rel="noopener noreferrer" className="block text-[10px] text-hive-subtle uppercase font-black tracking-widest hover:text-coral transition-colors">
                            Powered by BugTraceAI
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
