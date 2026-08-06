import type { CargoItem, ClearanceLevel } from "../types";

const DUMMYJSON_BASE_URL = "https://dummyjson.com";
const PRODUCT_FIELDS = "id,title,category,price,thumbnail,stock";

// DummyJSON has no hazmat concept — these categories stand in for it so the
// wizard's conditional-clearance logic has something real to react to.
const HAZMAT_CATEGORIES = new Set([
  "fragrances",
  "skin-care",
  "automotive",
  "motorcycle",
  "lighting",
]);

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

interface DummyJsonProduct {
  id: number;
  title: string;
  category: string;
  price: number;
  thumbnail: string;
  stock: number;
}

interface DummyJsonProductsResponse {
  products: DummyJsonProduct[];
  total: number;
  skip: number;
  limit: number;
}

function clearanceLevelFor(category: string): ClearanceLevel {
  return HAZMAT_CATEGORIES.has(category) ? "hazmat" : "public";
}

function toCargoItem(product: DummyJsonProduct): CargoItem {
  return {
    id: product.id,
    title: product.title,
    category: product.category,
    unitPriceUsd: product.price,
    thumbnailUrl: product.thumbnail,
    stock: product.stock,
    clearanceLevel: clearanceLevelFor(product.category),
  };
}

export interface FetchCargoCatalogParams {
  query?: string;
  page?: number;
  limit?: number;
}

export interface CargoCatalogPage {
  items: CargoItem[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchCargoCatalog({
  query = "",
  page = 0,
  limit = 12,
}: FetchCargoCatalogParams = {}): Promise<CargoCatalogPage> {
  const skip = page * limit;
  const trimmedQuery = query.trim();
  const url = trimmedQuery
    ? `${DUMMYJSON_BASE_URL}/products/search?q=${encodeURIComponent(trimmedQuery)}&limit=${limit}&skip=${skip}&select=${PRODUCT_FIELDS}`
    : `${DUMMYJSON_BASE_URL}/products?limit=${limit}&skip=${skip}&select=${PRODUCT_FIELDS}`;

  const data = await fetchJson<DummyJsonProductsResponse>(url);

  return {
    items: data.products.map(toCargoItem),
    total: data.total,
    page,
    limit,
  };
}
