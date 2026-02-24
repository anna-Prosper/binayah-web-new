"use client";

const unitStudio = "/assets/unit-studio.jpg";
const unit1br = "/assets/unit-1br.jpg";
const unit2br = "/assets/unit-2br.jpg";
const unit3br = "/assets/unit-3br.jpg";
const unitPenthouse = "/assets/unit-penthouse.jpg";

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
  return <img src={image} alt={unitName} className="w-full h-full object-cover" />;
};

export default UnitImagePlaceholder;
