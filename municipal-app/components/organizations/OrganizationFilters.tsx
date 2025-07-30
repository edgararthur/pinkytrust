import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { OrganizationFilters as Filters } from '@/lib/api/organizations';

interface OrganizationFiltersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Partial<Filters>;
  onApply: (filters: Partial<Filters>) => void;
}

export function OrganizationFiltersDialog({
  isOpen,
  onClose,
  filters,
  onApply,
}: OrganizationFiltersDialogProps) {
  const [localFilters, setLocalFilters] = React.useState<Partial<Filters>>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof Filters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: Partial<Filters> = {
      registration_status: undefined,
      certificate_status: undefined,
      sortBy: 'created_at',
      sortOrder: 'desc',
      dateRange: undefined
    };
    setLocalFilters(resetFilters);
    onApply(resetFilters);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Organizations</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Registration Status</Label>
            <Select
              value={localFilters.registration_status || ''}
              onValueChange={(value) => handleChange('registration_status', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Certificate Status</Label>
            <Select
              value={localFilters.certificate_status || ''}
              onValueChange={(value) => handleChange('certificate_status', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Certificate Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Certificate Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">From</Label>
                <Input
                  type="date"
                  value={localFilters.dateRange?.start || ''}
                  onChange={(e) => handleChange('dateRange', {
                    ...localFilters.dateRange,
                    start: e.target.value
                  })}
                />
              </div>
              <div>
                <Label className="text-xs">To</Label>
                <Input
                  type="date"
                  value={localFilters.dateRange?.end || ''}
                  onChange={(e) => handleChange('dateRange', {
                    ...localFilters.dateRange,
                    end: e.target.value
                  })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select
              value={localFilters.sortBy || 'created_at'}
              onValueChange={(value) => handleChange('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="name">Organization Name</SelectItem>
                <SelectItem value="registration_status">Registration Status</SelectItem>
                <SelectItem value="certificate_status">Certificate Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Select
              value={localFilters.sortOrder || 'desc'}
              onValueChange={(value) => handleChange('sortOrder', value as 'asc' | 'desc')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 