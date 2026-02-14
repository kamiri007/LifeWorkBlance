
import React from 'react';
import { FoodCard, ActivityCard } from './types';
import { Apple, Coffee, Utensils, Moon, Dumbbell, BookOpen, Briefcase, Bath, Accessibility } from 'lucide-react';

export const INITIAL_FOOD_CARDS: FoodCard[] = [
  {
    id: 'f1',
    name: 'Oatmeal',
    image: 'https://picsum.photos/seed/oatmeal/200/200',
    defaultWeight: 200,
    caloriesPer100g: 68,
    protein: 2.4,
    fat: 1.4,
    carb: 12,
    customTags: ['Breakfast', 'Healthy']
  },
  {
    id: 'f2',
    name: 'Grilled Chicken Breast',
    image: 'https://picsum.photos/seed/chicken/200/200',
    defaultWeight: 150,
    caloriesPer100g: 165,
    protein: 31,
    fat: 3.6,
    carb: 0,
    customTags: ['Protein', 'Lunch']
  },
  {
    id: 'f3',
    name: 'Avocado Toast',
    image: 'https://picsum.photos/seed/avocado/200/200',
    defaultWeight: 120,
    caloriesPer100g: 220,
    protein: 5,
    fat: 15,
    carb: 20,
    customTags: ['Snack', 'Breakfast']
  }
];

export const INITIAL_ACTIVITY_CARDS: ActivityCard[] = [
  { id: 'a1', name: 'Sleep', icon: 'Moon', defaultDuration: 480, calorieBurnRate: 1 },
  { id: 'a2', name: 'Workout', icon: 'Dumbbell', defaultDuration: 60, calorieBurnRate: 8 },
  { id: 'a3', name: 'Reading', icon: 'BookOpen', defaultDuration: 30, calorieBurnRate: 1.5 },
  { id: 'a4', name: 'Work', icon: 'Briefcase', defaultDuration: 480, calorieBurnRate: 2 },
  { id: 'a5', name: 'Shower', icon: 'Bath', defaultDuration: 15, calorieBurnRate: 2 },
  { id: 'a6', name: 'Other', icon: 'Accessibility', defaultDuration: 30, calorieBurnRate: 2 },
];

export const getIcon = (name: string) => {
  switch (name) {
    case 'Moon': return <Moon size={20} />;
    case 'Dumbbell': return <Dumbbell size={20} />;
    case 'BookOpen': return <BookOpen size={20} />;
    case 'Briefcase': return <Briefcase size={20} />;
    case 'Bath': return <Bath size={20} />;
    case 'Coffee': return <Coffee size={20} />;
    case 'Utensils': return <Utensils size={20} />;
    case 'Apple': return <Apple size={20} />;
    default: return <Accessibility size={20} />;
  }
};
