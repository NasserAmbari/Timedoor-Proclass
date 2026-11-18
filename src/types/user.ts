export type Role = 'admin' | 'user';

export interface UserProfile {
  role: Role;
  fullName: string;
  username: string;
  email: string;
  photo: string;
}

/** Belum paham ini buat apa ya? */
export type UpdateProfilePayload = Pick<
  UserProfile,
  'fullName' | 'username' | 'photo'
>;
