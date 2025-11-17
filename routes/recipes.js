const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

// (b) Random Recipe Page Endpoint (/recipes/random)
router.get('/random', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/recipes/random`, {
            params: {
                apiKey: API_KEY,
                number: 1 // Fetch just one random recipe
            }
        });

        // Get the first recipe from the response array
        const recipe = response.data.recipes[0];

        if (!recipe) {
            return res.status(404).json({ error: 'No random recipe found.' });
        }

        // Return simplified JSON as required
        const simplifiedRecipe = {
            title: recipe.title,
            image: recipe.image,
            // Extract ingredients list from the complex 'extendedIngredients' array
            ingredients: recipe.extendedIngredients.map(ing => ing.original),
            // The instructions might be in 'instructions' or 'summary' depending on the data
            instructions: recipe.instructions || recipe.summary 
        };

        res.json(simplifiedRecipe);

    } catch (error) {
        console.error('Error fetching random recipe:', error.message);
        // (Error Handling) Handle API request failure
        res.status(500).json({ error: 'Failed to fetch random recipe from external API.' });
    }
});

// (c) Search Recipes by Ingredients Endpoint (/recipes/search)
router.get('/search', async (req, res) => {
    const { ingredients } = req.query;

    if (!ingredients) {
        // Handle case where ingredients query parameter is missing
        return res.status(400).json({ error: 'Missing ingredients query parameter.' });
    }

    try {
        const response = await axios.get(`${BASE_URL}/recipes/findByIngredients`, {
            params: {
                apiKey: API_KEY,
                ingredients: ingredients, // Comma-separated ingredients from query
                number: 10, // Limit the number of results
                ranking: 1 // Maximize used ingredients
            }
        });

        // (Error Handling) Handle empty search results
        if (response.data.length === 0) {
             return res.json({ message: 'No recipes found for the given ingredients.', recipes: [] });
        }

        // Return simplified JSON array as required
        const simplifiedRecipes = response.data.map(recipe => ({
            title: recipe.title,
            image: recipe.image,
            usedIngredients: recipe.usedIngredients.map(ing => ing.name),
            missedIngredients: recipe.missedIngredients.map(ing => ing.name),
            id: recipe.id // Useful for the Bonus Task
        }));

        res.json(simplifiedRecipes);

    } catch (error) {
        console.error('Error fetching search recipes:', error.message);
        // (Error Handling) Handle API request failure
        res.status(500).json({ error: 'Failed to search recipes from external API.' });
    }
});


// (Bonus Task - Part 1: New Route) Recipe Details Route
router.get('/:id/information', async (req, res) => {
    const { id } = req.params;

    try {
        const response = await axios.get(`${BASE_URL}/recipes/${id}/information`, {
            params: {
                apiKey: API_KEY,
                includeNutrition: false // We only need the required fields
            }
        });

        const recipeInfo = response.data;
        
        // Return required details: Recipe Title, Summary, Cooking time
        const detailedRecipe = {
            title: recipeInfo.title,
            summary: recipeInfo.summary,
            cookingTime: recipeInfo.readyInMinutes // readyInMinutes
        };

        res.json(detailedRecipe);

    } catch (error) {
        console.error(`Error fetching recipe ${id} details:`, error.message);
        res.status(500).json({ error: 'Failed to fetch recipe details.' });
    }
});

module.exports = router;