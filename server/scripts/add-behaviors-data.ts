import { FirebaseStorage } from "../services/firebase";

// Common Meta Ads Behaviors categories based on actual targeting options
const behaviorsData = [
  {
    id: "behaviors-purchase_behavior",
    name: "Purchase Behavior",
    parentId: "behaviors",
    level: 2,
    size: "",
    categoryType: "behaviors",
    children: [
      {
        id: "behaviors-purchase_behavior-engaged_shoppers",
        name: "Engaged Shoppers",
        parentId: "behaviors-purchase_behavior",
        level: 3,
        size: "Size: 89,000,000",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-purchase_behavior-frequent_international_travelers",
        name: "Frequent International Travelers",
        parentId: "behaviors-purchase_behavior",
        level: 3,
        size: "Size: 24,000,000",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-purchase_behavior-luxury_goods_shoppers",
        name: "Luxury Goods Shoppers",
        parentId: "behaviors-purchase_behavior",
        level: 3,
        size: "Size: 12,000,000",
        categoryType: "behaviors"
      }
    ]
  },
  {
    id: "behaviors-digital_activities",
    name: "Digital Activities",
    parentId: "behaviors",
    level: 2,
    size: "",
    categoryType: "behaviors",
    children: [
      {
        id: "behaviors-digital_activities-facebook_page_admins",
        name: "Facebook Page Admins",
        parentId: "behaviors-digital_activities",
        level: 3,
        size: "Size: 18,000,000",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-digital_activities-technology_early_adopters",
        name: "Technology Early Adopters",
        parentId: "behaviors-digital_activities",
        level: 3,
        size: "Size: 45,000,000",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-digital_activities-gaming_enthusiasts",
        name: "Gaming Enthusiasts",
        parentId: "behaviors-digital_activities",
        level: 3,
        size: "Size: 67,000,000",
        categoryType: "behaviors"
      }
    ]
  },
  {
    id: "behaviors-travel",
    name: "Travel",
    parentId: "behaviors",
    level: 2,
    size: "",
    categoryType: "behaviors",
    children: [
      {
        id: "behaviors-travel-frequent_travelers",
        name: "Frequent Travelers",
        parentId: "behaviors-travel",
        level: 3,
        size: "Size: 34,000,000",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-travel-business_travelers",
        name: "Business Travelers",
        parentId: "behaviors-travel",
        level: 3,
        size: "Size: 21,000,000",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-travel-recently_returned_from_travel",
        name: "Recently Returned from Travel",
        parentId: "behaviors-travel",
        level: 3,
        size: "Size: 15,000,000",
        categoryType: "behaviors"
      }
    ]
  },
  {
    id: "behaviors-mobile_device_user",
    name: "Mobile Device User",
    parentId: "behaviors",
    level: 2,
    size: "",
    categoryType: "behaviors",
    children: [
      {
        id: "behaviors-mobile_device_user-android_users",
        name: "Android Users",
        parentId: "behaviors-mobile_device_user",
        level: 3,
        size: "Size: 145,000,000",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-mobile_device_user-iphone_users",
        name: "iPhone Users",
        parentId: "behaviors-mobile_device_user",
        level: 3,
        size: "Size: 89,000,000",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-mobile_device_user-tablet_users",
        name: "Tablet Users",
        parentId: "behaviors-mobile_device_user",
        level: 3,
        size: "Size: 56,000,000",
        categoryType: "behaviors"
      }
    ]
  }
];

async function addBehaviorsData() {
  console.log("📱 Adding Behaviors categories...");
  
  const firebaseStorage = new FirebaseStorage();
  
  try {
    // Flatten the behaviors data
    const flattenedBehaviors: any[] = [];
    
    function processNode(node: any) {
      flattenedBehaviors.push({
        id: node.id,
        name: node.name,
        parentId: node.parentId,
        level: node.level,
        size: node.size || "Unknown",
        categoryType: node.categoryType
      });
      
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => processNode(child));
      }
    }
    
    behaviorsData.forEach(node => processNode(node));
    
    console.log(`🔄 Adding ${flattenedBehaviors.length} behaviors categories`);
    
    // Upload to Firebase
    await firebaseStorage.batchUploadTargetingCategories(flattenedBehaviors);
    
    console.log("✅ Successfully added Behaviors data!");
    
    // Verify the data structure
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    const behaviors = hierarchical.find(cat => cat.id === 'behaviors');
    
    if (behaviors) {
      console.log(`🔍 Verification: Behaviors now has ${behaviors.children?.length || 0} children:`);
      behaviors.children?.forEach(child => {
        console.log(`  - ${child.name} (${child.children?.length || 0} children)`);
      });
    }
    
  } catch (error) {
    console.error("❌ Error adding behaviors data:", error);
    throw error;
  }
}

// Run the script
addBehaviorsData().catch(console.error);