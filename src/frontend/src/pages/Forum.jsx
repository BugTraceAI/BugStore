import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Search, PlusCircle, User, Calendar, MessageCircle, ArrowRight } from 'lucide-react';

const Forum = () => {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const fetchThreads = async (query = '') => {
        setLoading(true);
        try {
            const url = query ? `/api/forum/threads?q=${query}` : '/api/forum/threads';
            const res = await fetch(url);
            const data = await res.json();
            setThreads(data);
        } catch (err) {
            console.error("Error fetching threads:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThreads();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchThreads(searchQuery);
    };

    return (
        <div className="container mx-auto p-4 py-20 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-hive-muted font-black uppercase tracking-[0.3em] text-sm">
                        <MessageSquare className="w-5 h-5" /> The Community Buzz
                    </div>
                    <h1 className="text-6xl font-black text-hive-text uppercase tracking-tighter leading-none">Colony <br /> Discussion</h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <form onSubmit={handleSearch} className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-hive-subtle group-focus-within:text-coral transition-colors" />
                        <input
                            type="text"
                            placeholder="Search the swarm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-hive-deep/80 border border-hive-border/40 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 w-full sm:w-64 font-medium text-hive-text"
                        />
                    </form>
                    {user && (
                        <Link to="/forum/new" className="bg-coral text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-coral-hover transition-all shadow-card">
                            <PlusCircle className="w-5 h-5" /> Start Thread
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-hive-medium/60 backdrop-blur-xl border border-hive-border/40 rounded-3xl shadow-card overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-hive-border/40">
                    {loading ? (
                        <div className="p-20 text-center text-hive-text font-sans animate-pulse">Scanning frequencies...</div>
                    ) : threads.length === 0 ? (
                        <div className="p-20 text-center">
                            <p className="text-hive-subtle font-bold italic">Silence in the colony. No buzz found for this query.</p>
                        </div>
                    ) : (
                        threads.map((thread) => (
                            <div key={thread.id} className="p-8 hover:bg-hive-light/30 transition-colors group">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 bg-hive-light/40 rounded-2xl flex items-center justify-center shrink-0">
                                        <MessageCircle className="w-6 h-6 text-hive-text" />
                                    </div>
                                    <div className="grow space-y-2">
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-hive-subtle">
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> member #{thread.author_id}</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(thread.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <Link to={`/forum/thread/${thread.id}`} className="block">
                                            <h2 className="text-2xl font-black text-hive-text group-hover:text-coral transition-colors leading-tight">
                                                {thread.title}
                                            </h2>
                                        </Link>
                                        <p className="text-hive-subtle line-clamp-1 font-medium">
                                            {thread.content}
                                        </p>
                                    </div>
                                    <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                                        <Link to={`/forum/thread/${thread.id}`} className="bg-hive-light/40 text-hive-text p-3 rounded-xl hover:bg-coral hover:text-white transition-all shadow-sm">
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Forum;
