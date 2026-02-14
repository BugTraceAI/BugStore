import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';

const Cart = () => {
    const [cart, setCart] = useState({ items: [], totals: { subtotal: 0, tax: 0, shipping: 0, total: 0 } });
    const [loading, setLoading] = useState(true);
    const [coupon, setCoupon] = useState('');
    const [couponError, setCouponError] = useState('');

    const fetchCart = async () => {
        try {
            const res = await fetch('/api/cart/');
            const data = await res.json();
            setCart(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching cart:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const updateQuantity = async (productId, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return;

        try {
            await fetch('/api/cart/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId, quantity: newQty })
            });
            fetchCart();
        } catch (err) {
            console.error("Error updating qty:", err);
        }
    };

    const removeItem = async (productId) => {
        try {
            await fetch(`/api/cart/remove/${productId}`, { method: 'DELETE' });
            fetchCart();
        } catch (err) {
            console.error("Error removing item:", err);
        }
    };

    const clearCart = async () => {
        if (!window.confirm("Release all specimens back to the wild? (Empty Cart)")) return;
        try {
            await fetch('/api/cart/clear', { method: 'DELETE' });
            fetchCart();
        } catch (err) {
            console.error("Error clearing cart:", err);
        }
    };

    const applyCoupon = async (e) => {
        e.preventDefault();
        setCouponError('');
        try {
            const res = await fetch('/api/cart/apply-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: coupon })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`${data.message} ${data.discount_percent}% off!`);
                // In a real app we'd update state or re-fetch with discount logic
                fetchCart();
            } else {
                setCouponError(data.detail || "Invalid code");
            }
        } catch (err) {
            setCouponError("Could not connect to the swarm repository.");
        }
    };

    if (loading) return <div className="p-20 text-center font-sans font-black text-2xl text-hive-text animate-bounce">Counting the colony...</div>;

    return (
        <div className="container mx-auto p-4 py-12 max-w-6xl">
            <div className="flex items-center gap-4 mb-12">
                <ShoppingCart className="w-10 h-10 text-coral" />
                <h1 className="text-4xl font-black text-hive-text uppercase tracking-tight">Your Colony</h1>
            </div>

            {cart.items.length === 0 ? (
                <div className="glass-card rounded-3xl p-20 text-center">
                    <div className="text-6xl mb-6 opacity-20">🐜</div>
                    <h2 className="text-2xl font-bold text-hive-muted mb-4">Your colony is empty</h2>
                    <p className="text-hive-subtle mb-8">Start adopting beautiful bugs in The Hive!</p>
                    <Link to="/" className="inline-flex items-center gap-2 btn-coral px-8 py-3 rounded-full font-bold">
                        <ArrowLeft className="w-4 h-4" /> Go to The Hive
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {cart.items.map(item => (
                            <div key={item.id} className="glass-card glass-card-hover p-6 rounded-3xl flex items-center gap-6 group transition-shadow">
                                <div className="w-24 h-24 bg-hive-deep rounded-2xl overflow-hidden shrink-0">
                                    <img src={item.product_image || 'https://via.placeholder.com/100?text=Bug'} alt={item.product_name} className="w-full h-full object-cover" />
                                </div>

                                <div className="grow">
                                    <h3 className="text-lg font-bold text-hive-text">{item.product_name}</h3>
                                    <div className="text-hive-muted font-black text-sm uppercase tracking-tighter">${item.product_price.toFixed(2)} / each</div>
                                </div>

                                <div className="flex items-center bg-hive-light/40 p-1.5 rounded-2xl gap-2">
                                    <button onClick={() => updateQuantity(item.product_id, item.quantity, -1)} className="p-2 hover:bg-hive-deep rounded-xl transition-colors">
                                        <Minus className="w-4 h-4 text-hive-muted" />
                                    </button>
                                    <span className="w-8 text-center font-black text-hive-text">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.product_id, item.quantity, 1)} className="p-2 hover:bg-hive-deep rounded-xl transition-colors">
                                        <Plus className="w-4 h-4 text-hive-muted" />
                                    </button>
                                </div>

                                <div className="text-right shrink-0">
                                    <div className="font-black text-hive-text text-xl">${item.subtotal.toFixed(2)}</div>
                                    <button onClick={() => removeItem(item.product_id)} className="text-red-400 hover:text-red-600 p-2 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between items-center pt-6 px-4">
                            <Link to="/" className="flex items-center gap-2 text-hive-muted font-bold hover:text-coral transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Keep Exploring
                            </Link>
                            <button
                                onClick={clearCart}
                                className="text-red-500 font-bold flex items-center gap-2 hover:underline"
                            >
                                Empty Entire Colony
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-8">
                        <div className="bg-coral text-white p-8 rounded-[2rem] shadow-card relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <ShoppingCart className="w-32 h-32" />
                            </div>

                            <h2 className="text-2xl font-bold mb-8 relative">Colony Summary</h2>

                            <div className="space-y-4 mb-8 border-b border-white/10 pb-8 relative">
                                <div className="flex justify-between">
                                    <span className="opacity-60">Subtotal</span>
                                    <span className="font-bold">${cart.totals.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-60">Sales Tax (8%)</span>
                                    <span className="font-bold">${cart.totals.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-60">Express Shipping</span>
                                    <span className="font-bold">${cart.totals.shipping.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-10 relative">
                                <span className="text-sm font-black uppercase tracking-widest opacity-60 leading-none">Total Investment</span>
                                <span className="text-4xl font-black leading-none">${cart.totals.total.toFixed(2)}</span>
                            </div>

                            <Link to="/checkout" className="block w-full bg-white text-coral py-4 rounded-2xl font-black text-lg hover:bg-hive-text hover:text-coral transition-all shadow-lg active:scale-95 uppercase tracking-widest relative text-center">
                                Begin Adoption
                            </Link>
                        </div>

                        <div className="glass-card p-6 rounded-[2rem]">
                            <h3 className="font-bold text-hive-muted text-sm mb-4 uppercase tracking-widest">Growth Coupon</h3>
                            <form onSubmit={applyCoupon} className="flex gap-2">
                                <input
                                    type="text"
                                    value={coupon}
                                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                                    placeholder="CODE"
                                    className="input-dark grow rounded-xl px-4 py-2 font-black text-hive-text focus:outline-none focus:ring-2 focus:ring-coral/30"
                                />
                                <button type="submit" className="btn-coral px-4 py-2 rounded-xl font-bold">
                                    Apply
                                </button>
                            </form>
                            {couponError && <p className="text-red-500 text-xs mt-2 font-bold">{couponError}</p>}
                            <p className="text-[10px] text-hive-subtle mt-4 leading-tight italic">
                                * Coupons apply to the colony subtotal (before tax and shipping).
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
