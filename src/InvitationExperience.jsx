import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Volume2, VolumeX, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const letterSegments = [
  { heading: true, text: 'Dear Pookie Vanshika Sharma' },
  { text: 'Kaha se shuru karu? Four years, from that first meeting and your "Achha, tum hi Jatin ho?" to our Dharamshala trip, we\'ve come a really long way. We\'ve seen so many ups and downs, had countless fights, disagreements, stupid arguments, and somehow collected a lifetime of memories in these four years.' },
  { text: 'There are so many moments that I wish I could relive and honestly, even after all this time there are things about you that I don\'t think me will ever get tired of. My smol kitten\'s big eyes, I don\'t think me ever told you enough how much I love them. And bondhi, when you wear my fav green dress, kya hi kehne! You just look SO GOOD. Your puppy eyes, your pookie voice, and muh fulai when angy these are the thing that I\'ll always adore.' },
  { text: 'I still remember all our trips Shangarh, Griffin, Triund, Dharamshala and all those plans that took forever to finally happen. There were so many hiccups in between, but one thing that I\'ll always be grateful for is how you stood by me and supported me. You listened to my endless rants, tolerated my nonsense and gave me a space where I could just be myself and I am always thankful for that.' },
  { text: 'And speaking of Griffin, I don\'t think you realise how special that moment was for me, You were playing "Arz Kiya Hai" and I can still feel goosebumps thinking about it. I remember recording you, hoping you\'d play a little more because I\'ve always loved the flute. I genuinely hope I get to witness many more such moments.', italic: 'Arz Kiya Hai' },
  { text: 'Also, let\'s not forget that you\'re THE BEST DANCER, NIGGA! The way you dance,  the way you enjoy yourself is just something else. Never stop dancing, never stop playing your flute and never stop doing the things that makes you YOU.' },
  { text: 'I know things between us haven\'t been the best lately. We\'ve made mistakes, hurt each other and things haven\'t turned out the way we imagined. I know I\'ve made my share of mistakes too, and I genuinely hope that someday you\'ll be able to forgive me for all the ways I\'ve hurt you ,I don\'t want this letter to sound like an apology or a goodbye, but I also don\'t want to pretend that everything is perfect :(' },
  { text: 'The truth is ,there hasn\'t been a single day when I do not think about you ,no matter how things are between us, you still cross my mind, and I guess that\'s what happens when someone becomes such an important part of your life.' },
  { text: 'As you turn 23, you\'re entering a whole new phase of life ,you\'ll meet so many new people, make new friends, lose some along the way, discover new things and experience so much. But through all of it, I have just one request, never lose your passion or your love for the things you do. Keep exploring, keep travelling, keep dancing, keep playing your flute and keep finding reasons to be excited about life.', bold: 'never lose your passion or your love for the things you do.' },
  { text: 'I know we\'re going to be separated. I\'ll be in Japan and you\'ll be in Bangalore, Life will get busy, we\'ll have our own responsibilities and maybe things won\'t be as easy as they used to be or are currently, But before anything else, we were best friends. We shared almost everything with each other, and I don\'t want you to ever feel that you can\'t reach out to me.' },
  { text: 'I\'ll always be there to listen to your rants, your problems, your random stories and all the little things you want to share, just like you\'ve always been there to listen to mine ,distance shouldn\'t make you feel that you\'ve lost someone you could talk to.' },
  { text: 'You know, one thing that I am absolutely sure about is that you\'re the only person I\'ve found in college with whom I could be completely childish, show my emotions without thinking twice, act stupid, share literally anything and just be myself. I hope you never lose that little child in you. Keep that pookie voice, those puppy eyes, your craziness and those nonchalant vibes' },
  { text: 'And please, take care of yourself. Keep meditating like you do, exercise, go running, attend dance workshops, travel to new places, buy those cute dresses you love and, most importantly, enjoy your life to the fullest. Don\'t keep waiting for the perfect time or the perfect company to do things. Just go out there and live!' },
  { text: 'I genuinely believe you\'re a winning machine. Whatever field you choose, whatever you decide to pursue, I know you\'ll make it happen. You have so much potential, so much talent and so much passion. I hope this brings you opportunities, happiness, adventures and everything you\'ve been wishing for.' },
  { text: 'And lastly, despite all the fights, mistakes, difficult phases and everything in between, this is a bond I\'ll cherish forever. I\'ll always look back at these four years with a smile, remembering our stupid fights, endless conversations, trips, laughter and all those moments that made college feel like home.' },
  { bold: true, text: 'Thank you for being my person, my best friend and my favourite pookie and I\'ll always see you as my smol kitten' },
  { bold: true, text: 'Happy 23rd Birthday once again, Vanshika!' },
  { text: 'Me love you, pookie. ❤️' },
  { signoff: true, bold: true, text: '– Jatin' },
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

function renderLetterText(segment, text) {
  const markedText = segment.italic ?? (typeof segment.bold === 'string' ? segment.bold : null)
  if (!markedText) return segment.bold ? <strong>{text}</strong> : text

  const markStart = segment.text.indexOf(markedText)
  const visibleStart = Math.min(text.length, markStart)
  const visibleEnd = Math.min(text.length, markStart + markedText.length)
  const Mark = segment.italic ? 'em' : 'strong'

  return (
    <>
      {text.slice(0, visibleStart)}
      {visibleEnd > visibleStart && <Mark>{text.slice(visibleStart, visibleEnd)}</Mark>}
      {text.slice(visibleEnd)}
    </>
  )
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
        const content = renderLetterText(segment, text)
        if (segment.signoff) return <p className="invitation-signoff" key={segment.text}>{content}</p>
        if (segment.bold) return <p key={segment.text}>{content}</p>
        return <p key={segment.text}>{content}</p>
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
      currentCount += 4
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
