import { useState } from 'react'
// import MarkdownIt from 'markdown-it'
import dynamic from 'next/dynamic'

import { Avatar, Button } from 'antd'

import withDetail from '../../components/with-detail'
import { getRepoIssues } from '../../lib/model'

const MdRenderer = dynamic(import('../../components/md-renderer'))

// const md = new MarkdownIt()

/**
 * issues接口描述在 https://developer.github.com/v3/issues/
 * 但是并没有看到对某个仓库列出issues的方式
 * 在basic中有issues_url，可以通过这个检索
 * 并且所有参数都是可用的
 */

function Label({ label }) {
  return (
    <>
      <span className="label" style={{ backgroundColor: label.color }}>
        {label.name}
      </span>
      <style jsx>{`
        .label {
          display: inline-block;
          line-height: 20px;
        }
        .label + .label {
          margin-left: 10px;
        }
      `}</style>
    </>
  )
}

function IssueDetail({ issue }) {
  function goToGithubIssue() {
    window.open(issue.html_url)
  }

  return (
    <div className="root">
      {/* <div dangerouslySetInnerHTML={{ __html: issue.body }} /> */}
      <MdRenderer content={issue.body} />
      <div className="actions">
        <Button onClick={goToGithubIssue}>打开Issue讨论页面</Button>
      </div>
      <style jsx>{`
        .root {
          background-color: #efefef;
          padding: 20px;
        }
        .actions {
          text-align: right;
        }
      `}</style>
    </div>
  )
}

function IssueItem({ issue }) {
  const [showDetail, setShowDetail] = useState(false)

  function toggleShowDetail() {
    setShowDetail(!showDetail)
  }

  return (
    <div>
      <div className="issue">
        <Button
          type="primary"
          size="small"
          style={{ position: 'absolute', right: 20, top: 10 }}
          onClick={toggleShowDetail}
        >
          {showDetail ? '隐藏内容' : '显示内容'}
        </Button>
        <div className="avatar">
          <Avatar src={issue.user.avatar_url} shape="square" size={50} />
        </div>
        <div className="main-info">
          <h6>
            <span>{issue.title}</span>
            {issue.labels.map(label => (
              <Label key={label.id} label={label} />
            ))}
          </h6>
          <p className="sub-info">
            <span>Updated at {issue.updated_at}</span>
          </p>
        </div>
        <style jsx>{`
          .issue {
            display: flex;
            position: relative;
            padding: 10px;
          }
          .issue:hover {
            background: #fafafa;
          }
          .issue + .issue {
            border-top: 1px solid #eee;
          }
          .main-info > h6 {
            max-width: 600px;
          }
          .avatar {
            margin-right: 20px;
          }
          .main-info > h6 {
            font-size: 16px;
          }
          .sub-info {
            margin-bottom: 0;
          }
          .sub-info > span + span {
            display: inline-block;
            margin-left: 20px;
            font-size: 12px;
          }
        `}</style>
      </div>
      {showDetail ? <IssueDetail issue={issue} /> : null}
    </div>
  )
}

function Issues({ issues }) {
  return (
    <div className="root">
      {issues.map(issue => (
        <IssueItem issue={issue} key={issue.id} />
      ))}
      <style jsx>{`
        .root {
          border: 1px solid #eee;
          border-radius: 5px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  )
}

Issues.getInitialProps = async ctx => {
  const { owner, name } = ctx.query

  const fullname = `${owner}/${name}`

  const issues = await getRepoIssues(fullname)

  return {
    issues,
  }

  // return {
  //   issues: issues.map(issues => {
  //     issues.body = md.render(issues.body)
  //     return issues
  //   }),
  // }
}

export default withDetail(Issues, 'issues')
