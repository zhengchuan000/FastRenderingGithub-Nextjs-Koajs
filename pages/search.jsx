import React, { useState } from 'react'
import { List, Col, Row, Pagination } from 'antd'
import { withRouter } from 'next/router'

import axios from 'axios'
import Link from 'next/link'

import Repo from '../components/Repo'
// import { cache as cacheRepos } from '../lib/repos-cache'

import { cacheBasicList } from '../lib/model'

const LANGUAGES = ['JavaScript', 'HTML', 'CSS', 'TypeScript', 'Java', 'Rust']
const SORT_TYPES = [
  {
    name: 'Best match',
  },
  {
    name: 'Most stars',
    value: 'stars',
    order: 'desc',
  },
  {
    name: 'Fewest stars',
    value: 'stars',
    order: 'asc',
  },
  {
    name: 'Most forks',
    value: 'forks',
    order: 'desc',
  },
  {
    name: 'Fewest forks',
    value: 'forks',
    order: 'asc',
  },
]

function FilterLink({ name, query, lang, sort, order, page }) {
  let href = `/search?query=${query}`
  if (lang) {
    href += `&lang=${lang}`
  }
  if (sort) {
    href += `&sort=${sort}&order=${order || 'desc'}`
  }
  if (page) {
    href += `&page=${page}`
  }

  // 分页组件的原始节点是一个a标签，为了防止出现 `<a> in </a>`
  // 这里对于是ReactElement的节点我们直接进行渲染，不再包裹一个 <a>
  return (
    <Link href={href}>{React.isValidElement(name) ? name : <a>{name}</a>}</Link>
  )
}

const selectedItemStyle = {
  borderLeft: '2px solid #e36209',
  fontWeight: 100,
}

// 传递给分页组件，指定来cuurent必须要传递`onChange`，但在这里我们没必要这么做
function noop() {}

function Search({ repos, router }) {
  // 除了通过分页跳转之外，其他所有方式都将page清空
  const { page, ...querys } = router.query
  const { lang, sort, order } = router.query

  // console.log(repos)
  return (
    <div className="root">
      <Row gutter={20}>
        <Col span={6}>
          <List
            bordered
            header={<span className="list-header">语言</span>}
            style={{ marginBottom: 20 }}
            dataSource={LANGUAGES}
            renderItem={item => {
              const selected = lang === item.toLowerCase()

              return (
                <List.Item style={selected ? selectedItemStyle : null}>
                  {selected ? (
                    <span>{item}</span>
                  ) : (
                    <FilterLink
                      {...querys}
                      name={item}
                      lang={item.toLowerCase()}
                    />
                  )}
                </List.Item>
              )
            }}
          />
          <List
            header={<span className="list-header">排序</span>}
            bordered
            dataSource={SORT_TYPES}
            renderItem={item => {
              let selected = false
              if (item.name === 'Best match' && !sort) {
                selected = true
              } else if (item.value === sort && item.order === order) {
                selected = true
              }

              return (
                <List.Item style={selected ? selectedItemStyle : null}>
                  {selected ? (
                    <span>{item.name}</span>
                  ) : (
                    <FilterLink
                      {...querys}
                      sort={item.value}
                      order={item.order}
                      name={item.name}
                    />
                  )}
                </List.Item>
              )
            }}
          />
        </Col>
        <Col span={18}>
          <h3 className="repos-title">{repos.total_count} 个仓库</h3>
          {repos.items.map(repo => (
            <Repo repo={repo} key={repo.id} />
          ))}
          <div className="pagination">
            <Pagination
              pageSize={20}
              current={Number(page) || 1}
              total={repos.total_count}
              onChange={noop}
              itemRender={(page, type, ol) => {
                const p =
                  type === 'page' ? page : type === 'prev' ? page - 1 : page + 1
                const name = type === 'page' ? page : ol
                return <FilterLink {...querys} page={p} name={name} />
              }}
            />
          </div>
        </Col>
      </Row>
      <style jsx>{`
        .root {
          padding: 20px 0;
        }
        .list-header {
          font-weight: 800;
          font-size: 16px;
        }
        .repos-title {
          border-bottom: 1px solid #eee;
          font-size: 24px;
          line-height: 50px;
        }
        .pagination {
          padding: 20px;
          text-align: center;
        }
      `}</style>
    </div>
  )
}

Search.getInitialProps = async function(ctx) {
  const { query, sort, lang, order, page } = ctx.query
  // console.log('------', query)

  if (!query) {
    return {
      repos: {
        total_count: 0,
      },
    }
  }

  let queryString = `?q=${query}`
  if (lang) queryString += `+language:${lang}`
  if (sort) queryString += `&sort=${sort}&order=${order || 'desc'}`
  if (page) queryString += `&page=${page}`

  const { status, data } = await axios.get(
    `https://api.github.com/search/repositories${queryString}`,
  )
  // console.log(status, data)
  if (status === 200) {
    // cacheRepos(data.items)
    cacheBasicList(data.items)
    return {
      repos: data,
    }
  }
}

export default withRouter(Search)
