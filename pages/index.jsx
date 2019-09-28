import axios from 'axios'
import { connect } from 'react-redux'
import { Button, Tabs, Icon } from 'antd'

import Repo from '../components/Repo'

import { getUserRepos } from '../lib/model'

import { getStore } from '../store'

// import { Input } from 'antd'

function Index({ user, userRepos, starredRepos }) {
  // console.log(user)
  if (!user || !user.id) {
    return (
      <div className="root">
        <p>亲，你还没有登录哦～</p>
        <Button type="primary" href={process.env.GITHUB_AUTH_URI}>
          点击登录
        </Button>
        <style jsx>{`
          .root {
            height: 400px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
        `}</style>
      </div>
    )
  }

  // console.log(repos)

  return (
    <div className="root">
      <div className="user-info">
        <img src={user.avatar_url} alt="" className="avatar" />
        <span className="login">{user.login}</span>
        <span className="name">{user.name}</span>
        <span className="bio">{user.bio}</span>
        <p className="mail">
          <Icon type="mail" style={{ marginRight: 10 }} />
          <a href={`mailto:${user.email}`}>{user.email}</a>
        </p>
      </div>
      <div className="user-repos">
        {/* <div>
              {userRepos.map(repo => (
                <Repo repo={repo} key={repo.id} />
              ))}
            </div> */}
        <Tabs defaultActiveKey="1" animated={false}>
          <Tabs.TabPane tab="你的仓库" key="1">
            <div>
              {userRepos.map(repo => (
                <Repo repo={repo} key={repo.id} />
              ))}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="你关注的仓库" key="2">
            <div>
              {starredRepos.map(repo => (
                <Repo repo={repo} key={repo.id} />
              ))}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
      <style jsx>
        {`
          .root {
            display: flex;
            align-items: flex-start;
            padding: 20px 0;
          }
          .user-info {
            width: 200px;
            margin-right: 40px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
          }
          .login {
            font-weight: 800;
            font-size: 20px;
            margin-top: 20px;
          }
          .name {
            font-size: 16px;
            color: #777;
          }
          .bio {
            margin-top: 20px;
            color: #333;
          }
          .avatar {
            width: 100%;
            border-radius: 5px;
          }
          .user-repos {
            flex-grow: 1;
          }
        `}
      </style>
    </div>
  )
}

const isServer = typeof window === 'undefined'

const API_BASE = process.env.API_BASE + '/github'

Index.getInitialProps = async function(ctx) {
  // console.log(ctx.req)
  const store = getStore()

  const user = store.getState().user

  if (user && user.id) {
    let headers = {}

    if (isServer) {
      headers['cookie'] = ctx.req.headers.cookie
    }

    try {
      // const [userRepos, userStarredRepos] = await Promise.all([
      //   axios({
      //     method: 'GET',
      //     url: `${API_BASE}/user/repos`,
      //     headers,
      //   }),
      //   axios({
      //     method: 'GET',
      //     url: `${API_BASE}/user/starred`,
      //     headers,
      //   }),
      // ])

      const { userRepos, starredRepos } = await getUserRepos(headers)

      return {
        starredRepos: starredRepos,
        userRepos: userRepos,
      }
    } catch (err) {
      console.error('---------------', err.message)
      return {
        starredRepos: [],
        userRepos: [],
      }
    }

    // cacheBasicList(userRepos.data)
    // cacheBasicList(userStarredRepos.data)
  } else {
    return {
      starredRepos: [],
      userRepos: [],
    }
  }
}

export default connect(function mapState(state) {
  return {
    user: state.user,
    focusedRepos: state.config,
  }
})(Index)
