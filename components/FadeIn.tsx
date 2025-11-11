'use client'; // Este componente debe ser un Client Component

import { motion } from 'framer-motion';
import React from 'react';

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export const FadeIn = ({ children, delay = 0, className }: FadeInProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }} // Empieza invisible y 20px abajo
      whileInView={{ opacity: 1, y: 0 }} // Se vuelve visible y sube a su posición
      viewport={{ once: true, margin: '-100px' }} // Se activa 100px antes de entrar en la vista
      transition={{ duration: 0.5, delay: delay }} // Duración de la animación
    >
      {children}
    </motion.div>
  );
};