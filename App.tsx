
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, BarChart3, LayoutGrid, Calendar, 
  Trash2, ChevronLeft, ChevronRight, UtensilsCrossed, Zap, Activity as ActivityIcon, 
  Camera, X, Trash, Clock, Layers
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Line
} from 'recharts';
import { format, addDays, subDays } from 'date-fns';
import { 
  FoodCard, ActivityCard, ActivityRecord, EnergyRecord, MealSlot, ViewType, DailyData 
} from './types';
import { INITIAL_FOOD_CARDS, INITIAL_ACTIVITY_CARDS, getIcon } from './constants';

// Helper for image to base64 for local storage persistence
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
  
  // State Storage - Fully offline via LocalStorage
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

  // Local sync to localStorage
  useEffect(() => {
    localStorage.setItem('foodPool', JSON.stringify(foodPool));
    localStorage.setItem('activityPool', JSON.stringify(activityPool));
    localStorage.setItem('dailyRecords', JSON.stringify(dailyRecords));
  }, [foodPool, activityPool, dailyRecords]);

  // Current Day's Data Helper
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const currentDayData = useMemo(() => {
    const data = dailyRecords.find(d => d.date === dateStr);
    if (data) return data;
    
    return {
      date: dateStr,
      mealSlots: [
        { id: 's1', label: 'Breakfast', time: '08:00', foodItems: [] },
        { id: 's2', label: 'Lunch', time: '12:30', foodItems: [] },
        { id: 's3', label: 'Dinner', time: '19:00', foodItems: [] }
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

  // --- NUTRITION LOGIC ---
  const handleAddMealSlot = () => {
    if (currentDayData.mealSlots.length >= 9) return;
    const newSlot: MealSlot = {
      id: Math.random().toString(36).substr(2, 9),
      label: `Meal ${currentDayData.mealSlots.length + 1}`,
      time: format(new Date(), 'HH:mm'),
      foodItems: []
    };
    updateCurrentDayData({ mealSlots: [...currentDayData.mealSlots, newSlot] });
  };

  const handleUpdateMealSlotTime = (slotId: string, newTime: string) => {
    const nextSlots = currentDayData.mealSlots.map(s => 
      s.id === slotId ? { ...s, time: newTime } : s
    );
    updateCurrentDayData({ mealSlots: nextSlots });
  };

  const handleRemoveMealSlot = (id: string) => {
    updateCurrentDayData({
      mealSlots: currentDayData.mealSlots.filter(s => s.id !== id)
    });
  };

  const handleAddFoodToSlot = (slotId: string, food: FoodCard) => {
    const weight = food.defaultWeight;
    const calories = Math.round(weight * (food.caloriesPer100g / 100));
    const nextSlots = currentDayData.mealSlots.map(s => {
      if (s.id === slotId) {
        return {
          ...s,
          foodItems: [...s.foodItems, { foodCardId: food.id, weight, calculatedCalories: calories }]
        };
      }
      return s;
    });
    updateCurrentDayData({ mealSlots: nextSlots });
  };

  // --- ACTIVITY LOGIC ---
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

  // --- ENERGY LOGIC ---
  const handleLogEnergy = (level: number) => {
    const newRecord: EnergyRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: dateStr,
      time: format(new Date(), 'HH:mm'),
      level
    };
    updateCurrentDayData({ energyRecords: [...currentDayData.energyRecords, newRecord] });
  };

  const Navigation = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-50">
      <NavItem icon={<UtensilsCrossed size={20} />} label="Nutrition" active={currentView === 'Nutrition'} onClick={() => setCurrentView('Nutrition')} />
      <NavItem icon={<ActivityIcon size={20} />} label="Activity" active={currentView === 'Activity'} onClick={() => setCurrentView('Activity')} />
      <NavItem icon={<Zap size={20} />} label="Energy" active={currentView === 'Energy'} onClick={() => setCurrentView('Energy')} />
      <NavItem icon={<BarChart3 size={20} />} label="Stats" active={currentView === 'Analytics'} onClick={() => setCurrentView('Analytics')} />
      <NavItem icon={<LayoutGrid size={20} />} label="Pool" active={currentView === 'CardPool'} onClick={() => setCurrentView('CardPool')} />
    </nav>
  );

  const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-indigo-600 font-semibold' : 'text-slate-500'}`}>
      {icon}
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Zap size={18} />
          </div>
          <h1 className="font-bold text-lg text-slate-800 tracking-tight">LifeBalance</h1>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full border border-slate-200">
          <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-1 hover:bg-white rounded-full transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-medium px-1 text-slate-600">{format(selectedDate, 'MMM dd, yyyy')}</span>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-1 hover:bg-white rounded-full transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {currentView === 'Nutrition' && (
          <NutritionView 
            data={currentDayData} 
            pool={foodPool} 
            onAddSlot={handleAddMealSlot} 
            onRemoveSlot={handleRemoveMealSlot}
            onUpdateSlotTime={handleUpdateMealSlotTime}
            onAddFood={handleAddFoodToSlot}
            onRemoveFoodItem={(slotId, index) => {
              const nextSlots = currentDayData.mealSlots.map(s => {
                if (s.id === slotId) {
                  const items = [...s.foodItems];
                  items.splice(index, 1);
                  return { ...s, foodItems: items };
                }
                return s;
              });
              updateCurrentDayData({ mealSlots: nextSlots });
            }}
          />
        )}
        
        {currentView === 'Activity' && (
          <ActivityView 
            data={currentDayData} 
            pool={activityPool} 
            onAddActivity={handleAddActivity}
            onRemoveActivity={(id) => {
              updateCurrentDayData({
                activityRecords: currentDayData.activityRecords.filter(r => r.id !== id)
              });
            }}
          />
        )}
        
        {currentView === 'Energy' && (
          <EnergyView 
            data={currentDayData} 
            onLog={handleLogEnergy}
            onRemoveRecord={(id) => {
              updateCurrentDayData({
                energyRecords: currentDayData.energyRecords.filter(r => r.id !== id)
              });
            }}
          />
        )}

        {currentView === 'CardPool' && (
          <CardPoolView 
            foodPool={foodPool} 
            activityPool={activityPool}
            setFoodPool={setFoodPool}
            setActivityPool={setActivityPool}
          />
        )}

        {currentView === 'Analytics' && (
          <AnalyticsView dailyRecords={dailyRecords} />
        )}
      </main>

      <Navigation />
    </div>
  );
};

// --- SUB-VIEWS ---

const NutritionView = ({ data, pool, onAddSlot, onRemoveSlot, onUpdateSlotTime, onAddFood, onRemoveFoodItem }: { 
  data: DailyData, 
  pool: FoodCard[], 
  onAddSlot: () => void, 
  onRemoveSlot: (id: string) => void,
  onUpdateSlotTime: (id: string, time: string) => void,
  onAddFood: (slotId: string, food: FoodCard) => void,
  onRemoveFoodItem: (slotId: string, idx: number) => void
}) => {
  const [draggedFood, setDraggedFood] = useState<FoodCard | null>(null);
  const [search, setSearch] = useState('');

  const totalCals = data.mealSlots.reduce((acc, slot) => 
    acc + slot.foodItems.reduce((sAcc, item) => sAcc + item.calculatedCalories, 0), 0
  );

  const filteredPool = pool.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 flex justify-between items-center">
        <div>
          <p className="text-indigo-100 text-sm font-medium">Daily Intake</p>
          <h2 className="text-4xl font-bold">{totalCals} <span className="text-xl font-normal opacity-80">kcal</span></h2>
        </div>
        <div className="w-16 h-16 rounded-full border-4 border-indigo-400 flex items-center justify-center text-xs font-bold">
          {Math.round((totalCals / 2500) * 100)}%
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {data.mealSlots.map(slot => (
          <div 
            key={slot.id} 
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group"
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-indigo-50/50'); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove('bg-indigo-50/50'); }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('bg-indigo-50/50');
              if (draggedFood) onAddFood(slot.id, draggedFood);
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{slot.label}</span>
                <div className="flex items-center bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  <Clock size={12} className="text-slate-400 mr-1" />
                  <input 
                    type="time" 
                    value={slot.time} 
                    onChange={(e) => onUpdateSlotTime(slot.id, e.target.value)}
                    className="bg-transparent text-[10px] font-medium text-slate-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-medium text-indigo-600">
                  {slot.foodItems.reduce((a, b) => a + b.calculatedCalories, 0)} kcal
                </span>
                <button onClick={() => onRemoveSlot(slot.id)} className="text-slate-300 hover:text-red-500 group-hover:opacity-100 opacity-0 transition-opacity">
                  <Trash size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {slot.foodItems.length === 0 && (
                <div className="border-2 border-dashed border-slate-100 rounded-xl py-4 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                  <UtensilsCrossed size={16} strokeWidth={1.5} />
                  <span>Drag food here</span>
                </div>
              )}
              {slot.foodItems.map((item, idx) => {
                const food = pool.find(f => f.id === item.foodCardId);
                return (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-sm border border-slate-100 animate-in slide-in-from-left-2 duration-200">
                    <span className="text-slate-700 truncate max-w-[150px] font-medium">{food?.name || 'Unknown'}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200">{item.weight}g</span>
                      <span className="font-bold text-slate-900">{item.calculatedCalories} kcal</span>
                      <button onClick={() => onRemoveFoodItem(slot.id, idx)} className="text-slate-300 hover:text-red-500">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {data.mealSlots.length < 9 && (
          <button 
            onClick={onAddSlot}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:bg-white hover:border-indigo-300 hover:text-indigo-500 transition-all font-medium text-sm"
          >
            <Plus size={18} /> Add Meal Slot
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Card Library</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input 
              type="text" 
              placeholder="Search food..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1 bg-slate-100 rounded-full text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-300 w-32"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {filteredPool.slice(0, 12).map(food => (
            <div 
              key={food.id}
              draggable
              onDragStart={() => setDraggedFood(food)}
              onDragEnd={() => setDraggedFood(null)}
              onClick={() => {
                if (data.mealSlots.length > 0) onAddFood(data.mealSlots[0].id, food);
              }}
              className="flex-shrink-0 bg-slate-50 rounded-xl border border-slate-100 p-2 shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:bg-white transition-all group relative overflow-hidden"
            >
              <img src={food.image} alt={food.name} className="w-full aspect-square object-cover rounded-lg mb-2 shadow-sm" />
              <p className="text-[9px] font-bold text-slate-800 truncate">{food.name}</p>
              <p className="text-[8px] font-bold text-indigo-600">{Math.round(food.defaultWeight * (food.caloriesPer100g / 100))} kcal</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ActivityView = ({ data, pool, onAddActivity, onRemoveActivity }: { data: DailyData, pool: ActivityCard[], onAddActivity: (id: string) => void, onRemoveActivity: (id: string) => void }) => {
  const [search, setSearch] = useState('');
  const totalBurned = data.activityRecords.reduce((acc, rec) => {
    const card = pool.find(c => c.id === rec.activityCardId);
    return acc + (rec.duration * (card?.calorieBurnRate || 0));
  }, 0);

  const filteredPool = pool.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-100 flex justify-between items-center">
        <div>
          <p className="text-blue-100 text-sm font-medium">Activity Burn</p>
          <h2 className="text-4xl font-bold">{Math.round(totalBurned)} <span className="text-xl font-normal opacity-80">kcal</span></h2>
        </div>
        <ActivityIcon size={40} className="opacity-40" />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-500 px-1">Timeline</h3>
        <div className="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
          {data.activityRecords.length === 0 && (
             <p className="text-slate-400 text-sm italic py-4">No activities recorded for today.</p>
          )}
          {data.activityRecords.map(rec => {
            const card = pool.find(c => c.id === rec.activityCardId);
            return (
              <div key={rec.id} className="relative bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex justify-between items-center group animate-in slide-in-from-left-4 duration-300">
                <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-blue-500 bg-white z-10"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                    {getIcon(card?.icon || 'Accessibility')}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{card?.name || 'Activity'}</h4>
                    <p className="text-xs text-slate-400">{rec.startTime} • {rec.duration} mins</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-blue-600">-{Math.round(rec.duration * (card?.calorieBurnRate || 0))} kcal</span>
                  <button onClick={() => onRemoveActivity(rec.id)} className="text-slate-300 hover:text-red-500 group-hover:opacity-100 opacity-0 transition-opacity">
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800">Action Deck</h3>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input 
              type="text" 
              placeholder="Filter..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1 bg-slate-100 rounded-full text-[10px] focus:outline-none w-24"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {filteredPool.slice(0, 12).map(card => (
            <button 
              key={card.id} 
              onClick={() => onAddActivity(card.id)}
              className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center gap-1 hover:border-blue-300 hover:bg-white transition-all shadow-sm group"
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-600 group-hover:text-blue-500 transition-colors shadow-sm">
                {getIcon(card.icon)}
              </div>
              <span className="text-[9px] font-bold text-slate-700 truncate w-full text-center">{card.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const EnergyView = ({ data, onLog, onRemoveRecord }: { data: DailyData, onLog: (lvl: number) => void, onRemoveRecord: (id: string) => void }) => {
  const currentLvl = data.energyRecords.length > 0 ? data.energyRecords[data.energyRecords.length - 1].level : 3;
  
  const getLvlColor = (lvl: number) => {
    if (lvl <= 2) return 'bg-rose-500';
    if (lvl <= 3) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getLvlLabel = (lvl: number) => {
    const labels = ['Exhausted', 'Tired', 'Neutral', 'Energetic', 'Hyper'];
    return labels[lvl-1];
  };

  return (
    <div className="space-y-8">
      <div className={`rounded-3xl p-8 text-white shadow-xl transition-colors duration-500 flex flex-col items-center gap-4 ${getLvlColor(currentLvl)}`}>
        <p className="text-white/80 text-sm font-medium uppercase tracking-widest">Current State</p>
        <h2 className="text-5xl font-black">{getLvlLabel(currentLvl)}</h2>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`w-8 h-2 rounded-full ${i <= currentLvl ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-center font-bold text-slate-800">How do you feel right now?</h3>
        <div className="flex justify-between items-center max-w-xs mx-auto">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <button
              key={lvl}
              onClick={() => onLog(lvl)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all border-2 ${
                currentLvl === lvl ? 'border-slate-800 bg-slate-800 text-white scale-110 shadow-lg' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 px-1">Today's Log</h3>
        <div className="grid grid-cols-1 gap-2">
          {[...data.energyRecords].reverse().map(rec => (
            <div key={rec.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getLvlColor(rec.level)} shadow-sm`}></div>
                <div>
                   <span className="font-bold text-slate-800">{getLvlLabel(rec.level)}</span>
                   <span className="text-[10px] ml-2 text-slate-400">{rec.time}</span>
                </div>
              </div>
              <button onClick={() => onRemoveRecord(rec.id)} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CardPoolView = ({ foodPool, activityPool, setFoodPool, setActivityPool }: any) => {
  const [activeTab, setActiveTab] = useState<'Food' | 'Activity'>('Food');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newFood, setNewFood] = useState({ name: '', cals: 0, weight: 100, protein: 0, image: '' });
  const [newActivity, setNewActivity] = useState({ name: '', burn: 0, icon: 'Accessibility' });

  const filteredFood = foodPool.filter((f: FoodCard) => f.name.toLowerCase().includes(search.toLowerCase()));
  const filteredActivity = activityPool.filter((a: ActivityCard) => a.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddCard = () => {
    if (activeTab === 'Food') {
      const card: FoodCard = {
        id: Math.random().toString(36).substr(2, 9),
        name: newFood.name || 'Untitled Food',
        caloriesPer100g: newFood.cals,
        defaultWeight: newFood.weight,
        protein: newFood.protein,
        image: newFood.image || `https://picsum.photos/seed/${newFood.name}/200/200`
      };
      setFoodPool([...foodPool, card]);
    } else {
      const card: ActivityCard = {
        id: Math.random().toString(36).substr(2, 9),
        name: newActivity.name || 'Untitled Activity',
        icon: newActivity.icon,
        calorieBurnRate: newActivity.burn,
        defaultDuration: 30
      };
      setActivityPool([...activityPool, card]);
    }
    setShowAddModal(false);
    setNewFood({ name: '', cals: 0, weight: 100, protein: 0, image: '' });
    setNewActivity({ name: '', burn: 0, icon: 'Accessibility' });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setNewFood(prev => ({ ...prev, image: base64 }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-2 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('Food')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'Food' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>Food</button>
          <button onClick={() => setActiveTab('Activity')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'Activity' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>Activity</button>
        </div>
        <button onClick={() => setShowAddModal(true)} className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          <Plus size={24} />
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder={`Search ${activeTab.toLowerCase()} library...`} 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white rounded-3xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-sm"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {activeTab === 'Food' ? filteredFood.map((food: FoodCard, idx: number) => (
          <div 
            key={food.id} 
            className="bg-white rounded-3xl border border-slate-200 shadow-sm relative group overflow-hidden flex flex-col hover:border-indigo-300 transition-all animate-in zoom-in-95 hover:translate-y-[-4px]"
          >
            <img src={food.image} className="w-full aspect-[4/3] object-cover" />
            <div className="p-3">
              <h4 className="font-bold text-slate-800 text-xs truncate">{food.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{food.caloriesPer100g} kcal/100g</p>
            </div>
            <button onClick={() => setFoodPool(foodPool.filter((f: any) => f.id !== food.id))} className="absolute top-2 right-2 bg-white/90 backdrop-blur p-2 rounded-full shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={12} />
            </button>
          </div>
        )) : filteredActivity.map((card: ActivityCard, idx: number) => (
          <div 
            key={card.id} 
            className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col items-center gap-3 group relative hover:border-blue-300 transition-all animate-in zoom-in-95 hover:translate-y-[-4px]"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
              {getIcon(card.icon)}
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-800 text-xs">{card.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{card.calorieBurnRate} kcal/min</p>
            </div>
            <button onClick={() => setActivityPool(activityPool.filter((c: any) => c.id !== card.id))} className="absolute top-2 right-2 text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash size={12} />
            </button>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-24 ${activeTab === 'Food' ? 'bg-indigo-600' : 'bg-blue-600'} -z-10 opacity-10`}></div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">Create Card</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:text-slate-600"><X /></button>
            </div>
            <div className="space-y-6">
              {activeTab === 'Food' && (
                <div className="flex flex-col items-center">
                  <label className="relative w-28 h-28 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer overflow-hidden hover:border-indigo-400 transition-colors">
                    {newFood.image ? <img src={newFood.image} className="w-full h-full object-cover" /> : <><Camera size={24} /><span className="text-[10px] font-bold mt-1">PHOTO</span></>}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              )}
              <input 
                type="text" 
                value={activeTab === 'Food' ? newFood.name : newActivity.name}
                onChange={(e) => activeTab === 'Food' ? setNewFood({...newFood, name: e.target.value}) : setNewActivity({...newActivity, name: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none"
                placeholder="Card Title"
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  value={activeTab === 'Food' ? newFood.cals : newActivity.burn}
                  onChange={(e) => activeTab === 'Food' ? setNewFood({...newFood, cals: Number(e.target.value)}) : setNewActivity({...newActivity, burn: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100"
                  placeholder={activeTab === 'Food' ? 'Kcal/100g' : 'Kcal/min'}
                />
                {activeTab === 'Food' ? (
                  <input type="number" value={newFood.weight} onChange={(e) => setNewFood({...newFood, weight: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100" placeholder="Portion (g)"/>
                ) : (
                  <select value={newActivity.icon} onChange={(e) => setNewActivity({...newActivity, icon: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                    {['Accessibility', 'Moon', 'Dumbbell', 'BookOpen', 'Briefcase', 'Bath', 'Coffee', 'Apple'].map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                )}
              </div>
            </div>
            <button onClick={handleAddCard} className={`w-full mt-10 py-5 ${activeTab === 'Food' ? 'bg-indigo-600' : 'bg-blue-600'} text-white rounded-[24px] font-black shadow-xl active:scale-95`}>SAVE</button>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyticsView = ({ dailyRecords }: { dailyRecords: DailyData[] }) => {
  const chartData = useMemo(() => {
    return dailyRecords.map(day => {
      const calsIn = day.mealSlots.reduce((a, s) => a + s.foodItems.reduce((b, f) => b + f.calculatedCalories, 0), 0);
      const energyAvg = day.energyRecords.length > 0 ? day.energyRecords.reduce((a, r) => a + r.level, 0) / day.energyRecords.length : 3;
      return {
        date: format(new Date(day.date), 'MM/dd'),
        calories: calsIn,
        energy: energyAvg * 10,
      };
    }).sort((a,b) => a.date.localeCompare(b.date));
  }, [dailyRecords]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800">Calorie vs Energy Trends</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="calories" stroke="#4f46e5" fillOpacity={1} fill="url(#colorCals)" strokeWidth={3} />
              <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={3} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default App;
