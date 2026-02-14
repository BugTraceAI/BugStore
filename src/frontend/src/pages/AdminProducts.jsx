import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit2, X, Save, Search, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null); // null = list mode, 'new' = create mode, object = edit mode
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState(null);

    const [user] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
            navigate('/admin');
            return;
        }
        fetchProducts();
    }, [user, navigate]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/products?limit=100'); // get all products roughly
            const data = await res.json();
            setProducts(data.items || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to retire this specimen? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
                setMessage({ type: 'success', text: 'Specimen successfully retired.' });
            } else {
                setMessage({ type: 'error', text: 'Failed to retire specimen.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error contacting hive mind.' });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const isNew = editingProduct === 'new';
        const url = isNew ? '/api/admin/products' : `/api/admin/products/${editingProduct.id}`;
        const method = isNew ? 'POST' : 'PUT';

        // V-019: No client-side validation on these fields either.
        // An attacker (or malicious admin) can inject scripts into description/name.

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: `Specimen ${isNew ? 'cataloged' : 'updated'} successfully.` });
                setEditingProduct(null);
                fetchProducts();
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.detail || 'Operation failed.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Communication failure.' });
        }
    };

    const startEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            species: product.species,
            latin_name: product.latin_name,
            price: product.price,
            stock: product.stock,
            description: product.description,
            category: product.category || 'Beetles',
            care_level: product.care_level || 'Beginner',
            diet: product.diet || 'Omnivore',
            personality: product.personality || 'Neutral'
        });
        setMessage(null);
    };

    const startNew = () => {
        setEditingProduct('new');
        setFormData({
            name: '',
            species: '',
            latin_name: '',
            price: 0,
            stock: 0,
            description: '',
            category: 'Beetles',
            care_level: 'Beginner',
            diet: 'Omnivore',
            personality: 'Neutral'
        });
        setMessage(null);
    };

    if (loading && !products.length) return <div className="p-20 text-center font-sans text-hive-text">Scanning inventory...</div>;

    return (
        <div className="container mx-auto p-4 py-12 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <div className="space-y-2">
                    <Link to="/admin" className="group inline-flex items-center gap-2 text-hive-muted font-black uppercase tracking-widest text-xs mb-4 hover:text-coral transition-all">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to command
                    </Link>
                    <h1 className="text-5xl font-black text-hive-text uppercase tracking-tighter leading-none">Specimen <br /> Management</h1>
                </div>
                <button onClick={startNew} className="btn-coral px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-card">
                    <Plus className="w-5 h-5" /> Catalog New Specimen
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-xs font-bold mb-8 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    <span>{message.type === 'success' ? '✓' : '!'}</span> {message.text}
                </div>
            )}

            {/* Editor Modal/Overlay */}
            {editingProduct && (
                <div className="fixed inset-0 bg-hive-dark/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="glass-card p-8 md:p-12 rounded-3xl w-full max-w-3xl relative my-8">
                        <button onClick={() => setEditingProduct(null)} className="absolute top-8 right-8 text-hive-muted hover:text-coral transition-colors">
                            <X className="w-8 h-8" />
                        </button>
                        <h2 className="text-3xl font-black text-hive-text uppercase tracking-tight mb-8">
                            {editingProduct === 'new' ? 'Catalog New Specimen' : 'Update Specimen Data'}
                        </h2>

                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-hive-muted mb-2">Common Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 rounded-xl font-bold text-hive-text focus:outline-none focus:ring-2 focus:ring-coral/30" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-hive-muted mb-2">Species</label>
                                <input required type="text" value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value })} className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 rounded-xl font-bold text-hive-text focus:outline-none focus:ring-2 focus:ring-coral/30" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-hive-muted mb-2">Latin Name</label>
                                <input required type="text" value={formData.latin_name} onChange={e => setFormData({ ...formData, latin_name: e.target.value })} className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 rounded-xl font-bold text-hive-text focus:outline-none focus:ring-2 focus:ring-coral/30 italic" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-hive-muted mb-2">Adoption Fee ($)</label>
                                <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 rounded-xl font-bold text-hive-text focus:outline-none focus:ring-2 focus:ring-coral/30" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-hive-muted mb-2">Colony Stock</label>
                                <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })} className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 rounded-xl font-bold text-hive-text focus:outline-none focus:ring-2 focus:ring-coral/30" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-hive-muted mb-2">Naturalist Description</label>
                                <textarea rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 rounded-xl font-medium text-hive-text focus:outline-none focus:ring-2 focus:ring-coral/30 resize-none"></textarea>
                            </div>

                            {/* Dropdowns */}
                            <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                {['category', 'care_level', 'diet', 'personality'].map(field => (
                                    <div key={field}>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-hive-muted mb-2">{field.replace('_', ' ')}</label>
                                        <input type="text" value={formData[field]} onChange={e => setFormData({ ...formData, [field]: e.target.value })} className="w-full bg-hive-deep/80 border border-hive-border/40 p-3 rounded-xl font-bold text-hive-text text-sm focus:outline-none focus:ring-2 focus:ring-coral/30" />
                                    </div>
                                ))}
                            </div>

                            <div className="md:col-span-2 pt-6 flex gap-4">
                                <button type="submit" className="flex-1 btn-coral py-4 rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                                    <Save className="w-5 h-5" /> Save Specimen
                                </button>
                                <button type="button" onClick={() => setEditingProduct(null)} className="px-8 bg-hive-light/40 text-hive-text rounded-xl font-black uppercase tracking-widest hover:bg-hive-light/60 transition-all">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="glass-card rounded-3xl overflow-hidden">
                {products.length === 0 ? (
                    <div className="p-20 text-center text-hive-subtle font-bold italic">No specimens in the colony yet.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-hive-light/20 text-[10px] font-black uppercase tracking-widest text-hive-muted border-b border-hive-border/30">
                                <th className="px-8 py-6">Specimen</th>
                                <th className="px-8 py-6">Category</th>
                                <th className="px-8 py-6">Stock</th>
                                <th className="px-8 py-6">Price</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-hive-border/30">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-hive-light/10 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="font-black text-hive-text text-lg">{p.name}</div>
                                        <div className="text-xs text-hive-muted italic">{p.species}</div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-hive-subtle">{p.category}</td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.stock > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {p.stock} Units
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 font-black text-hive-text">${p.price.toFixed(2)}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(p)} className="p-2 bg-hive-light/40 text-hive-text rounded-xl hover:bg-coral hover:text-white transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 border border-hive-border/40 text-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminProducts;
