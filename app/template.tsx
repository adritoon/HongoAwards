'use client'; // <-- Es un componente de cliente

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} // Empieza invisible y abajo
      animate={{ opacity: 1, y: 0 }} // Termina visible y en su sitio
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}