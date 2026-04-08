"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import SharedValuationPage from "./shared/SharedValuationPage.jsx";

export default function ValuationPage() {
  return <SharedValuationPage Header={Navbar} Footer={Footer} />;
}
