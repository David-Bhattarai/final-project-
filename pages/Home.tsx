
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 py-20 px-8 text-white">
        <div className="max-w-3xl relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Your journey to <span className="text-indigo-400">mental wellness</span> starts here.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed">
            Experience MindCare AI, the most advanced platform for emotional health. 
            Real-time therapy, AI emotion detection, and tools to find your calm.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/chat"
              className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/30"
            >
              <i className="fas fa-comment-dots"></i>
              <span>Talk to AI Therapist</span>
            </Link>
            <Link
              to="/scan"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center space-x-2"
            >
              <i className="fas fa-camera"></i>
              <span>Try Emotion Scan</span>
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 mt-10 opacity-20 hidden lg:block">
           <i className="fas fa-brain text-[300px]"></i>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: 'fa-users', title: '50,000+', desc: 'Users supported worldwide' },
          { icon: 'fa-heart-pulse', title: '92%', desc: 'Report improved mood after chat' },
          { icon: 'fa-shield-halved', title: 'Private & Secure', desc: 'Your data is encrypted and confidential' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.title}</h3>
            <p className="text-slate-500">{stat.desc}</p>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">How MindCare AI helps you</h2>
          <p className="text-slate-600 text-lg">Comprehensive tools designed by clinicians and AI experts to support your mental wellbeing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon="fa-robot" 
            title="AI Therapy" 
            desc="24/7 empathetic support and evidence-based CBT techniques." 
            color="bg-blue-500"
          />
          <FeatureCard 
            icon="fa-face-smile-wink" 
            title="Emotion Tracking" 
            desc="Detect stress and mood trends with advanced facial analysis." 
            color="bg-emerald-500"
          />
          <FeatureCard 
            icon="fa-wind" 
            title="Calm Tools" 
            desc="Breathing exercises and meditation sounds to reduce anxiety." 
            color="bg-purple-500"
          />
          <FeatureCard 
            icon="fa-user-nurse" 
            title="Human Care" 
            desc="Direct booking with licensed therapists for deep support." 
            color="bg-rose-500"
          />
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: string; title: string; desc: string; color: string }> = ({ icon, title, desc, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
    <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center mb-4 text-xl shadow-lg shadow-${color.split('-')[1]}-200`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Home;
