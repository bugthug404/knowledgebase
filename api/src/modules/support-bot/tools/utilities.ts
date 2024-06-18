import { ToolMessage } from "@langchain/core/messages";
import { END, MessageGraph } from "@langchain/langgraph";
import { RunnableLambda } from "@langchain/core/runnables";
import ToolNode from "@langchain/langgraph";

// Custom implementation of ToolNode
class CustomToolNode {
  tools: any[];

  constructor(tools: any[]) {
    this.tools = tools;
  }

  withFallbacks(fallbacks: any[], fallbackType: string) {
    // Implement the fallback logic
    return {
      tools: this.tools,
      fallbacks: fallbacks,
      fallbackType: fallbackType,
    };
  }
}

export function handleToolError(state: any): { messages: any[] } {
  const error = state.get("error");
  const toolCalls = state["messages"][state["messages"].length - 1].toolCalls;

  return {
    messages: toolCalls.map((tc: any) => {
      return new ToolMessage({
        content: `Error: ${error.toString()}\n please fix your mistakes.`,
        tool_call_id: tc.id,
      });
    }),
  };
}

export function createToolNodeWithFallback(tools: any[]): any {
  const graph = new MessageGraph();

  return new CustomToolNode(tools).withFallbacks(
    [new RunnableLambda(handleToolError as any)],
    "error"
  );
}

export function _printEvent(
  event: any,
  _printed: Set<any>,
  maxLength = 1500
): void {
  const currentState = event.get("dialogState");
  if (currentState) {
    console.log("Currently in: ", currentState[currentState.length - 1]);
  }

  const message = event.get("messages");
  if (message) {
    const messageInstance = Array.isArray(message)
      ? message[message.length - 1]
      : message;
    if (!_printed.has(messageInstance.id)) {
      let msgRepr = messageInstance.prettyRepr(true);
      if (msgRepr.length > maxLength) {
        msgRepr = msgRepr.slice(0, maxLength) + " ... (truncated)";
      }
      console.log(msgRepr);
      _printed.add(messageInstance.id);
    }
  }
}
