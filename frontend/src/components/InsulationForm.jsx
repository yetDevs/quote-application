import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

export function InsulationForm({ data, onChange, insulationTypes }) {
  const handleTypeChange = (value) => {
    onChange(prev => ({
      ...prev,
      insulation: {
        ...prev.insulation,
        type: value,
        locations: [{ location: '', squareFootage: '', thickness: '' }]
      }
    }));
  };

  const updateLocation = (index, field, value) => {
    const newLocations = [...data.locations];
    newLocations[index] = {
      ...newLocations[index],
      [field]: value
    };

    const newTotal = newLocations.reduce((sum, loc) => {
      if (!loc.location || !loc.squareFootage || !loc.thickness) return sum;
      const specs = insulationTypes[data.type][loc.location];
      return sum + (specs.installCost * parseFloat(loc.thickness) * parseFloat(loc.squareFootage));
    }, 0);

    onChange(prev => ({
      ...prev,
      insulation: {
        ...prev.insulation,
        locations: newLocations
      },
      totalAmount: newTotal
    }));
  };

  const addLocation = () => {
    onChange(prev => ({
      ...prev,
      insulation: {
        ...prev.insulation,
        locations: [
          ...prev.insulation.locations,
          { location: '', squareFootage: '', thickness: '' }
        ]
      }
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Insulation Details</h2>

      <div className="space-y-4">
        <Label>Insulation Type</Label>
        <Select value={data.type} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openCell">Open Cell Spray Foam</SelectItem>
            <SelectItem value="closedCell">Closed Cell Spray Foam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.locations.map((loc, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-4">
          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              value={loc.location}
              onValueChange={(value) => updateLocation(index, 'location', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(insulationTypes[data.type]).map((location) => (
                  <SelectItem key={location} value={location}>
                    {location.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Square Footage</Label>
            <Input
              type="number"
              value={loc.squareFootage}
              onChange={(e) => updateLocation(index, 'squareFootage', e.target.value)}
              placeholder="Enter square footage"
            />
          </div>

          <div className="space-y-2">
            <Label>Thickness (inches)</Label>
            <Input
              type="number"
              value={loc.thickness}
              onChange={(e) => updateLocation(index, 'thickness', e.target.value)}
              placeholder="Enter thickness"
            />
          </div>

          {loc.location && (
            <div className="mt-2 text-sm space-y-1">
              <p>R-Value: {insulationTypes[data.type][loc.location].rValue}</p>
              <p>MIN Code: {insulationTypes[data.type][loc.location].minCode}</p>
              <p>Install Cost: ${insulationTypes[data.type][loc.location].installCost}/sqft/inch</p>
            </div>
          )}
        </div>
      ))}

      <Button onClick={addLocation} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Another Location
      </Button>
    </div>
  );
}