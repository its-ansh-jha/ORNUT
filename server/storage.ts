import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  users,
  products,
  cartItems,
  wishlistItems,
  orders,
  orderItems,
  deliveryTracking,
  returns,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type WishlistItem,
  type InsertWishlistItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type DeliveryTracking,
  type InsertDeliveryTracking,
  type Return,
  type InsertReturn,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;
  
  getCartItems(userId: string): Promise<any[]>;
  getCartItem(id: string): Promise<CartItem | undefined>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  getWishlistItems(userId: string): Promise<any[]>;
  getWishlistItem(id: string): Promise<WishlistItem | undefined>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: string): Promise<void>;
  
  getOrders(userId: string): Promise<any[]>;
  getOrder(id: string): Promise<any | undefined>;
  getOrderByOrderNumber(orderNumber: string): Promise<any | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  
  getAllOrders(): Promise<any[]>;
  addDeliveryTracking(tracking: InsertDeliveryTracking): Promise<DeliveryTracking>;
  getDeliveryTracking(orderId: string): Promise<DeliveryTracking[]>;
  updateOrderDeliveryStatus(orderId: string, status: string): Promise<void>;
  
  createReturn(returnRequest: InsertReturn): Promise<Return>;
  getReturns(userId: string): Promise<any[]>;
  getAllReturns(): Promise<any[]>;
  updateReturn(id: string, data: Partial<InsertReturn>): Promise<Return | undefined>;
  
  getStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getCartItems(userId: string): Promise<any[]> {
    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, userId),
      with: {
        product: true,
      },
    });
    return items;
  }

  async getCartItem(id: string): Promise<CartItem | undefined> {
    const [item] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return item || undefined;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const existing = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.userId, item.userId),
        eq(cartItems.productId, item.productId)
      ),
    });

    if (existing) {
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing.quantity + item.quantity })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }

    const [newItem] = await db.insert(cartItems).values(item).returning();
    return newItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated || undefined;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async getWishlistItems(userId: string): Promise<any[]> {
    const items = await db.query.wishlistItems.findMany({
      where: eq(wishlistItems.userId, userId),
      with: {
        product: true,
      },
    });
    return items;
  }

  async getWishlistItem(id: string): Promise<WishlistItem | undefined> {
    const [item] = await db.select().from(wishlistItems).where(eq(wishlistItems.id, id));
    return item || undefined;
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    const [newItem] = await db.insert(wishlistItems).values(item).returning();
    return newItem;
  }

  async removeFromWishlist(id: string): Promise<void> {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
  }

  async getOrders(userId: string): Promise<any[]> {
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: [desc(orders.createdAt)],
      with: {
        orderItems: true,
      },
    });
    return userOrders;
  }

  async getOrder(id: string): Promise<any | undefined> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        orderItems: true,
      },
    });
    return order || undefined;
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<any | undefined> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
      with: {
        orderItems: true,
      },
    });
    return order || undefined;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    await db.insert(orderItems).values(
      items.map((item) => ({ ...item, orderId: newOrder.id }))
    );

    await db.insert(deliveryTracking).values({
      orderId: newOrder.id,
      status: "order_placed",
      message: "Order has been placed successfully",
    });

    return newOrder;
  }

  async getAllOrders(): Promise<any[]> {
    const allOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      with: {
        orderItems: true,
      },
    });
    return allOrders;
  }

  async addDeliveryTracking(tracking: InsertDeliveryTracking): Promise<DeliveryTracking> {
    const [newTracking] = await db.insert(deliveryTracking).values(tracking).returning();
    return newTracking;
  }

  async getDeliveryTracking(orderId: string): Promise<DeliveryTracking[]> {
    return db
      .select()
      .from(deliveryTracking)
      .where(eq(deliveryTracking.orderId, orderId))
      .orderBy(deliveryTracking.timestamp);
  }

  async updateOrderDeliveryStatus(orderId: string, status: string): Promise<void> {
    await db.update(orders).set({ deliveryStatus: status }).where(eq(orders.id, orderId));
  }

  async createReturn(returnRequest: InsertReturn): Promise<Return> {
    const [newReturn] = await db.insert(returns).values(returnRequest).returning();
    return newReturn;
  }

  async getReturns(userId: string): Promise<any[]> {
    const userReturns = await db.query.returns.findMany({
      where: eq(returns.userId, userId),
      orderBy: [desc(returns.requestedAt)],
      with: {
        order: {
          with: {
            orderItems: true,
          },
        },
      },
    });
    return userReturns;
  }

  async getAllReturns(): Promise<any[]> {
    const allReturns = await db.query.returns.findMany({
      orderBy: [desc(returns.requestedAt)],
      with: {
        order: {
          with: {
            orderItems: true,
          },
        },
        user: true,
      },
    });
    return allReturns;
  }

  async updateReturn(id: string, data: Partial<InsertReturn>): Promise<Return | undefined> {
    const [updatedReturn] = await db
      .update(returns)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(returns.id, id))
      .returning();
    return updatedReturn || undefined;
  }

  async getStats(): Promise<any> {
    const allOrders = await db.select().from(orders);
    const allProducts = await db.select().from(products);
    
    const totalOrders = allOrders.length;
    const revenue = allOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalProducts = allProducts.length;
    const pendingDeliveries = allOrders.filter(
      (o) => o.deliveryStatus !== "delivered" && o.deliveryStatus !== "cancelled"
    ).length;

    return {
      totalOrders,
      revenue,
      totalProducts,
      pendingDeliveries,
    };
  }
}

export const storage = new DatabaseStorage();
