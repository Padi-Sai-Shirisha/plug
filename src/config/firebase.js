import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
} from "firebase/auth";
import { get, getDatabase, ref, set, child } from "firebase/database";

const googleProvider = new GoogleAuthProvider();

const firebaseConfig = {
  apiKey: "AIzaSyAmOmqhgbzwyvP0TY5ziwXHjFanwztNxZo",
  authDomain: "plug-18646.firebaseapp.com",
  projectId: "plug-18646",
  storageBucket: "plug-18646.appspot.com",
  messagingSenderId: "838722385629",
  appId: "1:838722385629:web:d5e935158dd60d69d88d34",
  measurementId: "G-55ZX14CWBH",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const dbRef = ref(database);
export const auth = getAuth(app);

export const googleLogin = async () => {
  const res = await signInWithPopup(auth, googleProvider);

  return res;
};

export const anonymousLogin = async () => {
  const res = await signInAnonymously(auth);
  return res;
};

export const logout = () => {
  signOut(auth);
};

export async function storeUserData({ userId, name, email, imageUrl }) {
  await set(ref(database, "users/" + userId), {
    username: name,
    email: email,
    profile_picture: imageUrl,
  });
}

export async function getUserData(userId) {
  const user = await get(child(dbRef, `users/${userId}`));

  if (user.exists()) {
    return user.val();
  }

  console.log("User does not exist");
  return null;
}

export async function editStatus({ userId, statusText = "Hey There" }) {
  const userStatus = await get(child(dbRef, `status/${userId}`));

  if (!userStatus.exists()) {
    return await set(ref(database, "status/" + userId), {
      statusText,
      likeCount: 0,
      disLikeCount: 0,
      likes: {},
      disLikes: {},
    });
  }

  return await set(ref(database, "status/" + userId), {
    ...userStatus.val(),
    statusText,
  });
}

export async function getDashboardContent() {}
