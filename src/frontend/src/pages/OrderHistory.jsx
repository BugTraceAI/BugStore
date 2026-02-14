import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock, Truck, Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetch('/api/orders/')
            .then(res => res.json())
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching orders:", err);
                setLoading(false);
            });
    }, []);

    const toggleDetails = async (orderId) => {
        if (expandedOrder?.id === orderId) {
            setExpandedOrder(null);
            return;
        }

        try {
            const res = await fetch(`/api/orders/${orderId}`);
            const data = await res.json();
            setExpandedOrder(data);
        } catch (err) {
            console.error("Error fetching order details:", err);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <Check className="w-4 h-4 text-green-500" />;
            case 'Shipped': return <Truck className="w-4 h-4 text-blue-500" />;
            default: return <Clock className="w-4 h-4 text-yellow-500" />;
        }
    };

    if (loading) return <div className="p-20 text-center font-sans text-2xl text-hive-text">Retrieving deployment logs...</div>;

    return (
        <div className="container mx-auto p-4 py-12 max-w-5xl">
            <div className="flex items-center gap-4 mb-12">
                <ClipboardList className="w-10 h-10 text-hive-text" />
                <h1 className="text-4xl font-black text-hive-text uppercase tracking-tight">Deployment History</h1>
            </div>

            {orders.length === 0 ? (
                <div className="bg-hive-medium/60 backdrop-blur-xl border border-hive-border/40 rounded-3xl p-20 text-center shadow-card">
                    <h2 className="text-2xl font-bold text-hive-muted mb-4">No deployments recorded</h2>
                    <p className="text-hive-subtle mb-8">You haven't deployed any colony components yet.</p>
                    <Link to="/" className="bg-coral text-white px-8 py-3 rounded-full font-bold">Start Deploying</Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-hive-medium/60 backdrop-blur-xl border border-hive-border/40 rounded-3xl shadow-card overflow-hidden">
                            <div
                                className="p-6 md:p-8 flex flex-wrap items-center justify-between gap-6 cursor-pointer hover:bg-hive-light/10 transition-colors"
                                onClick={() => toggleDetails(order.id)}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-hive-light/40 rounded-2xl flex items-center justify-center font-black text-hive-text">
                                        #{order.id}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-hive-subtle">Deployment Date</div>
                                        <div className="text-hive-text font-bold">{new Date(order.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-hive-deep/80 px-4 py-2 rounded-full">
                                    {getStatusIcon(order.status)}
                                    <span className="text-xs font-bold text-hive-text uppercase tracking-wider">{order.status}</span>
                                </div>

                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-hive-subtle">Total Investment</div>
                                    <div className="text-xl font-black text-hive-text">${order.total.toFixed(2)}</div>
                                </div>

                                <div>
                                    {expandedOrder?.id === order.id ? <ChevronUp className="text-hive-muted" /> : <ChevronDown className="text-hive-muted" />}
                                </div>
                            </div>

                            {expandedOrder?.id === order.id && (
                                <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
                                    <div className="border-t border-hive-border/40 pt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-hive-muted">Specimens Shipped:</h3>
                                            <div className="space-y-3">
                                                {expandedOrder.items.map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center text-sm bg-hive-light/20 p-3 rounded-xl">
                                                        <span className="font-bold text-hive-text">{item.quantity}x {item.product_name}</span>
                                                        <span className="text-hive-muted">${(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-hive-muted">Delivery Address:</h3>
                                            <div className="text-sm text-hive-muted leading-relaxed bg-hive-light/20 p-6 rounded-2xl">
                                                {(() => {
                                                    try {
                                                        const addr = JSON.parse(expandedOrder.shipping_address);
                                                        return (
                                                            <>
                                                                <p className="font-bold text-hive-text">{addr.name}</p>
                                                                <p>{addr.address}</p>
                                                                <p>{addr.city}, {addr.zip_code}</p>
                                                                <p>{addr.country}</p>
                                                            </>
                                                        );
                                                    } catch (e) {
                                                        return <p>{expandedOrder.shipping_address}</p>;
                                                    }
                                                })()}
                                            </div>

                                            <div className="pt-4">
                                                <Link
                                                    to={`/orders/${order.id}`}
                                                    className="text-xs font-black text-hive-muted underline flex items-center gap-1 hover:text-coral transition-colors"
                                                >
                                                    Public Tracking Link (V-009) <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
