import * as model from './model.js';
import { MODEL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchview from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addrecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// https://forkify-api.herokuapp.com/v2

if (module.hot) {
    module.hot.accept();
}

const controlRecipes = async function() {
    try{
        const id = window.location.hash.slice(1);

        if(!id) return;
        recipeView.renderSpinner();

        // 0) Update results view to mark selected search result
        resultsView.update(model.getSearchResultPage());
        
        // 1) Loading recipe
        await model.loadRecipe(id);
        
        // 2) Rendering recipe
        recipeView.render(model.state.recipe);
        
        // 3) Updating bookmarks view
        bookmarksView.update(model.state.bookmarks);
    } catch (err) {
        recipeView.renderError();
        console.error(err);
    }
};

const controlSearchResults = async function() {
    try {
        // 1) Get search query
        const query = searchview.getQuery();
        if (!query) return;

        // 2) Load search results
        await model.loadSearchResults(query);

        // 3) Render result
        resultsView.render(model.getSearchResultPage(1));

        // 4) Render initial pagination buttons
        paginationView.render(model.state.search);

    } catch (err) {
        console.log(err);
    }
};

const controlPagination = function(goToPage) {
    // Render new results
    resultsView.render(model.getSearchResultPage(goToPage));
    bookmarksView.update(model.state.bookmarks);

    // Render new pagination buttons
    paginationView.render(model.state.search);
}

const controlServings = function(newServings) {
    // Update the recipe servings (in state)
    model.updateServings(newServings);
    
    // Update the recipe view
    recipeView.update(model.state.recipe);
}

const controlAddBookmark = function () {
    // show loading spinner
    addRecipeView.renderSpinner();

    // Add or remove bookmark
    if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
    else model.deleteBookmark(model.state.recipe.id);

    // Update recipe view
    recipeView.update(model.state.recipe);

    // Render bookmark
    bookmarksView.render(model.state.bookmarks);
}

const controlBookarks = function() {
    bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function (newRecipe) {
    try {
        // Upload new recipe data
        await model.uploadRecipe(newRecipe);
        console.log(model.state.recipe);

        // Render recipe
        recipeView.render(model.state.recipe);

        // Display success message
        addRecipeView.renderMessage();

        // Render bookmark view
        bookmarksView.render(model.state.bookmarks);

        // Change id in URL
        window.history.pushState(null, '', `#${model.state.recipe.id}`);

        // Close form window
        setTimeout(function () {
            addRecipeView.toggleWindow();
        }, MODEL_CLOSE_SEC * 1000);

    } catch (err) {
        addRecipeView.renderError(err.message);
    }

}

const init = function() {
    bookmarksView.addHandlerRender(controlBookarks);
    recipeView.addHandlerRender(controlRecipes);
    recipeView.addHandlerUpdateServing(controlServings);
    recipeView.addHandlerAddBookmark(controlAddBookmark);
    searchview.addHandlerSearch(controlSearchResults);
    paginationView.addHandlerClick(controlPagination);    
    addRecipeView.addHandlerUpload(controlAddRecipe);
}

init();

export const uploadRecipe = async function () {

}