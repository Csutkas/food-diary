"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit2,
  Trash2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  History as HistoryIcon,
} from "lucide-react";
import {
  FoodEntry,
  COMPLAINT_TYPES,
  SEVERITY_LEVELS,
} from "@/types/food-entry";

interface HistoryProps {
  entries: FoodEntry[];
  onEdit: (entry: FoodEntry) => void;
  onDelete: (id: string) => void;
}

export function History({ entries, onEdit, onDelete }: HistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<string>("all");
  const [complaintsFilter, setComplaintsFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.foods.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.mealNotes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.complaintNotes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Meal type filter
    if (selectedMealType !== "all") {
      filtered = filtered.filter(
        (entry) => entry.mealType === selectedMealType
      );
    }

    // Complaints filter
    if (complaintsFilter === "with") {
      filtered = filtered.filter((entry) => entry.hasComplaints);
    } else if (complaintsFilter === "without") {
      filtered = filtered.filter((entry) => !entry.hasComplaints);
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const days = parseInt(dateRange);
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((entry) => new Date(entry.date) >= cutoffDate);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
  }, [entries, searchTerm, selectedMealType, complaintsFilter, dateRange]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("hu-HU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("hu-HU", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "bg-yellow-100 text-yellow-800";
      case "lunch":
        return "bg-blue-100 text-blue-800";
      case "dinner":
        return "bg-purple-100 text-purple-800";
      case "snack":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMealTypeLabel = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "Reggeli";
      case "lunch":
        return "Ebéd";
      case "dinner":
        return "Vacsora";
      case "snack":
        return "Snack";
      default:
        return "Egyéb";
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMealType("all");
    setComplaintsFilter("all");
    setDateRange("all");
  };

  if (entries.length === 0) {
    return (
      <Card className="text-center py-8 sm:py-12 mx-2 sm:mx-0">
        <CardContent>
          <HistoryIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-base sm:text-lg mb-4">
            Még nincsenek bejegyzések
          </p>
          <p className="text-gray-400 text-sm sm:text-base">
            Kezdd az első étkezési bejegyzés hozzáadásával
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex items-center gap-2 mb-4">
        <HistoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Teljes Előzmények
        </h2>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Szűrők
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm">
                Keresés
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Ételek, megjegyzések..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Étkezés Típusa</Label>
              <Select
                value={selectedMealType}
                onValueChange={setSelectedMealType}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Összes</SelectItem>
                  <SelectItem value="breakfast">Reggeli</SelectItem>
                  <SelectItem value="lunch">Ebéd</SelectItem>
                  <SelectItem value="dinner">Vacsora</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                  <SelectItem value="other">Egyéb</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Panaszok</Label>
              <Select
                value={complaintsFilter}
                onValueChange={setComplaintsFilter}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Összes</SelectItem>
                  <SelectItem value="with">Panaszokkal</SelectItem>
                  <SelectItem value="without">Panaszok nélkül</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Időszak</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Összes idő</SelectItem>
                  <SelectItem value="7">Utolsó 7 nap</SelectItem>
                  <SelectItem value="30">Utolsó 30 nap</SelectItem>
                  <SelectItem value="90">Utolsó 90 nap</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredEntries.length} bejegyzés találva {entries.length} közül
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Szűrők törlése
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-gray-500 text-base mb-2">
              Nincs találat a megadott szűrőkkel
            </p>
            <p className="text-gray-400 text-sm">
              Próbálj meg módosítani a szűrőket
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              className={`transition-all hover:shadow-md ${
                entry.hasComplaints
                  ? "border-red-200 bg-red-50/30"
                  : "border-gray-200"
              }`}
            >
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <CardTitle className="text-base sm:text-lg break-words">
                        {formatDate(entry.date)}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`${getMealTypeColor(
                          entry.mealType
                        )} text-xs sm:text-sm w-fit`}
                      >
                        {getMealTypeLabel(entry.mealType)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {formatTime(entry.time)}
                      </div>
                      {entry.hasComplaints && (
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                    Elfogyasztott Ételek:
                  </h4>
                  <p className="text-gray-700 text-sm sm:text-base break-words">
                    {entry.foods}
                  </p>
                </div>

                {entry.mealNotes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                      Étkezési Megjegyzések:
                    </h4>
                    <p className="text-gray-700 text-sm sm:text-base break-words">
                      {entry.mealNotes}
                    </p>
                  </div>
                )}

                {entry.hasComplaints && (
                  <div className="p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                      <h4 className="font-medium text-red-900 text-sm sm:text-base">
                        Jelentett Panaszok
                      </h4>
                    </div>

                    {entry.timeAfterMeal && (
                      <p className="text-xs sm:text-sm text-red-700 mb-2">
                        Kezdet: {entry.timeAfterMeal} az étkezés után
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                      {entry.complaintTypes.map((complaintId) => {
                        const complaint = COMPLAINT_TYPES.find(
                          (c) => c.id === complaintId
                        );
                        const severity = entry.complaintSeverities[complaintId];
                        const severityLabel = SEVERITY_LEVELS.find(
                          (s) => s.value === severity
                        );

                        return (
                          <div
                            key={complaintId}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-1"
                          >
                            <Badge
                              variant="secondary"
                              className={`${complaint?.color} text-xs`}
                            >
                              {complaint?.name}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`${severityLabel?.color} text-xs`}
                            >
                              {severityLabel?.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>

                    {entry.complaintNotes && (
                      <div>
                        <h5 className="text-xs sm:text-sm font-medium text-red-900 mb-1">
                          További Megjegyzések:
                        </h5>
                        <p className="text-xs sm:text-sm text-red-700 break-words">
                          {entry.complaintNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(entry)}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Szerkesztés
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(entry.id)}
                    className="w-full sm:w-auto text-xs sm:text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Törlés
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
