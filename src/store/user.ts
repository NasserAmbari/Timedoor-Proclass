import { defineStore } from 'pinia';
import * as profileService from '@/services/profileService';
import type { UserProfile, UpdateProfilePayload } from '@/types/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as UserProfile | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isLoaded: (state) => !!state.profile,
  },

  actions: {
    async fetchProfile(uid: string) {
      this.loading = true;
      this.error = null;

      try {
        this.profile = await profileService.getProfile(uid);
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Failed to load profile';
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(uid: string, payload: UpdateProfilePayload) {
      this.loading = true;
      this.error = null;

      try {
        await profileService.updateUserProfile(uid, payload);

        if (this.profile) {
          this.profile.fullName = payload.fullName;
          this.profile.username = payload.username;
          this.profile.photo = payload.photo;
        }
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Failed to update profile';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteProfile(uid: string) {
      this.loading = true;
      this.error = null;

      try {
        await profileService.deleteProfile(uid);
        this.profile = null;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Failed to delete profile';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearProfile() {
      this.profile = null;
      this.error = null;
    },
  },
});
