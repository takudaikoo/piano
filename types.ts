export type CategoryId = 'all' | 'intro' | 'reading' | 'rhythm' | 'technique' | 'seasonal';

export interface Category {
  id: CategoryId;
  label: string;
  color: string;
}

export interface Product {
  id: string;
  title: string;
  catchCopy: string;
  price: number;
  category: CategoryId;
  isNew?: boolean;
  isPopular?: boolean;
  image: string;
  images: string[];
  specs: {
    format: string;
    size: string;
    pages: number;
  };
  targetAudience: string[]; // "For this kind of student"
  benefits: string[]; // "What changes?"
  description: string;
  howTo: string;
}

export interface Review {
  id: string;
  author: string;
  content: string;
  role: string;
}