export async function makeApiRequest(currencyFrom: string, currencyTo: number) {
  // This hypothetical API returns a JSON such as:
  // {"base":"USD","rates":{"SEK": 0.091}}

  if (!currencyFrom || !currencyTo) {
    return "Missing parameters";
  }

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

export async function myInformation(userToken: string) {
  if (!userToken)
    return {
      error: "Your are not authrized to access this information",
      solution: "Login to your account",
    };

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
    properties: {
      userToken: {
        type: "STRING",
        description: "Authorization token to verify user.",
      },
    },
    required: [],
  },
};

export async function checkAvailableFlights(
  flightFrom: string,
  flightTo: string
) {
  if (!flightFrom || !flightTo)
    return {
      error: "Missing information",
      solution:
        "Please provide source & destination to check available flight details",
    };

  return {
    availableFlights: [
      {
        airline: "Air Canada",
        flightNumber: "AC123",
        origin: {
          airportCode: "YYZ",
          airportName: "Toronto Pearson International Airport",
          city: "Toronto",
        },
        destination: {
          airportCode: "LAX",
          airportName: "Los Angeles International Airport",
          city: "Los Angeles",
        },
        departureDateTime: "2024-06-20T10:00:00",
        arrivalDateTime: "2024-06-20T14:00:00",
        duration: "4h",
        price: {
          currency: "CAD",
          amount: 599.99,
        },
        aircraft: "Boeing 787 Dreamliner",
        travelClass: "Economy",
        layovers: 0,
      },
      {
        airline: "United Airlines",
        flightNumber: "UA789",
        origin: {
          airportCode: "YYZ",
          airportName: "Toronto Pearson International Airport",
          city: "Toronto",
        },
        destination: {
          airportCode: "LAX",
          airportName: "Los Angeles International Airport",
          city: "Los Angeles",
        },
        departureDateTime: "2024-06-21T15:00:00",
        arrivalDateTime: "2024-06-21T20:00:00",
        duration: "5h",
        price: {
          currency: "USD",
          amount: 649.0,
        },
        travelClass: "Economy",
        layovers: 0,
      },
    ],
  };
}

export const checkAvailableFlightFD = {
  name: "checkAvailableFlights",
  parameters: {
    type: "OBJECT",
    description: "Get avaialble flight details",
    properties: {
      flightFrom: {
        type: "STRING",
        description: "Location name of flight origin.",
      },
      flightTo: {
        type: "STRING",
        description: "Location name of flight destination.",
      },
    },
    required: ["flightFrom", "flightTo"],
  },
};

export function bookFlight(flightNo: string) {
  if (!flightNo) {
    return { error: "flightNo is required for booking." };
  }

  return {
    flightNo,
    message: "Congratutions. your flight is booked",
  };
}

export const bookFlightFD = {
  name: "bookFlight",
  parameters: {
    type: "OBJECT",
    description: "Confirm flight booking.",
    properties: {
      flightNo: {
        type: "STRING",
        description: "To choose flight for booking.",
      },
    },
    required: ["flightNo"],
  },
};
