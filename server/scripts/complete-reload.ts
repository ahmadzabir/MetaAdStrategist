import { FirebaseStorage } from "../services/firebase";
import { readFileSync } from "fs";

interface HierarchicalData {
  id: string;
  name: string;
  size: string;
  level: number;
  parent_id: string | null;
  children: HierarchicalData[];
}

async function completeReload() {
  console.log("🗑️  COMPLETE DATABASE WIPE - Clearing ALL existing data...");
  
  const firebaseStorage = new FirebaseStorage();
  
  // Clear all existing data completely
  await firebaseStorage.clearAllTargetingCategories();
  console.log("✅ Database completely cleared");

  console.log("📂 Loading COMPLETE hierarchical targeting data from new file...");
  
  try {
    const metaDataPath = "../attached_assets/Pasted--id-demographics-name-Demographics-size-level-1-par-1755046553580_1755046553589.txt";
    const rawData = readFileSync(metaDataPath, 'utf-8');
    const hierarchicalData: HierarchicalData[] = JSON.parse(rawData);
    
    console.log(`📊 Loaded ${hierarchicalData.length} top-level categories from complete dataset`);
    
    // Flatten the hierarchical data into individual records - PRESERVE EVERY SINGLE RECORD
    const flattenedCategories: any[] = [];
    let totalProcessed = 0;
    
    function processNode(node: HierarchicalData) {
      // Add the current node
      flattenedCategories.push({
        id: node.id,
        name: node.name,
        parentId: node.parent_id,
        level: node.level,
        size: node.size || "Unknown",
        categoryType: node.id.startsWith('demographics') ? 'demographics' : 
                     node.id.startsWith('interests') ? 'interests' : 'behaviors'
      });
      totalProcessed++;
      
      // Process children recursively - PRESERVE ALL LEVELS
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => processNode(child));
      }
    }
    
    // Process all top-level nodes
    hierarchicalData.forEach(node => {
      console.log(`Processing ${node.name} (${node.children?.length || 0} direct children)`);
      processNode(node);
    });
    
    console.log(`🔄 COMPLETE FLATTENING: ${totalProcessed} records processed`);
    console.log(`📋 Final flattened count: ${flattenedCategories.length} targeting categories`);
    
    // Verify counts by category type
    const demographics = flattenedCategories.filter(c => c.categoryType === 'demographics');
    const interests = flattenedCategories.filter(c => c.categoryType === 'interests');
    const behaviors = flattenedCategories.filter(c => c.categoryType === 'behaviors');
    
    console.log(`📈 Category breakdown:`);
    console.log(`  - Demographics: ${demographics.length} records`);
    console.log(`  - Interests: ${interests.length} records`);
    console.log(`  - Behaviors: ${behaviors.length} records`);
    
    // Upload to Firebase in batches - PRESERVE ALL DATA
    console.log("🚀 Uploading COMPLETE dataset to Firebase...");
    await firebaseStorage.batchUploadTargetingCategories(flattenedCategories);
    
    console.log("✅ COMPLETE RELOAD SUCCESSFUL!");
    
    // Verify the data structure with detailed counts
    console.log("🔍 VERIFICATION - Building hierarchy from uploaded data...");
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    const topLevel = hierarchical.filter(cat => cat.level === 1);
    
    console.log(`📋 VERIFICATION RESULTS: Found ${hierarchical.length} total categories`);
    console.log(`🏗️  Found ${topLevel.length} top-level categories:`);
    
    topLevel.forEach(cat => {
      const childCount = cat.children?.length || 0;
      console.log(`  - ${cat.name} (Level ${cat.level}, ${childCount} direct children)`);
      
      // Show some children for verification
      if (cat.children && cat.children.length > 0) {
        cat.children.slice(0, 5).forEach(child => {
          const grandchildCount = child.children?.length || 0;
          console.log(`    └─ ${child.name} (Level ${child.level}, ${grandchildCount} children)`);
        });
        if (cat.children.length > 5) {
          console.log(`    └─ ... and ${cat.children.length - 5} more`);
        }
      }
    });
    
    // Count verification
    console.log(`\n📊 FINAL VERIFICATION:`);
    console.log(`Total categories in database: ${hierarchical.length}`);
    console.log(`Expected from file: ${flattenedCategories.length}`);
    console.log(`Match: ${hierarchical.length === flattenedCategories.length ? '✅ YES' : '❌ NO - DATA LOSS DETECTED'}`);
    
  } catch (error) {
    console.error("❌ CRITICAL ERROR during complete reload:", error);
    throw error;
  }
}

// Run the complete reload script
completeReload().catch(console.error);