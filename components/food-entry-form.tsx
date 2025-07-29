"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Save, X } from 'lucide-react';
import { FoodEntry, COMPLAINT_TYPES, SEVERITY_LEVELS } from '@/types/food-entry';

interface FoodEntryFormProps {
  entry?: FoodEntry | null;
  onSubmit: (entry: FoodEntry | Omit<FoodEntry, 'id'>) => void;
  onCancel: () => void;
}

export function FoodEntryForm({ entry, onSubmit, onCancel }: FoodEntryFormProps) {
  const [formData, setFormData] = useState({
    date: entry?.date || new Date().toISOString().split('T')[0],
    time: entry?.time || new Date().toTimeString().slice(0, 5),
    mealType: entry?.mealType || 'breakfast' as const,
    foods: entry?.foods || '',
    mealNotes: entry?.mealNotes || '',
    hasComplaints: entry?.hasComplaints || false,
    complaintTypes: entry?.complaintTypes || [],
    complaintSeverities: entry?.complaintSeverities || {},
    complaintNotes: entry?.complaintNotes || '',
    timeAfterMeal: entry?.timeAfterMeal || '',
  });

  const handleComplaintTypeChange = (complaintId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        complaintTypes: [...prev.complaintTypes, complaintId],
        complaintSeverities: { ...prev.complaintSeverities, [complaintId]: 1 }
      }));
    } else {
      const newComplaintTypes = formData.complaintTypes.filter(id => id !== complaintId);
      const newSeverities = { ...formData.complaintSeverities };
      delete newSeverities[complaintId];
      setFormData(prev => ({
        ...prev,
        complaintTypes: newComplaintTypes,
        complaintSeverities: newSeverities
      }));
    }
  };

  const handleSeverityChange = (complaintId: string, severity: number[]) => {
    setFormData(prev => ({
      ...prev,
      complaintSeverities: { ...prev.complaintSeverities, [complaintId]: severity[0] }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entry) {
      onSubmit({ ...formData, id: entry.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{entry ? 'Bejegyzés Szerkesztése' : 'Új Étkezési Napló Bejegyzés'}</CardTitle>
        <CardDescription>
          Rögzítsd az étkezésedet és az esetleges tüneteket
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Dátum</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Időpont</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mealType">Étkezés Típusa</Label>
            <Select value={formData.mealType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, mealType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Reggeli</SelectItem>
                <SelectItem value="lunch">Ebéd</SelectItem>
                <SelectItem value="dinner">Vacsora</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
                <SelectItem value="other">Egyéb</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foods">Elfogyasztott Ételek</Label>
            <Textarea
              id="foods"
              placeholder="Sorold fel az összes elfogyasztott ételt és italt..."
              value={formData.foods}
              onChange={(e) => setFormData(prev => ({ ...prev, foods: e.target.value }))}
              required
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mealNotes">Étkezési Megjegyzések</Label>
            <Textarea
              id="mealNotes"
              placeholder="További megjegyzések az étkezésről..."
              value={formData.mealNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, mealNotes: e.target.value }))}
              className="min-h-[60px]"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasComplaints"
                checked={formData.hasComplaints}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasComplaints: !!checked }))}
              />
              <Label htmlFor="hasComplaints" className="text-lg font-medium">
                Tapasztaltál-e panaszokat az étkezés után?
              </Label>
            </div>

            {formData.hasComplaints && (
              <div className="space-y-4 p-4 bg-red-50 rounded-lg border">
                <div className="space-y-2">
                  <Label htmlFor="timeAfterMeal">Mikor Kezdődtek a Panaszok az Étkezés Után</Label>
                  <Input
                    id="timeAfterMeal"
                    placeholder="pl. 30 perc, 2 óra"
                    value={formData.timeAfterMeal}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeAfterMeal: e.target.value }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Panasz Típusok és Súlyosság</Label>
                  <div className="grid grid-cols-1 gap-4">
                    {COMPLAINT_TYPES.map((complaint) => (
                      <div key={complaint.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={complaint.id}
                            checked={formData.complaintTypes.includes(complaint.id)}
                            onCheckedChange={(checked) => handleComplaintTypeChange(complaint.id, !!checked)}
                          />
                          <Label htmlFor={complaint.id} className="flex-1">
                            <Badge variant="secondary" className={complaint.color}>
                              {complaint.name}
                            </Badge>
                          </Label>
                        </div>
                        
                        {formData.complaintTypes.includes(complaint.id) && (
                          <div className="ml-6 space-y-2">
                            <Label className="text-sm">
                              Súlyosság: {SEVERITY_LEVELS.find(s => s.value === formData.complaintSeverities[complaint.id])?.label}
                            </Label>
                            <Slider
                              value={[formData.complaintSeverities[complaint.id] || 1]}
                              onValueChange={(value) => handleSeverityChange(complaint.id, value)}
                              max={4}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              {SEVERITY_LEVELS.map((level) => (
                                <span key={level.value} className={level.color}>
                                  {level.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complaintNotes">További Panasz Megjegyzések</Label>
                  <Textarea
                    id="complaintNotes"
                    placeholder="Írd le részletesen a tüneteket..."
                    value={formData.complaintNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, complaintNotes: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {entry ? 'Bejegyzés Frissítése' : 'Bejegyzés Mentése'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Mégse
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}