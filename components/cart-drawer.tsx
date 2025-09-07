"use client"

import type React from "react"

import { useState } from "react"
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"
import type { CartItem } from "@/lib/types"

interface CartDrawerProps {
  children: React.ReactNode
}

export function CartDrawer({ children }: CartDrawerProps) {
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

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
    setIsOpen(false)
    router.push("/checkout")
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({cartState.itemCount})
          </SheetTitle>
          <SheetDescription>Review your items and proceed to checkout</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cartState.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mb-4">Add some products to get started</p>
                <Button onClick={() => setIsOpen(false)}>Continue Shopping</Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-6">
                <div className="space-y-4">
                  {cartState.items.map((item) => (
                    <CartItemCard
                      key={item.product.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{cartState.itemCount} items</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
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
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{(cartState.total * 1.08).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsOpen(false)}>
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface CartItemCardProps {
  item: CartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  const { product, quantity } = item

  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <div className="w-16 h-16 relative overflow-hidden rounded-md border">
        <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
            <Badge variant="secondary" className="text-xs mt-1">
              {product.category}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(product.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-right">
            <p className="font-semibold text-sm">₹{(product.price * quantity).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">₹{product.price} each</p>
          </div>
        </div>
      </div>
    </div>
  )
}
