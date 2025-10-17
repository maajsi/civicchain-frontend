"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, lazy, Suspense } from "react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { Upload, Camera, Check, MapPin } from "lucide-react";
import clientApi from "@/lib/client-api";
import { getUserId } from "@/lib/auth";
import { useGeolocation } from "@/hooks/use-geolocation";

// Lazy load the map component to avoid SSR issues
const LocationPicker = lazy(() => 
  import("@/components/map/location-picker").then(module => ({ default: module.LocationPicker }))
);

interface CreateIssueModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = {
  UPLOAD: 1,
  CLASSIFY: 2,
  CONFIRM: 3,
  DESCRIPTION: 4,
  LOCATION: 5,
  REVIEW: 6,
};

const CATEGORIES = [
  { id: "pothole", label: "Pothole", icon: "🕳️", color: "orange" },
  { id: "garbage", label: "Garbage", icon: "🗑️", color: "green" },
  { id: "streetlight", label: "Streetlight", icon: "💡", color: "yellow" },
  { id: "water", label: "Water Issue", icon: "💧", color: "blue" },
  { id: "other", label: "Other", icon: "📋", color: "gray" },
];

export function CreateIssueModal({ open, onClose, onSuccess }: CreateIssueModalProps) {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aiClassification, setAiClassification] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState({ lat: 0, lng: 0, address: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { coordinates } = useGeolocation();

  const handleImageUpload = async (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep(STEPS.CLASSIFY);
    
    // Call AI classification
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await clientApi.post("/issues/classify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
  setAiClassification(response.data.suggested_category);
  setSelectedCategory(response.data.suggested_category || null);
  setImageUrl(response.data.image_url);
  setStep(STEPS.CONFIRM);
    } catch (error) {
      toast.error("AI classification failed. Please select category manually.");
      setStep(STEPS.CONFIRM);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const user_id = typeof window !== 'undefined' ? getUserId() : null;
      await clientApi.post("/issues/report", {
        image_url: imageUrl,
        description,
        category: selectedCategory,
        lat: location.lat,
        lng: location.lng,
        user_id,
      });
      toast.success("Issue reported successfully!");
      resetForm();
      onSuccess();
    } catch (error) {
      toast.error("Failed to report issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(STEPS.UPLOAD);
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    setAiClassification(null);
    setSelectedCategory(null);
    setDescription("");
    setLocation({ lat: 0, lng: 0, address: "" });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report New Issue</DialogTitle>
          <Progress value={(step / 6) * 100} className="mt-2" />
        </DialogHeader>

        {step === STEPS.UPLOAD && <UploadStep onUpload={handleImageUpload} />}
        {step === STEPS.CLASSIFY && <ClassifyingStep />}
        {step === STEPS.CONFIRM && (
          <ConfirmCategoryStep
            aiCategory={aiClassification}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            onConfirm={() => setStep(STEPS.DESCRIPTION)}
          />
        )}
        {step === STEPS.DESCRIPTION && (
          <DescriptionStep
            imagePreview={imagePreview}
            category={selectedCategory}
            description={description}
            onDescriptionChange={setDescription}
            onNext={() => setStep(STEPS.LOCATION)}
          />
        )}
        {step === STEPS.LOCATION && (
          <LocationStep
            currentLocation={coordinates}
            onNext={(coords) => {
              setLocation(coords);
              setStep(STEPS.REVIEW);
            }}
          />
        )}
        {step === STEPS.REVIEW && (
          <ReviewStep
            data={{
              imagePreview,
              category: selectedCategory,
              description,
              location,
            }}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Step 1: Upload
function UploadStep({ onUpload }: { onUpload: (file: File) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (files) => {
      if (files[0]) onUpload(files[0]);
    },
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Upload Issue Photo</h3>
        <p className="text-sm text-muted-foreground">
          Drag and drop an image here, or click to select
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Supports: JPG, PNG, WEBP (Max 10MB)
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-muted-foreground">OR</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Button variant="outline" className="w-full" size="lg">
        <Camera className="h-5 w-5 mr-2" />
        Take Photo with Camera
      </Button>
    </div>
  );
}

// Step 2: Classifying
function ClassifyingStep() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-lg font-semibold">Analyzing Image...</p>
      <p className="text-sm text-muted-foreground">AI is classifying the issue type</p>
    </div>
  );
}

// Step 3: Confirm Category
function ConfirmCategoryStep({
  aiCategory,
  selected,
  onSelect,
  onConfirm,
}: {
  aiCategory: string | null;
  selected: string | null;
  onSelect: (category: string) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-6">
      {aiCategory && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm font-medium flex items-center gap-2">
            <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            AI Detected: <strong className="capitalize">{aiCategory}</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please confirm or select a different category
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => (
          <Card
            key={cat.id}
            className={`
              p-6 cursor-pointer transition-all relative
              ${selected === cat.id ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"}
            `}
            onClick={() => onSelect(cat.id)}
          >
            {selected === cat.id && (
              <div className="absolute top-2 right-2 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div className="text-4xl mb-2">{cat.icon}</div>
            <h4 className="font-semibold">{cat.label}</h4>
          </Card>
        ))}
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={!selected}
        onClick={onConfirm}
      >
        Continue
      </Button>
    </div>
  );
}

// Step 4: Description
function DescriptionStep({
  imagePreview,
  category,
  description,
  onDescriptionChange,
  onNext,
}: {
  imagePreview: string | null;
  category: string | null;
  description: string;
  onDescriptionChange: (desc: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <Badge className="mb-2 capitalize">{category}</Badge>
          <Label htmlFor="description">Describe the Issue</Label>
          <Textarea
            id="description"
            placeholder="Provide details about the issue, exact location, and severity..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="mt-2 min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {description.length}/500 characters
          </p>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={description.length < 20}
        onClick={onNext}
      >
        Continue to Location
      </Button>
    </div>
  );
}

// Step 5: Location
function LocationStep({
  currentLocation,
  onNext,
}: {
  currentLocation: { lat: number; lng: number } | null;
  onNext: (coords: { lat: number; lng: number; address: string }) => void;
}) {
  const [coords, setCoords] = useState(
    currentLocation || { lat: 17.385044, lng: 78.486671 }
  );
  const [address, setAddress] = useState("Selected location on map");

  const handleLocationChange = (newCoords: { lat: number; lng: number }) => {
    setCoords(newCoords);
  };

  const handleConfirm = () => {
    onNext({ ...coords, address });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Pin Issue Location</h3>
        <p className="text-sm text-muted-foreground">
          Click on the map or drag the marker to select the exact location
        </p>
      </div>

      <Suspense
        fallback={
          <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        }
      >
        <LocationPicker
          initialPosition={coords}
          onLocationChange={handleLocationChange}
        />
      </Suspense>

      <div className="bg-muted p-3 rounded-lg">
        <p className="text-sm font-medium">Selected Location:</p>
        <p className="text-xs text-muted-foreground mt-1">
          Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
        </p>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleConfirm}
      >
        Continue to Review
      </Button>
    </div>
  );
}

// Step 6: Review
function ReviewStep({
  data,
  isSubmitting,
  onSubmit,
}: {
  data: {
    imagePreview: string | null;
    category: string | null;
    description: string;
    location: { lat: number; lng: number; address: string };
  };
  isSubmitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review Your Report</h3>

      <Card className="p-4">
        {data.imagePreview && (
          <img
            src={data.imagePreview}
            alt="Issue"
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}

        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <Badge className="mt-1 capitalize">{data.category}</Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm mt-1">{data.description}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <div className="flex items-start gap-2 mt-1">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm">
                <p>{data.location.address}</p>
                <p className="text-xs text-muted-foreground">
                  {data.location.lat.toFixed(6)}, {data.location.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          📋 Your report will be recorded on the blockchain for transparency and immutability.
        </p>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting to Blockchain..." : "Submit Report"}
      </Button>
    </div>
  );
}
