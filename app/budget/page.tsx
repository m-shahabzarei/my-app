import type { Metadata } from "next";
import BudgetWorkspace from "@/components/budget/BudgetWorkspace";

export const metadata: Metadata = {
  title: "Budget | Productivity App",
  description: "Monthly budget tracking with Jalali months.",
};

export default function BudgetPage() {
  return <BudgetWorkspace />;
}
