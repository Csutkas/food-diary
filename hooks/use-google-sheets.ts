import { useState, useCallback } from "react";
import { FoodEntry } from "@/types/food-entry";

interface UseSheetsResult {
  loading: boolean;
  error: string | null;
  saveEntry: (entry: FoodEntry | Omit<FoodEntry, "id">) => Promise<FoodEntry>;
  updateEntry: (entry: FoodEntry, rowIndex: number) => Promise<FoodEntry>;
  deleteEntry: (entryId: string) => Promise<void>;
  loadEntries: () => Promise<FoodEntry[]>;
  syncWithSheets: (localEntries: FoodEntry[]) => Promise<FoodEntry[]>;
}

export function useGoogleSheets(): UseSheetsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: any) => {
    console.error("Google Sheets error:", err);
    setError(err.message || "An error occurred with Google Sheets");
    throw err;
  }, []);

  const saveEntry = useCallback(
    async (entry: FoodEntry | Omit<FoodEntry, "id">): Promise<FoodEntry> => {
      setLoading(true);
      setError(null);

      try {
        const entryWithId =
          "id" in entry ? entry : { ...entry, id: Date.now().toString() };

        const response = await fetch("/api/sheets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entryWithId),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save entry");
        }

        const result = await response.json();
        return result.entry;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const updateEntry = useCallback(
    async (entry: FoodEntry, rowIndex: number): Promise<FoodEntry> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/sheets", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ entry, rowIndex }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update entry");
        }

        const result = await response.json();
        return result.entry;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const deleteEntry = useCallback(
    async (entryId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/sheets?id=${entryId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete entry");
        }
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const loadEntries = useCallback(async (): Promise<FoodEntry[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sheets");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load entries");
      }

      const result = await response.json();
      return result.entries || [];
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const syncWithSheets = useCallback(
    async (localEntries: FoodEntry[]): Promise<FoodEntry[]> => {
      try {
        // First, try to load entries from sheets
        const sheetsEntries = await loadEntries();

        // If sheets is empty but we have local entries, sync them to sheets
        if (sheetsEntries.length === 0 && localEntries.length > 0) {
          console.log("Syncing local entries to Google Sheets...");
          for (const entry of localEntries) {
            await saveEntry(entry);
          }
          return localEntries;
        }

        // Return sheets entries as they are the source of truth
        return sheetsEntries;
      } catch (err) {
        console.warn(
          "Failed to sync with Google Sheets, using local data:",
          err
        );
        return localEntries;
      }
    },
    [loadEntries, saveEntry]
  );

  return {
    loading,
    error,
    saveEntry,
    updateEntry,
    deleteEntry,
    loadEntries,
    syncWithSheets,
  };
}
