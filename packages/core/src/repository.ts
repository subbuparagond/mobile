import { countries, malls, type Mall } from "./malls";

export interface MallRepository {
  getCountries(): Promise<string[]>;
  getMalls(country?: string): Promise<Mall[]>;
  getMallById(id: string): Promise<Mall | null>;
}

export const mockMallRepository: MallRepository = {
  async getCountries() {
    return countries;
  },
  async getMalls(country) {
    return country ? malls.filter((mall) => mall.country === country) : malls;
  },
  async getMallById(id) {
    return malls.find((mall) => mall.id === id) ?? null;
  },
};
