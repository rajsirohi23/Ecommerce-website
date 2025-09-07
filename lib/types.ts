export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating: number
  reviewCount: number
  inStock: boolean
  features?: string[]
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  createdAt: Date
  shippingAddress: Address
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}
