import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import Forum from './pages/Forum';
import ThreadDetail from './pages/ThreadDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminProducts from './pages/AdminProducts';
import ScoringDashboard from './pages/ScoringDashboard';
import { useConfig } from './ConfigContext';

const NotFound = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="text-8xl mb-6 grayscale opacity-20">🕷️</div>
        <h1 className="text-5xl font-black text-hive-text uppercase tracking-tight mb-4">404</h1>
        <p className="text-hive-muted font-medium mb-8">This sector of the hive doesn't exist.</p>
        <a href="/" className="btn-coral px-8 py-3 rounded-2xl font-black uppercase tracking-widest">Return to Colony</a>
        <p className="mt-8 text-[10px] text-hive-subtle/50 font-bold uppercase tracking-widest">
            Looking for vulnerabilities? Try <a href="https://bugtraceai.com" target="_blank" rel="noopener noreferrer" className="text-coral/50 hover:text-coral transition-colors">BugTraceAI</a>
        </p>
    </div>
);

function App() {
    const config = useConfig();

    return (
        <Router>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Catalog />} />
                    <Route path="/products" element={<Catalog />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/blog" element={<BlogList />} />
                    <Route path="/blog/:id" element={<BlogDetail />} />
                    <Route path="/forum" element={<Forum />} />
                    <Route path="/forum/thread/:id" element={<ThreadDetail />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    {config.scoring_enabled && (
                        <Route path="/scoring" element={<ScoringDashboard />} />
                    )}
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
