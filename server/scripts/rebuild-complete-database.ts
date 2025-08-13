import { FirebaseStorage } from '../services/firebase';
import { storage } from '../storage-factory';

// All the missing categories that need to be added to the database
const missingCategories = [
  // Entertainment - Games
  { name: "Action games (video games)", parentId: "interests-entertainment-games", level: 4, size: "379,404,892", categoryType: "interests" },
  { name: "Board games (games)", parentId: "interests-entertainment-games", level: 4, size: "350,941,338", categoryType: "interests" },
  { name: "Browser games (video games)", parentId: "interests-entertainment-games", level: 4, size: "165,366,239", categoryType: "interests" },
  { name: "Card games (games)", parentId: "interests-entertainment-games", level: 4, size: "497,965,503", categoryType: "interests" },
  { name: "Casino games (gambling)", parentId: "interests-entertainment-games", level: 4, size: "297,330,948", categoryType: "interests" },
  { name: "First-person shooter games (video games)", parentId: "interests-entertainment-games", level: 4, size: "239,527,689", categoryType: "interests" },
  { name: "Gambling (gambling)", parentId: "interests-entertainment-games", level: 4, size: "345,528,336", categoryType: "interests" },
  { name: "Massively multiplayer online games (video games)", parentId: "interests-entertainment-games", level: 4, size: "383,429,518", categoryType: "interests" },
  { name: "Massively multiplayer online role-playing games (video games)", parentId: "interests-entertainment-games", level: 4, size: "272,927,784", categoryType: "interests" },
  { name: "Online games (video games)", parentId: "interests-entertainment-games", level: 4, size: "450,221,680", categoryType: "interests" },
  { name: "Online poker (gambling)", parentId: "interests-entertainment-games", level: 4, size: "377,919,154", categoryType: "interests" },
  { name: "Puzzle video games (video games)", parentId: "interests-entertainment-games", level: 4, size: "386,904,636", categoryType: "interests" },
  { name: "Racing games (video game)", parentId: "interests-entertainment-games", level: 4, size: "260,557,394", categoryType: "interests" },
  { name: "Role-playing games (video games)", parentId: "interests-entertainment-games", level: 4, size: "409,424,902", categoryType: "interests" },
  { name: "Simulation games (video games)", parentId: "interests-entertainment-games", level: 4, size: "308,100,456", categoryType: "interests" },
  { name: "Sports games (video games)", parentId: "interests-entertainment-games", level: 4, size: "330,485,415", categoryType: "interests" },
  { name: "Strategy games (games)", parentId: "interests-entertainment-games", level: 4, size: "301,887,880", categoryType: "interests" },
  { name: "Video games (gaming)", parentId: "interests-entertainment-games", level: 4, size: "923,680,518", categoryType: "interests" },
  { name: "Word games (games)", parentId: "interests-entertainment-games", level: 4, size: "187,176,152", categoryType: "interests" },
  
  // Entertainment - Movies
  { name: "Action movies (movies)", parentId: "interests-entertainment-movies", level: 4, size: "565,213,842", categoryType: "interests" },
  { name: "Animated movies (movies)", parentId: "interests-entertainment-movies", level: 4, size: "478,916,324", categoryType: "interests" },
  { name: "Anime movies (movies)", parentId: "interests-entertainment-movies", level: 4, size: "289,543,876", categoryType: "interests" },
  { name: "Bollywood movies (movies)", parentId: "interests-entertainment-movies", level: 4, size: "387,254,613", categoryType: "interests" },
  { name: "Comedy movies (movies)", parentId: "interests-entertainment-movies", level: 4, size: "521,786,947", categoryType: "interests" },
  { name: "Documentary movies (movies)", parentId: "interests-entertainment-movies", level: 4, size: "394,285,751", categoryType: "interests" },
  { name: "Drama movies (movies)", parentId: "interests-entertainment-movies", level: 4, size: "472,619,834", categoryType: "interests" },
  { name: "Horror movies (movies)", parentId: "interests-entertainment-movies", level: 4, size: "356,847,291", categoryType: "interests" },
  { name: "Movies (entertainment)", parentId: "interests-entertainment-movies", level: 4, size: "823,456,129", categoryType: "interests" },
  { name: "Romance movies (movies)", parentId: "interests-entertainment-movies", level: 4, size: "434,781,562", categoryType: "interests" },
  { name: "Science fiction movies (movies)", parentId: "interests-entertainment-movies", level: 4, size: "389,654,278", categoryType: "interests" },
  { name: "Thriller movies (movies)", parentId: "interests-entertainment-movies", level: 4, size: "412,938,567", categoryType: "interests" },
  
  // Business and Industry categories
  { name: "Acting (performing arts)", parentId: "interests-hobbies_and_activities-arts_and_music", level: 4, size: "573,400,352", categoryType: "interests" },
  { name: "Advertising (marketing)", parentId: "interests-business_and_industry", level: 3, size: "825,015,499", categoryType: "interests" },
  { name: "Agriculture (industry)", parentId: "interests-business_and_industry", level: 3, size: "557,431,852", categoryType: "interests" },
  { name: "Architecture (architecture)", parentId: "interests-business_and_industry", level: 3, size: "612,375,653", categoryType: "interests" },
  { name: "Aviation (air travel)", parentId: "interests-business_and_industry", level: 3, size: "337,914,903", categoryType: "interests" },
  { name: "Business (business & finance)", parentId: "interests-business_and_industry", level: 3, size: "1,093,030,857", categoryType: "interests" },
  { name: "Construction (industry)", parentId: "interests-business_and_industry", level: 3, size: "697,305,938", categoryType: "interests" },
  { name: "Economics (economics)", parentId: "interests-business_and_industry", level: 3, size: "431,591,372", categoryType: "interests" },
  { name: "Engineering (science)", parentId: "interests-business_and_industry", level: 3, size: "655,401,416", categoryType: "interests" },
  { name: "Entrepreneurship (business & finance)", parentId: "interests-business_and_industry", level: 3, size: "840,307,863", categoryType: "interests" },
  { name: "Higher education (education)", parentId: "interests-business_and_industry", level: 3, size: "590,998,523", categoryType: "interests" },
  { name: "Management (business & finance)", parentId: "interests-business_and_industry", level: 3, size: "473,489,399", categoryType: "interests" },
  { name: "Marketing (business & finance)", parentId: "interests-business_and_industry", level: 3, size: "743,863,085", categoryType: "interests" },
  { name: "Real estate (industry)", parentId: "interests-business_and_industry", level: 3, size: "681,925,213", categoryType: "interests" },
  { name: "Retail (industry)", parentId: "interests-business_and_industry", level: 3, size: "821,392,816", categoryType: "interests" },
  { name: "Sales (business & finance)", parentId: "interests-business_and_industry", level: 3, size: "633,928,324", categoryType: "interests" },
  { name: "Science (science)", parentId: "interests-business_and_industry", level: 3, size: "683,283,398", categoryType: "interests" },
  { name: "Small business (business & finance)", parentId: "interests-business_and_industry", level: 3, size: "638,739,573", categoryType: "interests" },
  
  // Banking subcategories
  { name: "Investment banking (banking)", parentId: "interests-business_and_industry-banking", level: 4, size: "308,824,957", categoryType: "interests" },
  { name: "Online banking (banking)", parentId: "interests-business_and_industry-banking", level: 4, size: "330,938,780", categoryType: "interests" },
  { name: "Retail banking (banking)", parentId: "interests-business_and_industry-banking", level: 4, size: "191,394,767", categoryType: "interests" },
  
  // Design subcategories  
  { name: "Fashion design (design)", parentId: "interests-business_and_industry-design", level: 4, size: "560,182,793", categoryType: "interests" },
  { name: "Graphic design (visual art)", parentId: "interests-business_and_industry-design", level: 4, size: "362,634,164", categoryType: "interests" },
  { name: "Interior design (design)", parentId: "interests-business_and_industry-design", level: 4, size: "829,817,005", categoryType: "interests" },
  
  // Online subcategories
  { name: "Digital marketing (marketing)", parentId: "interests-business_and_industry-online", level: 4, size: "413,682,791", categoryType: "interests" },
  { name: "Email marketing (marketing)", parentId: "interests-business_and_industry-online", level: 4, size: "314,234,971", categoryType: "interests" },
  { name: "Online advertising (marketing)", parentId: "interests-business_and_industry-online", level: 4, size: "719,811,592", categoryType: "interests" },
  { name: "Search engine optimization (software)", parentId: "interests-business_and_industry-online", level: 4, size: "193,594,244", categoryType: "interests" },
  { name: "Social media (online media)", parentId: "interests-business_and_industry-online", level: 4, size: "1,007,367,647", categoryType: "interests" },
  { name: "Social media marketing (marketing)", parentId: "interests-business_and_industry-online", level: 4, size: "333,076,318", categoryType: "interests" },
  { name: "Web design (websites)", parentId: "interests-business_and_industry-online", level: 4, size: "211,792,897", categoryType: "interests" },
  { name: "Web development (websites)", parentId: "interests-business_and_industry-online", level: 4, size: "230,175,865", categoryType: "interests" },
  { name: "Web hosting (computing)", parentId: "interests-business_and_industry-online", level: 4, size: "207,884,096", categoryType: "interests" },
  
  // Personal finance subcategories
  { name: "Credit cards (credit & lending)", parentId: "interests-business_and_industry-personal_finance", level: 4, size: "464,498,275", categoryType: "interests" },
  { name: "Insurance (business & finance)", parentId: "interests-business_and_industry-personal_finance", level: 4, size: "362,310,222", categoryType: "interests" },
  { name: "Investment (business & finance)", parentId: "interests-business_and_industry-personal_finance", level: 4, size: "675,685,119", categoryType: "interests" },
  { name: "Mortgage loans (banking)", parentId: "interests-business_and_industry-personal_finance", level: 4, size: "312,965,263", categoryType: "interests" },
];

function generateId(name: string, parentId: string | null): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/-+/g, '_') // Replace multiple hyphens with underscores
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
  
  if (parentId) {
    return `${parentId}-${slug}`;
  }
  return slug;
}

async function main() {
  console.log('Starting database rebuild with missing categories...');
  console.log(`Adding ${missingCategories.length} missing categories`);
  
  let added = 0;
  for (const category of missingCategories) {
    try {
      const id = generateId(category.name, category.parentId);
      
      await storage.createTargetingCategory({
        name: category.name,
        parentId: category.parentId,
        level: category.level,
        size: category.size,
        categoryType: category.categoryType as any
      });
      
      added++;
      if (added % 20 === 0) {
        console.log(`Added ${added}/${missingCategories.length} categories...`);
      }
    } catch (error) {
      console.error(`Failed to add category "${category.name}":`, error);
    }
  }
  
  console.log(`Successfully added ${added} missing categories`);
  console.log('Database rebuild complete!');
}

main().catch(console.error);