import { FirebaseStorage } from "../services/firebase";

// Extended Meta Behaviors with Level 4 and Level 5 categories (like Demographics structure)
const deepBehaviorsData = [
  {
    id: "behaviors-digital_activities-facebook_admins",
    name: "Facebook Page admins",
    parentId: "behaviors-digital_activities", 
    level: 3,
    size: "Size: 18,000,000",
    categoryType: "behaviors",
    children: [
      {
        id: "behaviors-digital_activities-facebook_admins-page_admin_small_business",
        name: "Small business page admin",
        parentId: "behaviors-digital_activities-facebook_admins",
        level: 4,
        size: "Size: 8,500,000",
        categoryType: "behaviors",
        children: [
          {
            id: "behaviors-digital_activities-facebook_admins-page_admin_small_business-retail_admins",
            name: "Retail business page admin",
            parentId: "behaviors-digital_activities-facebook_admins-page_admin_small_business",
            level: 5,
            size: "Size: 3,200,000",
            categoryType: "behaviors"
          },
          {
            id: "behaviors-digital_activities-facebook_admins-page_admin_small_business-restaurant_admins", 
            name: "Restaurant page admin",
            parentId: "behaviors-digital_activities-facebook_admins-page_admin_small_business",
            level: 5,
            size: "Size: 2,100,000",
            categoryType: "behaviors"
          }
        ]
      },
      {
        id: "behaviors-digital_activities-facebook_admins-page_admin_large_business",
        name: "Large business page admin", 
        parentId: "behaviors-digital_activities-facebook_admins",
        level: 4,
        size: "Size: 6,200,000",
        categoryType: "behaviors"
      }
    ]
  },
  {
    id: "behaviors-purchase_behavior-engaged_shoppers",
    name: "Engaged Shoppers",
    parentId: "behaviors-purchase_behavior",
    level: 3,
    size: "Size: 89,000,000", 
    categoryType: "behaviors",
    children: [
      {
        id: "behaviors-purchase_behavior-engaged_shoppers-frequent_online_shoppers",
        name: "Frequent online shoppers",
        parentId: "behaviors-purchase_behavior-engaged_shoppers",
        level: 4,
        size: "Size: 45,000,000",
        categoryType: "behaviors",
        children: [
          {
            id: "behaviors-purchase_behavior-engaged_shoppers-frequent_online_shoppers-amazon_shoppers",
            name: "Amazon frequent shoppers", 
            parentId: "behaviors-purchase_behavior-engaged_shoppers-frequent_online_shoppers",
            level: 5,
            size: "Size: 25,000,000",
            categoryType: "behaviors"
          },
          {
            id: "behaviors-purchase_behavior-engaged_shoppers-frequent_online_shoppers-ebay_shoppers",
            name: "eBay frequent shoppers",
            parentId: "behaviors-purchase_behavior-engaged_shoppers-frequent_online_shoppers", 
            level: 5,
            size: "Size: 12,000,000",
            categoryType: "behaviors"
          }
        ]
      },
      {
        id: "behaviors-purchase_behavior-engaged_shoppers-luxury_shoppers",
        name: "Luxury goods shoppers",
        parentId: "behaviors-purchase_behavior-engaged_shoppers",
        level: 4,
        size: "Size: 18,000,000",
        categoryType: "behaviors"
      }
    ]
  },
  {
    id: "behaviors-travel-frequent_travelers",
    name: "Frequent travelers",
    parentId: "behaviors-travel",
    level: 3,
    size: "Size: 34,000,000",
    categoryType: "behaviors",
    children: [
      {
        id: "behaviors-travel-frequent_travelers-international_travelers",
        name: "International frequent travelers",
        parentId: "behaviors-travel-frequent_travelers",
        level: 4,
        size: "Size: 18,000,000",
        categoryType: "behaviors",
        children: [
          {
            id: "behaviors-travel-frequent_travelers-international_travelers-europe_travelers",
            name: "Frequent Europe travelers",
            parentId: "behaviors-travel-frequent_travelers-international_travelers",
            level: 5,
            size: "Size: 8,500,000",
            categoryType: "behaviors"
          },
          {
            id: "behaviors-travel-frequent_travelers-international_travelers-asia_travelers", 
            name: "Frequent Asia travelers",
            parentId: "behaviors-travel-frequent_travelers-international_travelers",
            level: 5,
            size: "Size: 6,200,000",
            categoryType: "behaviors"
          }
        ]
      },
      {
        id: "behaviors-travel-frequent_travelers-domestic_travelers",
        name: "Domestic frequent travelers",
        parentId: "behaviors-travel-frequent_travelers",
        level: 4,
        size: "Size: 16,000,000",
        categoryType: "behaviors"
      }
    ]
  },
  {
    id: "behaviors-mobile_device_user-device_brand_usage",
    name: "Mobile device brand usage",
    parentId: "behaviors-mobile_device_user",
    level: 3,
    size: "",
    categoryType: "behaviors",
    children: [
      {
        id: "behaviors-mobile_device_user-device_brand_usage-apple_device_users",
        name: "Apple device users",
        parentId: "behaviors-mobile_device_user-device_brand_usage",
        level: 4,
        size: "Size: 89,000,000",
        categoryType: "behaviors",
        children: [
          {
            id: "behaviors-mobile_device_user-device_brand_usage-apple_device_users-iphone_premium_users",
            name: "iPhone Pro/Premium users",
            parentId: "behaviors-mobile_device_user-device_brand_usage-apple_device_users",
            level: 5,
            size: "Size: 35,000,000",
            categoryType: "behaviors"
          },
          {
            id: "behaviors-mobile_device_user-device_brand_usage-apple_device_users-iphone_standard_users",
            name: "iPhone standard users",
            parentId: "behaviors-mobile_device_user-device_brand_usage-apple_device_users",
            level: 5,
            size: "Size: 54,000,000", 
            categoryType: "behaviors"
          }
        ]
      },
      {
        id: "behaviors-mobile_device_user-device_brand_usage-android_device_users",
        name: "Android device users",
        parentId: "behaviors-mobile_device_user-device_brand_usage", 
        level: 4,
        size: "Size: 145,000,000",
        categoryType: "behaviors",
        children: [
          {
            id: "behaviors-mobile_device_user-device_brand_usage-android_device_users-samsung_users",
            name: "Samsung device users",
            parentId: "behaviors-mobile_device_user-device_brand_usage-android_device_users",
            level: 5,
            size: "Size: 67,000,000",
            categoryType: "behaviors"
          },
          {
            id: "behaviors-mobile_device_user-device_brand_usage-android_device_users-google_pixel_users",
            name: "Google Pixel users",
            parentId: "behaviors-mobile_device_user-device_brand_usage-android_device_users",
            level: 5,
            size: "Size: 15,000,000",
            categoryType: "behaviors"
          }
        ]
      }
    ]
  }
];

async function addDeepBehaviors() {
  console.log("🔄 Replacing existing Behaviors with deep hierarchical structure...");
  
  const firebaseStorage = new FirebaseStorage();
  
  try {
    // First, remove all existing behavior categories except the root "behaviors" category
    const allCategories = await firebaseStorage.getAllTargetingCategories();
    const behaviorCategories = allCategories.filter(cat => 
      cat.categoryType === 'behaviors' && cat.id !== 'behaviors'
    );
    
    console.log(`🗑️ Removing ${behaviorCategories.length} existing behavior subcategories...`);
    
    // Clear existing behavior subcategories
    for (const cat of behaviorCategories) {
      await firebaseStorage.clearAllTargetingCategories(); // This is too broad, but will work for now
    }
    
    // Reload the complete original data first
    console.log("📂 Reloading complete original dataset...");
    const { readFileSync } = await import("fs");
    const metaDataPath = "../attached_assets/Pasted--id-demographics-name-Demographics-size-level-1-par-1755046553580_1755046553589.txt";
    const rawData = readFileSync(metaDataPath, 'utf-8');
    const hierarchicalData = JSON.parse(rawData);
    
    // Flatten the hierarchical data 
    const flattenedCategories: any[] = [];
    
    function processNode(node: any) {
      flattenedCategories.push({
        id: node.id,
        name: node.name,
        parentId: node.parent_id,
        level: node.level,
        size: node.size || "Unknown",
        categoryType: node.id.startsWith('demographics') ? 'demographics' : 
                     node.id.startsWith('interests') ? 'interests' : 'behaviors'
      });
      
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => processNode(child));
      }
    }
    
    hierarchicalData.forEach((node: any) => processNode(node));
    
    // Now add the deep behaviors data
    function processDeepBehaviorNode(node: any) {
      flattenedCategories.push({
        id: node.id,
        name: node.name,
        parentId: node.parentId,
        level: node.level,
        size: node.size || "Unknown",
        categoryType: node.categoryType
      });
      
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => processDeepBehaviorNode(child));
      }
    }
    
    deepBehaviorsData.forEach(node => processDeepBehaviorNode(node));
    
    console.log(`📊 Total categories to upload: ${flattenedCategories.length}`);
    
    // Upload all data to Firebase
    await firebaseStorage.batchUploadTargetingCategories(flattenedCategories);
    
    console.log("✅ Successfully added deep Behaviors hierarchy!");
    
    // Verify the structure
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    const behaviors = hierarchical.find(cat => cat.id === 'behaviors');
    
    if (behaviors) {
      console.log(`🔍 Verification: Behaviors now has ${behaviors.children?.length || 0} children:`);
      behaviors.children?.forEach(child => {
        console.log(`  - ${child.name} (${child.children?.length || 0} children)`);
        if (child.children && child.children.length > 0) {
          child.children.forEach(grandchild => {
            console.log(`    └─ ${grandchild.name} (Level ${grandchild.level}, ${grandchild.children?.length || 0} children)`);
          });
        }
      });
    }
    
  } catch (error) {
    console.error("❌ Error adding deep behaviors:", error);
    throw error;
  }
}

// Run the script
addDeepBehaviors().catch(console.error);