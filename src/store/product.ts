import { defineStore } from 'pinia';
import * as productService from '@/services/productService';
import type { ProductItem, ProductPayload } from '@/types/product';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as ProductItem[], // sebelumnya kemungkinan Product[]
    loading: false,
    error: null as string | null,
  }),

  getters: {
    total: (state) => state.products.length,
  },

  actions: {
    async fetchAllProducts() {
      this.loading = true;
      this.error = null;

      try {
        this.products = await productService.getAllProducts();
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : 'Gagal mengambil data produk';
      } finally {
        this.loading = false;
      }
    },

    async createProduct(payload: ProductPayload) {
      this.loading = true;
      this.error = null;

      try {
        const created = await productService.createProduct(payload);
        this.products.unshift(created); // created sudah bertipe ProductItem
        return created.id;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Gagal menyimpan produk';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProductById(id: string): Promise<ProductItem | null> {
      try {
        const item = await productService.getProductById(id);

        if (
          item &&
          !this.products.some((product: ProductItem) => product.id === item.id)
        ) {
          this.products.push(item);
        }

        return item;
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : 'Gagal mengambil detail produk';
        return null;
      }
    },

    getCategory() {
      if (!this.products) return [];

      const unique = new Set(
        this.products
          .map((p: ProductItem) => p.category)
          .filter((c): c is string => !!c),
      );
      return ['All', ...unique];
    },
  },
});
