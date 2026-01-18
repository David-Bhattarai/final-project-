
import React from 'react';

const Support: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Emergency Section */}
      <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm shadow-rose-100">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-extrabold text-rose-900 flex items-center justify-center md:justify-start space-x-2">
            <i className="fas fa-triangle-exclamation"></i>
            <span>Need Immediate Help?</span>
          </h2>
          <p className="text-rose-700 max-w-xl">If you or someone you know is in immediate danger or having thoughts of self-harm, please reach out now. Help is available 24/7.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <a href="tel:988" className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-rose-200 transition-all">
            <i className="fas fa-phone-flip"></i>
            <span>Call 988</span>
          </a>
          <button className="bg-white text-rose-600 border border-rose-200 font-bold py-4 px-8 rounded-2xl hover:bg-rose-50 transition-all">
            Crisis Text Line
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Therapist Booking */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold text-slate-900">Book a Therapist</h2>
            <button className="text-indigo-600 text-sm font-bold hover:underline">View All Professionals</button>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'Dr. Sarah Mitchell', role: 'Clinical Psychologist', exp: '12 yrs', img: '1', tags: ['Anxiety', 'Depression'] },
              { name: 'James Wilson', role: 'Licensed Counselor', exp: '8 yrs', img: '2', tags: ['Trauma', 'Grief'] },
              { name: 'Dr. Elena Rossi', role: 'Cognitive Therapist', exp: '15 yrs', img: '3', tags: ['CBT', 'Work-Life'] },
            ].map((t, i) => (
              <div key={i} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow group">
                <img src={`https://picsum.photos/seed/${t.img}/100/100`} alt={t.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{t.name}</h3>
                  <p className="text-xs text-slate-500">{t.role} • {t.exp} exp</p>
                  <div className="flex space-x-1 mt-2">
                    {t.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100">{tag}</span>
                    ))}
                  </div>
                </div>
                <button className="bg-indigo-50 text-indigo-600 h-10 w-10 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <i className="fas fa-calendar-plus"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Support Groups */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Community & Groups</h2>
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <img src="https://picsum.photos/seed/groups/600/300" alt="Group support" className="w-full h-40 object-cover" />
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Weekly Mindfulness Circle</h3>
              <p className="text-slate-500 text-sm">Join our weekly guided community meditation. Share experiences and find support in a safe environment.</p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(n => (
                    <img key={n} src={`https://picsum.photos/seed/user${n}/50/50`} className="w-8 h-8 rounded-full border-2 border-white" alt="Member" />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-400">+12</div>
                </div>
                <button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">Join Group</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-600 p-5 rounded-3xl text-white">
              <i className="fas fa-users-rays text-2xl mb-3"></i>
              <h4 className="font-bold">Forum</h4>
              <p className="text-xs text-indigo-100 mt-1">Chat with others</p>
            </div>
            <div className="bg-emerald-600 p-5 rounded-3xl text-white">
              <i className="fas fa-book-open-reader text-2xl mb-3"></i>
              <h4 className="font-bold">Resources</h4>
              <p className="text-xs text-emerald-100 mt-1">Articles & Guides</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
