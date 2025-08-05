"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { FoodEntry, COMPLAINT_TYPES } from "@/types/food-entry";

interface AnalyticsProps {
  entries: FoodEntry[];
}

export function Analytics({ entries }: AnalyticsProps) {
  const analytics = useMemo(() => {
    if (entries.length === 0) return null;

    // Basic stats
    const totalEntries = entries.length;
    const complaintsEntries = entries.filter((e) => e.hasComplaints);
    const complaintsCount = complaintsEntries.length;
    const complaintsPercentage = (complaintsCount / totalEntries) * 100;

    // Meal type distribution
    const mealTypes = entries.reduce((acc, entry) => {
      acc[entry.mealType] = (acc[entry.mealType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Most common complaints
    const complaintCounts = complaintsEntries.reduce((acc, entry) => {
      entry.complaintTypes.forEach((complaintId) => {
        acc[complaintId] = (acc[complaintId] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const sortedComplaints = Object.entries(complaintCounts)
      .map(([id, count]) => ({
        id,
        name: COMPLAINT_TYPES.find((c) => c.id === id)?.name || id,
        color: COMPLAINT_TYPES.find((c) => c.id === id)?.color || "",
        count,
        percentage: (count / complaintsCount) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Recent trend (last 7 days vs previous 7 days)
    const now = new Date();
    const last7Days = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const daysDiff =
        (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    const previous7Days = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const daysDiff =
        (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > 7 && daysDiff <= 14;
    });

    const recentComplaintsRate =
      last7Days.length > 0
        ? (last7Days.filter((e) => e.hasComplaints).length / last7Days.length) *
          100
        : 0;

    const previousComplaintsRate =
      previous7Days.length > 0
        ? (previous7Days.filter((e) => e.hasComplaints).length /
            previous7Days.length) *
          100
        : 0;

    const trend = recentComplaintsRate - previousComplaintsRate;

    return {
      totalEntries,
      complaintsCount,
      complaintsPercentage,
      mealTypes,
      sortedComplaints,
      recentComplaintsRate,
      trend,
    };
  }, [entries]);

  if (!analytics) {
    return (
      <Card className="text-center py-8 sm:py-12 mx-2 sm:mx-0">
        <CardContent>
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-base sm:text-lg mb-4">
            Még nincsenek adatok az elemzéshez
          </p>
          <p className="text-gray-400 text-sm sm:text-base">
            Kezdj el bejegyzéseket rögzíteni az elemzések megtekintéséhez
          </p>
        </CardContent>
      </Card>
    );
  }

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

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Elemzések
        </h2>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl text-blue-600">
              {analytics.totalEntries}
            </CardTitle>
            <CardDescription className="text-sm">
              Összes Bejegyzés
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl text-red-600">
              {analytics.complaintsCount}
            </CardTitle>
            <CardDescription className="text-sm">
              Panaszos Bejegyzések
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl text-orange-600">
              {analytics.complaintsPercentage.toFixed(1)}%
            </CardTitle>
            <CardDescription className="text-sm">
              Panaszok Aránya
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1">
              <CardTitle className="text-lg sm:text-xl text-gray-700">
                {analytics.recentComplaintsRate.toFixed(1)}%
              </CardTitle>
              {analytics.trend !== 0 &&
                (analytics.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                ))}
            </div>
            <CardDescription className="text-sm">Utóbbi 7 Nap</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Meal Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Étkezés Típusok Megoszlása
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.mealTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm sm:text-base">
                  {getMealTypeLabel(type)}
                </span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={(count / analytics.totalEntries) * 100}
                    className="w-24 sm:w-32"
                  />
                  <span className="text-sm text-gray-600 min-w-[3rem]">
                    {count} (
                    {((count / analytics.totalEntries) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Most Common Complaints */}
      {analytics.sortedComplaints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Leggyakoribb Panaszok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.sortedComplaints.slice(0, 5).map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between"
                >
                  <Badge
                    variant="secondary"
                    className={`${complaint.color} text-xs sm:text-sm`}
                  >
                    {complaint.name}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={complaint.percentage}
                      className="w-24 sm:w-32"
                    />
                    <span className="text-sm text-gray-600 min-w-[3rem]">
                      {complaint.count} ({complaint.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis */}
      {analytics.trend !== 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Trend Elemzés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm sm:text-base">
              {analytics.trend > 0 ? (
                <>
                  <TrendingUp className="w-5 h-5 text-red-500" />
                  <span className="text-red-600">
                    A panaszok aránya {Math.abs(analytics.trend).toFixed(1)}
                    %-kal nőtt az elmúlt héten
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-5 h-5 text-green-500" />
                  <span className="text-green-600">
                    A panaszok aránya {Math.abs(analytics.trend).toFixed(1)}
                    %-kal csökkent az elmúlt héten
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
