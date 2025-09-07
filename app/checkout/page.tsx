"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, CreditCard, Truck, Shield, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useUser } from "@/contexts/user-context"

type CheckoutStep = "shipping" | "payment" | "review" | "confirmation"

export default function CheckoutPage() {
  const router = useRouter()
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping")
  const [orderNumber, setOrderNumber] = useState("")

  const [shippingData, setShippingData] = useState({
    firstName: user?.name.split(" ")[0] || "",
    lastName: user?.name.split(" ")[1] || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  })

  const [paymentData, setPaymentData] = useState({
    method: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    billingAddress: "same",
  })

  const [preferences, setPreferences] = useState({
    saveAddress: false,
    newsletter: false,
    smsUpdates: false,
  })

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-4">Add some items to your cart before checking out.</p>
          <Button onClick={() => router.push("/")}>Continue Shopping</Button>
        </div>
      </div>
    )
  }

  const subtotal = cartState.total
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleNextStep = () => {
    if (currentStep === "shipping") setCurrentStep("payment")
    else if (currentStep === "payment") setCurrentStep("review")
    else if (currentStep === "review") {
      // Process order
      const orderNum = `ORD-${Date.now()}`
      setOrderNumber(orderNum)
      setCurrentStep("confirmation")
      cartDispatch({ type: "CLEAR_CART" })
    }
  }

  const handlePrevStep = () => {
    if (currentStep === "payment") setCurrentStep("shipping")
    else if (currentStep === "review") setCurrentStep("payment")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/cart")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-4">Checkout</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {currentStep !== "confirmation" && (
          <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[
                  { key: "shipping", label: "Shipping", icon: Truck },
                  { key: "payment", label: "Payment", icon: CreditCard },
                  { key: "review", label: "Review", icon: Shield },
                ].map((step, index) => {
                  const Icon = step.icon
                  const isActive = currentStep === step.key
                  const isCompleted =
                    (step.key === "shipping" && ["payment", "review"].includes(currentStep)) ||
                    (step.key === "payment" && currentStep === "review")

                  return (
                    <div key={step.key} className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                          isCompleted
                            ? "bg-primary border-primary text-primary-foreground"
                            : isActive
                              ? "border-primary text-primary"
                              : "border-muted-foreground text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span
                        className={`ml-2 text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {step.label}
                      </span>
                      {index < 2 && <div className={`w-12 h-0.5 mx-4 ${isCompleted ? "bg-primary" : "bg-muted"}`} />}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {currentStep === "shipping" && (
                  <ShippingForm
                    data={shippingData}
                    onChange={setShippingData}
                    preferences={preferences}
                    onPreferencesChange={setPreferences}
                    onNext={handleNextStep}
                  />
                )}

                {currentStep === "payment" && (
                  <PaymentForm
                    data={paymentData}
                    onChange={setPaymentData}
                    onNext={handleNextStep}
                    onPrev={handlePrevStep}
                  />
                )}

                {currentStep === "review" && (
                  <OrderReview
                    shippingData={shippingData}
                    paymentData={paymentData}
                    onNext={handleNextStep}
                    onPrev={handlePrevStep}
                  />
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <OrderSummary items={cartState.items} subtotal={subtotal} shipping={shipping} tax={tax} total={total} />
              </div>
            </div>
          </div>
        )}

        {currentStep === "confirmation" && <OrderConfirmation orderNumber={orderNumber} total={total} />}
      </div>
    </div>
  )
}

// Shipping Form Component
function ShippingForm({ data, onChange, preferences, onPreferencesChange, onNext }: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={data.firstName}
                onChange={(e) => onChange({ ...data, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={data.lastName}
                onChange={(e) => onChange({ ...data, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => onChange({ ...data, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) => onChange({ ...data, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={data.address}
              onChange={(e) => onChange({ ...data, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => onChange({ ...data, city: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={data.state}
                onChange={(e) => onChange({ ...data, state: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={data.zipCode}
                onChange={(e) => onChange({ ...data, zipCode: e.target.value })}
                required
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveAddress"
                checked={preferences.saveAddress}
                onCheckedChange={(checked) => onPreferencesChange({ ...preferences, saveAddress: checked })}
              />
              <Label htmlFor="saveAddress" className="text-sm">
                Save this address for future orders
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="newsletter"
                checked={preferences.newsletter}
                onCheckedChange={(checked) => onPreferencesChange({ ...preferences, newsletter: checked })}
              />
              <Label htmlFor="newsletter" className="text-sm">
                Subscribe to our newsletter for deals and updates
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Continue to Payment
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Payment Form Component
function PaymentForm({ data, onChange, onNext, onPrev }: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup value={data.method} onValueChange={(value) => onChange({ ...data, method: value })}>
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                <CreditCard className="h-4 w-4" />
                Credit/Debit Card
              </Label>
            </div>
          </RadioGroup>

          {data.method === "card" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={data.cardNumber}
                  onChange={(e) => onChange({ ...data, cardNumber: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={data.expiryDate}
                    onChange={(e) => onChange({ ...data, expiryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={data.cvv}
                    onChange={(e) => onChange({ ...data, cvv: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameOnCard">Name on Card</Label>
                <Input
                  id="nameOnCard"
                  value={data.nameOnCard}
                  onChange={(e) => onChange({ ...data, nameOnCard: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onPrev} className="flex-1 bg-transparent">
              Back to Shipping
            </Button>
            <Button type="submit" className="flex-1">
              Review Order
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Order Review Component
function OrderReview({ shippingData, paymentData, onNext, onPrev }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <p className="text-sm text-muted-foreground">
              {shippingData.firstName} {shippingData.lastName}
              <br />
              {shippingData.address}
              <br />
              {shippingData.city}, {shippingData.state} {shippingData.zipCode}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Payment Method</h3>
            <p className="text-sm text-muted-foreground">Credit Card ending in {paymentData.cardNumber.slice(-4)}</p>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onPrev} className="flex-1 bg-transparent">
              Back to Payment
            </Button>
            <Button onClick={onNext} className="flex-1">
              Place Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Order Summary Component
function OrderSummary({ items, subtotal, shipping, tax, total }: any) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {items.map((item: any) => (
            <div key={item.product.id} className="flex gap-3">
              <div className="w-12 h-12 relative overflow-hidden rounded border">
                <img
                  src={item.product.image || "/placeholder.svg"}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Order Confirmation Component
function OrderConfirmation({ orderNumber, total }: any) {
  const router = useRouter()

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">Thank you for your purchase. Your order has been successfully placed.</p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-semibold">{orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-semibold">₹{total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Delivery</p>
              <p className="font-semibold">3-5 business days</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tracking</p>
              <p className="font-semibold">Will be sent via email</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button onClick={() => router.push("/orders")}>View Orders</Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}
