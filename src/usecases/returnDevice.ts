import { CosmosBookingRepo } from "../adapters/cosmosBookingRepo";
import { InventoryClient } from "../clients/inventoryClient";

export async function returnDevice(bookingId: string) {
    const repo = CosmosBookingRepo.getInstance();
    const inventory = InventoryClient.getInstance();

    console.log("Step 2: returnDevice called. bookingId =", bookingId);

    const booking = await repo.getById(bookingId);
    console.log("Step 2.1: booking found =", booking);

    if (!booking) {
        throw new Error("Booking not found");
    }

    if (booking.status === "returned") {
        throw new Error("Device already returned");
    }

    console.log("Step 3: calling inventory.incrementInventory...");

    await inventory.incrementInventory(booking.deviceModel);

    console.log("Step 3.1: incrementInventory returned OK");

    booking.status = "returned";
    booking.returnedAt = new Date().toISOString();

    const updated = await repo.update(booking);
    console.log("Step 4: repo.update finished =", updated);

    return updated;
}
