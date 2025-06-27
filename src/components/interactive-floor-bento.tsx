"use client";

import React, { useState } from "react";
import { BentoGrid, BentoGridItem } from "./ui/bento-grid";
import { cn } from "@/lib/utils";
import { IconBoxAlignTopLeft } from "@tabler/icons-react";
import type { Selection } from "@heroui/react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";

function useSpotlight() {
  const [spot, setSpot] = React.useState({ x: 50, y: 50, show: false });
  const ref = React.useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpot({ x, y, show: true });
  };

  const onMouseLeave = () => setSpot((s) => ({ ...s, show: false }));

  return { ref, spot, onMouseMove, onMouseLeave };
}

const floorLayouts = [
  // Ground Floor
  [
    { name: "Reception", color: "bg-[#393C67] text-white", colSpan: 2 },
    { name: "Waiting Area", color: "bg-[#4409A1] text-white" },
    { name: "ICU", color: "bg-[#2B2F47] text-white", rowSpan: 2 },
    { name: "Ward A", color: "bg-[#BD3CD8]" },
    { name: "Ward B", color: "bg-[#4409A1]" },
    { name: "Operation Theater", color: "bg-[#2B2F47]" },
  ],
  // First Floor
  [
    { name: "Lab", color: "bg-[#393C67] text-white", colSpan: 1 },
    { name: "Pharmacy", color: "bg-[#4409A1] text-white" },
    { name: "Ward C", color: "bg-[#2B2F47] text-white" },
    { name: "Ward D", color: "bg-[#4409A1]", rowSpan: 2 },
    { name: "Ward E", color: "bg-[#2B2F47]", colSpan: 2 },
    { name: "Cafeteria", color: "bg-[#BD3CD8]" },
  ],
  // Second Floor (new)
  [
    { name: "Admin Office", color: "bg-[#393C67] text-white", colSpan: 2 },
    { name: "Conference Room", color: "bg-[#4409A1] text-white" },
    { name: "Records", color: "bg-[#2B2F47] text-white", rowSpan: 2 },
    { name: "Ward F", color: "bg-[#BD3CD8]" },
    { name: "Ward G", color: "bg-[#4409A1]", colSpan:2 },
    // { name: "Pantry", color: "bg-[#2B2F47]" },
  ],
];

const idleSectionsPerFloor: string[][] = [
  // Ground Floor
  ["Reception", "Ward A"],
  // First Floor
  ["Lab", "Cafeteria"],
  // Second Floor (new)
  ["Admin Office", "Pantry"],
];

const floorNames = ["Ground Floor", "First Floor", "Second Floor"];

export function InteractiveFloorBento() {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([floorNames[0]]));
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [lightsOff, setLightsOff] = useState(
    floorLayouts.map((sections) => Array(sections.length).fill(false))
  );
  const [showConfirm, setShowConfirm] = useState(false);

  const sections = floorLayouts[selectedFloor];

  // Helper to check if all lights are ON for this floor
  const allLightsOn = lightsOff[selectedFloor].every((off) => !off);

  // Handler for toggling lights for a section
  const toggleSectionLight = (sectionIdx: number) => {
    setShowConfirm(true);
  };

  const confirmToggleSectionLight = () => {
    if (selectedSection !== null) {
      setLightsOff((prev) => {
        const updated = prev.map((arr) => [...arr]);
        updated[selectedFloor][selectedSection] = !updated[selectedFloor][selectedSection];
        return updated;
      });
    }
    setShowConfirm(false);
  };

  // Sync selectedFloor with dropdown
  React.useEffect(() => {
    const selected = Array.from(selectedKeys)[0];
    const idx = floorNames.findIndex((name) => name === selected);
    if (idx !== -1 && idx !== selectedFloor) {
      setSelectedFloor(idx);
      setSelectedSection(null);
    }
  }, [selectedKeys]);

  // Handler for changing floor (reset selection)
  const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFloor(Number(e.target.value));
    setSelectedSection(null);
  };

  // Helper to build col/row span classes
  const getSpanClasses = (section: any) => {
    let classes = "";
    if (section.colSpan) classes += ` md:col-span-${section.colSpan}`;
    if (section.rowSpan) classes += ` md:row-span-${section.rowSpan}`;
    return classes;
  };

  // Gradient for cards
  const cardGradient =
    "bg-gradient-to-br from-[#2B2F47] to-[##393C67 ]";

  // Card height utility
  const cardHeight = "min-h-[150px] max-h-[180px]";

  // Helper to render a spotlight overlay
  function SpotlightOverlay({ spot }: { spot: { x: number; y: number; show: boolean } }) {
    return (
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          opacity: spot.show ? 1 : 0,
          transition: "opacity 0.2s",
          zIndex: 1,
          background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 40%, transparent 80%)`,
        }}
      />
    );
  }

  const sectionControlsSpot = useSpotlight();
  const idleSectionsSpot = useSpotlight();
  const floorSelectorSpot = useSpotlight();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <div className="flex flex-col md:flex-row gap-10 w-full max-w-7xl justify-center items-center">
        {/* Column 1: Floor grid */}
        <div className="flex-1 flex justify-center">
          <BentoGrid
            className={cn(
              "mx-auto transition-colors duration-300 bg-[#242424] rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4 p-10"
            )}
          >
            {sections.map((section, i) => (
              <div
                key={i}
                onClick={() => setSelectedSection(i)}
                className={cn(
                  "w-full h-full",
                  getSpanClasses(section),
                  "cursor-pointer transition-all",
                  selectedSection === i
                    ? "border-4 border-[#4409A1] animate-pulse rounded-xl"
                    : "border border-transparent",
                  lightsOff[selectedFloor][i] && "brightness-50"
                )}
                style={{ minHeight: 0 }}
              >
                <BentoGridItem
                  title={section.name}
                  description={
                    selectedSection === i
                      ? "You selected this section."
                      : "Click to select this section."
                  }
                  header={
                    <div className="flex items-center justify-center h-full">
                      <IconBoxAlignTopLeft className="h-8 w-8 text-neutral-200" />
                    </div>
                  }
                  className={cn(
                    "w-full h-full rounded-xl flex flex-col",
                    section.color
                  )}
                />
              </div>
            ))}
          </BentoGrid>
        </div>
        {/* Column 2: Controls and info */}
        <div className="w-full md:w-96 flex flex-col gap-6 items-center">
          {/* Floor selector as a card */}
          <div
            ref={floorSelectorSpot.ref}
            onMouseMove={floorSelectorSpot.onMouseMove}
            onMouseLeave={floorSelectorSpot.onMouseLeave}
            className={cn(
              "border-none rounded-lg p-4 shadow flex flex-col w-full text-white mb-2 justify-between relative overflow-hidden",
              cardGradient,
              cardHeight
            )}
          >
            <SpotlightOverlay spot={floorSelectorSpot.spot} />
            <label className="font-semibold mb-2 text-white text-center text-2xl">Select Floor</label>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="capitalize w-full bg-gradient-to-r bg-white text-black border-none rounded-lg"
                  variant="bordered"
                >
                  {Array.from(selectedKeys)[0] || floorNames[0]}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Select floor"
                closeOnSelect={true}
                selectedKeys={selectedKeys}
                selectionMode="single"
                variant="flat"
                onSelectionChange={setSelectedKeys}
                className="w-full bg-gradient-to-r from-[#2B2F47] to-[#393C67] text-white min-w-0 rounded-lg border-0.5 border-neutral-600"
                // Ensures dropdown menu matches trigger width
                style={{ minWidth: "100%" }}
              >
                {floorNames.map((name) => (
                  <DropdownItem
                    key={name}
                    className="text-white data-[selected=true]:font-bold data-[hovered=true]:bg-[#393C67] w-full"
                  >
                    {name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          {/* Section Controls */}
          <div
            ref={sectionControlsSpot.ref}
            onMouseMove={sectionControlsSpot.onMouseMove}
            onMouseLeave={sectionControlsSpot.onMouseLeave}
            className={cn(
              "border-none rounded-lg p-4 shadow flex flex-col w-full text-white relative overflow-hidden",
              cardGradient,
              cardHeight
            )}
          >
            <SpotlightOverlay spot={sectionControlsSpot.spot} />
            <h2 className="flex w-full justify-center font-bold mb-2 text-2xl">Section Controls</h2>
            {selectedSection !== null ? (
              <>
                <div className="mb-4">
                  <span className="font-semibold">Selected Section:</span>{" "}
                  {sections[selectedSection].name}
                </div>
              </>
            ) : (
              <div className="text-neutral-200 mb-4">
                Select a section to control lights.
              </div>
            )}
            <button
              className={cn(
                "w-full mt-4 px-4 py-2 rounded font-semibold transition bg-white text-black hover:bg-neutral-400"
              )}
              onClick={() => {
                if (selectedSection !== null) {
                  toggleSectionLight(selectedSection);
                }
              }}
              disabled={selectedSection === null}
            >
              {selectedSection === null
                ? "Select a section"
                : lightsOff[selectedFloor][selectedSection]
                ? "Turn On Lights"
                : "Turn Off Lights"}
            </button>
          </div>
          {/* Idle Sections Card */}
          <div
            ref={idleSectionsSpot.ref}
            onMouseMove={idleSectionsSpot.onMouseMove}
            onMouseLeave={idleSectionsSpot.onMouseLeave}
            className={cn(
              "border-none rounded-lg p-4 shadow flex flex-col w-full text-white bg-black relative overflow-hidden",
              cardGradient,
              cardHeight
            )}
          >
            <SpotlightOverlay spot={idleSectionsSpot.spot} />
            <h2 className="flex w-full justify-center font-bold mb-2 text-2xl">Idle Sections</h2>
            {idleSectionsPerFloor[selectedFloor] && idleSectionsPerFloor[selectedFloor].length > 0 ? (
              <ul className="flex flex-col w-full justify-center text-md content-center text-weight-600">
                {idleSectionsPerFloor[selectedFloor].map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>
            ) : (
              <div className="text-white">
                No idle sections. All lights are off.
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
            <div className="text-lg font-bold mb-4 text-black text-center">
              An alert will be issued to all the employees in the building, this action cannot be undone.
            </div>
            <div className="flex gap-4 mt-2">
              <button
                className="px-4 py-2 rounded bg-[#B036D3] text-white font-semibold hover:bg-[#3A0885] transition"
                onClick={confirmToggleSectionLight}
              >
                Confirm
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-200 text-[#3A0885] font-semibold hover:bg-gray-300 transition"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}