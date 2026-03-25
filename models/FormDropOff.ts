import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const analyticsCollectionName =
  process.env.MONGODB_FORM_DROP_OFF_COLLECTION ?? "form_drop_off_analytics";

const formDropOffSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: String,
      default: null,
      trim: true
    },
    formId: {
      type: String,
      required: true,
      trim: true
    },
    formName: {
      type: String,
      default: null,
      trim: true
    },
    utmSource: {
      type: String,
      default: null,
      trim: true
    },
    utmMedium: {
      type: String,
      default: null,
      trim: true
    },
    utmCampaign: {
      type: String,
      default: null,
      trim: true
    },
    pageStage: {
      type: String,
      enum: ["home", "apply"],
      required: true
    },
    currentStep: {
      type: Number,
      required: true,
      min: 1
    },
    currentField: {
      type: String,
      default: null,
      trim: true
    },
    progressPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    timeSpentInSeconds: {
      type: Number,
      required: true,
      min: 0
    },
    lastActiveAt: {
      type: Date,
      required: true
    },
    droppedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["abandoned", "completed"],
      required: true
    },
    dropOffReason: {
      type: String,
      enum: ["beforeunload", "pagehide", "route-change", "inactivity", "submit"],
      default: null
    }
  },
  {
    collection: analyticsCollectionName,
    timestamps: true,
    versionKey: false
  }
);

formDropOffSchema.index({ sessionId: 1, formId: 1 }, { unique: true });
formDropOffSchema.index({ status: 1, updatedAt: -1 });

export type FormDropOffDocument = InferSchemaType<typeof formDropOffSchema>;

export const FormDropOffModel =
  (models.FormDropOff as Model<FormDropOffDocument>) ||
  model<FormDropOffDocument>("FormDropOff", formDropOffSchema);
