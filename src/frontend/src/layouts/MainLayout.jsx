import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-hive-dark text-hive-text font-sans bg-grid-pattern bg-grid bg-fixed">
            <div className="bg-coral/10 border-b border-coral/20 text-center py-2 px-4">
                <p className="text-xs font-bold text-coral/90">
                    This is a deliberately vulnerable app by <a href="https://bugtraceai.com" target="_blank" rel="noopener noreferrer" className="underline font-black hover:text-coral">BugTraceAI</a> — Do not enter real credentials or financial data
                </p>
            </div>
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                {children ? children : <Outlet />}
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
