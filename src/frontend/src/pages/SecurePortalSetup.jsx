import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Smartphone, Copy, CheckCircle, ArrowRight } from 'lucide-react';

const SecurePortalSetup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [setupData, setSetupData] = useState(null);
    const [verifyCode, setVerifyCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const [user] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!user || !token) {
            navigate('/login');
        }
    }, [user, token, navigate]);

    const handleSetup = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/secure-portal/setup-totp', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();
            if (res.ok) {
                setSetupData(data);
                setStep(2);
            } else {
                setError(data.detail || "Failed to generate TOTP secret");
            }
        } catch (err) {
            setError("Connection failed");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/secure-portal/enable-totp', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ totp_code: verifyCode })
            });

            const data = await res.json();
            if (res.ok) {
                setStep(3);
            } else {
                setError(data.detail || "Invalid code");
            }
        } catch (err) {
            setError("Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const copySecret = () => {
        navigator.clipboard.writeText(setupData?.secret || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-hive-medium/60 backdrop-blur-xl rounded-3xl p-10 shadow-card border border-hive-border/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-hive-deep via-hive-medium to-coral/20"></div>

                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                                step >= s
                                    ? 'bg-coral text-white'
                                    : 'bg-hive-light/20 text-hive-subtle'
                            }`}>
                                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                            </div>
                            {s < 3 && <div className={`w-12 h-1 rounded ${step > s ? 'bg-coral' : 'bg-hive-light/20'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Introduction */}
                {step === 1 && (
                    <div className="text-center space-y-8">
                        <div className="w-20 h-20 bg-coral rounded-3xl flex items-center justify-center mx-auto rotate-12">
                            <Smartphone className="w-10 h-10 text-white -rotate-12" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-hive-text uppercase tracking-tight mb-4">Set Up 2FA</h1>
                            <p className="text-hive-muted">
                                Secure your admin access with two-factor authentication.
                                You'll need an authenticator app like Google Authenticator or Authy.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-xs font-bold border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleSetup}
                            disabled={loading}
                            className="w-full bg-coral text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-coral-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? "Generating..." : "Generate Secret Key"}
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <Link to="/admin" className="block text-xs text-hive-subtle hover:text-coral">
                            Back to Standard Admin
                        </Link>
                    </div>
                )}

                {/* Step 2: Scan QR & Verify */}
                {step === 2 && setupData && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-hive-text uppercase tracking-tight mb-2">Scan QR Code</h2>
                            <p className="text-hive-muted text-sm">Open your authenticator app and scan this code</p>
                        </div>

                        <div className="bg-white p-4 rounded-2xl mx-auto w-fit">
                            <img
                                src={setupData.qr_code_base64}
                                alt="TOTP QR Code"
                                className="w-48 h-48"
                            />
                        </div>

                        <div className="bg-hive-deep/50 rounded-xl p-4 space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-hive-subtle">
                                Or enter manually:
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-hive-dark p-3 rounded-lg font-mono text-coral text-sm break-all">
                                    {setupData.secret}
                                </code>
                                <button
                                    onClick={copySecret}
                                    className="p-3 bg-hive-light/20 rounded-lg hover:bg-coral/20 transition-colors"
                                >
                                    {copied ? <CheckCircle className="w-5 h-5 text-coral" /> : <Copy className="w-5 h-5 text-hive-muted" />}
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-hive-muted mb-2">
                                    Enter code from app to verify
                                </label>
                                <input
                                    type="text"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="w-full bg-hive-deep/80 border border-coral/30 p-4 rounded-xl font-mono text-3xl tracking-[0.5em] text-center text-hive-text focus:outline-none focus:ring-2 focus:ring-coral/50"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-xs font-bold border border-red-500/20">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || verifyCode.length !== 6}
                                className="w-full bg-coral text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-coral-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? "Verifying..." : "Enable 2FA"}
                                <ShieldCheck className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div className="text-center space-y-8">
                        <div className="w-24 h-24 bg-coral rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-coral uppercase tracking-tight mb-4">2FA Enabled!</h2>
                            <p className="text-hive-muted">
                                Your account is now protected with two-factor authentication.
                                You can now access the Secure Portal.
                            </p>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-left">
                            <div className="text-xs text-yellow-400">
                                <strong>Important:</strong> Keep your authenticator app safe.
                                If you lose access, you may need to contact an administrator to reset your 2FA.
                            </div>
                        </div>

                        <Link
                            to="/secure-portal/login"
                            className="block w-full bg-coral text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-coral-hover transition-all text-center"
                        >
                            Go to Secure Portal Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecurePortalSetup;
