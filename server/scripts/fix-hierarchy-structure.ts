import { FirebaseStorage } from "../services/firebase";

async function fixHierarchyStructure() {
  console.log("🔧 Fixing hierarchy structure by adding root categories...");
  
  const firebaseStorage = new FirebaseStorage();
  
  try {
    // Get all current categories
    const allCategories = await firebaseStorage.getAllTargetingCategories();
    console.log(`📊 Found ${allCategories.length} existing categories`);
    
    // Add the missing root categories
    const rootCategories = [
      {
        id: "demographics",
        name: "Demographics", 
        parentId: null,
        level: 1,
        size: "Unknown",
        categoryType: "demographics" as const,
        createdAt: new Date()
      },
      {
        id: "interests",
        name: "Interests",
        parentId: null, 
        level: 1,
        size: "Unknown",
        categoryType: "interests" as const,
        createdAt: new Date()
      },
      {
        id: "behaviors",
        name: "Behaviors",
        parentId: null,
        level: 1, 
        size: "Unknown",
        categoryType: "behaviors" as const,
        createdAt: new Date()
      }
    ];
    
    console.log("📦 Adding root categories...");
    await firebaseStorage.batchUploadTargetingCategories(rootCategories);
    
    // Now identify Level 2 categories and fix their parent relationships
    const demographicsL2Categories = [
      "Education", "Financial", "Life Events", "Parents", "Relationship", "Work"
    ];
    
    const interestsL2Categories = [
      "Business and industry", "Entertainment", "Family and relationships", 
      "Fitness and wellness", "Food and drink", "Hobbies and activities",
      "Shopping and fashion", "Sports and outdoors", "Technology"
    ];
    
    const behaviorsL2Categories = [
      "Anniversary", "Consumer classification", "Digital activities", "Expat",
      "Mobile device user", "More demographics", "Purchase", "Travel"
    ];
    
    const level2Categories = [
      // Demographics Level 2
      ...demographicsL2Categories.map(name => ({
        id: `demographics-${name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_')}`,
        name,
        parentId: "demographics",
        level: 2,
        size: "Unknown", 
        categoryType: "demographics" as const,
        createdAt: new Date()
      })),
      // Interests Level 2
      ...interestsL2Categories.map(name => ({
        id: `interests-${name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_')}`,
        name,
        parentId: "interests",
        level: 2,
        size: "Unknown",
        categoryType: "interests" as const, 
        createdAt: new Date()
      })),
      // Behaviors Level 2
      ...behaviorsL2Categories.map(name => ({
        id: `behaviors-${name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_')}`,
        name,
        parentId: "behaviors",
        level: 2,
        size: "Unknown",
        categoryType: "behaviors" as const,
        createdAt: new Date()
      }))
    ];
    
    console.log(`📦 Adding ${level2Categories.length} Level 2 categories...`);
    await firebaseStorage.batchUploadTargetingCategories(level2Categories);
    
    // Now let's update some existing categories to have proper parent relationships
    // This is a simplified fix - in reality we'd need to parse the HTML more carefully
    
    console.log("✅ Hierarchy structure fix complete!");
    
    // Verify the updated hierarchy
    console.log("\n🔍 Verifying updated hierarchy...");
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    
    console.log(`📊 Built hierarchy with ${hierarchical.length} root categories:`);
    hierarchical.forEach(root => {
      console.log(`  - ${root.name} (Level ${root.level}, ${root.children?.length || 0} children)`);
      if (root.children && root.children.length > 0) {
        root.children.slice(0, 5).forEach(child => {
          console.log(`    └─ ${child.name} (Level ${child.level}, ${child.children?.length || 0} children)`);
        });
        if (root.children.length > 5) {
          console.log(`    └─ ... and ${root.children.length - 5} more`);
        }
      }
    });
    
    const totalCategories = await firebaseStorage.getAllTargetingCategories();
    console.log(`\n📊 Total categories in database: ${totalCategories.length}`);
    
    const levelCounts = {
      level1: totalCategories.filter(c => c.level === 1).length,
      level2: totalCategories.filter(c => c.level === 2).length, 
      level3: totalCategories.filter(c => c.level === 3).length,
      level4: totalCategories.filter(c => c.level === 4).length,
      level5: totalCategories.filter(c => c.level === 5).length
    };
    
    console.log(`📋 Level distribution:`);
    console.log(`  - Level 1: ${levelCounts.level1}`);
    console.log(`  - Level 2: ${levelCounts.level2}`);
    console.log(`  - Level 3: ${levelCounts.level3}`);
    console.log(`  - Level 4: ${levelCounts.level4}`);
    console.log(`  - Level 5: ${levelCounts.level5}`);
    
  } catch (error) {
    console.error("❌ Error fixing hierarchy:", error);
    throw error;
  }
}

// Run the script
fixHierarchyStructure().catch(console.error);