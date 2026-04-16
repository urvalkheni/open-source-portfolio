import AppShell from "./components/layout/AppShell";
import Footer from "./components/layout/Footer";
import TopNav from "./components/layout/TopNav";
import Hero from "./sections/Hero";
import HighImpact from "./sections/HighImpact";
import Contributions from "./sections/Contributions";
import Skills from "./sections/Skills";
import "./styles/global.css";

function App() {
  return (
    <AppShell>
      <TopNav />
      <main>
        <Hero />
        <HighImpact />
        <Contributions />
        <Skills />
      </main>
      <Footer />
    </AppShell>
  );
}

export default App;
