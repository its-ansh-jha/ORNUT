import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { insertProductSchema, insertCartItemSchema, insertWishlistItemSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import { Cashfree } from "cashfree-pg";

async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  try {
    const firebaseToken = req.headers["x-firebase-token"];
    
    if (!firebaseToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    if (!projectId) {
      return res.status(500).json({ error: "Firebase not configured" });
    }

    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.VITE_FIREBASE_API_KEY}`;
    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: firebaseToken }),
    });

    if (!verifyResponse.ok) {
      console.error("Firebase token verification failed");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const verifyData = await verifyResponse.json();
    const verifiedUserId = verifyData.users?.[0]?.localId;
    
    if (!verifiedUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.userId = verifiedUserId;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

async function verifyAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const adminToken = req.headers["x-admin-token"];
    if (!adminToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    if (!adminPasswordHash) {
      return res.status(500).json({ error: "Admin not configured" });
    }

    const isValid = await bcrypt.compare(adminToken as string, adminPasswordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/sync", async (req, res) => {
    try {
      const { id, email, displayName, photoURL } = req.body;
      
      let user = await storage.getUser(id);
      if (!user) {
        user = await storage.createUser({
          id,
          email,
          displayName: displayName || null,
          photoURL: photoURL || null,
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Auth sync error:", error);
      res.status(500).json({ error: "Failed to sync user" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/cart", verifyFirebaseToken, async (req, res) => {
    try {
      const items = await storage.getCartItems(req.userId!);
      res.json(items);
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", verifyFirebaseToken, async (req, res) => {
    try {
      const validated = insertCartItemSchema.parse({
        ...req.body,
        userId: req.userId!,
      });
      
      const item = await storage.addToCart(validated);
      res.json(item);
    } catch (error) {
      console.error("Add to cart error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:id", verifyFirebaseToken, async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.getCartItem(req.params.id);
      if (!cartItem || cartItem.userId !== req.userId) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      const item = await storage.updateCartItem(req.params.id, quantity);
      res.json(item);
    } catch (error) {
      console.error("Update cart error:", error);
      res.status(500).json({ error: "Failed to update cart" });
    }
  });

  app.delete("/api/cart/:id", verifyFirebaseToken, async (req, res) => {
    try {
      const cartItem = await storage.getCartItem(req.params.id);
      if (!cartItem || cartItem.userId !== req.userId) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      await storage.removeFromCart(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ error: "Failed to remove from cart" });
    }
  });

  app.get("/api/wishlist", verifyFirebaseToken, async (req, res) => {
    try {
      const items = await storage.getWishlistItems(req.userId!);
      res.json(items);
    } catch (error) {
      console.error("Get wishlist error:", error);
      res.status(500).json({ error: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", verifyFirebaseToken, async (req, res) => {
    try {
      const validated = insertWishlistItemSchema.parse({
        ...req.body,
        userId: req.userId!,
      });
      
      const item = await storage.addToWishlist(validated);
      res.json(item);
    } catch (error) {
      console.error("Add to wishlist error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:id", verifyFirebaseToken, async (req, res) => {
    try {
      const wishlistItem = await storage.getWishlistItem(req.params.id);
      if (!wishlistItem || wishlistItem.userId !== req.userId) {
        return res.status(404).json({ error: "Wishlist item not found" });
      }
      
      await storage.removeFromWishlist(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      res.status(500).json({ error: "Failed to remove from wishlist" });
    }
  });

  app.get("/api/orders", verifyFirebaseToken, async (req, res) => {
    try {
      const orders = await storage.getOrders(req.userId!);
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", verifyFirebaseToken, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      if (order.userId !== req.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/:id/tracking", async (req, res) => {
    try {
      const tracking = await storage.getDeliveryTracking(req.params.id);
      res.json(tracking);
    } catch (error) {
      console.error("Get tracking error:", error);
      res.status(500).json({ error: "Failed to fetch tracking" });
    }
  });

  app.post("/api/orders", verifyFirebaseToken, async (req, res) => {
    try {
      const userId = req.userId!;
      const { shippingAddress, contactDetails } = req.body;
      
      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      
      const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );
      const shipping = subtotal >= 50 ? 0 : 9.99;
      const totalAmount = subtotal + shipping;
      
      const orderNumber = `PB${Date.now().toString().slice(-8)}`;
      
      const orderData = {
        userId,
        orderNumber,
        status: "pending",
        deliveryStatus: "order_placed",
        totalAmount: totalAmount.toString(),
        shippingAddress,
        contactDetails,
      };
      
      const orderItems = cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image,
        quantity: item.quantity,
        price: item.product.price,
      }));
      
      const order = await storage.createOrder(orderData, orderItems);
      
      await storage.clearCart(userId);
      
      try {
        const formspreeUrl = `https://formspree.io/f/${process.env.VITE_FORMSPREE_FORM_ID}`;
        const emailBody = {
          subject: `New Order: ${orderNumber}`,
          message: `
            Order Number: ${orderNumber}
            Customer: ${contactDetails.fullName}
            Email: ${contactDetails.email}
            Phone: ${contactDetails.phone}
            
            Shipping Address:
            ${shippingAddress.address}
            ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}
            
            Order Items:
            ${orderItems.map((item) => `- ${item.productName} x ${item.quantity} @ $${item.price}`).join('\n')}
            
            Total: $${totalAmount.toFixed(2)}
          `,
        };
        
        await fetch(formspreeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailBody),
        });
      } catch (emailError) {
        console.error("Email notification error:", emailError);
      }
      
      res.json(order);
    } catch (error) {
      console.error("Create order error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.post("/api/payment/create-order", verifyFirebaseToken, async (req, res) => {
    try {
      const userId = req.userId!;
      const { shippingAddress, contactDetails } = req.body;
      
      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      
      const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );
      const shipping = subtotal >= 50 ? 0 : 9.99;
      const totalAmount = subtotal + shipping;
      
      const orderNumber = `ORNUT${Date.now().toString().slice(-8)}`;
      
      const cashfreeAppId = process.env.CASHFREE_APP_ID;
      const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;
      
      if (!cashfreeAppId || !cashfreeSecretKey) {
        return res.status(500).json({ error: "Payment gateway not configured" });
      }
      
      const cashfree = new Cashfree(
        process.env.NODE_ENV === "production" ? Cashfree.PRODUCTION : Cashfree.SANDBOX,
        cashfreeAppId,
        cashfreeSecretKey
      );
      
      const request = {
        order_amount: totalAmount,
        order_currency: "INR",
        order_id: orderNumber,
        customer_details: {
          customer_id: userId.slice(0, 50),
          customer_name: contactDetails.fullName,
          customer_email: contactDetails.email,
          customer_phone: contactDetails.phone,
        },
        order_meta: {
          return_url: `${req.protocol}://${req.get('host')}/payment-status?order_id=${orderNumber}`,
        },
      };
      
      const response = await cashfree.PGCreateOrder(request);
      
      const orderData = {
        userId,
        orderNumber,
        status: "payment_pending",
        deliveryStatus: "order_placed",
        totalAmount: totalAmount.toString(),
        shippingAddress,
        contactDetails,
      };
      
      const orderItems = cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image,
        quantity: item.quantity,
        price: item.product.price,
      }));
      
      const order = await storage.createOrder(orderData, orderItems);
      
      res.json({
        payment_session_id: response.data.payment_session_id,
        order_id: orderNumber,
        order_details: order,
      });
    } catch (error) {
      console.error("Payment order creation error:", error);
      res.status(500).json({ error: "Failed to create payment order" });
    }
  });

  app.post("/api/payment/verify", verifyFirebaseToken, async (req, res) => {
    try {
      const { orderId } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ error: "Order ID required" });
      }
      
      const cashfreeAppId = process.env.CASHFREE_APP_ID;
      const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;
      
      if (!cashfreeAppId || !cashfreeSecretKey) {
        return res.status(500).json({ error: "Payment gateway not configured" });
      }
      
      const cashfree = new Cashfree(
        process.env.NODE_ENV === "production" ? Cashfree.PRODUCTION : Cashfree.SANDBOX,
        cashfreeAppId,
        cashfreeSecretKey
      );
      
      const response = await cashfree.PGFetchOrder(orderId);
      
      if (response.data.order_status === "PAID") {
        const order = await storage.getOrderByOrderNumber(orderId);
        if (order) {
          await storage.updateOrderStatus(order.id, "confirmed");
          await storage.clearCart(req.userId!);
          
          try {
            const formspreeUrl = `https://formspree.io/f/${process.env.VITE_FORMSPREE_FORM_ID}`;
            const emailBody = {
              subject: `New Order Payment Confirmed: ${orderId}`,
              message: `Payment confirmed for order ${orderId}. Total: ${response.data.order_amount} INR`,
            };
            
            await fetch(formspreeUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(emailBody),
            });
          } catch (emailError) {
            console.error("Email notification error:", emailError);
          }
        }
        
        return res.json({ 
          success: true, 
          status: "PAID",
          order: order,
        });
      } else {
        return res.json({ 
          success: false, 
          status: response.data.order_status,
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
      
      if (!adminPasswordHash) {
        return res.status(500).json({ error: "Admin password not configured" });
      }
      
      const isValid = await bcrypt.compare(password, adminPasswordHash);
      
      if (isValid) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid password" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/admin/stats", verifyAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/orders", verifyAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Get admin orders error:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/admin/orders/:id/tracking", verifyAdmin, async (req, res) => {
    try {
      const { status, location, message } = req.body;
      const orderId = req.params.id;
      
      await storage.updateOrderDeliveryStatus(orderId, status);
      
      await storage.addDeliveryTracking({
        orderId,
        status,
        location: location || null,
        message,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Add tracking error:", error);
      res.status(500).json({ error: "Failed to add tracking" });
    }
  });

  app.post("/api/admin/products", verifyAdmin, async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.json(product);
    } catch (error) {
      console.error("Create product error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/admin/products/:id", verifyAdmin, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", verifyAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
