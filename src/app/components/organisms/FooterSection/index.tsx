import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box'
import { Link } from 'gatsby'
import React from 'react'

const PREFIX = 'FooterSection';

const classes = {
  copyright: `${PREFIX}-copyright`
};

const StyledBox = styled(Box)({
  [`& .${classes.copyright}`]: {
    color: 'white',
    '& :hover': {
      color: 'white'
    }
  }
});

export {};

const FooterSection: React.FC = () => {


  return (
    <StyledBox height="5vh" display="flex" justifyContent="center" alignItems="center" color="white">
      <Link to="https://happy-nut.github.io" className={classes.copyright}>
        <Typography variant="caption">2020 © happy-nut all rights reserved.</Typography>
      </Link>
    </StyledBox>
  );
}

export default FooterSection
