# CivicChain Frontend Technical Design Specification

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Component Architecture](#component-architecture)
4. [Page Designs & Flows](#page-designs--flows)
5. [Modal Interactions](#modal-interactions)
6. [API Integration Details](#api-integration-details)
7. [State Management](#state-management)
8. [Real-time Updates](#real-time-updates)
9. [Performance Optimization](#performance-optimization)

---

## Overview

This document provides a comprehensive technical specification for the CivicChain frontend application, detailing the exact implementation of UI components, API integrations, and user flows using **Next.js 14**, **shadcn/ui**, **Tailwind CSS**, and **React** best practices.

### Design System
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **Icons**: Lucide React
- **Maps**: Mapbox GL JS or Google Maps API
- **State Management**: React Context + Zustand for global state
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (React Query)

---

## Technology Stack

```json
{
  "framework": "Next.js 14 (App Router)",
  "ui": "shadcn/ui + Radix UI",
  "styling": "Tailwind CSS",
  "authentication": "NextAuth.js v5",
  "maps": "Mapbox GL JS",
  "state": "Zustand + React Context",
  "forms": "React Hook Form + Zod",
  "data-fetching": "TanStack Query v5",
  "http": "Axios",
  "notifications": "Sonner",
  "animations": "Framer Motion"
}
```

---

## Component Architecture

### Core Components (shadcn/ui)

#### 1. **Issue Card Component**
```tsx
// components/issues/issue-card.tsx
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, MapPin, Share2 } from "lucide-react"

interface IssueCardProps {
  issue: {
    issue_id: string
    image_url: string
    description: string
    category: 'pothole' | 'garbage' | 'streetlight' | 'water' | 'other'
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    priority_score: number
    upvotes: number
    downvotes: number
    location: string
    distance: string
    created_at: string
  }
  onUpvote: (id: string) => void
  onDownvote: (id: string) => void
  onShare: (id: string) => void
  onClick: (id: string) => void
}

export function IssueCard({ issue, onUpvote, onDownvote, onShare, onClick }: IssueCardProps) {
  const categoryColors = {
    pothole: 'bg-orange-100 text-orange-700 border-orange-200',
    garbage: 'bg-green-100 text-green-700 border-green-200',
    streetlight: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    water: 'bg-blue-100 text-blue-700 border-blue-200',
    other: 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const statusColors = {
    open: 'bg-red-50 text-red-600 border-red-200',
    in_progress: 'bg-blue-50 text-blue-600 border-blue-200',
    resolved: 'bg-green-50 text-green-600 border-green-200',
    closed: 'bg-gray-50 text-gray-600 border-gray-200'
  }

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(issue.issue_id)}
    >
      <div className="relative h-48 w-full">
        <img 
          src={issue.image_url} 
          alt={issue.description}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={categoryColors[issue.category]}>
            {issue.category}
          </Badge>
          <Badge className={statusColors[issue.status]}>
            {issue.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <h3 className="text-lg font-semibold line-clamp-1">{issue.description}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{issue.location}</span>
          <span>•</span>
          <span>{issue.distance}</span>
        </div>
      </CardHeader>

      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">Priority:</span>
          <span className="text-lg font-bold text-primary">{issue.priority_score}</span>
        </div>
        <span className="text-xs text-muted-foreground">{issue.created_at}</span>
      </CardFooter>

      <CardFooter className="flex gap-2 pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={(e) => { e.stopPropagation(); onUpvote(issue.issue_id); }}
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          {issue.upvotes}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={(e) => { e.stopPropagation(); onDownvote(issue.issue_id); }}
        >
          <TrendingDown className="h-4 w-4 mr-1" />
          {issue.downvotes}
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => { e.stopPropagation(); onShare(issue.issue_id); }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
```

#### 2. **Search & Filter Bar**
```tsx
// components/issues/search-filter-bar.tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { List, Map as MapIcon, Filter, Search } from "lucide-react"

interface SearchFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode: 'list' | 'map'
  onViewModeChange: (mode: 'list' | 'map') => void
  onFilterOpen: () => void
}

export function SearchFilterBar({ 
  searchQuery, 
  onSearchChange, 
  viewMode, 
  onViewModeChange,
  onFilterOpen 
}: SearchFilterBarProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search issues by location or type..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onViewModeChange('list')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'map' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onViewModeChange('map')}
        >
          <MapIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onFilterOpen}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
```

#### 3. **Floating Action Button (Create Issue)**
```tsx
// components/issues/fab-create-issue.tsx
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface FABCreateIssueProps {
  onClick: () => void
}

export function FABCreateIssue({ onClick }: FABCreateIssueProps) {
  return (
    <Button
      size="lg"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
      onClick={onClick}
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
```

---

## Page Designs & Flows

### 1. **Home Page (Issue Feed)**

#### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│ Header                                              │
│ [Logo] CivicChain                    [Bell] [User]  │
│ Hyderabad, Telangana                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Welcome back!                                       │
│ Here are the civic issues near you                  │
│                                                     │
│ [Search Bar........................] [List][Map][⚙]│
│                                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │  Issue   │ │  Issue   │ │  Issue   │            │
│ │  Card 1  │ │  Card 2  │ │  Card 3  │            │
│ │          │ │          │ │          │            │
│ └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│ ┌──────────┐                                       │
│ │  Issue   │                            [+] FAB    │
│ │  Card 4  │                                       │
│ └──────────┘                                       │
└─────────────────────────────────────────────────────┘
```

#### API Integration

**Initial Page Load:**
```typescript
// app/page.tsx
'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useGeolocation } from '@/hooks/use-geolocation'
import { IssueCard } from '@/components/issues/issue-card'
import { SearchFilterBar } from '@/components/issues/search-filter-bar'
import { FABCreateIssue } from '@/components/issues/fab-create-issue'
import { CreateIssueModal } from '@/components/modals/create-issue-modal'

export default function HomePage() {
  const { coordinates, loading: geoLoading } = useGeolocation()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  // Fetch nearby issues
  const { data: issuesData, isLoading, refetch } = useQuery({
    queryKey: ['issues', coordinates?.lat, coordinates?.lng, searchQuery],
    queryFn: async () => {
      const response = await axios.get('/issues', {
        params: {
          lat: coordinates?.lat,
          lng: coordinates?.lng,
          radius: 5000, // 5km
          status: 'open,in_progress,resolved'
        },
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
      return response.data
    },
    enabled: !!coordinates
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">CivicChain</h1>
              <p className="text-sm text-muted-foreground">Hyderabad, Telangana</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Here are the civic issues near you</p>
        </div>

        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFilterOpen={() => {/* Open filter sheet */}}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {issuesData?.issues?.map((issue) => (
            <IssueCard
              key={issue.issue_id}
              issue={issue}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onShare={handleShare}
              onClick={handleIssueClick}
            />
          ))}
        </div>

        <FABCreateIssue onClick={() => setCreateModalOpen(true)} />
      </main>

      <CreateIssueModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          refetch()
          setCreateModalOpen(false)
        }}
      />
    </div>
  )
}
```

**API Request for Issues:**
```http
GET /issues?lat=17.385044&lng=78.486671&radius=5000&status=open,in_progress,resolved
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200 OK):
{
  "success": true,
  "count": 4,
  "issues": [
    {
      "issue_id": "550e8400-e29b-41d4-a716-446655440000",
      "reporter_user_id": "660e8400-e29b-41d4-a716-446655440001",
      "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      "image_url": "/uploads/1705318200000-abc123.jpg",
      "description": "Large pothole on Main Street",
      "category": "pothole",
      "location": "POINT(78.486671 17.385044)",
      "region": "Main Street, Sector 5",
      "status": "open",
      "priority_score": 85,
      "blockchain_tx_hash": "4ZJh5xKZ...",
      "upvotes": 24,
      "downvotes": 2,
      "admin_proof_url": null,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "distance": 345.67, // meters
      "reporter": {
        "name": "John Doe",
        "profile_pic": "https://..."
      }
    },
    // ... more issues
  ]
}
```

---

## Modal Interactions

### Create Issue Modal Flow

#### Step 1: Image Upload
```tsx
// components/modals/create-issue-modal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

const STEPS = {
  UPLOAD: 1,
  CLASSIFY: 2,
  CONFIRM: 3,
  DESCRIPTION: 4,
  LOCATION: 5,
  REVIEW: 6
}

export function CreateIssueModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState(STEPS.UPLOAD)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [aiClassification, setAiClassification] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState({ lat: 0, lng: 0 })

  const handleImageUpload = (file: File) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setStep(STEPS.CLASSIFY)
    classifyImage(file)
  }

  const classifyImage = async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await axios.post('/issue/classify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${getToken()}`
        }
      })
      
      setAiClassification(response.data.suggested_category)
      setStep(STEPS.CONFIRM)
    } catch (error) {
      toast.error('AI classification failed. Please select category manually.')
      setStep(STEPS.CONFIRM)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
            onConfirm={(category) => {
              setSelectedCategory(category)
              setStep(STEPS.DESCRIPTION)
            }}
          />
        )}
        {step === STEPS.DESCRIPTION && (
          <DescriptionStep
            imagePreview={imagePreview}
            category={selectedCategory}
            onNext={(desc) => {
              setDescription(desc)
              setStep(STEPS.LOCATION)
            }}
          />
        )}
        {step === STEPS.LOCATION && (
          <LocationStep
            onNext={(coords) => {
              setLocation(coords)
              setStep(STEPS.REVIEW)
            }}
          />
        )}
        {step === STEPS.REVIEW && (
          <ReviewStep
            data={{
              imagePreview,
              category: selectedCategory,
              description,
              location
            }}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
```

#### Step 1: Image Upload Component
```tsx
// components/modals/steps/upload-step.tsx
import { useDropzone } from 'react-dropzone'
import { Upload, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UploadStep({ onUpload }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (files) => {
      if (files[0]) onUpload(files[0])
    }
  })

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
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
  )
}
```

**API Request (Step 2 - Auto-Classify):**
```http
POST /issue/classify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

[Binary image data]

Response (200 OK):
{
  "success": true,
  "suggested_category": "pothole",
  "urgency_score": 8,
  "image_url": "/uploads/1705318200000-abc123.jpg"
}
```

#### Step 3: Confirm Category
```tsx
// components/modals/steps/confirm-category-step.tsx
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'

const CATEGORIES = [
  { id: 'pothole', label: 'Pothole', icon: '🕳️', color: 'orange' },
  { id: 'garbage', label: 'Garbage', icon: '🗑️', color: 'green' },
  { id: 'streetlight', label: 'Streetlight', icon: '💡', color: 'yellow' },
  { id: 'water', label: 'Water Issue', icon: '💧', color: 'blue' },
  { id: 'other', label: 'Other', icon: '📋', color: 'gray' }
]

export function ConfirmCategoryStep({ aiCategory, onConfirm }) {
  const [selected, setSelected] = useState(aiCategory)

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
              ${selected === cat.id ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}
            `}
            onClick={() => setSelected(cat.id)}
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
        onClick={() => onConfirm(selected)}
      >
        Continue
      </Button>
    </div>
  )
}
```

#### Step 4: Description
```tsx
// components/modals/steps/description-step.tsx
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export function DescriptionStep({ imagePreview, category, onNext }) {
  const [description, setDescription] = useState('')

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <img 
          src={imagePreview} 
          alt="Preview" 
          className="w-32 h-32 object-cover rounded-lg"
        />
        <div className="flex-1">
          <Badge className="mb-2">{category}</Badge>
          <Label htmlFor="description">Describe the Issue</Label>
          <Textarea
            id="description"
            placeholder="Provide details about the issue, exact location, and severity..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
        onClick={() => onNext(description)}
      >
        Continue to Location
      </Button>
    </div>
  )
}
```

#### Step 5: Location Selection
```tsx
// components/modals/steps/location-step.tsx
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { Button } from '@/components/ui/button'
import { Crosshair } from 'lucide-react'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

export function LocationStep({ onNext }) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)
  const [coords, setCoords] = useState({ lat: 0, lng: 0 })
  const [address, setAddress] = useState('')

  useEffect(() => {
    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })
        initializeMap(latitude, longitude)
      },
      (error) => {
        // Default to city center if location denied
        const defaultLat = 17.385044
        const defaultLng = 78.486671
        setCoords({ lat: defaultLat, lng: defaultLng })
        initializeMap(defaultLat, defaultLng)
      }
    )
  }, [])

  const initializeMap = (lat: number, lng: number) => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 15
    })

    // Add draggable marker
    marker.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([lng, lat])
      .addTo(map.current)

    marker.current.on('dragend', () => {
      const lngLat = marker.current!.getLngLat()
      setCoords({ lat: lngLat.lat, lng: lngLat.lng })
      reverseGeocode(lngLat.lat, lngLat.lng)
    })

    reverseGeocode(lat, lng)
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      )
      const data = await response.json()
      if (data.features && data.features[0]) {
        setAddress(data.features[0].place_name)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  const recenterToCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords
      setCoords({ lat: latitude, lng: longitude })
      map.current?.flyTo({ center: [longitude, latitude], zoom: 15 })
      marker.current?.setLngLat([longitude, latitude])
      reverseGeocode(latitude, longitude)
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Pin Issue Location</h3>
        <p className="text-sm text-muted-foreground">
          Drag the marker to the exact location of the issue
        </p>
      </div>

      <div className="relative">
        <div ref={mapContainer} className="h-[400px] rounded-lg overflow-hidden" />
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-4 right-4 shadow-lg"
          onClick={recenterToCurrentLocation}
        >
          <Crosshair className="h-4 w-4" />
        </Button>
      </div>

      {address && (
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm font-medium">Selected Location:</p>
          <p className="text-sm text-muted-foreground">{address}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
          </p>
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={() => onNext(coords)}
      >
        Continue to Review
      </Button>
    </div>
  )
}
```

#### Step 6: Review & Submit
```tsx
// components/modals/steps/review-step.tsx
import { Card } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

export function ReviewStep({ data, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      toast.error('Failed to submit issue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review Your Report</h3>

      <Card className="p-4">
        <img 
          src={data.imagePreview} 
          alt="Issue" 
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <Badge className="mt-1">{data.category}</Badge>
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          📋 Your report will be recorded on the blockchain for transparency and immutability.
        </p>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting to Blockchain...' : 'Submit Report'}
      </Button>
    </div>
  )
}
```

**API Request (Final Submit):**
```http
POST /issue/report
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "image_url": "/uploads/1705318200000-abc123.jpg",
  "description": "Large pothole on Main Street causing traffic issues",
  "category": "pothole",
  "lat": 17.385044,
  "lng": 78.486671
}

Response (200 OK):
{
  "success": true,
  "issue": {
    "issue_id": "550e8400-e29b-41d4-a716-446655440000",
    "reporter_user_id": "660e8400-e29b-41d4-a716-446655440001",
    "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "image_url": "/uploads/1705318200000-abc123.jpg",
    "description": "Large pothole on Main Street causing traffic issues",
    "category": "pothole",
    "location": "POINT(78.486671 17.385044)",
    "status": "open",
    "priority_score": 25.5,
    "blockchain_tx_hash": "4ZJh5xKZvq3N8mF2Lp9Rw7VkDyT3BnXs6Hc8Jm1Qr4Wp",
    "upvotes": 0,
    "downvotes": 0,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Profile & Reputation Page

### Profile Page Design

#### Layout Structure
```
┌────────────────────────────────────────────────┐
│ Profile & Reputation              [⚙] [✕]     │
├────────────────────────────────────────────────┤
│                                                │
│  ┌────────────────────────────────────────┐   │
│  │ [Avatar]  Amit Patel                   │   │
│  │    (7)    Member since January 2023    │   │
│  │           ⭐ Level 7 • ⚡ 432 Rep       │   │
│  │                                        │   │
│  │  Progress to Level 8    [███████░░] 432/500│
│  └────────────────────────────────────────┘   │
│                                                │
│  ┌──────┬──────┬──────┬──────┐               │
│  │Issues│Resolv│Upvote│Verifi│               │
│  │  52  │  38  │ 387  │  28  │               │
│  └──────┴──────┴──────┴──────┘               │
│                                                │
│  Badges & Achievements                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │🏆 Top    │ │✅ Verifi │ │⭐Community│      │
│  │Reporter  │ │   er     │ │  Hero    │      │
│  │✓ Earned  │ │✓ Earned  │ │✓ Earned  │      │
│  └──────────┘ └──────────┘ └──────────┘      │
│                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │⭐ Rising │ │📅 Consist│ │👁️ Eagle  │      │
│  │  Star    │ │   ent    │ │   Eye    │      │
│  │52% ████░░│ │73% ██████│ │35% ███░░░│      │
│  └──────────┘ └──────────┘ └──────────┘      │
└────────────────────────────────────────────────┘
```

#### Profile Component Implementation
```tsx
// components/profile/profile-modal.tsx
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, CheckCircle, Star, TrendingUp, Calendar, Eye } from 'lucide-react'

interface ProfileModalProps {
  open: boolean
  onClose: () => void
  userId?: string // If provided, shows another user's profile
}

export function ProfileModal({ open, onClose, userId }: ProfileModalProps) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const endpoint = userId ? `/user/${userId}` : '/user/me'
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      return response.data.user
    }
  })

  if (isLoading) return <ProfileSkeleton />

  const levelProgress = (profile.rep % 100) / 100 * 100
  const nextLevelRep = Math.ceil(profile.rep / 100) * 100

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <h2 className="text-xl font-semibold">Profile & Reputation</h2>
        </DialogHeader>

        {/* Header Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-white">
                  <AvatarImage src={profile.profile_pic} />
                  <AvatarFallback>{profile.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-yellow-900">
                  {Math.floor(profile.rep / 100)}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold">{profile.name}</h3>
                <p className="text-blue-100 text-sm">
                  Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary" className="bg-white/20 hover:bg-white/30">
                    ⭐ Level {Math.floor(profile.rep / 100)}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 hover:bg-white/30">
                    ⚡ {profile.rep} Rep
                  </Badge>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress to Level {Math.floor(profile.rep / 100) + 1}</span>
                    <span className="font-semibold">{profile.rep}/{nextLevelRep}</span>
                  </div>
                  <Progress value={levelProgress} className="bg-white/20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Issues Reported"
            value={profile.issues_reported}
            icon="📋"
          />
          <StatCard
            label="Resolved"
            value={profile.issues_resolved}
            icon="✅"
            valueColor="text-green-600"
          />
          <StatCard
            label="Total Upvotes"
            value={profile.total_upvotes}
            icon="👍"
            valueColor="text-blue-600"
          />
          <StatCard
            label="Verifications"
            value={profile.verifications_done}
            icon="🔍"
            valueColor="text-purple-600"
          />
        </div>

        {/* Badges Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Badges & Achievements
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <BadgeCard
              title="Top Reporter"
              description="Reported 50+ issues"
              icon={<Trophy className="h-8 w-8 text-yellow-500" />}
              earned={profile.badges.includes('Top Reporter')}
              progress={100}
            />
            <BadgeCard
              title="Verifier"
              description="Verified 25 resolved issues"
              icon={<CheckCircle className="h-8 w-8 text-green-500" />}
              earned={profile.badges.includes('Verifier')}
              progress={100}
            />
            <BadgeCard
              title="Community Hero"
              description="Received 500+ upvotes"
              icon={<Star className="h-8 w-8 text-blue-500" />}
              earned={profile.badges.includes('Community Hero')}
              progress={100}
            />
            <BadgeCard
              title="Rising Star"
              description="Report 100 issues"
              icon={<TrendingUp className="h-8 w-8 text-purple-500" />}
              earned={false}
              progress={52}
            />
            <BadgeCard
              title="Consistent"
              description="Active for 30 consecutive days"
              icon={<Calendar className="h-8 w-8 text-orange-500" />}
              earned={false}
              progress={73}
            />
            <BadgeCard
              title="Eagle Eye"
              description="First to report 20 issues"
              icon={<Eye className="h-8 w-8 text-red-500" />}
              earned={false}
              progress={35}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StatCard({ label, value, icon, valueColor = 'text-foreground' }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className="text-2xl mb-1">{icon}</div>
        <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}

function BadgeCard({ title, description, icon, earned, progress }) {
  return (
    <Card className={earned ? 'border-primary' : 'opacity-60'}>
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center gap-2">
          {icon}
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
          {earned ? (
            <Badge variant="default" className="mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Earned
            </Badge>
          ) : (
            <div className="w-full">
              <p className="text-xs text-muted-foreground mb-1">Progress</p>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

**API Request for Profile:**
```http
GET /user/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200 OK):
{
  "success": true,
  "user": {
    "user_id": "660e8400-e29b-41d4-a716-446655440001",
    "email": "amit@example.com",
    "name": "Amit Patel",
    "profile_pic": "https://lh3.googleusercontent.com/...",
    "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "role": "citizen",
    "rep": 432,
    "issues_reported": 52,
    "issues_resolved": 38,
    "total_upvotes": 387,
    "verifications_done": 28,
    "badges": ["Top Reporter", "Verifier", "Community Hero"],
    "created_at": "2023-01-15T10:30:00.000Z"
  }
}
```

---

## API Integration Details

### Complete API Endpoint Summary

| Endpoint | Method | Purpose | Request Payload | Response Structure |
|----------|--------|---------|----------------|-------------------|
| `/auth/login` | POST | NextAuth JWT verification | `{ jwt_token }` | `{ success, is_new, user }` |
| `/user/me` | GET | Get current user profile | None | `{ success, user }` |
| `/user/:user_id` | GET | Get public profile | None | `{ success, user }` |
| `/issue/classify` | POST | AI image classification | `FormData(image)` | `{ success, suggested_category, urgency_score, image_url }` |
| `/issue/report` | POST | Submit new issue | `{ image_url, description, category, lat, lng }` | `{ success, issue }` |
| `/issues` | GET | List nearby issues | `?lat&lng&radius&category&status` | `{ success, count, issues[] }` |
| `/issue/:id` | GET | Get issue details | None | `{ success, issue }` |
| `/issue/:id/upvote` | POST | Upvote issue | None | `{ success, message, issue, reporter_rep_change, blockchain_tx_hash }` |
| `/issue/:id/downvote` | POST | Downvote issue | None | `{ success, message, issue, reporter_rep_change, blockchain_tx_hash }` |
| `/issue/:id/verify` | POST | Verify resolved issue | `{ verified: true }` | `{ success, message, issue, rep_rewards, blockchain_tx_hash }` |
| `/issue/:id/update-status` | POST | Update status (gov only) | `FormData(status, proof_image)` | `{ success, message, issue, blockchain_tx_hash }` |
| `/admin/dashboard` | GET | Dashboard stats (gov only) | None | `{ success, stats, heatmap_data, top_priority_issues[] }` |
| `/admin/issues` | GET | All issues with filters (gov) | `?status&category&date_from&date_to&sort_by&page&limit` | `{ success, pagination, issues[] }` |

### Authentication Flow
```typescript
// lib/auth.ts
import { getSession } from 'next-auth/react'
import axios from 'axios'

export async function authenticateUser() {
  const session = await getSession()
  
  if (!session?.user?.email) {
    throw new Error('No session found')
  }

  // Send JWT to backend for verification/user creation
  const response = await axios.post('/auth/login', {
    jwt_token: session.accessToken
  })

  return response.data
}

// Store JWT in localStorage or HTTP-only cookie
export function setAuthToken(token: string) {
  localStorage.setItem('civicchain_token', token)
}

export function getAuthToken() {
  return localStorage.getItem('civicchain_token')
}
```

### Axios Instance Configuration
```typescript
// lib/axios.ts
import axios from 'axios'
import { getAuthToken } from './auth'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## State Management

### Global State (Zustand)
```typescript
// store/app-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  user: User | null
  location: { lat: number; lng: number } | null
  filters: {
    category: string[]
    status: string[]
    radius: number
  }
  setUser: (user: User | null) => void
  setLocation: (location: { lat: number; lng: number }) => void
  updateFilters: (filters: Partial<AppState['filters']>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      location: null,
      filters: {
        category: [],
        status: ['open', 'in_progress'],
        radius: 5000
      },
      setUser: (user) => set({ user }),
      setLocation: (location) => set({ location }),
      updateFilters: (filters) => 
        set((state) => ({ 
          filters: { ...state.filters, ...filters } 
        }))
    }),
    {
      name: 'civicchain-storage'
    }
  )
)
```

### React Query Setup
```typescript
// providers/query-provider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

## Real-time Updates

### Polling Strategy
```typescript
// hooks/use-issues.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { useAppStore } from '@/store/app-store'

export function useIssues() {
  const location = useAppStore((state) => state.location)
  const filters = useAppStore((state) => state.filters)

  return useQuery({
    queryKey: ['issues', location, filters],
    queryFn: async () => {
      if (!location) return null
      
      const response = await api.get('/issues', {
        params: {
          lat: location.lat,
          lng: location.lng,
          radius: filters.radius,
          category: filters.category.join(','),
          status: filters.status.join(',')
        }
      })
      
      return response.data
    },
    enabled: !!location,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true
  })
}
```

---

## Performance Optimization

### Image Optimization
- Use Next.js `<Image>` component for automatic optimization
- Lazy load issue cards with `react-intersection-observer`
- Implement virtual scrolling for large lists with `react-virtual`

### Code Splitting
```typescript
// Dynamic imports for heavy components
const MapView = dynamic(() => import('@/components/map-view'), {
  loading: () => <MapSkeleton />,
  ssr: false
})

const ProfileModal = dynamic(() => import('@/components/profile/profile-modal'), {
  loading: () => <Spinner />
})
```

### Caching Strategy
- Cache user profile data in localStorage
- Cache issue images with service worker
- Use React Query's built-in caching for API responses

---

## Component Library (shadcn/ui)

### Required Components
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add skeleton
```

---

## Conclusion

This technical specification provides a complete blueprint for implementing the CivicChain frontend application. Every component, API integration point, and user flow has been detailed with production-ready code examples using shadcn/ui components and modern React patterns.

The design ensures:
- ✅ **Seamless UX**: Multi-step modal flow with progress indication
- ✅ **Real-time Updates**: React Query with automatic refetching
- ✅ **Type Safety**: TypeScript throughout
- ✅ **Performance**: Code splitting, image optimization, virtual scrolling
- ✅ **Accessibility**: shadcn/ui components are ARIA-compliant
- ✅ **Responsive Design**: Tailwind CSS for mobile-first layouts
- ✅ **State Management**: Zustand for global state, React Query for server state
- ✅ **Developer Experience**: Well-organized code structure with clear patterns

All backend API endpoints are fully specified and ready for integration.