import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Bug, Star, ShoppingCart, ArrowRight } from 'lucide-react';

const Catalog = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const s = params.get('search');
        if (s) {
            setSearchTerm(s);
        }

        const apiUrl = s ? `/api/products/?search=${encodeURIComponent(s)}` : '/api/products/';

        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                setProducts(Array.isArray(data) ? data : data.items || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching products:", err);
                setLoading(false);
            });
    }, []);

    const addToCart = async (productId, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId, quantity: 1 })
            });
            if (res.ok) {
                // Could show a toast here
                alert("Specimen secured in your containment unit!");
            }
        } catch (err) {
            console.error("Cart error:", err);
        }
    };

    if (loading) return (
        <div className="p-20 text-center">
            <div className="w-16 h-16 border-4 border-coral border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="font-sans font-black text-2xl text-hive-text animate-pulse uppercase tracking-widest">Scanning the Swarm...</div>
        </div>
    );

    return (
        <div className="container mx-auto p-4 py-12 max-w-7xl">
            {/* Hero / Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 px-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-hive-muted font-black uppercase tracking-[0.3em] text-sm">
                        <Bug className="w-5 h-5" /> Verified Colony
                    </div>
                    <h1 className="text-7xl font-black text-hive-text uppercase tracking-tighter leading-none">
                        Select <br /> Your Bug
                    </h1>
                </div>

                <div className="flex flex-col gap-6 max-w-md">
                    <p className="text-hive-muted font-medium italic border-l-4 border-hive-border/40 pl-6 leading-relaxed">
                        Curated collection of high-intelligence invertebrates. Each specimen is vetted for colony compatibility and resilience.
                    </p>
                    <div className="flex gap-4">
                        <form className="relative grow group" onSubmit={(e) => { e.preventDefault(); window.location.href = `/?search=${encodeURIComponent(searchTerm)}`; }}>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-hive-subtle group-focus-within:text-coral transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by DNA..."
                                className="w-full input-dark p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 font-medium transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </form>
                        <button onClick={() => window.location.href = `/?search=${encodeURIComponent(searchTerm)}`} className="bg-hive-light/40 p-4 rounded-2xl text-hive-text hover:bg-coral hover:text-white transition-all shadow-card">
                            <Filter className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {searchTerm && (
                <div className="mb-12 px-4 flex items-center gap-4">
                    <div className="text-sm font-black uppercase tracking-widest text-hive-subtle">DNA SEQUENCE MATCH:</div>
                    <h2 className="text-2xl text-hive-text font-black uppercase">
                        "<span
                            className="underline decoration-coral decoration-4 underline-offset-8"
                            dangerouslySetInnerHTML={{ __html: searchTerm }}
                        ></span>"
                    </h2>
                    {/* V-002: Reflected XSS vulnerability planted here */}
                </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {products.map(product => (
                    <Link to={`/product/${product.id}`} key={product.id} className="group glass-card glass-card-hover rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 flex flex-col">
                        <div className="aspect-[4/5] bg-hive-deep relative overflow-hidden">
                            <img
                                src={product.images?.[0]?.url || `/api/products/${product.id}/image?file=placeholder.jpg`}
                                alt={product.name}
                                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                            />

                            {/* Overlay Badges */}
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                <div className="bg-hive-dark/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-hive-text shadow-card">
                                    {product.category}
                                </div>
                            </div>

                            <div className="absolute bottom-6 right-6">
                                <button
                                    onClick={(e) => addToCart(product.id, e)}
                                    className="w-14 h-14 bg-coral text-white rounded-2xl flex items-center justify-center shadow-card transform translate-y-20 group-hover:translate-y-0 transition-transform duration-500 hover:bg-coral-hover"
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 flex flex-col grow">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating_avg || 0) ? 'fill-current' : 'opacity-20'}`} />
                                    ))}
                                </div>
                                <span className="text-[10px] font-black text-hive-subtle">({product.reviews_count || 0})</span>
                            </div>

                            <h3 className="text-2xl font-black text-hive-text leading-none mb-1 group-hover:text-coral transition-colors">{product.name}</h3>
                            <p className="text-xs italic text-hive-muted opacity-60 font-sans mb-6">{product.species}</p>

                            <div className="mt-auto flex items-end justify-between">
                                <div className="text-3xl font-black text-hive-text leading-none tracking-tighter">${product.price.toFixed(2)}</div>
                                <div className="text-right">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-hive-subtle mb-1">Status</div>
                                    <div className="text-[10px] font-black uppercase text-coral">{product.stock > 0 ? 'Available' : 'Retired'}</div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {products.length === 0 && !loading && (
                <div className="mt-12 text-center py-40 glass-card rounded-3xl border-2 border-dashed border-hive-border/40">
                    <div className="text-8xl mb-8 grayscale opacity-20">🔬</div>
                    <h3 className="text-3xl font-black text-hive-text uppercase tracking-tight">No Specimens Isolated</h3>
                    <p className="text-hive-muted font-medium italic mt-2 opacity-60">The DNA sequence did not yield any swarm matches.</p>
                    <button onClick={() => window.location.href = '/'} className="mt-10 btn-coral px-10 py-4 rounded-2xl font-black uppercase tracking-widest">
                        Reset Parameters
                    </button>
                </div>
            )}
        </div>
    );
};

export default Catalog;
