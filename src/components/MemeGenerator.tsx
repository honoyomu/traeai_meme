import { useCallback, useEffect, useRef, useState } from 'react';
import { insforge } from '../lib/insforge';

export default function MemeGenerator() {
  const [includeTrae, setIncludeTrae] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [traeDataUrl, setTraeDataUrl] = useState<string | null>(null);
  const [userRefs, setUserRefs] = useState<string[]>([]);
  const [model, setModel] = useState('google/gemini-3-pro-image-preview');
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadTrae = async () => {
      try {
        const res = await fetch('/traeai_logo.jpeg');
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (!cancelled) setTraeDataUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch {
        if (!cancelled) setError('Failed to load Trae reference image');
      }
    };
    loadTrae();
    return () => {
      cancelled = true;
    };
  }, []);

  const generateMeme = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    if (includeTrae && !traeDataUrl) {
      setError('Trae reference is loading, please try again in a moment');
      return;
    }
    setGenerating(true);
    setError(null);
    setResultImage(null);
    try {
      let finalPrompt = prompt.trim();
      if (includeTrae) finalPrompt += '\n"Trae" refers to the attached Trae logo image. Use that image explicitly as the visual reference and keep its key traits recognizable in the generated meme.';
      if (userRefs.length) finalPrompt += '\nAlso use the additional user-provided reference image(s) as base context.';

      const imagesArr: Array<{ url: string }> = [];
      if (includeTrae && traeDataUrl) imagesArr.push({ url: traeDataUrl });
      for (const ref of userRefs) {
        imagesArr.push({ url: ref });
      }
      const images = imagesArr.length ? imagesArr : undefined;
      const response = await insforge.ai.images.generate({
        model,
        prompt: finalPrompt,
        images,
      });

      const b64 = response?.data?.[0]?.b64_json;
      if (!b64) throw new Error('No image returned');
      setResultImage(`data:image/png;base64,${b64}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
    } finally {
      setGenerating(false);
    }
  }, [traeDataUrl, userRefs, includeTrae, prompt, model]);

  const downloadImage = useCallback(() => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = 'meme.png';
    a.click();
  }, [resultImage]);

  

  const modelOptions: Array<{ id: string; label: string }> = [
    { id: 'google/gemini-3-pro-image-preview', label: 'Gemini 3 Pro' },
    { id: 'google/gemini-2.5-flash-image-preview', label: 'Gemini 2.5 Flash' },
  ];
  const currentModelLabel = modelOptions.find((m) => m.id === model)?.label || model;

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 mt-6 sm:mt-8 lg:mt-10 text-gray-200 min-h-[calc(100vh-64px)]">
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-56 bg-gradient-to-b from-[#32F08C]/15 to-transparent blur-md -z-10" />
      <h1 className={`text-3xl sm:text-4xl font-bold text-center text-white`}>Trae Meme Generator</h1>

      <div className={`grid grid-cols-1 gap-6 xl:gap-8 justify-items-center`}>
        <div className={`space-y-3 w-full max-w-[760px] lg:max-w-[820px]`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <img
                src={traeDataUrl || '/traeai_logo.jpeg'}
                alt="Trae logo"
                className={`h-6 w-6 rounded ${includeTrae ? '' : 'filter grayscale'}`}
              />
              <span className={`text-sm ${includeTrae ? 'text-[#32F08C]' : 'text-gray-300'}`}>{includeTrae ? 'Trae logo included' : 'Trae logo not included'}</span>
            </div>
            <div
              role="switch"
              aria-checked={includeTrae}
              tabIndex={0}
              onClick={() => setIncludeTrae(!includeTrae)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setIncludeTrae(!includeTrae);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${includeTrae ? 'bg-[#32F08C]' : 'bg-gray-600'}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${includeTrae ? 'translate-x-5' : 'translate-x-1'}`}
              />
            </div>
          </div>

          <div className="relative rounded-2xl border border-[#3a3a3a] bg-[#141515] shadow-md p-2 focus-within:ring-2 focus-within:ring-[#32F08C]/60 focus-within:border-[#32F08C]/40">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={"Describe the meme you want to generate..."}
              className="w-full rounded-xl bg-transparent px-3 py-2 min-h-24 sm:min-h-32 lg:min-h-40 pr-0 sm:pr-40 outline-none resize-none text-gray-200 placeholder:text-gray-400 ring-0"
            />
            <div className="sm:absolute sm:bottom-2 sm:right-2 flex items-center gap-3 mt-2 sm:mt-0 justify-end">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setModelMenuOpen((v) => !v)}
                  className="text-sm text-gray-200 hover:text-white px-2 py-1 rounded bg-[#151515] border border-[#3a3a3a]"
                  aria-haspopup="listbox"
                  aria-expanded={modelMenuOpen}
                >
                  {currentModelLabel} ▾
                </button>
                {modelMenuOpen && (
                  <div className="absolute bottom-full mb-2 right-0 z-20 w-44 rounded-md border border-[#3a3a3a] bg-[#151515] text-gray-200 shadow-lg p-1">
                    {modelOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onMouseDown={() => {
                          setModel(opt.id);
                          setModelMenuOpen(false);
                        }}
                        className={`block w-full text-left px-2 py-1 rounded bg-[#151515] text-gray-200 focus:outline-none focus:ring-0 ${
                          opt.id === model ? 'bg-[#1b1b1b] text-white' : 'hover:bg-[#1a1a1a]'
                        }`}
                        aria-selected={opt.id === model}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  if (!files.length) return;
                  const remaining = Math.max(0, 3 - userRefs.length);
                  const toAdd = files.slice(0, remaining);
                  let processed = 0;
                  toAdd.forEach((file) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const dataUrl = reader.result as string;
                      setUserRefs((prev) => {
                        if (prev.length >= 3) return prev;
                        return [...prev, dataUrl].slice(0, 3);
                      });
                      processed++;
                      if (processed === toAdd.length && fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    };
                    reader.readAsDataURL(file);
                  });
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-9 w-9 sm:h-8 sm:w-8 rounded-full border border-[#3a3a3a] bg-[#151515] text-gray-200 flex items-center justify-center shadow-sm hover:bg-[#1a1a1a] active:scale-95 disabled:opacity-40"
                aria-label="Upload reference image"
                disabled={userRefs.length >= 3}
              >
                +
              </button>
              <button
                type="button"
                onClick={generateMeme}
                disabled={generating || !prompt.trim()}
                className={`h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-[#32F08C] text-black flex items-center justify-center shadow-sm ${
                  generating || !prompt.trim()
                    ? 'opacity-50 pointer-events-none cursor-default'
                    : 'hover:brightness-105 active:scale-95'
                }`}
              aria-label="Generate"
              >
                ↑
              </button>
          </div>
            {userRefs.length > 0 && (
              <div className="mt-2 border-t border-gray-100 pt-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {userRefs.map((src, idx) => (
                    <div key={idx} className="group relative h-20 w-20">
                      <button
                        type="button"
                        aria-label="Remove reference image"
                        onClick={() => setUserRefs((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-1 -left-1 z-10 h-4 w-4 aspect-square p-0 inline-grid place-items-center rounded-full bg-white border border-gray-300 text-gray-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-[10px] leading-none">×</span>
                      </button>
                      <div className="rounded-xl overflow-hidden shadow-sm border border-[#2a2a2a] bg-[#0f0f10]">
                        <img src={src} alt="Reference" className="h-20 w-20 object-cover" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {(generating || resultImage) && (
          <div className="space-y-3 lg:pt-1 w-full max-w-[760px] lg:max-w-[820px]">
            <label className="block text-sm font-medium">Preview</label>
            <div className="relative border border-[#3a3a3a] bg-[#141515] rounded p-0 overflow-hidden flex items-center justify-center min-h-48 sm:min-h-64 lg:min-h-[520px]">
              {resultImage ? (
                <>
                  <img src={resultImage} alt="Generated meme" className="max-w-full max-h-full object-contain" />
                  <button
                    type="button"
                    onClick={downloadImage}
                    className="absolute top-2 right-2 px-2 py-1 rounded-md bg-[#151515] border border-[#3a3a3a] text-gray-200 hover:bg-[#1a1a1a]"
                    aria-label="Download PNG"
                  >
                    ⬇
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-8">
                  <div className="h-6 w-6 rounded-full border-2 border-[#32F08C] border-t-transparent animate-spin" />
                  <p className="text-sm text-gray-300">Generating...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
