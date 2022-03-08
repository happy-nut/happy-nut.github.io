import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box'
import React from 'react'
import { animated, useTransition } from 'react-spring'

const PREFIX = 'LandingSection';

const classes = {
  title: `${PREFIX}-title`,
  description: `${PREFIX}-description`
};

const StyledBox = styled(Box)((
  {
    theme
  }
) => ({
  [`& .${classes.title}`]: {
    fontSize: '4rem',
    whiteSpace: 'pre-line',
    wordBreak: 'keep-all',
    fontWeight: 'bold',
    willChange: 'transform, opacity',
    [theme.breakpoints.only('sm')]: {
      fontSize: '3rem'
    },
    [theme.breakpoints.only('xs')]: {
      fontSize: '1.8rem'
    }
  },

  [`& .${classes.description}`]: {
    marginTop: theme.spacing(2),
    fontSize: '1.5rem',
    whiteSpace: 'pre-line',
    wordBreak: 'keep-all',
    willChange: 'transform, opacity',
    [theme.breakpoints.only('sm')]: {
      fontSize: '1.2rem'
    },
    [theme.breakpoints.only('xs')]: {
      fontSize: '1rem'
    }
  }
}));

const LandingSection: React.FC = () => {

  const items = [
    {
      value: '반갑습니다!\n개발🧑‍💻과 요리👨‍🍳를 좋아하는\nhappy-nut🥜 입니다.',
      className: classes.title
    },
    {
      value: '저는 어떤 사람일까요? 👇',
      className: classes.description
    }
  ]
  const transitions = useTransition(items, (item) => item.value, {
    from: {
      opacity: 0,
      transform: 'translate3d(0,-140px,0)'
    },
    enter: {
      opacity: 1,
      transform: 'translate3d(0,0px,0)'
    },
    leave: {
      opacity: 0,
      transform: 'translate3d(0,-100px,0)'
    }
  })

  return (
    <StyledBox display="flex" alignItems="center" height="65vh">
      <Box>
        {transitions.map(({ item, props }, index) => (
          <animated.div key={index} style={props}>
            <Typography className={item.className}>{item.value}</Typography>
          </animated.div>
        ))}
      </Box>
    </StyledBox>
  );
}

export default LandingSection
