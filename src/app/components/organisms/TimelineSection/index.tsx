import { Typography } from '@material-ui/core'
import Box from '@material-ui/core/Box'
import makeStyles from '@material-ui/core/styles/makeStyles'
import React, { useEffect, useState } from 'react'

import './timeline/timeline.css'

const TIMELINE_EMBED_ID = 'timeline-embed'

export const useStyles = makeStyles((theme) => ({
  title: {
    marginTop: theme.spacing(12),
    fontSize: '3rem',
    whiteSpace: 'pre-line',
    wordBreak: 'keep-all',
    fontWeight: 'bold',
    [theme.breakpoints.only('sm')]: {
      fontSize: '2.5rem',
      marginTop: theme.spacing(8)
    },
    [theme.breakpoints.only('xs')]: {
      fontSize: '2rem',
      marginTop: theme.spacing(6)
    }
  },
  subtitle: {
    whiteSpace: 'pre-line',
    wordBreak: 'keep-all',
    fontSize: '1.7rem',
    fontWeight: 'bold',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(10),
    [theme.breakpoints.only('sm')]: {
      fontSize: '1.3rem'
    },
    [theme.breakpoints.only('xs')]: {
      marginBottom: theme.spacing(0),
      fontSize: '1.1rem'
    }
  },
  timelineContainer: {
    padding: theme.spacing(5),
    height: '60vh',
    [theme.breakpoints.only('xs')]: {
      height: '80vh'
    }
  }
}))

const initTimeline = (source): void => {
  const options = {
    source,
    // eslint-disable-next-line @typescript-eslint/camelcase
    initial_zoom: 3,
    // eslint-disable-next-line @typescript-eslint/camelcase
    start_at_end: true,
    dragging: false,
    language: 'ko'
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  // eslint-disable-next-line no-undef
  window.timeline = new TL.Timeline(TIMELINE_EMBED_ID, source, options)
}

const TimelineSection: React.FC = () => {
  const classes = useStyles()
  const [timeline, setTimeline] = useState()

  useEffect(() => {
    const fetchTimeline = async (): Promise<void> => {
      const timelineJson = await require('./timeline/timeline.json')
      setTimeline(timelineJson)
      initTimeline(timelineJson)
    }

    fetchTimeline()
  }, [timeline])

  return (
    <Box height="100vh">
      <Box display="flex" justifyContent="center">
        <Typography variant="h1" className={classes.title}>😎 Experiences</Typography>
      </Box>
      <Box display="flex" justifyContent="center">
        <Typography variant="subtitle1" className={classes.subtitle} align='center'>
          저는 이런 경험들을 쌓아왔습니다.
        </Typography>
      </Box>
      <div className={classes.timelineContainer}>
        <div id={TIMELINE_EMBED_ID} />
      </div>
    </Box>
  )
}

export default TimelineSection

