import React from 'react'
import Router from 'next/router'
import { Provider } from 'react-redux'
import App, { Container } from 'next/app'

import 'antd/dist/antd.css'

import withReduxStore from '../lib/with-redux'

import Layout from '../components/Layout'
import PageLoading from '../components/PageLoading'

// const isServer = typeof window === 'undefined'

class MyApp extends App {
  state = {
    loading: false,
  }

  componentDidMount() {
    Router.events.on('routeChangeStart', this.startLoading)
    Router.events.on('routeChangeComplete', this.stopLoading)
    Router.events.on('routeChangeError', this.stopLoading)
  }

  componentWillUnmount() {
    Router.events.off('routeChangeStart', this.startLoading)
    Router.events.off('routeChangeComplete', this.stopLoading)
    Router.events.off('routeChangeError', this.stopLoading)
  }

  startLoading = () => {
    this.toggleLoading(true)
  }

  stopLoading = () => {
    this.toggleLoading(false)
  }

  toggleLoading(flag) {
    this.setState({
      loading: flag,
    })
  }

  render() {
    const { Component, pageProps, reduxStore } = this.props
    const { loading } = this.state

    return (
      <Container>
        <Provider store={reduxStore}>
          {loading ? <PageLoading /> : null}
          <Layout dispatch={reduxStore.dispatch}>
            <Component {...pageProps} />
          </Layout>
        </Provider>
      </Container>
    )
  }
}

export default withReduxStore(MyApp)
