import { defineStore } from 'pinia';
import type { User } from 'firebase/auth';
import * as authService from '@/services/authService';
import type { RegisterInput } from '@/services/authService';
import type { AuthUser, Role } from '@/types/auth';
import { switchCart } from '@/composables/useCart';
import { useUserStore } from '@/store/user';

let initPromise: Promise<void> | null = null;

const toAuthUser = (u: User, role: Role): AuthUser => ({
  uid: u.uid,
  email: u.email,
  displayName: u.displayName,
  role,
});

function mapAuthError(e: unknown): string {
  const code = (e as { code?: string })?.code;

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email atau password salah';
    case 'auth/email-already-in-use':
      return 'Email sudah terdaftar';
    case 'auth/weak-password':
      return 'Password terlalu lemah (minimal 6 karakter)';
    case 'auth/invalid-email':
      return 'Format email tidak valid';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan, coba lagi beberapa saat';
    case 'auth/network-request-failed':
      return 'Koneksi bermasalah, periksa internet kamu';
    default:
      return 'Terjadi kesalahan, silakan coba lagi';
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    init() {
      if (!initPromise) {
        initPromise = new Promise<void>((resolve) => {
          authService.listenAuthState(async (u) => {
            const userStore = useUserStore();
            if (u) {
              this.user = toAuthUser(u, await authService.getUserRole(u.uid));
              await userStore.fetchProfile(u.uid);
            } else {
              this.user = null;
              userStore.clearProfile();
            }

            switchCart(this.user?.uid ?? null);
            resolve();
          });
        });
      }
      return initPromise;
    },

    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const user = await authService.loginWithEmail(email, password);
        this.user = toAuthUser(user, await authService.getUserRole(user.uid));
        switchCart(this.user.uid);
      } catch (e) {
        this.error = mapAuthError(e);
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async register(input: RegisterInput) {
      this.loading = true;
      this.error = null;
      try {
        const user = await authService.registerWithEmail(input);
        this.user = toAuthUser(user, 'user');
        switchCart(this.user.uid);
      } catch (e) {
        this.error = mapAuthError(e);
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      await authService.logout();
      const userStore = useUserStore();
      userStore.clearProfile();
      this.user = null;

      switchCart(null);
    },
  },
});
