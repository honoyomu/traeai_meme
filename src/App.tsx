import './App.css';
import MemeGenerator from './components/MemeGenerator';

const INSFORGE_LOGO = new URL('../insforge.svg', import.meta.url).href;

function App() {
  return (
    <>
      <div className="flex items-center justify-between gap-3 pl-4 pr-5 sm:px-6 h-12 border-b-2 border-[#32F08C]/30 bg-[#0e0f10] shadow-md">
        <img src="/traeai_logo.jpeg" alt="Trae" className="h-7 w-7 rounded shrink-0" />
        <div />
      </div>
      <MemeGenerator />

      <div className="fixed bottom-4 right-4 z-40">
        <a
          href="https://insforge.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-gray-800/70 backdrop-blur-sm rounded-md px-4 py-2 flex items-center justify-center gap-3 shadow-lg ring-1 ring-white/10 cursor-pointer"
        >
          <span className="text-sm text-white font-medium tracking-wide group-hover:opacity-90">Powered by</span>
          <img src={INSFORGE_LOGO} alt="InsForge" className="h-6 object-contain transition-opacity group-hover:opacity-90" loading="lazy" />
        </a>
      </div>
    </>
  );
}

export default App;
