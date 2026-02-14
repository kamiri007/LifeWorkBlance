
export interface NutrientSlot {
  id: string;
  name: string;
  valuePer100g: number;
  unit: string;
}

export interface FoodCard {
  id: string;
  name: string;
  image: string;
  defaultWeight: number;
  caloriesPer100g: number;
  nutrients: NutrientSlot[];
  customTags?: string[];
}

export interface MealSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  foodItems: {
    foodCardId: string;
    weight: number;
    calculatedCalories: number;
  }[];
}

export interface ActivityCard {
  id: string;
  name: string;
  icon: string;
  defaultDuration?: number;
  calorieBurnRate?: number; 
  tags?: string[];
}

export interface ActivityRecord {
  id: string;
  date: string;
  activityCardId: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes?: string;
}

export interface EnergyRecord {
  id: string;
  date: string;
  time: string;
  level: number;
  mood?: string;
  note?: string;
}

export type ChartType = 'bar' | 'line' | 'area';
export type DataSource = 'activity_freq' | 'activity_dur' | 'nutrient' | 'fasting' | 'energy' | 'calories';

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  source: DataSource;
  targetId?: string; // specific activityId or nutrient name
}

export type ViewType = 'Nutrition' | 'Activity' | 'Energy' | 'Fasting' | 'CardPool' | 'Analytics';

export interface DailyData {
  date: string;
  mealSlots: MealSlot[];
  activityRecords: ActivityRecord[];
  energyRecords: EnergyRecord[];
}
