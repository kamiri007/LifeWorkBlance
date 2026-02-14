
import React from 'react';
import { FoodCard, ActivityCard } from './types';
import { 
  Apple, Coffee, Utensils, Moon, Dumbbell, BookOpen, Briefcase, Bath, 
  Accessibility, Footprints, Gamepad2, ShoppingBag, Music, Sparkles, 
  Users, Plane, Heart, Tv
} from 'lucide-react';

export const INITIAL_FOOD_CARDS: FoodCard[] = [
  {
    id: 'f1',
    name: 'Oatmeal',
    image: 'https://picsum.photos/seed/oatmeal/200/200',
    defaultWeight: 200,
    caloriesPer100g: 68,
    nutrients: [
      { id: 'n1', name: 'Protein', valuePer100g: 2.4, unit: 'g' },
      { id: 'n2', name: 'Carbs', valuePer100g: 12, unit: 'g' },
      { id: 'n3', name: 'Fiber', valuePer100g: 1.7, unit: 'g' }
    ],
    customTags: ['Breakfast']
  },
  {
    id: 'f2',
    name: 'Grilled Chicken',
    image: 'https://picsum.photos/seed/chicken/200/200',
    defaultWeight: 150,
    caloriesPer100g: 165,
    nutrients: [
      { id: 'n1', name: 'Protein', valuePer100g: 31, unit: 'g' },
      { id: 'n2', name: 'Fat', valuePer100g: 3.6, unit: 'g' }
    ],
    customTags: ['Lunch', 'Protein']
  }
];

export const INITIAL_ACTIVITY_CARDS: ActivityCard[] = [
  { id: 'a1', name: 'Sleep', icon: 'Moon', defaultDuration: 480, calorieBurnRate: 1 },
  { id: 'a2', name: 'Workout', icon: 'Dumbbell', defaultDuration: 60, calorieBurnRate: 8 },
  { id: 'a3', name: 'Walking', icon: 'Footprints', defaultDuration: 30, calorieBurnRate: 4 },
  { id: 'a4', name: 'Gaming', icon: 'Gamepad2', defaultDuration: 60, calorieBurnRate: 1.5 },
  { id: 'a5', name: 'Work', icon: 'Briefcase', defaultDuration: 480, calorieBurnRate: 2 },
];

export const ICON_MAP: Record<string, React.ReactNode> = {
  'Moon': <Moon size={20} />,
  'Dumbbell': <Dumbbell size={20} />,
  'BookOpen': <BookOpen size={20} />,
  'Briefcase': <Briefcase size={20} />,
  'Bath': <Bath size={20} />,
  'Coffee': <Coffee size={20} />,
  'Utensils': <Utensils size={20} />,
  'Apple': <Apple size={20} />,
  'Footprints': <Footprints size={20} />,
  'Gamepad2': <Gamepad2 size={20} />,
  'ShoppingBag': <ShoppingBag size={20} />,
  'Music': <Music size={20} />,
  'Sparkles': <Sparkles size={20} />,
  'Users': <Users size={20} />,
  'Plane': <Plane size={20} />,
  'Heart': <Heart size={20} />,
  'Tv': <Tv size={20} />,
  'Accessibility': <Accessibility size={20} />
};

export const getIcon = (name: string) => {
  return ICON_MAP[name] || <Accessibility size={20} />;
};
