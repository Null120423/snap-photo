/** @format */

export const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const USER_ID_KEY = "snapshare_user_id";
const USER_NAME_KEY = "snapshare_user_name";
export const getOrInitUserId = (): string => {
  // Use userName as userId if it exists
  const userName = localStorage.getItem(USER_NAME_KEY);
  if (userName) {
    return userName;
  }

  // Fallback to stored userId or generate new one
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

export const getUserName = (): string | null => {
  return localStorage.getItem(USER_NAME_KEY);
};

export const setUserName = (name: string) => {
  localStorage.setItem(USER_NAME_KEY, name);
};

export const hasUserName = (): boolean => {
  return !!localStorage.getItem(USER_NAME_KEY);
};

const USER_PASSWORD_KEY = "snapshare_user_password";
export const getUserPassword = (): string | null => {
  return localStorage.getItem(USER_PASSWORD_KEY);
};

export const setUserPassword = (password: string) => {
  localStorage.setItem(USER_PASSWORD_KEY, password);
};

export const isAuthenticated = (): boolean => {
  return (
    !!localStorage.getItem(USER_NAME_KEY) &&
    !!localStorage.getItem(USER_PASSWORD_KEY)
  );
};

export const saveAuth = (name: string, password: string) => {
  setUserName(name);
  setUserPassword(password);
};

export const clearAuth = () => {
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem(USER_PASSWORD_KEY);
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
