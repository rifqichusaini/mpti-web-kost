// types/room.ts
export interface Room {
  id?: string;
  kost_id: string;
  room_number: string;
  facilities: string;
  is_available: boolean;
  price: number;
}
