"use client";

import { Provider } from "react-redux";
import { store } from "@shop/store";
import dynamic from "next/dynamic";

const PersistGateNoSSR = dynamic(
  () => import("./PersistGateWrapper"),
  { ssr: false } // ne rend pas côté serveur
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGateNoSSR>
        {children}
      </PersistGateNoSSR>
    </Provider>
  );
}
