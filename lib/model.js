import LRU from 'lru-cache'
import axios from 'axios'

// import github from '../server/github'

const LRU_OPTIONS = {
  max: 100,
  maxAge: 1000 * 60 * 60, // 1 hour
}

const BASIC_CACHE = new LRU(LRU_OPTIONS)
const README_CACHE = new LRU(LRU_OPTIONS)
const USER_REPOS = new LRU(LRU_OPTIONS)

const GITHUB_BASE_URI = 'https://api.github.com'
// const REPO_BASIC_URL = `https://api.github.com/repos/`
// const REPOR_README_URL = `https://api.github.com/repos/`

const API_BASE = process.env.API_BASE + '/github'

const isDev = process.env.NODE_ENV === 'development'
const isServer = typeof window === 'undefined'
function logCachedRepos() {
  if (isDev && !isServer) {
    const entries = BASIC_CACHE.dump()
    console.log(`cached total ${entries.length} repos:`)
    // entries.forEach(repo => console.log(...repo))
    console.log(entries)
  }
}

export function cacheBasic(fullname, repo) {
  BASIC_CACHE.set(fullname, repo)
}

export function cacheReadme(fullname, readme) {
  README_CACHE.set(fullname, readme)
}

export function cacheBasicList(repos) {
  repos.forEach(repo => {
    cacheBasic(repo.full_name, repo)
  })

  logCachedRepos()
}

export async function getRepoBasic(fullname) {
  let repo = BASIC_CACHE.get(fullname)
  if (repo) {
    return repo
  }
  repo = await axios.get(`${API_BASE}/repos/${fullname}`)
  if (repo.status === 200) {
    cacheBasic(fullname, repo.data)
    return repo.data
  }
}

export async function getRepoReadme(fullname) {
  let readme = README_CACHE.get(fullname)
  if (readme) {
    return readme
  }
  readme = await axios.get(`${API_BASE}/repos/${fullname}/readme`)
  if (readme.status === 200) {
    cacheReadme(fullname, readme.data)
    return readme.data
  }
}

export async function getRepoIssues(fullname, since) {
  let issuesQuery = '?sort=updated'
  if (since) {
    issuesQuery += '&since=${since}'
  }
  const issues = await axios.get(
    `${API_BASE}/repos/${fullname}/issues${issuesQuery}`,
  )
  if (issues.status === 200) {
    return issues.data
  }
}

export async function getUserRepos(headers) {
  if (USER_REPOS.get('repos')) {
    return USER_REPOS.get('repos')
  }

  const [userRepos, userStarredRepos] = await Promise.all([
    axios({
      method: 'GET',
      url: `${API_BASE}/user/repos`,
      headers,
    }),
    axios({
      method: 'GET',
      url: `${API_BASE}/user/starred`,
      headers,
    }),
  ])

  // console.log('-------------------', userRepos.data)

  // cacheBasicList(userRepos.data)
  // cacheBasicList(userStarredRepos.data)

  // USER_REPOS.set('userRepos', userRepos.data)
  // USER_REPOS.set('starredRepos', userStarredRepos.data)

  // console.log('--------------', userRepos.status, userStarredRepos.status)

  const repos = {
    starredRepos: userStarredRepos.data,
    userRepos: userRepos.data,
  }

  USER_REPOS.set('repos', repos)

  return repos

  // return {
  //   starredRepos: userStarredRepos.data,
  //   repos: userRepos.data
  // }
}

export function dump() {
  return {
    basics: BASIC_CACHE.dump(),
    readmes: README_CACHE.dump(),
    userRepos: USER_REPOS.dump(),
  }
}

export function load(data) {
  BASIC_CACHE.load(data.basics)
  README_CACHE.load(data.readmes)
  USER_REPOS.load(data.userRepos)
}

// 因为是同一个module，所以对于每个用户来说服务端读取的缓存都是同一份
// 所以服务端渲染的时候每次都要先清除一下缓存
export function clear() {
  BASIC_CACHE.reset()
  README_CACHE.reset()
  USER_REPOS.reset()
}
