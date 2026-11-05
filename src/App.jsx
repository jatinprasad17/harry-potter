import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import {
  WandSparkles, Sparkles, Dog, ScrollText, Volume2, Star, Play, Pause, Radio, Lightbulb
} from 'lucide-react'
import InvitationExperience from './InvitationExperience'
import Scrapbook from './Scrapbook'

const MagicScene = lazy(() => import('./MagicScene'))

const years = [
  { year: '2023 · YEAR ONE', title: 'The Sorting Ceremony', text: 'A little Janmashtami magic, a Gryffindor girl, and a hard launch that started our very own Hogwarts story', photo: 'Her Year 1 photo', image: '/assets/Year%201.jpeg' },
  { year: '2024 · YEAR TWO', title: 'Chamber of Giggles', text: 'For a moment, it felt like we were the hero and heroine of our own little Bollywood movie at Solang Valley', photo: 'Her Year 2 photo', image: '/assets/Year-2.jpg' },
  { year: '2025 · YEAR THREE', title: 'The Prisoner of Procrastination', text: 'Running late is her love language. Waiting patiently is mine. After all, some masterpieces are worth the wait.', photo: 'Her Year 3 photo', image: '/assets/Year%203.jpg' },
  { year: '2026 · YEAR FOUR', title: 'The Goblet of Greatness', text: 'Started as two students figuring out college life, ended as two graduates with a lifetime of memories. From Year 1 to Year 4, always grateful we had each other.', photo: 'Her final-year photo', image: '/assets/Year%204.jpeg' },
]

const tracks = [
  { num: '01', title: 'Somebody To You', artist: 'The Vamps ft. Demi Lovato', tag: 'Anthem', videoId: '0go2nfVXFgA' },
  { num: '02', title: 'Can We Dance', artist: 'The Vamps', tag: 'Classic', videoId: 'UqSww10eeKw' },
  { num: '03', title: 'Ranjish Hi Sahi', artist: 'Ali Sethi · Coke Studio Pakistan', tag: 'Ghazal', videoId: 'pba_YmWDAIU' },
  { num: '04', title: 'Arz Kiya Hai', artist: 'Anuv Jain', tag: 'Indie', videoId: 'bP8ATWCvqzw' },
  { num: '05', title: 'Pee Loon', artist: 'Mohit Chauhan', tag: 'Romance', videoId: 'ovR_7R9I_vI' },
]

let youtubeApiPromise

function loadYouTubeIframeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (youtubeApiPromise) return youtubeApiPromise

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === 'function') previousCallback()
      resolve(window.YT)
    }

    let script = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
    if (!script) {
      script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
    }

    script.addEventListener('error', () => {
      window.onYouTubeIframeAPIReady = previousCallback
      youtubeApiPromise = null
      reject(new Error('The YouTube player could not be loaded.'))
    }, { once: true })

    if (!script.isConnected) document.head.appendChild(script)
  })

  return youtubeApiPromise
}

const mapLocations = [
  { ...years[0], id: 'year-one', x: 11, y: 72, mobileX: 50, mobileY: 10, side: 'right', note: 'First steps into the castle' },
  { ...years[1], id: 'year-two', x: 36, y: 26, mobileX: 31, mobileY: 37, side: 'left', note: 'Laughter echoes here' },
  { ...years[2], id: 'year-three', x: 65, y: 69, mobileX: 69, mobileY: 63, side: 'right', note: 'A little late, never forgotten' },
  { ...years[3], id: 'year-four', x: 89, y: 32, mobileX: 43, mobileY: 88, side: 'left', note: 'The next chapter begins' },
]

const SectionHeading = memo(function SectionHeading({ eyebrow, title, subtitle }) {
  return <div className="section-heading reveal">
    <span className="eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    <div className="gold-rule" />
    <p>{subtitle}</p>
  </div>
})

const MapMemoryPhoto = memo(function MapMemoryPhoto({ src, alt, className }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className={`${className} map-photo-fallback`} role="img" aria-label={`${alt} unavailable`}>
        <span aria-hidden="true">✧</span>
        <small>Memory photo unavailable</small>
      </div>
    )
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
    />
  )
})

const WizardingWireless = memo(function WizardingWireless() {
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [playbackState, setPlaybackState] = useState('idle')
  const [playbackMessage, setPlaybackMessage] = useState('Choose a record to tune in.')
  const [playerReady, setPlayerReady] = useState(false)
  const playerRef = useRef(null)
  const playerReadyRef = useRef(false)
  const playerMountRef = useRef(null)
  const playerLoadTimeoutRef = useRef(null)
  const pendingTrackRef = useRef(null)
  const selectedTrackRef = useRef(null)
  const mountedRef = useRef(false)

  const createPlayer = (youtube) => {
    if (playerRef.current || !playerMountRef.current) return
    const initialVideoId = pendingTrackRef.current?.videoId
    if (!initialVideoId) return

    playerRef.current = new youtube.Player(playerMountRef.current, {
      width: '320',
      height: '180',
      videoId: initialVideoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        enablejsapi: 1,
        playsinline: 1,
        rel: 0,
        origin: window.location.origin,
        widget_referrer: `${window.location.origin}/`,
      },
      events: {
        onReady: (event) => {
          if (!mountedRef.current) return
          playerRef.current = event.target
          playerReadyRef.current = true
          setPlayerReady(true)
          const pendingTrack = pendingTrackRef.current
          if (playerLoadTimeoutRef.current) clearTimeout(playerLoadTimeoutRef.current)
          if (pendingTrack) {
            playerLoadTimeoutRef.current = setTimeout(() => {
              if (!mountedRef.current || selectedTrackRef.current?.videoId !== pendingTrack.videoId) return
              setPlaybackState('error')
              setPlaybackMessage(`${pendingTrack.title} could not start in the player.`)
            }, 20000)
          }
          if (pendingTrack && pendingTrack.videoId !== initialVideoId) {
            event.target.loadVideoById(pendingTrack.videoId)
          }
        },
        onStateChange: (event) => {
          if (!mountedRef.current) return
          const currentTrack = selectedTrackRef.current
          if (!currentTrack) return
          const currentVideoId = event.target.getVideoData().video_id
          if (currentVideoId && currentVideoId !== currentTrack.videoId) return
          if (event.data === youtube.PlayerState.PLAYING) {
            if (playerLoadTimeoutRef.current) clearTimeout(playerLoadTimeoutRef.current)
            setPlaybackState('playing')
            setPlaybackMessage(`Now playing: ${currentTrack.title} — ${currentTrack.artist}`)
          } else if (event.data === youtube.PlayerState.PAUSED) {
            if (playerLoadTimeoutRef.current) clearTimeout(playerLoadTimeoutRef.current)
            setPlaybackState('paused')
            setPlaybackMessage(`Paused: ${currentTrack.title}`)
          } else if (event.data === youtube.PlayerState.BUFFERING) {
            setPlaybackState('loading')
            setPlaybackMessage(`Tuning in to ${currentTrack.title}…`)
          } else if (event.data === youtube.PlayerState.ENDED) {
            if (playerLoadTimeoutRef.current) clearTimeout(playerLoadTimeoutRef.current)
            setPlaybackState('ended')
            setPlaybackMessage(`The record has finished: ${currentTrack.title}`)
          }
        },
        onError: (event) => {
          if (!mountedRef.current) return
          const currentTrack = selectedTrackRef.current
          if (!currentTrack) return
          const currentVideoId = event.target.getVideoData().video_id
          if (currentVideoId && currentVideoId !== currentTrack.videoId) return
          if (playerLoadTimeoutRef.current) clearTimeout(playerLoadTimeoutRef.current)
          setPlaybackState('error')
          setPlaybackMessage(event.data === 153
            ? `YouTube could not verify the player referrer for ${currentTrack.title}. Use the YouTube link below.`
            : `${currentTrack.title} is unavailable or cannot be played here (YouTube error ${event.data}).`)
        },
        onAutoplayBlocked: (event) => {
          const currentTrack = selectedTrackRef.current
          if (!currentTrack) return
          const currentVideoId = event.target.getVideoData().video_id
          if (currentVideoId && currentVideoId !== currentTrack.videoId) return
          if (playerLoadTimeoutRef.current) clearTimeout(playerLoadTimeoutRef.current)
          setPlaybackState('paused')
          setPlaybackMessage('Playback was blocked. Press Play again to tune in.')
        },
      },
    })
  }

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      playerRef.current?.destroy()
      playerRef.current = null
      playerReadyRef.current = false
      if (playerLoadTimeoutRef.current) clearTimeout(playerLoadTimeoutRef.current)
    }
  }, [])

  const loadTrack = (track) => {
    pendingTrackRef.current = track
    selectedTrackRef.current = track
    setSelectedTrack(track.num)
    setPlaybackState('loading')
    setPlaybackMessage(`Tuning in to ${track.title}…`)
    if (playerLoadTimeoutRef.current) clearTimeout(playerLoadTimeoutRef.current)
    playerLoadTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current || selectedTrackRef.current?.videoId !== track.videoId) return
      setPlaybackState('error')
      setPlaybackMessage(`${track.title} could not start in the player.`)
    }, 20000)

    if (playerReadyRef.current && playerRef.current) {
      playerRef.current.loadVideoById(track.videoId)
      return
    }

    loadYouTubeIframeAPI().then((youtube) => {
      if (!mountedRef.current) return
      if (playerReadyRef.current && playerRef.current) {
        playerRef.current.loadVideoById(pendingTrackRef.current.videoId)
      } else {
        createPlayer(youtube)
      }
    }).catch(() => {
      if (!mountedRef.current) return
      if (playerLoadTimeoutRef.current) clearTimeout(playerLoadTimeoutRef.current)
      setPlaybackState('error')
      setPlaybackMessage('The YouTube player could not be loaded. Try again or listen on YouTube.')
    })
  }

  const togglePlayback = () => {
    if (playbackState === 'playing') {
      playerRef.current?.pauseVideo()
      return
    }

    if (selectedTrack === null) return
    if (playbackState === 'error' || playbackState === 'ended') {
      loadTrack(tracks.find((track) => track.num === selectedTrack))
      return
    }

    if (playerReady && playerRef.current) {
      setPlaybackState('loading')
      playerRef.current.playVideo()
    } else {
      loadTrack(tracks.find((track) => track.num === selectedTrack))
    }
  }

  const activeTrack = tracks.find((track) => track.num === selectedTrack)
  const screenCovered = playbackState === 'idle' || playbackState === 'loading' || playbackState === 'error'

  return (
    <div className="wireless-card reveal">
      <div className="wireless-header">
        <div><Radio size={20} /><span>WIZARDING WIRELESS NETWORK</span></div>
        <small><i /> ON AIR · THE REQUEST HOUR</small>
      </div>
      <div className="radio-console">
        <div className="radio-brand"><span>WIZARDING WIRELESS</span><small>EST. 1927 · GRYFFINDOR BROADCAST</small></div>
        <div className="radio-face">
          <div className="radio-speaker"><span /><span /><span /><span /><span /><span /></div>
          <div className="radio-frequency">
            <div className="frequency-labels"><span>AM</span><span>FM</span><span>MAGIC</span></div>
            <div className="frequency-scale"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="frequency-needle" />
            <div className="frequency-glow" />
            <small>88　92　96　100　104　108 MHz</small>
          </div>
          <div className="radio-knobs"><i /><i /><i /></div>
        </div>
        <div className="radio-listening-window">
          <div className={`radio-player-frame${screenCovered ? ' screen-covered' : ''}`}>
            <div className="radio-player-mount" ref={playerMountRef} />
            {screenCovered && (
              <div className="radio-screen-overlay" aria-live="polite">
                {playbackState === 'loading' ? <span className="radio-loading-sigil" aria-hidden="true">✦</span> : <Radio size={22} aria-hidden="true" />}
                <span>{playbackState === 'loading' ? 'TUNING IN…' : playbackState === 'error' ? 'SIGNAL LOST' : 'SELECT A RECORD'}</span>
              </div>
            )}
          </div>
          <div className="radio-now-playing">
            <div>
              <small>NOW PLAYING</small>
              <strong>{activeTrack ? activeTrack.title : 'The wireless is waiting'}</strong>
              <span>{activeTrack ? activeTrack.artist : 'Choose a song from the playlist'}</span>
            </div>
            <button
              className="radio-control-button"
              type="button"
              onClick={togglePlayback}
              disabled={!activeTrack || playbackState === 'loading'}
              aria-label={playbackState === 'playing' ? 'Pause current song' : 'Play current song'}
            >
              {playbackState === 'playing' ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
              <span>{playbackState === 'playing' ? 'PAUSE' : 'PLAY'}</span>
            </button>
          </div>
        </div>
        <div className="radio-bottom"><span>✦ TUNE IN TO THE MAGIC ✦</span><i /><i /><i /><i /><i /><i /><span>VOL · TUNE · BAND</span></div>
      </div>
      <div className="wireless-tracklist">
        {tracks.map((track) => {
          const isSelected = selectedTrack === track.num
          const isPlaying = isSelected && playbackState === 'playing'
          return (
            <div className={`track-row${isSelected ? ' track-row-selected' : ''}${isPlaying ? ' track-row-playing' : ''}`} key={track.num}>
              <span className="track-num">{track.num}</span>
              <div className="track-description">
                <strong>{track.title}</strong><small>{track.artist}</small>
                {isPlaying && <span className="track-equalizer" aria-label="Playing"><i /><i /><i /><i /></span>}
              </div>
              <span className="track-tag">{track.tag}</span>
              <button
                className="track-play-button"
                type="button"
                onClick={() => isPlaying ? togglePlayback() : isSelected && playbackState === 'paused' ? togglePlayback() : loadTrack(track)}
                aria-label={`${isPlaying ? 'Pause' : 'Play'} ${track.title} by ${track.artist}`}
                aria-pressed={isPlaying}
                title={`${isPlaying ? 'Pause' : 'Play'} ${track.title}`}
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              </button>
            </div>
          )
        })}
      </div>
      <div className="playlist-footer"><Volume2 size={17} /><span aria-live="polite">{playbackMessage}</span><span>✦</span></div>
      {playbackState === 'error' && activeTrack && (
        <p className="radio-fallback">
          <a href={`https://www.youtube.com/watch?v=${activeTrack.videoId}`} target="_blank" rel="noreferrer">
            Open {activeTrack.title} on YouTube
          </a>
        </p>
      )}
    </div>
  )
})

const MaraudersMapArtwork = memo(function MaraudersMapArtwork({ reduceMotion }) {
  const mapPaths = (
    <>
      <path className="map-route-shadow" d="M110 360 C170 330 210 135 360 130 S535 350 650 345 S795 120 890 160" />
      <path className="map-route" d="M110 360 C170 330 210 135 360 130 S535 350 650 345 S795 120 890 160" />
      <path className="map-route-dash" d="M110 360 C170 330 210 135 360 130 S535 350 650 345 S795 120 890 160" />
    </>
  )

  const mobileMapPaths = (
    <>
      <path className="map-route-shadow" d="M150 70 C256 115 56 198 93 255 S255 344 207 440 S37 550 129 630" />
      <path className="map-route" d="M150 70 C256 115 56 198 93 255 S255 344 207 440 S37 550 129 630" />
      <path className="map-route-dash" d="M150 70 C256 115 56 198 93 255 S255 344 207 440 S37 550 129 630" />
    </>
  )

  const footprints = (pathId) => (
    <g className="map-footsteps">
      <ellipse cx="-4" cy="-2" rx="3.1" ry="5.2" transform="rotate(-24 -4 -2)" />
      <ellipse cx="4" cy="3" rx="3.1" ry="5.2" transform="rotate(24 4 3)" />
      <circle cx="7.5" cy="-1" r="1.25" />
      <circle cx="6" cy="-3.2" r="1.15" />
      <circle cx="4.3" cy="-3.5" r="1" />
      <animateMotion dur="24s" repeatCount="indefinite" rotate="auto">
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </g>
  )

  return (
    <>
      <div className="map-ornament map-ornament-one" aria-hidden="true">Mischief<br />Managed</div>
      <div className="map-ornament map-ornament-two" aria-hidden="true">By moonlight<br />and memory</div>
      <svg className="map-route-svg desktop-route" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
        <path id="map-trail-desktop" d="M110 360 C170 330 210 135 360 130 S535 350 650 345 S795 120 890 160" className="map-motion-guide" />
        {mapPaths}
        {!reduceMotion && footprints('map-trail-desktop')}
      </svg>
      <svg className="map-route-svg mobile-route" viewBox="0 0 300 700" preserveAspectRatio="none" aria-hidden="true">
        <path id="map-trail-mobile" d="M150 70 C256 115 56 198 93 255 S255 344 207 440 S37 550 129 630" className="map-motion-guide" />
        {mobileMapPaths}
        {!reduceMotion && footprints('map-trail-mobile')}
      </svg>
      <span className="map-rose map-rose-one" aria-hidden="true">✧</span>
      <span className="map-rose map-rose-two" aria-hidden="true">✦</span>
    </>
  )
})

const MapLocation = memo(function MapLocation({
  location,
  index,
  isActive,
  isSelected,
  onHover,
  onLeave,
  onSelect,
}) {
  const handleHover = useCallback(() => onHover(location.id), [location.id, onHover])
  const handleLeave = useCallback(() => onLeave(location.id), [location.id, onLeave])
  const handleSelect = useCallback(() => onSelect(location.id), [location.id, onSelect])

  return (
    <button
      className={`map-location map-location-${index + 1}${isActive ? ' is-lit' : ''}${isSelected ? ' is-selected' : ''}`}
      style={{
        '--map-x': `${location.x}%`,
        '--map-y': `${location.y}%`,
        '--map-x-mobile': `${location.mobileX}%`,
        '--map-y-mobile': `${location.mobileY}%`,
      }}
      type="button"
      aria-expanded={isSelected}
      aria-controls="map-memory-card"
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
      onFocus={handleHover}
      onBlur={handleLeave}
      onClick={handleSelect}
    >
      <span className="map-location-dot" aria-hidden="true"><span>{String(index + 1).padStart(2, '0')}</span></span>
      <span className={`map-location-label map-label-${location.side}`}>
        <small>{location.year.split('·')[0].trim()}</small>
        <strong>{location.title}</strong>
      </span>
      <span className="sr-only">{location.year}: {location.title}. {location.note}. Click to open its memory card.</span>
    </button>
  )
})

const MaraudersMap = memo(function MaraudersMap() {
  const [selectedId, setSelectedId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)
  const reduceMotion = useReducedMotion()
  const activeId = selectedId ?? hoveredId
  const activeMemory = mapLocations.find((item) => item.id === selectedId)
  const handleHover = useCallback((id) => setHoveredId(id), [])
  const handleLeave = useCallback((id) => {
    setHoveredId((current) => current === id ? null : current)
  }, [])
  const handleSelect = useCallback((id) => {
    setSelectedId((current) => current === id ? null : id)
  }, [])

  return (
    <div className="marauders-map-shell">
      <div className="map-caption">
        <span>HOGWARTS GROUNDS · FOUR YEARS OF MAGIC</span>
        <span className="map-compass" aria-hidden="true">✦<small>N</small></span>
      </div>
      <div className="marauders-map">
        <MaraudersMapArtwork reduceMotion={reduceMotion} />
        {mapLocations.map((location, index) => {
          const isActive = activeId === location.id
          const isSelected = selectedId === location.id
          return (
            <MapLocation
              key={location.id}
              location={location}
              index={index}
              isActive={isActive}
              isSelected={isSelected}
              onHover={handleHover}
              onLeave={handleLeave}
              onSelect={handleSelect}
            />
          )
        })}
      </div>
      <p className="map-instruction">Follow the golden trail. Choose a year to uncover its chapter.</p>
      <AnimatePresence initial={false}>
        {activeMemory && (
          <motion.article
            className="map-memory-card"
            id="map-memory-card"
            key={activeMemory.id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scaleY: .97, y: -8, rotateX: -12, transformOrigin: 'top' }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scaleY: 1, y: 0, rotateX: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scaleY: .97, y: -8, rotateX: -8 }}
            transition={{ duration: reduceMotion ? 0 : .58, ease: [.22, 1, .36, 1] }}
          >
            <button
              className="map-memory-close"
              type="button"
              aria-label="Close memory card"
              onClick={() => setSelectedId(null)}
            >
              ×
            </button>
            <div className="map-memory-copy">
              <span className="map-memory-year">{activeMemory.year}</span>
              <h3>{activeMemory.title}</h3>
              <p>{activeMemory.text}</p>
              <span className="map-handwritten">{activeMemory.note}</span>
            </div>
            <div className="map-photo-frame">
              <MapMemoryPhoto
                className="map-photo-image"
                src={activeMemory.image}
                alt={`${activeMemory.photo}, ${activeMemory.year}`}
              />
              <span className="map-photo-caption">MEMORY NO. 0{mapLocations.indexOf(activeMemory) + 1}</span>
            </div>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  )
})

function loadPatronusVideo(video) {
  if (video.src) return
  video.src = video.dataset.src
  video.load()
}

const PatronusExperience = memo(function PatronusExperience() {
  const videoRef = useRef(null)
  const stageRef = useRef(null)
  const [hasCast, setHasCast] = useState(false)
  const [castId, setCastId] = useState(0)
  const [playbackError, setPlaybackError] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const stage = stageRef.current
    const video = videoRef.current
    if (!stage || !video) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
      if (!entry.isIntersecting) video.pause()
    }, { threshold: 0.01 })
    const preloadObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      loadPatronusVideo(video)
      preloadObserver.disconnect()
    }, { rootMargin: '200px 0px' })
    const pauseWhenHidden = () => {
      if (document.hidden) video.pause()
    }

    observer.observe(stage)
    preloadObserver.observe(stage)
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => {
      observer.disconnect()
      preloadObserver.disconnect()
      document.removeEventListener('visibilitychange', pauseWhenHidden)
      video.pause()
    }
  }, [])

  const castPatronus = async () => {
    const video = videoRef.current
    if (!video) {
      setPlaybackError('The Patronus video could not be found.')
      return
    }

    loadPatronusVideo(video)
    if (video.currentTime > 0) video.currentTime = 0
    setHasCast(true)
    setCastId((id) => id + 1)
    setPlaybackError('')

    try {
      await video.play()
    } catch (error) {
      setPlaybackError('The Patronus video could not be played. Please try again.')
      console.error('Unable to play the Patronus video:', error)
    }
  }

  return (
    <div className={`patronus-card reveal is-visible${hasCast && isVisible ? ' is-summoned' : ''}`}>
      <div ref={stageRef} className="patronus-stage" role="group" aria-label="Patronus visual panel">
        <video
          ref={videoRef}
          className="patronus-video"
          data-src="/assets/patronus-video.mp4"
          muted
          playsInline
          preload="metadata"
          onEnded={() => videoRef.current?.pause()}
          aria-label="A silver-blue Golden Retriever Patronus"
        />
        <div className={`patronus-video-particles${hasCast && isVisible ? ' is-active' : ''}`} aria-hidden="true">
          {[
            [8, 24], [17, 72], [25, 16], [34, 86], [43, 31], [51, 67], [59, 12],
            [68, 79], [76, 27], [84, 61], [92, 18], [13, 48], [39, 55], [72, 46],
          ].map(([left, top], index) => (
            <i key={index} style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * -0.23}s` }} />
          ))}
        </div>
        {castId > 0 && <div key={castId} className="patronus-video-flash" aria-hidden="true" />}
      </div>
      <span className="eyebrow"><Dog size={15} /> THE PROTECTOR</span>
      <h3>The Golden Retriever Patronus</h3>
      <p>Bright-eyed, full of warmth, impossible not to love, and instantly distracted by every dog in a 5-kilometre radius. A Patronus with a heart bigger than the Great Hall.</p>
      <button
        className="patronus-spell"
        type="button"
        onClick={castPatronus}
        aria-pressed={hasCast}
      >
        <Sparkles size={16} />
        {hasCast ? 'Cast Again ✨' : 'पितृदेव संरक्षकणम् ✨'}
      </button>
      {playbackError && <p className="patronus-playback-error" role="alert">{playbackError}</p>}
      <div className="patronus-stars" aria-hidden="true">✦　✧　✦</div>
    </div>
  )
})

const MirrorExperience = memo(function MirrorExperience() {
  const [phase, setPhase] = useState('idle')
  const [revealId, setRevealId] = useState(0)
  const [hasRevealed, setHasRevealed] = useState(false)
  const [messageVisible, setMessageVisible] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (phase === 'swirling') {
      const timer = window.setTimeout(() => setPhase('flash'), reduceMotion ? 0 : 900)
      return () => window.clearTimeout(timer)
    }
    if (phase === 'flash') {
      const timer = window.setTimeout(() => setPhase('clearing'), reduceMotion ? 0 : 240)
      return () => window.clearTimeout(timer)
    }
    if (phase === 'clearing') {
      const timer = window.setTimeout(() => {
        setPhase('revealed')
        setHasRevealed(true)
        setMessageVisible(true)
      }, reduceMotion ? 0 : 850)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [phase, reduceMotion, revealId])

  const revealMemory = () => {
    setRevealId((id) => id + 1)
    setMessageVisible(false)
    setPhase('swirling')
  }

  const revealed = phase === 'revealed'

  return (
    <div className={`mirror-card reveal is-visible${hasRevealed ? ' mirror-revealed' : ''}${phase !== 'idle' && phase !== 'revealed' ? ' mirror-animating' : ''}`}>
      <div className="mirror-arch">
        <div className="mirror-topper" aria-hidden="true"><span>✦</span><i /><span>✦</span></div>
        <span className="mirror-engraving mirror-engraving-left" aria-hidden="true">❧</span>
        <span className="mirror-engraving mirror-engraving-right" aria-hidden="true">❧</span>
        <button
          className="mirror-shine"
          type="button"
          onClick={revealMemory}
          aria-expanded={revealed}
          aria-label={revealed ? 'Look into the Mirror of Erised again' : 'Reveal What Matters'}
        >
          <span
            className={`mirror-mist${phase === 'swirling' ? ' is-swirling' : ''}${phase === 'clearing' || revealed ? ' is-clearing' : ''}`}
            key={revealId}
            aria-hidden="true"
          />
          <span className="mirror-glass-glint" aria-hidden="true" />
          <AnimatePresence>
            {phase === 'flash' && (
              <motion.span
                className="mirror-flash"
                key={revealId}
                initial={{ opacity: 0, scale: .82 }}
                animate={{ opacity: [0, .95, 0], scale: [0.82, 1.08, 1.3] }}
                transition={{ duration: reduceMotion ? 0 : .24, times: [0, .35, 1] }}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
          <div className="mirror-sparkles" aria-hidden="true">
            {[['14%', '25%'], ['81%', '19%'], ['23%', '72%'], ['76%', '77%'], ['53%', '12%'], ['89%', '49%']].map(([left, top], index) => (
              <motion.i
                key={`${revealId}-${index}`}
                style={{ left, top }}
                animate={reduceMotion ? { opacity: .45 } : { opacity: [.12, .8, .2], y: [0, -7, 2] }}
                transition={reduceMotion ? { duration: 0 } : { duration: 2.8 + index * .15, delay: index * .18, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            {revealed ? (
              <motion.span
                className="mirror-memory"
                key="memory"
                initial={reduceMotion ? { opacity: 0, scale: 1 } : { opacity: 0, y: 15, scale: .94, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, scale: reduceMotion ? 1 : 1.04, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: reduceMotion ? 0 : 1.25, ease: [.2, .75, .22, 1] }}
              >
                <img
                  className="mirror-memory-photo"
                  src="/assets/our-best-picture.jpeg"
                  alt="Our favourite picture together by a waterfall"
                  decoding="async"
                />
                <strong>Our happiest moment, held in the mirror</strong>
                <span>"I show not your face but your heart's desire"</span>
              </motion.span>
            ) : (
              <motion.span
                className="mirror-invitation"
                key="invitation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : .7 }}
              >
                <Sparkles size={24} />
                <strong>Look into the mirror</strong>
                <span>A little magic is waiting to show you our greatest treasure.</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <div className="mirror-base-ornament" aria-hidden="true">✧</div>
      </div>
      <button className="mirror-reveal-button" type="button" onClick={revealMemory}>
        <Sparkles size={16} />
        {hasRevealed ? 'Look Again ✨' : 'Reveal What Matters'}
      </button>
      <motion.p
        className="mirror-caption"
        initial={false}
        animate={{ opacity: messageVisible ? 1 : 0, y: messageVisible ? 0 : 4 }}
        transition={{ duration: reduceMotion ? 0 : .65 }}
        aria-live="polite"
      >
        The Mirror of Erised shows what the heart holds closest. Ours is every moment together.
      </motion.p>
    </div>
  )
})

function FinaleBurst({ celebrationId, reducedMotion }) {
  if (!celebrationId) return null

  return (
    <div className="celebration-burst" key={celebrationId} aria-hidden="true">
      {Array.from({ length: 48 }, (_, index) => {
        const angle = (index / 48) * Math.PI * 2
        const distance = 90 + ((index * 37) % 190)
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance - 55
        return (
          <i
            className={`celebration-particle celebration-particle-${index % 3}`}
            key={`${celebrationId}-${index}`}
            style={{
              '--burst-x': `${x}px`,
              '--burst-y': `${y}px`,
              '--burst-delay': `${(index % 12) * 0.025}s`,
              '--burst-duration': reducedMotion ? '0ms' : `${850 + (index % 7) * 90}ms`,
            }}
          >
            {index % 3 === 0 ? '✦' : ''}
          </i>
        )
      })}
    </div>
  )
}

function App() {
  const [letterOpen, setLetterOpen] = useState(true)
  const [wishMade, setWishMade] = useState(false)
  const [candlesLit, setCandlesLit] = useState(true)
  const [lumosActive, setLumosActive] = useState(false)
  const [celebrationId, setCelebrationId] = useState(0)
  const reduceMotion = useReducedMotion()
  const letterTriggerRef = useRef(null)
  const letterCloseRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-in-view', entry.isIntersecting)
      })
    }, { rootMargin: '100px 0px' })
    const sections = document.querySelectorAll('main > section')
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!letterOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setLetterOpen(false)
      if (event.key === 'Tab' && letterCloseRef.current) {
        const dialog = letterCloseRef.current.closest('[role="dialog"]')
        const focusableElements = dialog?.querySelectorAll('button:not(:disabled)')
        if (!focusableElements?.length) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    requestAnimationFrame(() => letterCloseRef.current?.focus())

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
      letterTriggerRef.current?.focus()
    }
  }, [letterOpen])

  const makeWish = () => {
    setWishMade(true)
    setCandlesLit(false)
    setCelebrationId((id) => id + 1)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    for (let i = 0; i < 75; i++) {
      const bit = document.createElement('i')
      bit.className = 'confetti'
      bit.style.left = `${Math.random() * 100}vw`
      bit.style.animationDelay = `${Math.random() * 0.8}s`
      bit.style.background = ['#f4d781', '#fff2c2', '#d2a84e', '#9b7131'][i % 4]
      document.body.appendChild(bit)
      window.setTimeout(() => bit.remove(), 4200)
    }

  }

  const toggleLumos = () => {
    const activating = !lumosActive
    setLumosActive(activating)
    if (activating) setCandlesLit(true)
  }

  return (
    <div className="app-shell">
      <div className="ambient-glow glow-one" />
      <div className="ambient-glow glow-two" />

      <main>
        <section className="hero" id="top">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={14} /> Hogwarts School of Witchcraft and Wizardry</div>
            <h1>A little magic<br /><em>for Vanshika</em></h1>
            <p className="hero-subtitle">An owl has travelled a very long way to find you.</p>
            <div className="hero-actions">
              <button className="gold-button" ref={letterTriggerRef} onClick={() => setLetterOpen(true)}><ScrollText size={16} /> {letterOpen ? 'Your letter is open' : 'Open your letter'}</button>
            </div>
            <div className="hero-meta"><span><Star size={13} fill="currentColor" /> GRYFFINDOR</span><span>✦</span><span>23 YEARS OF MAGIC</span></div>
          </div>
          <div className="hero-art">
            <div className="orb-halo" />
            <Suspense fallback={<div className="scene-fallback" aria-hidden="true" />}>
              {!letterOpen && <MagicScene />}
            </Suspense>
            <div className="floating-note note-top">✧ A birthday spell ✧</div>
            <div className="floating-note note-bottom">Est. in the stars</div>
          </div>
          <div className="hero-scroll">SCROLL TO DISCOVER <span /></div>
        </section>

        <nav className="quick-nav" aria-label="Quick navigation">
          <a href="#years">The Map</a>
          <a href="#prophet">The Prophet</a>
          <a href="#patronus">Patronus</a>
          <a href="#wireless">Wireless</a>
          <a href="#memories">Memories</a>
          <a href="#mirror">The Mirror</a>
        </nav>

        <AnimatePresence>
          {letterOpen && <InvitationExperience onClose={() => setLetterOpen(false)} closeButtonRef={letterCloseRef} />}
        </AnimatePresence>

        <section className="section years-section" id="years">
          <SectionHeading eyebrow="THE MARAUDER'S MAP" title="Four Years at Hogwarts" subtitle="Four chapters. One very unforgettable witch." />
          <MaraudersMap />
        </section>

        <section className="section prophet-section" id="prophet">
          <SectionHeading eyebrow="EXTRA! EXTRA!" title="The Daily Prophet" subtitle="Today's top story: a local legend turns 23." />
          <article className="prophet-paper reveal">
            <div className="newspaper-ink" aria-hidden="true">
              <i /><i /><i /><i /><i /><i />
            </div>
            <div className="paper-masthead"><span>HOGWARTS EDITION</span><span>THE WIZARDING WORLD'S DAILY</span><span>23 GALLEONS</span></div>
            <h3>THE DAILY PROPHET</h3>
            <div className="paper-subtitle">The wizarding world's most trusted source of mildly dramatic news</div>
            <div className="prophet-content">
              <div className="wanted-frame">
                <div className="wanted-label">✦ WANTED · MAGICAL PORTRAIT ✦</div>
                <div className="wanted-photo">
                  <img className="moving-portrait" src="/assets/azkaban_mugshot.gif" alt="Vanshika's magical moving wanted portrait" loading="lazy" decoding="async" />
                  <span className="photo-glint" aria-hidden="true" />
                </div>
                <div className="wanted-caption">MISS BONDHI · WANTED FOR EXCESSIVE CHARM</div>
                <p className="portrait-caption">A moving photograph, captured by the Daily Prophet.</p>
              </div>
              <div className="prophet-story">
                <span className="story-kicker">BREAKING · HOGWARTS</span>
                <h4>VANSHIKA TURNS 23: GRYFFINDOR WITCH DEFIES TIME, ACES EXAMS OVERNIGHT AND CONTINUES TO CHARM THE ENTIRE CASTLE</h4>
                <p><strong>HOGWARTS —</strong>Witnesses report that Miss Vanshika Sharma, famously known as Bondhi, has once again demonstrated an extraordinary ability to operate entirely outside the laws of time.</p>
                <p>Despite possessing absolutely no sense of urgency, sources confirm she can take several hours to get ready, arrive fashionably late and still somehow look like the main character. Experts remain baffled by how anyone can be this eepy and this effortlessly charming.</p>
                <p>Academic authorities are equally confused. Reports suggest that she requires approximately one night of preparation before examinations, only to emerge the following morning with top grades. The Ministry of Magic has launched an investigation into this suspicious academic phenomenon.</p>
                <p>But her talents don't end there. The castle has witnessed unprecedented levels of dance energy, while her flute performances have left even the most experienced wizards spellbound. Close friends describe her as "a brilliant dancer, a magical flutist, a professional procrastinator and a certified sleepyhead."</p>
                <p>The castle advises all residents to exercise caution and be aware of my smol kitten: prolonged exposure to her smile may result in permanent attachment.</p>

              </div>
            </div>
            <div className="prophet-bottom"><span>FLUTE ALERT: BEAUTIFUL MELODIES REPORTED</span><span>ANGY BIRD: ADORABLE, EVEN WHEN FURIOUS</span></div>
          </article>
          <div className="owl-grid">
            {[
              ['ALWAYS HIGH', 'Eepy levels'],
              ['OUTSTANDING', 'Dance floor domination'],
              ['MINISTRY LEVEL EXPERTISE', 'Procrastination'],
              ['NON EXISTENT', 'Sense of urgency'],
              ['AWW', 'Being a dog person'],
              ['BAAD ME ', 'Bachpan se Bondhi thi ya Baad me Bani?'],
            ].map(([grade, skill]) => <div className="owl-card" key={skill}><span>{grade}</span><p>{skill}</p></div>)}
          </div>
        </section>

        <section className="section patronus-section" id="patronus">
          <SectionHeading eyebrow="EXPECTO PATRONUM" title="Her Patronus" subtitle="A little magic that feels just like her." />
          <PatronusExperience />
        </section>

        <section className="section wireless-section" id="wireless">
          <SectionHeading eyebrow="TUNE IN · TUNE OUT THE MUGGLES" title="Wizarding Wireless" subtitle="The soundtrack to a Gryffindor kind of life." />
          <WizardingWireless />
        </section>

        <section className="section scrapbook-section" id="memories">
          <SectionHeading eyebrow="A KEEPSAKE FROM THE CASTLE" title="Down the Memory Lane" subtitle="Little moments, endless memories, and a story worth keeping." />
          <Scrapbook />
        </section>

        <section className="section mirror-section" id="mirror">
          <SectionHeading eyebrow="A WIZARDING WORLD KEEPSAKE" title="The Mirror of Erised" subtitle="Our Best Picture Together Deserves a Separate Frame" />
          <MirrorExperience />
        </section>

        <section className={`final-section${lumosActive ? ' lumos-active' : ''}${wishMade ? ' finale-celebrated' : ''}`} id="finale">
          <div className="finale-backdrop" aria-hidden="true">
            <div className="finale-halo" />
            <svg className="finale-castle" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax meet">
              <path d="M0 300V245h70v-54h34v-73h32V70h25v48h23v73h43v-42h27v-75h29V25h20v49h25v75h42v-38h26v-91h23V0h19v20h19v100h26v55h31v-78h25V42h20v55h22v69h45v-52h25v-81h24V11h18v23h24v97h27v69h41v-39h25v-59h24V57h20v38h25v81h43v-56h26v-61h24v63h26v83h62v95z" />
            </svg>
          </div>
          <FinaleBurst celebrationId={celebrationId} reducedMotion={reduceMotion} />
          <div className="finale-content">
            <div className="final-stars">✦　✧　✦　✧　✦</div>
            <span className="eyebrow">A BIRTHDAY SPELL, JUST FOR YOU</span>
            <h2>Make a Wish,<br /><em>Vanshika</em></h2>
            <p>One more trip around the sun. A whole universe of magic ahead.</p>
            <button className="gold-button wish-button" onClick={makeWish}><WandSparkles size={17} /> {wishMade ? 'Wish sent to the universe!' : 'Cast your birthday spell'}</button>
            {wishMade && (
              <motion.div
                className="wish-message"
                role="status"
                aria-live="polite"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 22, scale: .88, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: reduceMotion ? 0 : 1.15, ease: [.16, 1, .3, 1] }}
              >
                <Sparkles /> HAPPY 23rd BIRTHDAY, VANSHIKA!
                <span>May your next chapter be full of magic, laughter and dogs. ❤️</span>
              </motion.div>
            )}
            <button
              className={`cake-illustration${candlesLit ? '' : ' cake-blown'}`}
              type="button"
              onClick={makeWish}
              aria-label={candlesLit ? 'Blow out the birthday candles' : 'Candles are out. Click to celebrate again.'}
              aria-pressed={!candlesLit}
            >
              <span className="cake-ambient-glow" />
              <span className="cake-candles" aria-hidden="true">
                {[1, 2, 3].map((candle) => (
                  <i className="cake-candle" key={candle} style={{ '--candle-index': candle }}>
                    <i className="cake-flame" />
                    <i className="cake-wick" />
                  </i>
                ))}
              </span>
              <span className="cake-upper-tier"><i className="frosting-drip" /><i className="cake-berry berry-one" /><i className="cake-berry berry-two" /><i className="cake-berry berry-three" /></span>
              <span className="cake-lower-tier"><i className="frosting-drip" /><i className="cake-piping" /><i className="cake-piping cake-piping-bottom" /></span>
              <span className="cake-plate" />
              <span className="cake-shadow" />
            </button>
            <button
              className={`lumos-button${lumosActive ? ' lumos-button-active' : ''}`}
              type="button"
              onClick={toggleLumos}
              aria-pressed={lumosActive}
            >
              <Lightbulb size={17} />
              {lumosActive ? 'Nox · Dim the magic' : 'Lumos Maxima'}
              <span className="lumos-rune" aria-hidden="true">✦</span>
            </button>
            <p className="cake-instruction">Tap the cake to send your wish skyward.</p>
          </div>
        </section>
      </main>
      <footer><span>✦</span> Made with a little magic, a lot of affection, and one very special Gryffindor. <span>✦</span></footer>
    </div>
  )
}

export default App