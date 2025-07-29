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
import { Plus, FileText, Download, Settings, Cloud } from "lucide-react";
import { FoodEntryForm } from "@/components/food-entry-form";
import { EntryList } from "@/components/entry-list";
import { GoogleSheetsSettings } from "@/components/google-sheets-settings";
import { exportToCSV } from "@/lib/export-utils";
import { useGoogleSheets } from "@/hooks/use-google-sheets";
import { FoodEntry } from "@/types/food-entry";

export default function Home() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const { saveEntry, updateEntry, deleteEntry, syncWithSheets, loading } =
    useGoogleSheets();

  useEffect(() => {
    const loadData = async () => {
      const savedEntries = localStorage.getItem("foodDiaryEntries");
      const localEntries = savedEntries ? JSON.parse(savedEntries) : [];

      // Check if Google Sheets is enabled
      const isGoogleSheetsEnabled =
        localStorage.getItem("googleSheetsEnabled") === "true";
      const spreadsheetId = localStorage.getItem("googleSheetsSpreadsheetId");

      if (isGoogleSheetsEnabled && spreadsheetId) {
        try {
          const syncedEntries = await syncWithSheets(localEntries);
          setEntries(syncedEntries);
          localStorage.setItem(
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
    localStorage.setItem("foodDiaryEntries", JSON.stringify(newEntries));
  };

  const handleAddEntry = async (entry: Omit<FoodEntry, "id">) => {
    try {
      const isGoogleSheetsEnabled =
        localStorage.getItem("googleSheetsEnabled") === "true";

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
        localStorage.getItem("googleSheetsEnabled") === "true";

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
        localStorage.getItem("googleSheetsEnabled") === "true";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Étkezési Napló
          </h1>
          <p className="text-gray-600 text-lg">
            Kövesd nyomon az étkezéseidet és a tested reakcióit
          </p>
        </header>

        {!showForm && !showSettings ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                disabled={loading}
              >
                <Plus className="w-5 h-5 mr-2" />
                Új Bejegyzés Hozzáadása
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                size="lg"
                className="px-6 py-3"
                disabled={entries.length === 0}
              >
                <Download className="w-5 h-5 mr-2" />
                Exportálás CSV-be
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                size="lg"
                className="px-6 py-3"
              >
                <Cloud className="w-5 h-5 mr-2" />
                Google Sheets
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-blue-600">
                    {entries.length}
                  </CardTitle>
                  <CardDescription>Összes Bejegyzés</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-red-600">
                    {entries.filter((e) => e.hasComplaints).length}
                  </CardTitle>
                  <CardDescription>
                    Panaszokkal Járó Bejegyzések
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-green-600">
                    {entries.filter((e) => !e.hasComplaints).length}
                  </CardTitle>
                  <CardDescription>Panaszmentes Bejegyzések</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <EntryList
              entries={entries}
              onEdit={(entry) => {
                setEditingEntry(entry);
                setShowForm(true);
              }}
              onDelete={handleDeleteEntry}
            />
          </div>
        ) : showSettings ? (
          <div className="max-w-2xl mx-auto">
            <GoogleSheetsSettings entries={entries} onSync={handleSync} />
            <div className="mt-6 text-center">
              <Button onClick={() => setShowSettings(false)} variant="outline">
                Vissza
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <FoodEntryForm
              entry={editingEntry}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingEntry(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
