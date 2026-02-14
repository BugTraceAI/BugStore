import React, { useState, useEffect } from 'react';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Check URL for search param (V-002: Reflected XSS)
        const params = new URLSearchParams(window.location.search);
        const s = params.get('search');
        if (s) {
            setSearchTerm(s);
        }

        // Build API URL
        const apiUrl = s ? `/api/products?search=${encodeURIComponent(s)}` : '/api/products';

        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                setProducts(data.items || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching products:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8 text-center text-hive-muted font-bold animate-pulse">Scanning the swarm...</div>;

    return (
        <div className="container mx-auto p-4">
            {searchTerm && (
                <h2 className="text-2xl mb-6 text-hive-text">
                    Results for:
                    <span
                        className="font-bold underline decoration-coral ml-2"
                        dangerouslySetInnerHTML={{ __html: searchTerm }}
                    ></span>
                    {/* V-002: Reflected XSS vulnerability planted here */}
                </h2>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="glass-card rounded-3xl overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                        <div className="h-48 bg-hive-deep relative">
                            <img src={product.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=Bug+Friend'} alt={product.name} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                            <div className="absolute top-2 right-2 bg-coral/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                                {product.category}
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-hive-text leading-tight">{product.name}</h3>
                                    <p className="text-xs italic text-hive-muted opacity-75">{product.species}</p>
                                </div>
                                <div className="text-coral font-bold">${product.price.toFixed(2)}</div>
                            </div>

                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < Math.floor(product.rating_avg || 0) ? "text-coral text-sm" : "text-hive-border text-sm"}>★</span>
                                ))}
                                <span className="text-[10px] text-hive-subtle">({product.reviews_count || 0})</span>
                            </div>

                            <button
                                className="w-full bg-coral text-white py-2 rounded-xl font-medium hover:bg-coral-hover transition-colors duration-300 flex items-center justify-center gap-2 shadow-glow"
                                onClick={() => alert(`Added ${product.name} to your colony!`)}
                            >
                                <span>Add to Colony</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && !loading && (
                <div className="text-center py-24 glass-card rounded-3xl border-2 border-dashed border-hive-border/40">
                    <div className="text-4xl mb-4 opacity-40">🦟</div>
                    <h3 className="text-xl font-bold text-hive-muted">No bugs in this area!</h3>
                    <p className="text-hive-subtle">Try a different search or filter.</p>
                </div>
            )}
        </div>
    );
};

export default ProductList;
