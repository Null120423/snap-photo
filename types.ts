
export interface User {
  id: string;
  createdAt: number;
  downloadedPhotoIds: string[];
}

export interface Room {
  id: string; // Mã phòng 6 chữ số
  ownerId: string;
  ownerEmail: string;
  name: string;
  isActive: boolean;
  createdAt: number;
  expiresAt: number;
}

export interface Photo {
  id: string;
  roomId: string;
  userId: string;
  url: string; 
  size: number;
  timestamp: number;
}

export type ViewState = 'home' | 'create' | 'room' | 'detail' | 'profile' | 'my-rooms';
