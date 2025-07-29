"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { FoodEntry, COMPLAINT_TYPES, SEVERITY_LEVELS } from '@/types/food-entry';

interface EntryListProps {
  entries: FoodEntry[];
  onEdit: (entry: FoodEntry) => void;
  onDelete: (id: string) => void;
}

export function EntryList({ entries, onEdit, onDelete }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-gray-500 text-lg mb-4">Még nincsenek bejegyzések</p>
          <p className="text-gray-400">Kezdd az első étkezési bejegyzés hozzáadásával</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800';
      case 'lunch': return 'bg-blue-100 text-blue-800';
      case 'dinner': return 'bg-purple-100 text-purple-800';
      case 'snack': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMealTypeLabel = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'Reggeli';
      case 'lunch': return 'Ebéd';
      case 'dinner': return 'Vacsora';
      case 'snack': return 'Snack';
      default: return 'Egyéb';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Étkezési Napló Bejegyzések</h2>
      {entries.map((entry) => (
        <Card key={entry.id} className={`transition-all hover:shadow-md ${entry.hasComplaints ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{formatDate(entry.date)}</CardTitle>
                <Badge variant="outline" className={getMealTypeColor(entry.mealType)}>
                  {getMealTypeLabel(entry.mealType)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(entry.time)}
                </div>
                {entry.hasComplaints && (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Elfogyasztott Ételek:</h4>
              <p className="text-gray-700">{entry.foods}</p>
            </div>

            {entry.mealNotes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Étkezési Megjegyzések:</h4>
                <p className="text-gray-700">{entry.mealNotes}</p>
              </div>
            )}

            {entry.hasComplaints && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h4 className="font-medium text-red-900">Jelentett Panaszok</h4>
                </div>
                
                {entry.timeAfterMeal && (
                  <p className="text-sm text-red-700 mb-2">
                    Kezdet: {entry.timeAfterMeal} az étkezés után
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-2">
                  {entry.complaintTypes.map((complaintId) => {
                    const complaint = COMPLAINT_TYPES.find(c => c.id === complaintId);
                    const severity = entry.complaintSeverities[complaintId];
                    const severityLabel = SEVERITY_LEVELS.find(s => s.value === severity);
                    
                    return (
                      <div key={complaintId} className="flex items-center gap-1">
                        <Badge variant="secondary" className={complaint?.color}>
                          {complaint?.name}
                        </Badge>
                        <Badge variant="outline" className={severityLabel?.color}>
                          {severityLabel?.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>

                {entry.complaintNotes && (
                  <div>
                    <h5 className="text-sm font-medium text-red-900 mb-1">További Megjegyzések:</h5>
                    <p className="text-sm text-red-700">{entry.complaintNotes}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(entry)}>
                <Edit2 className="w-4 h-4 mr-1" />
                Szerkesztés
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(entry.id)} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-1" />
                Törlés
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}