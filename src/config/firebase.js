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
  apiKey: "AIzaSyCLa2oB_iXLypaT_9-Qacj4KtXLGWjlICs",
  authDomain: "plugapp-e906c.firebaseapp.com",
  projectId: "plugapp-e906c",
  storageBucket: "plugapp-e906c.appspot.com",
  messagingSenderId: "512859423386",
  appId: "1:512859423386:web:f6b6878fe2e375bf215523"
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
