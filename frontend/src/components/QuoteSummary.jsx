import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function QuoteSummary({ data, insulationTypes }) {
  const calculateLocationCost = (location) => {
    if (!location.location || !location.squareFootage || !location.thickness) return 0;
    const specs = insulationTypes[data.insulation.type][location.location];
    return specs.installCost * parseFloat(location.thickness) * parseFloat(location.squareFootage);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Quote Summary</h2>

      {/* Customer Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{data.customer.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{data.customer.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{data.customer.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">{data.customer.address}</p>
          </div>
        </div>
      </Card>

      {/* Insulation Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Insulation Details</h3>
        <p className="mb-4">
          <span className="text-gray-500">Type: </span>
          <span className="font-medium">
            {data.insulation.type === 'openCell' ? 'Open Cell Spray Foam' : 'Closed Cell Spray Foam'}
          </span>
        </p>

        <div className="space-y-4">
          {data.insulation.locations.map((loc, index) => {
            const specs = insulationTypes[data.insulation.type][loc.location];
            const locationCost = calculateLocationCost(loc);

            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">
                      {loc.location.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Square Footage</p>
                    <p className="font-medium">{loc.squareFootage} sq ft</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Thickness</p>
                    <p className="font-medium">{loc.thickness} inches</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">R-Value</p>
                    <p className="font-medium">R-{specs?.rValue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Install Cost (per sqft/inch)</p>
                    <p className="font-medium">{formatCurrency(specs?.installCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location Total</p>
                    <p className="font-medium">{formatCurrency(locationCost)}</p>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="mt-4 bg-gray-50 p-3 rounded-md text-sm">
                  <p className="text-gray-600">Calculation:</p>
                  <p>
                    {loc.squareFootage} sq ft × {loc.thickness} inches × ${specs?.installCost}/sqft/inch = {formatCurrency(locationCost)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Cost Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cost Summary</h3>
        <div className="space-y-2">
          {data.insulation.locations.map((loc, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-gray-600">
                {loc.location.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <span className="font-medium">{formatCurrency(calculateLocationCost(loc))}</span>
            </div>
          ))}
          <Separator className="my-4" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount</span>
            <span>{formatCurrency(data.totalAmount)}</span>
          </div>
        </div>
      </Card>

      {/* Terms and Notes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Terms & Notes</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Quote valid for 30 days</li>
          <li>50% deposit required to schedule installation</li>
          <li>Final payment due upon completion</li>
          <li>All work complies with local building codes</li>
          <li>Includes cleanup and material disposal</li>
          <li>1-year warranty on materials and labor</li>
        </ul>
      </Card>
    </div>
  );
}

export default QuoteSummary;