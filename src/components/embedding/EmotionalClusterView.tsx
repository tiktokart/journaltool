
import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Point } from "@/types/embedding";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { getUnifiedEmotionColor } from "./PointUtils";
import EmotionalGroupsPanel from "./EmotionalGroupsPanel";
import { extractEmotionalGroups } from "@/utils/embeddingUtils";

interface EmotionalClusterViewProps {
  points: Point[];
  selectedPoint: Point | null;
  selectedWord: string | null;
  onPointClick: (point: Point) => void;
  clusterCount?: number;
  connectedPoints: Point[];
  setConnectedPoints: (points: Point[]) => void;
}

export const EmotionalClusterView = ({
  points,
  selectedPoint,
  selectedWord,
  onPointClick,
  clusterCount = 8,
  connectedPoints,
  setConnectedPoints
}: EmotionalClusterViewProps) => {
  const { t } = useLanguage();
  const [selectedEmotionalGroup, setSelectedEmotionalGroup] = useState<string | null>(null);
  const [filteredPoints, setFilteredPoints] = useState<Point[]>(points);
  const [emotionalGroups, setEmotionalGroups] = useState<string[]>([]);

  // Initialize and update emotional groups from points
  useEffect(() => {
    if (points && points.length > 0) {
      const groups = extractEmotionalGroups(points);
      setEmotionalGroups(groups);
      setFilteredPoints(points);
    }
  }, [points]);

  // Filter points when emotional group is selected
  useEffect(() => {
    if (!selectedEmotionalGroup) {
      setFilteredPoints(points);
      return;
    }
    
    const filtered = points.filter(point => 
      point.emotionalTone === selectedEmotionalGroup
    );
    
    setFilteredPoints(filtered);
  }, [selectedEmotionalGroup, points]);

  // Handle emotional group selection
  const handleEmotionalGroupSelect = (group: string) => {
    setSelectedEmotionalGroup(group);
  };

  // Reset filters
  const handleResetFilter = () => {
    setSelectedEmotionalGroup(null);
  };

  // Render 3D visualization
  return (
    <Card className="border-0 shadow-md w-full relative bg-white">
      <CardContent className="p-0 h-[400px] relative">
        {emotionalGroups.length > 0 && (
          <EmotionalGroupsPanel
            emotionalGroups={emotionalGroups}
            selectedEmotionalGroup={selectedEmotionalGroup}
            onSelectEmotionalGroup={handleEmotionalGroupSelect}
            onResetFilter={handleResetFilter}
          />
        )}
        
        <Canvas camera={{ position: [0, 0, 40], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
          
          {/* Render points */}
          {filteredPoints.map((point) => (
            <PointVisualization 
              key={point.id}
              point={point}
              isSelected={selectedPoint?.id === point.id}
              isConnected={connectedPoints.some(p => p.id === point.id)}
              onClick={() => onPointClick(point)}
            />
          ))}
        </Canvas>

        {filteredPoints.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <p className="text-muted-foreground">{t("noDataToDisplay")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PointVisualization = ({ 
  point, 
  isSelected, 
  isConnected,
  onClick 
}: { 
  point: Point; 
  isSelected: boolean; 
  isConnected: boolean;
  onClick: () => void; 
}) => {
  const color = typeof point.color === 'string' 
    ? point.color 
    : getUnifiedEmotionColor(point.emotionalTone || "Neutral");

  const position = point.position || [0, 0, 0];
  const scale = isSelected ? 1.5 : (isConnected ? 1.2 : 1);
  
  return (
    <mesh 
      position={[position[0], position[1], position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      scale={scale}
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        emissive={isSelected ? color : isConnected ? color : 'black'}
        emissiveIntensity={isSelected ? 0.5 : isConnected ? 0.3 : 0}
      />
    </mesh>
  );
};

export default EmotionalClusterView;
