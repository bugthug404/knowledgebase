import { ChatAnthropic } from "@langchain/anthropic";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable, RunnableConfig } from "@langchain/core/runnables";
import {
  searchCarRentals,
  bookCarRental,
  updateCarRental,
  cancelCarRental,
} from "./car";
import {
  searchTripRecommendations,
  bookExcursion,
  updateExcursion,
  cancelExcursion,
} from "./excursion";
import {
  fetchUserFlightInformation,
  searchFlights,
  updateTicketToNewFlight,
  cancelTicket,
} from "./flight";
import { searchHotels, bookHotel, updateHotel, cancelHotel } from "./hotel";

class Assistant {
  private runnable: Runnable;

  constructor(runnable: Runnable) {
    this.runnable = runnable;
  }

  async __call__(state: any, config: any): Promise<{ messages: any[] }> {
    while (true) {
      const passengerId = "config.runId('passenger_id', null);";
      state = { ...state, userInfo: passengerId };
      const result = await this.runnable.invoke(state);

      // If the LLM happens to return an empty response, we will re-prompt it
      // for an actual response.
      if (
        !result.toolCalls &&
        (!result.content ||
          (Array.isArray(result.content) && !result.content[0].get("text")))
      ) {
        const messages = [
          ...state.messages,
          ["user", "Respond with a real output."],
        ];
        state = { ...state, messages };
      } else {
        break;
      }
      return { messages: result };
    }
  }
}

// Haiku is faster and cheaper, but less accurate
// const llm = new ChatAnthropic({ model: 'claude-3-haiku-20240307' });
const llm = new ChatAnthropic({
  model: "claude-3-sonnet-20240229",
  temperature: 1,
});

// You could swap LLMs, though you will likely want to update the prompts when
// doing so!
// import { ChatOpenAI } from 'langchain_openai';
// const llm = new ChatOpenAI({ model: 'gpt-4-turbo-preview' });

const primaryAssistantPrompt = ChatPromptTemplate.fromMessages([
  ["ai", "You are a helpful assistant."],
  "message",
  //   {
  //     // role: "system",
  //     inputVariables:
  //      [ "You are a helpful customer support assistant for Swiss Airlines. " +
  //       " Use the provided tools to search for flights, company policies, and other information to assist the user's queries. " +
  //       " When searching, be persistent. Expand your query bounds if the first search returns no results. " +
  //       " If a search comes up empty, expand your search before giving up." +
  //       "\n\nCurrent user:\n\n{user_info}\n" +
  //       "\nCurrent time: {time}."],
  //       promptMessages: [],

  //   },
  //   { role: "placeholder", content: "{messages}" },
]).partial({ time: new Date().toISOString() });

const part1Tools = [
  new TavilySearchResults({ maxResults: 1 }),
  fetchUserFlightInformation,
  searchFlights,
  //   lookupPolicy,
  updateTicketToNewFlight,
  cancelTicket,
  searchCarRentals,
  bookCarRental,
  updateCarRental,
  cancelCarRental,
  searchHotels,
  bookHotel,
  updateHotel,
  cancelHotel,
  searchTripRecommendations,
  bookExcursion,
  updateExcursion,
  cancelExcursion,
];

// const part1AssistantRunnable = primaryAssistantPrompt.bindTools(
//   llm,
//   part1Tools
// );
