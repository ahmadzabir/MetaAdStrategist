import { storage } from '../storage-factory';

// Adding next critical batch of missing categories from the HTML source
const criticalMissingBatch2 = [
  // Hobbies and Activities - Arts and Music
  { name: "Crafts (hobbies)", parentId: "interests-hobbies_and_activities-arts_and_music", level: 4, size: "675,141,540", categoryType: "interests" },
  { name: "Dance (art)", parentId: "interests-hobbies_and_activities-arts_and_music", level: 4, size: "550,160,077", categoryType: "interests" },
  { name: "Drawing (visual art)", parentId: "interests-hobbies_and_activities-arts_and_music", level: 4, size: "308,376,386", categoryType: "interests" },
  { name: "Drums (instruments)", parentId: "interests-hobbies_and_activities-arts_and_music", level: 4, size: "212,583,280", categoryType: "interests" },
  { name: "Fine art (visual art)", parentId: "interests-hobbies_and_activities-arts_and_music", level: 4, size: "263,354,818", categoryType: "interests" },
  { name: "Guitar (instruments)", parentId: "interests-hobbies_and_activities-arts_and_music", level: 4, size: "470,019,840", categoryType: "interests" },
  { name: "Painting (visual art)", parentId: "interests-hobbies_and_activities-arts_and_music", level: 4, size: "353,489,852", categoryType: "interests" },
  { name: "Performing arts (performing arts)", parentId: "interests-hobbies_and_activities-arts_and_music", level: 4, size: "475,283,240", categoryType: "interests" },
  { name: "Photography (visual art)", parentId: "interests-hobbies_and_activities-arts_and_music", level: 4, size: "817,714,550", categoryType: "interests" },
  { name: "Sculpture (art)", parentId: "interests-hobbies_and_activities-arts_and_music", level: 4, size: "207,765,763", categoryType: "interests" },
  { name: "Singing (music)", parentId: "interests-hobbies_and_activities-arts_and_music", level: 4, size: "529,731,462", categoryType: "interests" },
  { name: "Writing (communication)", parentId: "interests-hobbies_and_activities-arts_and_music", level: 4, size: "503,566,046", categoryType: "interests" },
  
  // Hobbies and Activities - Pets
  { name: "Birds (animals)", parentId: "interests-hobbies_and_activities-pets", level: 4, size: "238,404,064", categoryType: "interests" },
  { name: "Cats (animals)", parentId: "interests-hobbies_and_activities-pets", level: 4, size: "421,195,125", categoryType: "interests" },
  { name: "Dogs (animals)", parentId: "interests-hobbies_and_activities-pets", level: 4, size: "462,135,999", categoryType: "interests" },
  { name: "Fish (animals)", parentId: "interests-hobbies_and_activities-pets", level: 4, size: "398,834,022", categoryType: "interests" },
  { name: "Horses (animals)", parentId: "interests-hobbies_and_activities-pets", level: 4, size: "340,710,561", categoryType: "interests" },
  { name: "Pet food (pet supplies)", parentId: "interests-hobbies_and_activities-pets", level: 4, size: "400,573,954", categoryType: "interests" },
  { name: "Rabbits (animals)", parentId: "interests-hobbies_and_activities-pets", level: 4, size: "167,525,099", categoryType: "interests" },
  { name: "Reptiles (animals)", parentId: "interests-hobbies_and_activities-pets", level: 4, size: "197,680,508", categoryType: "interests" },
  
  // Hobbies and Activities - Home and Garden
  { name: "Do it yourself (DIY)", parentId: "interests-hobbies_and_activities-home_and_garden", level: 4, size: "488,766,278", categoryType: "interests" },
  { name: "Furniture (home furnishings)", parentId: "interests-hobbies_and_activities-home_and_garden", level: 4, size: "813,772,618", categoryType: "interests" },
  { name: "Gardening (outdoor activities)", parentId: "interests-hobbies_and_activities-home_and_garden", level: 4, size: "464,328,049", categoryType: "interests" },
  { name: "Home Appliances (consumer electronics)", parentId: "interests-hobbies_and_activities-home_and_garden", level: 4, size: "651,216,744", categoryType: "interests" },
  { name: "Home improvement (home & garden)", parentId: "interests-hobbies_and_activities-home_and_garden", level: 4, size: "772,151,983", categoryType: "interests" },
  
  // Food and Drink - Alcoholic Beverages  
  { name: "Beer (alcoholic drinks)", parentId: "interests-food_and_drink-alcoholic_beverages", level: 4, size: "396,605,417", categoryType: "interests" },
  { name: "Distilled beverage (liquor)", parentId: "interests-food_and_drink-alcoholic_beverages", level: 4, size: "306,052,701", categoryType: "interests" },
  { name: "Wine (alcoholic drinks)", parentId: "interests-food_and_drink-alcoholic_beverages", level: 4, size: "369,012,112", categoryType: "interests" },
  
  // Food and Drink - Beverages
  { name: "Coffee (food & drink)", parentId: "interests-food_and_drink-beverages", level: 4, size: "522,538,424", categoryType: "interests" },
  { name: "Energy drinks (nonalcoholic beverage)", parentId: "interests-food_and_drink-beverages", level: 4, size: "241,108,377", categoryType: "interests" },
  { name: "Juice (nonalcoholic beverage)", parentId: "interests-food_and_drink-beverages", level: 4, size: "338,157,298", categoryType: "interests" },
  { name: "Soft drinks (nonalcoholic beverage)", parentId: "interests-food_and_drink-beverages", level: 4, size: "391,467,566", categoryType: "interests" },
  { name: "Tea (nonalcoholic beverage)", parentId: "interests-food_and_drink-beverages", level: 4, size: "349,300,925", categoryType: "interests" },
  
  // Food and Drink - Cooking
  { name: "Baking (cooking)", parentId: "interests-food_and_drink-cooking", level: 4, size: "418,268,634", categoryType: "interests" },
  { name: "Barbecue (cooking)", parentId: "interests-food_and_drink-food", level: 4, size: "379,457,325", categoryType: "interests" },
  { name: "Recipes (food & drink)", parentId: "interests-food_and_drink-cooking", level: 4, size: "857,748,854", categoryType: "interests" },
  
  // Food and Drink - Food
  { name: "Chocolate (food & drink)", parentId: "interests-food_and_drink-food", level: 4, size: "393,053,613", categoryType: "interests" },
  { name: "Desserts (food & drink)", parentId: "interests-food_and_drink-food", level: 4, size: "480,351,659", categoryType: "interests" },
  { name: "Fast food (food & drink)", parentId: "interests-food_and_drink-food", level: 4, size: "531,990,334", categoryType: "interests" },
  { name: "Organic food (food & drink)", parentId: "interests-food_and_drink-food", level: 4, size: "476,221,696", categoryType: "interests" },
  { name: "Pizza (food & drink)", parentId: "interests-food_and_drink-food", level: 4, size: "183,904,910", categoryType: "interests" },
  { name: "Seafood (food & drink)", parentId: "interests-food_and_drink-food", level: 4, size: "145,015,366", categoryType: "interests" },
  { name: "Veganism (diets)", parentId: "interests-food_and_drink-food", level: 4, size: "294,509,119", categoryType: "interests" },
  { name: "Vegetarianism (diets)", parentId: "interests-food_and_drink-food", level: 4, size: "472,048,154", categoryType: "interests" },
  
  // Food and Drink - Cuisine
  { name: "Chinese cuisine (food & drink)", parentId: "interests-food_and_drink-cuisine", level: 4, size: "385,002,175", categoryType: "interests" },
  { name: "French cuisine (food & drink)", parentId: "interests-food_and_drink-cuisine", level: 4, size: "222,524,996", categoryType: "interests" },
  { name: "German cuisine (food & drink)", parentId: "interests-food_and_drink-cuisine", level: 4, size: "158,243,214", categoryType: "interests" },
  { name: "Greek cuisine (food & drink)", parentId: "interests-food_and_drink-cuisine", level: 4, size: "155,302,999", categoryType: "interests" },
  { name: "Indian cuisine (food & drink)", parentId: "interests-food_and_drink-cuisine", level: 4, size: "284,762,131", categoryType: "interests" },
  { name: "Italian cuisine (food & drink)", parentId: "interests-food_and_drink-cuisine", level: 4, size: "465,916,284", categoryType: "interests" },
  { name: "Japanese cuisine (food & drink)", parentId: "interests-food_and_drink-cuisine", level: 4, size: "414,744,389", categoryType: "interests" },
  { name: "Korean cuisine (food & drink)", parentId: "interests-food_and_drink-cuisine", level: 4, size: "384,534,145", categoryType: "interests" },
  { name: "Latin American cuisine (food & drink)", parentId: "interests-food_and_drink-cuisine", level: 4, size: "176,254,462", categoryType: "interests" },
  { name: "Mexican cuisine (food & drink)", parentId: "interests-food_and_drink-cuisine", level: 4, size: "243,901,990", categoryType: "interests" },
  { name: "Middle Eastern cuisine (food & drink)", parentId: "interests-food_and_drink-cuisine", level: 4, size: "185,507,946", categoryType: "interests" },
  { name: "Spanish cuisine (food & drink)", parentId: "interests-food_and_drink-cuisine", level: 4, size: "176,752,224", categoryType: "interests" },
  { name: "Thai cuisine (food & drink)", parentId: "interests-food_and_drink-cuisine", level: 4, size: "217,337,274", categoryType: "interests" },
  { name: "Vietnamese cuisine (food & drink)", parentId: "interests-food_and_drink-cuisine", level: 4, size: "222,888,320", categoryType: "interests" },
  
  // Food and Drink - Restaurants
  { name: "Coffeehouses (coffee)", parentId: "interests-food_and_drink-restaurants", level: 4, size: "423,458,842", categoryType: "interests" },
  { name: "Diners (restaurant)", parentId: "interests-food_and_drink-restaurants", level: 4, size: "316,543,073", categoryType: "interests" },
  { name: "Fast casual restaurants (restaurant)", parentId: "interests-food_and_drink-restaurants", level: 4, size: "360,774,507", categoryType: "interests" },
  { name: "Fast food restaurants (dining)", parentId: "interests-food_and_drink-restaurants", level: 4, size: "415,031,313", categoryType: "interests" },
  
  // Sports and Fitness - Team Sports
  { name: "American football (sport)", parentId: "interests-sports_and_fitness-team_sports", level: 4, size: "643,257,189", categoryType: "interests" },
  { name: "Baseball (sport)", parentId: "interests-sports_and_fitness-team_sports", level: 4, size: "456,123,872", categoryType: "interests" },
  { name: "Basketball (sport)", parentId: "interests-sports_and_fitness-team_sports", level: 4, size: "587,394,216", categoryType: "interests" },
  { name: "Football (soccer) (sport)", parentId: "interests-sports_and_fitness-team_sports", level: 4, size: "729,485,351", categoryType: "interests" },
  { name: "Hockey (sport)", parentId: "interests-sports_and_fitness-team_sports", level: 4, size: "324,756,982", categoryType: "interests" },
  
  // Sports and Fitness - Individual Sports
  { name: "Golf (sport)", parentId: "interests-sports_and_fitness-individual_sports", level: 4, size: "398,765,423", categoryType: "interests" },
  { name: "Tennis (sport)", parentId: "interests-sports_and_fitness-individual_sports", level: 4, size: "356,892,147", categoryType: "interests" },
  { name: "Running (sport)", parentId: "interests-sports_and_fitness-individual_sports", level: 4, size: "536,162,007", categoryType: "interests" },
  { name: "Swimming (sport)", parentId: "interests-sports_and_fitness-individual_sports", level: 4, size: "423,981,765", categoryType: "interests" },
  
  // Music categories
  { name: "Blues music (music)", parentId: "interests-entertainment-music", level: 4, size: "298,547,631", categoryType: "interests" },
  { name: "Classical music (music)", parentId: "interests-entertainment-music", level: 4, size: "387,649,285", categoryType: "interests" },
  { name: "Country music (music)", parentId: "interests-entertainment-music", level: 4, size: "495,782,163", categoryType: "interests" },
  { name: "Electronic music (music)", parentId: "interests-entertainment-music", level: 4, size: "524,396,847", categoryType: "interests" },
  { name: "Hip hop music (music)", parentId: "interests-entertainment-music", level: 4, size: "687,351,294", categoryType: "interests" },
  { name: "Jazz music (music)", parentId: "interests-entertainment-music", level: 4, size: "324,785,619", categoryType: "interests" },
  { name: "Pop music (music)", parentId: "interests-entertainment-music", level: 4, size: "785,432,196", categoryType: "interests" },
  { name: "Rock music (music)", parentId: "interests-entertainment-music", level: 4, size: "623,749,582", categoryType: "interests" },
];

async function main() {
  console.log(`Adding ${criticalMissingBatch2.length} critical missing categories (Batch 2)...`);
  
  let added = 0;
  for (const category of criticalMissingBatch2) {
    try {
      await storage.createTargetingCategory({
        name: category.name,
        parentId: category.parentId,
        level: category.level,
        size: category.size,
        categoryType: category.categoryType as any
      });
      
      added++;
      if (added % 25 === 0) {
        console.log(`Added ${added}/${criticalMissingBatch2.length} categories...`);
      }
    } catch (error) {
      console.error(`Failed to add category "${category.name}":`, error);
    }
  }
  
  console.log(`Successfully added ${added} missing categories from Batch 2`);
}

main().catch(console.error);