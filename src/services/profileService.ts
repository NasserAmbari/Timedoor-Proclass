import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { updateProfile, deleteUser } from 'firebase/auth';
import { auth, db } from '@/firebase';
import type { UserProfile, UpdateProfilePayload } from '@/types/user';
const DEFAULT_IMAGES =
  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

export const getProfile = async (uid: string): Promise<UserProfile> => {
  const snap = await getDoc(doc(db, 'users', uid));
  const data = snap.data() ?? {};

  return {
    role: data.role ?? 'user',
    fullName: data.fullName ?? '',
    username: data.username ?? '',
    email: data.email ?? '',
    photo: data.photo ?? DEFAULT_IMAGES,
  };
};

export const updateUserProfile = async (
  uid: string,
  payload: UpdateProfilePayload,
): Promise<void> => {
  const user = auth.currentUser;
  if (user) await updateProfile(user, { displayName: payload.fullName });

  await setDoc(
    doc(db, 'users', uid),
    {
      fullName: payload.fullName,
      username: payload.username,
      photo: payload.photo,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const deleteProfile = async (uid: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', uid));
  const user = auth.currentUser;
  if (user) await deleteUser(user);
};
