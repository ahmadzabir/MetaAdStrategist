import { FirebaseStorage } from "../services/firebase";

// Standard Meta Ads Behavior categories from Facebook's actual targeting options
const metaBehaviorsData = [
  {
    id: "behaviors-anniversary",
    name: "Anniversary",
    parentId: "behaviors",
    level: 2,
    size: "Size: 12,000,000",
    categoryType: "behaviors",
    children: [
      {
        id: "behaviors-anniversary-anniversary_within_30_days",
        name: "Anniversary within 30 days",
        parentId: "behaviors-anniversary",
        level: 3,
        size: "Size: 5,492,136",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-anniversary-anniversary_within_31_60_days", 
        name: "Anniversary within 31-60 days",
        parentId: "behaviors-anniversary",
        level: 3,
        size: "Size: 7,243,698",
        categoryType: "behaviors"
      }
    ]
  },
  {
    id: "behaviors-consumer_classification",
    name: "Consumer Classification", 
    parentId: "behaviors",
    level: 2,
    size: "",
    categoryType: "behaviors",
    children: [
      {
        id: "behaviors-consumer_classification-all_baby_boomers_us",
        name: "All baby boomers (US)",
        parentId: "behaviors-consumer_classification",
        level: 3,
        size: "Size: 71,000,000",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-consumer_classification-all_generation_x_us",
        name: "All Generation X (US)",
        parentId: "behaviors-consumer_classification", 
        level: 3,
        size: "Size: 65,000,000",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-consumer_classification-all_millennials_us",
        name: "All millennials (US)",
        parentId: "behaviors-consumer_classification",
        level: 3,
        size: "Size: 72,000,000", 
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
        name: "Facebook Page admins",
        parentId: "behaviors-digital_activities",
        level: 3,
        size: "Size: 18,000,000",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-digital_activities-technology_early_adopters",
        name: "Technology early adopters", 
        parentId: "behaviors-digital_activities",
        level: 3,
        size: "Size: 45,000,000",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-digital_activities-small_business_owners",
        name: "Small business owners",
        parentId: "behaviors-digital_activities",
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
        id: "behaviors-mobile_device_user-all_mobile_devices_by_brand",
        name: "All mobile devices by brand",
        parentId: "behaviors-mobile_device_user",
        level: 3,
        size: "",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-mobile_device_user-mobile_device_users_all_devices",
        name: "Mobile device users (all devices)",
        parentId: "behaviors-mobile_device_user", 
        level: 3,
        size: "Size: 230,000,000",
        categoryType: "behaviors"
      }
    ]
  },
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
        name: "Frequent international travelers",
        parentId: "behaviors-purchase_behavior",
        level: 3,
        size: "Size: 24,000,000", 
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
        name: "Frequent travelers", 
        parentId: "behaviors-travel",
        level: 3,
        size: "Size: 34,000,000",
        categoryType: "behaviors"
      },
      {
        id: "behaviors-travel-business_travelers",
        name: "Business travelers",
        parentId: "behaviors-travel",
        level: 3,
        size: "Size: 21,000,000",
        categoryType: "behaviors"
      }
    ]
  }
];

async function addMetaBehaviors() {
  console.log("📱 Adding standard Meta Ads Behavior categories...");
  
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
    
    metaBehaviorsData.forEach(node => processNode(node));
    
    console.log(`🔄 Adding ${flattenedBehaviors.length} standard behaviors categories`);
    
    // Upload to Firebase
    await firebaseStorage.batchUploadTargetingCategories(flattenedBehaviors);
    
    console.log("✅ Successfully added Meta Behaviors data!");
    
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
    console.error("❌ Error adding Meta behaviors data:", error);
    throw error;
  }
}

// Run the script
addMetaBehaviors().catch(console.error);