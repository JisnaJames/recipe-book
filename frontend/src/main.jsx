
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = "http://localhost:5000/api/recipes/api/recipes";

function App() {
  const emptyForm = {
    name: "",
    category: "Breakfast",
    ingredients: "",
    steps: "",
    cookingTime: ""
  };

  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRecipes() {
    try {
      setError("");
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Could not load recipes.");
      }

      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError("Could not connect to the backend. Check that your server is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecipes();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.ingredients.trim() ||
      !form.steps.trim() ||
      !Number.isInteger(Number(form.cookingTime)) ||
      Number(form.cookingTime) < 1
    ) {
      setError("Please fill in every field correctly. Cooking time must be a positive whole number.");
      return;
    }

    const recipeData = {
      ...form,
      name: form.name.trim(),
      cookingTime: Number(form.cookingTime)
    };

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recipeData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save recipe.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setSelected(null);
      await loadRecipes();
      alert(editingId ? "Recipe updated successfully!" : "Recipe saved successfully!");
    } catch (err) {
      setError(err.message || "Could not save recipe. Check your backend and database.");
    }
  }

  function editRecipe(recipe) {
    setForm({
      name: recipe.name,
      category: recipe.category,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      cookingTime: String(recipe.cookingTime)
    });

    setEditingId(recipe._id);
    setSelected(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteRecipe(id) {
    if (!window.confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete recipe.");
      }

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      setSelected(null);
      await loadRecipes();
    } catch (err) {
      setError(err.message || "Could not delete recipe.");
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <span className="eyebrow">YOUR PERSONAL COLLECTION</span>
          <h1>My Recipe Book <span>🍲</span></h1>
          <p>Good food, treasured recipes, happy memories.</p>
        </div>
      </header>

      <main className="container">
        <section className="form-card">
          <h2>{editingId ? "✏️ Edit Recipe" : "＋ Add a Recipe"}</h2>

          <form onSubmit={handleSubmit}>
            <label>
              Recipe Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Kerala Vegetable Stew"
                required
              />
            </label>

            <label>
              Category
              <select name="category" value={form.category} onChange={handleChange}>
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Dessert</option>
                <option>Snack</option>
                <option>Drinks</option>
              </select>
            </label>

            <label>
              Cooking Time (minutes)
              <input
                name="cookingTime"
                type="number"
                min="1"
                step="1"
                value={form.cookingTime}
                onChange={handleChange}
                placeholder="30"
                required
              />
            </label>

            <label>
              Ingredients
              <textarea
                name="ingredients"
                value={form.ingredients}
                onChange={handleChange}
                placeholder="Enter ingredients"
                required
              />
            </label>

            <label>
              Preparation Steps
              <textarea
                name="steps"
                value={form.steps}
                onChange={handleChange}
                placeholder="Describe the preparation steps"
                required
              />
            </label>

            <div className="form-actions">
              <button className="primary" type="submit">
                {editingId ? "Save Changes" : "＋ Add Recipe"}
              </button>

              {editingId && (
                <button
                  className="secondary"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {error && <p role="alert" style={{ color: "#b53d3d" }}>{error}</p>}
        </section>

        <section className="recipes-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FROM YOUR KITCHEN</span>
              <h2>Your Recipes</h2>
            </div>
            <span className="count">{recipes.length} recipes</span>
          </div>

          {loading ? (
            <p>Loading recipes...</p>
          ) : recipes.length === 0 ? (
            <div className="empty">
              <span>🥗</span>
              <h3>Your recipe collection starts here</h3>
              <p>Add your first recipe using the form above.</p>
            </div>
          ) : (
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <article className="recipe-card" key={recipe._id}>
                  <div className="recipe-emoji">🍽️</div>
                  <span className="category">{recipe.category}</span>
                  <h3>{recipe.name}</h3>
                  <p>⏱ {recipe.cookingTime} minutes</p>

                  <button className="primary" onClick={() => setSelected(recipe)}>
                    View Recipe
                  </button>

                  <div className="card-actions">
                    <button onClick={() => editRecipe(recipe)}>Edit</button>
                    <button className="delete" onClick={() => deleteRecipe(recipe._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <section className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>✕</button>
            <span className="category">{selected.category}</span>
            <h2>{selected.name}</h2>
            <p>⏱ Cooking time: {selected.cookingTime} minutes</p>
            <h3>Ingredients</h3>
            <p className="recipe-text">{selected.ingredients}</p>
            <h3>Preparation Steps</h3>
            <p className="recipe-text">{selected.steps}</p>
            <button className="primary" onClick={() => editRecipe(selected)}>
              Edit Recipe
            </button>
          </section>
        </div>
      )}

      <footer>Made with ❤️ for food lovers</footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
