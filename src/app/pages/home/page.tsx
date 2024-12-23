"use client";

import Nav from "../../components/navbar";
import HeroTextArea from "../../components/MainHeroText";
import Footer from "@/app/components/footer";
import MedicineCard from "@/app/components/ui/card1";
import MedicineCardContainer from "@/app/components/ui/CardGrid";

function HomeScreen() {
    const Paracetamol = {
        image: "https://via.placeholder.com/150",
        drugName: "Paracetamol",
        type: "Tablet",
        price: "$5.99",
    };

    return (
        <div className="h-[100vh] w-[100vw] bg-[#fefdf8] overflow-x-hidden">
            {/* Navbar */}
            <Nav />

            {/* Hero Section */}
            <div className="bg-transparent h-20 w-full"></div>
            <HeroTextArea />

            {/* Medicine Card */}
            <div className="bg-transparent h-20 w-full"></div>
            <MedicineCard medicine={Paracetamol} />

            {/* Medicine Card Grid */}
            <MedicineCardContainer />

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default HomeScreen;
