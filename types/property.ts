export interface Category {
  id: string;
  name: string;
}

export interface Landlord {
  id: string;
  name: string;
  email: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  imageUrl?: string | null;
  status: "AVAILABLE" | "RENTED" | "UNAVAILABLE";
  categoryId: string;
  category?: Category;
  landlord?: Landlord;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertiesResponse {
  success: boolean;
  message: string;
  data: Property[];
}

export interface PropertyResponse {
  success: boolean;
  message: string;
  data: Property;
}