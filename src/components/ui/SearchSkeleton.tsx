import { motion } from 'framer-motion';

interface SearchSkeletonProps {
  itemCount?: number;
}

export default function SearchSkeleton({ itemCount = 3 }: SearchSkeletonProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="max-h-96 overflow-y-auto"
    >
      <div className="p-2">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xs text-slate-500 px-3 py-2 font-medium"
        >
          Suggestions
        </motion.div>
        {/* Skeleton loading items */}
        {[...Array(itemCount)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.02 }}
            className="w-full px-3 py-3 text-sm rounded-lg flex items-center"
          >
            <div className="animate-pulse flex items-center w-full">
              <div className="w-8 h-8 bg-slate-200 rounded mr-3 flex-shrink-0"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 