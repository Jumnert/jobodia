import { SelectItem } from "@/components/ui/select";
import provinces from "@/data/provinces.json";

export function ProvinceSelectItems() {
  return Object.entries(provinces).map(([abbreviation, name]) => (
    <SelectItem key={abbreviation} value={abbreviation}>
      {name}
    </SelectItem>
  ));
}
