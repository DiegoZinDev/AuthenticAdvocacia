import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KineticHeadlineProps {
  text: string;
  subheadline: string;
  personaKey: string;
}

export function KineticHeadline({ text, subheadline, personaKey }: KineticHeadlineProps) {
  const words = useMemo(() => text.split(' '), [text]);

  return (
    <div className="kinetic-headline-wrap">
      <AnimatePresence mode="wait">
        <motion.h1
          key={`h1-${personaKey}`}
          className="hero-headline"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          aria-label={text}
        >
          {words.map((word, index) => (
            <motion.span
              key={`${personaKey}-w-${index}`}
              className="kinetic-word"
              initial={{
                opacity: 0,
                y: 14,
                filter: 'blur(8px)',
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
              }}
              transition={{
                duration: 0.48,
                delay: Math.min(index * 0.032, 0.45),
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
              {index < words.length - 1 ? '\u00A0' : ''}
            </motion.span>
          ))}
        </motion.h1>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.p
          key={`sub-${personaKey}`}
          className="hero-subheadline"
          initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
          transition={{ duration: 0.42, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        >
          {subheadline}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
