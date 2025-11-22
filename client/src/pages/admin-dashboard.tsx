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
import { Package, ShoppingCart, DollarSign, Truck, Plus, Edit, Trash2, Tag, Bell } from "lucide-react";
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
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            Notifications
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
        <TabsContent value="notifications">
          <NotificationManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationManagement() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleTriggerNotification = async () => {
    try {
      setIsLoading(true);
      const adminToken = sessionStorage.getItem("admin_password");
      
      const response = await fetch("/api/admin/trigger-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to trigger notification");
      }

      const data = await response.json();
      toast({
        title: "Notification Sent!",
        description: `Sent: ${data.title}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Send Notifications to Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Send a random promotional notification to all users who have enabled notifications.
          </p>
          <Button
            onClick={handleTriggerNotification}
            disabled={isLoading}
            data-testid="button-trigger-notification"
            className="w-full"
          >
            {isLoading ? "Sending..." : "Trigger Random Notification"}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Available Messages:</h3>
          <ul className="space-y-2 text-sm">
            <li>Peanut Butter Khana Hai! - Fresh creamy peanut butter now available</li>
            <li>Chocolate wala Peanut Butter - Premium chocolate peanut spread</li>
            <li>Crunchy Spread Alert! - New crunchy peanut butter variety</li>
          </ul>
        </div>
      </CardContent>
    </Card>
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
          <div className="text-2xl font-bold" data-testid="text-total-revenue">
            ₹{(stats?.totalRevenue || 0).toLocaleString("en-IN")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-total-products">
            {stats?.totalProducts || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-pending-orders">
            {stats?.pendingOrders || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsManagement() {
  const { toast } = useToast();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "peanut-butter",
    image: "",
    slug: "",
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/admin/products"],
    queryFn: adminQueryFn,
  });

  const addProductMutation = useMutation({
    mutationFn: (data: any) =>
      adminRequest("POST", "/api/admin/products", data),
    onSuccess: () => {
      toast({
        title: "Product added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "peanut-butter",
        image: "",
        slug: "",
      });
      setIsAddingProduct(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (data: any) =>
      adminRequest("PATCH", `/api/admin/products/${editingId}`, data),
    onSuccess: () => {
      toast({
        title: "Product updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "peanut-butter",
        image: "",
        slug: "",
      });
      setEditingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) =>
      adminRequest("DELETE", `/api/admin/products/${id}`, {}),
    onSuccess: () => {
      toast({
        title: "Product deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    };

    if (editingId) {
      updateProductMutation.mutate(data);
    } else {
      addProductMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  data-testid="input-product-name"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  data-testid="input-product-slug"
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  data-testid="input-product-price"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  data-testid="input-product-stock"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger id="category" data-testid="select-product-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peanut-butter">Peanut Butter</SelectItem>
                    <SelectItem value="chocolate">Chocolate</SelectItem>
                    <SelectItem value="crunchy">Crunchy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  data-testid="input-product-image"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  data-testid="textarea-product-description"
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={
                  addProductMutation.isPending ||
                  updateProductMutation.isPending
                }
                data-testid="button-submit-product"
              >
                {editingId ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFormData(product);
                        setEditingId(product.id);
                        setIsAddingProduct(true);
                      }}
                      data-testid={`button-edit-product-${product.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteProductMutation.mutate(product.id)}
                      data-testid={`button-delete-product-${product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function OrdersManagement() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: adminQueryFn,
  });
  const { toast } = useToast();

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) =>
      adminRequest("PATCH", `/api/admin/orders/${orderId}`, {
        status,
      }),
    onSuccess: () => {
      toast({
        title: "Order updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Orders</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell data-testid={`text-order-number-${order.id}`}>
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>₹{order.totalAmount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "completed" ? "default" : "secondary"
                      }
                      data-testid={`status-order-${order.id}`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(status) => {
                        updateOrderStatusMutation.mutate({
                          orderId: order.id,
                          status,
                        });
                      }}
                    >
                      <SelectTrigger
                        className="w-[130px]"
                        data-testid={`select-order-status-${order.id}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function ReturnsManagement() {
  const { data: returns, isLoading } = useQuery({
    queryKey: ["/api/admin/returns"],
    queryFn: adminQueryFn,
  });
  const { toast } = useToast();

  const updateReturnStatusMutation = useMutation({
    mutationFn: ({
      returnId,
      status,
    }: {
      returnId: string;
      status: string;
    }) =>
      adminRequest("PATCH", `/api/admin/returns/${returnId}`, {
        status,
      }),
    onSuccess: () => {
      toast({
        title: "Return updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/returns"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update return",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Returns</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Return ID</TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns?.map((ret: any) => (
                <TableRow key={ret.id}>
                  <TableCell data-testid={`text-return-id-${ret.id}`}>
                    {ret.id}
                  </TableCell>
                  <TableCell>{ret.orderId}</TableCell>
                  <TableCell>{ret.reason}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ret.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={ret.status}
                      onValueChange={(status) => {
                        updateReturnStatusMutation.mutate({
                          returnId: ret.id,
                          status,
                        });
                      }}
                    >
                      <SelectTrigger
                        className="w-[130px]"
                        data-testid={`select-return-status-${ret.id}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="requested">Requested</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function CouponsManagement() {
  const { toast } = useToast();
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    usageLimit: "",
    isPublic: true,
  });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["/api/admin/coupons"],
    queryFn: adminQueryFn,
  });

  const addCouponMutation = useMutation({
    mutationFn: (data: any) =>
      adminRequest("POST", "/api/admin/coupons", data),
    onSuccess: () => {
      toast({
        title: "Coupon added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setFormData({
        code: "",
        discountPercentage: "",
        usageLimit: "",
        isPublic: true,
      });
      setIsAddingCoupon(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add coupon",
        variant: "destructive",
      });
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: (data: any) =>
      adminRequest("PATCH", `/api/admin/coupons/${editingId}`, data),
    onSuccess: () => {
      toast({
        title: "Coupon updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setFormData({
        code: "",
        discountPercentage: "",
        usageLimit: "",
        isPublic: true,
      });
      setEditingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update coupon",
        variant: "destructive",
      });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (id: string) =>
      adminRequest("DELETE", `/api/admin/coupons/${id}`, {}),
    onSuccess: () => {
      toast({
        title: "Coupon deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const data = {
      ...formData,
      discountPercentage: parseInt(formData.discountPercentage),
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
    };

    if (editingId) {
      updateCouponMutation.mutate(data);
    } else {
      addCouponMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coupons</h2>
        <Dialog open={isAddingCoupon} onOpenChange={setIsAddingCoupon}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-coupon">
              <Plus className="h-4 w-4 mr-2" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Coupon" : "Add New Coupon"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  data-testid="input-coupon-code"
                />
              </div>
              <div>
                <Label htmlFor="discountPercentage">Discount %</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPercentage: e.target.value,
                    })
                  }
                  data-testid="input-discount-percentage"
                />
              </div>
              <div>
                <Label htmlFor="usageLimit">Usage Limit</Label>
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
                />
                <Label htmlFor="isPublic" className="text-sm">
                  Make Public
                </Label>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={
                  addCouponMutation.isPending || updateCouponMutation.isPending
                }
                data-testid="button-submit-coupon"
              >
                {editingId ? "Update Coupon" : "Add Coupon"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage Limit</TableHead>
                <TableHead>Public</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons?.map((coupon: any) => (
                <TableRow key={coupon.id}>
                  <TableCell data-testid={`text-coupon-code-${coupon.id}`}>
                    {coupon.code}
                  </TableCell>
                  <TableCell>{coupon.discountPercentage}%</TableCell>
                  <TableCell>
                    {coupon.usageLimit ? coupon.usageLimit : "Unlimited"}
                  </TableCell>
                  <TableCell>
                    {coupon.isPublic ? (
                      <Badge variant="default">Public</Badge>
                    ) : (
                      <Badge variant="secondary">Private</Badge>
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFormData(coupon);
                        setEditingId(coupon.id);
                        setIsAddingCoupon(true);
                      }}
                      data-testid={`button-edit-coupon-${coupon.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteCouponMutation.mutate(coupon.id)}
                      data-testid={`button-delete-coupon-${coupon.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
