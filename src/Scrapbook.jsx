import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Feather, Sparkles, X } from 'lucide-react'
import memories from './data/memories'
import './Scrapbook.css'

function MemoryPhoto({ memory, index, large = false, onClick }) {
  const [unavailable, setUnavailable] = useState(false)

  return (
    <button
      className={`scrapbook-polaroid${large ? ' scrapbook-polaroid-large' : ''}`}
      type="button"
      onClick={onClick}
      style={{ '--photo-tilt': `${[-2.2, 1.4, -1.1, 2][index % 4]}deg` }}
      aria-label={`Enlarge photograph: ${memory.caption || 'Untitled memory'}`}
    >
      <span className="scrapbook-photo">
        {memory.image && !unavailable ? (
          <img
            src={memory.image}
            alt={memory.caption || 'A scrapbook memory'}
            loading={large ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setUnavailable(true)}
          />
        ) : (
          <span className="scrapbook-photo-placeholder" role="img" aria-label="Photograph placeholder">
            <Sparkles size={25} aria-hidden="true" />
            <span>A photograph will live here</span>
            <small>A little space kept for a memory</small>
          </span>
        )}
      </span>
      <span className="scrapbook-handwriting">{memory.caption || 'A little moment to keep.'}</span>
      {(memory.date || memory.year) && (
        <span className="scrapbook-photo-date">{[memory.date, memory.year].filter(Boolean).join(' · ')}</span>
      )}
    </button>
  )
}

function ScrapbookPage({ memory, index, side, direction, reducedMotion, onPhotoClick }) {
  if (!memory) {
    return <div className={`scrapbook-page scrapbook-page-${side} scrapbook-page-empty`} aria-hidden="true" />
  }

  return (
    <motion.article
      className={`scrapbook-page scrapbook-page-${side}`}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: direction > 0 ? -8 : 8, y: 7 }}
      animate={{ opacity: 1, rotateY: 0, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: direction > 0 ? -68 : 68, y: 3 }}
      transition={{ duration: reducedMotion ? 0 : 0.48, ease: [0.22, 0.72, 0.2, 1] }}
      style={{ transformOrigin: side === 'left' ? 'right center' : 'left center' }}
      aria-label={`Scrapbook page ${index + 1}`}
    >
      <div className="scrapbook-page-topline">
        <span>V · A</span>
        <span>✦ &nbsp; A KEEPSAKE &nbsp; ✦</span>
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className={`scrapbook-page-memory scrapbook-layout-${index % 4}`}>
        <span className="scrapbook-tape" aria-hidden="true" />
        <MemoryPhoto memory={memory} index={index} onClick={() => onPhotoClick(memory)} />
        <span className="scrapbook-stamp" aria-hidden="true">HOGWARTS<br />POST</span>
      </div>
      <div className="scrapbook-page-note" aria-hidden="true">
        <Feather size={13} /> Kept close, always
      </div>
    </motion.article>
  )
}

function MemoryLightbox({ memory, index, onClose, returnFocusRef }) {
  const closeRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        event.preventDefault()
        closeRef.current?.focus()
      }
    }

    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
      returnFocusRef.current?.focus()
    }
  }, [onClose, returnFocusRef])

  return (
    <motion.div
      className="memory-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged scrapbook photograph"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <button className="memory-lightbox-close" type="button" onClick={onClose} ref={closeRef} aria-label="Close photograph"><X size={21} /></button>
      <motion.div
        className="memory-lightbox-frame"
        initial={{ opacity: 0, y: 18, scale: 0.97, rotate: -1 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <MemoryPhoto memory={memory} index={index} large onClick={() => {}} />
      </motion.div>
    </motion.div>
  )
}

export default function Scrapbook() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 760px)').matches)
  const [activeMemory, setActiveMemory] = useState(null)
  const [touchStart, setTouchStart] = useState(null)
  const reduceMotion = useReducedMotion()
  const lastPhotoRef = useRef(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 760px)')
    const updateLayout = () => setIsDesktop(mediaQuery.matches)
    mediaQuery.addEventListener('change', updateLayout)
    return () => mediaQuery.removeEventListener('change', updateLayout)
  }, [])

  const visibleStart = isDesktop ? currentIndex - (currentIndex % 2) : currentIndex
  const visibleMemories = useMemo(
    () => isDesktop ? [memories[visibleStart], memories[visibleStart + 1]] : [memories[visibleStart]],
    [isDesktop, visibleStart],
  )
  const pageCount = memories.length
  const lastStart = isDesktop ? Math.max(0, Math.floor((pageCount - 1) / 2) * 2) : Math.max(0, pageCount - 1)
  const canGoBack = visibleStart > 0
  const canGoForward = visibleStart < lastStart

  const changePage = useCallback((step) => {
    setDirection(step)
    const increment = isDesktop ? 2 : 1
    setCurrentIndex((index) => Math.min(lastStart, Math.max(0, index + step * increment)))
  }, [isDesktop, lastStart])

  useEffect(() => {
    setCurrentIndex((index) => Math.min(lastStart, isDesktop ? index - (index % 2) : index))
  }, [isDesktop, lastStart])

  const openPhoto = useCallback((memory) => {
    lastPhotoRef.current = document.activeElement
    setActiveMemory(memory)
  }, [])
  const closePhoto = useCallback(() => setActiveMemory(null), [])

  const handleTouchStart = (event) => {
    if (event.target.closest('button, input, textarea, select, a, [contenteditable="true"]')) return
    setTouchStart(event.changedTouches[0].clientX)
  }
  const handleTouchEnd = (event) => {
    if (touchStart === null) return
    const distance = event.changedTouches[0].clientX - touchStart
    if (Math.abs(distance) > 55) changePage(distance < 0 ? 1 : -1)
    setTouchStart(null)
  }

  const pageKey = `${isDesktop ? 'spread' : 'page'}-${visibleStart}-${memories[visibleStart]?.id || 'empty'}`

  return (
    <div className="scrapbook" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchCancel={() => setTouchStart(null)}>
      <div className="scrapbook-controls">
        <span className="scrapbook-controls-note"><Sparkles size={14} /> A keepsake from the castle</span>
      </div>

      <motion.div
        className="scrapbook-cover"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateX: 4, y: 16 }}
        whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.2, 0.75, 0.25, 1] }}
      >
        <div className="scrapbook-pages">
          <div className="scrapbook-spine" aria-hidden="true" />
          {pageCount ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div className={`scrapbook-spread${isDesktop ? '' : ' is-single-page'}`} key={pageKey}>
                {visibleMemories.map((memory, pageIndex) => (
                  <ScrapbookPage
                    key={memory?.id || `empty-${pageIndex}`}
                    memory={memory}
                    index={visibleStart + pageIndex}
                    side={isDesktop ? (pageIndex === 0 ? 'left' : 'right') : 'single'}
                    direction={direction}
                    reducedMotion={reduceMotion}
                    onPhotoClick={openPhoto}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="scrapbook-empty">
              <BookOpen size={34} />
              <p>This album is ready for its next memory.</p>
            </div>
          )}
        </div>
        <div className="scrapbook-cover-plaque" aria-hidden="true"><span>✦</span><strong>V · A</strong><small>Our memories</small><span>✦</span></div>
      </motion.div>

      <div className="scrapbook-navigation" aria-label="Scrapbook pages">
        <button type="button" className="scrapbook-page-button" onClick={() => changePage(-1)} disabled={!canGoBack} aria-label="Previous scrapbook page">
          <ChevronLeft size={19} /><span>Previous</span>
        </button>
        <span className="scrapbook-page-indicator" aria-live="polite">
          {pageCount ? (isDesktop
            ? `Pages ${visibleStart + 1}–${Math.min(visibleStart + 2, pageCount)} of ${pageCount}`
            : `Page ${visibleStart + 1} of ${pageCount}`) : 'No pages yet'}
        </span>
        <button type="button" className="scrapbook-page-button" onClick={() => changePage(1)} disabled={!canGoForward} aria-label="Next scrapbook page">
          <span>Next</span><ChevronRight size={19} />
        </button>
      </div>

      <AnimatePresence>
        {activeMemory && (
          <MemoryLightbox
            memory={activeMemory}
            index={memories.findIndex((memory) => memory.id === activeMemory.id)}
            onClose={closePhoto}
            returnFocusRef={lastPhotoRef}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
