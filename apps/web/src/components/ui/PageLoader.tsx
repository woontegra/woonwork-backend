import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <motion.div
        className="h-10 w-10 rounded-full border-2 border-navy-200 border-t-navy-800"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      />
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-navy-100/80 ${className}`} />;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-200 bg-white/60 px-6 py-16 text-center"
    >
      <div className="mb-4 h-12 w-12 rounded-2xl bg-navy-50 ring-1 ring-navy-100" />
      <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-navy-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </motion.div>
  );
}
