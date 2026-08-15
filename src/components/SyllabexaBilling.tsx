import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Sparkles, Zap, Shield, Crown, Building2, ChevronRight, Check, Coins, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';

interface Plan {
  id: string;
  productId: string;
  key: string;
  name: string;
  price: string | number;
  frequency: string;
  description: string;
  features: string[];
  color: string;
  popular: boolean;
  tokens: string;
}

const tokenPacks = [
  { id: 'tokens_1', name: 'Starter Reserve', price: 49, description: '~1-2 Books', tokens: '10M Compute Credits' },
  { id: 'tokens_5', name: 'Pro Reserve', price: 149, description: '~5 Books', popular: true, tokens: '50M Compute Credits' },
  { id: 'tokens_10', name: 'Enterprise Reserve', price: 399, description: '~15 Books', bestValue: true, tokens: '100M Compute Credits' }
];

export default function SyllabexaBilling({ userId, userEmail }: { userId?: string, userEmail?: string }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'tokens'>('subscriptions');

  useEffect(() => {
    // Fallback plans if backend is unconfigured
    setPlans([
      {
        id: 'dummy_creator', productId: '', key: 'creator', name: 'Creator', price: 4900, frequency: '/ month',
        description: 'The essential AI publishing engine for solo authors.',
        features: ['1 Locked Voice profile', 'DOCX & CMYK PDF exports', 'Base server-side prepress'],
        tokens: '5M Tokens included/mo',
        color: 'slate', popular: false
      },
      {
        id: 'dummy_agency', productId: '', key: 'agency', name: 'Agency', price: 49900, frequency: '/ month',
        description: 'Built for ghostwriters and content studios to scale.',
        features: ['5 Locked Voice profiles', 'Multi-model orchestrations', 'Advanced CMYK print validation'],
        tokens: '100M Tokens included/mo',
        color: 'indigo', popular: true
      },
      {
        id: 'dummy_agencypro', productId: '', key: 'agencypro', name: 'Agency Pro', price: 99900, frequency: '/ month',
        description: 'High-volume, enterprise-grade book production.',
        features: ['Unlimited Voice profiles', 'Dedicated API failovers', 'White-label prepress exports'],
        tokens: '500M Tokens included/mo',
        color: 'emerald', popular: false
      }
    ]);
  }, []);

  const handleSubscribe = async (priceId: string, isTopUp: boolean = false) => {
    setLoading(priceId);
    setError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, interval: billingInterval, isTopUp, userId: userId || profile?.uid || 'guest', userEmail: userEmail || profile?.email || 'guest@example.com' }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate checkout. Check your Stripe configuration.');
      }
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to billing provider. Please try again later.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-200 p-8 lg:p-12 relative min-h-screen">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <header className="text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Zap size={14} className="fill-indigo-400" />
            Hybrid Access & Consumption Model
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl font-serif font-black tracking-tight text-white">
            Enterprise Scale. <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Zero Friction.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-400 font-sans text-lg max-w-2xl mx-auto leading-relaxed">
            A flexible pricing architecture built for high-volume publishing. Secure your platform access, then seamlessly top-up compute credits as your production velocity scales.
          </motion.p>
          
          {/* Main Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-center pt-8">
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-1 rounded-xl inline-flex items-center">
              <button 
                onClick={() => setActiveTab('subscriptions')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'subscriptions' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Shield size={16} /> Base Subscriptions
              </button>
              <button 
                onClick={() => setActiveTab('tokens')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'tokens' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Coins size={16} /> Compute Credits
              </button>
            </div>
          </motion.div>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-red-400 max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Welcome Grant Banner */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl p-6 max-w-3xl flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles size={64} />
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-left relative z-10">
                  <h3 className="text-lg font-bold text-white mb-1">New to Syllabexa?</h3>
                  <p className="text-sm text-slate-300">Create a free account and get <strong className="text-indigo-400">5 Compute Credits</strong> on us to draft your first chapter. Experience the 4-agent waterfall engine before you commit.</p>
                </div>
              </div>
            </motion.div>

            {/* Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-1 rounded-xl inline-flex items-center">
                <button 
                  onClick={() => setBillingInterval('month')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${billingInterval === 'month' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Monthly Billing
                </button>
                <button 
                  onClick={() => setBillingInterval('year')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${billingInterval === 'year' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Annual Billing <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">2 Months Free</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {plans.map((plan, idx) => {
                const isPopular = plan.popular;
                const basePrice = (plan.price as number) / 100;
                const displayPrice = billingInterval === 'year' ? Math.floor(basePrice * 0.8) : basePrice;
                const priceStr = `$${displayPrice}`;
                
                return (
                  <motion.div 
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className={`relative flex flex-col rounded-3xl transition-all duration-300 ${isPopular ? 'bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.15)] md:-mt-8 md:mb-8' : 'bg-slate-900 border border-slate-800 hover:border-slate-600'}`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <span className="bg-indigo-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-500/25">
                          Most Popular For Agencies
                        </span>
                      </div>
                    )}
                    
                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-sm text-slate-400 h-16">{plan.description}</p>
                      
                      <div className="my-8">
                        <span className="text-4xl font-black text-white">{priceStr}</span>
                        <span className="text-slate-500 text-sm ml-2">{billingInterval === 'year' ? '/ mo (billed annually)' : plan.frequency}</span>
                      </div>
                      
                      <button 
                        disabled={!!loading}
                        onClick={() => handleSubscribe(plan.id)}
                        className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${isPopular ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                      >
                        {loading === plan.id ? 'Processing...' : 'Secure Access'}
                      </button>
                      
                      <div className="mt-8 space-y-4 flex-1">
                        <div className="flex items-start gap-3 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
                          <Coins className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                          <span className="text-sm text-indigo-200">{plan.tokens}</span>
                        </div>
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'tokens' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25">
                  <Coins className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-black text-white mb-2">Compute Credits</h2>
                  <p className="text-slate-400 leading-relaxed">
                    Once you exceed your monthly baseline compute credits, reserve packs allow you to continue generating without interruption. Credits never expire as long as your base subscription is active.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {tokenPacks.map((pack) => (
                  <div key={pack.id} className={`relative p-6 rounded-2xl border ${(pack as any).popular || (pack as any).bestValue ? 'bg-indigo-500/10 border-indigo-500 mt-4 md:mt-0' : 'bg-slate-950 border-slate-800'}`}>
                    {((pack as any).popular || (pack as any).bestValue) && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <span className="bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-500/25">{(pack as any).popular ? "MOST POPULAR" : "BEST VALUE"}</span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white mb-1">{pack.name}</h3>
                    <div className="text-2xl font-black text-indigo-400 mb-4">${pack.price}</div>
                    <p className="text-xs text-slate-400 mb-6 min-h-[40px]">{pack.description}</p>
                    <button 
                      disabled={!!loading}
                      onClick={() => handleSubscribe(pack.id, true)}
                      className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all disabled:opacity-50 ${(pack as any).popular || (pack as any).bestValue ? "bg-indigo-500 hover:bg-indigo-400 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"}`}
                    >
                      {loading === pack.id ? 'Processing...' : 'Buy Credits'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
