import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE } from './config.js';
import { getJSON } from './helpers.js';

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultPerPage: RES_PER_PAGE,
    },
    bookmarks: [],
}

export const loadRecipe = async function(id) {

    try {
        const data = await getJSON(`${API_URL}/${id}`);
        
        const {recipe} = data.data;
        state.recipe = {
            id: recipe.id,
            title: recipe.title,
            publisher: recipe.publisher,
            sourceUrl: recipe.source_url,
            image: recipe.image_url,
            servings: recipe.servings,
            cookingTime: recipe.cooking_time,
            ingredients: recipe.ingredients
        };
        if (state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true;
            else state.recipe.bookmarked = false;

      console.log(state.recipe);
    } catch(err) {
        throw err;
    }
};

export const loadSearchResults = async function(query) {
    try{
        state.search.query = query;
        const data = await getJSON(`${API_URL}?search=${query}`);
        console.log(data);

        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                sourceUrl: rec.source_url,
                image: rec.image_url
            };
        });

    } catch (err) {
        throw err;
    }
};

export const getSearchResultPage = function(page = state.search.page) {
    state.search.page = page;

    const start =  (page - 1) * state.search.resultPerPage;
    const end = page * state.search.resultPerPage;

    return state.search.results.slice(start, end);
}

export const updateServings = function(newServing) {
    state.recipe.ingredients.forEach(ing => {
        // newQt = oldQt * newServings / oldServings
        ing.quantity = ing.quantity * newServing / state.recipe.servings;
    });

    state.recipe.servings = newServing;
}

const persistBookmark = function() {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmark = function (recipe) {
    // Add bookmark
    state.bookmarks.push(recipe);

    // Mark current recipe as bookmark
    if (state.recipe.id === recipe.id) state.recipe.bookmarked = true;

    persistBookmark();
}

export const deleteBookmark = function (id) {
    // Delete bookmark
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);

    // Mark current recipe as NOT bookmark
    if (state.recipe.id === id) state.recipe.bookmarked = false;

    persistBookmark();
}

const init = function() {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
}

init();

const clearBookmarks = function () {
    localStorage.clear('bookmarks');
}

export const uploadRecipe = async function (newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe).filter(
            entry => entry[0].startsWith('ingredient') && entry[1] !== ''
        ).map(ing => {
            const ingArr = ing[1].replaceAll(' ', '').split(',');
            if (ingArr.length !== 3) throw new Error(
                'Wrong ingredient format. Please use the correct format'
            );

            const [quantity, unit, description] = ingArr;
            return { quantity: quantity ? +quantity : null, unit, description };
        });
        console.log(ingredients);
    } catch (err) {
        throw err;
    }


}