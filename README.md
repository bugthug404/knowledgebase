
# knowledgebase

## Features

It is basically a RAG App. In this app you can upload your Website & Documents and have conversation.

Checkout this demo:- https://knowledgebase-8u9.pages.dev/chat

## For Developers

**Directories**
`/api` - *Express js app backend to handle documents parsing & website parsing.*
`/ewc` - *Botpress v12 chat embedding example for websites integration. (embedded web chat)*
`/ui` - *Web ui to upload documents & website + Chat*


## Technical process

**Data Preparation**
 1. Extracting text out of documents. Get html of the website > cleaning html document > extracting text > cleaning text.
 2. Embedding text to vectors with Gemini text embedding api.
 3. Storing embedded vectors to Qdrant Vector store.

**Conversation**

 1. Creating a function to get relevant information from vector store. Write function definition of the function & feed to the LLM.
 2. Prompt engineering the LLM to behave in a particular way & handle basic queries like greeting without searching database.
 3. From here LLM will handle the conversation.

**Handling complex queries / Fine tuning**

working on it....
