import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bug, ShoppingCart, User, LogOut, Menu, X, LayoutDashboard, MessageSquare, Rss, Target } from 'lucide-react';
import { useConfig } from '../ConfigContext';

const Navbar = () => {
    const navigate = useNavigate();
    const config = useConfig();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async () => {
        try {
            const res = await fetch('/api/cart');
            if (res.ok) {
                const data = await res.json();
                setCartCount(data.items.reduce((acc, item) => acc + item.quantity, 0));
            }
        } catch (err) {
            console.error("Cart count error:", err);
        }
    };

    useEffect(() => {
        fetchCartCount();
        const interval = setInterval(fetchCartCount, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-hive-deep/80 backdrop-blur-xl border-b border-hive-border/30 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-coral rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-glow">
                            <Bug className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black text-hive-text uppercase tracking-tighter">Bug<span className="text-coral">Store</span></span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/blog" className="text-xs font-bold uppercase tracking-widest text-hive-muted hover:text-coral transition-colors flex items-center gap-2">
                            <Rss className="w-4 h-4" /> Chronicles
                        </Link>
                        <Link to="/forum" className="text-xs font-bold uppercase tracking-widest text-hive-muted hover:text-coral transition-colors flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> The Buzz
                        </Link>
                        {config.scoring_enabled && (
                            <Link to="/scoring" className="text-xs font-bold uppercase tracking-widest text-coral hover:text-coral/80 transition-colors flex items-center gap-2">
                                <Target className="w-4 h-4" /> Scoreboard
                            </Link>
                        )}

                        <div className="h-4 w-px bg-hive-border mx-2"></div>

                        <Link to="/cart" className="relative group p-2">
                            <ShoppingCart className="w-6 h-6 text-hive-muted group-hover:text-coral transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-coral text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-hive-deep shadow-glow">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-4">
                                {(user.role === 'admin' || user.role === 'staff') && (
                                    <Link to="/admin" className="p-2 text-hive-muted hover:text-coral rounded-xl transition-colors">
                                        <LayoutDashboard className="w-6 h-6" />
                                    </Link>
                                )}
                                <Link to="/profile" className="flex items-center gap-3 bg-hive-light/40 p-1.5 pr-4 rounded-2xl hover:bg-hive-light/60 transition-colors group border border-hive-border/30">
                                    <div className="w-8 h-8 bg-coral rounded-xl flex items-center justify-center text-white font-black text-xs">
                                        {user.username.substring(0, 1).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-bold text-hive-text uppercase tracking-widest">{user.username}</span>
                                </Link>
                                <button onClick={handleLogout} className="text-hive-subtle hover:text-red-400 transition-colors">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn-coral px-8 py-3 text-xs font-black uppercase tracking-widest">
                                Join Swarm
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 text-hive-muted" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-hive-deep border-t border-hive-border/30 p-6 flex flex-col gap-6">
                    <Link to="/blog" className="font-bold uppercase tracking-widest text-hive-text hover:text-coral transition-colors" onClick={() => setIsMenuOpen(false)}>Chronicles</Link>
                    <Link to="/forum" className="font-bold uppercase tracking-widest text-hive-text hover:text-coral transition-colors" onClick={() => setIsMenuOpen(false)}>The Buzz</Link>
                    {config.scoring_enabled && (
                        <Link to="/scoring" className="font-bold uppercase tracking-widest text-coral hover:text-coral/80 transition-colors" onClick={() => setIsMenuOpen(false)}>Scoreboard</Link>
                    )}
                    <Link to="/cart" className="font-bold uppercase tracking-widest text-hive-text hover:text-coral transition-colors" onClick={() => setIsMenuOpen(false)}>My Colony ({cartCount})</Link>
                    <div className="border-t border-hive-border/30 pt-6">
                        {user ? (
                            <div className="flex flex-col gap-4">
                                <Link to="/profile" className="font-bold text-coral" onClick={() => setIsMenuOpen(false)}>@{user.username}</Link>
                                {(user.role === 'admin' || user.role === 'staff') && (
                                    <Link to="/admin" className="font-bold text-hive-text" onClick={() => setIsMenuOpen(false)}>Admin Core</Link>
                                )}
                                <button onClick={handleLogout} className="text-left font-bold text-red-400 uppercase tracking-widest">Logout</button>
                            </div>
                        ) : (
                            <Link to="/login" className="block btn-coral py-4 font-black text-center uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
