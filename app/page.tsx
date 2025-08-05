"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FileText,
  Download,
  Settings,
  Cloud,
  Home as HomeIcon,
  History as HistoryIcon,
  BarChart3,
} from "lucide-react";
import { FoodEntryForm } from "@/components/food-entry-form";
import { EntryList } from "@/components/entry-list";
import { History } from "@/components/history";
import { Analytics } from "@/components/analytics";
import { GoogleSheetsSettings } from "@/components/google-sheets-settings";
import { exportToCSV } from "@/lib/export-utils";
import { useGoogleSheets } from "@/hooks/use-google-sheets";
import { FoodEntry } from "@/types/food-entry";

// Force dynamic rendering to avoid SSR issues
export const dynamic = "force-dynamic";

export default function Home() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "history" | "analytics"
  >("dashboard");
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const { saveEntry, updateEntry, deleteEntry, syncWithSheets, loading } =
    useGoogleSheets();

  // Helper function to safely access localStorage
  const getLocalStorageItem = (key: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  };

  const setLocalStorageItem = (key: string, value: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // Check if we're in browser environment
      if (typeof window === "undefined") return;

      const savedEntries = getLocalStorageItem("foodDiaryEntries");
      const localEntries = savedEntries ? JSON.parse(savedEntries) : [];

      // Check if Google Sheets is enabled
      const isGoogleSheetsEnabled =
        getLocalStorageItem("googleSheetsEnabled") === "true";
      const spreadsheetId = getLocalStorageItem("googleSheetsSpreadsheetId");

      if (isGoogleSheetsEnabled && spreadsheetId) {
        try {
          const syncedEntries = await syncWithSheets(localEntries);
          setEntries(syncedEntries);
          setLocalStorageItem(
            "foodDiaryEntries",
            JSON.stringify(syncedEntries)
          );
        } catch (error) {
          console.warn(
            "Failed to sync with Google Sheets, using local data:",
            error
          );
          setEntries(localEntries);
        }
      } else {
        setEntries(localEntries);
      }
    };

    loadData();
  }, [syncWithSheets]);

  const saveEntries = (newEntries: FoodEntry[]) => {
    setEntries(newEntries);
    setLocalStorageItem("foodDiaryEntries", JSON.stringify(newEntries));
  };

  const handleAddEntry = async (entry: Omit<FoodEntry, "id">) => {
    try {
      const isGoogleSheetsEnabled =
        getLocalStorageItem("googleSheetsEnabled") === "true";

      if (isGoogleSheetsEnabled) {
        const savedEntry = await saveEntry(entry);
        const newEntries = [savedEntry, ...entries];
        saveEntries(newEntries);
      } else {
        const newEntry: FoodEntry = {
          ...entry,
          id: Date.now().toString(),
        };
        const newEntries = [newEntry, ...entries];
        saveEntries(newEntries);
      }

      setShowForm(false);
    } catch (error) {
      console.error("Failed to save entry:", error);
      // Fallback to local storage
      const newEntry: FoodEntry = {
        ...entry,
        id: Date.now().toString(),
      };
      const newEntries = [newEntry, ...entries];
      saveEntries(newEntries);
      setShowForm(false);
    }
  };

  const handleEditEntry = async (entry: FoodEntry) => {
    try {
      const isGoogleSheetsEnabled =
        getLocalStorageItem("googleSheetsEnabled") === "true";

      if (isGoogleSheetsEnabled) {
        const entryIndex = entries.findIndex((e) => e.id === entry.id);
        if (entryIndex !== -1) {
          await updateEntry(entry, entryIndex + 2); // +2 because sheets are 1-indexed and we have headers
        }
      }

      const updatedEntries = entries.map((e) =>
        e.id === entry.id ? entry : e
      );
      saveEntries(updatedEntries);
      setEditingEntry(null);
      setShowForm(false);
    } catch (error) {
      console.error("Failed to update entry:", error);
      // Fallback to local update
      const updatedEntries = entries.map((e) =>
        e.id === entry.id ? entry : e
      );
      saveEntries(updatedEntries);
      setEditingEntry(null);
      setShowForm(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const isGoogleSheetsEnabled =
        getLocalStorageItem("googleSheetsEnabled") === "true";

      if (isGoogleSheetsEnabled) {
        await deleteEntry(id);
      }

      const newEntries = entries.filter((e) => e.id !== id);
      saveEntries(newEntries);
    } catch (error) {
      console.error("Failed to delete entry:", error);
      // Fallback to local delete
      const newEntries = entries.filter((e) => e.id !== id);
      saveEntries(newEntries);
    }
  };

  const handleExport = () => {
    exportToCSV(entries);
  };

  const handleSync = (syncedEntries: FoodEntry[]) => {
    saveEntries(syncedEntries);
  };

  const handleFormSubmit = async (entry: FoodEntry | Omit<FoodEntry, "id">) => {
    if (editingEntry) {
      await handleEditEntry(entry as FoodEntry);
    } else {
      await handleAddEntry(entry as Omit<FoodEntry, "id">);
    }
  };

  const handleViewAll = () => {
    setCurrentView("history");
  };

  const renderNavigation = () => (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
        <Button
          variant={currentView === "dashboard" ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentView("dashboard")}
          className="flex items-center gap-2 text-xs sm:text-sm"
        >
          <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          Főoldal
        </Button>
        <Button
          variant={currentView === "history" ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentView("history")}
          className="flex items-center gap-2 text-xs sm:text-sm"
        >
          <HistoryIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          Előzmények
        </Button>
        <Button
          variant={currentView === "analytics" ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentView("analytics")}
          className="flex items-center gap-2 text-xs sm:text-sm"
        >
          <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
          Elemzések
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Étkezési Napló
          </h1>
          <p className="text-gray-600 text-base sm:text-lg px-4">
            Kövesd nyomon az étkezéseidet és a tested reakcióit
          </p>
        </header>

        {!showForm && !showSettings && renderNavigation()}

        {showForm ? (
          <div className="max-w-4xl mx-auto px-2 sm:px-4">
            <FoodEntryForm
              entry={editingEntry}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingEntry(null);
              }}
            />
          </div>
        ) : showSettings ? (
          <div className="max-w-4xl mx-auto px-2 sm:px-4">
            <GoogleSheetsSettings entries={entries} onSync={handleSync} />
            <div className="mt-4 sm:mt-6 text-center">
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Vissza
              </Button>
            </div>
          </div>
        ) : currentView === "dashboard" ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:px-6 text-sm sm:text-base w-full flex-1"
                disabled={loading}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Új Bejegyzés Hozzáadása
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                size="lg"
                className="px-4 py-3 sm:px-6 text-sm sm:text-base w-full flex-1"
              >
                <Cloud className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Google Sheets
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                size="lg"
                className="px-4 py-3 sm:px-6 text-sm sm:text-base w-full flex-1"
                disabled={entries.length === 0}
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Exportálás CSV-be
              </Button>
              <style jsx global>{`
                @media (max-width: 640px) {
                  .flex-col > button {
                    width: 100% !important;
                    min-width: 0 !important;
                    max-width: 100% !important;
                  }
                }
              `}</style>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card>
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-blue-600">
                    {entries.length}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Összes Bejegyzés
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-red-600">
                    {entries.filter((e) => e.hasComplaints).length}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Panaszokkal Járó Bejegyzések
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-green-600">
                    {entries.filter((e) => !e.hasComplaints).length}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Panaszmentes Bejegyzések
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <EntryList
              entries={entries}
              limit={10}
              compact={true}
              showViewAllButton={true}
              onViewAll={handleViewAll}
              onEdit={(entry: FoodEntry) => {
                setEditingEntry(entry);
                setShowForm(true);
              }}
              onDelete={handleDeleteEntry}
            />
          </div>
        ) : currentView === "history" ? (
          <History
            entries={entries}
            onEdit={(entry: FoodEntry) => {
              setEditingEntry(entry);
              setShowForm(true);
            }}
            onDelete={handleDeleteEntry}
          />
        ) : currentView === "analytics" ? (
          <Analytics entries={entries} />
        ) : null}
      </div>
    </div>
  );
}
