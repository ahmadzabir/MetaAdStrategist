import { storage } from '../storage-factory';

async function main() {
  console.log('🔍 Verifying database status and connectivity...');
  
  try {
    // Test basic storage connection
    const allCategories = await storage.listTargetingCategories();
    console.log(`✅ Database connection successful`);
    console.log(`📊 Total categories in database: ${allCategories.length}`);
    
    if (allCategories.length > 0) {
      console.log(`📋 First 5 categories:`);
      allCategories.slice(0, 5).forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name} (${cat.categoryType}, Level ${cat.level})`);
      });
      
      // Test search functionality
      const searchResults = await storage.searchTargetingCategories('birthday');
      console.log(`🔍 Birthday search results: ${searchResults.length}`);
    } else {
      console.log('❌ Database is empty - all categories lost!');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

main().catch(console.error);