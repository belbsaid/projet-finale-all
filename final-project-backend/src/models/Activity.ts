import { Model, model, Schema, Types } from "mongoose";

export interface IActivity {
  type: string;
  title: string;
  description: string;
  entityId?: Types.ObjectId;
  entityType?: "car" | "lead" | "brand" | "model" | "category";
  performedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    type: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    entityId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    entityType: {
      type: String,
      enum: ["car", "lead", "brand", "model", "category"],
      default: null,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

activitySchema.index({ createdAt: -1 });
activitySchema.index({ entityType: 1, entityId: 1 });

const ActivityModel: Model<IActivity> = model<IActivity>(
  "Activity",
  activitySchema,
);

export default ActivityModel;
