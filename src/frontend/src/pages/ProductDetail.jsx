import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Reviews from '../components/Reviews';
import { ShoppingCart, ArrowLeft, Star, Info, ShieldCheck } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetch(`/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching product:", err);
                setLoading(false);
            });
    }, [id]);

    const addToCart = async () => {
        setAdding(true);
        try {
            const res = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: parseInt(id), quantity: qty })
            });
            if (res.ok) {
                alert("The bug has been successfully deployed to your colony!");
            }
        } catch (err) {
            console.error("Cart error:", err);
        } finally {
            setAdding(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-hive-deep/40">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="font-sans font-black text-2xl text-hive-text animate-pulse">Preparing the terrarium...</div>
            </div>
        </div>
    );

    if (!product || product.detail === "This bug has escaped our colony") return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-hive-deep/40">
            <div className="glass-card p-20 rounded-3xl text-center max-w-xl">
                <div className="text-8xl mb-8 opacity-20">🦋</div>
                <h2 className="text-4xl font-black text-coral mb-4 uppercase tracking-tight">Bug vanished!</h2>
                <p className="mb-12 text-hive-subtle font-medium">It's not in our colony anymore. Maybe it flew away or crawled into the logs?</p>
                <Link to="/" className="btn-coral px-10 py-4 rounded-2xl font-black uppercase tracking-widest inline-block">
                    Back to The Hive
                </Link>
            </div>
        </div>
    );

    return (
        <div className="bg-hive-deep/40 min-h-screen pb-20">
            <div className="container mx-auto p-4 py-12 max-w-7xl">
                <Link to="/" className="group inline-flex items-center gap-2 text-hive-muted font-black uppercase tracking-widest text-xs mb-12 hover:text-coral transition-all">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to The Hive
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
                    {/* Image Section */}
                    <div className="space-y-8">
                        <div className="rounded-3xl overflow-hidden shadow-card glass-card aspect-square relative group">
                            <img
                                src={product.images?.[0]?.url || `/api/products/${id}/image?file=placeholder.jpg`}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute top-6 right-6">
                                <div className="bg-hive-dark/90 backdrop-blur-md p-4 rounded-3xl shadow-card flex flex-col items-center gap-1 border border-hive-border/40 animate-bounce">
                                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                                    <span className="text-xs font-black text-coral">S-Tier</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-6">
                            {product.images?.slice(1).map((img, i) => (
                                <div key={i} className="rounded-3xl overflow-hidden aspect-square border-4 border-hive-border/40 shadow-card hover:border-coral transition-all cursor-pointer group">
                                    <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="thumbnail" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-10">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="bg-coral text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-card">Verified Specimen</span>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />)}
                                </div>
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black text-hive-text mb-4 leading-none tracking-tighter">{product.name}</h1>
                            <p className="text-2xl italic text-hive-muted font-sans border-l-4 border-hive-border/40 pl-6">{product.species} — {product.latin_name}</p>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-6xl font-black text-hive-text leading-none tracking-tighter">${product.price.toFixed(2)}</div>
                            <div className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-card border ${product.stock > 5 ? 'bg-green-900/40 text-green-400 border-green-800/50' : 'bg-red-900/40 text-red-400 border-red-800/50'}`}>
                                {product.stock > 0 ? `${product.stock} Units in Colony` : 'Habitat Retired'}
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:rotate-12 transition-transform">
                                <Info className="w-32 h-32" />
                            </div>
                            <h3 className="font-black text-hive-muted uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Naturalist Observations
                            </h3>
                            <p className="text-hive-text/80 leading-relaxed font-medium text-lg relative z-10">
                                {product.description || "Experimental data suggests this specimen has unique characteristics noted only in high-privilege environments."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Care Complexity', val: product.care_level },
                                { label: 'Habitat Group', val: product.category },
                                { label: 'Dietary Protocol', val: product.diet },
                                { label: 'Typical Temperament', val: product.personality }
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-hive-deep/80 border border-hive-border/40 p-6 rounded-3xl group hover:bg-hive-light/40 hover:shadow-card transition-all">
                                    <span className="block text-[9px] text-hive-subtle uppercase font-black mb-2 tracking-widest">{stat.label}</span>
                                    <span className="text-hive-text font-black text-lg">{stat.val || 'Classified'}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 items-center pt-8">
                            <div className="bg-hive-deep/80 border-2 border-hive-border/40 p-2 rounded-2xl flex items-center gap-4 shadow-inner">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 flex items-center justify-center font-black text-hive-text hover:bg-hive-light/60 rounded-xl transition-colors">-</button>
                                <span className="w-8 text-center font-black text-xl text-hive-text">{qty}</span>
                                <button onClick={() => setQty(qty + 1)} className="w-12 h-12 flex items-center justify-center font-black text-hive-text hover:bg-hive-light/60 rounded-xl transition-colors">+</button>
                            </div>
                            <button
                                onClick={addToCart}
                                disabled={product.stock === 0 || adding}
                                className="grow bg-coral text-white py-6 rounded-[1.5rem] font-black text-xl hover:bg-coral-hover transform transition active:scale-[0.98] shadow-card disabled:bg-gray-600 disabled:shadow-none uppercase tracking-widest flex items-center justify-center gap-3"
                            >
                                <ShoppingCart className="w-6 h-6" /> {adding ? 'Deploying...' : 'Adopt into Colony'}
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-hive-subtle">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">30-Day Habitat Guarantee Active</span>
                        </div>
                    </div>
                </div>

                <div className="pt-24 border-t border-hive-border/40">
                    <Reviews productId={id} />
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
