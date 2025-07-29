"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Download } from 'lucide-react';
import { FoodEntryForm } from '@/components/food-entry-form';
import { EntryList } from '@/components/entry-list';
import { exportToCSV } from '@/lib/export-utils';
import { FoodEntry } from '@/types/food-entry';

export default function Home() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);

  useEffect(() => {
    const savedEntries = localStorage.getItem('foodDiaryEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  const saveEntries = (newEntries: FoodEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('foodDiaryEntries', JSON.stringify(newEntries));
  };

  const handleAddEntry = (entry: Omit<FoodEntry, 'id'>) => {
    const newEntry: FoodEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    const newEntries = [newEntry, ...entries];
    saveEntries(newEntries);
    setShowForm(false);
  };

  const handleEditEntry = (entry: FoodEntry) => {
    const updatedEntries = entries.map(e => e.id === entry.id ? entry : e);
    saveEntries(updatedEntries);
    setEditingEntry(null);
    setShowForm(false);
  };

  const handleDeleteEntry = (id: string) => {
    const newEntries = entries.filter(e => e.id !== id);
    saveEntries(newEntries);
  };

  const handleExport = () => {
    exportToCSV(entries);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Étkezési Napló</h1>
          <p className="text-gray-600 text-lg">Kövesd nyomon az étkezéseidet és a tested reakcióit</p>
        </header>

        {!showForm ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setShowForm(true)} 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-blue-600">{entries.length}</CardTitle>
                  <CardDescription>Összes Bejegyzés</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-red-600">
                    {entries.filter(e => e.hasComplaints).length}
                  </CardTitle>
                  <CardDescription>Panaszokkal Járó Bejegyzések</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-green-600">
                    {entries.filter(e => !e.hasComplaints).length}
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
        ) : (
          <div className="max-w-2xl mx-auto">
            <FoodEntryForm
              entry={editingEntry}
              onSubmit={editingEntry ? handleEditEntry : handleAddEntry}
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