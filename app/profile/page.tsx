'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Edit,
  Save,
  X,
  Building
} from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    title: 'Senior Recruiter'
  });

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to the backend
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{profile.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{profile.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{profile.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Professional Information
            </CardTitle>
            <CardDescription>
              Your work-related details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              {isEditing ? (
                <Input
                  id="title"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{profile.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              {isEditing ? (
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{profile.company}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              {isEditing ? (
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{profile.location}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account preferences and security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Change Password</h4>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Add an extra layer of security</p>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Notification Preferences</h4>
              <p className="text-sm text-gray-500">Manage your email and push notifications</p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
