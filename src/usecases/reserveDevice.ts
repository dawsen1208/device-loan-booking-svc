import { Booking } from "../domain/booking";
import { CosmosBookingRepo } from "../adapters/cosmosBookingRepo";
import { InventoryClient } from "../clients/inventoryClient";
import { v4 as uuidv4 } from "uuid";

export async function reserveDevice(input: {
    userId: string;
    deviceModel: string;
}) {
    // 懒加载单例
    const repo = CosmosBookingRepo.getInstance();
    const inventoryClient = InventoryClient.getInstance();

    const { userId, deviceModel } = input;

    // 1) 查询 Inventory Service 了解库存
    const inventory = await inventoryClient.getInventory(deviceModel);

    if (!inventory) {
        throw new Error("Device model not found in inventory.");
    }

    if (inventory.availableCount <= 0) {
        throw new Error("Out of stock.");
    }

    // 2) 调用 Inventory Service 扣减库存
    await inventoryClient.decrementInventory(deviceModel);

    // 3) 在 Booking Service 中写入 booking
    const booking: Booking = {
        id: uuidv4(),
        userId,
        deviceModel,
        reservedAt: new Date().toISOString(),
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "reserved"
    };

    return await repo.create(booking);
}
