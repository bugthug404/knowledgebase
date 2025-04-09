import axios, { AxiosInstance } from "axios";
import { appConfig } from "../../app-config";

export class CustomWeaviateClient {
  private axiosInstance: AxiosInstance;

  constructor(config: { url: string; apiKey?: string }) {
    this.axiosInstance = axios.create({
      baseURL: config.url,
      headers: config.apiKey ? {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      } : {
        "Content-Type": "application/json",
      },
    });
  }

  async createCollection(className: string, params: any): Promise<void> {
    await this.axiosInstance.post(`/v1/schema`, {
      class: className,
      ...params
    });
  }

  async getCollection(className: string): Promise<any> {
    const response = await this.axiosInstance.get(`/v1/schema/${className}`);
    return response.data;
  }

  async getCollections(): Promise<{ collections: any[] }> {
    const response = await this.axiosInstance.get("/v1/schema");
    return response.data;
  }

  async search(className: string, params: { vector: number[], limit?: number }): Promise<any> {
    const response = await this.axiosInstance.get(`/v1/objects`, {
      params: {
        class: className,
        nearVector: JSON.stringify({ vector: params.vector }),
        limit: params.limit || 10
      }
    });
    return response.data;
  }

  async upsert(className: string, params: { properties: any, vector: number[] }): Promise<any> {
    const response = await this.axiosInstance.post(`/v1/objects`, {
      class: className,
      properties: params.properties,
      vector: params.vector
    });
    return response.data;
  }

  async retrieve(className: string, id: string): Promise<any> {
    const response = await this.axiosInstance.get(`/v1/objects/${id}`);
    return response.data;
  }

  async delete(className: string, id: string): Promise<any> {
    const response = await this.axiosInstance.delete(`/v1/objects/${id}`);
    return response.data;
  }

  async deleteCollection(className: string): Promise<void> {
    await this.axiosInstance.delete(`/v1/schema/${className}`);
  }

  async update(className: string, id: string, properties: any): Promise<any> {
    const response = await this.axiosInstance.patch(`/v1/objects/${id}`, {
      class: className,
      properties: properties
    });
    return response.data;
  }

  async countObjects(className: string): Promise<number> {
    const response = await this.axiosInstance.get(`/v1/objects/aggregate`, {
      params: {
        class: className
      }
    });
    return response.data.objects;
  }
}

export const getCustomStoreClient = () => {
  const { weaviateApiKey, weaviateUrl } = appConfig;
  return new CustomWeaviateClient({
    url: weaviateUrl,
    apiKey: weaviateApiKey,
  });
};
