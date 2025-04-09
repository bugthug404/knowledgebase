import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getEmbeder } from "../../utils/db";
import { generateUUID } from "../cv-ranking/utils";
import weaviate from 'weaviate-ts-client';

const client = weaviate.client({
    scheme: 'http',
    host: 'http://localhost:8080',
});

export const addTextToWVStore = async (
    collection: string,
    fullText: string
) => {
    try {
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
        });

        const texts = await textSplitter.splitText(fullText);
        const embedder = getEmbeder();
        const docEmbeddings = await embedder.embedDocuments(texts);

        if (texts.length !== docEmbeddings.length) {
            throw new Error("docs length is not equal to documents length");
        }

        // Create schema if it doesn't exist
        await client.schema
            .classCreator()
            .withClass({
                class: collection,
                vectorizer: 'none', // Since we're providing our own vectors
                vectorIndexConfig: {
                    distance: 'cosine'
                }
            })
            .do();

        // Batch import the documents
        const batchImport = texts.map((text, index) => ({
            class: collection,
            id: generateUUID(),
            vector: docEmbeddings[index],
            properties: {
                content: text
            }
        }));

        await client.batch.objectsBatcher()
            .withObjects(...batchImport)
            .do();

        console.log("Successfully imported documents to Weaviate");
    } catch (error) {
        console.log("error.message - ", error.message);
        throw new Error(error);
    }
};
