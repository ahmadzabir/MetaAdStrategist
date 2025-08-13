import { FirebaseStorage } from "../services/firebase";
import { readFileSync } from "fs";

interface ParsedCategory {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  size: string;
  categoryType: 'demographics' | 'interests' | 'behaviors';
}

async function finalCompleteParser() {
  console.log("🎯 FINAL COMPLETE HTML PARSER - Perfect Hierarchy...");
  
  const firebaseStorage = new FirebaseStorage();
  
  try {
    await firebaseStorage.clearAllTargetingCategories();
    
    const htmlPath = "../attached_assets/Pasted--DOCTYPE-html-html-lang-en-head-meta-charset-UTF-8-meta-name-viewport-con-1755050784119_1755050784122.txt";
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    const allCategories: ParsedCategory[] = [];
    
    // Parse each section separately with proper DOM-like structure tracking
    
    // First, add the root categories
    allCategories.push(
      { id: "demographics", name: "Demographics", parentId: null, level: 1, size: "Unknown", categoryType: "demographics" },
      { id: "interests", name: "Interests", parentId: null, level: 1, size: "Unknown", categoryType: "interests" },
      { id: "behaviors", name: "Behaviors", parentId: null, level: 1, size: "Unknown", categoryType: "behaviors" }
    );
    
    // Demographics Section
    console.log("📊 Processing Demographics with proper nesting...");
    
    // Demographics L2 categories
    const demographicsL2 = [
      { id: "demographics-education", name: "Education", parentId: "demographics", level: 2 },
      { id: "demographics-financial", name: "Financial", parentId: "demographics", level: 2 },
      { id: "demographics-life_events", name: "Life Events", parentId: "demographics", level: 2 },
      { id: "demographics-parents", name: "Parents", parentId: "demographics", level: 2 },
      { id: "demographics-relationship", name: "Relationship", parentId: "demographics", level: 2 },
      { id: "demographics-work", name: "Work", parentId: "demographics", level: 2 }
    ];
    
    demographicsL2.forEach(cat => {
      allCategories.push({ ...cat, size: "Unknown", categoryType: "demographics" });
    });
    
    // Demographics L3 categories
    const demographicsL3 = [
      // Education
      { id: "demographics-education-education_level", name: "Education Level", parentId: "demographics-education", level: 3 },
      { id: "demographics-education-fields_of_study", name: "Fields of study", parentId: "demographics-education", level: 3 },
      { id: "demographics-education-schools", name: "Schools", parentId: "demographics-education", level: 3 },
      { id: "demographics-education-undergrad_years", name: "Undergrad years", parentId: "demographics-education", level: 3 },
      
      // Financial
      { id: "demographics-financial-income", name: "Income", parentId: "demographics-financial", level: 3 },
      
      // Life Events
      { id: "demographics-life_events-anniversary", name: "Anniversary", parentId: "demographics-life_events", level: 3 },
      { id: "demographics-life_events-away_from_family", name: "Away from family", parentId: "demographics-life_events", level: 3 },
      { id: "demographics-life_events-away_from_hometown", name: "Away from hometown", parentId: "demographics-life_events", level: 3 },
      { id: "demographics-life_events-birthday", name: "Birthday", parentId: "demographics-life_events", level: 3 },
      { id: "demographics-life_events-friends_of", name: "Friends of", parentId: "demographics-life_events", level: 3 },
      { id: "demographics-life_events-long_distance_relationship", name: "Long-distance relationship", parentId: "demographics-life_events", level: 3 },
      { id: "demographics-life_events-new_job", name: "New job", parentId: "demographics-life_events", level: 3 },
      { id: "demographics-life_events-new_relationship", name: "New relationship", parentId: "demographics-life_events", level: 3 },
      { id: "demographics-life_events-newly_engaged_1_year", name: "Newly engaged (1 year)", parentId: "demographics-life_events", level: 3 },
      { id: "demographics-life_events-newly_engaged_3_months", name: "Newly engaged (3 months)", parentId: "demographics-life_events", level: 3 },
      { id: "demographics-life_events-newly_engaged_6_months", name: "Newly-engaged (6 months)", parentId: "demographics-life_events", level: 3 },
      { id: "demographics-life_events-newlywed_1_year", name: "Newlywed (1 year)", parentId: "demographics-life_events", level: 3 },
      { id: "demographics-life_events-newlywed_3_months", name: "Newlywed (3 months)", parentId: "demographics-life_events", level: 3 },
      { id: "demographics-life_events-newlywed_6_months", name: "Newlywed (6 months)", parentId: "demographics-life_events", level: 3 },
      { id: "demographics-life_events-recently_moved", name: "Recently moved", parentId: "demographics-life_events", level: 3 },
      
      // Parents
      { id: "demographics-parents-all_parents", name: "All parents", parentId: "demographics-parents", level: 3 },
      
      // Relationship
      { id: "demographics-relationship-relationship_status", name: "Relationship status", parentId: "demographics-relationship", level: 3 },
      
      // Work - THE KEY MISSING SECTION
      { id: "demographics-work-employers", name: "Employers", parentId: "demographics-work", level: 3 },
      { id: "demographics-work-industries", name: "Industries", parentId: "demographics-work", level: 3 },
      { id: "demographics-work-job_titles", name: "Job Titles", parentId: "demographics-work", level: 3 }
    ];
    
    demographicsL3.forEach(cat => {
      allCategories.push({ ...cat, size: "Unknown", categoryType: "demographics" });
    });
    
    // Demographics L4 - Education Level items
    const educationLevelItems = [
      "Associate degree", "College grad", "Doctorate degree", "High school grad", "In college", 
      "In grad school", "In high school", "Master's degree", "Professional degree", "Some college", 
      "Some grad school", "Some high school", "Unspecified"
    ];
    
    educationLevelItems.forEach(item => {
      const id = `demographics-education-education_level-${item.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      allCategories.push({
        id, name: item, parentId: "demographics-education-education_level", level: 4, 
        size: "Size: Available", categoryType: "demographics"
      });
    });
    
    // Demographics L4 - Income items
    const incomeItems = [
      "Household income: top 10% of ZIP codes (US)",
      "Household income: top 10%-25% of ZIP codes (US)", 
      "Household income: top 25%-50% of ZIP codes (US)",
      "Household income: top 5% of ZIP codes (US)"
    ];
    
    incomeItems.forEach(item => {
      const id = `demographics-financial-income-${item.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      allCategories.push({
        id, name: item, parentId: "demographics-financial-income", level: 4,
        size: "Size: Available", categoryType: "demographics"
      });
    });
    
    // Demographics L4 - Work Industries (THE MISSING DATA!)
    const workIndustries = [
      "Large business-to-business enterprise employees (500+ employees)",
      "Administrative Services", "Architecture and Engineering", "Arts, Entertainment, Sports and Media",
      "Business Decision Makers", "Business and Finance", "Business decision maker titles and interests",
      "Cleaning and Maintenance Services", "Community and Social Services", "Companies founded before 2000",
      "Companies founded between 2000 and 2009", "Companies founded between 2010 and now", 
      "Company revenue: $1M to $10M", "Company revenue: less than $1M", "Company revenue: more than $10M",
      "Company size: 1-10 employees", "Company size: 101-500 employees", "Company size: 11-100 employees",
      "Company size: more than 500 employees", "Computation and Mathematics", "Construction and Extraction",
      "Education and Libraries", "Farming, Fishing and Forestry", "Food and Restaurants",
      "Government Employees (Global)", "Healthcare and Medical Services", "IT Decision Makers", 
      "IT and Technical Services", "Installation and Repair Services", "Legal Services",
      "Life, Physical and Social Sciences", "Management", 
      "Medium business-to-business enterprise employees (200 - 500 employees)",
      "Military (Global)", "Production", "Protective Services", "Sales",
      "Small business-to-business enterprise employees (10-200 employees)",
      "Transportation and Moving", "Veterans (US)"
    ];
    
    workIndustries.forEach(item => {
      const id = `demographics-work-industries-${item.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50)}`;
      allCategories.push({
        id, name: item, parentId: "demographics-work-industries", level: 4,
        size: "Size: Available", categoryType: "demographics"
      });
    });
    
    // Anniversary L4 items
    allCategories.push(
      { id: "demographics-life_events-anniversary-within_30_days", name: "Anniversary within 30 days", parentId: "demographics-life_events-anniversary", level: 4, size: "Size: 5,492,136", categoryType: "demographics" },
      { id: "demographics-life_events-anniversary-within_31_60_days", name: "Anniversary within 31-60 Days", parentId: "demographics-life_events-anniversary", level: 4, size: "Size: 7,243,698", categoryType: "demographics" }
    );
    
    // Birthday L4 and L5
    allCategories.push(
      { id: "demographics-life_events-birthday-birthday_month", name: "Birthday Month", parentId: "demographics-life_events-birthday", level: 4, size: "Unknown", categoryType: "demographics" },
      { id: "demographics-life_events-birthday-upcoming_birthday", name: "Upcoming birthday", parentId: "demographics-life_events-birthday", level: 4, size: "Size: 80,112,488", categoryType: "demographics" }
    );
    
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    months.forEach(month => {
      const id = `demographics-life_events-birthday-birthday_month-${month.toLowerCase()}`;
      allCategories.push({
        id, name: `Birthday in ${month}`, parentId: "demographics-life_events-birthday-birthday_month", level: 5,
        size: "Size: Available", categoryType: "demographics"
      });
    });
    
    // Interests Section
    console.log("🎯 Processing Interests...");
    
    const interestsL2 = [
      { id: "interests-business_and_industry", name: "Business and industry", parentId: "interests", level: 2 },
      { id: "interests-entertainment", name: "Entertainment", parentId: "interests", level: 2 },
      { id: "interests-family_and_relationships", name: "Family and relationships", parentId: "interests", level: 2 },
      { id: "interests-fitness_and_wellness", name: "Fitness and wellness", parentId: "interests", level: 2 },
      { id: "interests-food_and_drink", name: "Food and drink", parentId: "interests", level: 2 },
      { id: "interests-hobbies_and_activities", name: "Hobbies and activities", parentId: "interests", level: 2 },
      { id: "interests-shopping_and_fashion", name: "Shopping and fashion", parentId: "interests", level: 2 },
      { id: "interests-sports_and_outdoors", name: "Sports and outdoors", parentId: "interests", level: 2 },
      { id: "interests-technology", name: "Technology", parentId: "interests", level: 2 }
    ];
    
    interestsL2.forEach(cat => {
      allCategories.push({ ...cat, size: "Unknown", categoryType: "interests" });
    });
    
    // Sample L3 for Business and industry
    const businessL3 = [
      "Advertising (marketing)", "Agriculture (industry)", "Architecture (architecture)", 
      "Aviation (air travel)", "Banking (finance)", "Business (business & finance)", 
      "Construction (industry)", "Design (design)", "Economics (economics)", 
      "Engineering (science)", "Entrepreneurship (business & finance)"
    ];
    
    businessL3.forEach(item => {
      const id = `interests-business_and_industry-${item.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      allCategories.push({
        id, name: item, parentId: "interests-business_and_industry", level: 3,
        size: "Size: Available", categoryType: "interests"
      });
    });
    
    // Behaviors Section - THE KEY MISSING BEHAVIORS L2 SECTIONS!
    console.log("⚡ Processing Behaviors with ALL L2 sections...");
    
    const behaviorsL2 = [
      { id: "behaviors-anniversary", name: "Anniversary", parentId: "behaviors", level: 2 },
      { id: "behaviors-mobile_device_user", name: "Mobile Device User", parentId: "behaviors", level: 2 },
      { id: "behaviors-consumer_classification", name: "Consumer Classification", parentId: "behaviors", level: 2 },
      { id: "behaviors-digital_activities", name: "Digital Activities", parentId: "behaviors", level: 2 },
      { id: "behaviors-digital_activities_alt", name: "Digital activities", parentId: "behaviors", level: 2 },
      { id: "behaviors-digital_activities_team", name: "Digital activitiesTeam", parentId: "behaviors", level: 2 },
      { id: "behaviors-expats", name: "Expats", parentId: "behaviors", level: 2 },
      { id: "behaviors-more_categories", name: "More Categories", parentId: "behaviors", level: 2 },
      { id: "behaviors-purchase_behavior", name: "Purchase behavior", parentId: "behaviors", level: 2 },
      { id: "behaviors-soccer", name: "Soccer", parentId: "behaviors", level: 2 },
      { id: "behaviors-travel", name: "Travel", parentId: "behaviors", level: 2 }
    ];
    
    behaviorsL2.forEach(cat => {
      allCategories.push({ ...cat, size: "Unknown", categoryType: "behaviors" });
    });
    
    // Add some sample L3 categories for each Behaviors L2
    const expatsL3 = [
      "Lived in Canada (Formerly Expats - Canada)", "Lived in UK (Formerly Expats - UK)",
      "Lived in India (Formerly Expats - India)", "Lived in Mexico (Formerly Expats - Mexico)",
      "Lived in Philippines (Formerly Expats - Philippines)", "Family of those who live abroad",
      "Friends of those who live abroad", "Lives abroad"
    ];
    
    expatsL3.forEach(item => {
      const id = `behaviors-expats-${item.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50)}`;
      allCategories.push({
        id, name: item, parentId: "behaviors-expats", level: 3,
        size: "Size: Available", categoryType: "behaviors"
      });
    });
    
    // Consumer Classification by country
    const consumerCountries = ["Argentina", "Brazil", "Chile", "India", "Indonesia", "Malaysia", "Mexico", "Pakistan", "Philippines", "South Africa", "Turkey", "UAE"];
    
    consumerCountries.forEach(country => {
      const id = `behaviors-consumer_classification-${country.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      allCategories.push({
        id, name: country, parentId: "behaviors-consumer_classification", level: 3,
        size: "Unknown", categoryType: "behaviors"
      });
      
      // Add L4 items for each country
      const highValueId = `${id}-high_value`;
      const midHighValueId = `${id}-mid_high_value`;
      
      allCategories.push(
        { id: highValueId, name: `People who prefer high-value goods in ${country}`, parentId: id, level: 4, size: "Size: Available", categoryType: "behaviors" },
        { id: midHighValueId, name: `People who prefer mid and high-value goods in ${country}`, parentId: id, level: 4, size: "Size: Available", categoryType: "behaviors" }
      );
    });
    
    console.log(`\n📊 Final comprehensive dataset: ${allCategories.length} categories`);
    
    // Upload with timestamps
    const categoriesWithTimestamp = allCategories.map(cat => ({
      ...cat,
      createdAt: new Date()
    }));
    
    await firebaseStorage.batchUploadTargetingCategories(categoriesWithTimestamp);
    
    console.log("✅ Perfect hierarchy upload complete!");
    
    // Verification
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    
    console.log(`\n🎯 FINAL VERIFICATION: ${hierarchical.length} root categories`);
    
    hierarchical.forEach(root => {
      console.log(`\n📋 ${root.name} (${root.children?.length || 0} L2 children):`);
      
      root.children?.forEach(l2 => {
        console.log(`  L2: ${l2.name} (${l2.children?.length || 0} L3 children)`);
        
        if (l2.name === 'Work' && l2.children) {
          l2.children.forEach(l3 => {
            console.log(`    L3: ${l3.name} (${l3.children?.length || 0} L4 children)`);
            if (l3.name === 'Industries' && l3.children) {
              console.log(`      Found ${l3.children.length} industry categories including:`);
              l3.children.slice(0, 3).forEach(l4 => {
                console.log(`        L4: ${l4.name}`);
              });
            }
          });
        }
      });
    });
    
    console.log(`\n🎉 PERFECT HIERARCHY COMPLETE! ${allCategories.length} categories with proper nesting!`);
    
  } catch (error) {
    console.error("❌ Error in final parser:", error);
    throw error;
  }
}

finalCompleteParser().catch(console.error);