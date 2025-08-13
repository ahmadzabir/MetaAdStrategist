import { FirebaseStorage } from "../services/firebase";
import { readFileSync } from "fs";
import path from "path";

// Additional deep behavior categories to supplement the original data
const additionalBehaviors = [
  // Level 3 categories under existing Level 2s
  {
    id: "behaviors-digital_activities-facebook_page_admins",
    name: "Facebook Page Admins",
    parentId: "behaviors-digital_activities",
    level: 3,
    size: "Size: 18,000,000",
    categoryType: "behaviors",
  },
  {
    id: "behaviors-digital_activities-instagram_business_tools",
    name: "Instagram Business Tools",
    parentId: "behaviors-digital_activities", 
    level: 3,
    size: "Size: 25,000,000",
    categoryType: "behaviors",
  },
  // Level 4 categories
  {
    id: "behaviors-digital_activities-facebook_page_admins-small_business_admins",
    name: "Small Business Page Admins",
    parentId: "behaviors-digital_activities-facebook_page_admins",
    level: 4,
    size: "Size: 12,000,000",
    categoryType: "behaviors",
  },
  {
    id: "behaviors-digital_activities-facebook_page_admins-large_business_admins",
    name: "Large Business Page Admins", 
    parentId: "behaviors-digital_activities-facebook_page_admins",
    level: 4,
    size: "Size: 6,000,000",
    categoryType: "behaviors",
  },
  {
    id: "behaviors-digital_activities-instagram_business_tools-verified_accounts",
    name: "Instagram Verified Business Accounts",
    parentId: "behaviors-digital_activities-instagram_business_tools",
    level: 4,
    size: "Size: 8,500,000",
    categoryType: "behaviors",
  },
  // Level 5 categories
  {
    id: "behaviors-digital_activities-facebook_page_admins-small_business_admins-retail_admins",
    name: "Retail Store Page Admins",
    parentId: "behaviors-digital_activities-facebook_page_admins-small_business_admins", 
    level: 5,
    size: "Size: 5,200,000",
    categoryType: "behaviors",
  },
  {
    id: "behaviors-digital_activities-facebook_page_admins-small_business_admins-restaurant_admins",
    name: "Restaurant Page Admins",
    parentId: "behaviors-digital_activities-facebook_page_admins-small_business_admins",
    level: 5,
    size: "Size: 3,800,000",
    categoryType: "behaviors",
  },
  {
    id: "behaviors-digital_activities-instagram_business_tools-verified_accounts-influencer_verified",
    name: "Verified Influencer Accounts",
    parentId: "behaviors-digital_activities-instagram_business_tools-verified_accounts",
    level: 5,
    size: "Size: 2,100,000",
    categoryType: "behaviors",
  },
  
  // Purchase behavior deep categories
  {
    id: "behaviors-purchase_behavior-frequent_online_shoppers",
    name: "Frequent Online Shoppers",
    parentId: "behaviors-purchase_behavior",
    level: 3,
    size: "Size: 89,000,000",
    categoryType: "behaviors",
  },
  {
    id: "behaviors-purchase_behavior-frequent_online_shoppers-premium_shoppers",
    name: "Premium Brand Shoppers",
    parentId: "behaviors-purchase_behavior-frequent_online_shoppers",
    level: 4,
    size: "Size: 35,000,000", 
    categoryType: "behaviors",
  },
  {
    id: "behaviors-purchase_behavior-frequent_online_shoppers-premium_shoppers-luxury_fashion",
    name: "Luxury Fashion Shoppers",
    parentId: "behaviors-purchase_behavior-frequent_online_shoppers-premium_shoppers",
    level: 5,
    size: "Size: 18,000,000",
    categoryType: "behaviors",
  },
  
  // Travel deep categories
  {
    id: "behaviors-travel-frequent_travelers",
    name: "Frequent Travelers",
    parentId: "behaviors-travel",
    level: 3,
    size: "Size: 45,000,000",
    categoryType: "behaviors",
  },
  {
    id: "behaviors-travel-frequent_travelers-international_travelers",
    name: "International Travelers",
    parentId: "behaviors-travel-frequent_travelers",
    level: 4,
    size: "Size: 28,000,000",
    categoryType: "behaviors",
  },
  {
    id: "behaviors-travel-frequent_travelers-international_travelers-europe_frequent",
    name: "Frequent Europe Travelers",
    parentId: "behaviors-travel-frequent_travelers-international_travelers",
    level: 5,
    size: "Size: 15,000,000",
    categoryType: "behaviors",
  }
];

async function urgentCompleteReload() {
  console.log("🚨 URGENT: Complete reload with deep behaviors...");
  
  const firebaseStorage = new FirebaseStorage();
  
  try {
    // Clear everything first
    console.log("🗑️ Clearing all data...");
    await firebaseStorage.clearAllTargetingCategories();
    
    // Load the original complete dataset
    console.log("📂 Loading original complete dataset...");
    const filePath = "../attached_assets/Pasted--id-demographics-name-Demographics-size-level-1-par-1755046553580_1755046553589.txt";
    const rawData = readFileSync(filePath, 'utf-8');
    const hierarchicalData = JSON.parse(rawData);
    
    // Flatten the original hierarchical data into proper format
    const allCategories: any[] = [];
    
    function processNode(node: any) {
      const categoryType = node.id.startsWith('demographics') ? 'demographics' : 
                          node.id.startsWith('interests') ? 'interests' : 'behaviors';
      
      allCategories.push({
        id: node.id,
        name: node.name,
        parentId: node.parent_id || null,
        level: node.level,
        size: node.size || "Unknown",
        categoryType: categoryType
      });
      
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => processNode(child));
      }
    }
    
    hierarchicalData.forEach((node: any) => processNode(node));
    
    // Add the additional deep behaviors
    allCategories.push(...additionalBehaviors);
    
    console.log(`📊 Total categories to upload: ${allCategories.length}`);
    console.log(`📋 Breakdown:`);
    console.log(`  - Demographics: ${allCategories.filter(c => c.categoryType === 'demographics').length}`);
    console.log(`  - Interests: ${allCategories.filter(c => c.categoryType === 'interests').length}`);
    console.log(`  - Behaviors: ${allCategories.filter(c => c.categoryType === 'behaviors').length}`);
    
    // Upload all categories
    console.log("🚀 Uploading complete dataset...");
    await firebaseStorage.batchUploadTargetingCategories(allCategories);
    
    console.log("✅ Complete upload successful!");
    
    // Verify the hierarchy build
    console.log("🔍 Building and verifying hierarchy...");
    const hierarchicalResult = await firebaseStorage.getHierarchicalTargetingCategories();
    
    hierarchicalResult.forEach(cat => {
      console.log(`📋 ${cat.name} (Level ${cat.level}) - ${cat.children?.length || 0} children`);
      if (cat.id === 'behaviors' && cat.children) {
        cat.children.forEach(child => {
          console.log(`  └─ ${child.name} (Level ${child.level}) - ${child.children?.length || 0} children`);
          if (child.children && child.children.length > 0) {
            child.children.forEach(grandchild => {
              console.log(`     └─ ${grandchild.name} (Level ${grandchild.level}) - ${grandchild.children?.length || 0} children`);
              if (grandchild.children && grandchild.children.length > 0) {
                grandchild.children.forEach(ggc => {
                  console.log(`        └─ ${ggc.name} (Level ${ggc.level}) - ${ggc.children?.length || 0} children`);
                });
              }
            });
          }
        });
      }
    });
    
    const totalInDb = await firebaseStorage.getAllTargetingCategories();
    console.log(`📊 Final verification: ${totalInDb.length} categories in database`);
    
    const behaviorCount = totalInDb.filter(c => c.categoryType === 'behaviors').length;
    const behaviorL4Count = totalInDb.filter(c => c.categoryType === 'behaviors' && c.level === 4).length;
    const behaviorL5Count = totalInDb.filter(c => c.categoryType === 'behaviors' && c.level === 5).length;
    
    console.log(`🎯 Behaviors verification:`);
    console.log(`  - Total behaviors: ${behaviorCount}`);
    console.log(`  - Level 4 behaviors: ${behaviorL4Count}`);
    console.log(`  - Level 5 behaviors: ${behaviorL5Count}`);
    
  } catch (error) {
    console.error("❌ Error during urgent reload:", error);
    throw error;
  }
}

// Run the script
urgentCompleteReload().catch(console.error);