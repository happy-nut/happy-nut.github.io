import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Link } from 'gatsby'
import React from 'react'

import LogoIcon from '../../../../../assets/images/logo.svg'
import { useLatestPostPath } from '../../../hooks/useLatestPost'

const PREFIX = 'MainHeader';

const classes = {
  icon: `${PREFIX}-icon`,
  logoText: `${PREFIX}-logoText`,
  tilButton: `${PREFIX}-tilButton`
};

const StyledBox = styled(Box)((
  {
    theme
  }
) => ({
  [`& .${classes.icon}`]: {
    width: 48,
    height: 48,
    [theme.breakpoints.only('sm')]: {
      width: 36,
      height: 36
    },
    [theme.breakpoints.only('xs')]: {
      width: 32,
      height: 32
    }
  },

  [`& .${classes.logoText}`]: {
    color: theme.palette._green['500'],
    borderColor: theme.palette._green['500'],
    [theme.breakpoints.only('xs')]: {
      fontSize: '0.9rem'
    }
  },

  [`& .${classes.tilButton}`]: {
    color: theme.palette._green['500'],
    borderColor: theme.palette._green['500']
  }
}));

const MainHeader: React.FC = () => {

  const latestPostPath = useLatestPostPath()

  return (
    <StyledBox display="flex" alignItems="center" justifyContent="space-between" py={2}>
      <Link to="/">
        <Box display="flex" alignItems="center">
          <Box className={classes.icon}>
            <LogoIcon />
          </Box>
          <Typography className={classes.logoText} variant="button">happy-nut</Typography>
        </Box>
      </Link>
      <Link to={latestPostPath}>
        <Button variant="outlined" className={classes.tilButton}>
          <Typography variant="button" className={classes.logoText}>Today I Learned</Typography>
        </Button>
      </Link>
    </StyledBox>
  );
}

export default MainHeader
