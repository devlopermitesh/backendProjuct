import mongoose from "mongoose";
const SubscriptionSchema = mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const SubscriptionModel = mongoose.model(
  "Subscription",
  SubscriptionSchema
);
