import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Volume2, VolumeX, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const letterSegments = [
  { heading: true, text: 'Dear Miss Vanshika,' },
  { text: 'We are delighted to inform you that you have been selected for another extraordinary year of magic, mischief, questionable time management and absolutely legendary dancing.' },
  { text: 'Your place in Gryffindor remains secure. Your wand is ready, your people are cheering, and the castle has saved you the biggest slice of cake.' },
  { signoff: true, text: 'The adventure continues. Happy 23rd Birthday!' },
]
const fullLetterLength = letterSegments.reduce((length, segment) => length + segment.text.length, 0)

const particles = [
  { x: '13%', y: '22%', delay: 0 }, { x: '82%', y: '18%', delay: 1.4 },
  { x: '75%', y: '74%', delay: 2.2 }, { x: '19%', y: '79%', delay: .7 },
  { x: '90%', y: '48%', delay: 1.8 }, { x: '9%', y: '54%', delay: 2.7 },
  { x: '65%', y: '11%', delay: .4 }, { x: '33%', y: '14%', delay: 2.5 },
  { x: '86%', y: '86%', delay: 1.1 }, { x: '25%', y: '89%', delay: 1.9 },
  { x: '51%', y: '7%', delay: 3.2 }, { x: '4%', y: '38%', delay: 1.2 },
]

function playSealChime(audioContextRef) {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return

  const context = audioContextRef.current ?? new AudioContext()
  audioContextRef.current = context
  if (context.state === 'suspended') context.resume()

  const start = context.currentTime
  ;[587.33, 880].forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, start)
    oscillator.frequency.exponentialRampToValueAtTime(frequency * .72, start + .9)
    gain.gain.setValueAtTime(index === 0 ? .045 : .018, start)
    gain.gain.exponentialRampToValueAtTime(.0001, start + 1.15)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + 1.2)
  })
}

function LetterCopy({ characterCount, complete }) {
  let offset = 0

  return (
    <>
      {letterSegments.map((segment) => {
        const start = offset
        offset += segment.text.length
        const text = segment.text.slice(0, Math.max(0, characterCount - start))
        if (!text) return null
        if (segment.heading) return <h2 key={segment.text}>{text}</h2>
        if (segment.signoff) return <p className="invitation-signoff" key={segment.text}>{text}</p>
        return <p key={segment.text}>{text}</p>
      })}
      <span className="sr-only" aria-live="polite">
        {complete ? letterSegments.map((segment) => segment.text).join(' ') : ''}
      </span>
    </>
  )
}

export default function InvitationExperience({ onClose, closeButtonRef }) {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState('sealed')
  const [characterCount, setCharacterCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioContextRef = useRef(null)
  const isSealed = phase === 'sealed'
  const letterVisible = ['unfolding', 'typing', 'revealed'].includes(phase)

  useEffect(() => {
    if (phase === 'cracking') {
      const timer = window.setTimeout(() => setPhase('opening'), reduceMotion ? 0 : 420)
      return () => window.clearTimeout(timer)
    }
    if (phase === 'opening') {
      const timer = window.setTimeout(() => setPhase('emerging'), reduceMotion ? 0 : 760)
      return () => window.clearTimeout(timer)
    }
    if (phase === 'emerging') {
      const timer = window.setTimeout(() => setPhase('unfolding'), reduceMotion ? 0 : 850)
      return () => window.clearTimeout(timer)
    }
    if (phase === 'unfolding') {
      const timer = window.setTimeout(() => setPhase('typing'), reduceMotion ? 0 : 680)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [phase, reduceMotion])

  useEffect(() => {
    if (phase !== 'typing') return undefined
    if (reduceMotion) {
      setCharacterCount(fullLetterLength)
      setPhase('revealed')
      return undefined
    }

    let currentCount = 0
    const interval = window.setInterval(() => {
      currentCount += 1
      setCharacterCount(currentCount)
      if (currentCount >= fullLetterLength) {
        window.clearInterval(interval)
        setPhase('revealed')
      }
    }, 17)
    return () => window.clearInterval(interval)
  }, [phase, reduceMotion])

  useEffect(() => () => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
    }
  }, [])

  const openEnvelope = () => {
    if (!isSealed) return
    if (soundEnabled) playSealChime(audioContextRef)
    setPhase('cracking')
  }

  const letterTextComplete = characterCount >= fullLetterLength

  return (
    <motion.div
      className="invitation-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : .55, ease: 'easeOut' }}
      role="dialog"
      aria-modal="true"
      aria-label="Hogwarts birthday invitation"
    >
      <div className="invitation-atmosphere" aria-hidden="true">
        <div className="invitation-spotlight" />
        {particles.map((particle, index) => (
          <motion.i
            className="invitation-particle"
            key={index}
            style={{ left: particle.x, top: particle.y }}
            animate={reduceMotion ? { opacity: .35 } : {
              opacity: [.12, .75, .2],
              y: [0, -16, 5],
              x: [0, 5, -4],
            }}
            transition={reduceMotion ? { duration: 0 } : {
              duration: 5.5,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <button
        className="invitation-sound-toggle"
        onClick={() => setSoundEnabled((enabled) => !enabled)}
        aria-label={soundEnabled ? 'Mute invitation sound' : 'Enable invitation sound'}
        aria-pressed={!soundEnabled}
      >
        {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
        <span>{soundEnabled ? 'Sound on' : 'Muted'}</span>
      </button>
      <button className="invitation-close" ref={closeButtonRef} onClick={onClose} aria-label="Close birthday invitation">
        <X size={21} />
      </button>

      <div className={`invitation-content ${letterVisible ? 'letter-is-open' : ''}`}>
        <AnimatePresence mode="sync">
          {!letterVisible && (
            <motion.div
              className="envelope-scene"
              key="envelope-scene"
              initial={{ opacity: 0, y: 18, scale: .94 }}
              animate={{
                opacity: 1,
                y: isSealed && !reduceMotion ? [0, -7, 0] : 0,
                scale: phase === 'emerging' ? .92 : 1,
              }}
              exit={{ opacity: 0, scale: .94, y: -14 }}
              transition={{
                opacity: { duration: .45 },
                scale: { duration: reduceMotion ? 0 : .7, ease: [.22, 1, .36, 1] },
                y: isSealed && !reduceMotion
                  ? { duration: 5, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: reduceMotion ? 0 : .8, ease: [.22, 1, .36, 1] },
              }}
            >
              <p className="invitation-kicker">HOGWARTS · SPECIAL DELIVERY</p>
              <motion.div
                className={`envelope ${phase === 'cracking' ? 'seal-cracking' : ''}`}
                animate={{ rotateZ: phase === 'cracking' && !reduceMotion ? [0, -1.2, 1, -.5, 0] : 0 }}
                transition={{ duration: reduceMotion ? 0 : .36 }}
              >
                <div className="envelope-letter-slot">
                  <motion.div
                    className="envelope-letter"
                    layoutId="birthday-invitation-letter"
                    animate={phase === 'emerging'
                      ? { y: reduceMotion ? -120 : -165, scale: 1, rotateX: 0 }
                      : { y: 34, scale: .94, rotateX: -5 }}
                    transition={{ duration: reduceMotion ? 0 : .86, ease: [.2, .75, .22, 1] }}
                  >
                    <span className="letter-mini-crest">H</span>
                    <span className="letter-mini-rule" />
                    <span className="letter-lines" />
                  </motion.div>
                </div>
                <div className="envelope-back" />
                <motion.div
                  className="envelope-flap"
                  animate={{ rotateX: phase === 'opening' || phase === 'emerging' ? -180 : 0 }}
                  transition={{ duration: reduceMotion ? 0 : .7, ease: [.2, .75, .2, 1] }}
                />
                <div className="envelope-front" />
                <div className="envelope-address">
                  <span>BY OWL POST</span>
                  <strong>VANSHIKA</strong>
                  <small>Gryffindor Tower · Hogwarts</small>
                </div>
                <AnimatePresence>
                  {phase === 'cracking' && [0, 1, 2].map((fragment) => (
                    <motion.i
                      className={`wax-fragment wax-fragment-${fragment + 1}`}
                      key={fragment}
                      initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                      animate={{
                        x: (fragment - 1) * 42,
                        y: fragment === 1 ? -42 : 24,
                        opacity: 0,
                        rotate: (fragment - 1) * 55,
                      }}
                      transition={{ duration: reduceMotion ? 0 : .55, ease: 'easeOut' }}
                    />
                  ))}
                </AnimatePresence>
                <motion.button
                  className="wax-seal"
                  onClick={openEnvelope}
                  disabled={!isSealed}
                  aria-label="Break the wax seal and open your Hogwarts birthday letter"
                  animate={phase === 'cracking'
                    ? { scale: .72, rotate: -10, opacity: 0 }
                    : { scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ duration: reduceMotion ? 0 : .38 }}
                  whileHover={isSealed && !reduceMotion ? { scale: 1.06 } : undefined}
                  whileTap={isSealed ? { scale: .94 } : undefined}
                >
                  <span className="wax-seal-ridge" />
                  <span className="wax-seal-emblem">H</span>
                  <span className="wax-seal-star">✦</span>
                </motion.button>
              </motion.div>
              <motion.p
                className="invitation-prompt"
                animate={{ opacity: isSealed ? 1 : 0, y: isSealed ? 0 : 6 }}
                transition={{ duration: reduceMotion ? 0 : .3 }}
              >
                {isSealed ? 'A letter has travelled a very long way to find you.' : 'The seal is broken. Your story awaits.'}
              </motion.p>
            </motion.div>
          )}

          {letterVisible && (
            <motion.article
              className={`birthday-letter ${phase === 'revealed' ? 'birthday-letter-revealed' : ''}`}
              key="birthday-letter"
              layoutId="birthday-invitation-letter"
              initial={{ opacity: 0, y: 44, rotateX: -8, scaleY: .72 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scaleY: 1 }}
              transition={{ duration: reduceMotion ? 0 : .82, ease: [.2, .75, .22, 1] }}
            >
              <div className="birthday-letter-inner">
                <span className="birthday-letter-eyebrow">HOGWARTS · SPECIAL BIRTHDAY DISPATCH</span>
                <div className="birthday-letter-copy">
                  <LetterCopy characterCount={characterCount} complete={letterTextComplete} />
                </div>
                <span className="birthday-letter-stamp" aria-hidden="true">H</span>
              </div>
              {phase === 'revealed' && (
                <motion.p
                  className="letter-afterword"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduceMotion ? 0 : .3, duration: reduceMotion ? 0 : .5 }}
                >
                  ✦ &nbsp; A little magic, just for you &nbsp; ✦
                </motion.p>
              )}
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
