import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';

const Reviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews/${productId}`);
            const data = await res.json();
            setReviews(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/reviews/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    product_id: parseInt(productId),
                    rating: rating,
                    comment: comment,
                    // V-020: Planted vulnerability - we allow the client to set is_approved
                    // An attacker can set this to true to bypass moderation.
                    is_approved: false
                })
            });

            const data = await res.json();
            if (res.ok) {
                setComment('');
                setRating(5);
                setMessage({ type: 'success', text: 'Deployment review submitted! It will appear after swarm moderation.' });
                // We don't fetchReviews immediately because it's not approved yet (unless exploited)
            } else {
                setMessage({ type: 'error', text: data.detail || 'The swarm rejected your feedback.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Communication failure with the hive.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-coral animate-pulse">Scanning specimen feedback...</div>;

    return (
        <div className="space-y-12">
            <div className="flex items-center gap-4 border-b border-hive-border/40 pb-6">
                <MessageSquare className="w-8 h-8 text-coral" />
                <h2 className="text-3xl font-black text-hive-text uppercase tracking-tight">Colony Feedback</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Review Form */}
                <div className="lg:col-span-1">
                    <div className="bg-hive-deep/80 p-8 rounded-3xl border border-hive-border/40 sticky top-8">
                        <h3 className="text-xl font-black text-hive-text mb-6 uppercase tracking-tight">Post Observations</h3>

                        {!user ? (
                            <div className="text-center space-y-4 py-4">
                                <ShieldAlert className="w-12 h-12 text-hive-subtle mx-auto" />
                                <p className="text-sm font-bold text-hive-muted">Only authorized colony members can post reviews.</p>
                                <Link to="/login" className="inline-block btn-coral px-6 py-2 rounded-xl font-bold">Sign In</Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-hive-muted mb-2">Specimen Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`p-1 transition-all ${rating >= star ? 'text-coral' : 'text-hive-subtle'}`}
                                            >
                                                <Star className={`w-6 h-6 ${rating >= star ? 'fill-current' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-hive-muted mb-2">Detailed Findings</label>
                                    <textarea
                                        required
                                        rows="4"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your experience with this specimen..."
                                        className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 resize-none font-medium text-hive-text placeholder:text-hive-subtle"
                                    />
                                </div>

                                {message && (
                                    <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                        {message.text}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full btn-coral py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? "Processing..." : "Submit Review"} <Send className="w-4 h-4" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Review List */}
                <div className="lg:col-span-2 space-y-8">
                    {reviews.length === 0 ? (
                        <div className="glass-card p-12 rounded-3xl text-center border border-hive-border/40 border-dashed">
                            <p className="text-hive-subtle font-bold italic">No observations telah direkam for this specimen yet.</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="glass-card p-8 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-hive-deep flex items-center justify-center font-black text-coral border border-hive-border/40">
                                            {review.user?.username?.substring(0, 2).toUpperCase() || 'AN'}
                                        </div>
                                        <div>
                                            <div className="text-hive-text font-black uppercase tracking-tight">member #{review.user_id}</div>
                                            <div className="flex text-coral">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-hive-subtle'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-hive-subtle">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div
                                    className="text-hive-muted font-medium leading-relaxed italic"
                                    /* V-003: Submitting review comments that could contain XSS */
                                    dangerouslySetInnerHTML={{ __html: review.comment }}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reviews;
