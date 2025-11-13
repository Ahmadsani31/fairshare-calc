import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
export interface FoodItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
// This represents the state that is actively being calculated
interface CalculationState {
  discountPercentage: number;
  maxDiscount: number;
  shippingCost: number;
  numberOfPeople: number;
  items: FoodItem[];
}
// This is the full state of the store, including saved calculations
interface CalculatorState extends CalculationState {
  savedCalculations: Record<string, CalculationState>;
}
interface CalculatorActions {
  setDiscountPercentage: (percentage: number) => void;
  setMaxDiscount: (max: number) => void;
  setShippingCost: (cost: number) => void;
  setNumberOfPeople: (people: number) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: <K extends keyof FoodItem>(id: string, field: K, value: FoodItem[K]) => void;
  reset: () => void;
  // New actions for persistence
  initialize: () => void;
  saveCalculation: (name: string) => boolean;
  loadCalculation: (name: string) => void;
  deleteCalculation: (name: string) => void;
}
const initialState: CalculationState = {
  discountPercentage: 50,
  maxDiscount: 200000,
  shippingCost: 0,
  numberOfPeople: 1,
  items: [{ id: uuidv4(), name: 'Nasi Goreng Spesial', price: 25000, quantity: 2 }],
};
const STORAGE_KEY = 'fairshare-calculations';
export const useCalculatorStore = create<CalculatorState & CalculatorActions>()(
  immer((set, get) => ({
    ...initialState,
    savedCalculations: {},
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
    setNumberOfPeople: (people) =>
      set((state) => {
        state.numberOfPeople = isNaN(people) || people < 1 ? 1 : people;
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
    // Persistence Actions
    initialize: () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          set({ savedCalculations: JSON.parse(saved) });
        }
      } catch (e) {
        console.error("Could not load saved calculations from localStorage", e);
      }
    },
    saveCalculation: (name) => {
      if (!name) return false;
      const { items, discountPercentage, maxDiscount, shippingCost, numberOfPeople } = get();
      const currentState: CalculationState = {
        items,
        discountPercentage,
        maxDiscount,
        shippingCost,
        numberOfPeople,
      };
      set((state) => {
        state.savedCalculations[name] = currentState;
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(get().savedCalculations));
        return true;
      } catch (e) {
        console.error("Could not save calculations to localStorage", e);
        return false;
      }
    },
    loadCalculation: (name) => {
      const savedState = get().savedCalculations[name];
      if (savedState) {
        set({
          ...savedState,
        });
      }
    },
    deleteCalculation: (name) => {
      set((state) => {
        delete state.savedCalculations[name];
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(get().savedCalculations));
      } catch (e) {
        console.error("Could not update localStorage after deletion", e);
      }
    },
  }))
);