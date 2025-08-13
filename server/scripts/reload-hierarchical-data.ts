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

async function reloadHierarchicalData() {
  console.log("🗑️  Clearing existing data...");
  
  const firebaseStorage = new FirebaseStorage();
  
  // Clear all existing data
  await firebaseStorage.clearAllTargetingCategories();
  console.log("✅ Cleared all existing targeting categories");

  console.log("📂 Loading hierarchical targeting data...");
  
  try {
    const metaDataPath = "../attached_assets/Pasted--id-demographics-name-Demographics-size-level-1--1755044367173_1755044367175.txt";
    const rawData = readFileSync(metaDataPath, 'utf-8');
    const hierarchicalData: HierarchicalData[] = JSON.parse(rawData);
    
    console.log(`📊 Loaded ${hierarchicalData.length} top-level categories`);
    
    // Flatten the hierarchical data into individual records
    const flattenedCategories: any[] = [];
    
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
      
      // Process children recursively
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => processNode(child));
      }
    }
    
    // Process all top-level nodes
    hierarchicalData.forEach(node => processNode(node));
    
    console.log(`🔄 Flattened to ${flattenedCategories.length} targeting categories`);
    
    // Upload to Firebase in batches
    console.log("🚀 Uploading to Firebase...");
    await firebaseStorage.batchUploadTargetingCategories(flattenedCategories);
    
    console.log("✅ Successfully reloaded all targeting data!");
    
    // Verify the data structure
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    const topLevel = hierarchical.filter(cat => cat.level === 1);
    
    console.log(`🔍 Verification: Found ${topLevel.length} top-level categories:`);
    topLevel.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.children?.length || 0} children)`);
      if (cat.children && cat.children.length > 0) {
        cat.children.slice(0, 3).forEach(child => {
          console.log(`    - ${child.name} (${child.children?.length || 0} children)`);
        });
        if (cat.children.length > 3) {
          console.log(`    ... and ${cat.children.length - 3} more`);
        }
      }
    });
    
  } catch (error) {
    console.error("❌ Error loading or processing data:", error);
    throw error;
  }
}

// Run the script
reloadHierarchicalData().catch(console.error);