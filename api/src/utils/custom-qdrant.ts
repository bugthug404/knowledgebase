import axios, { AxiosInstance } from "axios";
import { appConfig } from "../app-config";

export class CustomQdrantClient {
  private axiosInstance: AxiosInstance;

  constructor(config: { url: string; apiKey?: string }) {
    this.axiosInstance = axios.create({
      baseURL: config.url,
      headers: config.apiKey ? {
        "api-key": config.apiKey,
        "Content-Type": "application/json",
      } : {
        "Content-Type": "application/json",
      },
    });
  }

  async createCollection(name: string, params: any): Promise<void> {
    await this.axiosInstance.put(`/collections/${name}`, params);
  }

  async recreateCollection(name: string, params: any): Promise<void> {
    await this.axiosInstance.put(`/collections/${name}/recreate`, params);
  }

  async getCollection(name: string): Promise<any> {
    const response = await this.axiosInstance.get(`/collections/${name}`);
    return response.data;
  }

  async getCollections(): Promise<{ collections: any[] }> {
    const response = await this.axiosInstance.get("/collections");

    console.log("response --- ", response.data.result.collections);
    const list =
      response.data ?? response.data.result ?? response.data.result.collections;
    return list;
  }

  async search(collectionName: string, params: any): Promise<any> {
    const response = await this.axiosInstance.post(`/collections/${collectionName}/points/search`, params);
    return response.data;
  }

  async upsert(collectionName: string, params: any): Promise<any> {
    const response = await this.axiosInstance.put(`/collections/${collectionName}/points?wait=true`, params);
    return response.data;
  }

  async retrieve(collectionName: string, params: { ids: string[] }): Promise<any> {
    const response = await this.axiosInstance.post(
      `/collections/${collectionName}/points?wait=true`,
      { ids: params.ids, with_payload: true }
    );
    return response.data;
  }

  async scroll(collectionName: string, params: {
    limit?: number;
    offset?: number;
    with_payload?: boolean;
    with_vector?: boolean;
  }): Promise<any> {
    const response = await this.axiosInstance.post(
      `/collections/${collectionName}/points/scroll`,
      params
    );
    return response.data;
  }

  async delete(collectionName: string, params: {
    points: string[];
    wait?: boolean;
  }): Promise<any> {
    const response = await this.axiosInstance.post(
      `/collections/${collectionName}/points/delete`,
      params
    );
    return response.data;
  }

  async deleteCollection(collectionName: string): Promise<void> {
    await this.axiosInstance.delete(`/collections/${collectionName}`);
  }

  async update(collectionName: string, id: string, point: any, options?: {
    wait?: boolean;
    partial?: boolean;
  }): Promise<any> {
    const response = await this.axiosInstance.post(
      `/collections/${collectionName}/points/update`,
      {
        points: [{
          id,
          ...point
        }],
        wait: options?.wait ?? true,
        partial: options?.partial ?? false
      }
    );
    return response.data;
  }

  async countPoints(collectionName: string): Promise<number> {
    const response = await this.axiosInstance.get(
      `/collections/${collectionName}/points/count`
    );
    return response.data.result.count;
  }

  async recommend(collectionName: string, params: {
    positive: string[];
    negative?: string[];
    limit?: number;
    with_payload?: boolean;
  }): Promise<any> {
    const response = await this.axiosInstance.post(
      `/collections/${collectionName}/points/recommend`,
      params
    );
    return response.data;
  }
}

export const getCustomStoreClient = () => {
  const { qdrantApiKey, qdrantUrl } = appConfig;
  return new CustomQdrantClient({
    url: qdrantUrl,
    apiKey: qdrantApiKey,
  });
};