"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Clock, AlertTriangle } from "lucide-react";
import {
  FoodEntry,
  COMPLAINT_TYPES,
  SEVERITY_LEVELS,
} from "@/types/food-entry";

interface EntryListProps {
  entries: FoodEntry[];
  onEdit: (entry: FoodEntry) => void;
  onDelete: (id: string) => void;
  limit?: number;
  compact?: boolean;
  title?: string;
  showViewAllButton?: boolean;
  onViewAll?: () => void;
}

export function EntryList({
  entries,
  onEdit,
  onDelete,
  limit,
  compact = false,
  title,
  showViewAllButton = false,
  onViewAll,
}: EntryListProps) {
  // Sort entries by date and time (most recent first)
  const sortedEntries = [...entries].sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time}`);
    const dateTimeB = new Date(`${b.date}T${b.time}`);
    return dateTimeB.getTime() - dateTimeA.getTime();
  });

  const displayEntries = limit ? sortedEntries.slice(0, limit) : sortedEntries;
  const hasMore = limit ? sortedEntries.length > limit : false;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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
        return mealType;
    }
  };

  if (displayEntries.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-gray-500">Még nincsenek bejegyzések.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">
          {title
            ? title
            : compact
            ? "Legutóbbi Bejegyzések"
            : "Étkezési Napló Bejegyzések"}
        </h2>
        {hasMore && showViewAllButton && onViewAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAll}
            className="text-xs sm:text-sm"
          >
            Összes megtekintése ({entries.length})
          </Button>
        )}
      </div>
      {displayEntries.map((entry) =>
        compact ? (
          // Compact row format for dashboard
          <Card
            key={entry.id}
            className={`transition-all hover:shadow-md ${
              entry.hasComplaints
                ? "border-red-200 bg-red-50/30"
                : "border-gray-200"
            }`}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(entry.time)}
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getMealTypeColor(
                        entry.mealType
                      )} text-xs w-fit`}
                    >
                      {getMealTypeLabel(entry.mealType)}
                    </Badge>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">
                      {entry.foods}
                    </p>
                    {entry.mealNotes && (
                      <p className="text-xs text-gray-500 truncate">
                        {entry.mealNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {entry.hasComplaints && (
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(entry)}
                      className="text-xs px-2 py-1"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(entry.id)}
                      className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Full format for history page
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
        )
      )}
      {hasMore && !showViewAllButton && (
        <Card className="text-center py-4">
          <CardContent>
            <p className="text-gray-500 text-sm">
              ... és még {entries.length - (limit || 0)} bejegyzés
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
