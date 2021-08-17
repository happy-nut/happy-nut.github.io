import Box from '@material-ui/core/Box'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { MDXProvider } from '@mdx-js/react'
import AnchorJS from 'anchor-js'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import React, { useEffect } from 'react'

import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/plugins/command-line/prism-command-line.css'
import './command-line.css'
import './custom-highlight.css'
import './custom-codeblock.css'
import './custom-blockquote.css'
import './custom-image.css'
import './custom-table.css'
import './anchor.css'

import { H1, H2, H3, H4, H5, H6, Img, Li, P } from '../../atoms/MdxComponents'
import CommentSection from '../../molecules/CommentSection'

import { Divider } from '@material-ui/core'
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
  paper: {
    width: '100%',
    minHeight: '100vh'
  }
})

const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: P,
  li: Li,
  img: Img
}

export interface PostProps {
  mdxContent: string
  createdAt: Date
  modifiedAt: Date
}

// TODO: 제목도 따로 받도록 해서 날짜랑 이쁘게 정렬하자.
// TODO(poqw): Use path to make hash tags.
const Post: React.FC<PostProps> = ({ mdxContent, createdAt, modifiedAt }) => {
  const classes = useStyles()

  useEffect(() => {
    // TODO(poqw): Use slug instead of anchoring directly.
    // TODO(poqw): Scroll softly: https://www.gatsbyjs.com/plugins/gatsby-plugin-anchor-links/
    const anchors = new AnchorJS()
    anchors.options.placement = 'left'
    anchors.add('#post h1, #post h2, #post h3, #post h4, #post h5, #post h6')
  })

  return (
    <Box id="post" className={classes.paper} pb={12}>
      <Box display="flex" justifyContent="flex-end">
        <Typography variant="caption" align="right">마지막 수정 - {modifiedAt.toDateString()}</Typography>
      </Box>
      <MDXProvider components={components}>
        <MDXRenderer>{mdxContent}</MDXRenderer>
      </MDXProvider>
      <Box mt={10} mb={4}>
        <Divider />
      </Box>
      <CommentSection repo="happy-nut/happy-nut.github.io.comments" />
    </Box>
  )
}

export default Post
