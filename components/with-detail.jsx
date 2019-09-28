// import { get as getRepo, cache as cacheRepo } from '../lib/repos-cache'

import Link from 'next/link'
import { withRouter } from 'next/router'

import { getRepoBasic } from '../lib/model'

import Repo from './Repo'

function makeQuery(queryObj) {
  const query = Object.entries(queryObj)
    .reduce((result, entry) => {
      result.push(entry.join('='))
      return result
    }, [])
    .join('&')
  return `?${query}`
}

export default (Comp, type = 'index') => {
  function Detail({ pageData, basic, router }) {
    const query = makeQuery(router.query)
    return (
      <div className="root">
        <div className="repo-basic">
          <Repo repo={basic} />
          <div className="tabs">
            <Link href={`/detail${query}`}>
              <a className={`tab ${type === 'index' ? 'active' : ''}`}>
                Readme
              </a>
            </Link>
            <Link href={`/detail/issues${query}`}>
              <a className={`tab ${type === 'issues' ? 'active' : ''}`}>
                Issues
              </a>
            </Link>
            {/* <Link href={`/detail/releases${query}`}>
              <a className={`tab ${type === 'releases' ? 'active' : ''}`}>
                Releases
              </a>
            </Link> */}
          </div>
        </div>
        <div>
          <Comp {...pageData} basic={basic} />
        </div>
        <style jsx>{`
          .root {
            padding-top: 20px;
          }
          .repo-basic {
            padding: 20px;
            border: 1px solid #eee;
            margin-bottom: 20px;
            border-radius: 5px;
          }
          .tab + .tab {
            margin-left: 20px;
          }
          .tab.active {
            color: #777;
            cursor: default;
          }
        `}</style>
      </div>
    )
  }

  Detail.getInitialProps = async function(ctx) {
    // console.log('++++++++++', ctx)
    const { owner, name } = ctx.query

    const fullName = `${owner}/${name}`

    let repoBasic = await getRepoBasic(fullName)

    // console.log('detail:', fullName, repoBasic)

    // if (repoBasic) {
    //   return {
    //     basic: repoBasic,
    //   }
    // }

    // repoBasic = await axios.get(`https://api.github.com/repos/${owner}/${name}`)
    // if (repoBasic.status === 200) {
    //   cacheRepo(repoBasic.data)
    // }

    let pageData
    if (Comp.getInitialProps) {
      pageData = await Comp.getInitialProps(ctx)
    }

    // console.log('---------------', repoBasic)

    return {
      basic: repoBasic,
      pageData,
    }
  }

  return withRouter(Detail)
}
