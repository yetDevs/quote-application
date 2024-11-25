import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function CustomerForm({ data, onChange }) {
  const handleChange = (e) => {
    onChange(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [e.target.name]: e.target.value
      }
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Customer Information</h2>
      
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={data.name}
          onChange={handleChange}
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={data.email}
          onChange={handleChange}
          placeholder="john@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={data.phone}
          onChange={handleChange}
          placeholder="(555) 555-5555"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={data.address}
          onChange={handleChange}
          placeholder="123 Main St"
        />
      </div>
    </div>
  );
}
