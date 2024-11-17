import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
