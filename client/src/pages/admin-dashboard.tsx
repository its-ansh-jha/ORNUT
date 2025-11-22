import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, ShoppingCart, DollarSign, Truck, Plus, Edit, Trash2, Tag } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { adminRequest, adminQueryFn } from "@/lib/adminClient";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_authenticated");
    if (!auth) {
      navigate("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-admin-dashboard-title">
          Admin Dashboard
        </h1>
        <Button
          variant="outline"
          onClick={() => {
            sessionStorage.removeItem("admin_authenticated");
            sessionStorage.removeItem("admin_password");
            navigate("/");
          }}
          data-testid="button-admin-logout"
        >
          Logout
        </Button>
      </div>

      <DashboardStats />

      <Tabs defaultValue="products" className="mt-8">
        <TabsList>
          <TabsTrigger value="products" data-testid="tab-products">
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">
            Orders
          </TabsTrigger>
          <TabsTrigger value="returns" data-testid="tab-returns">
            Returns
          </TabsTrigger>
          <TabsTrigger value="coupons" data-testid="tab-coupons">
            Coupons
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductsManagement />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersManagement />
        </TabsContent>
        <TabsContent value="returns">
          <ReturnsManagement />
        </TabsContent>
        <TabsContent value="coupons">
          <CouponsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DashboardStats() {
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    queryFn: adminQueryFn,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-total-orders">
            {stats?.totalOrders || 0}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-revenue">
            ₹{Number(stats?.revenue || 0).toFixed(2)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-products-count">
            {stats?.totalProducts || 0}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-pending-deliveries">
            {stats?.pendingDeliveries || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsManagement() {
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => adminRequest("DELETE", `/api/admin/products/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Products</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProduct(null)} data-testid="button-add-product">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              <ProductForm
                product={editingProduct}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  setEditingProduct(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                <TableCell>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="capitalize">{product.category}</TableCell>
                <TableCell>₹{Number(product.price).toFixed(2)}</TableCell>
                <TableCell>
                  {product.inStock ? (
                    <Badge variant="default">{product.stockQuantity}</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsDialogOpen(true);
                      }}
                      data-testid={`button-edit-product-${product.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProductMutation.mutate(product.id)}
                      data-testid={`button-delete-product-${product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ProductForm({ product, onSuccess }: { product?: any; onSuccess: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    category: product?.category || "smooth",
    image: product?.image || "",
    stockQuantity: product?.stockQuantity || 0,
    inStock: product?.inStock ?? true,
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      const dataWithSlug = {
        ...data,
        slug: product?.slug || generateSlug(data.name),
      };
      if (product) {
        return adminRequest("PATCH", `/api/admin/products/${product.id}`, dataWithSlug);
      }
      return adminRequest("POST", "/api/admin/products", dataWithSlug);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: product ? "Product updated" : "Product created" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save product",
        variant: "destructive"
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          data-testid="input-product-name"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          data-testid="input-product-description"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            data-testid="input-product-price"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger data-testid="select-product-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="smooth">Smooth</SelectItem>
              <SelectItem value="crunchy">Crunchy</SelectItem>
              <SelectItem value="chocolate">Chocolate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stockQuantity">Stock Quantity</Label>
          <Input
            id="stockQuantity"
            type="number"
            value={formData.stockQuantity}
            onChange={(e) =>
              setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })
            }
            required
            data-testid="input-product-stock"
          />
        </div>
        <div>
          <Label htmlFor="inStock">In Stock</Label>
          <Select
            value={formData.inStock ? "yes" : "no"}
            onValueChange={(value) => setFormData({ ...formData, inStock: value === "yes" })}
          >
            <SelectTrigger data-testid="select-product-instock">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          required
          data-testid="input-product-image"
        />
      </div>
      <Button type="submit" className="w-full" disabled={saveMutation.isPending} data-testid="button-save-product">
        {saveMutation.isPending ? "Saving..." : "Save Product"}
      </Button>
    </form>
  );
}

function OrdersManagement() {
  const { toast } = useToast();

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: adminQueryFn,
  });

  const updateDeliveryStatusMutation = useMutation({
    mutationFn: ({ orderId, status, location, message }: any) =>
      adminRequest("POST", `/api/admin/orders/${orderId}/tracking`, {
        status,
        location,
        message,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Delivery status updated" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="font-medium">{order.contactDetails?.fullName}</p>
                    <p className="text-muted-foreground">{order.contactDetails?.email}</p>
                  </div>
                </TableCell>
                <TableCell>{format(new Date(order.createdAt), "PP")}</TableCell>
                <TableCell>
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {order.deliveryStatus?.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DeliveryStatusUpdater
                    orderId={order.id}
                    currentStatus={order.deliveryStatus}
                    onUpdate={updateDeliveryStatusMutation.mutate}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ReturnsManagement() {
  const { toast } = useToast();
  
  const { data: returns = [], refetch } = useQuery<any[]>({
    queryKey: ["/api/admin/returns"],
    queryFn: adminQueryFn,
  });

  const updateReturnMutation = useMutation({
    mutationFn: async ({ id, status, adminResponse }: any) => {
      return adminRequest("PATCH", `/api/admin/returns/${id}`, { status, adminResponse });
    },
    onSuccess: () => {
      toast({
        title: "Return request updated",
        description: "The return status has been updated successfully.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update return status.",
        variant: "destructive",
      });
    },
  });

  const updateReturnTrackingMutation = useMutation({
    mutationFn: ({ returnId, status, location, message }: any) =>
      adminRequest("POST", `/api/admin/returns/${returnId}/tracking`, {
        status,
        location,
        message,
      }),
    onSuccess: () => {
      refetch();
      toast({ title: "Return tracking updated" });
    },
  });

  const handleApprove = (returnId: string) => {
    updateReturnMutation.mutate({
      id: returnId,
      status: "approved",
      adminResponse: "Return request approved",
    });
  };

  const handleReject = (returnId: string) => {
    updateReturnMutation.mutate({
      id: returnId,
      status: "rejected",
      adminResponse: "Return request rejected",
    });
  };

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    approved: "default",
    rejected: "destructive",
    completed: "outline",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Return Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Return Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No return requests found
                </TableCell>
              </TableRow>
            ) : (
              returns.map((returnRequest: any) => (
                <TableRow key={returnRequest.id}>
                  <TableCell className="font-medium">
                    {returnRequest.order?.orderNumber}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {returnRequest.reason}
                  </TableCell>
                  <TableCell>
                    {format(new Date(returnRequest.requestedAt), "PP")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[returnRequest.status]}>
                      {returnRequest.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {returnRequest.returnStatus?.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {returnRequest.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(returnRequest.id)}
                            disabled={updateReturnMutation.isPending}
                            data-testid={`button-approve-return-${returnRequest.id}`}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(returnRequest.id)}
                            disabled={updateReturnMutation.isPending}
                            data-testid={`button-reject-return-${returnRequest.id}`}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {returnRequest.status === "approved" && (
                        <ReturnStatusUpdater
                          returnId={returnRequest.id}
                          currentStatus={returnRequest.returnStatus}
                          onUpdate={updateReturnTrackingMutation.mutate}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function DeliveryStatusUpdater({
  orderId,
  currentStatus,
  onUpdate,
}: {
  orderId: string;
  currentStatus: string;
  onUpdate: (data: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ orderId, status, location, message });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid={`button-update-status-${orderId}`}>
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Delivery Status</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="select-delivery-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order_placed">Order Placed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Location (optional)</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Lucknow, UP"
              data-testid="input-delivery-location"
            />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Status update message"
              required
              data-testid="input-delivery-message"
            />
          </div>
          <Button type="submit" className="w-full" data-testid="button-submit-status">
            Update
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReturnStatusUpdater({
  returnId,
  currentStatus,
  onUpdate,
}: {
  returnId: string;
  currentStatus: string;
  onUpdate: (data: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ returnId, status, location, message });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid={`button-update-return-status-${returnId}`}>
          Update Tracking
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Return Tracking</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="select-return-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pickup_scheduled">Pickup Scheduled</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="received_at_warehouse">Received at Warehouse</SelectItem>
                <SelectItem value="inspecting">Inspecting</SelectItem>
                <SelectItem value="refund_processing">Refund Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Location (optional)</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Warehouse, Lucknow"
              data-testid="input-return-location"
            />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Return status update message"
              required
              data-testid="input-return-message"
            />
          </div>
          <Button type="submit" className="w-full" data-testid="button-submit-return-status">
            Update
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface Coupon {
  id: number;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  minOrderValue: string;
  isPublic: boolean;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
}

function CouponsManagement() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const { data: coupons, isLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
    queryFn: adminQueryFn,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminRequest("POST", "/api/admin/coupons", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setOpen(false);
      setEditingCoupon(null);
      toast({
        title: "Success",
        description: "Coupon created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      adminRequest("PATCH", `/api/admin/coupons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setOpen(false);
      setEditingCoupon(null);
      toast({
        title: "Success",
        description: "Coupon updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminRequest("DELETE", `/api/admin/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete coupon",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Coupon Management</CardTitle>
          <Dialog
            open={open}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) setEditingCoupon(null);
            }}
          >
            <DialogTrigger asChild>
              <Button data-testid="button-add-coupon">
                <Plus className="h-4 w-4 mr-2" />
                Add Coupon
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon ? "Edit Coupon" : "Create Coupon"}
                </DialogTitle>
              </DialogHeader>
              <CouponForm
                coupon={editingCoupon}
                onSubmit={(data) => {
                  if (editingCoupon) {
                    updateMutation.mutate({ id: editingCoupon.id, data });
                  } else {
                    createMutation.mutate(data);
                  }
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading coupons...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons?.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold">{coupon.code}</code>
                      {coupon.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : `₹${Number(coupon.discountValue).toFixed(2)}`}
                  </TableCell>
                  <TableCell>₹{Number(coupon.minOrderValue).toFixed(2)}</TableCell>
                  <TableCell>
                    {coupon.usedCount} / {coupon.usageLimit || "∞"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCoupon(coupon);
                          setOpen(true);
                        }}
                        data-testid={`button-edit-coupon-${coupon.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (
                            confirm("Are you sure you want to delete this coupon?")
                          ) {
                            deleteMutation.mutate(coupon.id);
                          }
                        }}
                        data-testid={`button-delete-coupon-${coupon.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {coupons?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No coupons found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function CouponForm({
  coupon,
  onSubmit,
  isLoading,
}: {
  coupon: Coupon | null;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    code: coupon?.code || "",
    discountType: (coupon?.discountType || "percentage") as "percentage" | "fixed",
    discountValue: coupon?.discountValue || "",
    minOrderValue: coupon?.minOrderValue || "0",
    isPublic: coupon?.isPublic ?? true,
    isActive: coupon?.isActive ?? true,
    usageLimit: coupon?.usageLimit?.toString() || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      code: formData.code.toUpperCase().trim(),
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      minOrderValue: formData.minOrderValue,
      isPublic: formData.isPublic,
      isActive: formData.isActive,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">Coupon Code</Label>
        <Input
          id="code"
          placeholder="SAVE20"
          value={formData.code}
          onChange={(e) =>
            setFormData({ ...formData, code: e.target.value.toUpperCase() })
          }
          required
          data-testid="input-coupon-code-form"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="discountType">Discount Type</Label>
        <Select
          value={formData.discountType}
          onValueChange={(value: "percentage" | "fixed") =>
            setFormData({ ...formData, discountType: value })
          }
        >
          <SelectTrigger id="discountType" data-testid="select-discount-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage (%)</SelectItem>
            <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="discountValue">Discount Value</Label>
        <Input
          id="discountValue"
          type="number"
          step="0.01"
          min="0"
          placeholder={formData.discountType === "percentage" ? "10" : "100"}
          value={formData.discountValue}
          onChange={(e) =>
            setFormData({ ...formData, discountValue: e.target.value })
          }
          required
          data-testid="input-discount-value"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="minOrderValue">Minimum Order Value (₹)</Label>
        <Input
          id="minOrderValue"
          type="number"
          step="0.01"
          min="0"
          placeholder="0"
          value={formData.minOrderValue}
          onChange={(e) =>
            setFormData({ ...formData, minOrderValue: e.target.value })
          }
          required
          data-testid="input-min-order-value"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="usageLimit">Usage Limit (leave blank for unlimited)</Label>
        <Input
          id="usageLimit"
          type="number"
          min="1"
          placeholder="Unlimited"
          value={formData.usageLimit}
          onChange={(e) =>
            setFormData({ ...formData, usageLimit: e.target.value })
          }
          data-testid="input-usage-limit"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={formData.isPublic}
          onChange={(e) =>
            setFormData({ ...formData, isPublic: e.target.checked })
          }
          data-testid="checkbox-is-public"
          className="rounded"
        />
        <Label htmlFor="isPublic" className="cursor-pointer">
          Show to all users (public)
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
          data-testid="checkbox-is-active"
          className="rounded"
        />
        <Label htmlFor="isActive" className="cursor-pointer">
          Active
        </Label>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full" data-testid="button-submit-coupon">
        {isLoading ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
      </Button>
    </form>
  );
}
