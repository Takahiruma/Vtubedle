import type { Variants } from "framer-motion";

export const cellVariants: Variants = {
  hidden: { rotateY: 90, opacity: 0 },
  visible: (i: number) => ({
    rotateY: 0,
    opacity: 1,
    transition: {
      delay: i * 0.35,
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  }),
};

export function cellColor(selectedVtParam: any, randomVtParam: any): string{
  const arraySelectedparam = Array.isArray(selectedVtParam) ? selectedVtParam : [selectedVtParam];
  const arrayRandomparam = Array.isArray(randomVtParam) ? randomVtParam : [randomVtParam];

  const areEqual =
    arraySelectedparam.length === arrayRandomparam.length &&
    arraySelectedparam.every((val, index) => val === arrayRandomparam[index]);
  if (areEqual) return "green";

  const setRandom = new Set(arrayRandomparam);
  if (arraySelectedparam.some(item => setRandom.has(String(item).trim()))) return "orange";

  return "red";
};