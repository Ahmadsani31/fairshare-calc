import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
export interface FoodItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
interface CalculatorState {
  discountPercentage: number;
  maxDiscount: number;
  shippingCost: number;
  items: FoodItem[];
}
interface CalculatorActions {
  setDiscountPercentage: (percentage: number) => void;
  setMaxDiscount: (max: number) => void;
  setShippingCost: (cost: number) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: <K extends keyof FoodItem>(id: string, field: K, value: FoodItem[K]) => void;
  reset: () => void;
}
const initialState: CalculatorState = {
  discountPercentage: 50,
  maxDiscount: 200000,
  shippingCost: 0,
  items: [{ id: uuidv4(), name: 'Nasi Goreng Spesial', price: 25000, quantity: 2 }],
};
export const useCalculatorStore = create<CalculatorState & CalculatorActions>()(
  immer((set) => ({
    ...initialState,
    setDiscountPercentage: (percentage) =>
      set((state) => {
        state.discountPercentage = isNaN(percentage) ? 0 : percentage;
      }),
    setMaxDiscount: (max) =>
      set((state) => {
        state.maxDiscount = isNaN(max) ? 0 : max;
      }),
    setShippingCost: (cost) =>
      set((state) => {
        state.shippingCost = isNaN(cost) ? 0 : cost;
      }),
    addItem: () =>
      set((state) => {
        state.items.push({ id: uuidv4(), name: '', price: 0, quantity: 1 });
      }),
    removeItem: (id) =>
      set((state) => {
        state.items = state.items.filter((item) => item.id !== id);
      }),
    updateItem: (id, field, value) =>
      set((state) => {
        const item = state.items.find((item) => item.id === id);
        if (item) {
          (item[field] as any) = value;
        }
      }),
    reset: () => set(initialState),
  }))
);