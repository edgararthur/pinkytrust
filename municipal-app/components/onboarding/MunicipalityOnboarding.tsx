'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  Building2,
  Users,
  Settings,
  Shield,
  Sparkles
} from 'lucide-react';
import { MunicipalityRegistrationForm } from '@/components/municipality/MunicipalityRegistrationForm';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  current: boolean;
}

interface MunicipalityOnboardingProps {
  municipalityId?: string;
  onComplete?: () => void;
}

export function MunicipalityOnboarding({ 
  municipalityId, 
  onComplete 
}: MunicipalityOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'registration',
      title: 'Municipality Registration',
      description: 'Register your municipality and create admin account',
      icon: Building2,
      completed: completedSteps.has(0),
      current: currentStep === 0
    },
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Set up your municipality profile and contact information',
      icon: Settings,
      completed: completedSteps.has(1),
      current: currentStep === 1
    },
    {
      id: 'users',
      title: 'Add Team Members',
      description: 'Invite staff members and assign roles',
      icon: Users,
      completed: completedSteps.has(2),
      current: currentStep === 2
    },
    {
      id: 'permissions',
      title: 'Configure Permissions',
      description: 'Set up role-based access control',
      icon: Shield,
      completed: completedSteps.has(3),
      current: currentStep === 3
    },
    {
      id: 'launch',
      title: 'Launch Platform',
      description: 'Complete setup and start using the platform',
      icon: Sparkles,
      completed: completedSteps.has(4),
      current: currentStep === 4
    }
  ];

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to the Municipal Breast Cancer Awareness Platform
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Let's get your municipality set up to effectively manage breast cancer awareness 
            programs, track screenings, and coordinate with healthcare organizations.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${step.completed 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : step.current 
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }
                  `}>
                    {step.completed ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${
                      step.current ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 max-w-24">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-0.5 mx-4 transition-all duration-300
                    ${completedSteps.has(index) ? 'bg-green-600' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 0 && (
            <RegistrationStep 
              onComplete={() => handleStepComplete(0)}
              municipalityId={municipalityId}
            />
          )}
          
          {currentStep === 1 && (
            <ProfileStep 
              onComplete={() => handleStepComplete(1)}
              onPrevious={handlePrevious}
            />
          )}
          
          {currentStep === 2 && (
            <UsersStep 
              onComplete={() => handleStepComplete(2)}
              onPrevious={handlePrevious}
            />
          )}
          
          {currentStep === 3 && (
            <PermissionsStep 
              onComplete={() => handleStepComplete(3)}
              onPrevious={handlePrevious}
            />
          )}
          
          {currentStep === 4 && (
            <LaunchStep 
              onComplete={() => handleStepComplete(4)}
              onPrevious={handlePrevious}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function RegistrationStep({ 
  onComplete, 
  municipalityId 
}: { 
  onComplete: () => void;
  municipalityId?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          Municipality Registration
        </CardTitle>
        <p className="text-gray-600">
          First, let's register your municipality and create your admin account.
        </p>
      </CardHeader>
      <CardContent>
        <MunicipalityRegistrationForm 
          onSuccess={onComplete}
        />
      </CardContent>
    </Card>
  );
}

function ProfileStep({ 
  onComplete, 
  onPrevious 
}: { 
  onComplete: () => void;
  onPrevious: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600" />
          Complete Municipality Profile
        </CardTitle>
        <p className="text-gray-600">
          Provide additional details about your municipality and customize your settings.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Profile Setup</h3>
          <p className="text-blue-800 text-sm mb-4">
            Complete your municipality profile to help organizations and citizens find and connect with you.
          </p>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Basic information (completed during registration)</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4" />
              <span>Upload municipality logo and photos</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4" />
              <span>Set operating hours and contact preferences</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4" />
              <span>Configure notification settings</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={onComplete}>
            Complete Profile Setup
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UsersStep({ 
  onComplete, 
  onPrevious 
}: { 
  onComplete: () => void;
  onPrevious: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          Add Team Members
        </CardTitle>
        <p className="text-gray-600">
          Invite your staff members and assign appropriate roles for platform access.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Team Setup</h3>
          <p className="text-green-800 text-sm mb-4">
            Add team members to help manage breast cancer awareness programs and coordinate activities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-900 mb-2">Recommended Roles:</h4>
              <ul className="space-y-1 text-green-800">
                <li>• Health Program Manager</li>
                <li>• Community Outreach Coordinator</li>
                <li>• Data Entry Staff</li>
                <li>• Administrative Assistant</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-2">Available Permissions:</h4>
              <ul className="space-y-1 text-green-800">
                <li>• Manage Organizations</li>
                <li>• Coordinate Events</li>
                <li>• Issue Certificates</li>
                <li>• Generate Reports</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={onComplete}>
            Continue to Permissions
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PermissionsStep({ 
  onComplete, 
  onPrevious 
}: { 
  onComplete: () => void;
  onPrevious: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          Configure Permissions
        </CardTitle>
        <p className="text-gray-600">
          Review and configure role-based access control for your team members.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">Security & Access Control</h3>
          <p className="text-purple-800 text-sm mb-4">
            Ensure proper access control to protect sensitive health information and maintain compliance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Badge className="bg-blue-100 text-blue-800 mb-2">Municipal Admin</Badge>
              <ul className="space-y-1 text-purple-800">
                <li>• Full system access</li>
                <li>• User management</li>
                <li>• System settings</li>
              </ul>
            </div>
            <div>
              <Badge className="bg-green-100 text-green-800 mb-2">Manager</Badge>
              <ul className="space-y-1 text-purple-800">
                <li>• Program management</li>
                <li>• Report generation</li>
                <li>• Team coordination</li>
              </ul>
            </div>
            <div>
              <Badge className="bg-yellow-100 text-yellow-800 mb-2">Staff</Badge>
              <ul className="space-y-1 text-purple-800">
                <li>• Data entry</li>
                <li>• Basic reporting</li>
                <li>• Event coordination</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={onComplete}>
            Configure Permissions
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LaunchStep({ 
  onComplete, 
  onPrevious 
}: { 
  onComplete: () => void;
  onPrevious: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          Launch Your Platform
        </CardTitle>
        <p className="text-gray-600">
          Congratulations! Your municipality is ready to start using the platform.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 text-center">
          <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">You're All Set!</h3>
          <p className="text-gray-600 mb-6">
            Your municipality is now ready to effectively manage breast cancer awareness programs, 
            coordinate with healthcare organizations, and track community health initiatives.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-semibold text-gray-900 mb-2">Next Steps</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Explore the dashboard</li>
                <li>• Register organizations</li>
                <li>• Schedule events</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-semibold text-gray-900 mb-2">Resources</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• User guide</li>
                <li>• Training materials</li>
                <li>• Support contacts</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-semibold text-gray-900 mb-2">Support</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• 24/7 help desk</li>
                <li>• Community forum</li>
                <li>• Video tutorials</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={onComplete} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            Launch Platform
            <Sparkles className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
