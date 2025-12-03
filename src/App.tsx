import './App.css';
import MemeGenerator from './components/MemeGenerator';

function App() {
  return (
    <>
      <div className="flex items-center justify-between gap-3 pl-4 pr-5 sm:px-6 h-12 border-b-2 border-[#32F08C]/30 bg-[#0e0f10] shadow-md">
        <img src="/traeai_logo.jpeg" alt="Trae" className="h-7 w-7 rounded shrink-0" />
        <div />
      </div>
      <MemeGenerator />
    </>
  );
}

export default App;
