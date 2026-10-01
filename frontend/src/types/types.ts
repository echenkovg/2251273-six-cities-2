import { CITIES, Sorting, TYPES, UserType } from '../const';

export type CityName = typeof CITIES[number];
export type Type = typeof TYPES[number];
export type SortName = keyof typeof Sorting;

export type Location = {
  latitude: number;
  longitude: number;
  zoom?: number;
};

export type City = {
  name: CityName;
  location: Location;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  type: UserType;
  favorites?: string[];
};

export type Comment = {
  id: string;
  text: string;
  createdAt: string;
  rating: number;
  user: User;
};

export type Offer = {
  id: string;
  price: number;
  rating: number;
  title: string;
  isPremium: boolean;
  isFavorite: boolean;
  cityName: CityName;
  cityLatitude: number;
  cityLongitude: number;
  cityZoom: number;
  offerLatitude: number;
  offerLongitude: number;
  offerZoom: number;
  previewImage: string;
  type: Type;
  bedrooms: number;
  description: string;
  offerGoods: string[];
  user: User;
  images: string[];
  maxAdults: number;
  commentsCount: number;
};

export type NewOffer = Omit<
  Offer,
  'id' | 'rating' | 'isFavorite' | 'user' | 'commentsCount'
>;

export type NewComment = Pick<Comment, 'text' | 'rating'>;
export type UserAuth = { email: string; password: string };
export type UserRegister = {
  name: string;
  email: string;
  password: string;
  avatar?: File;
};
