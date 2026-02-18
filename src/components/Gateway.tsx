import React from 'react';
import { Users, Briefcase, Shield } from 'lucide-react';

interface GatewayProps {
  onSelect: (view: 'eligibility' | 'employee') => void;
}

const Gateway: React.FC<GatewayProps> = ({ onSelect }) => {
  return (
    <div className="relative min-h-screen bg-emerald-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Moroccan Flag Background Element */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[500px] bg-[#C1272D] relative flex items-center justify-center">
          <div className="text-[#006233] text-[300px] leading-none">★</div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-6 border border-gold/30">
          <Shield className="text-gold" size={40} />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-2 tracking-tighter">MAFS</h1>
        <p className="text-lg text-gold font-bold tracking-[0.2em] mb-6">MOROCCAN AMERICAN FINANCIAL SUPPORT</p>
        
        <p className="text-xl md:text-2xl text-emerald-100 mb-6 leading-relaxed font-serif" dir="rtl">
          إِنَّ الْمُصَّدِّقِينَ وَالْمُصَّدِّقَاتِ وَأَقْرَضُوا اللَّهَ قَرْضًا حَسَنًا يُضَاعَفُ لَهُمْ وَلَهُمْ أَجْرٌ كَرِيمٌ
        </p>
        
        <h2 className="text-2xl font-bold text-white mb-8 italic">"Takaful: Because We Are One Body, One Shield."</h2>
        
        <div className="max-w-3xl mx-auto bg-black/30 backdrop-blur-md p-8 rounded-3xl border border-white/10 mb-12 shadow-2xl">
          <p className="text-emerald-50 text-sm md:text-base leading-relaxed italic">
            "Life is a journey of peaks and valleys, and the storm often arrives unannounced. At MAFS, we don’t just provide a policy; we provide a promise. Rooted in the Prophetic tradition of Takaful, our support acts as a communal shield against the unexpected. When you join MAFS, you aren't just protecting your future—you are standing in the gap for your brother and sister, ensuring that in our Ummah, no hardship is ever faced alone."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
          <button 
            onClick={() => onSelect('eligibility')} 
            className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all hover:scale-[1.02] border-l-4 border-l-gold"
          >
            <Users className="text-gold mb-4" size={32} />
            <h3 className="text-2xl font-bold text-white mb-2">Member Portal</h3>
            <p className="text-emerald-200 text-sm">Explore our community values, calculate contributions, and join the shield.</p>
          </button>
          
          <button 
            onClick={() => onSelect('employee')} 
            className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all hover:scale-[1.02] border-l-4 border-l-white"
          >
            <Briefcase className="text-white mb-4" size={32} />
            <h3 className="text-2xl font-bold text-white mb-2">Employee Section</h3>
            <p className="text-emerald-200 text-sm">Manage member databases and perform advanced global coverage modeling.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Gateway;
