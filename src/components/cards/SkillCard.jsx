import { motion } from "framer-motion";

function SkillCard({ skill, index }) {
  return (
    <motion.article
      className="panel skill-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -5 }}
    >
      <h3>{skill.title}</h3>
      <p>{skill.detail}</p>
    </motion.article>
  );
}

export default SkillCard;
