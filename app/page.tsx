import React from "react";
import PredictionForm from "@/components/PredictionForm";
import Header from "@/components/Header";

const HomePage: React.FC = () => {
  return (
    <>
    <div className="w-full top-0 sticky z-50">
    </div>
      <div className="container mx-auto mb-10">
        <PredictionForm />
      </div>
    </>
  );
};

export default HomePage;
