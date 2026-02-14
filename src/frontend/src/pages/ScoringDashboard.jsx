import React, { useState, useEffect } from 'react';
import { Bug, Target, Zap, Shield, CheckCircle2, AlertTriangle, Crosshair, Eye, ChevronDown } from 'lucide-react';

const ScoringDashboard = () => {
    const [vulnData, setVulnData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/debug/vulns')
            .then(res => res.json())
            .then(data => {
                setVulnData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load vulnerabilities:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-hive-text font-sans flex items-center gap-3">
                    <Bug className="w-6 h-6 text-coral animate-pulse" />
                    Loading vulnerability data...
                </div>
            </div>
        );
    }

    if (!vulnData || vulnData.error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="glass-card rounded-3xl p-8 border border-red-500/20">
                    <div className="flex items-center gap-3 text-red-400 mb-3">
                        <AlertTriangle className="w-6 h-6" />
                        <strong className="font-black uppercase tracking-widest text-sm">Error</strong>
                    </div>
                    <p className="text-red-300 font-medium">{vulnData?.error || 'Failed to load data'}</p>
                    <p className="mt-3 text-sm text-hive-subtle">
                        This endpoint is only available in Level 0 (BUGSTORE_DIFFICULTY=0)
                    </p>
                </div>
            </div>
        );
    }

    const tierStats = {
        tier1: vulnData.vulnerabilities.filter(v => v.tier === 1),
        tier2: vulnData.vulnerabilities.filter(v => v.tier === 2),
        tier3: vulnData.vulnerabilities.filter(v => v.tier === 3)
    };

    const plantedCount = vulnData.vulnerabilities.filter(v => v.status === 'planted').length;
    const notImplementedCount = vulnData.vulnerabilities.filter(v => v.status === 'not_implemented').length;

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            {/* Header */}
            <div className="mb-16 space-y-4">
                <div className="flex items-center gap-3 text-coral font-black uppercase tracking-[0.3em] text-sm">
                    <Bug className="w-5 h-5" /> Vulnerability Intelligence
                </div>
                <h1 className="text-6xl font-black text-hive-text uppercase tracking-tighter leading-none">Scoring <br /> Dashboard</h1>
                <p className="text-hive-muted font-medium max-w-xl">
                    Track your progress in finding BugStore's {vulnData.total} vulnerabilities across all difficulty tiers.
                    Use <a href="https://bugtraceai.com" target="_blank" rel="noopener noreferrer" className="text-coral font-bold hover:underline">BugTraceAI</a> to automate your scans and compare results.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="glass-card rounded-3xl p-8 border-l-4 border-coral group hover:-translate-y-1 transition-all">
                    <div className="w-12 h-12 bg-coral/10 text-coral rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <Target className="w-6 h-6" />
                    </div>
                    <div className="text-4xl font-black text-hive-text mb-1">{vulnData.total}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-hive-subtle">Total Vulnerabilities</div>
                </div>

                <div className="glass-card rounded-3xl p-8 border-l-4 border-green-400 group hover:-translate-y-1 transition-all">
                    <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="text-4xl font-black text-hive-text mb-1">{plantedCount}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-hive-subtle">Planted & Ready</div>
                </div>

                <div className="glass-card rounded-3xl p-8 border-l-4 border-yellow-400 group hover:-translate-y-1 transition-all">
                    <div className="w-12 h-12 bg-yellow-500/10 text-yellow-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="text-4xl font-black text-hive-text mb-1">{notImplementedCount}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-hive-subtle">Not Implemented</div>
                </div>

                <div className="glass-card rounded-3xl p-8 border-l-4 border-blue-400 group hover:-translate-y-1 transition-all">
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div className="text-4xl font-black text-hive-text mb-1">Level {vulnData.difficulty_level}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-hive-subtle">Difficulty Setting</div>
                </div>
            </div>

            {/* Tier Breakdown - Glowing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="relative glass-card rounded-3xl p-8 overflow-hidden group hover:-translate-y-1 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-500/0" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-green-400 uppercase tracking-tight">Tier 1: Easy</h3>
                        </div>
                        <div className="text-5xl font-black text-hive-text mb-2">{tierStats.tier1.length}</div>
                        <div className="text-sm text-hive-muted font-bold mb-4">1 point each</div>
                        <div className="text-xs text-hive-subtle leading-relaxed">
                            Basic vulnerabilities like SQLi, XSS, IDOR
                        </div>
                        <div className="mt-6 h-1 bg-hive-deep rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]" style={{ width: `${(tierStats.tier1.filter(v => v.status === 'planted').length / Math.max(tierStats.tier1.length, 1)) * 100}%` }} />
                        </div>
                    </div>
                </div>

                <div className="relative glass-card rounded-3xl p-8 overflow-hidden group hover:-translate-y-1 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-500/0" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-yellow-500/10 text-yellow-400 rounded-xl flex items-center justify-center">
                                <Crosshair className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-yellow-400 uppercase tracking-tight">Tier 2: Medium</h3>
                        </div>
                        <div className="text-5xl font-black text-hive-text mb-2">{tierStats.tier2.length}</div>
                        <div className="text-sm text-hive-muted font-bold mb-4">2 points each</div>
                        <div className="text-xs text-hive-subtle leading-relaxed">
                            Blind SQLi, SSRF, JWT issues, GraphQL
                        </div>
                        <div className="mt-6 h-1 bg-hive-deep rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.4)]" style={{ width: `${(tierStats.tier2.filter(v => v.status === 'planted').length / Math.max(tierStats.tier2.length, 1)) * 100}%` }} />
                        </div>
                    </div>
                </div>

                <div className="relative glass-card rounded-3xl p-8 overflow-hidden group hover:-translate-y-1 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-500/0" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-red-400 uppercase tracking-tight">Tier 3: Hard</h3>
                        </div>
                        <div className="text-5xl font-black text-hive-text mb-2">{tierStats.tier3.length}</div>
                        <div className="text-sm text-hive-muted font-bold mb-4">3 points each</div>
                        <div className="text-xs text-hive-subtle leading-relaxed">
                            RCE, SSTI, Deserialization
                        </div>
                        <div className="mt-6 h-1 bg-hive-deep rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.4)]" style={{ width: `${(tierStats.tier3.filter(v => v.status === 'planted').length / Math.max(tierStats.tier3.length, 1)) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Vulnerability Checklist */}
            <div className="glass-card rounded-3xl p-8 md:p-12">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-coral/10 text-coral rounded-2xl flex items-center justify-center">
                        <Eye className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-black text-hive-text uppercase tracking-tight">Vulnerability Checklist</h2>
                </div>

                {[1, 2, 3].map(tier => (
                    <div key={tier} className="mb-10 last:mb-0">
                        <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-hive-text uppercase tracking-tight">
                            <span className={`inline-block w-3 h-3 rounded-full shadow-[0_0_8px] ${
                                tier === 1 ? 'bg-green-400 shadow-green-400/50' :
                                tier === 2 ? 'bg-yellow-400 shadow-yellow-400/50' :
                                'bg-red-400 shadow-red-400/50'
                            }`}></span>
                            Tier {tier} Vulnerabilities
                        </h3>

                        <div className="space-y-4">
                            {vulnData.vulnerabilities
                                .filter(v => v.tier === tier)
                                .map(vuln => (
                                    <div key={vuln.id} className="bg-hive-deep/60 backdrop-blur-sm border border-hive-border/30 rounded-2xl p-6 hover:border-hive-border/60 transition-all group">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center flex-wrap gap-3 mb-3">
                                                    <span className="font-mono text-sm font-black text-coral">
                                                        {vuln.id}
                                                    </span>
                                                    <span className="font-bold text-hive-text">{vuln.name}</span>
                                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                                                        vuln.status === 'planted'
                                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                            : 'bg-hive-light/30 text-hive-subtle border border-hive-border/30'
                                                    }`}>
                                                        {vuln.status}
                                                    </span>
                                                </div>

                                                <div className="text-sm text-hive-muted mb-2">
                                                    <strong className="text-hive-text">Location:</strong> {vuln.location}
                                                </div>

                                                {vuln.status === 'planted' && (
                                                    <>
                                                        <div className="text-sm text-hive-muted mb-3">
                                                            <strong className="text-hive-text">Impact:</strong> {vuln.impact}
                                                        </div>

                                                        <details className="mt-3 group/details">
                                                            <summary className="cursor-pointer text-sm text-coral hover:text-coral-hover transition-colors font-bold flex items-center gap-1">
                                                                <ChevronDown className="w-4 h-4 group-open/details:rotate-180 transition-transform" />
                                                                Show PoC
                                                            </summary>
                                                            <div className="mt-3 p-4 bg-hive-dark/60 border border-hive-border/20 rounded-xl text-xs font-mono text-hive-muted overflow-x-auto">
                                                                {vuln.poc}
                                                            </div>
                                                        </details>
                                                    </>
                                                )}
                                            </div>

                                            <div className="ml-4 mt-1">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 cursor-pointer rounded accent-coral"
                                                    title="Mark as found"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Note */}
            <div className="mt-10 glass-card rounded-3xl p-6 border-l-4 border-yellow-400">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-hive-muted">
                        <strong className="text-yellow-400">Note:</strong> This dashboard is only available in Level 0 (BUGSTORE_DIFFICULTY=0).
                        For a real challenge, try Level 1 or 2 where this endpoint is disabled!
                        Run <a href="https://bugtraceai.com" target="_blank" rel="noopener noreferrer" className="text-coral font-bold hover:underline">BugTraceAI</a> against this instance to see how many it catches automatically.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScoringDashboard;
