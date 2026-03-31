import { FooterSectionBlock } from "@/components/ui/footer-section";

export default function FooterSectionDemo() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#050914]">
      <div className="min-h-[60vh] flex items-center justify-center text-slate-100">Scroll Down</div>
      <FooterSectionBlock />
    </div>
  );
}
