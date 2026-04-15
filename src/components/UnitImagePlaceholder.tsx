"use client";

import Image from "next/image";

const unitStudio = "/assets/unit-studio.webp";
const unit1br = "/assets/unit-1br.webp";
const unit2br = "/assets/unit-2br.webp";
const unit3br = "/assets/unit-3br.webp";
const unitPenthouse = "/assets/unit-penthouse.webp";

const unitImages: Record<number, string> = {
  0: unitStudio,
  1: unit1br,
  2: unit2br,
  3: unit3br,
  4: unitPenthouse,
};

interface UnitImagePlaceholderProps {
  bedrooms: number;
  unitName: string;
}

const UnitImagePlaceholder = ({ bedrooms, unitName }: UnitImagePlaceholderProps) => {
  const image = unitImages[bedrooms] || (bedrooms >= 4 ? unitPenthouse : unit1br);
  return <Image src={image} alt={unitName} fill className="object-cover" />;
};

export default UnitImagePlaceholder;
