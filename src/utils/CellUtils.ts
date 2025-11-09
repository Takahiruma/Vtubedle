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

export function cellColor(a: any, b: any, isArray = false): string{
  if (isArray) {

    if(a.length == 0 && b.length == 0){
      return "green";
    }

    const common = a.some((x: string) => b.includes(x));
    if (common) {
      if (a.length === b.length && a.every((x: string) => b.includes(x))) return "green";
      else return "orange";
    }
    return "red";
  }
  return a === b ? "green" : "red";
};