import { motion } from "framer-motion";

const headingMotion = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div
      className="section-heading"
      variants={headingMotion}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
    </motion.div>
  );
}

export default SectionHeading;
