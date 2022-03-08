import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography'
import { RouteComponentProps } from '@reach/router'
import { Link } from 'gatsby'
import { PageContext } from 'gatsby/internal'
import React from 'react'
import _ from 'lodash'

import LogoIcon from '../../../../assets/images/logo.svg'
import SEO from '../../components/atoms/SEO'
import Post from '../../components/organisms/Post'
import TilHeader from '../../components/organisms/PostHeader'
import TableOfContents from '../../components/organisms/TableOfContents'
import TilSidebar from '../../components/organisms/TilSidebar'
import TilTemplate from './template'

const PREFIX = 'TilPage';

const classes = {
  logoText: `${PREFIX}-logoText`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
  {
    theme
  }
) => ({
  [`& .${classes.logoText}`]: {
    color: theme.palette._green['500']
  }
}));

interface Props extends RouteComponentProps {
  pageContext: PageContext
}

const TilPage: React.FC<Props> = ({ pageContext }) => {
  const { name, body, toc, images, createdAt, modifiedAt } = pageContext


  return (
    (<Root>
      <SEO description={name} ogImage={_.first(images)} />
      <TilTemplate
        logo={
          <Box>
            <Box width={120} height={120} component={Link} to="/">
              <LogoIcon />
            </Box>
            <Typography className={classes.logoText} variant="button">Today I Learned</Typography>
          </Box>
        }
        header={<TilHeader />}
        sidebar={<TilSidebar />}
        post={<Post mdxContent={body}  createdAt={new Date(createdAt)} modifiedAt={new Date(modifiedAt)}/>}
        toc={<TableOfContents items={toc.items} />}
      />
    </Root>)
  );
}

export default TilPage
