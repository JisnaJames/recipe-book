
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

// Recipe schema
const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true
    },
    ingredients: {
      type: String,
      required: true
    },
    steps: {
      type: String,
      required: true
    },
    cookingTime: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

// Test route
app.get("/", (req, res) => {
  res.send("Recipe Book API is running!");
});

// GET all recipes
app.get("/api/recipes", async (req, res) => {
  try {
    // Wait until MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "MongoDB is not connected yet"
      });
    }

    const recipes = await Recipe.find({}).lean();
    console.log("Recipes fetched:", recipes.length);
    return res.status(200).json(recipes);
  } catch (error) {
    console.error("FETCH ERROR:", error);
    return res.status(500).json({
      message: "Could not fetch recipes",
      error: error.message
    });
  }
});

// ADD a recipe
app.post("/api/recipes", async (req, res) => {
  try {
    const { name, category, ingredients, steps, cookingTime } = req.body;

    if (
      !name?.trim() ||
      !category?.trim() ||
      !ingredients?.trim() ||
      !steps?.trim() ||
      cookingTime === undefined ||
      cookingTime === ""
    ) {
      return res.status(400).json({
        message: "Please fill in all recipe fields"
      });
    }

    const recipe = await Recipe.create({
      name: name.trim(),
      category,
      ingredients,
      steps,
      cookingTime: Number(cookingTime)
    });

    return res.status(201).json(recipe);
  } catch (error) {
    console.error("ADD RECIPE ERROR:", error);
    return res.status(400).json({
      message: "Could not save recipe",
      error: error.message
    });
  }
});

// UPDATE a recipe
app.put("/api/recipes/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid recipe ID"
      });
    }

    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found"
      });
    }

    return res.status(200).json(recipe);
  } catch (error) {
    console.error("UPDATE RECIPE ERROR:", error);
    return res.status(400).json({
      message: "Could not update recipe",
      error: error.message
    });
  }
});

// DELETE a recipe
app.delete("/api/recipes/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid recipe ID"
      });
    }

    const recipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found"
      });
    }

    return res.status(200).json({
      message: "Recipe deleted successfully"
    });
  } catch (error) {
    console.error("DELETE RECIPE ERROR:", error);
    return res.status(500).json({
      message: "Could not delete recipe",
      error: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
