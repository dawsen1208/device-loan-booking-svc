import axios from "axios";

export class InventoryClient {
    private baseUrl: string;
    private static instance: InventoryClient;

    constructor() {
        this.baseUrl = process.env.INVENTORY_SERVICE_URL || "http://localhost:7072/api";
    }

    public static getInstance(): InventoryClient {
        if (!InventoryClient.instance) {
            InventoryClient.instance = new InventoryClient();
        }
        return InventoryClient.instance;
    }

    async getInventory(model: string): Promise<any> {
        const url = `${this.baseUrl}/inventory/${model}`;
        const response = await axios.get(url);
        return response.data;
    }

    async decrementInventory(model: string): Promise<any> {
        const url = `${this.baseUrl}/inventory/${model}/decrement`;
        const response = await axios.post(url);
        return response.data;
    }

    async incrementInventory(model: string): Promise<any> {
        const url = `${this.baseUrl}/inventory/${model}/increment`;
        const response = await axios.post(url);
        return response.data;
    }
}
