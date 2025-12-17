import { CosmosClient } from "@azure/cosmos";
import { Booking } from "../domain/booking";

export class CosmosBookingRepo {
    private container;
    private static instance: CosmosBookingRepo;

    constructor() {
        const connection = process.env.CosmosDBConnection;
        if (!connection) throw new Error("CosmosDBConnection is missing");
        
        const dbName = process.env.CosmosDatabase || "cdls";
        const containerName = process.env.CosmosContainer || "bookings";

        const client = new CosmosClient(connection);
        this.container = client.database(dbName).container(containerName);
    }

    public static getInstance(): CosmosBookingRepo {
        if (!CosmosBookingRepo.instance) {
            CosmosBookingRepo.instance = new CosmosBookingRepo();
        }
        return CosmosBookingRepo.instance;
    }

    // ✔ 创建 booking（你原来的代码）
    async create(booking: Booking) {
        const { resource } = await this.container.items.create(booking);
        return resource;
    }

    // ✔ 根据 ID 查询 booking（用于 returnDevice 流程）
    async getById(id: string): Promise<Booking | null> {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.id = @id",
            parameters: [{ name: "@id", value: id }]
        };

        const { resources } = await this.container.items.query(querySpec).fetchAll();
        return resources[0] || null;
    }

    // ✔ 更新 booking（用于修改 status → returned）
    async update(booking: Booking) {
        const { resource } = await this.container
            .item(booking.id, booking.id)   // partition key = id（与你之前 create 的结构一致）
            .replace(booking);

        return resource;
    }

    async getByUserId(userId: string): Promise<Booking[]> {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.userId = @userId",
            parameters: [{ name: "@userId", value: userId }]
        };

        const { resources } = await this.container.items.query(querySpec).fetchAll();
        return resources as Booking[];
    }

    async listAll(): Promise<Booking[]> {
        const querySpec = { query: "SELECT * FROM c" };
        const { resources } = await this.container.items.query(querySpec).fetchAll();
        return resources as Booking[];
    }
}
