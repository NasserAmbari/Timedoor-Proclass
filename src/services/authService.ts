import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import type { Register, AuthUser, Role } from '@/types/auth';

export type RegisterInput = Omit<Register, 'username'> & {
  fullName: string;
  username: string;
};

export const registerWithEmail = async ({
  fullName,
  username,
  email,
  password,
}: Register): Promise<User> => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: fullName });
  try {
    await setDoc(doc(db, 'users', cred.user.uid), {
      fullName,
      username: username.trim(),
      email,
      role: 'user',
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error('Gagal menyimpan profil user:', e);
  }

  return cred.user;
};

export const loginWithEmail = async (
  email: string,
  password: string,
): Promise<User> => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const logout = () => {
  signOut(auth);
};

export const listenAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getUserRole = async (uid: string): Promise<Role> => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() && snap.data().role === 'admin' ? 'admin' : 'user';
  } catch (error) {
    return 'user';
  }
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
) => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Not signed in');

  const credential = EmailAuthProvider.credential(user.email, oldPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};
