import SectionHeading from "../components/ui/SectionHeading";
import SkillCard from "../components/cards/SkillCard";
import { derivedSkills } from "../data/contributions";

function Skills() {
  return (
    <section className="section section--compact" id="skills">
      <div className="container">
        <SectionHeading
          eyebrow="Derived Skills"
          title="Capabilities grounded in upstream systems work"
          description="These skills are derived from contribution patterns, review complexity, and debugging depth. They are intentionally tied to actual systems engineering work rather than generic tooling lists."
        />

        <div className="skills-grid">
          {derivedSkills.map((skill, index) => (
            <SkillCard key={skill.title} skill={skill} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
