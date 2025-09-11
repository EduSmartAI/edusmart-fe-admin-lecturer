// File: src/components/BaseScreen.tsx
import React, { ReactNode, FC } from "react";
import Navigationbar from "EduSmart/components/Navbar/Navigationbar";
import ScrollSmootherWrapper from "EduSmart/components/Animation/ScrollingTriggerComponent";
import Footer from "EduSmart/components/Footer/Footer";

interface BaseScreenProps {
  children: ReactNode;
}

const BaseScreen: FC<BaseScreenProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigationbar />
      <ScrollSmootherWrapper>
        <div id="smooth-wrapper" className="overflow-hidden">
          <div id="smooth-content">
            {/* HEADER */}

            {/* MAIN CONTENT */}
            <main className="flex-grow pt-24 bg-white dark:bg-gray-900">
              {children}
            </main>

            {/* FOOTER */}
            <Footer />
          </div>
        </div>
      </ScrollSmootherWrapper>
    </div>
  );
};

export default BaseScreen;
