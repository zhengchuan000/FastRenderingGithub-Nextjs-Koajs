import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunkMiddleware from 'redux-thunk'

import axios from 'axios'

export const SET_USER_INFO = 'SET_USER_INFO'
export const SET_LOADING = 'SET_LOADING'
export const FOCUS_REPO = 'FOCUS_REPO'
export const LOGOUT = 'LOGOUT'

const initialGlobalState = {
  user: {},
  focusedRepos: [],
}

// REDUCERS
export const reducer = (state = initialGlobalState, action) => {
  switch (action.type) {
    case SET_USER_INFO:
      return Object.assign({}, state, {
        user: action.data,
      })
    case FOCUS_REPO:
      return Object.assign({}, state, {
        focusedRepos: [state.focusedRepos, action.repo],
      })
    case LOGOUT:
      return Object.assign({}, state, {
        user: {},
      })
    default:
      return state
  }
}

// ACTIONS
export function logout() {
  return dispatch => {
    axios.post('/logout').then(resp => {
      if (resp.status === 200) {
        dispatch({ type: LOGOUT })
      }
    })
  }
}

export function setUserInfo(data) {
  return {
    type: SET_USER_INFO,
    data,
  }
}

export function toggleLoading(flag) {
  return {
    type: SET_LOADING,
    flag,
  }
}

export function focusRepo(repo) {
  return {
    type: FOCUS_REPO,
    repo,
  }
}

let store

export function initializeStore(initialState) {
  store = createStore(
    reducer,
    // 保证所有顶级对象都存在
    Object.assign({}, initialGlobalState, initialState),
    composeWithDevTools(applyMiddleware(thunkMiddleware)),
  )
  return store
}

export function getStore() {
  return store
}
