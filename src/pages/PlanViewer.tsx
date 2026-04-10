import "@/components/planimetria/planimetria5-base.css";
import PolygonViewer3D from "@/components/planimetria/PolygonViewer3D";
import { useProfile } from "@/context/ProfileContext";
import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

export default function PlanViewer() {
  const { fairId } = useParams();
  const { canAccessFair, activeFairId, setActiveFairId, homePath } = useProfile();

  useEffect(() => {
    if (!fairId || !canAccessFair(fairId) || activeFairId === fairId) return;
    setActiveFairId(fairId);
  }, [activeFairId, canAccessFair, fairId, setActiveFairId]);

  if (!fairId || !canAccessFair(fairId)) {
    return <Navigate to={homePath} replace />;
  }

  return <PolygonViewer3D fairId={fairId} />;
}
