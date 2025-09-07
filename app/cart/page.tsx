"use client"

import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import type { CartItem } from "@/lib/types"

export default function CartPage() {
  const router = useRouter()
  const { state: cartState, dispatch: cartDispatch } = useCart()

  const updateQuantity = (productId: string, quantity: number) => {
    cartDispatch({ type: "UPDATE_QUANTITY", productId, quantity })
  }

  const removeItem = (productId: string) => {
    cartDispatch({ type: "REMOVE_ITEM", productId })
  }

  const clearCart = () => {
    cartDispatch({ type: "CLEAR_CART" })
  }

  const handleCheckout = () => {
    router.push("/checkout")
  }

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center px-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold ml-4">Shopping Cart</h1>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Button onClick={() => router.push("/")}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-4">Shopping Cart ({cartState.itemCount})</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Cart Items</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>

            {cartState.items.map((item) => (
              <CartItemRow key={item.product.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cartState.itemCount} items)</span>
                    <span>₹{cartState.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹{(cartState.total * 0.08).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{(cartState.total * 1.08).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/")}>
                    Continue Shopping
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>• Free shipping on orders over ₹50</p>
                  <p>• 30-day return policy</p>
                  <p>• Secure checkout</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CartItemRowProps {
  item: CartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const { product, quantity } = item

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="w-24 h-24 relative overflow-hidden rounded-lg border">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                <Badge variant="secondary" className="mt-1">
                  {product.category}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">₹{product.price} each</span>
              </div>

              <div className="text-right">
                <p className="font-bold text-xl">₹{(product.price * quantity).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
