import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageSquare, User, Calendar, ArrowLeft, Send, ShieldAlert, BadgeCheck } from 'lucide-react';

const ThreadDetail = () => {
    const { id } = useParams();
    const [thread, setThread] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const fetchThread = async () => {
        try {
            // V-001: The {id} here is passed directly to the backend RAW SQL query.
            // An attacker can browse /forum/thread/1 OR 1-- etc.
            const res = await fetch(`/api/forum/threads/${id}`);
            const data = await res.json();
            if (res.ok) {
                setThread(data);
            } else {
                setError(data.detail || "Thread vanished!");
            }
        } catch (err) {
            setError("Hive terminal error.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThread();
    }, [id]);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/forum/threads/${thread.id}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content: replyContent })
            });
            if (res.ok) {
                setReplyContent('');
                fetchThread();
            }
        } catch (err) {
            console.error("Reply failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-sans text-hive-text">Synchronizing buzz...</div>;
    if (error) return (
        <div className="p-20 text-center space-y-8">
            <ShieldAlert className="w-20 h-20 text-red-400 mx-auto" />
            <h2 className="text-3xl font-black text-hive-text uppercase">{error}</h2>
            <Link to="/forum" className="bg-hive-light/40 text-hive-text px-8 py-3 rounded-2xl font-bold inline-block">Back to Forum</Link>
        </div>
    );

    return (
        <div className="bg-hive-light/20 min-h-screen pb-20">
            <div className="container mx-auto p-4 py-12 max-w-4xl">
                <Link to="/forum" className="group inline-flex items-center gap-2 text-hive-muted font-black uppercase tracking-widest text-xs mb-12 hover:text-coral transition-all">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Forum
                </Link>

                {/* Main Thread */}
                <article className="bg-hive-medium/60 backdrop-blur-xl border border-hive-border/40 rounded-3xl shadow-card overflow-hidden mb-12">
                    <div className="p-10 md:p-16">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-coral rounded-2xl flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-hive-text uppercase tracking-tight leading-none mb-2">{thread.title}</h1>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-hive-subtle">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> member #{thread.author_id}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(thread.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-lg max-w-none text-hive-muted font-medium leading-relaxed bg-hive-light/10 p-10 rounded-3xl italic">
                            "{thread.content}"
                        </div>
                    </div>
                </article>

                {/* Replies */}
                <div className="space-y-6 mb-12">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-hive-muted flex items-center gap-3">
                        <BadgeCheck className="w-4 h-4" /> Swarm Responses ({thread.replies?.length || 0})
                    </h3>

                    {thread.replies?.map((reply) => (
                        <div key={reply.id} className="bg-hive-medium/60 backdrop-blur-sm p-8 rounded-3xl border border-hive-border/40 shadow-card flex gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="w-10 h-10 rounded-xl bg-hive-light/40 shrink-0 flex items-center justify-center font-black text-hive-text text-xs">
                                {reply.author_id}
                            </div>
                            <div className="grow space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-hive-subtle uppercase tracking-widest">member #{reply.author_id}</span>
                                    <span className="text-[10px] text-hive-subtle">{new Date(reply.created_at).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-hive-muted font-medium leading-relaxed">{reply.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply Box */}
                {user ? (
                    <div className="bg-hive-medium/60 backdrop-blur-xl border border-hive-border/40 p-10 rounded-3xl shadow-card relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-coral"></div>
                        <h4 className="text-xl font-black text-hive-text mb-6 uppercase tracking-tight">Add Your Buzz</h4>
                        <form onSubmit={handleReply} className="space-y-6">
                            <textarea
                                required
                                rows="4"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Synchronize your thoughts with the colony..."
                                className="w-full bg-hive-deep/80 border border-hive-border/40 p-6 rounded-3xl focus:outline-none focus:ring-2 focus:ring-coral/30 resize-none font-medium text-hive-text"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-coral text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-coral-hover transition-all shadow-card disabled:opacity-50"
                            >
                                {submitting ? "Transmitting..." : "Post Reply"} <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-coral p-10 rounded-3xl text-center text-white shadow-card">
                        <p className="font-black uppercase tracking-widest mb-4">Authentication Required</p>
                        <Link to="/login" className="bg-white text-hive-text px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-hive-light/40 transition-colors">Join the Discussion</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThreadDetail;
