import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Expense, ExpenseFormData } from "../types/expense";

const COLLECTION_NAME = "expenses";

export const expenseService = {
  async getExpenses(userId: string): Promise<Expense[]> {
    if (!userId) throw new Error("User ID is required");

    try {
      const expensesRef = collection(db, COLLECTION_NAME);
      const q = query(
        expensesRef,
        where("userId", "==", userId),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Expense)
      );
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },

  async addExpense(userId: string, data: ExpenseFormData): Promise<void> {
    if (!userId) throw new Error("User ID is required");

    try {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
    }
  },

  async updateExpense(
    expenseId: string,
    data: Partial<ExpenseFormData>
  ): Promise<void> {
    if (!expenseId) throw new Error("Expense ID is required");

    try {
      await updateDoc(doc(db, COLLECTION_NAME, expenseId), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  },

  async deleteExpense(expenseId: string): Promise<void> {
    if (!expenseId) throw new Error("Expense ID is required");

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, expenseId));
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  },
};
