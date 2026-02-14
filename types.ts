
export interface FoodCard {
  id: string;
  name: string;
  image: string;
  defaultWeight: number;
  caloriesPer100g: number;
  protein?: number;
  fat?: number;
  carb?: number;
  customTags?: string[];
}

export interface MealSlot {
  id: string;
  label: string;
  time: string;
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
  calorieBurnRate?: number; // calories per minute
  tags?: string[];
}

export interface ActivityRecord {
  id: string;
  date: string;
  activityCardId: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  notes?: string;
}

export interface EnergyRecord {
  id: string;
  date: string;
  time: string;
  level: number; // 1–5
  mood?: string;
  note?: string;
}

export type ViewType = 'Nutrition' | 'Activity' | 'Energy' | 'CardPool' | 'Analytics';

export interface DailyData {
  date: string;
  mealSlots: MealSlot[];
  activityRecords: ActivityRecord[];
  energyRecords: EnergyRecord[];
}
