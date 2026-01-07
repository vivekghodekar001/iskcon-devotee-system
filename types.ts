
export enum InitiationStatus {
  SHELTER = 'Shelter',
  ASPIRANT = 'Aspirant',
  FIRST_INITIATED = 'First Initiated',
  SECOND_INITIATED = 'Second Initiated',
  UNINITIATED = 'Uninitiated'
}

export interface Devotee {
  id: string;
  name: string;
  spiritualName?: string;
  email: string;
  phone: string;
  photo?: string;
  status: InitiationStatus;
  joinedAt: string;
  hobbies?: string;
  dailyMalas: number;
}

export interface Session {
  id: string;
  title: string;
  date: string;
  location: string;
  facilitator: string;
  attendeeIds: string[];
}

export interface GitaQuote {
  verse: string;
  translation: string;
  purport: string;
  chapter: number;
  text: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type?: 'quote' | 'system';
}

export interface InventoryItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  category: string;
  lastUpdated: string;
}

export interface MealPlan {
  id: string;
  date: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  items: string[];
  chefName: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
}
