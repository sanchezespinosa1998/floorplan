import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { type Fair, type Venue } from "@/data/mockData";

type FamilyClassification = "isla" | "stand" | "ignorar";

export interface CreateProjectWizardResult {
  name: string;
  fairId: string;
  venueId: string;
  sourceFileName: string;
  familyMapping: Array<{
    family: string;
    classification: FamilyClassification;
  }>;
}

interface CreateProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fairs: Fair[];
  venues: Venue[];
  onCreate: (result: CreateProjectWizardResult) => void;
}

const steps = [
  "Datos base",
  "Revit import",
  "Familias",
  "Confirmation",
];

const extractMockFamilies = (fileName: string) => {
  const normalized = fileName.toLowerCase();

  if (normalized.includes("fitur")) {
    return [
      "Stand_3x3",
      "Stand_6x3",
      "Isla_Premium",
      "Mostrador_Comercial",
      "Stand_Esquina",
    ];
  }

  if (normalized.includes("mwc") || normalized.includes("hall")) {
    return [
      "Booth_Modular",
      "Island_Tech",
      "Kiosk_Info",
      "Stand_Corner",
      "Stand_Linear",
    ];
  }

  return [
    "Stand_Estandar",
    "Stand_Doble",
    "Isla_Central",
    "Zona_Recepcion",
    "Stand_Esquina",
  ];
};

const buildInitialFamilyMap = (families: string[]) => {
  const initial: Record<string, FamilyClassification> = {};

  for (const family of families) {
    if (family.toLowerCase().includes("isla") || family.toLowerCase().includes("island")) {
      initial[family] = "isla";
    } else if (family.toLowerCase().includes("stand") || family.toLowerCase().includes("booth")) {
      initial[family] = "stand";
    } else {
      initial[family] = "ignorar";
    }
  }

  return initial;
};

export function CreateProjectWizard({
  open,
  onOpenChange,
  fairs,
  venues,
  onCreate,
}: CreateProjectWizardProps) {
  const isMobile = useIsMobile();
  const progressTimerRef = useRef<number | null>(null);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [fairId, setFairId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [sourceFileName, setSourceFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [families, setFamilies] = useState<string[]>([]);
  const [familyMap, setFamilyMap] = useState<Record<string, FamilyClassification>>({});

  const selectedFair = fairs.find(fair => fair.id === fairId);
  const expectedVenueId = selectedFair?.venueId;
  const selectedVenue = venues.find(venue => venue.id === venueId);
  const fairVenueMismatch = Boolean(expectedVenueId && venueId && expectedVenueId !== venueId);

  const includableFamiliesCount = useMemo(
    () => Object.values(familyMap).filter(value => value !== "ignorar").length,
    [familyMap]
  );

  useEffect(() => {
    if (!open) {
      setStep(0);
      setName("");
      setFairId("");
      setVenueId("");
      setSourceFileName("");
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setFamilies([]);
      setFamilyMap({});
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current !== null) {
        window.clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  const handleFairChange = (newFairId: string) => {
    setFairId(newFairId);

    const fair = fairs.find(item => item.id === newFairId);
    if (fair) {
      setVenueId(fair.venueId);
    }
  };

  const handleRevitFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSourceFileName(file.name);
    setFamilies([]);
    setFamilyMap({});
    setAnalysisProgress(0);
    setIsAnalyzing(true);

    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
    }

    progressTimerRef.current = window.setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          if (progressTimerRef.current !== null) {
            window.clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
          }

          const detectedFamilies = extractMockFamilies(file.name);
          setFamilies(detectedFamilies);
          setFamilyMap(buildInitialFamilyMap(detectedFamilies));
          setIsAnalyzing(false);
          return 100;
        }

        return Math.min(prev + 20, 100);
      });
    }, 140);
  };

  const canGoNext = () => {
    if (step === 0) {
      return Boolean(name.trim() && fairId && venueId);
    }

    if (step === 1) {
      return Boolean(sourceFileName && !isAnalyzing && families.length > 0);
    }

    if (step === 2) {
      return includableFamiliesCount > 0;
    }

    return true;
  };

  const handleNext = () => {
    if (!canGoNext()) return;
    setStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  const handleCreate = () => {
    if (!canGoNext()) return;

    const familyMapping = families.map(family => ({
      family,
      classification: familyMap[family] || "ignorar",
    }));

    onCreate({
      name: name.trim(),
      fairId,
      venueId,
      sourceFileName,
      familyMapping,
    });

    onOpenChange(false);
  };

  const stepContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Paso {step + 1} de {steps.length}</span>
          <span>{steps[step]}</span>
        </div>
        <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Project name</label>
            <Input
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="e.g. FITUR 2027 - Pavilion 4 Tourism"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fair</label>
            <Select value={fairId} onValueChange={handleFairChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona una feria" />
              </SelectTrigger>
              <SelectContent>
                {fairs.map(fair => (
                  <SelectItem key={fair.id} value={fair.id}>
                    {fair.name} {fair.edition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Venue</label>
            <Select value={venueId} onValueChange={setVenueId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a venue" />
              </SelectTrigger>
              <SelectContent>
                {venues.map(venue => (
                  <SelectItem key={venue.id} value={venue.id}>
                    {venue.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFair && selectedVenue && (
              <p className="text-xs text-muted-foreground mt-2">
                Venue suggested by fair: {venues.find(venue => venue.id === selectedFair.venueId)?.name || "—"}
              </p>
            )}
            {fairVenueMismatch && (
              <p className="text-xs text-status-pending mt-2">
                Warning: the selected venue does not match the fair main venue.
              </p>
            )}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="p-3 rounded-md border border-border bg-muted/40">
            <p className="text-xs text-muted-foreground">
              In this prototype, import is simulated: filename is validated and a mock family analysis is generated.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Archivo Revit (.rvt)</label>
            <Input type="file" accept=".rvt" onChange={handleRevitFileChange} className="mt-1" />
            {sourceFileName && <p className="text-xs text-muted-foreground mt-2">Archivo seleccionado: {sourceFileName}</p>}
          </div>

          {(isAnalyzing || analysisProgress > 0) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Analizando modelo</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}

          {!isAnalyzing && families.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Detected {families.length} candidate families for classification.
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Select which families from the analysis should be considered islands or stands in the project.
          </p>

          <div className="space-y-2 max-h-72 overflow-auto pr-1">
            {families.map(family => (
              <div key={family} className="border border-border rounded-md p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{family}</p>
                  <p className="text-xs text-muted-foreground">Functional classification in the project</p>
                </div>
                <Select
                  value={familyMap[family] || "ignorar"}
                  onValueChange={value => {
                    const classification = value as FamilyClassification;
                    setFamilyMap(prev => ({ ...prev, [family]: classification }));
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="isla">Isla</SelectItem>
                    <SelectItem value="stand">Stand</SelectItem>
                    <SelectItem value="ignorar">Ignorar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Familias incluidas: {includableFamiliesCount} de {families.length}
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-foreground">Creation summary</h4>
          <div className="grid grid-cols-1 gap-2 text-muted-foreground">
            <p><span className="font-medium text-foreground">Proyecto:</span> {name}</p>
            <p><span className="font-medium text-foreground">Fair:</span> {selectedFair ? `${selectedFair.name} ${selectedFair.edition}` : "—"}</p>
            <p><span className="font-medium text-foreground">Venue:</span> {selectedVenue?.name || "—"}</p>
            <p><span className="font-medium text-foreground">Archivo Revit:</span> {sourceFileName}</p>
            <p><span className="font-medium text-foreground">Familias como isla:</span> {Object.values(familyMap).filter(value => value === "isla").length}</p>
            <p><span className="font-medium text-foreground">Familias como stand:</span> {Object.values(familyMap).filter(value => value === "stand").length}</p>
            <p><span className="font-medium text-foreground">Ignoradas:</span> {Object.values(familyMap).filter(value => value === "ignorar").length}</p>
          </div>
          {fairVenueMismatch && (
            <div className="p-3 rounded-md border border-status-pending/40 bg-status-pending/10 text-xs text-muted-foreground">
              The project will be created with a venue different from the fair by manual decision.
            </div>
          )}
        </div>
      )}
    </div>
  );

  const actions = (
    <div className="flex items-center justify-between gap-2 pt-2">
      <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0}>
        Anterior
      </Button>
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        {step < steps.length - 1 ? (
          <Button type="button" onClick={handleNext} disabled={!canGoNext()}>
            Siguiente
          </Button>
        ) : (
          <Button type="button" onClick={handleCreate} disabled={!canGoNext()}>
            Create project
          </Button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader>
            <DrawerTitle>Nuevo proyecto</DrawerTitle>
            <DrawerDescription>Creation wizard with fair, venue, and simulated Revit import.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-auto space-y-4">{stepContent}</div>
          <DrawerFooter>{actions}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo proyecto</DialogTitle>
          <DialogDescription>
            Creation wizard with fair, venue, and simulated Revit import.
          </DialogDescription>
        </DialogHeader>
        {stepContent}
        {actions}
      </DialogContent>
    </Dialog>
  );
}
