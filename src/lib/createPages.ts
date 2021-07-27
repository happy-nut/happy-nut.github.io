import path from 'path'

import { CreatePagesArgs } from 'gatsby'

import { TIL_DIR_NAME } from '../app/hooks/constants'
import _ from 'lodash'

const IMAGES_REGEX = /[^(\s|")]+\.(png|jpeg|jpg|gif|bmp)/g

export async function createPages ({ actions, graphql }: CreatePagesArgs): Promise<void> {
  const { createPage } = actions
  const { data, errors } = await graphql(`
    {
      allMdx {
        nodes {
          body
          tableOfContents
          slug
        }
      }
      allFile(filter: {extension: {regex: "/md|mdx/"}}) {
        nodes {
          modifiedTime
          birthTime
          relativePath
        }
      }
    }
  `)

  if (errors) {
    throw errors
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const filesMap = _.groupBy(data.allFile.nodes, (node) => {
    const split = node.relativePath.split(".")
    return split[0]
  })

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  data.allMdx.nodes.forEach((node) => {
    const postPaths = node.slug.split('/')
    const postName = postPaths[postPaths.length - 1]
    const matchedFile = _.first(filesMap[node.slug])

    createPage({
      path: `/${TIL_DIR_NAME}/${node.slug}`,
      component: path.resolve(__dirname, '../app/pages/TilPage/index.tsx'),
      context: {
        body: node.body,
        toc: node.tableOfContents,
        name: postName,
        images: node.body.match(IMAGES_REGEX) || [],
        modifiedAt: matchedFile.modifiedTime,
        createdAt: matchedFile.birthTime
      }
    })
  })
}
