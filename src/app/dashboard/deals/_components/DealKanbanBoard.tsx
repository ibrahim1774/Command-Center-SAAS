"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { DEAL_STAGE_CONFIG } from "@/lib/constants";
import { DealKanbanCard } from "./DealKanbanCard";
import type { BrandDeal, DealStage } from "@/types";

const STAGES: DealStage[] = ["inquiry", "negotiating", "confirmed", "in-progress", "completed"];

interface Props {
  deals: BrandDeal[];
  onStatusChange: (dealId: string, status: DealStage) => void;
  onCardClick: (dealId: string) => void;
}

function KanbanColumn({ stage, deals, onCardClick }: { stage: DealStage; deals: BrandDeal[]; onCardClick: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const config = DEAL_STAGE_CONFIG[stage];

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-3 min-h-[300px] min-w-[220px] transition-colors ${isOver ? "ring-2 ring-accent-primary/30" : ""}`}
      style={{ backgroundColor: config.bg }}
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
        <span className="font-body text-sm font-semibold text-text-primary">{config.label}</span>
        <span
          className="text-[10px] font-body font-medium rounded-full px-2 py-0.5"
          style={{ backgroundColor: config.color + "1a", color: config.color }}
        >
          {deals.length}
        </span>
      </div>
      <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5">
          {deals.map((deal) => (
            <DealKanbanCard key={deal.id} deal={deal} onClick={() => onCardClick(deal.id)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function DealKanbanBoard({ deals, onStatusChange, onCardClick }: Props) {
  const [activeDeal, setActiveDeal] = useState<BrandDeal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function handleDragStart(event: DragStartEvent) {
    const deal = deals.find((d) => d.id === event.active.id);
    setActiveDeal(deal || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;

    // Determine target stage
    let targetStage: DealStage | null = null;
    if (STAGES.includes(overId as DealStage)) {
      targetStage = overId as DealStage;
    } else {
      // Dropped over another card — find that card's stage
      const overDeal = deals.find((d) => d.id === overId);
      if (overDeal) targetStage = overDeal.status;
    }

    if (targetStage) {
      const currentDeal = deals.find((d) => d.id === dealId);
      if (currentDeal && currentDeal.status !== targetStage) {
        onStatusChange(dealId, targetStage);
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            deals={deals.filter((d) => d.status === stage)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeDeal && (
          <div className="w-[220px]">
            <DealKanbanCard deal={activeDeal} onClick={() => {}} overlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
