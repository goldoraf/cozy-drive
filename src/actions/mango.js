/**
  Mango index related features (cozy-stack)
**/

import cozy from 'cozy-client-js'

import {
  INDEX_FILES_BY_DATE,
  INDEX_FILES_BY_DATE_SUCCESS,
  FILE_DOCTYPE
} from './constants'

// Mango: Index files by date (create if not existing) and get its informations
export const indexFilesByDate = () => {
  return async dispatch => {
    dispatch({ type: INDEX_FILES_BY_DATE })
    const fields = [ 'class', 'created_at' ]
    await cozy.defineIndex(FILE_DOCTYPE, fields)
    .then((mangoIndexByDate) => {
      dispatch({
        type: INDEX_FILES_BY_DATE_SUCCESS,
        mangoIndexByDate
      })
    })
  }
}
