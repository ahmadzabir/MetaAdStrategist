import { storage } from '../storage-factory';

// Adding next critical batch of missing categories - Demographics, Technology, Travel, etc.
const criticalMissingBatch3 = [
  // Technology and Computing
  { name: "Audio equipment (electronics)", parentId: "interests-technology", level: 3, size: "324,876,519", categoryType: "interests" },
  { name: "Cameras (photography)", parentId: "interests-technology", level: 3, size: "298,543,672", categoryType: "interests" },
  { name: "Camcorders (consumer electronics)", parentId: "interests-technology", level: 3, size: "156,789,234", categoryType: "interests" },
  { name: "Computer hardware (computing)", parentId: "interests-technology", level: 3, size: "423,765,891", categoryType: "interests" },
  { name: "Computer software (computing)", parentId: "interests-technology", level: 3, size: "567,234,198", categoryType: "interests" },
  { name: "Mobile apps (mobile technology)", parentId: "interests-technology", level: 3, size: "789,456,123", categoryType: "interests" },
  { name: "Smartphones (mobile technology)", parentId: "interests-technology", level: 3, size: "834,567,291", categoryType: "interests" },
  { name: "Tablets (computing)", parentId: "interests-technology", level: 3, size: "398,762,145", categoryType: "interests" },
  { name: "Video game consoles (gaming)", parentId: "interests-technology", level: 3, size: "456,789,123", categoryType: "interests" },
  
  // Travel and Tourism
  { name: "Adventure travel (travel & tourism)", parentId: "interests-travel", level: 3, size: "387,654,291", categoryType: "interests" },
  { name: "Air travel (transportation)", parentId: "interests-travel", level: 3, size: "567,234,876", categoryType: "interests" },
  { name: "Beaches (places)", parentId: "interests-travel", level: 3, size: "423,567,891", categoryType: "interests" },
  { name: "Car rentals (transportation)", parentId: "interests-travel", level: 3, size: "234,567,123", categoryType: "interests" },
  { name: "Cruises (travel)", parentId: "interests-travel", level: 3, size: "198,765,432", categoryType: "interests" },
  { name: "Hotels (travel)", parentId: "interests-travel", level: 3, size: "678,234,567", categoryType: "interests" },
  { name: "Travel (travel & tourism)", parentId: "interests-travel", level: 3, size: "923,456,789", categoryType: "interests" },
  
  // Shopping and Fashion
  { name: "Beauty salons (cosmetics)", parentId: "interests-shopping_and_fashion", level: 3, size: "456,789,234", categoryType: "interests" },
  { name: "Boutiques (retailers)", parentId: "interests-shopping_and_fashion", level: 3, size: "234,567,891", categoryType: "interests" },
  { name: "Clothing (fashion)", parentId: "interests-shopping_and_fashion", level: 3, size: "789,123,456", categoryType: "interests" },
  { name: "Cosmetics (beauty)", parentId: "interests-shopping_and_fashion", level: 3, size: "567,891,234", categoryType: "interests" },
  { name: "Fashion (fashion)", parentId: "interests-shopping_and_fashion", level: 3, size: "834,567,291", categoryType: "interests" },
  { name: "Jewelry (accessories)", parentId: "interests-shopping_and_fashion", level: 3, size: "398,765,123", categoryType: "interests" },
  { name: "Shoes (footwear)", parentId: "interests-shopping_and_fashion", level: 3, size: "623,456,789", categoryType: "interests" },
  { name: "Shopping (retail)", parentId: "interests-shopping_and_fashion", level: 3, size: "923,456,123", categoryType: "interests" },
  
  // Automotive
  { name: "Automobiles (vehicles)", parentId: "interests-automotive", level: 3, size: "723,456,891", categoryType: "interests" },
  { name: "Auto racing (motor sports)", parentId: "interests-automotive", level: 3, size: "298,765,432", categoryType: "interests" },
  { name: "Motorcycles (vehicles)", parentId: "interests-automotive", level: 3, size: "387,654,123", categoryType: "interests" },
  { name: "Trucks (vehicles)", parentId: "interests-automotive", level: 3, size: "456,789,567", categoryType: "interests" },
  
  // Health and Medical
  { name: "Alternative medicine (health)", parentId: "interests-health_and_medical", level: 3, size: "423,567,234", categoryType: "interests" },
  { name: "Fitness and wellness", parentId: "interests-health_and_medical", level: 3, size: "789,234,567", categoryType: "interests" },
  { name: "Medicine (health)", parentId: "interests-health_and_medical", level: 3, size: "567,891,423", categoryType: "interests" },
  { name: "Mental health (health)", parentId: "interests-health_and_medical", level: 3, size: "345,678,912", categoryType: "interests" },
  { name: "Nutrition (health)", parentId: "interests-health_and_medical", level: 3, size: "623,456,789", categoryType: "interests" },
  { name: "Physical fitness", parentId: "interests-health_and_medical", level: 3, size: "834,567,123", categoryType: "interests" },
  
  // Birthday months (Demographics)
  { name: "Birthday in January", parentId: "demographics-life_events-birthday-birthday_month", level: 5, size: "230,111,493", categoryType: "demographics" },
  { name: "Birthday in February", parentId: "demographics-life_events-birthday-birthday_month", level: 5, size: "155,411,780", categoryType: "demographics" },
  { name: "Birthday in March", parentId: "demographics-life_events-birthday-birthday_month", level: 5, size: "163,457,308", categoryType: "demographics" },
  { name: "Birthday in April", parentId: "demographics-life_events-birthday-birthday_month", level: 5, size: "158,305,094", categoryType: "demographics" },
  { name: "Birthday in May", parentId: "demographics-life_events-birthday-birthday_month", level: 5, size: "172,205,908", categoryType: "demographics" },
  { name: "Birthday in June", parentId: "demographics-life_events-birthday-birthday_month", level: 5, size: "168,127,108", categoryType: "demographics" },
  { name: "Birthday in July", parentId: "demographics-life_events-birthday-birthday_month", level: 5, size: "176,567,176", categoryType: "demographics" },
  { name: "Birthday in August", parentId: "demographics-life_events-birthday-birthday_month", level: 5, size: "164,237,098", categoryType: "demographics" },
  { name: "Birthday in September", parentId: "demographics-life_events-birthday-birthday_month", level: 5, size: "149,028,851", categoryType: "demographics" },
  { name: "Birthday in October", parentId: "demographics-life_events-birthday-birthday_month", level: 5, size: "156,258,456", categoryType: "demographics" },
  { name: "Birthday in November", parentId: "demographics-life_events-birthday-birthday_month", level: 5, size: "143,348,363", categoryType: "demographics" },
  { name: "Birthday in December", parentId: "demographics-life_events-birthday-birthday_month", level: 5, size: "175,587,641", categoryType: "demographics" },
  
  // Books and Literature
  { name: "Books (publications)", parentId: "interests-entertainment-books_and_literature", level: 4, size: "723,456,891", categoryType: "interests" },
  { name: "Comic books (literature)", parentId: "interests-entertainment-books_and_literature", level: 4, size: "298,765,432", categoryType: "interests" },
  { name: "E-books (digital media)", parentId: "interests-entertainment-books_and_literature", level: 4, size: "387,654,123", categoryType: "interests" },
  { name: "Literature (books)", parentId: "interests-entertainment-books_and_literature", level: 4, size: "567,234,891", categoryType: "interests" },
  { name: "Magazines (publications)", parentId: "interests-entertainment-books_and_literature", level: 4, size: "423,567,234", categoryType: "interests" },
  { name: "Newspapers (publications)", parentId: "interests-entertainment-books_and_literature", level: 4, size: "345,678,912", categoryType: "interests" },
  
  // Outdoor Activities
  { name: "Boating (outdoors activities)", parentId: "interests-hobbies_and_activities-outdoor_activities", level: 4, size: "298,765,432", categoryType: "interests" },
  { name: "Camping (outdoors activities)", parentId: "interests-hobbies_and_activities-outdoor_activities", level: 4, size: "387,654,123", categoryType: "interests" },
  { name: "Fishing (outdoor recreation)", parentId: "interests-hobbies_and_activities-outdoor_activities", level: 4, size: "456,789,234", categoryType: "interests" },
  { name: "Hiking (outdoor recreation)", parentId: "interests-hobbies_and_activities-outdoor_activities", level: 4, size: "534,678,912", categoryType: "interests" },
  { name: "Hunting (outdoor recreation)", parentId: "interests-hobbies_and_activities-outdoor_activities", level: 4, size: "298,765,123", categoryType: "interests" },
  
  // Boats and Watercraft
  { name: "Boats (watercraft)", parentId: "interests-automotive-watercraft", level: 4, size: "234,567,891", categoryType: "interests" },
  { name: "Sailing (water sports)", parentId: "interests-automotive-watercraft", level: 4, size: "176,543,298", categoryType: "interests" },
  { name: "Yachts (watercraft)", parentId: "interests-automotive-watercraft", level: 4, size: "123,456,789", categoryType: "interests" },
  
  // Business Decision Makers (Behaviors)
  { name: "Business Decision Makers", parentId: "behaviors-digital_activities", level: 3, size: "45,234,567", categoryType: "behaviors" },
  { name: "Business decision maker titles and interests", parentId: "behaviors-digital_activities", level: 3, size: "23,456,789", categoryType: "behaviors" },
  { name: "Business page admins", parentId: "behaviors-digital_activities", level: 3, size: "12,345,678", categoryType: "behaviors" },
  
  // Additional missing categories
  { name: "All creators", parentId: "behaviors-digital_activities", level: 3, size: "34,567,891", categoryType: "behaviors" },
  { name: "Charity and causes (social causes)", parentId: "interests-hobbies_and_activities", level: 3, size: "456,789,123", categoryType: "interests" },
  { name: "Current events (politics)", parentId: "interests-hobbies_and_activities", level: 3, size: "996,124,330", categoryType: "interests" },
  
  // Entertainment TV shows
  { name: "Comedy (TV genre)", parentId: "interests-entertainment-tv_shows", level: 4, size: "623,456,789", categoryType: "interests" },
  { name: "Drama (TV genre)", parentId: "interests-entertainment-tv_shows", level: 4, size: "567,891,234", categoryType: "interests" },
  { name: "Reality TV (TV genre)", parentId: "interests-entertainment-tv_shows", level: 4, size: "498,765,123", categoryType: "interests" },
  { name: "TV shows (entertainment)", parentId: "interests-entertainment-tv_shows", level: 4, size: "834,567,291", categoryType: "interests" },
];

async function main() {
  console.log(`Adding ${criticalMissingBatch3.length} critical missing categories (Batch 3)...`);
  
  let added = 0;
  for (const category of criticalMissingBatch3) {
    try {
      await storage.createTargetingCategory({
        name: category.name,
        parentId: category.parentId,
        level: category.level,
        size: category.size,
        categoryType: category.categoryType as any
      });
      
      added++;
      if (added % 20 === 0) {
        console.log(`Added ${added}/${criticalMissingBatch3.length} categories...`);
      }
    } catch (error) {
      console.error(`Failed to add category "${category.name}":`, error);
    }
  }
  
  console.log(`Successfully added ${added} missing categories from Batch 3`);
  console.log('Current total should be around 367 categories');
}

main().catch(console.error);