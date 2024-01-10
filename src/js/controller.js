import * as model from './model.js'
import {MODAL_CLOSE_SEC} from './config.js'
import recipeView from './views/recipeView.js'
import searchView from './views/searchView.js'
import resultsView from './views/resultsView.js'
import paginationView from './views/paginationView.js'
import bookmarksView from './views/bookmarksView.js'
import addRecipeView from './views/addRecipeView.js'



import 'core-js/stable';
import 'regenerator-runtime/runtime';

if(module.hot){
  module.hot.accept()
}

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

//Loading Recipe
const controlRecipes = async function () {
  try {

    //id from hash
    const id=window.location.hash.slice(1)
    if(!id)return

    //Loding spinner
    recipeView.renderSpinner();

    // 0) Update resultsView to mark selected search result
    resultsView.update(model.getSearchResultsPage())
    bookmarksView.update(model.state.bookmarks)

    // 1) Loading Recipe
    await model.loadRecipe(id)
    
    // 2) Rendering recipe
    recipeView.render(model.state.recipe)

  } catch (err) {
    recipeView.renderError()
  }
};

const controlSearchResults=async function(){
  try{
    resultsView.renderSpinner()

    // 1) Get search query
    const query=searchView.getQuery()
    if(!query)return

    // 2) Load serach results
    await model.loadSearchResults(query)

    // 3) Render results
    resultsView.render(model.getSearchResultsPage())

    // Render initial pagination buttons
    paginationView.render(model.state.search)
  }catch(err){
    console.log(err)
  }
}

const controlPagination=function(goToPage){
  console.log(goToPage)
  // 3) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage))

  // Render NEW pagination buttons
  paginationView.render(model.state.search)
}

const controlServings=function(newServings){
  //Update recipe servings (in state)
  model.updateServings(newServings)


  //Update recipe view
  // recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
}

const controlAddBookmark=function(){
  // 1) Add or remove bookmark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe)
  else model.deleteBookmark(model.state.recipe.id)

  // 2)Update recipe view
  recipeView.update(model.state.recipe)

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks=function(){
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe=async function(newRecipe){
  try{
  //Show loading spinner
  addRecipeView.renderSpinner()

    //Upload new recipe data
    await model.uploadRecipe(newRecipe)
    console.log(model.state.recipe)

    //render recipe
    recipeView.render(model.state.recipe)

    //Success message
     addRecipeView.renderMessage()

    //Render Bookmark view
    bookmarksView.render(model.state.bookmarks)

    //Change id in the URL
    window.history.pushState(null,'',`#${model.state.recipe.id}`)

    //Close form window
    setTimeout(function(){
      addRecipeView.toggleWindow()
    },MODAL_CLOSE_SEC*1000)
  }catch(error){
    console.log(error ,'✋✋')
    addRecipeView.renderError(error.message)
  }
}

const init =function(){
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes)
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerAddBokkmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView._addHandlerUpload(controlAddRecipe)
}
init()