"use client"

import { ArrowLeft, Package, Truck, CheckCircle, Clock, Download, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter, useParams } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { mockOrders } from "@/lib/mock-orders"

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useUser()

  const order = mockOrders.find((o) => o.id === params.id)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground mb-4">You need to be signed in to view your orders.</p>
          <Button onClick={() => router.push("/")}>Go to Home</Button>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/orders")}>Back to Orders</Button>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />
      case "processing":
        return <Package className="h-5 w-5" />
      case "shipped":
        return <Truck className="h-5 w-5" />
      case "delivered":
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTrackingSteps = (status: string) => {
    const steps = [
      { key: "pending", label: "Order Placed", completed: true },
      { key: "processing", label: "Processing", completed: ["processing", "shipped", "delivered"].includes(status) },
      { key: "shipped", label: "Shipped", completed: ["shipped", "delivered"].includes(status) },
      { key: "delivered", label: "Delivered", completed: status === "delivered" },
    ]
    return steps
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/orders")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-4">Order Details</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Order Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Order {order.id}</h2>
            <p className="text-muted-foreground">Placed on {order.createdAt.toLocaleDateString()}</p>
          </div>
          <Badge className={`${getStatusColor(order.status)} flex items-center gap-2 text-sm px-3 py-1 capitalize`}>
            {getStatusIcon(order.status)}
            {order.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Order Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTrackingSteps(order.status).map((step, index) => (
                    <div key={step.key} className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          step.completed
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground text-muted-foreground"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                        {step.key === order.status && <p className="text-xs text-muted-foreground">Current status</p>}
                      </div>
                      {index < getTrackingSteps(order.status).length - 1 && (
                        <div className={`w-px h-8 ${step.completed ? "bg-primary" : "bg-muted"} ml-4`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items Ordered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-20 h-20 relative overflow-hidden rounded border">
                        <img
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-2">{item.product.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {item.product.category}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.product.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                          <span className="text-sm text-muted-foreground">₹{item.product.price} each</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{(order.total / 1.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹{((order.total * 0.08) / 1.08).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full bg-transparent" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              {order.status === "delivered" && <Button className="w-full">Leave Review</Button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
