export type BookingStatus = "reserved" | "collected" | "returned";

export interface Booking {
    id: string;
    userId: string;
    deviceModel: string;
    reservedAt: string;
    dueAt: string;
    status: BookingStatus;
    returnedAt?: string;
}
