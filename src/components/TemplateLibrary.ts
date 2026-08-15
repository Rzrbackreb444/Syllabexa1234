export interface ColoringTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Master KDP';
  commercialKdpReady: boolean;
  svgContent: string;
}

export const COLORING_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'template-bubble-mountain',
    name: 'Bubble Mountain & Magical Washing Machine',
    title: 'Bubble Mountain & Magical Washing Machine',
    description: 'Whimsical laundromat scene with floating bubbles and playful soap waves, optimized for children books.',
    category: 'Whimsical',
    difficulty: 'Beginner',
    commercialKdpReady: true,
    svgContent: `<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="1000" height="1000" fill="white"/>
  <!-- Border -->
  <rect x="30" y="30" width="940" height="940" fill="none" stroke="#1e293b" stroke-width="8" rx="20"/>
  <rect x="45" y="45" width="910" height="910" fill="none" stroke="#1e293b" stroke-width="3" rx="12"/>
  
  <!-- Title banner -->
  <path d="M 200 120 Q 500 80 800 120 L 780 180 Q 500 140 220 180 Z" fill="none" stroke="#1e293b" stroke-width="4"/>
  <text x="500" y="150" font-family="'Playfair Display', serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#1e293b">BUBBLE MOUNTAIN</text>
  
  <!-- Washing Machine Outer -->
  <rect x="300" y="300" width="400" height="500" fill="none" stroke="#1e293b" stroke-width="6" rx="30"/>
  <rect x="340" y="340" width="320" height="60" fill="none" stroke="#1e293b" stroke-width="4" rx="10"/>
  
  <!-- Buttons and dials -->
  <circle cx="380" cy="370" r="18" fill="none" stroke="#1e293b" stroke-width="4"/>
  <circle cx="440" cy="370" r="14" fill="none" stroke="#1e293b" stroke-width="4"/>
  <circle cx="490" cy="370" r="14" fill="none" stroke="#1e293b" stroke-width="4"/>
  <rect x="540" y="355" width="90" height="30" fill="none" stroke="#1e293b" stroke-width="4" rx="5"/>
  
  <!-- Door Outer Ring -->
  <circle cx="500" cy="580" r="160" fill="none" stroke="#1e293b" stroke-width="8"/>
  <circle cx="500" cy="580" r="130" fill="none" stroke="#1e293b" stroke-width="4"/>
  
  <!-- Swirling bubbles inside drum -->
  <path d="M 400 580 Q 500 500 600 580 T 400 640" fill="none" stroke="#1e293b" stroke-width="4"/>
  <circle cx="460" cy="540" r="20" fill="none" stroke="#1e293b" stroke-width="3"/>
  <circle cx="530" cy="560" r="28" fill="none" stroke="#1e293b" stroke-width="3"/>
  <circle cx="480" cy="610" r="15" fill="none" stroke="#1e293b" stroke-width="3"/>
  
  <!-- Bubbles floating outside -->
  <circle cx="200" cy="300" r="45" fill="none" stroke="#1e293b" stroke-width="4"/>
  <circle cx="215" cy="290" r="12" fill="none" stroke="#1e293b" stroke-width="2"/>
  <circle cx="150" cy="420" r="60" fill="none" stroke="#1e293b" stroke-width="5"/>
  <circle cx="170" cy="400" r="18" fill="none" stroke="#1e293b" stroke-width="2"/>
  <circle cx="250" cy="520" r="35" fill="none" stroke="#1e293b" stroke-width="4"/>
  
  <circle cx="800" cy="280" r="50" fill="none" stroke="#1e293b" stroke-width="4"/>
  <circle cx="820" cy="265" r="14" fill="none" stroke="#1e293b" stroke-width="2"/>
  <circle cx="850" cy="440" r="65" fill="none" stroke="#1e293b" stroke-width="5"/>
  <circle cx="750" cy="500" r="40" fill="none" stroke="#1e293b" stroke-width="4"/>

  <!-- Soap waves at bottom -->
  <path d="M 60 840 Q 150 800 250 840 T 450 840 T 650 840 T 850 840 T 940 840 L 940 920 L 60 920 Z" fill="none" stroke="#1e293b" stroke-width="4"/>
  <path d="M 60 870 Q 200 830 350 870 T 650 870 T 940 870" fill="none" stroke="#1e293b" stroke-width="3"/>
</svg>`
  },
  {
    id: 'template-sacred-mandala',
    name: 'Sacred Harmony Mandala',
    title: 'Sacred Harmony Mandala',
    description: 'Intricate radial symmetry design perfect for deep focus, meditation, and adult coloring therapy.',
    category: 'Mandala',
    difficulty: 'Master KDP',
    commercialKdpReady: true,
    svgContent: `<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="1000" height="1000" fill="white"/>
  <g stroke="#1e293b" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round">
    <circle cx="500" cy="500" r="450" stroke-width="6"/>
    <circle cx="500" cy="500" r="430"/>
    <circle cx="500" cy="500" r="380"/>
    <circle cx="500" cy="500" r="300"/>
    <circle cx="500" cy="500" r="220"/>
    <circle cx="500" cy="500" r="140"/>
    <circle cx="500" cy="500" r="60"/>
    
    <path d="M 500 440 C 520 470 520 470 500 500 C 480 470 480 470 500 440 Z"/>
    <path d="M 500 560 C 520 530 520 530 500 500 C 480 530 480 530 500 560 Z"/>
    <path d="M 440 500 C 470 520 470 520 500 500 C 470 480 470 480 440 500 Z"/>
    <path d="M 560 500 C 530 520 530 520 500 500 C 530 480 530 480 560 500 Z"/>
    
    <path d="M 500 280 C 540 350 540 380 500 440 C 460 380 460 350 500 280 Z"/>
    <path d="M 500 720 C 540 650 540 620 500 560 C 460 620 460 650 500 720 Z"/>
    <path d="M 280 500 C 350 540 380 540 440 500 C 380 460 350 460 280 500 Z"/>
    <path d="M 720 500 C 650 540 620 540 560 500 C 620 460 650 460 720 500 Z"/>

    <circle cx="500" cy="500" r="20"/>
    <line x1="100" y1="500" x2="900" y2="500"/>
    <line x1="500" y1="100" x2="500" y2="900"/>
    <line x1="217" y1="217" x2="783" y2="783"/>
    <line x1="217" y1="783" x2="783" y2="217"/>
  </g>
</svg>`
  },
  {
    id: 'template-celestial-zodiac',
    name: 'Celestial Zodiac Constellation Map',
    title: 'Celestial Zodiac Constellation Map',
    description: 'Breathtaking astrological wheel with starry constellations, moon phases, and mystical geometry.',
    category: 'Esoteric',
    difficulty: 'Intermediate',
    commercialKdpReady: true,
    svgContent: `<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="1000" height="1000" fill="white"/>
  <g stroke="#1e293b" stroke-width="3" fill="none">
    <circle cx="500" cy="500" r="440" stroke-width="6"/>
    <circle cx="500" cy="500" r="380"/>
    <circle cx="500" cy="500" r="280"/>
    <circle cx="500" cy="500" r="160" stroke-width="4"/>
    
    <path d="M 500 120 L 580 200 L 700 180 L 650 300 L 780 380 L 660 450 L 720 580 L 580 560 L 500 680 L 420 560 L 280 580 L 340 450 L 220 380 L 350 300 L 300 180 L 420 200 Z" stroke-width="2"/>
    
    <circle cx="500" cy="120" r="6" fill="#1e293b"/>
    <circle cx="580" cy="200" r="6" fill="#1e293b"/>
    <circle cx="700" cy="180" r="6" fill="#1e293b"/>
    <circle cx="780" cy="380" r="6" fill="#1e293b"/>
    <circle cx="720" cy="580" r="6" fill="#1e293b"/>
    <circle cx="500" cy="680" r="6" fill="#1e293b"/>
    <circle cx="280" cy="580" r="6" fill="#1e293b"/>
    <circle cx="220" cy="380" r="6" fill="#1e293b"/>
    <circle cx="300" cy="180" r="6" fill="#1e293b"/>
    
    <circle cx="500" cy="500" r="80" stroke-width="4"/>
    <path d="M 500 420 Q 540 500 500 580 Q 460 500 500 420" fill="none" stroke-width="3"/>
  </g>
</svg>`
  },
  {
    id: 'template-cyberpunk-samurai',
    name: 'Cyberpunk Mecha Samurai',
    title: 'Cyberpunk Mecha Samurai',
    description: 'High-contrast futuristic warrior with neon circuitry lines and urban sci-fi armor aesthetics.',
    category: 'Sci-Fi',
    difficulty: 'Master KDP',
    commercialKdpReady: true,
    svgContent: `<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="1000" height="1000" fill="white"/>
  <g stroke="#1e293b" stroke-width="4" fill="none" stroke-linejoin="round">
    <rect x="50" y="50" width="900" height="900" rx="20" stroke-width="8"/>
    
    <path d="M 350 300 Q 500 180 650 300 L 700 400 L 600 450 L 500 380 L 400 450 L 300 400 Z" stroke-width="5"/>
    <path d="M 500 180 L 500 350" stroke-width="4"/>
    <path d="M 300 450 L 700 450 L 650 600 L 350 600 Z" stroke-width="5"/>
    
    <path d="M 400 500 L 600 500 L 550 560 L 450 560 Z" stroke-width="4"/>
    <line x1="430" y1="530" x2="570" y2="530" stroke-width="3"/>

    <path d="M 120 120 L 250 120 L 250 200 L 350 200" stroke-width="3"/>
    <path d="M 880 120 L 750 120 L 750 200 L 650 200" stroke-width="3"/>
    <path d="M 120 880 L 300 880 L 350 780" stroke-width="3"/>
    <path d="M 880 880 L 700 880 L 650 780" stroke-width="3"/>
  </g>
</svg>`
  },
  {
    id: 'template-tarot-alchemist',
    name: 'Tarot Arcana: The Alchemist',
    title: 'Tarot Arcana: The Alchemist',
    description: 'Esoteric masterpiece featuring potion bottles, mystical serpents, alchemical symbols, and starry drapes.',
    category: 'Esoteric',
    difficulty: 'Master KDP',
    commercialKdpReady: true,
    svgContent: `<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="1000" height="1000" fill="white"/>
  <g stroke="#1e293b" stroke-width="4" fill="none">
    <rect x="80" y="60" width="840" height="880" rx="30" stroke-width="8"/>
    <rect x="105" y="85" width="790" height="830" rx="16" stroke-width="3"/>
    
    <path d="M 250 750 L 750 750 L 700 830 L 300 830 Z" stroke-width="5"/>
    
    <path d="M 460 400 L 540 400 L 540 460 Q 600 520 600 620 C 600 690 400 690 400 620 Q 400 520 460 460 Z" stroke-width="5"/>
    
    <circle cx="300" cy="220" r="60" stroke-width="4"/>
    <path d="M 300 160 C 330 190 330 250 300 280 C 270 250 270 190 300 160 Z"/>
    
    <circle cx="700" cy="220" r="60" stroke-width="4"/>
    <path d="M 680 170 Q 730 220 680 270 Q 710 220 680 170" stroke-width="3"/>
  </g>
</svg>`
  },
  {
    id: 'template-enchanted-forest',
    name: 'Enchanted Woodland Sanctuary',
    title: 'Enchanted Woodland Sanctuary',
    description: 'Detailed forest scene with majestic owl, mushrooms, wildflowers, and winding vines.',
    category: 'Nature',
    difficulty: 'Beginner',
    commercialKdpReady: true,
    svgContent: `<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="1000" height="1000" fill="white"/>
  <g stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round">
    <rect x="40" y="40" width="920" height="920" rx="16" stroke-width="6"/>

    <path d="M 80 960 Q 120 500 90 40 T 150 40 Q 180 500 200 960" stroke-width="5"/>
    <path d="M 820 960 Q 800 500 850 40 T 910 40 Q 870 500 920 960" stroke-width="5"/>

    <path d="M 200 450 Q 500 420 800 460" stroke-width="6"/>
    <ellipse cx="500" cy="330" rx="80" ry="100" stroke-width="5"/>
    <circle cx="465" cy="300" r="28" stroke-width="4"/>
    <circle cx="535" cy="300" r="28" stroke-width="4"/>
    <circle cx="465" cy="300" r="10"/>
    <circle cx="535" cy="300" r="10"/>
    <polygon points="500,315 490,335 510,335" stroke-width="3"/>
    <path d="M 430 350 C 410 400 430 430 460 420"/>
    <path d="M 570 350 C 590 400 570 430 540 420"/>

    <path d="M 250 960 Q 250 820 300 820 Q 350 820 350 960" stroke-width="5"/>
    <path d="M 220 830 Q 300 700 380 830 Z" stroke-width="5"/>
    <circle cx="280" cy="770" r="12"/>
    <circle cx="320" cy="750" r="16"/>
    <circle cx="340" cy="790" r="10"/>

    <path d="M 600 960 Q 650 800 750 750" stroke-width="4"/>
    <path d="M 640 900 Q 680 880 700 910"/>
    <path d="M 660 850 Q 710 830 730 860"/>
    <path d="M 680 800 Q 730 780 750 810"/>
  </g>
</svg>`
  },
  {
    id: 'template-steampunk-owl',
    name: 'Gears & Clockwork Creature',
    title: 'Gears & Clockwork Creature',
    description: 'Intricate steampunk aesthetic featuring detailed cogs, keyholes, and metallic rivets.',
    category: 'Fantasy',
    difficulty: 'Intermediate',
    commercialKdpReady: true,
    svgContent: `<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="1000" height="1000" fill="white"/>
  <g stroke="#1e293b" stroke-width="4" fill="none" stroke-linejoin="round">
    <circle cx="500" cy="500" r="300" stroke-width="6"/>
    <circle cx="500" cy="500" r="220" stroke-width="4"/>
    <circle cx="500" cy="500" r="100" stroke-width="5"/>
    <circle cx="500" cy="500" r="40" stroke-width="4"/>

    <rect x="470" y="170" width="60" height="40" rx="4" stroke-width="4"/>
    <rect x="470" y="790" width="60" height="40" rx="4" stroke-width="4"/>
    <rect x="170" y="470" width="40" height="60" rx="4" stroke-width="4"/>
    <rect x="790" y="470" width="40" height="60" rx="4" stroke-width="4"/>

    <line x1="500" y1="280" x2="500" y2="400" stroke-width="5"/>
    <line x1="500" y1="600" x2="500" y2="720" stroke-width="5"/>
    <line x1="280" y1="500" x2="400" y2="500" stroke-width="5"/>
    <line x1="600" y1="500" x2="720" y2="500" stroke-width="5"/>

    <path d="M 60 60 L 250 60 L 250 250" stroke-width="6"/>
    <path d="M 940 60 L 750 60 L 750 250" stroke-width="6"/>
    <path d="M 60 940 L 250 940 L 250 750" stroke-width="6"/>
    <path d="M 940 940 L 750 940 L 750 750" stroke-width="6"/>
  </g>
</svg>`
  }
];

export default COLORING_TEMPLATES;
