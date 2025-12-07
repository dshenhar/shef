import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Thermometer, Scale, Beaker, ChefHat, ArrowLeft } from 'lucide-react';

type UnitCategory = 'temp' | 'weight' | 'volume';

interface Unit {
  id: string;
  name: string;
  factor: number; // Factor to convert TO base unit
  offset?: number; // Only for temp
}

const UNITS: Record<UnitCategory, Unit[]> = {
  temp: [
    { id: 'c', name: 'צלזיוס (°C)', factor: 1 },
    { id: 'f', name: 'פרנהייט (°F)', factor: 1 } // Handled specially
  ],
  weight: [
    { id: 'g', name: 'גרם (g)', factor: 1 },
    { id: 'kg', name: 'קילוגרם (kg)', factor: 1000 },
    { id: 'oz', name: 'אונקיה (oz)', factor: 28.3495 },
    { id: 'lb', name: 'פאונד (lb)', factor: 453.592 },
  ],
  volume: [
    { id: 'ml', name: 'מיליליטר (ml)', factor: 1 },
    { id: 'l', name: 'ליטר (L)', factor: 1000 },
    { id: 'cup', name: 'כוס (רגילה)', factor: 240 },
    { id: 'tbsp', name: 'כף', factor: 15 },
    { id: 'tsp', name: 'כפית', factor: 5 },
    { id: 'floz', name: 'אונקיית נוזל (fl oz)', factor: 29.5735 },
  ]
};

export const ConverterPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<UnitCategory>('weight');
  const [amount, setAmount] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>(UNITS['weight'][0].id);
  const [toUnit, setToUnit] = useState<string>(UNITS['weight'][1].id);
  const [result, setResult] = useState<string>('---');

  // Reset units when category changes
  const handleCategoryChange = (category: UnitCategory) => {
    setActiveCategory(category);
    setFromUnit(UNITS[category][0].id);
    setToUnit(UNITS[category][1] ? UNITS[category][1].id : UNITS[category][0].id);
    setAmount('');
    setResult('---');
  };

  useEffect(() => {
    calculate();
  }, [amount, fromUnit, toUnit, activeCategory]);

  const calculate = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || !amount) {
      setResult('---');
      return;
    }

    // Special handling for Temperature
    if (activeCategory === 'temp') {
      let res = 0;
      if (fromUnit === 'c' && toUnit === 'f') {
        res = (val * 9/5) + 32;
      } else if (fromUnit === 'f' && toUnit === 'c') {
        res = (val - 32) * 5/9;
      } else {
        res = val; // Same unit
      }
      setResult(res.toFixed(1));
      return;
    }

    // General handling for Weight and Volume
    const currentUnits = UNITS[activeCategory];
    const from = currentUnits.find(u => u.id === fromUnit);
    const to = currentUnits.find(u => u.id === toUnit);

    if (from && to) {
      const baseValue = val * from.factor;
      const finalValue = baseValue / to.factor;
      
      // Formatting
      if (finalValue % 1 !== 0) {
        setResult(finalValue.toFixed(2));
      } else {
        setResult(finalValue.toString());
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-block p-4 bg-purple-100 rounded-full text-purple-500 mb-4">
          <ArrowRightLeft size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800">מחשבון המרות</h2>
        <p className="text-slate-500 mt-2">שפי יחשב עבורך כל כמות במטבח</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-50">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-50 p-1.5 rounded-2xl">
          <button 
            onClick={() => handleCategoryChange('weight')}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeCategory === 'weight' ? 'bg-white text-blue-500 shadow-md' : 'text-slate-400 hover:bg-white/50'}`}
          >
            <Scale size={18} /> משקל
          </button>
          <button 
            onClick={() => handleCategoryChange('volume')}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeCategory === 'volume' ? 'bg-white text-teal-500 shadow-md' : 'text-slate-400 hover:bg-white/50'}`}
          >
            <Beaker size={18} /> נפח
          </button>
          <button 
            onClick={() => handleCategoryChange('temp')}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeCategory === 'temp' ? 'bg-white text-orange-500 shadow-md' : 'text-slate-400 hover:bg-white/50'}`}
          >
            <Thermometer size={18} /> חום
          </button>
        </div>

        {/* Input & Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* FROM */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <label className="block text-slate-400 text-xs font-bold mb-3 uppercase tracking-wider">מה ממירים?</label>
                <div className="flex flex-col gap-3">
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xl font-bold text-slate-800 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
                    />
                    <select 
                        value={fromUnit}
                        onChange={(e) => setFromUnit(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 font-medium focus:outline-none focus:border-purple-400"
                    >
                        {UNITS[activeCategory].map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Arrow Icon */}
            <div className="hidden md:flex justify-center text-slate-300">
                <ArrowLeft size={32} />
            </div>

            {/* TO */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative overflow-hidden">
                <label className="block text-slate-400 text-xs font-bold mb-3 uppercase tracking-wider">לאיזו יחידה?</label>
                <select 
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 font-medium focus:outline-none focus:border-teal-400 mb-4"
                >
                    {UNITS[activeCategory].map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>

                <div className="bg-slate-900 rounded-2xl p-5 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500 rounded-full blur-2xl opacity-30"></div>
                     <p className="text-slate-400 text-xs font-bold mb-1">התוצאה:</p>
                     <div className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                        {result === '---' ? <span className="opacity-20">0.0</span> : result}
                        <ChefHat className={`w-5 h-5 ${result !== '---' ? 'text-teal-400 animate-bounce' : 'text-slate-700'}`} />
                     </div>
                </div>
            </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-400">
           שפי ממליץ: תמיד להשתמש במשקל דיגיטלי לדיוק מקסימלי באפייה!
        </div>
      </div>
    </div>
  );
};