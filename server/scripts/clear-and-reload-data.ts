import { FirebaseStorage } from "../services/firebase";
import { readFileSync } from "fs";
import { flattenMetaData, validateMetaData, type MetaTargetingItem } from "../utils/data-processor";

async function clearAndReloadData() {
  console.log("🗑️  Clearing existing data...");
  
  const firebaseStorage = new FirebaseStorage();
  
  // Clear all existing data
  await firebaseStorage.clearAllTargetingCategories();
  console.log("✅ Cleared all existing targeting categories");

  console.log("📂 Loading Meta targeting data from file...");
  
  // Load the Meta targeting data
  const metaDataPath = "../attached_assets/Pasted--id-demographics-name-Demographics-size-level-1--1755044367173_1755044367175.txt";
  
  try {
    const rawData = readFileSync(metaDataPath, 'utf-8');
    const metaData: MetaTargetingItem[] = JSON.parse(rawData);
    
    console.log(`📊 Loaded ${metaData.length} raw targeting items`);
    
    // Validate and flatten the data
    const validatedData = validateMetaData(metaData);
    console.log(`✅ Validated ${validatedData.length} targeting items`);
    
    const flattenedData = flattenMetaData(validatedData);
    console.log(`🔄 Flattened to ${flattenedData.length} targeting categories`);
    
    // Upload to Firebase in batches
    console.log("🚀 Uploading to Firebase...");
    await firebaseStorage.batchUploadTargetingCategories(flattenedData);
    
    console.log("✅ Successfully cleared and reloaded all targeting data!");
    
    // Verify the data structure
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    const topLevel = hierarchical.filter(cat => cat.level === 1);
    
    console.log(`🔍 Verification: Found ${topLevel.length} top-level categories:`);
    topLevel.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.children?.length || 0} children)`);
    });
    
  } catch (error) {
    console.error("❌ Error loading or processing data:", error);
    throw error;
  }
}

// Run the script
clearAndReloadData().catch(console.error);