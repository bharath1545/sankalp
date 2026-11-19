import { About } from "@/components/about";
import { AbstractRegistration } from "@/components/abstract-registration";
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
      <AbstractRegistration />
    </>
  );
}
