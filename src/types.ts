/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AppScreen {
  SPLASH = 'SPLASH',
  ONBOARDING = 'ONBOARDING',
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  DETAILS = 'DETAILS',
  CART = 'CART',
  ADDRESS_SETUP = 'ADDRESS_SETUP',
  PAYMENT = 'PAYMENT',
  TRACKING = 'TRACKING',
  FAVORITES = 'FAVORITES',
  PROFILE = 'PROFILE'
}

export type Language = 'en' | 'te'; // English or Telugu

export interface FoodItem {
  id: string;
  name: string;
  nameTelugu: string;
  category: 'tiffins' | 'meals' | 'fastfood' | 'drinks' | 'desserts';
  image: string;
  rating: number;
  deliveryTime: number; // in mins
  price: number; // in INR
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  ingredients: string[];
  ingredientsTelugu: string[];
  healthIndicator: 'green' | 'yellow' | 'red'; // health level: green = healthy, yellow = medium, red = heavy
  description: string;
  descriptionTelugu: string;
  popular: boolean;
  healthy: boolean;
  quick: boolean;
}

export interface CartItem {
  foodId: string;
  quantity: number;
}

export interface UserAddress {
  id: string;
  label: string; // Home, Work, Friends
  labelTelugu: string;
  addressLine: string;
  addressLineTelugu: string;
  isDefault: boolean;
  city: string;
}

export interface OrderHistoryItem {
  id: string;
  date: string;
  foodName: string;
  amount: number;
  status: 'Delivered' | 'Pending' | 'Cancelled';
}

export interface AppNotification {
  id: string;
  timeLabel: string;
  message: string;
  messageTelugu: string;
  icon: string;
  type: string;
}
