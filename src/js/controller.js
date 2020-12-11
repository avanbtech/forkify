import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchview from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';

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
        bookmarksView.update(model.state.bookmarks);

        // 1) Loading recipe
        await model.loadRecipe(id);

        // 2) Rendering recipe
        recipeView.render(model.state.recipe);
      
    } catch (err) {
        recipeView.renderError();
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
    // Add or remove bookmark
    if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
    else model.deleteBookmark(model.state.recipe.id);

    // Update recipe view
    recipeView.update(model.state.recipe);

    // Render bookmark
    bookmarksView.render(model.state.bookmarks);
}

const init = function() {
    recipeView.addHandlerRender(controlRecipes);
    recipeView.addHandlerUpdateServing(controlServings);
    recipeView.addHandlerAddBookmark(controlAddBookmark);
    searchview.addHandlerSearch(controlSearchResults);
    paginationView.addHandlerClick(controlPagination);    
}

init();