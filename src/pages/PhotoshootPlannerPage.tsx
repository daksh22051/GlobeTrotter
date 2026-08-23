import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  Heart,
  MapPin,
  Palette,
  Sparkles,
  Users,
} from 'lucide-react';

type DestinationId = 'udaipur' | 'goa' | 'bali' | 'paris';
type ThemeId = 'royal' | 'bohemian' | 'cinematic' | 'tropical';
type PackageId = 'standard' | 'cinematic' | 'celebrity';

interface DestinationConfig {
  id: DestinationId;
  name: string;
  country: string;
  image: string;
  accent: string;
  themes: ThemeId[];
}

interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  colors: string[];
  outfit: string;
  styling: string;
}

interface PackageConfig {
  id: PackageId;
  name: string;
  description: string;
  hours: string;
  photographer: number;
  rawPhotos: number;
  editedPhotos: number;
  includes: string[];
}

const destinations: DestinationConfig[] = [
  { id: 'udaipur', name: 'Udaipur', country: 'India', image: 'https://images.unsplash.com/photo-1602643163983-ed0babc39797?auto=format&fit=crop&w=900&q=85', accent: '#C79546', themes: ['royal', 'cinematic'] },
  { id: 'goa', name: 'Goa', country: 'India', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=85', accent: '#20B8A6', themes: ['bohemian', 'tropical'] },
  { id: 'bali', name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85', accent: '#D47B55', themes: ['tropical', 'bohemian'] },
  { id: 'paris', name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85', accent: '#7C6F64', themes: ['cinematic', 'royal'] },
];

const themes: ThemeConfig[] = [
  { id: 'royal', name: 'Royal Heritage Palace', description: 'Regal architecture, silk textures, and editorial portraits.', colors: ['#9A5B42', '#D6B27B', '#F6E8CF'], outfit: 'Jewel-tone lehengas, tailored ivory sherwanis, and antique gold details.', styling: 'Soft bronze eyes, warm skin, and a structured floral arrangement.' },
  { id: 'bohemian', name: 'Bohemian Beach', description: 'Barefoot movement, sun-washed linen, and coastal ease.', colors: ['#D17A58', '#F2C98B', '#F7EFE0'], outfit: 'Flowing linen, crochet layers, terracotta accents, and natural textures.', styling: 'Bronzed skin, loose waves, and dried palm or wildflower details.' },
  { id: 'cinematic', name: 'Cinematic Street', description: 'A modern love story told through city lights and candid frames.', colors: ['#203A43', '#B85C48', '#D9C4A6'], outfit: 'Monochrome tailoring, a statement coat, and one rich accent color.', styling: 'Polished skin, graphic liner, and a sleek low bun or textured crop.' },
  { id: 'tropical', name: 'Tropical Ceremony', description: 'Lush greens, open skies, and an intimate island mood.', colors: ['#2F6F62', '#E7B85C', '#F5E7C8'], outfit: 'Airy whites, botanical prints, and warm metallic accessories.', styling: 'Fresh dewy makeup, soft braids, and tropical foliage accents.' },
];

const packages: PackageConfig[] = [
  { id: 'standard', name: 'Standard', description: 'A relaxed half-day session for essential memories.', hours: '4 hours', photographer: 28000, rawPhotos: 180, editedPhotos: 60, includes: ['Verified local photographer', 'One location', 'Online gallery'] },
  { id: 'cinematic', name: 'Cinematic', description: 'A polished visual story with more time, movement, and variety.', hours: '8 hours', photographer: 52000, rawPhotos: 420, editedPhotos: 140, includes: ['Lead photographer + assistant', 'Three locations', 'Preview gallery'] },
  { id: 'celebrity', name: 'Celebrity Style', description: 'A full creative production for a magazine-worthy wedding story.', hours: 'Full day', photographer: 86000, rawPhotos: 700, editedPhotos: 250, includes: ['Two photographers', 'Priority editing', 'Album design consultation'] },
];

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export const PhotoshootPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [destinationId, setDestinationId] = useState<DestinationId>('udaipur');
  const [themeId, setThemeId] = useState<ThemeId>('royal');
  const [packageId, setPackageId] = useState<PackageId>('cinematic');
  const [participants, setParticipants] = useState(2);
  const [shootDate, setShootDate] = useState('');
  const [stylingAddOn, setStylingAddOn] = useState(true);

  const destination = destinations.find((item) => item.id === destinationId) || destinations[0];
  const theme = themes.find((item) => item.id === themeId) || themes[0];
  const selectedPackage = packages.find((item) => item.id === packageId) || packages[1];
  const permitCost = destinationId === 'paris' ? 12000 : 8000;
  const stylingCost = stylingAddOn ? 12000 : 0;
  const total = selectedPackage.photographer + permitCost + stylingCost;
  const steps = ['Destination', 'Details', 'Aesthetic', 'Package'];

  const availableThemes = useMemo(
    () => themes.filter((themeOption) => destination.themes.includes(themeOption.id)),
    [destination]
  );

  const selectDestination = (id: DestinationId) => {
    setDestinationId(id);
    const nextDestination = destinations.find((item) => item.id === id);
    if (nextDestination && !nextDestination.themes.includes(themeId)) setThemeId(nextDestination.themes[0]);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#17201D]">
      <header className="border-b border-[#EAE6DD] bg-white/90 px-4 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button type="button" onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-bold text-[#68736F] hover:text-[#FF6B4A]">
            <ArrowLeft className="h-4 w-4" /> Back to GlobeTrotter
          </button>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#FF6B4A]"><Camera className="h-4 w-4" /> Studio planner</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-10 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F1D9C8] bg-[#FFF0E8] px-3 py-1.5 text-xs font-bold text-[#B85C48]"><Sparkles className="h-3.5 w-3.5" /> Your destination love story</div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Plan the frame-worthy part.</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#68736F] sm:text-lg">Build a wedding or pre-wedding photoshoot with local talent, styling direction, and a budget that stays visible from the first idea to the final gallery.</p>
        </div>

        <div className="mb-8 flex max-w-3xl items-center gap-2 overflow-x-auto pb-2">
          {steps.map((label, index) => {
            const number = index + 1;
            return <React.Fragment key={label}><div className={`flex shrink-0 items-center gap-2 text-sm font-bold ${step >= number ? 'text-[#FF6B4A]' : 'text-[#9BA3A0]'}`}><span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${step > number ? 'border-[#20B8A6] bg-[#20B8A6] text-white' : step === number ? 'border-[#FF6B4A] bg-[#FF6B4A] text-white' : 'border-[#D9D4CA]'}`}>{step > number ? <Check className="h-4 w-4" /> : number}</span>{label}</div>{index < steps.length - 1 && <div className={`h-px min-w-8 flex-1 ${step > number ? 'bg-[#20B8A6]' : 'bg-[#D9D4CA]'}`} />}</React.Fragment>;
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[2rem] border border-[#EAE6DD] bg-white p-5 shadow-sm sm:p-8">
            {step === 1 && <div className="space-y-6"><div><h2 className="text-2xl font-black">Choose your backdrop</h2><p className="mt-1 text-sm text-[#68736F]">Start with the place that already feels like your story.</p></div><div className="grid gap-4 sm:grid-cols-2">{destinations.map((item) => <button type="button" key={item.id} onClick={() => selectDestination(item.id)} className={`group overflow-hidden rounded-2xl border-2 text-left transition-all ${destinationId === item.id ? 'border-[#FF6B4A] shadow-lg shadow-[#FF6B4A]/10' : 'border-[#F0ECE5] hover:border-[#D9B9A8]'}`}><div className="relative h-36 overflow-hidden"><img src={item.image} alt={`${item.name}, ${item.country}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /><div className="absolute bottom-3 left-4 text-white"><p className="text-lg font-black">{item.name}</p><p className="text-xs font-medium text-white/80">{item.country}</p></div>{destinationId === item.id && <span className="absolute right-3 top-3 rounded-full bg-white p-1.5 text-[#FF6B4A]"><Check className="h-4 w-4" /></span>}</div></button>)}</div></div>}

            {step === 2 && <div className="space-y-7"><div><h2 className="text-2xl font-black">Tell us about the day</h2><p className="mt-1 text-sm text-[#68736F]">We use this to shape the pace and production plan.</p></div><div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm font-bold">Shoot date<input type="date" value={shootDate} onChange={(event) => setShootDate(event.target.value)} className="w-full rounded-xl border border-[#EAE6DD] bg-[#FFFDF8] px-4 py-3 font-semibold focus:border-[#FF6B4A] focus:outline-none" /></label><div className="space-y-2 text-sm font-bold"><span>Participants</span><div className="flex items-center justify-between rounded-xl border border-[#EAE6DD] bg-[#FFFDF8] px-4 py-2"><button type="button" aria-label="Remove participant" onClick={() => setParticipants(Math.max(2, participants - 1))} className="h-9 w-9 rounded-lg bg-white text-xl text-[#FF6B4A] shadow-sm">-</button><span className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-[#20B8A6]" />{participants} people</span><button type="button" aria-label="Add participant" onClick={() => setParticipants(Math.min(12, participants + 1))} className="h-9 w-9 rounded-lg bg-white text-xl text-[#FF6B4A] shadow-sm">+</button></div></div></div><div className="rounded-2xl bg-[#F4FBF9] p-5"><div className="flex items-center gap-2 font-bold text-[#167F73]"><Heart className="h-4 w-4" /> Production note</div><p className="mt-2 text-sm leading-relaxed text-[#4A5551]">Your session is planned for {participants} participants in {destination.name}. We recommend keeping the first 30 minutes flexible for wardrobe and light checks.</p></div></div>}

            {step === 3 && <div className="space-y-6"><div><h2 className="text-2xl font-black">Set the visual language</h2><p className="mt-1 text-sm text-[#68736F]">Your styling guide updates with the theme you choose.</p></div><div className="grid gap-4 sm:grid-cols-2">{availableThemes.map((item) => <button type="button" key={item.id} onClick={() => setThemeId(item.id)} className={`rounded-2xl border-2 p-5 text-left transition-all ${themeId === item.id ? 'border-[#FF6B4A] bg-[#FFF8F4]' : 'border-[#F0ECE5] hover:border-[#D9B9A8]'}`}><div className="mb-4 flex gap-2">{item.colors.map((color) => <span key={color} className="h-7 w-7 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />)}</div><h3 className="font-black">{item.name}</h3><p className="mt-1 text-xs leading-relaxed text-[#68736F]">{item.description}</p></button>)}</div><div className="grid gap-4 rounded-2xl bg-[#FFF4D6] p-5 sm:grid-cols-2"><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#9A6B16]"><Palette className="h-4 w-4" /> Outfit direction</p><p className="mt-2 text-sm font-semibold leading-relaxed text-[#594A2A]">{theme.outfit}</p></div><div><p className="text-xs font-black uppercase tracking-wider text-[#9A6B16]">Beauty & details</p><p className="mt-2 text-sm font-semibold leading-relaxed text-[#594A2A]">{theme.styling}</p></div></div><label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#EAE6DD] p-4"><span><span className="block text-sm font-black">Add styling team</span><span className="text-xs text-[#68736F]">Hair, makeup, and accessory direction · {formatCurrency(12000)}</span></span><input type="checkbox" checked={stylingAddOn} onChange={(event) => setStylingAddOn(event.target.checked)} className="h-5 w-5 accent-[#FF6B4A]" /></label></div>}

            {step === 4 && <div className="space-y-6"><div><h2 className="text-2xl font-black">Choose your photographer</h2><p className="mt-1 text-sm text-[#68736F]">Every tier is verified, transparent, and designed for a different kind of story.</p></div><div className="space-y-3">{packages.map((item) => <button type="button" key={item.id} onClick={() => setPackageId(item.id)} className={`flex w-full flex-col gap-4 rounded-2xl border-2 p-5 text-left transition-all sm:flex-row sm:items-center sm:justify-between ${packageId === item.id ? 'border-[#FF6B4A] bg-[#FFF8F4]' : 'border-[#F0ECE5] hover:border-[#D9B9A8]'}`}><span className="flex items-start gap-3"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${packageId === item.id ? 'border-[#FF6B4A] bg-[#FF6B4A] text-white' : 'border-[#CFC8BD]'}`}>{packageId === item.id && <Check className="h-3 w-3" />}</span><span><span className="block font-black">{item.name}</span><span className="mt-1 block text-xs leading-relaxed text-[#68736F]">{item.description}</span><span className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-[#4A5551]"><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3 text-[#20B8A6]" />{item.hours}</span>{item.includes.map((include) => <span key={include}>· {include}</span>)}</span></span><span className="shrink-0 text-lg font-black text-[#FF6B4A]">{formatCurrency(item.photographer)}</span></span></button>)}</div></div>}

            <div className="mt-8 flex items-center justify-between border-t border-[#F0ECE5] pt-6"><button type="button" onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)} className="text-sm font-bold text-[#68736F] hover:text-[#17201D]">{step === 1 ? 'Cancel' : 'Back'}</button>{step < 4 ? <button type="button" onClick={() => setStep(step + 1)} className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B4A] px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-[#E55837]">Continue <ArrowRight className="h-4 w-4" /></button> : <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl bg-[#20B8A6] px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-[#179E8E]">Start another brief <Sparkles className="h-4 w-4" /></button>}</div>
          </section>

          <aside className="h-fit overflow-hidden rounded-[2rem] border border-[#EAE6DD] bg-[#17201D] text-white shadow-xl lg:sticky lg:top-6"><div className="relative h-48"><img src={destination.image} alt="" className="h-full w-full object-cover opacity-75" /><div className="absolute inset-0 bg-gradient-to-t from-[#17201D] to-transparent" /><div className="absolute bottom-5 left-6"><p className="text-xs font-bold uppercase tracking-wider text-[#FFC857]">Your brief</p><h2 className="mt-1 text-2xl font-black">{destination.name} · {theme.name}</h2></div></div><div className="space-y-5 p-6"><div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-white/10 p-3"><MapPin className="mb-2 h-4 w-4 text-[#FFC857]" /><span className="block text-xs text-white/60">Location</span><strong>{destination.country}</strong></div><div className="rounded-xl bg-white/10 p-3"><Users className="mb-2 h-4 w-4 text-[#FFC857]" /><span className="block text-xs text-white/60">Guests</span><strong>{participants} people</strong></div></div><div className="border-t border-white/15 pt-5"><div className="mb-3 flex items-center justify-between text-sm"><span className="text-white/70">Photographer · {selectedPackage.name}</span><strong>{formatCurrency(selectedPackage.photographer)}</strong></div><div className="mb-3 flex items-center justify-between text-sm"><span className="text-white/70">Location permits</span><strong>{formatCurrency(permitCost)}</strong></div><div className="mb-5 flex items-center justify-between text-sm"><span className="text-white/70">Styling add-on</span><strong>{formatCurrency(stylingCost)}</strong></div><div className="flex items-end justify-between border-t border-white/15 pt-4"><span className="text-sm font-bold">Estimated total</span><strong className="text-3xl font-black text-[#FFC857]">{formatCurrency(total)}</strong></div></div><div className="rounded-xl bg-[#20B8A6]/15 p-4"><p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#74E5D8]"><CheckCircle2 className="h-4 w-4" /> Included deliverables</p><div className="grid grid-cols-2 gap-y-2 text-xs text-white/80"><span>{selectedPackage.rawPhotos} raw photos</span><span>{selectedPackage.editedPhotos} edited photos</span><span>Outfit guide</span><span>Private gallery</span></div></div><p className="text-center text-[11px] leading-relaxed text-white/45">Pricing is an estimate in INR. Permits are confirmed with your selected local photographer.</p></div></aside>
        </div>
      </main>
    </div>
  );
};