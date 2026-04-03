const router  = require("express").Router();
const Expense = require("../models/Expense");
const protect = require("../middleware/auth");

// ── Protect all routes below ──
router.use(protect);

// ── GET all expenses (only this user's) ──
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET single expense ──
router.get("/:id", async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST create expense ──
router.post("/", async (req, res) => {
  try {
    const { name, amount, category, date } = req.body;
    const expense = await Expense.create({
      name,
      amount,
      category,
      date,
      userId: req.user._id,
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── PUT update expense ──
router.put("/:id", async (req, res) => {
  try {
    const { name, amount, category, date } = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, amount, category, date },
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE expense ──
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;