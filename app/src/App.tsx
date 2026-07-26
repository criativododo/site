import Hero from "./components/Hero";
import SobreNos from "./components/SobreNos";
import Servicos from "./components/Servicos";
import Metodologia from "./components/Metodologia";
import Cafe from "./components/Cafe";
import { useLandingAnimations } from "./useLandingAnimations";

export default function App() {
  useLandingAnimations();

  return (
    <main className="home">
      <Hero />
      <SobreNos />
      <Servicos />
      <Metodologia />
      <Cafe />
    </main>
  );
}
