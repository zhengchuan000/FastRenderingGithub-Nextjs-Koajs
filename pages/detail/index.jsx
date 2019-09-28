// import MarkdownIt from 'markdown-it'
import dynamic from 'next/dynamic'

import withDetail from '../../components/with-detail'

import { getRepoReadme } from '../../lib/model'

// const md = new MarkdownIt()

// import MdRenderer from '../../components/md-renderer'

const MdRenderer = dynamic(import('../../components/md-renderer'))

function DetailIndex({ readme }) {
  // console.log(readme)

  return (
    // <div>
    //   <div dangerouslySetInnerHTML={{ __html: readme }} />
    // </div>
    <MdRenderer content={readme} isBase64={true} />
  )
}

// function b64_to_utf8(str) {
//   return decodeURIComponent(escape(atob(str)))
// }

DetailIndex.getInitialProps = async function(ctx) {
  const { owner, name } = ctx.query

  const readmeObj = await getRepoReadme(`${owner}/${name}`)

  return {
    readme: readmeObj.content,
  }

  // return {
  //   readme: md.render(readmeObj.content ? b64_to_utf8(readmeObj.content) : ''),
  // }
}

export default withDetail(DetailIndex)
