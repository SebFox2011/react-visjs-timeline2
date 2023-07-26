import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import difference from 'lodash/difference'
import intersection from 'lodash/intersection'
import each from 'lodash/each'
import assign from 'lodash/assign'
import omit from 'lodash/omit'
import keys from 'lodash/keys'
import vis from 'vis/dist/vis-timeline-graph2d.min'
import 'vis/dist/vis-timeline-graph2d.min.css'

const noop = function () {}

const events = [
  'currentTimeTick',
  'click',
  'contextmenu',
  'doubleClick',
  'groupDragged',
  'changed',
  'rangechange',
  'rangechanged',
  'select',
  'timechange',
  'timechanged',
  'mouseOver',
  'mouseMove',
  'itemover',
  'itemout',
]

const eventPropTypes = {}
const eventDefaultProps = {}

events.forEach((event) => {
  eventPropTypes[event] = PropTypes.func
  eventDefaultProps[`${event}Handler`] = noop
})

const Timeline = ({
  items,
  groups,
  options,
  selection,
  selectionOptions = {},
  customTimes,
  animate = true,
  currentTime,
}) => {
  console.log(
    items,
    groups,
    options,
    selection,
    (selectionOptions = {}),
    customTimes,
    (animate = true),
    currentTime
  )
  const containerRef = useRef('')
  console.log('container Ref1 ', containerRef)
  const [timeline, setTimeline] = useState()
  const [customTimesState, setCustomTimesState] = useState({})

  useEffect(() => {
    //timelineContainer = containerRef.current
    console.log('timelineContainer: ', containerRef.current)
    const initTimeline = () => {
      const timelineOptions = animate ? omit(options, 'start', 'end') : options

      const timelineInstance = new vis.Timeline(
        containerRef.current,
        undefined,
        timelineOptions
      )
      console.log('timelineInstance', timelineInstance)
      events.forEach((event) => {
        timelineInstance.on(event, eventDefaultProps[`${event}Handler`])
      })

      if (animate) {
        timelineInstance.setWindow(options.start, options.end, {
          animation: animate,
        })
      }

      timelineInstance.setOptions(timelineOptions)

      if (groups.length > 0) {
        const groupsDataset = new vis.DataSet()
        groupsDataset.add(groups)
        timelineInstance.setGroups(groupsDataset)
      }

      timelineInstance.setItems(items)
      timelineInstance.setSelection(selection, selectionOptions)

      if (currentTime) {
        timelineInstance.setCurrentTime(currentTime)
      }

      return timelineInstance
    }

    const timelineInstance = initTimeline()
    setTimeline(timelineInstance)

    return () => {
      if (timelineInstance) {
        timelineInstance.destroy()
      }
    }
  }, [animate, currentTime, groups, items, options, selection])

  useEffect(() => {
    if (timeline) {
      const customTimeKeysPrev = keys(customTimesState)
      const customTimeKeysNew = keys(customTimes)
      const customTimeKeysToAdd = difference(
        customTimeKeysNew,
        customTimeKeysPrev
      )
      const customTimeKeysToRemove = difference(
        customTimeKeysPrev,
        customTimeKeysNew
      )
      const customTimeKeysToUpdate = intersection(
        customTimeKeysPrev,
        customTimeKeysNew
      )

      each(customTimeKeysToRemove, (id) => timeline.removeCustomTime(id))
      each(customTimeKeysToAdd, (id) => {
        const datetime = customTimes[id]
        timeline.addCustomTime(datetime, id)
      })
      each(customTimeKeysToUpdate, (id) => {
        const datetime = customTimes[id]
        timeline.setCustomTime(datetime, id)
      })

      setCustomTimesState(customTimes)
    }
  }, [customTimes, timeline, customTimesState])

  return <div ref={containerRef} />
}

Timeline.propTypes = assign(
  {
    items: PropTypes.array,
    groups: PropTypes.array,
    options: PropTypes.object,
    selection: PropTypes.array,
    customTimes: PropTypes.shape({
      datetime: PropTypes.instanceOf(Date),
      id: PropTypes.string,
    }),
    animate: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    currentTime: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
      PropTypes.number,
    ]),
  },
  eventPropTypes
)

Timeline.defaultProps = assign(
  {
    items: [],
    groups: [],
    options: {},
    selection: [],
    customTimes: {},
  },
  eventDefaultProps
)

export default Timeline
