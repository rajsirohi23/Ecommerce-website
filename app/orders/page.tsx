"use client"

import { useState } from "react"
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { mockOrders } from "@/lib/mock-orders"
import type { Order } from "@/lib/types"

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useUser()
  const [statusFilter, setStatusFilter] = useState("all")

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

  const filteredOrders = mockOrders.filter((order) => {
    if (statusFilter === "all") return true
    return order.status === statusFilter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-4">My Orders</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Order History</h2>
            <p className="text-muted-foreground">Track and manage your orders</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-4">
                  {statusFilter === "all"
                    ? "You haven't placed any orders yet."
                    : `No orders with status "${statusFilter}" found.`}
                </p>
                <Button onClick={() => router.push("/")}>Start Shopping</Button>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onViewDetails={() => router.push(`/orders/${order.id}`)} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

interface OrderCardProps {
  order: Order
  onViewDetails: () => void
}

function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Order {order.id}</CardTitle>
            <p className="text-sm text-muted-foreground">Placed on {order.createdAt.toLocaleDateString()}</p>
          </div>
          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 capitalize`}>
            {getStatusIcon(order.status)}
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Order Items Preview */}
          <div className="space-y-2">
            {order.items.slice(0, 2).map((item) => (
              <div key={item.product.id} className="flex items-center gap-3">
                <div className="w-12 h-12 relative overflow-hidden rounded border">
                  <img
                    src={item.product.image || "/placeholder.svg"}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-semibold">₹{order.total.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Invoice
              </Button>
              <Button size="sm" onClick={onViewDetails}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
