import { About } from "@/components/about";
import { AbstractForm } from "@/components/abstract-form";
import { AbstractFormGate } from "@/components/abstract-form-gate";
import { AbstractRegistration } from "@/components/abstract-registration";
import { Faq } from "@/components/faq";
import { Hero } from "@/components/hero";
import { Prizes } from "@/components/prizes";
import { Tracks } from "@/components/tracks";

export default function Page() {
  return (
    <>
      <Hero />
      <About />
      <Tracks />
      <Prizes />
      <AbstractRegistration>
        <AbstractFormGate>
          <AbstractForm />
        </AbstractFormGate>
      </AbstractRegistration>
      <Faq />
    </>
  );
}
