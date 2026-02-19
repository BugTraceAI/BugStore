import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-hive-deep/80 backdrop-blur-xl border-t border-hive-border/30 text-hive-muted py-8 mt-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-black text-xl mb-4 text-hive-text">Bug<span className="text-coral">Store</span></h3>
                        <p className="text-sm opacity-80">
                            A deliberately vulnerable playground by{' '}
                            <a href="https://bugtraceai.com" target="_blank" rel="noopener noreferrer" className="text-coral hover:underline font-bold">BugTraceAI</a>.
                            Scan it, break it, learn from it.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-hive-text">Shop</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/products" className="hover:text-coral transition-colors">The Hive (Catalog)</Link></li>
                            <li><Link to="/products" className="hover:text-coral transition-colors">Bug Nursery</Link></li>
                            <li><Link to="/blog" className="hover:text-coral transition-colors">Care Guides</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-hive-text">Community</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/forum" className="hover:text-coral transition-colors">The Swarm (Forum)</Link></li>
                            <li><Link to="/blog" className="hover:text-coral transition-colors">Bug Log</Link></li>
                            <li><Link to="/products" className="hover:text-coral transition-colors">Reviews</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-hive-text">Security</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="https://bugtraceai.com" target="_blank" rel="noopener noreferrer" className="text-coral hover:text-coral-hover transition-colors font-bold">BugTraceAI</a></li>
                            <li><Link to="/secure-portal/login" className="hover:text-coral transition-colors">Secure Portal (2FA)</Link></li>
                            <li><a href="https://github.com/BugTraceAI/BugTraceAI/wiki" target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors">Documentation</a></li>
                            <li><a href="https://github.com/BugTraceAI/BugStore" target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors">GitHub</a></li>
                            <li><div className="text-xs text-red-400 mt-4">DO NOT USE REAL CREDIT CARDS</div></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-hive-border/20 mt-8 pt-8 text-center text-sm opacity-60">
                    &copy; {new Date().getFullYear()} BugStore — A <a href="https://bugtraceai.com" target="_blank" rel="noopener noreferrer" className="text-coral hover:underline">BugTraceAI</a> Playground. All bugs reserved.
                    <div className="mt-1 text-xs opacity-50">build {__BUILD_VERSION__}</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
