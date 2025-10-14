import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vqxydudmllhvjdvtsxla.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeHlkdWRtbGxodmpkdnRzeGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDM2MzYsImV4cCI6MjA2NDMxOTYzNn0.NGODcFGkK3fHoZIsR2ZzzZGPNr24OiUhs9FUVTnfiGo";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const countries = ['Australia', 'USA', 'UK', 'Canada', 'New Zealand', 'Hong Kong', 'Brazil', 'Argentina', 'Germany', 'France'];
const types = ['Financial', 'Healthcare', 'Government', 'Corporate', 'Education', 'Retail', 'Technology', 'Media', 'Transportation', 'Energy'];

function generateRandomDomain() {
  const prefixes = ['data', 'info', 'db', 'records', 'archive', 'vault', 'store', 'hub', 'center', 'network'];
  const suffixes = ['.com', '.org', '.net', '.gov', '.edu', '.co.uk', '.au', '.ca', '.nz', '.hk', '.br', '.ar', '.de', '.fr'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const number = Math.floor(Math.random() * 10000);
  return `${prefix}${number}${suffix}`;
}

function generateRandomDescription(type, country) {
  const descriptions = [
    `Comprehensive ${type} database from ${country}`,
    `${country} ${type} records and information`,
    `Full access to ${type} data in ${country}`,
    `${type} database leak from ${country}`,
    `Premium ${country} ${type} information`,
    `${type} profiles and documents from ${country}`,
    `${country} ${type} data collection`,
    `Extensive ${type} database - ${country}`,
    `${type} records database (${country})`,
    `${country} ${type} information archive`
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateRandomPrice() {
  return Math.floor(Math.random() * 4500) + 500; // 500 to 5000
}

async function addProducts() {
  const products = [];

  // Add specific products
  products.push({
    Domain: "ableaustralia.org.au",
    Description: "Over 2000 Full information and documents on NDIS people and their families aswell as the organizations they belong too",
    country: "Australia",
    Type: "Healthcare",
    price: 800
  });

  products.push({
    Domain: "nationaldisabilityinstitute.org",
    Description: "5500 NDIS Patients Information and documents of nationaldisabilityinstitute.org/",
    country: "Australia", // Assuming Australia since NDIS is Australian
    Type: "Healthcare",
    price: generateRandomPrice()
  });

  // Generate 148 more random products (150 total - 2 specific)
  for (let i = 0; i < 148; i++) {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const domain = generateRandomDomain();
    const description = generateRandomDescription(type, country);
    const price = generateRandomPrice();

    products.push({
      Domain: domain,
      Description: description,
      country: country,
      Type: type,
      price: price
    });
  }

  console.log(`Inserting ${products.length} products...`);

  const { data, error } = await supabase
    .from('products')
    .insert(products);

  if (error) {
    console.error('Error inserting products:', error);
  } else {
    console.log('Successfully inserted products:', data);
  }
}

addProducts();