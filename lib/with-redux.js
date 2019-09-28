import React from 'react'
import axios from 'axios'

import { initializeStore } from '../store'
// import { getAllCachedRepos, resetServerRenderRepos } from '../lib/repos-cache'

import {
  dump as dumpModel,
  load as loadModel,
  clear as clearModelCache,
} from '../lib/model'

const isServer = typeof window === 'undefined'
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__'

function getOrCreateStore(initialState) {
  // Always make a new store if server, otherwise state is shared between requests
  if (isServer) {
    return initializeStore(initialState)
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = initializeStore(initialState)
  }
  return window[__NEXT_REDUX_STORE__]
}

const API_BASE = process.env.API_BASE

export default App => {
  return class AppWithRedux extends React.Component {
    static async getInitialProps(appContext) {
      // console.log('---------', appContext)
      // Get or Create the store with `undefined` as initialState
      // This allows you to set a custom default initialState
      // const reduxStore = getOrCreateStore()

      let reduxStore
      if (isServer) {
        // 如果是服务端则先清除缓存，因为使用的是同一份缓存对象
        clearModelCache()
        const user =
          appContext.ctx.req.session && appContext.ctx.req.session.user
        let focusedRepos = []

        try {
          focusedRepos = await axios.get(`${API_BASE}/api/user/config`)
        } catch (err) {
          // console.log(err)
          // if (err.response)
        }
        reduxStore = getOrCreateStore({
          user,
          focusedRepos,
        })
      } else {
        reduxStore = getOrCreateStore()
      }

      // Provide the store to getInitialProps of pages
      appContext.ctx.reduxStore = reduxStore

      let appProps = {}
      if (typeof App.getInitialProps === 'function') {
        appProps = await App.getInitialProps(appContext)
      }

      return {
        ...appProps,
        initialReduxState: reduxStore.getState(),
        // cachedRepos: getAllCachedRepos(),
        modelData: dumpModel(),
      }
    }

    constructor(props) {
      super(props)
      this.reduxStore = getOrCreateStore(props.initialReduxState)
      if (!isServer) {
        // resetServerRenderRepos(props.cachedRepos)
        loadModel(props.modelData)
      }
    }

    render() {
      return <App {...this.props} reduxStore={this.reduxStore} />
    }
  }
}
