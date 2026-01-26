/** @format */

import { Photo, Room } from "../types";

export interface AppState {
  view: "home" | "create" | "room" | "detail" | "profile" | "my-rooms";
  userId: string;
  roomCode: string;
  currentRoom: Room | null;
  photos: Photo[];
  selectedPhoto: Photo | null;
  myRooms: Room[];
  downloadedIds: string[];
  isSelectMode: boolean;
  selectedIds: Set<string>;
  gridCols: number;

  // Loading states
  loading: boolean;
  loadingMyRooms: boolean;
  loadingPhotos: boolean;
  loadingCreate: boolean;
  loadingJoin: boolean;
  error: string;
}

export class AppStateManager {
  private state: AppState;
  private listeners: Set<(state: AppState) => void> = new Set();

  constructor(initialState: AppState) {
    this.state = initialState;
  }

  // Subscribe to state changes
  subscribe(listener: (state: AppState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners of state changes
  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Update state
  setState(updates: Partial<AppState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  // Get current state
  getState(): AppState {
    return this.state;
  }

  // Update rooms and stop loading
  updateRooms(rooms: Room[]) {
    this.setState({
      myRooms: rooms,
      loadingMyRooms: false,
    });
  }

  // Update current room and photos after joining
  updateRoomData(room: Room, photos: Photo[]) {
    this.setState({
      currentRoom: room,
      photos: photos,
      loadingPhotos: false,
      loadingJoin: false,
    });
  }

  // Update photos after upload
  updatePhotos(photos: Photo[]) {
    this.setState({
      photos: photos,
      loading: false,
    });
  }

  // Update downloaded photos
  updateDownloadedPhotos(downloadedIds: string[]) {
    this.setState({
      downloadedIds: downloadedIds,
    });
  }

  // Set loading state for specific operation
  setLoading(
    operation: "join" | "create" | "upload" | "myRooms" | "photos",
    isLoading: boolean,
  ) {
    const updates: Partial<AppState> = {};

    switch (operation) {
      case "join":
        updates.loadingJoin = isLoading;
        break;
      case "create":
        updates.loadingCreate = isLoading;
        break;
      case "upload":
        updates.loading = isLoading;
        break;
      case "myRooms":
        updates.loadingMyRooms = isLoading;
        break;
      case "photos":
        updates.loadingPhotos = isLoading;
        break;
    }

    this.setState(updates);
  }

  // Set error message
  setError(error: string) {
    this.setState({ error });
    // Auto-clear error after 5 seconds
    setTimeout(() => {
      if (this.state.error === error) {
        this.setState({ error: "" });
      }
    }, 5000);
  }

  // Navigate to view
  navigateTo(view: AppState["view"]) {
    this.setState({ view });
  }

  // Clear selection
  clearSelection() {
    this.setState({
      isSelectMode: false,
      selectedIds: new Set(),
    });
  }
}
