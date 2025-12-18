import { reserveDevice } from "./reserveDevice";
import { CosmosBookingRepo } from "../adapters/cosmosBookingRepo";
import { InventoryClient } from "../clients/inventoryClient";
import { v4 as uuidv4 } from "uuid";

// Mock the dependencies
jest.mock("../adapters/cosmosBookingRepo");
jest.mock("../clients/inventoryClient");
jest.mock("uuid");

describe("reserveDevice", () => {
  let mockRepo: any;
  let mockInventoryClient: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup Mock Repo
    mockRepo = {
      create: jest.fn().mockResolvedValue({ id: "booking-123" }),
    };
    (CosmosBookingRepo.getInstance as jest.Mock).mockReturnValue(mockRepo);

    // Setup Mock Inventory Client
    mockInventoryClient = {
      getInventory: jest.fn(),
      decrementInventory: jest.fn(),
    };
    (InventoryClient.getInstance as jest.Mock).mockReturnValue(mockInventoryClient);

    // Setup UUID mock
    (uuidv4 as jest.Mock).mockReturnValue("new-booking-uuid");
  });

  it("should successfully reserve a device when available", async () => {
    // Arrange
    const input = { userId: "user-1", deviceModel: "iPhone 13" };
    mockInventoryClient.getInventory.mockResolvedValue({
      model: "iPhone 13",
      availableCount: 5,
    });
    mockInventoryClient.decrementInventory.mockResolvedValue(undefined);

    // Act
    const result = await reserveDevice(input);

    // Assert
    expect(mockInventoryClient.getInventory).toHaveBeenCalledWith("iPhone 13");
    expect(mockInventoryClient.decrementInventory).toHaveBeenCalledWith("iPhone 13");
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      id: "new-booking-uuid",
      userId: "user-1",
      deviceModel: "iPhone 13",
      status: "reserved",
    }));
    expect(result).toEqual({ id: "booking-123" });
  });

  it("should throw error if device not found", async () => {
    // Arrange
    const input = { userId: "user-1", deviceModel: "Unknown" };
    mockInventoryClient.getInventory.mockResolvedValue(null);

    // Act & Assert
    await expect(reserveDevice(input)).rejects.toThrow("Device model not found in inventory.");
    expect(mockInventoryClient.decrementInventory).not.toHaveBeenCalled();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it("should throw error if device is out of stock", async () => {
    // Arrange
    const input = { userId: "user-1", deviceModel: "iPhone 13" };
    mockInventoryClient.getInventory.mockResolvedValue({
      model: "iPhone 13",
      availableCount: 0,
    });

    // Act & Assert
    await expect(reserveDevice(input)).rejects.toThrow("Out of stock.");
    expect(mockInventoryClient.decrementInventory).not.toHaveBeenCalled();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
