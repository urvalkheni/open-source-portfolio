import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
};

function Toast({ items, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {items.map((item) => {
          const Icon = iconMap[item.tone] ?? CheckCircle2;

          return (
            <motion.div
              key={item.id}
              className={`toast toast--${item.tone}`.trim()}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="toast__content">
                <Icon size={18} />
                <span>{item.message}</span>
              </div>

              <button
                type="button"
                className="icon-button"
                aria-label="Dismiss notification"
                onClick={() => onDismiss(item.id)}
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default Toast;
