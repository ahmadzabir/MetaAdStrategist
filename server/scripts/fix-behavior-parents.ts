import { FirebaseStorage } from "../services/firebase";

async function fixBehaviorParents() {
  console.log("🔧 Fixing behavior parent relationships...");
  
  const firebaseStorage = new FirebaseStorage();
  
  try {
    // Get all categories 
    const allCategories = await firebaseStorage.getAllTargetingCategories();
    console.log(`📊 Found ${allCategories.length} total categories`);
    
    // Find behavior categories that need fixing
    const behaviorCategories = allCategories.filter(cat => cat.categoryType === 'behaviors');
    console.log(`🎯 Found ${behaviorCategories.length} behavior categories:`);
    
    behaviorCategories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.id}) Level ${cat.level}, Parent: ${cat.parentId || 'NULL'}`);
    });
    
    // First, let's see what's wrong and add missing Level 2 behaviors that should be parents
    const behaviorsRoot = behaviorCategories.find(cat => cat.id === 'behaviors');
    const level2Behaviors = behaviorCategories.filter(cat => cat.level === 2);
    const level3Behaviors = behaviorCategories.filter(cat => cat.level === 3);
    
    console.log(`📋 Current structure:`);
    console.log(`  - Root: ${behaviorsRoot ? 'EXISTS' : 'MISSING'}`);
    console.log(`  - Level 2: ${level2Behaviors.length} categories`);
    console.log(`  - Level 3: ${level3Behaviors.length} categories`);
    
    // The issue: I have Level 3+ behaviors but no Level 2 parents
    // I need to extract the Level 2 parent names from the Level 3 IDs and create them
    
    const missingLevel2Parents = new Set<string>();
    level3Behaviors.forEach(cat => {
      // Extract the parent ID from the child ID 
      // e.g., "behaviors-digital_activities-facebook_page_admins" -> "behaviors-digital_activities"
      const parts = cat.id.split('-');
      if (parts.length >= 3) {
        const parentId = parts.slice(0, 3).join('-'); // behaviors-digital_activities
        missingLevel2Parents.add(parentId);
      }
    });
    
    console.log(`🔍 Missing Level 2 parents that need to be created:`, Array.from(missingLevel2Parents));
    
    // Create the missing Level 2 behavior categories
    const newLevel2Categories = Array.from(missingLevel2Parents).map(parentId => {
      const name = parentId.split('-').slice(2).join(' ').replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()); // Convert to title case
      
      return {
        id: parentId,
        name: name,
        parentId: 'behaviors',
        level: 2,
        size: "Unknown",
        categoryType: 'behaviors' as const,
        createdAt: new Date()
      };
    });
    
    console.log(`📦 Creating ${newLevel2Categories.length} missing Level 2 categories:`);
    newLevel2Categories.forEach(cat => {
      console.log(`  + ${cat.name} (${cat.id})`);
    });
    
    // Upload the missing Level 2 categories
    if (newLevel2Categories.length > 0) {
      await firebaseStorage.batchUploadTargetingCategories(newLevel2Categories);
      console.log("✅ Successfully created missing Level 2 behavior categories!");
    }
    
    // Now verify the hierarchy
    console.log("🔍 Verifying updated hierarchy...");
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    const behaviorsHierarchy = hierarchical.find(cat => cat.id === 'behaviors');
    
    if (behaviorsHierarchy) {
      console.log(`📋 Behaviors hierarchy:`);
      console.log(`  Root: ${behaviorsHierarchy.name} - ${behaviorsHierarchy.children?.length || 0} children`);
      
      behaviorsHierarchy.children?.forEach(l2 => {
        console.log(`    L2: ${l2.name} - ${l2.children?.length || 0} children`);
        l2.children?.forEach(l3 => {
          console.log(`      L3: ${l3.name} - ${l3.children?.length || 0} children`);
          l3.children?.forEach(l4 => {
            console.log(`        L4: ${l4.name} - ${l4.children?.length || 0} children`);
            l4.children?.forEach(l5 => {
              console.log(`          L5: ${l5.name}`);
            });
          });
        });
      });
    }
    
  } catch (error) {
    console.error("❌ Error fixing behavior parents:", error);
    throw error;
  }
}

// Run the script
fixBehaviorParents().catch(console.error);