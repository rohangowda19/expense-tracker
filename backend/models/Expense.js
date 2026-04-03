const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Expense name is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    category: {
      type: String,
      default: "General",
      enum: ["General", "Food", "Transport", "Shopping", "Health", "Bills", "Entertainment", "Travel"],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);