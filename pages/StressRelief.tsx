
import React, { useState, useEffect } from 'react';

const StressRelief: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'breath' | 'zen' | 'sounds'>('breath');
  
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Instant Calm Zone</h1>
        <p className="text-slate-600">Take a moment for yourself with these scientifically-backed relaxation exercises.</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-200/50 rounded-2xl w-fit mx-auto">
        {(['breath', 'zen', 'sounds'] as const).map(tool => (
          <button
            key={tool}
            onClick={() => setActiveTool(tool)}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTool === tool ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tool === 'breath' && 'Breathing'}
            {tool === 'zen' && 'Zen Clicks'}
            {tool === 'sounds' && 'Atmospheres'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 md:p-16 min-h-[500px] flex items-center justify-center relative overflow-hidden">
        {activeTool === 'breath' && <BreathingExercise />}
        {activeTool === 'zen' && <ZenGame />}
        {activeTool === 'sounds' && <SoundTherapy />}
      </div>
    </div>
  );
};

const BreathingExercise: React.FC = () => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [timer, setTimer] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          if (phase === 'Inhale') { setPhase('Hold'); return 4; }
          if (phase === 'Hold') { setPhase('Exhale'); return 4; }
          setPhase('Inhale'); return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="text-center z-10">
      <div className={`relative w-64 h-64 md:w-80 md:h-80 mx-auto transition-transform duration-[4000ms] ease-in-out ${phase === 'Inhale' ? 'scale-125' : phase === 'Exhale' ? 'scale-75' : 'scale-125'}`}>
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-pulse"></div>
        <div className="absolute inset-4 bg-indigo-500/40 rounded-full"></div>
        <div className="absolute inset-8 bg-indigo-600 rounded-full flex flex-col items-center justify-center text-white shadow-2xl">
          <span className="text-3xl font-bold mb-1">{phase}</span>
          <span className="text-5xl font-extrabold opacity-50">{timer}</span>
        </div>
      </div>
      <p className="mt-12 text-slate-400 font-medium tracking-widest uppercase text-sm">Follow the rhythm of your breath</p>
    </div>
  );
};

const ZenGame: React.FC = () => {
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [count, setCount] = useState(0);

  const addBubble = () => {
    const id = Date.now();
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 80 + 10;
    const size = Math.random() * 40 + 40;
    setBubbles(prev => [...prev, { id, x, y, size }]);
  };

  const popBubble = (id: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setCount(prev => prev + 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (bubbles.length < 5) addBubble();
    }, 1000);
    return () => clearInterval(interval);
  }, [bubbles]);

  return (
    <div className="absolute inset-0 p-8 cursor-default">
      <div className="absolute top-8 left-8 text-slate-300 font-bold text-xl uppercase tracking-widest">Zen Popped: {count}</div>
      {bubbles.map(b => (
        <button
          key={b.id}
          onClick={() => popBubble(b.id)}
          className="absolute bg-indigo-500/10 border-2 border-indigo-400/30 rounded-full transition-all hover:bg-indigo-500/20 hover:scale-110 active:scale-90 flex items-center justify-center animate-in zoom-in duration-300"
          style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.size, height: b.size }}
        >
          <div className="w-1 h-1 bg-white/40 rounded-full translate-x-2 -translate-y-2"></div>
        </button>
      ))}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-200">
        <p className="text-lg">Pop the worries away...</p>
      </div>
    </div>
  );
};

const SoundTherapy: React.FC = () => {
  const sounds = [
    { name: 'Forest Rain', icon: 'fa-cloud-showers-heavy', color: 'bg-blue-400' },
    { name: 'Ocean Waves', icon: 'fa-water', color: 'bg-cyan-500' },
    { name: 'Mountain Wind', icon: 'fa-wind', color: 'bg-slate-400' },
    { name: 'White Noise', icon: 'fa-radio', color: 'bg-gray-300' },
  ];

  return (
    <div className="grid grid-cols-2 gap-8 w-full max-w-xl">
      {sounds.map((sound, i) => (
        <button key={i} className="group bg-slate-50 border border-slate-100 p-8 rounded-[32px] hover:bg-white hover:shadow-xl transition-all text-center">
          <div className={`w-16 h-16 ${sound.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 transition-transform`}>
            <i className={`fas ${sound.icon}`}></i>
          </div>
          <h3 className="font-bold text-slate-800">{sound.name}</h3>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-tighter">Click to Play</p>
        </button>
      ))}
    </div>
  );
};

export default StressRelief;
