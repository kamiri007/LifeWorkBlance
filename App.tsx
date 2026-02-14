
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, BarChart3, LayoutGrid, 
  Trash2, ChevronLeft, ChevronRight, UtensilsCrossed, Zap, Activity as ActivityIcon, 
  Camera, X, Trash, Clock, Layers, Edit2, Check, Timer, ChevronUp, ChevronDown, Move,
  PlusCircle, Timer as FastingIcon, Calendar as CalendarIcon, BarChart, Settings,
  Activity, Droplets, FlaskConical, Filter
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Line, BarChart as RechartsBarChart, Bar, Cell, ComposedChart, Legend
} from 'recharts';
import { 
  format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, parseISO, startOfWeek, endOfWeek, subWeeks, subMonths, 
  subYears, isWithinInterval, startOfDay, endOfDay, eachHourOfInterval,
  isSameHour, isSameMonth
} from 'date-fns';
import { 
  FoodCard, ActivityCard, ActivityRecord, EnergyRecord, MealSlot, ViewType, DailyData,
  ChartConfig, DataSource, ChartType
} from './types';
import { INITIAL_FOOD_CARDS, INITIAL_ACTIVITY_CARDS, getIcon, ICON_MAP } from './constants';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('Nutrition');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [foodPool, setFoodPool] = useState<FoodCard[]>(() => {
    const saved = localStorage.getItem('foodPool');
    return saved ? JSON.parse(saved) : INITIAL_FOOD_CARDS;
  });
  
  const [activityPool, setActivityPool] = useState<ActivityCard[]>(() => {
    const saved = localStorage.getItem('activityPool');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_CARDS;
  });

  const [dailyRecords, setDailyRecords] = useState<DailyData[]>(() => {
    const saved = localStorage.getItem('dailyRecords');
    return saved ? JSON.parse(saved) : [];
  });

  const [chartSlots, setChartSlots] = useState<ChartConfig[]>(() => {
    const saved = localStorage.getItem('chartSlots');
    return saved ? JSON.parse(saved) : [
      { id: 'c1', title: 'Daily Calories', type: 'area', source: 'calories' },
      { id: 'c2', title: 'Energy Score', type: 'line', source: 'energy' },
      { id: 'c3', title: 'Fasting Window', type: 'bar', source: 'fasting' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('foodPool', JSON.stringify(foodPool));
    localStorage.setItem('activityPool', JSON.stringify(activityPool));
    localStorage.setItem('dailyRecords', JSON.stringify(dailyRecords));
    localStorage.setItem('chartSlots', JSON.stringify(chartSlots));
  }, [foodPool, activityPool, dailyRecords, chartSlots]);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const currentDayData = useMemo(() => {
    const data = dailyRecords.find(d => d.date === dateStr);
    if (data) return data;
    return {
      date: dateStr,
      mealSlots: [
        { id: 's1', label: 'Breakfast', startTime: '08:00', endTime: '08:30', foodItems: [] },
        { id: 's2', label: 'Lunch', startTime: '12:30', endTime: '13:00', foodItems: [] },
        { id: 's3', label: 'Dinner', startTime: '19:00', endTime: '19:30', foodItems: [] }
      ],
      activityRecords: [],
      energyRecords: []
    };
  }, [dailyRecords, dateStr]);

  const updateCurrentDayData = (newData: Partial<DailyData>) => {
    setDailyRecords(prev => {
      const idx = prev.findIndex(d => d.date === dateStr);
      const updatedDay = { ...currentDayData, ...newData };
      if (idx > -1) {
        const next = [...prev];
        next[idx] = updatedDay;
        return next;
      }
      return [...prev, updatedDay];
    });
  };

  const handleAddActivity = (cardId: string) => {
    const card = activityPool.find(c => c.id === cardId);
    if (!card) return;
    const newRecord: ActivityRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: dateStr,
      activityCardId: cardId,
      startTime: format(new Date(), 'HH:mm'),
      endTime: format(new Date(), 'HH:mm'),
      duration: card.defaultDuration || 30,
    };
    updateCurrentDayData({ activityRecords: [...currentDayData.activityRecords, newRecord] });
  };

  const Navigation = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-50 shadow-2xl">
      <NavItem icon={<UtensilsCrossed size={18} />} label="Eat" active={currentView === 'Nutrition'} onClick={() => setCurrentView('Nutrition')} />
      <NavItem icon={<ActivityIcon size={18} />} label="Act" active={currentView === 'Activity'} onClick={() => setCurrentView('Activity')} />
      <NavItem icon={<FastingIcon size={18} />} label="Fast" active={currentView === 'Fasting'} onClick={() => setCurrentView('Fasting')} />
      <NavItem icon={<Zap size={18} />} label="NRG" active={currentView === 'Energy'} onClick={() => setCurrentView('Energy')} />
      <NavItem icon={<BarChart3 size={18} />} label="Stats" active={currentView === 'Analytics'} onClick={() => setCurrentView('Analytics')} />
      <NavItem icon={<LayoutGrid size={18} />} label="Pool" active={currentView === 'CardPool'} onClick={() => setCurrentView('CardPool')} />
    </nav>
  );

  const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 transition-all ${active ? 'text-indigo-600 font-black scale-110' : 'text-slate-400'}`}>
      {icon}
      <span className="text-[9px] uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Zap size={18} />
          </div>
          <h1 className="font-black text-lg text-slate-800 tracking-tight">LifeBalance</h1>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full border border-slate-200">
          <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-1 hover:bg-white rounded-full transition-colors"><ChevronLeft size={16} /></button>
          <span className="text-[10px] font-black px-1 text-slate-600 uppercase tracking-widest">{format(selectedDate, 'MMM dd')}</span>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-1 hover:bg-white rounded-full transition-colors"><ChevronRight size={16} /></button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {currentView === 'Nutrition' && (
          <NutritionView 
            data={currentDayData} pool={foodPool} 
            onAddSlot={() => {
              if (currentDayData.mealSlots.length >= 9) return;
              const newSlot: MealSlot = { id: Math.random().toString(36).substr(2, 9), label: `Meal ${currentDayData.mealSlots.length + 1}`, startTime: format(new Date(), 'HH:mm'), endTime: format(new Date(), 'HH:mm'), foodItems: [] };
              updateCurrentDayData({ mealSlots: [...currentDayData.mealSlots, newSlot] });
            }}
            onRemoveSlot={(id) => updateCurrentDayData({ mealSlots: currentDayData.mealSlots.filter(s => s.id !== id) })}
            onUpdateSlotTime={(slotId, field, newTime) => updateCurrentDayData({ mealSlots: currentDayData.mealSlots.map(s => s.id === slotId ? { ...s, [field]: newTime } : s) })}
            onAddFood={(slotId, food) => {
              const weight = food.defaultWeight;
              const calories = Math.round(weight * (food.caloriesPer100g / 100));
              updateCurrentDayData({ mealSlots: currentDayData.mealSlots.map(s => s.id === slotId ? { ...s, foodItems: [...s.foodItems, { foodCardId: food.id, weight, calculatedCalories: calories }] } : s) });
            }}
            onRemoveFoodItem={(slotId, idx) => updateCurrentDayData({ mealSlots: currentDayData.mealSlots.map(s => s.id === slotId ? { ...s, foodItems: s.foodItems.filter((_, i) => i !== idx) } : s) })}
          />
        )}
        {currentView === 'Activity' && (
          <ActivityView 
            data={currentDayData} pool={activityPool} 
            onAddActivity={handleAddActivity}
            onUpdateActivity={(id, updates) => updateCurrentDayData({ activityRecords: currentDayData.activityRecords.map(r => r.id === id ? { ...r, ...updates } : r) })}
            onRemoveActivity={(id) => updateCurrentDayData({ activityRecords: currentDayData.activityRecords.filter(r => r.id !== id) })}
          />
        )}
        {currentView === 'Fasting' && (
          <FastingView dailyRecords={dailyRecords} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        )}
        {currentView === 'Energy' && (
          <EnergyView 
            data={currentDayData} 
            onLog={(level) => updateCurrentDayData({ energyRecords: [...currentDayData.energyRecords, { id: Math.random().toString(36).substr(2, 9), date: dateStr, time: format(new Date(), 'HH:mm'), level }] })}
            onRemoveRecord={(id) => updateCurrentDayData({ energyRecords: currentDayData.energyRecords.filter(r => r.id !== id) })}
          />
        )}
        {currentView === 'CardPool' && (
          <CardPoolView 
            foodPool={foodPool} activityPool={activityPool}
            onSaveFood={(food) => setFoodPool(prev => {
              const idx = prev.findIndex(f => f.id === food.id);
              if (idx > -1) { const next = [...prev]; next[idx] = food; return next; }
              return [...prev, food];
            })}
            onRemoveFood={(id) => setFoodPool(foodPool.filter(f => f.id !== id))}
            onSaveActivity={(activity) => setActivityPool(prev => {
              const idx = prev.findIndex(a => a.id === activity.id);
              if (idx > -1) { const next = [...prev]; next[idx] = activity; return next; }
              return [...prev, activity];
            })}
            onRemoveActivity={(id) => setActivityPool(activityPool.filter(a => a.id !== id))}
          />
        )}
        {currentView === 'Analytics' && (
          <AnalyticsView 
            dailyRecords={dailyRecords} 
            activityPool={activityPool} 
            foodPool={foodPool}
            selectedDate={selectedDate}
            chartSlots={chartSlots}
            onUpdateCharts={setChartSlots}
          />
        )}
      </main>
      <Navigation />
    </div>
  );
};

// --- NUTRITION COMPONENTS ---

const NutritionView = ({ data, pool, onAddSlot, onRemoveSlot, onUpdateSlotTime, onAddFood, onRemoveFoodItem }: any) => {
  const [addingToSlotId, setAddingToSlotId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const totalCals = data.mealSlots.reduce((acc: number, slot: any) => acc + slot.foodItems.reduce((sAcc: number, item: any) => sAcc + item.calculatedCalories, 0), 0);
  const filteredPool = pool.filter((f: any) => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-xl shadow-indigo-100 flex justify-between items-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="relative z-10">
          <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Consumed</p>
          <h2 className="text-5xl font-black">{totalCals} <span className="text-xl font-normal opacity-60">kcal</span></h2>
        </div>
        <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center text-[10px] font-black">{Math.round((totalCals / 2200) * 100)}%</div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {data.mealSlots.map((slot: any) => (
          <div key={slot.id} className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm transition-all group">
            <div className="flex justify-between items-center mb-5">
              <span className="font-black text-slate-800 uppercase tracking-widest text-xs">{slot.label}</span>
              <div className="flex gap-2 items-center">
                <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100">
                  <Clock size={12} className="text-slate-400 mr-2" />
                  <input type="time" value={slot.startTime} onChange={(e) => onUpdateSlotTime(slot.id, 'startTime', e.target.value)} className="bg-transparent text-[10px] font-black text-slate-600 focus:outline-none w-14" />
                  <span className="mx-1 text-slate-300">-</span>
                  <input type="time" value={slot.endTime} onChange={(e) => onUpdateSlotTime(slot.id, 'endTime', e.target.value)} className="bg-transparent text-[10px] font-black text-slate-600 focus:outline-none w-14" />
                </div>
                <button onClick={() => onRemoveSlot(slot.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={16} /></button>
              </div>
            </div>
            
            <div className="space-y-3">
              {slot.foodItems.map((item: any, idx: number) => {
                const food = pool.find((f: any) => f.id === item.foodCardId);
                return (
                  <div key={idx} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl text-xs border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-black uppercase tracking-tight">{food?.name || 'Unknown'}</span>
                      <span className="text-[10px] text-slate-400">{item.weight}g</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-indigo-600">{item.calculatedCalories} kcal</span>
                      <button onClick={() => onRemoveFoodItem(slot.id, idx)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                    </div>
                  </div>
                );
              })}
              <button 
                onClick={() => setAddingToSlotId(slot.id)}
                className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[20px] flex items-center justify-center text-slate-400 text-[10px] font-black uppercase tracking-widest gap-2 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
              >
                <Plus size={14} className="text-indigo-400" />
                Add Food
              </button>
            </div>
          </div>
        ))}
        <button onClick={onAddSlot} className="w-full py-5 bg-white border border-slate-200 rounded-[32px] flex items-center justify-center gap-3 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all font-black uppercase tracking-widest text-[10px] shadow-sm active:scale-95"><Plus size={20} /> New Meal Slot</button>
      </div>

      {addingToSlotId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[48px] sm:rounded-[48px] p-10 shadow-2xl animate-in slide-in-from-bottom-full duration-300 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 right-0 h-2 bg-indigo-600"></div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Select Item</h3>
              <button onClick={() => { setAddingToSlotId(null); setSearch(''); }} className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center"><X size={20} /></button>
            </div>
            <div className="relative mb-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Filter pool..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-[24px] border border-slate-100 focus:outline-none font-bold text-sm" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto no-scrollbar pb-6 flex-1">
              {filteredPool.map((food: any) => (
                <button key={food.id} onClick={() => { onAddFood(addingToSlotId, food); setAddingToSlotId(null); setSearch(''); }} className="flex flex-col bg-white rounded-[32px] border border-slate-100 p-2 shadow-sm hover:border-indigo-400 transition-all group text-left">
                  <img src={food.image} alt={food.name} className="w-full aspect-square object-cover rounded-[24px] mb-3" />
                  <p className="text-[10px] font-black text-slate-800 truncate uppercase px-2 tracking-tighter">{food.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- FASTING COMPONENTS ---

const FastingView = ({ dailyRecords, selectedDate, onDateSelect }: any) => {
  const monthStart = startOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(selectedDate) });

  const getFastingData = (date: Date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    const dayData = dailyRecords.find((d: any) => d.date === dStr);
    const validMeals = dayData?.mealSlots.filter((s: any) => s.foodItems.length > 0) || [];
    if (validMeals.length === 0) return { start: 0, end: 0, duration: 0 };
    const sorted = [...validMeals].sort((a,b) => a.startTime.localeCompare(b.startTime));
    const s = sorted[0].startTime.split(':').map(Number);
    const e = [...validMeals].sort((a,b) => b.endTime.localeCompare(a.endTime))[0].endTime.split(':').map(Number);
    const sm = s[0]*60 + s[1];
    const em = e[0]*60 + e[1];
    return { start: sm, end: em, duration: em - sm };
  };

  const current = getFastingData(selectedDate);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-indigo-900 rounded-[48px] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-24 -mt-24"></div>
        <div className="relative z-10 w-full flex flex-col items-center gap-8">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
             <Circular24hChart startMinutes={current.start} endMinutes={current.end} size={window.innerWidth < 640 ? 192 : 224} strokeWidth={window.innerWidth < 640 ? 20 : 24} />
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-1">Eating Window</span>
                <span className="text-3xl sm:text-4xl font-black truncate max-w-full">{Math.floor(current.duration/60)}h {current.duration%60}m</span>
             </div>
          </div>
          <div className="grid grid-cols-2 w-full gap-4">
             <div className="bg-white/10 p-4 sm:p-5 rounded-[32px] backdrop-blur-md border border-white/10 text-center">
                <p className="text-[9px] sm:text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Window Starts</p>
                <p className="text-xl sm:text-2xl font-black">{current.start > 0 ? format(new Date().setHours(0, current.start), 'HH:mm') : '--:--'}</p>
             </div>
             <div className="bg-white/10 p-4 sm:p-5 rounded-[32px] backdrop-blur-md border border-white/10 text-center">
                <p className="text-[9px] sm:text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Window Ends</p>
                <p className="text-xl sm:text-2xl font-black">{current.end > 0 ? format(new Date().setHours(0, current.end), 'HH:mm') : '--:--'}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[48px] p-6 sm:p-8 shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-800 uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-6 sm:mb-8 text-center">{format(selectedDate, 'MMMM yyyy')}</h3>
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[9px] sm:text-[10px] font-black text-slate-300">{d}</div>)}
          {Array(monthStart.getDay()).fill(null).map((_, i) => <div key={i} />)}
          {days.map(day => {
            const data = getFastingData(day);
            const active = isSameDay(day, selectedDate);
            return (
              <button 
                key={day.toISOString()} 
                onClick={() => onDateSelect(day)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-[14px] sm:rounded-[18px] transition-all ${active ? 'bg-indigo-600 text-white shadow-xl scale-110 z-10' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                <span className="text-[9px] sm:text-[10px] font-black mb-0.5 sm:mb-1">{format(day, 'd')}</span>
                {data.duration > 0 && <div className="w-4 h-4 sm:w-5 sm:h-5"><Circular24hChart startMinutes={data.start} endMinutes={data.end} size={window.innerWidth < 640 ? 16 : 20} strokeWidth={window.innerWidth < 640 ? 3 : 4} mini active={active} /></div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Circular24hChart = ({ startMinutes, endMinutes, size, strokeWidth, mini, active }: any) => {
  // Use a small padding/buffer to prevent clipping of stroke-linecap="round"
  const buffer = 4;
  const effectiveSize = size + buffer;
  const radius = (size - strokeWidth) / 2;
  const center = effectiveSize / 2;
  const circum = 2 * Math.PI * radius;
  const sAng = (startMinutes / 1440) * 360 - 90;
  const eAng = (endMinutes / 1440) * 360 - 90;
  let sweep = eAng - sAng;
  if (sweep < 0) sweep = 0;
  const dash = `${(sweep / 360) * circum} ${circum}`;
  return (
    <svg width={effectiveSize} height={effectiveSize} viewBox={`0 0 ${effectiveSize} ${effectiveSize}`} className="overflow-visible">
      <circle cx={center} cy={center} r={radius} fill="none" stroke={mini ? (active ? 'rgba(255,255,255,0.2)' : '#e2e8f0') : 'rgba(255,255,255,0.05)'} strokeWidth={strokeWidth} />
      <circle cx={center} cy={center} r={radius} fill="none" stroke={mini ? (active ? '#fff' : '#10b981') : '#10b981'} strokeWidth={strokeWidth} strokeDasharray={dash} strokeLinecap="round" style={{ transformOrigin: 'center', transform: `rotate(${sAng}deg)` }} />
    </svg>
  );
};

// --- ANALYTICS VIEW (MODULAR) ---

const AnalyticsView = ({ dailyRecords, activityPool, foodPool, selectedDate, chartSlots, onUpdateCharts }: any) => {
  const [period, setPeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Week');
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);

  const processedData = useMemo(() => {
    let intervals: { start: Date, label: string }[] = [];
    if (period === 'Day') intervals = eachHourOfInterval({ start: startOfDay(selectedDate), end: endOfDay(selectedDate) }).map(h => ({ start: h, label: format(h, 'HH:00') }));
    else if (period === 'Week') intervals = eachDayOfInterval({ start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) }).map(d => ({ start: d, label: format(d, 'MM/dd') }));
    else if (period === 'Month') intervals = eachDayOfInterval({ start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) }).map(d => ({ start: d, label: format(d, 'MM/dd') }));
    else intervals = Array.from({ length: 12 }, (_, i) => { const d = subMonths(selectedDate, 11 - i); return { start: d, label: format(d, 'MMM') }; });

    return intervals.map(({ start, label }) => {
      const records = period === 'Year' 
        ? dailyRecords.filter((d: any) => isSameMonth(parseISO(d.date), start))
        : (period === 'Day' ? dailyRecords.filter((d: any) => d.date === format(selectedDate, 'yyyy-MM-dd')) : dailyRecords.filter((d: any) => isSameDay(parseISO(d.date), start)));

      const dayData = period === 'Day' ? records[0] : null;

      const getMetric = (slot: ChartConfig) => {
        if (slot.source === 'calories') {
          return dayData ? dayData.mealSlots.filter((s:any) => s.startTime.startsWith(format(start, 'HH'))).reduce((a:any,s:any) => a + s.foodItems.reduce((b:any,f:any) => b + f.calculatedCalories, 0), 0)
                 : records.reduce((a:any, d:any) => a + d.mealSlots.reduce((b:any, s:any) => b + s.foodItems.reduce((c:any,f:any) => c + f.calculatedCalories, 0), 0), 0);
        }
        if (slot.source === 'energy') {
          const nrg = dayData ? dayData.energyRecords.filter((r:any) => r.time.startsWith(format(start, 'HH')))
                              : records.flatMap((d:any) => d.energyRecords);
          return nrg.length > 0 ? nrg.reduce((a:any, b:any) => a + b.level, 0) / nrg.length : null;
        }
        if (slot.source === 'fasting') {
          const meals = dayData ? dayData.mealSlots.filter((s:any) => s.startTime.startsWith(format(start, 'HH')))
                                : records.flatMap((d:any) => d.mealSlots).filter((s:any) => s.foodItems.length > 0);
          if (meals.length === 0) return 0;
          const sorted = [...meals].sort((a,b) => a.startTime.localeCompare(b.startTime));
          const sm = sorted[0].startTime.split(':').map(Number);
          const em = [...meals].sort((a,b) => b.endTime.localeCompare(a.endTime))[0].endTime.split(':').map(Number);
          return (em[0]*60 + em[1]) - (sm[0]*60 + sm[1]);
        }
        if (slot.source === 'activity_freq') {
          return dayData ? dayData.activityRecords.filter((r:any) => r.startTime.startsWith(format(start, 'HH')) && (slot.targetId === 'all' || r.activityCardId === slot.targetId)).length
                         : records.reduce((a:any, d:any) => a + d.activityRecords.filter((r:any) => slot.targetId === 'all' || r.activityCardId === slot.targetId).length, 0);
        }
        if (slot.source === 'activity_dur') {
          return dayData ? dayData.activityRecords.filter((r:any) => r.startTime.startsWith(format(start, 'HH')) && (slot.targetId === 'all' || r.activityCardId === slot.targetId)).reduce((a:any,r:any) => a+r.duration, 0)
                         : records.reduce((a:any, d:any) => a + d.activityRecords.filter((r:any) => slot.targetId === 'all' || r.activityCardId === slot.targetId).reduce((b:any,r:any) => b+r.duration,0), 0);
        }
        if (slot.source === 'nutrient' && slot.targetId) {
          return records.reduce((a:any, d:any) => a + d.mealSlots.reduce((b:any, s:any) => b + s.foodItems.reduce((c:any, item:any) => {
            const food = foodPool.find((f:any) => f.id === item.foodCardId);
            const val = food?.nutrients.find((n:any) => n.name === slot.targetId)?.valuePer100g || 0;
            return c + (item.weight * (val / 100));
          }, 0), 0), 0);
        }
        return 0;
      };

      const results: any = { label };
      chartSlots.forEach((slot: any) => {
        results[slot.id] = getMetric(slot);
      });
      return results;
    });
  }, [dailyRecords, period, selectedDate, chartSlots, activityPool, foodPool]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex bg-white p-2 rounded-[24px] shadow-sm border border-slate-200">
        {(['Day', 'Week', 'Month', 'Year'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[18px] transition-all ${period === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>{p}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {chartSlots.map((slot: ChartConfig) => (
          <div key={slot.id} className="bg-white p-6 sm:p-8 rounded-[48px] border border-slate-200 shadow-sm space-y-6 relative group">
            <div className="flex justify-between items-center px-2">
               <div>
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px] sm:text-sm">{slot.title}</h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase">{slot.source.replace('_', ' ')}</p>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => setEditingChart(slot)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"><Settings size={14} /></button>
                  <button onClick={() => onUpdateCharts(chartSlots.filter(c => c.id !== slot.id))} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
               </div>
            </div>
            <div className="h-48 sm:h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {slot.type === 'area' ? (
                  <AreaChart data={processedData}>
                    <defs><linearGradient id={`grad-${slot.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey={slot.id} stroke="#6366f1" fillOpacity={1} fill={`url(#grad-${slot.id})`} strokeWidth={3} />
                  </AreaChart>
                ) : slot.type === 'bar' ? (
                  <RechartsBarChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Bar dataKey={slot.id} fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={period === 'Day' ? 10 : undefined} />
                  </RechartsBarChart>
                ) : (
                  <AreaChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Line type="monotone" dataKey={slot.id} stroke="#f59e0b" strokeWidth={3} dot={false} connectNulls />
                    <Area dataKey={slot.id} fill="none" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ))}
        <button onClick={() => setEditingChart({ id: Math.random().toString(36).substr(2, 9), title: 'New Chart', type: 'bar', source: 'calories' })} className="w-full py-8 border-4 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-indigo-300 hover:text-indigo-600 transition-all font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs">
          <Plus size={32} />
          Add Custom Graph Slot
        </button>
      </div>

      {editingChart && (
        <ChartConfigModal 
          config={editingChart} 
          activityPool={activityPool}
          foodPool={foodPool}
          onSave={(updated) => {
            const idx = chartSlots.findIndex(c => c.id === updated.id);
            if (idx > -1) { const next = [...chartSlots]; next[idx] = updated; onUpdateCharts(next); }
            else onUpdateCharts([...chartSlots, updated]);
            setEditingChart(null);
          }}
          onClose={() => setEditingChart(null)}
        />
      )}
    </div>
  );
};

const ChartConfigModal = ({ config, activityPool, foodPool, onSave, onClose }: any) => {
  const [data, setData] = useState({ ...config });
  
  const allNutrientNames = useMemo(() => {
    const names = new Set<string>();
    foodPool.forEach((f: any) => f.nutrients.forEach((n: any) => names.add(n.name)));
    return Array.from(names);
  }, [foodPool]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[48px] p-6 sm:p-10 shadow-2xl animate-in zoom-in-95">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 sm:mb-8">Configure Chart</h3>
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Graph Title</label>
            <input type="text" value={data.title} onChange={e => setData({...data, title: e.target.value})} className="w-full px-5 sm:px-6 py-3 sm:py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none font-bold text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Source</label>
                <select value={data.source} onChange={e => setData({...data, source: e.target.value as any, targetId: ''})} className="w-full px-3 sm:px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-[10px] sm:text-xs">
                  <option value="calories">Calories</option>
                  <option value="energy">Energy Score</option>
                  <option value="fasting">Fasting Win</option>
                  <option value="activity_freq">Act. Frequency</option>
                  <option value="activity_dur">Act. Duration</option>
                  <option value="nutrient">Nutrient Gms</option>
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                <select value={data.type} onChange={e => setData({...data, type: e.target.value as any})} className="w-full px-3 sm:px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-[10px] sm:text-xs">
                  <option value="area">Area</option>
                  <option value="line">Line</option>
                  <option value="bar">Bar</option>
                </select>
             </div>
          </div>
          
          {(data.source === 'activity_freq' || data.source === 'activity_dur') && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Activity</label>
              <select value={data.targetId} onChange={e => setData({...data, targetId: e.target.value})} className="w-full px-3 sm:px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-[10px] sm:text-xs">
                <option value="all">All Activities</option>
                {activityPool.map((p:any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {data.source === 'nutrient' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Nutrient</label>
              <select value={data.targetId} onChange={e => setData({...data, targetId: e.target.value})} className="w-full px-3 sm:px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-[10px] sm:text-xs">
                <option value="">-- Choose --</option>
                {allNutrientNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-4 mt-8 sm:mt-10">
           <button onClick={onClose} className="flex-1 py-3 sm:py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
           <button onClick={() => onSave(data)} className="flex-1 py-3 sm:py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-200">Save Slot</button>
        </div>
      </div>
    </div>
  );
};

// --- ACTIVITY VIEW ---

const ActivityView = ({ data, pool, onAddActivity, onUpdateActivity, onRemoveActivity }: any) => {
  const totalBurned = data.activityRecords.reduce((acc: number, rec: any) => { const card = pool.find((c: any) => c.id === rec.activityCardId); return acc + (rec.duration * (card?.calorieBurnRate || 0)); }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-blue-600 rounded-[48px] p-8 sm:p-10 text-white shadow-xl shadow-blue-100 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
        <div>
           <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Energy Spent</p>
           <h2 className="text-4xl sm:text-5xl font-black">{Math.round(totalBurned)} <span className="text-xl font-normal opacity-60">kcal</span></h2>
        </div>
        <ActivityIcon size={40} className="opacity-20 sm:size-12" />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Timeline</h3>
        <div className="relative pl-8 sm:pl-10 space-y-6 before:content-[''] before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-[3px] before:bg-slate-200 before:rounded-full">
          {data.activityRecords.length === 0 && <p className="text-slate-400 text-xs font-bold italic py-4">No activities logged today.</p>}
          {data.activityRecords.map((rec: any) => {
            const card = pool.find((c: any) => c.id === rec.activityCardId);
            return (
              <div key={rec.id} className="relative bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 border border-slate-100 shadow-sm flex justify-between items-center group">
                <div className="absolute -left-[25px] sm:-left-[32px] top-1/2 -translate-y-1/2 w-4 h-4 sm:w-6 sm:h-6 rounded-full border-4 border-blue-500 bg-white z-10 shadow-md"></div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 text-blue-600 rounded-[18px] sm:rounded-3xl flex items-center justify-center shadow-inner">{getIcon(card?.icon || 'Accessibility')}</div>
                  <div>
                    <h4 className="font-black text-slate-800 text-[10px] sm:text-xs uppercase tracking-widest">{card?.name}</h4>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                       <div className="flex items-center bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-slate-100">
                          <Clock size={8} className="text-slate-400 mr-1.5 sm:mr-2" />
                          <input type="time" value={rec.startTime} onChange={(e) => onUpdateActivity(rec.id, { startTime: e.target.value })} className="bg-transparent text-[9px] sm:text-[10px] font-black text-slate-600 w-12 sm:w-14 focus:outline-none" />
                       </div>
                       <div className="flex items-center bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-slate-100">
                          <Timer size={8} className="text-slate-400 mr-1.5 sm:mr-2" />
                          <input type="number" value={rec.duration} onChange={(e) => onUpdateActivity(rec.id, { duration: Number(e.target.value) })} className="bg-transparent text-[9px] sm:text-[10px] font-black text-slate-600 w-8 sm:w-10 focus:outline-none" />
                          <span className="text-[7px] sm:text-[8px] text-slate-300 ml-0.5 sm:ml-1">MIN</span>
                       </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] sm:text-[11px] font-black text-blue-600">-{Math.round(rec.duration * (card?.calorieBurnRate || 0))} kcal</span>
                  <button onClick={() => onRemoveActivity(rec.id)} className="p-1 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-white p-6 sm:p-8 rounded-[48px] border border-slate-200 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6 text-center sm:text-left">Quick Add Activity</h3>
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {pool.slice(0, 12).map((card: any) => (
            <button key={card.id} onClick={() => onAddActivity(card.id)} className="bg-slate-50 p-2 sm:p-3 rounded-[20px] sm:rounded-[24px] border border-slate-100 flex flex-col items-center gap-1.5 sm:gap-2 hover:border-blue-300 hover:bg-white transition-all group active:scale-90">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors">{getIcon(card.icon)}</div>
              <span className="text-[7px] sm:text-[8px] font-black text-slate-600 truncate w-full text-center uppercase tracking-tighter">{card.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- ENERGY VIEW ---

const EnergyView = ({ data, onLog, onRemoveRecord }: any) => {
  const avgEnergy = data.energyRecords.length > 0 
    ? (data.energyRecords.reduce((acc: number, r: any) => acc + r.level, 0) / data.energyRecords.length).toFixed(1)
    : '--';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-amber-500 rounded-[48px] p-8 sm:p-10 text-white shadow-xl shadow-amber-100 flex justify-between items-center relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="relative z-10">
          <p className="text-amber-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Avg Energy Level</p>
          <h2 className="text-4xl sm:text-5xl font-black">{avgEnergy} <span className="text-xl font-normal opacity-60">/ 10</span></h2>
        </div>
        <Zap size={40} className="opacity-20 relative z-10 sm:size-12" />
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-[40px] border border-slate-200 shadow-sm text-center">
        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6 sm:mb-8">How are you feeling right now?</h3>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
            <button
              key={level}
              onClick={() => onLog(level)}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-slate-50 hover:bg-amber-500 hover:text-white text-slate-600 rounded-[14px] sm:rounded-2xl flex items-center justify-center text-[10px] sm:text-xs font-black transition-all active:scale-90 border border-slate-100"
            >
              {level}
            </button>
          ))}
        </div>
        <p className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-widest">Select a level to record your status</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">History</h3>
        <div className="space-y-3">
          {data.energyRecords.length === 0 && (
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 text-center text-slate-400 text-xs font-bold italic">
              No logs for today.
            </div>
          )}
          {[...data.energyRecords].reverse().map((rec: any) => (
            <div key={rec.id} className="bg-white p-4 sm:p-5 rounded-[24px] sm:rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center group transition-all hover:border-amber-200">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-3xl flex items-center justify-center font-black text-base sm:text-lg shadow-inner ${
                  rec.level > 7 ? 'bg-emerald-50 text-emerald-600' : 
                  rec.level > 4 ? 'bg-amber-50 text-amber-600' : 
                  'bg-rose-50 text-rose-600'
                }`}>
                  {rec.level}
                </div>
                <div>
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">{rec.time}</p>
                  <p className="text-[10px] sm:text-[11px] font-black text-slate-800 uppercase tracking-tight">Level {rec.level} recorded</p>
                </div>
              </div>
              <button onClick={() => onRemoveRecord(rec.id)} className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- CARD POOL COMPONENTS ---

const CardPoolView = ({ foodPool, activityPool, onSaveFood, onRemoveFood, onSaveActivity, onRemoveActivity }: any) => {
  const [activeTab, setActiveTab] = useState<'Food' | 'Activity'>('Food');
  const [editingCard, setEditingCard] = useState<any>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="flex justify-between items-center bg-white p-1.5 sm:p-2 rounded-[24px] border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-[18px]">
          <button onClick={() => setActiveTab('Food')} className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-[14px] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Food' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>Food</button>
          <button onClick={() => setActiveTab('Activity')} className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-[14px] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Activity' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>Activity</button>
        </div>
        <button onClick={() => setEditingCard({})} className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"><Plus size={24} sm:size={28} /></button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        {activeTab === 'Food' ? foodPool.map((food: FoodCard) => (
          <div key={food.id} className="bg-white rounded-[32px] sm:rounded-[40px] border border-slate-200 shadow-sm relative group overflow-hidden flex flex-col hover:border-indigo-300 transition-all">
            <img src={food.image} className="w-full aspect-square object-cover" />
            <div className="p-4 sm:p-5">
              <h4 className="font-black text-slate-800 text-[10px] sm:text-[11px] truncate uppercase tracking-tight mb-0.5 sm:mb-1">{food.name}</h4>
              <p className="text-[8px] sm:text-[9px] text-indigo-500 font-black uppercase tracking-widest">{food.caloriesPer100g} cal/100g</p>
            </div>
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditingCard(food)} className="bg-white/90 p-2 sm:p-2.5 rounded-full shadow-xl text-indigo-600"><Edit2 size={12} sm:size={14} /></button>
              <button onClick={() => onRemoveFood(food.id)} className="bg-white/90 p-2 sm:p-2.5 rounded-full shadow-xl text-red-500"><Trash2 size={12} sm:size={14} /></button>
            </div>
          </div>
        )) : activityPool.map((card: ActivityCard) => (
          <div key={card.id} className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col items-center gap-4 sm:gap-5 group relative hover:border-blue-300 transition-all text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-[24px] sm:rounded-[32px] flex items-center justify-center text-blue-600 shadow-inner">{getIcon(card.icon)}</div>
            <div className="text-center">
               <h4 className="font-black text-slate-800 text-[9px] sm:text-[10px] uppercase tracking-widest">{card.name}</h4>
               <p className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 sm:mt-1">{card.calorieBurnRate} cal/min</p>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditingCard(card)} className="p-2 sm:p-2.5 bg-white shadow-xl rounded-full text-blue-600"><Edit2 size={12} sm:size={14} /></button>
              <button onClick={() => onRemoveActivity(card.id)} className="p-2 sm:p-2.5 bg-white shadow-xl rounded-full text-red-500"><Trash size={12} sm:size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      {editingCard && <EditModal activeTab={activeTab} card={editingCard} onSave={(updated: any) => { if (activeTab === 'Food') onSaveFood(updated); else onSaveActivity(updated); setEditingCard(null); }} onClose={() => setEditingCard(null)} />}
    </div>
  );
};

const EditModal = ({ activeTab, card, onSave, onClose }: any) => {
  const [formData, setFormData] = useState({ 
    id: card.id || Math.random().toString(36).substr(2, 9),
    name: card.name || '',
    caloriesPer100g: card.caloriesPer100g || 0,
    calorieBurnRate: card.calorieBurnRate || 0,
    defaultWeight: card.defaultWeight || 100,
    nutrients: card.nutrients || [],
    icon: card.icon || 'Accessibility',
    image: card.image || `https://picsum.photos/seed/${Math.random()}/200/200`
  });

  const addNutrient = () => {
    setFormData({
      ...formData,
      nutrients: [...formData.nutrients, { id: Math.random().toString(36).substr(2, 9), name: '', valuePer100g: 0, unit: 'g' }]
    });
  };

  const updateNutrient = (id: string, field: string, val: any) => {
    setFormData({
      ...formData,
      nutrients: formData.nutrients.map((n: any) => n.id === id ? { ...n, [field]: val } : n)
    });
  };

  const removeNutrient = (id: string) => {
    setFormData({ ...formData, nutrients: formData.nutrients.filter((n: any) => n.id !== id) });
  };

  const handleFileChange = async (e: any) => { const file = e.target.files?.[0]; if (file) { const base64 = await fileToBase64(file); setFormData({ ...formData, image: base64 }); } };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-white w-full max-w-md rounded-[48px] p-6 sm:p-10 shadow-2xl animate-in zoom-in-95 relative overflow-hidden max-h-[90vh] flex flex-col">
        <div className={`absolute top-0 left-0 right-0 h-16 sm:h-24 ${activeTab === 'Food' ? 'bg-indigo-600' : 'bg-blue-600'} opacity-10`}></div>
        <div className="flex justify-between items-center mb-6 sm:mb-8 relative z-10 shrink-0">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">{card.id ? 'Modify' : 'Create'} Card</h3>
          <button onClick={onClose} className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-xl active:scale-90 transition-transform"><X size={20} sm:size={24} /></button>
        </div>
        
        <div className="space-y-6 sm:space-y-8 relative z-10 overflow-y-auto pr-2 no-scrollbar pb-4">
          {activeTab === 'Food' && (
            <div className="flex flex-col items-center shrink-0">
              <label className="relative w-28 h-28 sm:w-32 sm:h-32 bg-slate-50 rounded-[32px] sm:rounded-[40px] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer overflow-hidden group hover:border-indigo-400 transition-all">
                {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <><Camera size={28} sm:size={32} /><span className="text-[9px] sm:text-[10px] font-black mt-2 uppercase tracking-widest">Image</span></>}
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          )}
          
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Display Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 sm:px-7 py-3 sm:py-5 bg-slate-50 rounded-[24px] sm:rounded-[28px] border border-slate-100 focus:outline-none font-black text-xs sm:text-sm uppercase shadow-inner" placeholder="E.g. Banana" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-slate-50 p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] border border-slate-100 shadow-inner">
               <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 sm:mb-2">{activeTab === 'Food' ? 'Kcal/100g' : 'Kcal/Min'}</label>
               <input type="number" value={activeTab === 'Food' ? formData.caloriesPer100g : formData.calorieBurnRate} onChange={(e) => setFormData(activeTab === 'Food' ? { ...formData, caloriesPer100g: Number(e.target.value) } : { ...formData, calorieBurnRate: Number(e.target.value) })} className="w-full bg-transparent text-lg sm:text-xl font-black text-slate-700 focus:outline-none" />
            </div>
            {activeTab === 'Food' ? (
               <div className="bg-slate-50 p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] border border-slate-100 shadow-inner">
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 sm:mb-2">Std. Portion (g)</label>
                  <input type="number" value={formData.defaultWeight} onChange={(e) => setFormData({ ...formData, defaultWeight: Number(e.target.value) })} className="w-full bg-transparent text-lg sm:text-xl font-black text-slate-700 focus:outline-none" />
               </div>
            ) : (
               <div className="bg-slate-50 p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] border border-slate-100 shadow-inner">
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 sm:mb-2">Icon</label>
                  <select value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full bg-transparent font-black text-slate-700 focus:outline-none text-[9px] sm:text-[10px] uppercase">
                    {Object.keys(ICON_MAP).map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
               </div>
            )}
          </div>

          {activeTab === 'Food' && (
            <div className="space-y-4 sm:space-y-6 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center px-2">
                <h4 className="text-[10px] sm:text-[12px] font-black text-slate-900 uppercase tracking-widest">Nutrient Slots</h4>
                <button onClick={addNutrient} className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors shadow-sm"><Plus size={16} /></button>
              </div>
              <div className="space-y-3">
                {formData.nutrients.map((nut: any) => (
                  <div key={nut.id} className="flex items-center gap-2 sm:gap-3 bg-slate-50 p-3 sm:p-4 rounded-[20px] sm:rounded-[28px] border border-slate-100 relative group shadow-inner">
                    <input 
                      type="text" 
                      placeholder="Name" 
                      value={nut.name} 
                      onChange={e => updateNutrient(nut.id, 'name', e.target.value)} 
                      className="flex-[2] bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-tight focus:outline-none border border-slate-200 min-w-0" 
                    />
                    <input 
                      type="number" 
                      placeholder="Amt" 
                      value={nut.valuePer100g} 
                      onChange={e => updateNutrient(nut.id, 'valuePer100g', Number(e.target.value))} 
                      className="flex-1 bg-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black focus:outline-none border border-slate-200 text-center min-w-0" 
                    />
                    <input 
                      type="text" 
                      placeholder="Unt" 
                      value={nut.unit} 
                      onChange={e => updateNutrient(nut.id, 'unit', e.target.value)} 
                      className="w-8 sm:w-10 bg-white px-1 sm:px-2 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black focus:outline-none border border-slate-200 text-center uppercase min-w-0" 
                    />
                    <button onClick={() => removeNutrient(nut.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors shrink-0"><Trash size={14} /></button>
                  </div>
                ))}
                {formData.nutrients.length === 0 && <p className="text-center text-slate-300 text-[9px] font-black uppercase tracking-widest py-4">No nutrient slots added</p>}
              </div>
            </div>
          )}
        </div>
        
        <button onClick={() => onSave(formData)} className={`w-full mt-6 sm:mt-8 py-4 sm:py-6 shrink-0 ${activeTab === 'Food' ? 'bg-indigo-600 shadow-indigo-200' : 'bg-blue-600 shadow-blue-200'} text-white rounded-[24px] sm:rounded-[32px] font-black shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs`}>Save To Pool</button>
      </div>
    </div>
  );
};

export default App;
