import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BedDouble, Camera, Check, CheckCircle2, ChevronDown,
  Clapperboard, Clock3, Download, Heart, MapPin, Plane, Play, Printer, Search,
  Sparkles, Star, Users,
} from 'lucide-react';

const destinations = [
  { id: 'udaipur', name: 'Udaipur', country: 'India', region: 'domestic', image: 'https://images.unsplash.com/photo-1602643163983-ed0babc39797?auto=format&fit=crop&w=1000&q=85', stays: [{ name: 'The Oberoi Udaivilas', price: 22000, detail: 'Lakeside palace stay' }, { name: 'Aurika, Udaipur', price: 14000, detail: 'Hilltop suites with lake views' }] },
  { id: 'jaipur', name: 'Jaipur', country: 'India', region: 'domestic', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=85', stays: [{ name: 'Samode Haveli', price: 18000, detail: 'Courtyard heritage retreat' }, { name: 'The Johri', price: 12500, detail: 'Intimate boutique rooms' }] },
  { id: 'goa', name: 'Goa', country: 'India', region: 'domestic', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=85', stays: [{ name: 'Ahilya by the Sea', price: 16000, detail: 'Quiet oceanfront hideaway' }, { name: 'Elsewhere', price: 11000, detail: 'Private beach escape' }] },
  { id: 'mumbai', name: 'Mumbai', country: 'India', region: 'domestic', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=85', stays: [{ name: 'Taj Mahal Palace', price: 26000, detail: 'Iconic harbour-side luxury' }, { name: 'The St. Regis Mumbai', price: 21000, detail: 'Skyline suites and city lights' }] },
  { id: 'paris', name: 'Paris', country: 'France', region: 'international', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=85', stays: [{ name: 'Hotel Grand Powers', price: 24000, detail: 'Golden Triangle boutique stay' }, { name: 'Hôtel Providence', price: 17000, detail: 'Romantic Canal Saint-Martin base' }] },
  { id: 'bali', name: 'Bali', country: 'Indonesia', region: 'international', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=85', stays: [{ name: 'The Kayon Jungle Resort', price: 19000, detail: 'Canopy villas near Ubud' }, { name: 'Alila Seminyak', price: 15500, detail: 'Beachfront sunset suites' }] },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', region: 'international', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=85', stays: [{ name: 'One&Only The Palm', price: 28000, detail: 'Private beach and skyline views' }, { name: 'Al Maha Desert Resort', price: 32000, detail: 'Desert oasis suites' }] },
  { id: 'santorini', name: 'Santorini', country: 'Greece', region: 'international', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=85', stays: [{ name: 'Canaves Oia Suites', price: 30000, detail: 'Caldera-view cave suites' }, { name: 'Katikies Santorini', price: 27000, detail: 'Cliffside sunset hideaway' }] },
];

const rawThemeData = [
  { id: 'royal', destinations: ['udaipur', 'jaipur', 'paris'], name: 'Royal Heritage', detail: 'Silks, arches, jewel tones', colors: ['#9A5B42', '#D6B27B', '#F6E8CF'], outfits: [{ name: 'Ivory sherwani + antique gold', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=500&q=80' }, { name: 'Jewel-tone lehenga + silk dupatta', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80' }, { name: 'Velvet bandh gala accents', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=500&q=80' }], image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=85' },
  { id: 'bohemian', destinations: ['goa', 'bali', 'santorini'], name: 'Bohemian Beach', detail: 'Barefoot, sun-washed, effortless', colors: ['#D17A58', '#F2C98B', '#F7EFE0'], outfits: [{ name: 'Linen shirt + relaxed trousers', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80' }, { name: 'Flowing chiffon + crochet layers', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=500&q=80' }, { name: 'Terracotta accessories + wildflowers', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=500&q=80' }], image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=85' },
  { id: 'cinematic', destinations: ['mumbai', 'dubai', 'paris'], name: 'Modern Cinematic', detail: 'City lights, contrast, movement', colors: ['#203A43', '#B85C48', '#D9C4A6'], outfits: [{ name: 'Monochrome suit + statement coat', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500&q=80' }, { name: 'Satin slip + sculptural jewelry', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=80' }, { name: 'One rich accent color throughout', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80' }], image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=85' },
];

const rawVendorData = [
  { id: 'luma', destinations: ['udaipur', 'jaipur'], tier: 'Standard', name: 'Standard · Luma Stories', rating: 4.9, reviews: 86, price: 15000, location: 'Udaipur · Jaipur', services: ['Stills', 'Cinematic Video'], images: ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=500&q=80'] },
  { id: 'frame', destinations: ['goa', 'bali', 'santorini'], tier: 'Cinematic', name: 'Cinematic · Frame & Vow', rating: 4.8, reviews: 124, price: 24000, location: 'Goa · Bali · Santorini', services: ['Stills', 'Cinematic Video', 'Drone'], images: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=500&q=80'] },
  { id: 'noir', destinations: ['mumbai', 'paris', 'dubai'], tier: 'Celebrity Style', name: 'Celebrity Style · Noir Atelier', rating: 5.0, reviews: 42, price: 38000, location: 'Mumbai · Paris · Dubai', services: ['Stills', 'Cinematic Video', 'Drone'], images: ['https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=500&q=80'] },
];

const rawThemeDataSource = rawThemeData;
const rawVendorDataSource = rawVendorData;

const steps = ['Route', 'Duration', 'Theme', 'Vendors', 'Stay', 'Summary'];
const money = (value) => `₹${value.toLocaleString('en-IN')}`;

class PlannerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="flex min-h-screen items-center justify-center bg-[#FFF9F2] p-6 text-center"><div className="max-w-md rounded-3xl border border-[#EAE6DD] bg-white p-8 shadow-sm"><CheckCircle2 className="mx-auto h-10 w-10 text-[#FF6B4A]" /><h1 className="mt-4 text-2xl font-black text-[#17201D]">This planning brief needs a refresh</h1><p className="mt-2 text-sm leading-relaxed text-[#68736F]">We could not render this brief safely. Your existing trips are unaffected.</p><button type="button" onClick={() => window.location.assign('/dashboard')} className="mt-6 rounded-xl bg-[#FF6B4A] px-5 py-3 text-sm font-black text-white">Back to dashboard</button></div></div>;
    }
    return this.props.children;
  }
}

function PreWeddingPlannerContent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [sourceCity, setSourceCity] = useState('Delhi');
  const [destinationId, setDestinationId] = useState('udaipur');
  const [duration, setDuration] = useState('express');
  const [selectedDurationDays, setDurationDays] = useState(3);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [themeId, setThemeId] = useState('royal');
  const [vendorId, setVendorId] = useState('luma');
  const [stayIndex, setStayIndex] = useState(0);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [addOns, setAddOns] = useState({ video: true, drone: false, makeup: true });
  const [confirmed, setConfirmed] = useState(false);
  const destinationCarouselRef = useRef(null);

  const destination = destinations.find((item) => item.id === destinationId) || destinations[0];
  const themeData = rawThemeDataSource.filter((item) => item?.destinations?.includes(destination?.id));
  const vendorData = rawVendorDataSource.filter((item) => item?.destinations?.includes(destination?.id));
  const rawThemeData = themeData;
  const rawVendorData = vendorData;
  const theme = themeData.find((item) => item?.id === themeId) || themeData[0] || rawThemeDataSource[0];
  const vendor = vendorData.find((item) => item?.id === vendorId) || vendorData[0] || rawVendorDataSource[0];
  const stay = destination?.stays?.[stayIndex] || destination?.stays?.[0] || { name: 'Stay to be confirmed', price: 0, detail: '' };
  const actualDurationDays = duration === 'express' ? 1 : selectedDurationDays;
  const durationDays = actualDurationDays;
  const durationLabel = duration === 'express' ? '1-Day Express Shoot' : `Multi-Day Cinematic · ${selectedDurationDays} Days`;
  const vendorPrice = (vendor?.price || 0) + (duration === 'cinematic' ? 28000 : 0);
  const videoCost = addOns?.video && !vendor?.services?.includes('Cinematic Video') ? 9000 : 0;
  const droneCost = addOns?.drone ? 7000 : 0;
  const makeupCost = addOns?.makeup ? 10000 : 0;
  const stayCost = (stay?.price || 0) * actualDurationDays;
  const total = vendorPrice + videoCost + droneCost + makeupCost + stayCost;

  const stayOptions = useMemo(() => destination.stays, [destination]);
  const chooseDestination = (id) => {
    const nextThemes = rawThemeDataSource.filter((item) => item?.destinations?.includes(id));
    const nextVendors = rawVendorDataSource.filter((item) => item?.destinations?.includes(id));
    setDestinationId(id);
    setThemeId(nextThemes[0]?.id || 'royal');
    setVendorId(nextVendors[0]?.id || 'luma');
    setStayIndex(0);
  };
  const filteredDestinations = destinations.filter((item) => {
    const matchesQuery = `${item.name} ${item.country}`.toLowerCase().includes(destinationQuery.toLowerCase());
    return matchesQuery && (destinationFilter === 'all' || item.region === destinationFilter);
  });
  const toggleAddon = (key) => setAddOns((current) => ({ ...current, [key]: !current[key] }));
  const scrollDestinations = (direction) => {
    destinationCarouselRef.current?.scrollBy({ left: direction * 280, behavior: 'smooth' });
  };
  useEffect(() => {
    const destinationButton = Array.from(document.querySelectorAll('button')).find(
      (button) => button.querySelector('img') && destinations.some((item) => button.textContent?.includes(item.name))
    );
    const carousel = destinationButton?.parentElement;
    if (!carousel) return;
    destinationCarouselRef.current = carousel;
    carousel.className = 'flex gap-4 overflow-x-auto pb-4 scrollbar-none';
    Array.from(carousel.children).forEach((child) => {
      if (child instanceof HTMLElement) child.classList.add('shrink-0', 'w-[240px]');
    });
  }, [destinationQuery, destinationFilter]);
  const updateDuration = (value) => {
    setDuration(value);
    if (value === 'express') setDurationDays(1);
  };
  const updateStartDate = (value) => {
    setStartDate(value);
    if (duration === 'express') setEndDate(value);
    else if (value && endDate && endDate < value) setEndDate(value);
  };
  const updateDurationDays = (value) => {
    const nextDays = Number(value);
    setDurationDays(nextDays);
    if (startDate) {
      const end = new Date(`${startDate}T00:00:00`);
      end.setDate(end.getDate() + nextDays - 1);
      setEndDate(end.toISOString().slice(0, 10));
    }
  };
  const printDraft = () => window.print();
  const downloadDraft = () => {
    const draft = `GlobeTrotter Pre-Wedding Brief\n\nRoute: ${sourceCity} to ${destination.name}\nDates: ${startDate || 'To be confirmed'} - ${endDate || 'To be confirmed'}\nDuration: ${durationLabel}\nTheme: ${theme.name}\nOutfit guide: ${theme.outfits.map((outfit) => outfit.name).join(', ')}\nPhotographer: ${vendor.name}\nStay: ${stay.name}\n\nBudget\nPhotographer: ${money(vendorPrice)}\nStay: ${money(stayCost)}\nAdd-ons: ${money(videoCost + droneCost + makeupCost)}\nTotal: ${money(total)}`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([draft], { type: 'text/plain' }));
    link.download = `pre-wedding-brief-${destination.id}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#17201D]">
      <header className="border-b border-[#EAE6DD] bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button type="button" onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-bold text-[#68736F] hover:text-[#FF6B4A]"><ArrowLeft className="h-4 w-4" /> Back to GlobeTrotter</button>
          <div className="flex items-center gap-2"><span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#FF6B4A]"><Camera className="h-4 w-4" /> Pre-wedding studio</span>{step === 1 && <div className="flex gap-1"><button type="button" onClick={() => scrollDestinations(-1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EAE6DD] bg-white text-base font-bold text-[#556960] hover:border-[#FF6B4A] hover:text-[#FF6B4A]" aria-label="Scroll destinations left">‹</button><button type="button" onClick={() => scrollDestinations(1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EAE6DD] bg-white text-base font-bold text-[#556960] hover:border-[#FF6B4A] hover:text-[#FF6B4A]" aria-label="Scroll destinations right">›</button></div>}</div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-8 sm:py-7">
        <div className="mb-4 max-w-3xl"><h1 className="text-3xl font-black tracking-tight sm:text-4xl">Make the memory look like you.</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#68736F] sm:text-base">Plan a destination pre-wedding shoot with local creatives, romantic stays, and a clear budget draft.</p></div>
        <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1">{steps.map((label, index) => { const number = index + 1; return <React.Fragment key={label}><div className={`flex shrink-0 items-center gap-1.5 text-xs font-black ${step >= number ? 'text-[#FF6B4A]' : 'text-[#9BA3A0]'}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${step > number ? 'border-[#20B8A6] bg-[#20B8A6] text-white' : step === number ? 'border-[#FF6B4A] bg-[#FF6B4A] text-white' : 'border-[#D9D4CA]'}`}>{step > number ? <Check className="h-3.5 w-3.5" /> : number}</span>{label}</div>{index < steps.length - 1 && <div className={`h-px min-w-5 flex-1 ${step > number ? 'bg-[#20B8A6]' : 'bg-[#D9D4CA]'}`} />}</React.Fragment>; })}</div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[2rem] border border-[#EAE6DD] bg-white p-5 shadow-sm sm:p-8">
            {step === 1 && <div className="space-y-6"><div><h2 className="text-2xl font-black">Where does your story begin?</h2><p className="mt-1 text-sm text-[#68736F]">Set the route for your destination celebration.</p></div><label className="block text-sm font-black">Source city<input value={sourceCity} onChange={(event) => setSourceCity(event.target.value)} placeholder="Delhi or Mumbai" className="mt-2 w-full rounded-xl border border-[#EAE6DD] bg-[#FFFDF8] px-4 py-3 font-semibold outline-none focus:border-[#FF6B4A]" /></label><div><div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-black">Choose destination</p><div className="flex gap-2"><label className="flex min-w-0 items-center gap-2 rounded-xl border border-[#EAE6DD] bg-[#FFFDF8] px-3 py-2 text-xs text-[#68736F]"><Search className="h-4 w-4 shrink-0" /><input value={destinationQuery} onChange={(event) => setDestinationQuery(event.target.value)} placeholder="Search places" className="w-full bg-transparent font-semibold outline-none" /></label><select value={destinationFilter} onChange={(event) => setDestinationFilter(event.target.value)} className="rounded-xl border border-[#EAE6DD] bg-[#FFFDF8] px-3 py-2 text-xs font-bold outline-none"><option value="all">All</option><option value="domestic">Domestic</option><option value="international">International</option></select></div></div><div className="grid gap-3 sm:grid-cols-2">{filteredDestinations.map((item) => <button type="button" key={item.id} onClick={() => chooseDestination(item.id)} className={`relative overflow-hidden rounded-2xl border-2 text-left ${destinationId === item.id ? 'border-[#FF6B4A]' : 'border-[#F0ECE5] hover:border-[#D9B9A8]'}`}><img src={item.image} alt={`${item.name}, ${item.country}`} className="h-28 w-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 p-3 pt-8 text-white"><p className="font-black">{item.name}</p><p className="text-[11px] text-white/75">{item.country} · {item.region}</p></div>{destinationId === item.id && <span className="absolute right-3 top-3 rounded-full bg-white p-1.5 text-[#FF6B4A]"><Check className="h-4 w-4" /></span>}</button>)}{filteredDestinations.length === 0 && <p className="col-span-full rounded-xl bg-[#FFF8F4] p-5 text-sm text-[#68736F]">No destinations match that search.</p>}</div></div></div>}
            {step === 2 && <div className="space-y-6"><div><h2 className="text-2xl font-black">How much time do you want?</h2><p className="mt-1 text-sm text-[#68736F]">Choose the pace that fits your vision.</p></div><div className="grid gap-4 sm:grid-cols-2">{[{ id: 'express', title: '1-Day Express Shoot', detail: 'One location, focused portraits, fast and beautiful.', icon: Camera }, { id: 'cinematic', title: 'Multi-Day Cinematic Package', detail: '2 to 5 days across multiple locations with room to breathe.', icon: Clapperboard }].map((item) => { const Icon = item.icon; return <button type="button" key={item.id} onClick={() => updateDuration(item.id)} className={`rounded-2xl border-2 p-6 text-left ${duration === item.id ? 'border-[#FF6B4A] bg-[#FFF8F4]' : 'border-[#F0ECE5] hover:border-[#D9B9A8]'}`}><Icon className="mb-5 h-7 w-7 text-[#FF6B4A]" /><h3 className="font-black">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-[#68736F]">{item.detail}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#20B8A6]"><Clock3 className="h-3.5 w-3.5" /> {item.id === 'express' ? 'Best for a single hero day' : 'Best for a complete visual story'}</span></button>; })}</div><div className="grid gap-4 sm:grid-cols-3"><label className="text-sm font-black">Start date<input type="date" value={startDate} onChange={(event) => updateStartDate(event.target.value)} className="mt-2 w-full rounded-xl border border-[#EAE6DD] bg-[#FFFDF8] px-3 py-3 font-semibold outline-none focus:border-[#FF6B4A]" /></label>{duration === 'cinematic' && <label className="text-sm font-black">Shoot days<select value={selectedDurationDays} onChange={(event) => updateDurationDays(event.target.value)} className="mt-2 w-full rounded-xl border border-[#EAE6DD] bg-[#FFFDF8] px-3 py-3 font-semibold outline-none focus:border-[#FF6B4A]"><option value="2">2 days</option><option value="3">3 days</option><option value="4">4 days</option><option value="5">5 days</option></select></label>}<label className="text-sm font-black">End date<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} min={startDate || undefined} className="mt-2 w-full rounded-xl border border-[#EAE6DD] bg-[#FFFDF8] px-3 py-3 font-semibold outline-none focus:border-[#FF6B4A]" /></label></div></div>}
            {step === 3 && <div className="space-y-6"><div><h2 className="text-2xl font-black">Curate your visual language</h2><p className="mt-1 text-sm text-[#68736F]">Pick a theme to unlock matching outfit direction.</p></div><div className="grid gap-4 sm:grid-cols-3">{rawThemeData.map((item) => <button type="button" key={item.id} onClick={() => setThemeId(item.id)} className={`overflow-hidden rounded-2xl border-2 text-left ${themeId === item.id ? 'border-[#FF6B4A]' : 'border-[#F0ECE5] hover:border-[#D9B9A8]'}`}><img src={item.image} alt={item.name} className="h-32 w-full object-cover" /><div className="p-4"><div className="mb-3 flex gap-1.5">{item.colors.map((color) => <span key={color} className="h-5 w-5 rounded-full" style={{ backgroundColor: color }} />)}</div><h3 className="font-black">{item.name}</h3><p className="mt-1 text-xs text-[#68736F]">{item.detail}</p></div></button>)}</div><div className="rounded-2xl bg-[#FFF4D6] p-5"><p className="text-xs font-black uppercase tracking-wider text-[#9A6B16]">Matching outfit direction</p><div className="mt-3 grid gap-3 sm:grid-cols-3">{theme.outfits.map((outfit) => <div key={outfit.name} className="overflow-hidden rounded-xl bg-white/70"><img src={outfit.image} alt={outfit.name} className="h-28 w-full object-cover" /><p className="p-3 text-sm font-bold text-[#594A2A]">{outfit.name}</p></div>)}</div></div></div>}
            {step === 4 && <div className="space-y-6"><div><h2 className="text-2xl font-black">Meet your creative team</h2><p className="mt-1 text-sm text-[#68736F]">Curated local vendors with transparent starting prices.</p></div><div className="space-y-4">{rawVendorData.map((item) => <button type="button" key={item.id} onClick={() => setVendorId(item.id)} className={`w-full rounded-2xl border-2 p-4 text-left ${vendorId === item.id ? 'border-[#FF6B4A] bg-[#FFF8F4]' : 'border-[#F0ECE5] hover:border-[#D9B9A8]'}`}><div className="flex flex-col gap-4 sm:flex-row"><div className="grid grid-cols-3 gap-1 sm:w-44 sm:shrink-0">{item.images.map((image, index) => <div key={image} className={`relative overflow-hidden rounded-lg ${index === 0 ? 'col-span-2 row-span-2' : ''}`}><img src={image} alt="Portfolio sample" className="h-full min-h-16 w-full object-cover" />{index === 0 && item.services.includes('Cinematic Video') && <span className="absolute bottom-2 left-2 rounded-full bg-black/60 p-1 text-white"><Play className="h-3 w-3 fill-current" /></span>}</div>)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-black">{item.name}</h3><p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#C79546]"><Star className="h-3.5 w-3.5 fill-current" /> {item.rating} <span className="text-[#68736F]">({item.reviews} reviews)</span></p></div><p className="text-right text-sm font-black text-[#FF6B4A]">{money(item.price)} <span className="block text-[10px] font-bold text-[#68736F]">onwards · 1 day</span></p></div><p className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#68736F]"><MapPin className="h-3.5 w-3.5" /> {item.location}</p><div className="mt-3 flex flex-wrap gap-2">{item.services.map((service) => <span key={service} className="rounded-full bg-[#DDF7F2] px-2.5 py-1 text-[11px] font-bold text-[#167F73]">{service}</span>)}</div></div></div></button>)}</div></div>}
            {step === 5 && <div className="space-y-6"><div><h2 className="text-2xl font-black">Stay somewhere unforgettable</h2><p className="mt-1 text-sm text-[#68736F]">Romantic bases near your best shoot locations in {destination.name}.</p></div><div className="space-y-3">{stayOptions.map((item, index) => <button type="button" key={item.name} onClick={() => setStayIndex(index)} className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left ${stayIndex === index ? 'border-[#FF6B4A] bg-[#FFF8F4]' : 'border-[#F0ECE5] hover:border-[#D9B9A8]'}`}><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF4D6] text-[#B87D1D]"><BedDouble className="h-6 w-6" /></span><span className="min-w-0 flex-1"><span className="block font-black">{item.name}</span><span className="mt-1 block text-xs text-[#68736F]">{item.detail}</span></span><span className="shrink-0 text-right text-sm font-black text-[#FF6B4A]">{money(item.price)}<span className="block text-[10px] text-[#68736F]">per night</span></span>{stayIndex === index && <Check className="h-5 w-5 shrink-0 text-[#20B8A6]" />}</button>)}</div><div className="rounded-2xl border border-[#EAE6DD] p-5"><p className="mb-3 text-sm font-black">Add-ons for your brief</p><div className="grid gap-3 sm:grid-cols-3">{[{ key: 'video', label: 'Cinematic video', price: videoCost }, { key: 'drone', label: 'Drone coverage', price: droneCost }, { key: 'makeup', label: 'Hair & makeup', price: makeupCost }].map((addon) => <label key={addon.key} className="flex cursor-pointer items-start gap-2 rounded-xl bg-[#FFFDF8] p-3 text-xs font-bold"><input type="checkbox" checked={addOns[addon.key]} onChange={() => toggleAddon(addon.key)} className="mt-0.5 h-4 w-4 accent-[#FF6B4A]" /><span>{addon.label}<span className="mt-1 block font-normal text-[#68736F]">{addon.price ? `+${money(addon.price)}` : 'Included'}</span></span></label>)}</div></div></div>}
            {step === 6 && <div className="space-y-6">{confirmed ? <div className="rounded-2xl bg-[#F4FBF9] p-8 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-[#20B8A6]" /><h2 className="mt-4 text-2xl font-black">Brief saved for {destination.name}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#68736F]">Your draft is ready. A curated vendor shortlist and stay suggestions are attached to this planning brief.</p><button type="button" onClick={() => setConfirmed(false)} className="mt-6 rounded-xl bg-[#20B8A6] px-5 py-3 text-sm font-black text-white">Review summary</button></div> : <><div><h2 className="text-2xl font-black">Your pre-wedding brief</h2><p className="mt-1 text-sm text-[#68736F]">Everything is itemized before you commit.</p></div><div className="rounded-2xl bg-[#17201D] p-6 text-white"><div className="grid gap-4 sm:grid-cols-2"><div><p className="text-xs text-white/60">Route</p><p className="mt-1 font-black"><Plane className="mr-1 inline h-4 w-4 text-[#FFC857]" /> {sourceCity} → {destination.name}</p></div><div><p className="text-xs text-white/60">Plan</p><p className="mt-1 font-black">{durationLabel}</p></div><div><p className="text-xs text-white/60">Theme</p><p className="mt-1 font-black">{theme.name}</p></div><div><p className="text-xs text-white/60">Creative team</p><p className="mt-1 font-black">{vendor.name}</p></div></div></div><div className="divide-y divide-[#F0ECE5] rounded-2xl border border-[#EAE6DD] px-5"><div className="flex justify-between py-4 text-sm"><span>Photographer · {durationLabel}</span><strong>{money(vendorPrice)}</strong></div><div className="flex justify-between py-4 text-sm"><span>Stay · {stay.name} · {selectedDurationDays} night{selectedDurationDays > 1 ? 's' : ''}</span><strong>{money(stayCost)}</strong></div>{videoCost > 0 && <div className="flex justify-between py-4 text-sm"><span>Cinematic video add-on</span><strong>{money(videoCost)}</strong></div>}{droneCost > 0 && <div className="flex justify-between py-4 text-sm"><span>Drone coverage</span><strong>{money(droneCost)}</strong></div>}{makeupCost > 0 && <div className="flex justify-between py-4 text-sm"><span>Hair & makeup</span><strong>{money(makeupCost)}</strong></div>}<div className="flex items-center justify-between py-5"><span className="font-black">Estimated total</span><strong className="text-3xl font-black text-[#FF6B4A]">{money(total)}</strong></div></div><button type="button" onClick={() => setConfirmed(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B4A] px-5 py-4 text-sm font-black text-white hover:bg-[#E55837]"><Heart className="h-4 w-4" /> Confirm booking brief</button></>}</div>}
            <div className="mt-8 flex items-center justify-between border-t border-[#F0ECE5] pt-6"><button type="button" onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)} className="text-sm font-bold text-[#68736F] hover:text-[#17201D]">{step === 1 ? 'Cancel' : 'Back'}</button>{step < 6 && <button type="button" onClick={() => setStep(step + 1)} className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B4A] px-5 py-3 text-sm font-black text-white hover:bg-[#E55837]">Continue <ArrowRight className="h-4 w-4" /></button>}{step === 6 && !confirmed && <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl border border-[#EAE6DD] px-5 py-3 text-sm font-black text-[#68736F]">Edit brief <ChevronDown className="h-4 w-4 rotate-90" /></button>}</div>
          {step === 6 && !confirmed && <div className="flex flex-wrap gap-3"><button type="button" onClick={downloadDraft} className="inline-flex items-center gap-2 rounded-xl border border-[#EAE6DD] bg-white px-4 py-3 text-sm font-black text-[#68736F] hover:border-[#FF6B4A] hover:text-[#FF6B4A]"><Download className="h-4 w-4" /> Download draft</button><button type="button" onClick={printDraft} className="inline-flex items-center gap-2 rounded-xl border border-[#EAE6DD] bg-white px-4 py-3 text-sm font-black text-[#68736F] hover:border-[#FF6B4A] hover:text-[#FF6B4A]"><Printer className="h-4 w-4" /> Print / PDF</button></div>}
          </section>
          <aside className="h-fit overflow-hidden rounded-[2rem] border border-[#EAE6DD] bg-[#17201D] text-white shadow-xl lg:sticky lg:top-6"><div className="relative h-44"><img src={destination.image} alt="" className="h-full w-full object-cover opacity-75" /><div className="absolute inset-0 bg-gradient-to-t from-[#17201D] to-transparent" /><div className="absolute bottom-5 left-6"><p className="text-xs font-bold uppercase tracking-wider text-[#FFC857]">Live budget draft</p><h2 className="mt-1 text-2xl font-black">{destination.name}</h2></div></div><div className="space-y-5 p-6"><div className="flex items-center justify-between text-sm"><span className="text-white/65">Photographer</span><strong>{money(vendorPrice)}</strong></div><div className="flex items-center justify-between text-sm"><span className="text-white/65">Stay</span><strong>{money(stayCost)}</strong></div><div className="flex items-center justify-between text-sm"><span className="text-white/65">Add-ons</span><strong>{money(videoCost + droneCost + makeupCost)}</strong></div><div className="border-t border-white/15 pt-5"><span className="text-sm font-bold">Estimated total</span><strong className="mt-1 block text-3xl font-black text-[#FFC857]">{money(total)}</strong></div><div className="rounded-xl bg-[#20B8A6]/15 p-4 text-xs text-white/80"><p className="mb-2 flex items-center gap-2 font-black text-[#74E5D8]"><CheckCircle2 className="h-4 w-4" /> Curated deliverables</p><p>Portfolio shortlist, outfit direction, stay pairing, and a vendor-ready booking brief.</p></div></div></aside>
        </div>
      </main>
    </div>
  );
}

export default function PreWeddingPlanner() {
  return <PlannerErrorBoundary><PreWeddingPlannerContent /></PlannerErrorBoundary>;
}
