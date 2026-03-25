import { connectMongoose } from "./mongoose";
import { FormDropOffModel } from "../models/FormDropOff";

type DropOffBreakdownRow = {
  label: string;
  count: number;
};

type DropOffSummary = {
  abandonedSessions: number;
  completedSessions: number;
  averageProgressPercentage: number;
  averageTimeSpentInSeconds: number;
};

type DropOffReport = {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: DropOffSummary;
  fieldBreakdown: DropOffBreakdownRow[];
  stepBreakdown: DropOffBreakdownRow[];
  stageBreakdown: DropOffBreakdownRow[];
  reasonBreakdown: DropOffBreakdownRow[];
};

const DEFAULT_REPORT_RANGE_DAYS = 30;

function buildDefaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - (DEFAULT_REPORT_RANGE_DAYS - 1));
  return date.toISOString().slice(0, 10);
}

function buildEndOfDay(dateValue: string) {
  return new Date(`${dateValue}T23:59:59.999Z`);
}

function buildStartOfDay(dateValue: string) {
  return new Date(`${dateValue}T00:00:00.000Z`);
}

function normalizeBreakdownRows(
  rows: Array<{ _id: string | number | null; count: number }> = [],
  fallbackLabel: string
) {
  return rows.map((row) => ({
    label: row._id === null || row._id === "" ? fallbackLabel : String(row._id),
    count: row.count
  }));
}

export async function getDropOffReport(startDate?: string, endDate?: string): Promise<DropOffReport> {
  await connectMongoose();

  const normalizedStartDate = startDate || buildDefaultStartDate();
  const normalizedEndDate = endDate || new Date().toISOString().slice(0, 10);

  const abandonedMatch = {
    status: "abandoned",
    droppedAt: {
      $gte: buildStartOfDay(normalizedStartDate),
      $lte: buildEndOfDay(normalizedEndDate)
    }
  };

  const completedMatch = {
    status: "completed",
    completedAt: {
      $gte: buildStartOfDay(normalizedStartDate),
      $lte: buildEndOfDay(normalizedEndDate)
    }
  };

  const [
    abandonedSessions,
    completedSessions,
    abandonedSummaryRows,
    fieldRows,
    stepRows,
    stageRows,
    reasonRows
  ] = await Promise.all([
    FormDropOffModel.countDocuments(abandonedMatch),
    FormDropOffModel.countDocuments(completedMatch),
    FormDropOffModel.aggregate([
      { $match: abandonedMatch },
      {
        $group: {
          _id: null,
          averageProgressPercentage: { $avg: "$progressPercentage" },
          averageTimeSpentInSeconds: { $avg: "$timeSpentInSeconds" }
        }
      }
    ]),
    FormDropOffModel.aggregate([
      { $match: abandonedMatch },
      { $group: { _id: "$currentField", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }
    ]),
    FormDropOffModel.aggregate([
      { $match: abandonedMatch },
      { $group: { _id: "$currentStep", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    FormDropOffModel.aggregate([
      { $match: abandonedMatch },
      { $group: { _id: "$pageStage", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }
    ]),
    FormDropOffModel.aggregate([
      { $match: abandonedMatch },
      { $group: { _id: "$dropOffReason", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }
    ])
  ]);

  const summaryRow = abandonedSummaryRows[0];

  return {
    dateRange: {
      startDate: normalizedStartDate,
      endDate: normalizedEndDate
    },
    summary: {
      abandonedSessions,
      completedSessions,
      averageProgressPercentage: Number(
        (summaryRow?.averageProgressPercentage ?? 0).toFixed(2)
      ),
      averageTimeSpentInSeconds: Math.round(summaryRow?.averageTimeSpentInSeconds ?? 0)
    },
    fieldBreakdown: normalizeBreakdownRows(fieldRows, "Unknown field"),
    stepBreakdown: normalizeBreakdownRows(stepRows, "Unknown step"),
    stageBreakdown: normalizeBreakdownRows(stageRows, "Unknown stage"),
    reasonBreakdown: normalizeBreakdownRows(reasonRows, "Unknown reason")
  };
}
