import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, ChevronRight, CheckCircle, Package } from 'lucide-react';

const Checkout = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [cart, setCart] = useState(null);
    const [address, setAddress] = useState({
        name: '',
        address: '',
        city: '',
        zip_code: '',
        country: 'USA'
    });
    const [payment, setPayment] = useState({
        cardNumber: '',
        expiry: '',
        cvv: ''
    });
    const [orderResult, setOrderResult] = useState(null);

    useEffect(() => {
        fetch('/api/cart/')
            .then(res => res.json())
            .then(data => setCart(data));
    }, []);

    const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });
    const handlePaymentChange = (e) => setPayment({ ...payment, [e.target.name]: e.target.value });

    const submitOrder = async () => {
        if (!cart) return;

        try {
            const res = await fetch('/api/checkout/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shipping_address: address,
                    payment_simulated: payment,
                    // V-023: Trusted Client Total - we send exactly what the frontend calculates
                    total: cart.totals.total
                })
            });
            const data = await res.json();
            if (res.ok) {
                setOrderResult(data);
                setStep(4);
            } else {
                alert(data.detail || "Checkout failed. The bugs are restless.");
            }
        } catch (err) {
            alert("Error connecting to the colony.");
        }
    };

    if (!cart) return <div className="p-20 text-center font-sans text-hive-text">Preparing your shipment...</div>;

    return (
        <div className="container mx-auto p-4 py-12 max-w-4xl">
            {/* Progress Stepper */}
            <div className="flex justify-between items-center mb-12 px-4 md:px-20">
                {[
                    { icon: MapPin, label: 'Shipment' },
                    { icon: CreditCard, label: 'Payment' },
                    { icon: Package, label: 'Review' },
                    { icon: CheckCircle, label: 'Success' }
                ].map((s, i) => (
                    <div key={i} className={`flex flex-col items-center gap-2 ${step === i + 1 ? 'text-coral' : 'text-hive-subtle'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${step === i + 1 ? 'border-coral bg-coral text-white' : 'border-hive-border/40 bg-hive-medium/60'}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest">{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="bg-hive-medium/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-card border border-hive-border/40">
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-bold text-hive-text">Where should we deploy your bugs?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="text" name="name" placeholder="Full Name" value={address.name} onChange={handleAddressChange} className="bg-hive-deep/80 border border-hive-border/40 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 text-hive-text placeholder:text-hive-subtle" />
                            <input type="text" name="address" placeholder="Physical Address" value={address.address} onChange={handleAddressChange} className="bg-hive-deep/80 border border-hive-border/40 p-4 rounded-2xl md:col-span-2 focus:outline-none focus:ring-2 focus:ring-coral/30 text-hive-text placeholder:text-hive-subtle" />
                            <input type="text" name="city" placeholder="Metropolis" value={address.city} onChange={handleAddressChange} className="bg-hive-deep/80 border border-hive-border/40 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 text-hive-text placeholder:text-hive-subtle" />
                            <input type="text" name="zip_code" placeholder="Postal Code" value={address.zip_code} onChange={handleAddressChange} className="bg-hive-deep/80 border border-hive-border/40 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 text-hive-text placeholder:text-hive-subtle" />
                        </div>
                        <button onClick={() => setStep(2)} className="w-full bg-coral text-white py-4 rounded-2xl font-bold text-lg hover:bg-coral-hover transition-colors flex items-center justify-center gap-2">
                            Proceed to Payment <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-bold text-hive-text">Payment Sim (Safe for Testing)</h2>
                        <div className="bg-coral/10 p-6 rounded-2xl border border-coral/20 flex items-start gap-4 mb-8">
                            <span className="text-2xl mt-1">💳</span>
                            <p className="text-sm text-hive-muted leading-snug italic">
                                Our payment system is currently in "Sandbox" mode. No real transactions occur. Please use any simulated card details.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <input type="text" name="cardNumber" placeholder="Card Number (XXXX-XXXX-XXXX-XXXX)" value={payment.cardNumber} onChange={handlePaymentChange} className="w-full bg-hive-deep/80 border border-hive-border/40 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 font-mono text-hive-text placeholder:text-hive-subtle" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" name="expiry" placeholder="MM/YY" value={payment.expiry} onChange={handlePaymentChange} className="bg-hive-deep/80 border border-hive-border/40 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 font-mono text-hive-text placeholder:text-hive-subtle" />
                                <input type="password" name="cvv" placeholder="CVV" value={payment.cvv} onChange={handlePaymentChange} className="bg-hive-deep/80 border border-hive-border/40 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/30 font-mono text-hive-text placeholder:text-hive-subtle" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="grow bg-hive-light/40 text-hive-muted py-4 rounded-2xl font-bold">Back</button>
                            <button onClick={() => setStep(3)} className="grow bg-coral text-white py-4 rounded-2xl font-bold">Review Order</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-bold text-hive-text">Final Inspection</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-black text-[10px] uppercase tracking-widest text-hive-muted">Shipment To:</h3>
                                <div className="text-hive-text">
                                    <p className="font-bold">{address.name}</p>
                                    <p>{address.address}</p>
                                    <p>{address.city}, {address.zip_code}</p>
                                    <p>{address.country}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-black text-[10px] uppercase tracking-widest text-hive-muted">Colony Inventory:</h3>
                                <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                                    {cart.items.map(item => (
                                        <div key={item.id} className="text-sm flex justify-between text-hive-text">
                                            <span>{item.quantity}x {item.product_name}</span>
                                            <span className="font-bold">${item.subtotal.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-hive-light/20 p-6 rounded-2xl border border-hive-border/40">
                            <div className="flex justify-between items-center text-2xl">
                                <span className="font-black text-hive-text uppercase tracking-tighter">Total Investment</span>
                                <span className="font-black text-hive-text">${cart.totals.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button onClick={submitOrder} className="w-full bg-coral text-white py-5 rounded-2xl font-bold text-xl hover:bg-coral-hover shadow-card transform active:scale-[0.98] transition-all uppercase tracking-widest">
                            Confirm & Deploy
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="text-center space-y-8 py-12 animate-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-4xl font-black text-hive-text">Deployment Scheduled!</h2>
                        <p className="text-hive-muted max-w-sm mx-auto">
                            Your order <span className="font-bold text-coral">#{orderResult?.order_id}</span> has been broadcasted to our swarm logistics. You will receive a simulated confirmation email shortly.
                        </p>
                        <div className="pt-8">
                            <Link to="/" className="bg-coral text-white px-10 py-4 rounded-full font-bold hover:shadow-card transition-all">
                                Return to The Hive
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
