import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import React from 'react'
import {useSpring } from 'react-spring'

const PREFIX = 'TilCard';

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  description: `${PREFIX}-description`,
  contentContainer: `${PREFIX}-contentContainer`,
  media: `${PREFIX}-media`
};

const Root = styled('animated.div')((
  {
    theme
  }
) => ({
  [`& .${classes.root}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    height: '30%',
    cursor: 'pointer'
  },

  [`& .${classes.title}`]: {
    '-webkit-line-clamp': 1,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    whiteSpace: 'pre-line',
    marginBottom: theme.spacing(2)
  },

  [`& .${classes.description}`]: {
    '-webkit-line-clamp': 3,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    whiteSpace: 'pre-line',
    [theme.breakpoints.only('xs')]: {
      '-webkit-line-clamp': 1
    }
  },

  [`& .${classes.contentContainer}`]: {
    width: '48%'
  },

  [`& .${classes.media}`]: {
    width: '50%',
    clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)'
  }
}));

export {};

const calc = (x, y): number[] => {
  return [-(y - window.innerHeight / 2) / 20, (x - window.innerWidth / 2) / 20, 1.05]
}

const trans = (x, y, s): string => {
  return `perspective(600px) scale(${s})`
}

interface Props {
  title: string
  description: string
  mediaImg: string
}

const TilCard: React.FC<Props> = ({ title, description, mediaImg }) => {

  const [props, set] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 1, tension: 400, friction: 4 }
  }))

  return (
    <Root
      onMouseMove={({ clientX: x, clientY: y }) => set({ xys: calc(x, y) })}
      onMouseLeave={() => set({ xys: [0, 0, 1] })}
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      style={{ transform: props.xys.interpolate(trans) }}>
      <Card className={classes.root}>
        <Box display="flex" flexDirection="column" className={classes.contentContainer}>
          <CardContent>
            <Typography variant="h3" className={classes.title}>{title}</Typography>
            <div className={classes.description}>
              <Typography variant="body1" color="textSecondary">
                {description}
              </Typography>
            </div>
          </CardContent>
        </Box>
        <CardMedia
          className={classes.media}
          image={mediaImg}
          title={`media: ${title}`}
        />
      </Card>
    </Root>
  );
}

export default TilCard
