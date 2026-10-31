import { AnimatePresence, motion } from 'framer-motion'

const motes = [
  [-88, -48], [-62, 18], [-36, -79], [-18, 54], [12, -62], [28, 38],
  [52, -30], [76, 52], [94, -66], [-104, 70], [4, 83], [112, 12],
]

function SilverGradient() {
  return (
    <defs>
      <linearGradient id="patronus-silver" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#f4fbff" />
        <stop offset=".48" stopColor="#b9ddf5" />
        <stop offset="1" stopColor="#739fc4" />
      </linearGradient>
    </defs>
  )
}

function RunningRetriever({ reducedMotion }) {
  const legMotion = reducedMotion
    ? { rotate: 0 }
    : { rotate: [-14, 14, -14] }
  const legTransition = reducedMotion
    ? { duration: 0 }
    : { duration: .34, repeat: 3, ease: 'easeInOut' }
  const legStyle = { transformBox: 'fill-box', transformOrigin: '50% 0%' }

  return (
    <motion.svg
      className="patronus-svg"
      viewBox="0 0 340 220"
      role="img"
      aria-label="A glowing Golden Retriever Patronus running into view"
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -250, scale: .88 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: .98, transition: { duration: reducedMotion ? 0 : .16 } }}
      transition={{ duration: reducedMotion ? 0 : 1.08, ease: [.22, 1, .36, 1] }}
    >
      <SilverGradient />
      <motion.path
        d="M66 94 C81 72 112 63 145 70 C164 74 181 82 198 82 C210 77 216 64 222 53 C229 42 244 43 255 50 C265 57 269 68 270 78 L296 82 C305 84 305 92 297 95 L274 100 C266 113 254 118 240 115 L221 109 C210 122 205 136 197 144 C184 153 165 154 145 148 L110 139 C91 134 76 129 65 116 C58 109 57 101 66 94Z"
        fill="url(#patronus-silver)"
      />
      <motion.path d="M70 91 C54 77 41 75 28 81 C37 87 46 95 59 105" fill="none" stroke="url(#patronus-silver)" strokeWidth="13" strokeLinecap="round" />
      <path d="M229 48 C235 60 246 68 256 73 C255 60 247 51 236 48" fill="url(#patronus-silver)" />
      <motion.path d="M104 130 C96 145 82 158 66 166 L49 173" fill="none" stroke="url(#patronus-silver)" strokeWidth="15" strokeLinecap="round" animate={legMotion} transition={legTransition} style={legStyle} />
      <motion.path d="M124 137 C119 151 123 161 135 171 L147 177" fill="none" stroke="url(#patronus-silver)" strokeWidth="15" strokeLinecap="round" animate={legMotion} transition={legTransition} style={legStyle} />
      <motion.path d="M193 124 C190 137 198 147 211 155 L223 162" fill="none" stroke="url(#patronus-silver)" strokeWidth="15" strokeLinecap="round" animate={legMotion} transition={legTransition} style={legStyle} />
      <motion.path d="M215 107 C226 119 239 130 251 138 L265 142" fill="none" stroke="url(#patronus-silver)" strokeWidth="15" strokeLinecap="round" animate={legMotion} transition={legTransition} style={legStyle} />
      <path d="M270 86 L284 88" fill="none" stroke="#f5fbff" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  )
}

function SeatedRetriever({ reducedMotion }) {
  return (
    <motion.svg
      className="patronus-svg patronus-svg-seated"
      viewBox="0 0 340 220"
      role="img"
      aria-label="A glowing Golden Retriever Patronus sitting at the centre"
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: .91, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : .46, ease: [.22, 1, .36, 1] }}
    >
      <SilverGradient />
      <path d="M87 158 C83 140 87 124 99 112 C113 98 136 93 158 100 C178 106 190 118 197 133 C202 120 205 101 208 84 C210 69 221 62 235 64 C250 66 258 78 258 90 L285 96 C295 98 295 106 286 110 L266 114 C260 124 251 128 238 127 L228 127 C220 138 218 153 219 169 L219 193 L203 193 L196 158 C185 154 174 156 164 160 L161 193 L145 193 L145 157 C132 159 120 155 110 147 C103 159 99 176 98 193 L82 193 C79 180 81 168 87 158Z" fill="url(#patronus-silver)" />
      <path d="M103 115 C82 103 65 91 48 94 C56 105 68 117 88 126" fill="none" stroke="url(#patronus-silver)" strokeWidth="15" strokeLinecap="round" />
      <path d="M230 67 C235 79 246 87 256 92 C256 77 248 68 237 65" fill="url(#patronus-silver)" />
      <path d="M266 101 L283 103" fill="none" stroke="#f5fbff" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round" />
      <path d="M155 108 C169 112 180 120 186 131" fill="none" stroke="#f8fcff" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  )
}

export default function PatronusScene({ phase, castId, reducedMotion }) {
  return (
    <div className={`patronus-figure patronus-phase-${phase}`} aria-hidden="true">
      <div className="patronus-particles">
        {motes.map(([x, y], index) => (
          <motion.i
            key={`${castId}-${index}`}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={reducedMotion
              ? { opacity: phase === 'seated' ? .5 : 0 }
              : { opacity: phase === 'seated' ? [.2, .8, .25] : [0, .9, .15], x: [0, x, x * 1.12], y: [0, y, y * 1.2] }}
            transition={reducedMotion
              ? { duration: 0 }
              : { duration: phase === 'seated' ? 2.8 : 1.15, delay: index * .035, repeat: phase === 'seated' ? Infinity : 0, ease: 'easeOut' }}
            style={{ left: '50%', top: '53%' }}
          />
        ))}
      </div>
      <AnimatePresence initial={false} mode="wait">
        {phase === 'running' && <RunningRetriever key={`running-${castId}`} reducedMotion={reducedMotion} />}
        {(phase === 'sitting' || phase === 'seated') && <SeatedRetriever key={`seated-${castId}`} reducedMotion={reducedMotion} />}
      </AnimatePresence>
      <AnimatePresence>
        {phase === 'casting' && (
          <motion.div
            key={castId}
            className="patronus-light-burst"
            initial={{ opacity: 0, scale: .08 }}
            animate={reducedMotion
              ? { opacity: 0, scale: .08 }
              : { opacity: [0, .95, 0], scale: [.08, .95, 1.8] }}
            transition={{ duration: reducedMotion ? 0 : .45, times: [0, .28, 1], ease: [.2, .75, .22, 1] }}
          />
        )}
      </AnimatePresence>
      {phase === 'seated' && <div className="patronus-aura" />}
    </div>
  )
}
