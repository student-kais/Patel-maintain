import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, LogIn, Store } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = login(email, password);
        if (result.success) {
            toast.success('Welcome back to Auto Mate!');
            navigate('/');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0f172a' }}>
            {/* Background Decorative Blobs */}
            <div className="absolute inset-0 overflow-hidden z-0 opacity-20 pointer-events-none">
                <div className="absolute rounded-full blur-3xl bg-blue-600" style={{ width: '40vw', height: '40vw', top: '-10%', left: '-10%' }}></div>
                <div className="absolute rounded-full blur-3xl bg-purple-600" style={{ width: '40vw', height: '40vw', bottom: '-10%', right: '-10%' }}></div>
            </div>

            {/* Login Card */}
            <div className="glass-panel w-full max-w-md p-6 relative z-10 animate-fade-in shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center mx-auto mb-4 rounded-xl"
                        style={{
                            width: '64px',
                            height: '64px',
                            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)'
                        }}>
                        <Shield size={32} color="white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Auto Mate</h1>
                    <p className="text-dim text-sm mt-1">SaaS Garage Management Platform</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-dim text-xs block mb-1 font-medium uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute text-dim" size={18} style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="email"
                                className="input-glass"
                                style={{ paddingLeft: '40px' }}
                                placeholder="name@company.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-dim text-xs block mb-1 font-medium uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <Lock className="absolute text-dim" size={18} style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="password"
                                className="input-glass"
                                style={{ paddingLeft: '40px' }}
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-dim mt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded" /> Remember me
                        </label>
                        <a href="#" className="text-blue-400">Forgot password?</a>
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4" style={{ height: '48px' }}>
                        <LogIn size={20} /> Sign In
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-dim text-xs text-center mb-3 font-bold uppercase tracking-widest">Demo Account</p>
                    <div className="flex flex-col gap-2">

                        <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="flex items-center gap-2 text-white text-xs mb-1">
                                <Store size={14} className="text-purple-400" /> Shop Owner
                            </div>
                            <div className="text-dim" style={{ fontSize: '10px' }}>patel@gmail.com | owner123</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
