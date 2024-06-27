import {
  HarmBlockThreshold,
  HarmCategory,
  SafetySetting,
} from "@google/generative-ai";
import { getEmbeder, getStoreClient } from "./db";

export async function addToSessionMemory(
  keyName: string,
  value: string,
  callback: (query: string, ans: string) => void
) {
  console.log("sessionMemory db -- ", keyName, value);
  if (!keyName || !value) {
    return { error: "Missing parameters" };
  }

  callback(keyName, value);

  return {
    message: "understood",
  };
}

export const addToSessionMemoryFD = {
  name: "addToSessionMemory",
  parameters: {
    type: "OBJECT",
    description: "To remember information for a session.",
    properties: {
      keyName: {
        type: "STRING",
        description: "The information key name.",
      },
      value: {
        type: "STRING",
        description: "The value to be saved.",
      },
    },
    required: ["keyName", "value"],
  },
};

export const allowPersonalInfo: SafetySetting = {
  category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
  threshold: HarmBlockThreshold.BLOCK_NONE,
};

const d = {
  documents: [
    "Skip to content Item added to your cart Check out Continue shopping Collection: Products Filter: Availability 0 selected Reset Availability In stock (20) In stock (20 products) Out of stock (0) Out of stock (0 products) In stock (20) In stock (20 products) Out of stock (0) Out of stock (0 products) Price The highest price is €1. 699,00 Reset € From € To Filter Remove all Sort by: FeaturedBest sellingAlphabetically, A-ZAlphabetically, Z-APrice, low to highPrice, high to lowDate, old to newDate, new to old Sort 20 products Filter and sort Filter Filter and sort Filter 20 products Availability Availability In stock (20) In stock (20 products) Out of stock (0) Out of stock (0 products) Clear Apply Apply Price Price The highest price is €1. 699,00 € From € To Clear Apply Apply Sort by: FeaturedBest sellingAlphabetically, A-ZAlphabetically, Z-APrice, low to highPrice, high to lowDate, old to newDate, new to old Remove all Apply Apply Remove all 20 products 3 Months of VIP Support 3 Months of",
    "Skip to content Item added to your cart Check out Continue shopping Collection: Products Filter: Availability 0 selected Reset Availability In stock (20) In stock (20 products) Out of stock (0) Out of stock (0 products) In stock (20) In stock (20 products) Out of stock (0) Out of stock (0 products) Price The highest price is €1. 699,00 Reset € From € To Filter Remove all Sort by: FeaturedBest sellingAlphabetically, A-ZAlphabetically, Z-APrice, low to highPrice, high to lowDate, old to newDate, new to old Sort 20 products Filter and sort Filter Filter and sort Filter 20 products Availability Availability In stock (20) In stock (20 products) Out of stock (0) Out of stock (0 products) Clear Apply Apply Price Price The highest price is €1. 699,00 € From € To Clear Apply Apply Sort by: FeaturedBest sellingAlphabetically, A-ZAlphabetically, Z-APrice, low to highPrice, high to lowDate, old to newDate, new to old Remove all Apply Apply Remove all 20 products 3 Months of VIP Support 3 Months of",
    "sellingAlphabetically, A-ZAlphabetically, Z-APrice, low to highPrice, high to lowDate, old to newDate, new to old Remove all Apply Apply Remove all 20 products 3 Months of VIP Support 3 Months of VIP Support No reviews Regular price €180,00 EUR Regular price Sale price €180,00 EUR Unit price / per Dummy Elite Settings Dummy Elite Settings No reviews Regular price From €50,00 EUR Regular price Sale price From €50,00 EUR Unit price / per Dummy Email Addon Dummy Email Addon No reviews Regular price €1,00 EUR Regular price Sale price €1,00 EUR Unit price / per Dummy Forex Trends Dummy Forex Trends No reviews Regular price From €1,00 EUR Regular price Sale price From €1,00 EUR Unit price / per Dummy SMS Addon Dummy SMS Addon No reviews Regular price €1,00 EUR Regular price Sale price €1,00 EUR Unit price / per Dummy V2 Personal - Single Payment Dummy V2 Personal - Single Payment No reviews Regular price €220,00 EUR Regular price Sale price €220,00 EUR Unit price / per Dummy V2 Plus -",
    "sellingAlphabetically, A-ZAlphabetically, Z-APrice, low to highPrice, high to lowDate, old to newDate, new to old Remove all Apply Apply Remove all 20 products 3 Months of VIP Support 3 Months of VIP Support No reviews Regular price €180,00 EUR Regular price Sale price €180,00 EUR Unit price / per Dummy Elite Settings Dummy Elite Settings No reviews Regular price From €50,00 EUR Regular price Sale price From €50,00 EUR Unit price / per Dummy Email Addon Dummy Email Addon No reviews Regular price €1,00 EUR Regular price Sale price €1,00 EUR Unit price / per Dummy Forex Trends Dummy Forex Trends No reviews Regular price From €1,00 EUR Regular price Sale price From €1,00 EUR Unit price / per Dummy SMS Addon Dummy SMS Addon No reviews Regular price €1,00 EUR Regular price Sale price €1,00 EUR Unit price / per Dummy V2 Personal - Single Payment Dummy V2 Personal - Single Payment No reviews Regular price €220,00 EUR Regular price Sale price €220,00 EUR Unit price / per Dummy V2 Plus -",
    "Skip to content Item added to your cart Check out Continue shopping Skip to product information Open media 1 in modal 1 / of 1 Dummy Elite Settings Dummy Elite Settings Regular price €50,00 EUR Regular price Sale price €50,00 EUR Unit price / per Sale Sold out No reviews Variant Dummy Elite Settings Basic 1 Month Dummy Elite Settings Basic 3 Month Dummy Elite Settings Basic 12 Month Dummy Elite Settings Mid 1 Month Dummy Elite Settings Mid 3 Month Dummy Elite Settings Mid 12 Month Dummy Elite Settings Top 1 Month Dummy Elite Settings Top 3 Month Dummy Elite Settings Top 12 Month Product variants Dummy Elite Settings Basic 1 Month - €50,00 Dummy Elite Settings Basic 3 Month - €140,00 Dummy Elite Settings Basic 12 Month - €500,00 Dummy Elite Settings Mid 1 Month - €80,00 Dummy Elite Settings Mid 3 Month - €220,00 Dummy Elite Settings Mid 12 Month - €800,00 Dummy Elite Settings Top 1 Month - €100,00 Dummy Elite Settings Top 3 Month - €270,00 Dummy Elite Settings Top 12 Month - €1. 000,00",
    "Skip to content Item added to your cart Check out Continue shopping Skip to product information Open media 1 in modal 1 / of 1 Dummy Elite Settings Dummy Elite Settings Regular price €50,00 EUR Regular price Sale price €50,00 EUR Unit price / per Sale Sold out No reviews Variant Dummy Elite Settings Basic 1 Month Dummy Elite Settings Basic 3 Month Dummy Elite Settings Basic 12 Month Dummy Elite Settings Mid 1 Month Dummy Elite Settings Mid 3 Month Dummy Elite Settings Mid 12 Month Dummy Elite Settings Top 1 Month Dummy Elite Settings Top 3 Month Dummy Elite Settings Top 12 Month Product variants Dummy Elite Settings Basic 1 Month - €50,00 Dummy Elite Settings Basic 3 Month - €140,00 Dummy Elite Settings Basic 12 Month - €500,00 Dummy Elite Settings Mid 1 Month - €80,00 Dummy Elite Settings Mid 3 Month - €220,00 Dummy Elite Settings Mid 12 Month - €800,00 Dummy Elite Settings Top 1 Month - €100,00 Dummy Elite Settings Top 3 Month - €270,00 Dummy Elite Settings Top 12 Month - €1. 000,00",
    "Skip to content Item added to your cart Check out Continue shopping Skip to product information Open media 1 in modal 1 / of 1 Dummy Elite Settings Dummy Elite Settings Regular price €50,00 EUR Regular price Sale price €50,00 EUR Unit price / per Sale Sold out No reviews Variant Dummy Elite Settings Basic 1 Month Dummy Elite Settings Basic 3 Month Dummy Elite Settings Basic 12 Month Dummy Elite Settings Mid 1 Month Dummy Elite Settings Mid 3 Month Dummy Elite Settings Mid 12 Month Dummy Elite Settings Top 1 Month Dummy Elite Settings Top 3 Month Dummy Elite Settings Top 12 Month Product variants Dummy Elite Settings Basic 1 Month - €50,00 Dummy Elite Settings Basic 3 Month - €140,00 Dummy Elite Settings Basic 12 Month - €500,00 Dummy Elite Settings Mid 1 Month - €80,00 Dummy Elite Settings Mid 3 Month - €220,00 Dummy Elite Settings Mid 12 Month - €800,00 Dummy Elite Settings Top 1 Month - €100,00 Dummy Elite Settings Top 3 Month - €270,00 Dummy Elite Settings Top 12 Month - €1. 000,00",
    "Skip to content Item added to your cart Check out Continue shopping Skip to product information Open media 1 in modal 1 / of 1 Dummy Elite Settings Dummy Elite Settings Regular price €50,00 EUR Regular price Sale price €50,00 EUR Unit price / per Sale Sold out No reviews Variant Dummy Elite Settings Basic 1 Month Dummy Elite Settings Basic 3 Month Dummy Elite Settings Basic 12 Month Dummy Elite Settings Mid 1 Month Dummy Elite Settings Mid 3 Month Dummy Elite Settings Mid 12 Month Dummy Elite Settings Top 1 Month Dummy Elite Settings Top 3 Month Dummy Elite Settings Top 12 Month Product variants Dummy Elite Settings Basic 1 Month - €50,00 Dummy Elite Settings Basic 3 Month - €140,00 Dummy Elite Settings Basic 12 Month - €500,00 Dummy Elite Settings Mid 1 Month - €80,00 Dummy Elite Settings Mid 3 Month - €220,00 Dummy Elite Settings Mid 12 Month - €800,00 Dummy Elite Settings Top 1 Month - €100,00 Dummy Elite Settings Top 3 Month - €270,00 Dummy Elite Settings Top 12 Month - €1. 000,00",
    "Skip to content Item added to your cart Check out Continue shopping Skip to product information Open media 1 in modal 1 / of 1 Dummy Elite Settings Dummy Elite Settings Regular price €50,00 EUR Regular price Sale price €50,00 EUR Unit price / per Sale Sold out No reviews Variant Dummy Elite Settings Basic 1 Month Dummy Elite Settings Basic 3 Month Dummy Elite Settings Basic 12 Month Dummy Elite Settings Mid 1 Month Dummy Elite Settings Mid 3 Month Dummy Elite Settings Mid 12 Month Dummy Elite Settings Top 1 Month Dummy Elite Settings Top 3 Month Dummy Elite Settings Top 12 Month Product variants Dummy Elite Settings Basic 1 Month - €50,00 Dummy Elite Settings Basic 3 Month - €140,00 Dummy Elite Settings Basic 12 Month - €500,00 Dummy Elite Settings Mid 1 Month - €80,00 Dummy Elite Settings Mid 3 Month - €220,00 Dummy Elite Settings Mid 12 Month - €800,00 Dummy Elite Settings Top 1 Month - €100,00 Dummy Elite Settings Top 3 Month - €270,00 Dummy Elite Settings Top 12 Month - €1. 000,00",
    "EUR Unit price / per Dummy V2 Personal - Single Payment Dummy V2 Personal - Single Payment No reviews Regular price €220,00 EUR Regular price Sale price €220,00 EUR Unit price / per Dummy V2 Plus - Single Payment Dummy V2 Plus - Single Payment No reviews Regular price €400,00 EUR Regular price Sale price €400,00 EUR Unit price / per Dummy V2 Pro - Single Payment Dummy V2 Pro - Single Payment No reviews Regular price €900,00 EUR Regular price Sale price €900,00 EUR Unit price / per EUR/USD: Premium Settings EUR/USD: Premium Settings 2 reviews Regular price From €199,00 EUR Regular price Sale price From €199,00 EUR Unit price / per Galileo FX Trading Robot Galileo FX Trading Robot 101 reviews Regular price From €352,00 EUR Regular price Sale price From €352,00 EUR Unit price / per GBP/USD: Premium Settings GBP/USD: Premium Settings 1 review Regular price From €199,00 EUR Regular price Sale price From €199,00 EUR Unit price / per Gold and Silver: Premium Settings Gold and Silver: Premium",
  ],
};
