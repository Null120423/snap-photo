/** @format */

export const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const USER_ID_KEY = "snapshare_user_id";
export const getOrInitUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = getDeviceId();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

const getDeviceId = (): string => {
  // Fallback to generated ID since IMEI/device ID isn't directly accessible in browsers
  return navigator.userAgent + generateId();
};

const MY_ROOMS_KEY = "snapshare_my_rooms";
export const getMyRooms = (): string[] => {
  const rooms = localStorage.getItem(MY_ROOMS_KEY);
  return rooms ? JSON.parse(rooms) : [];
};

export const addMyRoom = (roomId: string) => {
  const rooms = getMyRooms();
  if (!rooms.includes(roomId)) {
    localStorage.setItem(MY_ROOMS_KEY, JSON.stringify([...rooms, roomId]));
  }
};

const DOWNLOADED_PHOTOS_KEY = "snapshare_downloaded_photos";
export const getDownloadedPhotos = (): string[] => {
  const photos = localStorage.getItem(DOWNLOADED_PHOTOS_KEY);
  return photos ? JSON.parse(photos) : [];
};

export const markAsDownloaded = (photoId: string) => {
  const photos = getDownloadedPhotos();
  if (!photos.includes(photoId)) {
    localStorage.setItem(
      DOWNLOADED_PHOTOS_KEY,
      JSON.stringify([...photos, photoId]),
    );
  }
};

export const setDownloadedPhotos = (ids: string[]) => {
  localStorage.setItem(DOWNLOADED_PHOTOS_KEY, JSON.stringify(ids));
};
