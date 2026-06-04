// page.tsx is a server component — it has no runtime JS of its own.
// All interactivity lives in HomeClient below, which is marked "use client".
// Keeping the shell server-side means the initial HTML is fully rendered before
// any client bundle executes, giving instant perceived performance.

import HomeClient from "./HomeClient";

export default function Page() {
  return <HomeClient />;
}
