export async function makeApiRequest(currencyFrom: string, currencyTo: number) {
  // This hypothetical API returns a JSON such as:
  // {"base":"USD","rates":{"SEK": 0.091}}
  return {
    base: currencyFrom,
    rates: { [currencyTo]: 0.091 },
  };
}

// Function declaration, to pass to the model.
export const getExchangeRateFunctionDeclaration = {
  name: "getExchangeRate",
  parameters: {
    type: "OBJECT",
    description: "Get the exchange rate for currencies between countries",
    properties: {
      currencyFrom: {
        type: "STRING",
        description: "The currency to convert from.",
      },
      currencyTo: {
        type: "STRING",
        description: "The currency to convert to.",
      },
    },
    required: ["currencyTo", "currencyFrom"],
  },
};

export async function myInformation() {
  return {
    name: "karan singh",
    height: "6.1 feet",
    weight: "60 kg",
    address:
      "city paonta sahib, distt. sirmour, state Himachal Pradesh, country india",
  };
}

export const myInformationFD = {
  name: "myInformation",
  parameters: {
    type: "OBJECT",
    description:
      "Get personal information like name, height, weight, location (city, state, country)",
    properties: {},
    required: [],
  },
};
