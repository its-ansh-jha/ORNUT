import { db } from "./db";
import { products } from "@shared/schema";

const sampleProducts = [
  {
    name: "Classic Creamy Peanut Butter",
    description: "Our signature smooth and creamy peanut butter made from premium roasted peanuts. Perfect for sandwiches, smoothies, or eating straight from the jar!",
    price: "12.99",
    image: "/attached_assets/generated_images/Creamy_peanut_butter_jar_bf318301.png",
    category: "creamy",
    inStock: true,
    stockQuantity: 100,
  },
  {
    name: "Crunchy Peanut Butter",
    description: "For those who love texture! Our crunchy variety is packed with roasted peanut pieces for that satisfying crunch in every bite.",
    price: "12.99",
    image: "/attached_assets/generated_images/Crunchy_peanut_butter_jar_e299f8e0.png",
    category: "crunchy",
    inStock: true,
    stockQuantity: 85,
  },
  {
    name: "Honey Peanut Butter",
    description: "A delightful blend of creamy peanut butter and pure organic honey. Naturally sweet and absolutely delicious on toast or crackers.",
    price: "14.99",
    image: "/attached_assets/generated_images/Honey_peanut_butter_jar_fdbe0e93.png",
    category: "specialty",
    inStock: true,
    stockQuantity: 60,
  },
  {
    name: "Chocolate Peanut Butter",
    description: "Indulge in the perfect marriage of rich cocoa and creamy peanut butter. A treat that satisfies both chocolate and peanut butter cravings!",
    price: "15.99",
    image: "/attached_assets/generated_images/Chocolate_peanut_butter_jar_742e8904.png",
    category: "specialty",
    inStock: true,
    stockQuantity: 50,
  },
];

async function seed() {
  try {
    console.log("🌱 Seeding database...");
    
    const existing = await db.select().from(products);
    
    if (existing.length > 0) {
      console.log("✓ Database already seeded");
      return;
    }
    
    await db.insert(products).values(sampleProducts);
    
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

seed();
