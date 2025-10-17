"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { Upload, Camera, Check, MapPin } from "lucide-react";
import clientApi from "@/lib/client-api";
import { getUserId } from "@/lib/auth";
import { useGeolocation } from "@/hooks/use-geolocation";

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">Report New Issue</DialogTitle>
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {step} of 6</span>
              <span>{Math.round((step / 6) * 100)}%</span>
            </div>
            <Progress value={(step / 6) * 100} className="h-2" />
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
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
        </div>
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
    <div className="space-y-4 sm:space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive ? "border-primary bg-primary/5 scale-[0.98]" : "border-border hover:border-primary/50 hover:bg-accent/50"}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
        <h3 className="text-base sm:text-lg font-semibold mb-2">Upload Issue Photo</h3>
        <p className="text-sm text-muted-foreground">
          Drag and drop an image here, or click to select
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Supports: JPG, PNG, WEBP (Max 10MB)
        </p>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs sm:text-sm text-muted-foreground">OR</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Button variant="outline" className="w-full" size="lg">
        <Camera className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
    <div className="space-y-4 sm:space-y-6">
      {aiCategory && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm font-medium flex items-center gap-2">
              <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              AI Detected: <strong className="capitalize">{aiCategory}</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Please confirm or select a different category
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => (
          <Card
            key={cat.id}
            className={`
              p-4 sm:p-6 cursor-pointer transition-all relative hover:shadow-md
              ${selected === cat.id ? "ring-2 ring-primary shadow-lg" : ""}
            `}
            onClick={() => onSelect(cat.id)}
          >
            {selected === cat.id && (
              <div className="absolute top-2 right-2 h-5 w-5 sm:h-6 sm:w-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
              </div>
            )}
            <div className="text-3xl sm:text-4xl mb-2">{cat.icon}</div>
            <h4 className="font-semibold text-sm sm:text-base">{cat.label}</h4>
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full sm:w-32 h-32 object-cover rounded-lg"
          />
        )}
        <div className="flex-1 space-y-3">
          <div>
            <Badge className="capitalize">{category}</Badge>
          </div>
          <div>
            <Label htmlFor="description" className="text-sm font-medium">Describe the Issue</Label>
            <Textarea
              id="description"
              placeholder="Provide details about the issue, exact location, and severity..."
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="mt-2 min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {description.length}/500 characters
            </p>
          </div>
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
  const [address, setAddress] = useState("Manually select location on map");

  const handleConfirm = () => {
    onNext({ ...coords, address });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Pin Issue Location</h3>
        <p className="text-sm text-muted-foreground">
          Using your current location or adjust manually
        </p>
      </div>

      <div className="bg-muted p-8 rounded-lg text-center">
        <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium">Map Integration Coming Soon</p>
        <p className="text-xs text-muted-foreground mt-2">
          Using current location for now
        </p>
      </div>

      {currentLocation && (
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm font-medium">Current Location:</p>
          <p className="text-xs text-muted-foreground mt-1">
            Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
          </p>
        </div>
      )}

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
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold">Review Your Report</h3>

      <Card>
        <CardContent className="p-4">
          {data.imagePreview && (
            <img
              src={data.imagePreview}
              alt="Issue"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}

          <div className="space-y-4">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1.5">Category</p>
              <Badge className="capitalize">{data.category}</Badge>
            </div>

            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1.5">Description</p>
              <p className="text-sm">{data.description}</p>
            </div>

            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1.5">Location</p>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="text-sm">
                  <p>{data.location.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {data.location.lat.toFixed(6)}, {data.location.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
            📋 Your report will be recorded on the blockchain for transparency and immutability.
          </p>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Submitting to Blockchain...
          </>
        ) : (
          "Submit Report"
        )}
      </Button>
    </div>
  );
}
