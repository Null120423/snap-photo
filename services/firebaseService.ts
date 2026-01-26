/** @format */

import {
  addDoc,
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../config/firebase";
import { Photo, Room } from "../types";
import { generateId } from "../utils/storage";

export const firebaseService = {
  // 6-digit room code generation
  generateRoomCode: (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  createRoom: async (
    ownerId: string,
    email: string,
    name: string,
  ): Promise<Room> => {
    try {
      const roomCode = firebaseService.generateRoomCode();

      // Check if room with same ID already exists
      const q = query(collection(db, "rooms"), where("id", "==", roomCode));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error("Room ID already exists. Please try again.");
      }

      // Check if room with same name already exists
      const nameQuery = query(
        collection(db, "rooms"),
        where("name", "==", name),
      );
      const nameSnapshot = await getDocs(nameQuery);
      if (!nameSnapshot.empty) {
        throw new Error(
          "Room name already exists. Please choose another name.",
        );
      }

      const now = Date.now();
      const expiresAt = now + 15 * 24 * 60 * 60 * 1000; // 15 Days

      const roomData = {
        id: roomCode,
        ownerId,
        ownerEmail: email,
        name: name || `Room ${roomCode}`,
        isActive: true,
        createdAt: Timestamp.fromDate(new Date(now)),
        expiresAt: Timestamp.fromDate(new Date(expiresAt)),
      };

      // Add room to Firestore
      await addDoc(collection(db, "rooms"), roomData);

      return {
        ...roomData,
        createdAt: now,
        expiresAt: expiresAt,
      };
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Please try again.");
      throw error;
    }
  },

  getRoom: async (code: string): Promise<Room | null> => {
    try {
      // Query rooms by ID
      const q = query(collection(db, "rooms"), where("id", "==", code));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return null;

      const roomDoc = querySnapshot.docs[0];
      const data = roomDoc.data();

      // Check expiration
      const expiresAt =
        data.expiresAt instanceof Timestamp ?
          data.expiresAt.toDate().getTime()
        : data.expiresAt;
      const createdAt =
        data.createdAt instanceof Timestamp ?
          data.createdAt.toDate().getTime()
        : data.createdAt;

      if (Date.now() > expiresAt) {
        return {
          ...data,
          isActive: false,
          createdAt,
          expiresAt,
        } as Room;
      }

      return {
        ...data,
        createdAt,
        expiresAt,
      } as Room;
    } catch (error) {
      console.error("Error getting room:", error);
      return null;
    }
  },

  uploadPhoto: async (
    roomId: string,
    userId: string,
    file: File,
    base64: string,
  ): Promise<Photo> => {
    try {
      const photoId = generateId();
      const timestamp = Date.now();

      const storageRef = ref(
        storage,
        `rooms/${roomId}/photos/${photoId}-${file.name}`,
      );

      const blob = await (await fetch(base64)).blob();
      await uploadBytes(storageRef, blob);

      const url = await getDownloadURL(storageRef);

      const photoData = {
        id: photoId,
        roomId,
        userId,
        url,
        size: file.size,
        timestamp: Timestamp.fromDate(new Date(timestamp)),
      };

      await addDoc(collection(db, "photos"), photoData);

      return {
        ...photoData,
        timestamp,
      } as Photo;
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }
  },

  // Save photo that was already uploaded to external storage
  saveExternalPhoto: async (
    roomId: string,
    userId: string,
    url: string,
    size: number,
  ): Promise<Photo> => {
    try {
      const photoId = generateId();
      const timestamp = Date.now();

      const photoData = {
        id: photoId,
        roomId,
        userId,
        url,
        size,
        timestamp: Timestamp.fromDate(new Date(timestamp)),
      };

      await addDoc(collection(db, "photos"), photoData);

      return {
        ...photoData,
        timestamp,
      } as Photo;
    } catch (error) {
      console.error("Error saving photo metadata:", error);
      throw error;
    }
  },

  getPhotos: async (roomId: string): Promise<Photo[]> => {
    try {
      const q = query(collection(db, "photos"), where("roomId", "==", roomId));
      const querySnapshot = await getDocs(q);

      const photos: Photo[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const timestamp =
          data.timestamp instanceof Timestamp ?
            data.timestamp.toDate().getTime()
          : data.timestamp;
        return {
          ...data,
          timestamp,
        } as Photo;
      });

      return photos.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error getting photos:", error);
      return [];
    }
  },
};
