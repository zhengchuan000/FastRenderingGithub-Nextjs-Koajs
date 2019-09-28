let REPOS_CACHE = {}

const isDev = process.env.NODE_ENV === 'development'
function logCachedRepos() {
  if (isDev) {
    const entries = Object.entries(REPOS_CACHE)
    console.log(`cached total ${entries.length} repos:`)
    // entries.forEach(repo => console.log(...repo))
    console.log(REPOS_CACHE)
  }
}

export function cache(repos, type = 'basic') {
  // 处理缓存数量

  repos = Array.isArray(repos) ? repos : [repos]

  let fullName
  repos.forEach(repo => {
    fullName = repo.full_name
    if (!REPOS_CACHE[fullName]) {
      REPOS_CACHE[fullName] = {}
    }
    REPOS_CACHE[fullName][type] = repo
  })

  logCachedRepos()
}

export function get(fullName, type = 'basic') {
  const repo = REPOS_CACHE[fullName]

  return repo ? repo[type] : null
}

export function getAllCachedRepos() {
  return REPOS_CACHE
}

export function resetServerRenderRepos(repos) {
  REPOS_CACHE = repos
  logCachedRepos()
}
