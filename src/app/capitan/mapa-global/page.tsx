import GlobalRadarClient from "./GlobalRadarClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Radar Global | Mivank v5.2",
  description: "Monitoreo estratégico de flota en tiempo real con geolocalización industrial.",
};

export default function MapaGlobalPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] p-4 md:p-6 lg:p-8">
      <GlobalRadarClient />
    </div>
  );
}
