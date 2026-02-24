"use client";

import { motion } from "framer-motion";

interface FloorPlanPlaceholderProps {
  bedrooms: number;
  unitName: string;
  sqft: number;
}

const planColors = {
  wall: "#334155",
  wallLight: "#94a3b8",
  fill: "#f1f5f9",
  accent: "#0B3D2E",
  text: "#64748b",
  door: "#cbd5e1",
};

const RoomLabel = ({ x, y, label, size }: { x: number; y: number; label: string; size?: string }) => (
  <g>
    <text x={x} y={y} textAnchor="middle" fill={planColors.text} fontSize="11" fontWeight="600" fontFamily="system-ui">{label}</text>
    {size && <text x={x} y={y + 14} textAnchor="middle" fill={planColors.wallLight} fontSize="8" fontFamily="system-ui">{size}</text>}
  </g>
);

const DoorArc = ({ x, y, rotation = 0 }: { x: number; y: number; rotation?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${rotation})`}>
    <path d="M0,0 A20,20 0 0,1 20,0" fill="none" stroke={planColors.door} strokeWidth="1" strokeDasharray="3,2" />
    <line x1="0" y1="0" x2="0" y2="-2" stroke={planColors.wall} strokeWidth="1.5" />
  </g>
);

const FloorPlanPlaceholder = ({ bedrooms, unitName, sqft }: FloorPlanPlaceholderProps) => {
  if (bedrooms === 0) return <StudioPlan unitName={unitName} sqft={sqft} />;
  if (bedrooms === 1) return <OneBRPlan unitName={unitName} sqft={sqft} />;
  if (bedrooms === 2) return <TwoBRPlan unitName={unitName} sqft={sqft} />;
  if (bedrooms === 3) return <ThreeBRPlan unitName={unitName} sqft={sqft} />;
  return <LargePlan unitName={unitName} sqft={sqft} bedrooms={bedrooms} />;
};

const StudioPlan = ({ unitName, sqft }: { unitName: string; sqft: number }) => (
  <svg viewBox="0 0 300 280" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="260" height="240" fill={planColors.fill} stroke={planColors.wall} strokeWidth="3" rx="2" />
    <rect x="20" y="20" width="90" height="80" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={65} y={55} label="Kitchen" size="120 sqft" />
    <rect x="25" y="25" width="30" height="8" rx="2" fill={planColors.wallLight} />
    <rect x="20" y="100" width="90" height="60" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={65} y={132} label="Bath" />
    <circle cx="45" cy="145" r="6" fill="none" stroke={planColors.wallLight} strokeWidth="1" />
    <rect x="110" y="20" width="170" height="180" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={195} y={100} label="Living / Bedroom" size={`${sqft - 180} sqft`} />
    <rect x="220" y="40" width="40" height="50" rx="2" fill="none" stroke={planColors.wallLight} strokeWidth="1" strokeDasharray="4,3" />
    <rect x="110" y="200" width="170" height="60" fill="none" stroke={planColors.wall} strokeWidth="1.5" strokeDasharray="6,3" />
    <RoomLabel x={195} y={235} label="Balcony" />
    <DoorArc x={150} y={200} rotation={180} />
    <text x="150" y="272" textAnchor="middle" fill={planColors.accent} fontSize="9" fontWeight="700" fontFamily="system-ui">{unitName} • {sqft} sqft</text>
  </svg>
);

const OneBRPlan = ({ unitName, sqft }: { unitName: string; sqft: number }) => (
  <svg viewBox="0 0 320 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="290" height="260" fill={planColors.fill} stroke={planColors.wall} strokeWidth="3" rx="2" />
    <rect x="15" y="15" width="130" height="140" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={80} y={80} label="Bedroom" size="250 sqft" />
    <rect x="30" y="30" width="45" height="55" rx="2" fill="none" stroke={planColors.wallLight} strokeWidth="1" strokeDasharray="4,3" />
    <DoorArc x={115} y={155} rotation={180} />
    <rect x="15" y="155" width="70" height="60" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={50} y={188} label="Bath" />
    <circle cx="35" cy="198" r="6" fill="none" stroke={planColors.wallLight} strokeWidth="1" />
    <rect x="145" y="15" width="160" height="160" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={225} y={85} label="Living & Dining" size="350 sqft" />
    <rect x="145" y="175" width="160" height="60" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={225} y={208} label="Kitchen" size="130 sqft" />
    <rect x="260" y="180" width="35" height="8" rx="2" fill={planColors.wallLight} />
    <rect x="145" y="235" width="160" height="40" fill="none" stroke={planColors.wall} strokeWidth="1.5" strokeDasharray="6,3" />
    <RoomLabel x={225} y={258} label="Balcony" />
    <rect x="85" y="155" width="60" height="60" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={115} y={188} label="Entry" />
    <text x="160" y="288" textAnchor="middle" fill={planColors.accent} fontSize="9" fontWeight="700" fontFamily="system-ui">{unitName} • {sqft} sqft</text>
  </svg>
);

const TwoBRPlan = ({ unitName, sqft }: { unitName: string; sqft: number }) => (
  <svg viewBox="0 0 360 320" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="330" height="280" fill={planColors.fill} stroke={planColors.wall} strokeWidth="3" rx="2" />
    <rect x="15" y="15" width="140" height="120" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={85} y={70} label="Master Bed" size="300 sqft" />
    <rect x="25" y="25" width="50" height="60" rx="2" fill="none" stroke={planColors.wallLight} strokeWidth="1" strokeDasharray="4,3" />
    <rect x="15" y="135" width="70" height="55" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={50} y={165} label="En-suite" />
    <rect x="15" y="190" width="140" height="105" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={85} y={245} label="Bedroom 2" size="220 sqft" />
    <rect x="25" y="210" width="40" height="50" rx="2" fill="none" stroke={planColors.wallLight} strokeWidth="1" strokeDasharray="4,3" />
    <rect x="85" y="135" width="70" height="55" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={120} y={165} label="Bath 2" />
    <rect x="155" y="15" width="190" height="160" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={250} y={85} label="Living & Dining" size="420 sqft" />
    <rect x="155" y="175" width="100" height="70" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={205} y={213} label="Kitchen" size="150 sqft" />
    <rect x="220" y="180" width="25" height="8" rx="2" fill={planColors.wallLight} />
    <rect x="255" y="175" width="90" height="70" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={300} y={213} label="Maid's" />
    <rect x="155" y="245" width="190" height="50" fill="none" stroke={planColors.wall} strokeWidth="1.5" strokeDasharray="6,3" />
    <RoomLabel x={250} y={273} label="Balcony" />
    <text x="180" y="308" textAnchor="middle" fill={planColors.accent} fontSize="9" fontWeight="700" fontFamily="system-ui">{unitName} • {sqft} sqft</text>
  </svg>
);

const ThreeBRPlan = ({ unitName, sqft }: { unitName: string; sqft: number }) => (
  <svg viewBox="0 0 400 340" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="370" height="300" fill={planColors.fill} stroke={planColors.wall} strokeWidth="3" rx="2" />
    <rect x="15" y="15" width="130" height="110" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={80} y={65} label="Master Bed" size="320 sqft" />
    <rect x="25" y="25" width="45" height="55" rx="2" fill="none" stroke={planColors.wallLight} strokeWidth="1" strokeDasharray="4,3" />
    <rect x="15" y="125" width="65" height="50" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={47} y={153} label="En-suite" />
    <rect x="15" y="175" width="130" height="90" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={80} y={220} label="Bedroom 2" size="240 sqft" />
    <rect x="15" y="265" width="130" height="50" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={80} y={293} label="Bedroom 3" size="200 sqft" />
    <rect x="80" y="125" width="65" height="50" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={112} y={153} label="Bath" />
    <rect x="145" y="15" width="240" height="170" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={265} y={90} label="Living & Dining" size="500 sqft" />
    <rect x="145" y="185" width="120" height="70" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={205} y={223} label="Kitchen" size="160 sqft" />
    <rect x="230" y="190" width="25" height="8" rx="2" fill={planColors.wallLight} />
    <rect x="265" y="185" width="120" height="70" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={325} y={223} label="Maid's Room" />
    <rect x="145" y="255" width="240" height="60" fill="none" stroke={planColors.wall} strokeWidth="1.5" strokeDasharray="6,3" />
    <RoomLabel x={265} y={288} label="Terrace / Balcony" />
    <text x="200" y="328" textAnchor="middle" fill={planColors.accent} fontSize="9" fontWeight="700" fontFamily="system-ui">{unitName} • {sqft} sqft</text>
  </svg>
);

const LargePlan = ({ unitName, sqft, bedrooms }: { unitName: string; sqft: number; bedrooms: number }) => (
  <svg viewBox="0 0 400 360" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="370" height="320" fill={planColors.fill} stroke={planColors.wall} strokeWidth="3" rx="2" />
    <rect x="15" y="15" width="140" height="110" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={85} y={65} label="Master Suite" size="380 sqft" />
    <rect x="25" y="25" width="50" height="60" rx="2" fill="none" stroke={planColors.wallLight} strokeWidth="1" strokeDasharray="4,3" />
    <rect x="15" y="125" width="70" height="50" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={50} y={153} label="En-suite" />
    <rect x="85" y="125" width="70" height="50" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={120} y={153} label="Bed 2" />
    <rect x="15" y="175" width="70" height="80" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={50} y={218} label="Bed 3" />
    <rect x="85" y="175" width="70" height="80" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={120} y={218} label="Bed 4" />
    <rect x="15" y="255" width="70" height="40" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={50} y={278} label="Bath" />
    <rect x="85" y="255" width="70" height="40" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={120} y={278} label="Bath" />
    <rect x="155" y="15" width="230" height="180" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={270} y={95} label="Grand Living" size="600+ sqft" />
    <rect x="155" y="195" width="115" height="70" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={212} y={233} label="Kitchen" size="180 sqft" />
    <rect x="270" y="195" width="115" height="70" fill="white" stroke={planColors.wall} strokeWidth="1.5" />
    <RoomLabel x={327} y={233} label="Maid's" />
    <rect x="155" y="265" width="230" height="70" fill="none" stroke={planColors.wall} strokeWidth="1.5" strokeDasharray="6,3" />
    <RoomLabel x={270} y={303} label="Private Terrace" />
    <text x="200" y="348" textAnchor="middle" fill={planColors.accent} fontSize="9" fontWeight="700" fontFamily="system-ui">{unitName} • {sqft} sqft</text>
  </svg>
);

export default FloorPlanPlaceholder;
