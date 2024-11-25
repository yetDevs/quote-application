import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import CustomerForm from './components/CustomerForm';
import InsulationForm from './components/InsulationForm';
import QuoteSummary from './components/QuoteSummary';
import StepIndicator from './components/StepIndicator';
import { createQuote, downloadQuotePdf } from './services/api';

const INSULATION_TYPES = {
  openCell: {
    walls: { rValue: 11.01, minCode: 'R20', inchesPerFoot: 3, installCost: 0.80, cleanupCost: 0 },
    ceiling: { rValue: 11.01, minCode: 'R32', inchesPerFoot: 3, installCost: 0.80, cleanupCost: 0 },
    crawlWalls: { rValue: 14.68, minCode: 'R14', inchesPerFoot: 4, installCost: 0.80, cleanupCost: 0 },
    crawlWallsUnder2ft: { rValue: 14.68, minCode: 'R14', inchesPerFoot: 4, installCost: 0.95, cleanupCost: 0 },
    pipes: { rValue: 11.01, minCode: 'R11', inchesPerFoot: 3, installCost: 1.02, cleanupCost: 0 },
    polyTarping: { rValue: 0, minCode: '', inchesPerFoot: 0, installCost: 1.10, cleanupCost: 0 }
  },
  closedCell: {
    walls: { rValue: 11.4, minCode: 'R20', inchesPerFoot: 2, installCost: 2.20, cleanupCost: 0 },
    ceiling: { rValue: 11.4, minCode: 'R32', inchesPerFoot: 2, installCost: 2.20, cleanupCost: 0 },
    crawlWalls: { rValue: 8.55, minCode: 'R18', inchesPerFoot: 1.5, installCost: 2.20, cleanupCost: 0 },
    crawlWallsUnder2ft: { rValue: 17.1, minCode: 'R18', inchesPerFoot: 3, installCost: 2.20, cleanupCost: 0 },
    insulatedTarps: { rValue: 5.7, minCode: 'R5', inchesPerFoot: 1, installCost: 1.75, cleanupCost: 0 },
    fullFillWalls: { rValue: 22.8, minCode: 'R20', inchesPerFoot: 4, installCost: 2.20, cleanupCost: 0 },
    underSlab: { rValue: 11.4, minCode: 'R12', inchesPerFoot: 2, installCost: 3.30, cleanupCost: 0 },
    rimJoists: { rValue: 0, minCode: 'R24/4"', inchesPerFoot: 0, installCost: 13.50, cleanupCost: 0 }
  }
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState({
    customer: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    insulation: {
      type: 'openCell',
      locations: [
        { location: '', squareFootage: '', thickness: '' }
      ]
    },
    totalAmount: 0,
  });

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await createQuote(quoteData);
      const quoteId = response.data.quote_id;
      await downloadQuotePdf(quoteId);
    } catch (error) {
      console.error('Error creating quote:', error);
      // Add error handling here
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CustomerForm data={quoteData.customer} onChange={setQuoteData} />;
      case 2:
        return <InsulationForm 
          data={quoteData.insulation} 
          onChange={setQuoteData} 
          insulationTypes={INSULATION_TYPES} 
        />;
      case 3:
        return <QuoteSummary data={quoteData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <Card className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <StepIndicator currentStep={currentStep} totalSteps={3} />
        </div>

        {renderStep()}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={loading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              className="ml-auto"
              disabled={loading}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="ml-auto"
              disabled={loading}
            >
              Generate Quote
              <FileDown className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}