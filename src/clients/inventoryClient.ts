import axios from "axios";

export class InventoryClient {
    private baseUrl: string;
    private apiKey: string;
    private static instance: InventoryClient;

    constructor() {
        this.baseUrl = process.env.INVENTORY_SERVICE_URL || "http://localhost:7072/api";
        this.apiKey = process.env.INVENTORY_SERVICE_KEY || "";
    }

    public static getInstance(): InventoryClient {
        if (!InventoryClient.instance) {
            InventoryClient.instance = new InventoryClient();
        }
        return InventoryClient.instance;
    }

    private getHeaders() {
        return this.apiKey ? { "x-functions-key": this.apiKey } : {};
    }

    async getInventory(model: string): Promise<any> {
        const url = `${this.baseUrl}/inventory/${model}`;
        const response = await axios.get(url, { headers: this.getHeaders() });
        return response.data;
    }

    async decrementInventory(model: string): Promise<any> {
        const url = `${this.baseUrl}/inventory/${model}/decrement`;
        const response = await axios.post(url, {}, { headers: this.getHeaders() });
        return response.data;
    }

    async incrementInventory(model: string): Promise<any> {
        const url = `${this.baseUrl}/inventory/${model}/increment`;
        const response = await axios.post(url, {}, { headers: this.getHeaders() });
        return response.data;
    }
}
