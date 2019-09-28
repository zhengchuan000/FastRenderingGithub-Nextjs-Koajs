import React, { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Router, { withRouter } from 'next/router'
import { connect } from 'react-redux'

import { Layout, Menu, Input, Avatar, Tooltip, Icon, Dropdown } from 'antd'

import Container from './Container'

import { logout } from '../store'

const { Header, Content, Footer } = Layout

function MyLayout({ children, user, router: { query }, logout }) {
  const queryText = query ? query.query : ''

  const [search, setSearch] = useState('')

  useEffect(() => {
    if (queryText && !search) {
      setSearch(queryText)
    }
  })

  const handleSearchChange = useCallback(e => {
    setSearch(e.target.value)
  }, [])

  const handleAvatarClick = useCallback(e => {
    e.preventDefault()
  }, [])

  const handleSearch = useCallback(() => {
    Router.push(`/search?query=${search}`)
  })

  const handleLogout = useCallback(() => {
    logout()
  })

  const userDropdown = (
    <Menu>
      <Menu.Item>
        <a href="javascript:void(0)" onClick={handleLogout}>
          登出
        </a>
      </Menu.Item>
    </Menu>
  )

  return (
    <Layout className="layout">
      <Header>
        <Container element={<div className="header-inner" />}>
          <div className="header-left">
            <div className="banner">
              <Link href="/">
                <Icon
                  type="github"
                  style={{
                    color: 'white',
                    fontSize: 40,
                    display: 'block',
                    paddingTop: 10,
                    marginRight: 20,
                  }}
                />
              </Link>
            </div>
            <div style={{ float: 'left' }}>
              <Input.Search
                value={search}
                onChange={handleSearchChange}
                placeholder="仓库搜索"
                onSearch={handleSearch}
              />
            </div>
            {/* <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['2']}
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item key="1">nav 1</Menu.Item>
              <Menu.Item key="2">nav 2</Menu.Item>
              <Menu.Item key="3">nav 3</Menu.Item>
            </Menu> */}
          </div>
          <div className="header-right">
            <div className="user">
              {user && user.id ? (
                <Dropdown overlay={userDropdown}>
                  <a href="/" onClick={handleAvatarClick}>
                    <Avatar size={40} src={user.avatar_url} />
                  </a>
                </Dropdown>
              ) : (
                <Tooltip title="点击进行登录">
                  <a href={process.env.GITHUB_AUTH_URI}>
                    <Avatar size={40} icon="user" />
                  </a>
                </Tooltip>
              )}
            </div>
          </div>
        </Container>
      </Header>
      <Content>
        <div className="content">
          <Container>{children}</Container>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Develop by Jokcy @{' '}
        <a href="mailro:jokcylou@hotmail.com">jokcylou@hotmail.com</a>
      </Footer>
      <style jsx>{`
        .content {
          min-height: 100%;
          background-color: #fff;
        }
        .header-inner {
          display: flex;
          justify-content: space-between;
        }
        .header-left {
          display: flex;
          justify-content: flex-start;
        }
        .header-right {
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
      <style global jsx>{`
        #__next {
          height: 100%;
        }
        .ant-layout {
          height: 100%;
        }
        .ant-layout-header {
          padding-left: 0;
          padding-right: 0;
        }
        .ant-layout-content {
          overflow: auto;
        }
        .layout-main-banner {
          float: left;
        }
      `}</style>
    </Layout>
  )
}

export default connect(
  function mapState(state) {
    return {
      user: state.user,
    }
  },
  function mapActions(dispatch) {
    return {
      logout: () => dispatch(logout()),
    }
  },
)(withRouter(MyLayout))
