'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, Download, AlertTriangle, Heart, FileText, Stethoscope } from 'lucide-react';
import jsPDF from 'jspdf';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: SymptomAnalysis;
}

interface SymptomAnalysis {
  explanation: string;
  possibleCauses: string[];
  homeRemedies: string[];
  whenToSeeDoctor: string[];
  urgentWarnings: string[];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;


    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };


    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: input }),
      });


      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.humanReadable || 'I received your symptoms and will provide guidance.',
        timestamp: new Date(),
        analysis: data // keep structured data for PDF or other uses
      };



      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error analyzing your symptoms. Please try again or consult a healthcare professional.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const generateReport = (analysis: SymptomAnalysis, symptoms: string) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MEDICAL SYMPTOM ANALYSIS REPORT', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });

    // Disclaimer Box
    yPosition += 20;
    pdf.setFillColor(255, 243, 243);
    pdf.rect(10, yPosition - 5, pageWidth - 20, 25, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('IMPORTANT DISCLAIMER:', 15, yPosition + 5);
    pdf.setFont('helvetica', 'normal');
    const disclaimerLines = pdf.splitTextToSize(
      'This report is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical concerns.',
      pageWidth - 30
    );
    pdf.text(disclaimerLines, 15, yPosition + 12);
    yPosition += 35;

    // SOAP Format
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SUBJECTIVE (Patient-Reported Symptoms):', 15, yPosition);
    yPosition += 10;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const symptomLines = pdf.splitTextToSize(symptoms, pageWidth - 30);
    pdf.text(symptomLines, 15, yPosition);
    yPosition += symptomLines.length * 7 + 10;

    // Assessment
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ASSESSMENT (AI Analysis):', 15, yPosition);
    yPosition += 10;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const explanationLines = pdf.splitTextToSize(analysis.explanation, pageWidth - 30);
    pdf.text(explanationLines, 15, yPosition);
    yPosition += explanationLines.length * 7 + 10;

    // Possible Causes
    if (analysis.possibleCauses.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Possible Causes to Discuss:', 15, yPosition);
      yPosition += 8;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      analysis.possibleCauses.forEach((cause, index) => {
        const causeText = `${index + 1}. ${cause}`;
        const causeLines = pdf.splitTextToSize(causeText, pageWidth - 30);
        pdf.text(causeLines, 15, yPosition);
        yPosition += causeLines.length * 7;
      });
      yPosition += 10;
    }

    // Plan
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PLAN (Recommendations):', 15, yPosition);
    yPosition += 10;

    if (analysis.homeRemedies.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Self-Care Suggestions:', 15, yPosition);
      yPosition += 8;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      analysis.homeRemedies.forEach((remedy, index) => {
        const remedyText = `• ${remedy}`;
        const remedyLines = pdf.splitTextToSize(remedyText, pageWidth - 30);
        pdf.text(remedyLines, 15, yPosition);
        yPosition += remedyLines.length * 7;
      });
      yPosition += 10;
    }

    if (analysis.whenToSeeDoctor.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('When to Consult Healthcare Provider:', 15, yPosition);
      yPosition += 8;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      analysis.whenToSeeDoctor.forEach((condition, index) => {
        const conditionText = `• ${condition}`;
        const conditionLines = pdf.splitTextToSize(conditionText, pageWidth - 30);
        pdf.text(conditionLines, 15, yPosition);
        yPosition += conditionLines.length * 7;
      });
      yPosition += 10;
    }

    if (analysis.urgentWarnings.length > 0) {
      pdf.setFillColor(254, 242, 242);
      pdf.rect(10, yPosition - 5, pageWidth - 20, (analysis.urgentWarnings.length * 7) + 15, 'F');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🚨 URGENT WARNING SIGNS - SEEK IMMEDIATE CARE:', 15, yPosition + 5);
      yPosition += 12;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      analysis.urgentWarnings.forEach((warning, index) => {
        const warningText = `• ${warning}`;
        const warningLines = pdf.splitTextToSize(warningText, pageWidth - 30);
        pdf.text(warningLines, 15, yPosition);
        yPosition += warningLines.length * 7;
      });
    }

    pdf.save('mediquery-symptom-report.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MediQuery</h1>
              <p className="text-sm text-gray-600">AI-Powered Symptom Checker</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-red-50 border-b border-red-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Medical Disclaimer:</strong> This tool provides educational information only and does not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical concerns.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mx-auto mb-6">
              <Heart className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Welcome to MediQuery
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Describe your symptoms in plain language, and I'll provide patient-friendly explanations,
              possible causes, home care suggestions, and guidance on when to see a healthcare provider.
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
              <Card className="p-4">
                <CardContent className="text-center p-0">
                  <FileText className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Patient-Friendly</h3>
                  <p className="text-sm text-gray-600">Clear explanations in simple language</p>
                </CardContent>
              </Card>
              <Card className="p-4">
                <CardContent className="text-center p-0">
                  <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Safety First</h3>
                  <p className="text-sm text-gray-600">Identifies when to seek immediate care</p>
                </CardContent>
              </Card>
              <Card className="p-4">
                <CardContent className="text-center p-0">
                  <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Doctor Reports</h3>
                  <p className="text-sm text-gray-600">Download structured PDF summaries</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4 mb-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.type === 'user' ? (
                <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 max-w-md">
                  <p>{message.content}</p>
                </div>
              ) : (
                <div className="max-w-3xl w-full">
                  <Card className="shadow-lg border-0 bg-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-4 h-4 text-teal-600" />
                        </div>
                        MediQuery Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {message.analysis ? (
                        <div className="space-y-4">
                          {/* Explanation */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Understanding Your Symptoms</h4>
                            <p className="text-gray-700 leading-relaxed">{message.analysis.explanation}</p>
                          </div>

                          {/* Possible Causes */}
                          {message.analysis.possibleCauses.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Possible Causes</h4>
                              <div className="space-y-2">
                                {message.analysis.possibleCauses.map((cause, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {index + 1}
                                    </Badge>
                                    <p className="text-gray-700 text-sm">{cause}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Home Remedies */}
                          {message.analysis.homeRemedies.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Self-Care Suggestions</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {message.analysis.homeRemedies.map((remedy, index) => (
                                  <li key={index} className="text-gray-700 text-sm">{remedy}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* When to See Doctor */}
                          {message.analysis.whenToSeeDoctor.length > 0 && (
                            <div className="bg-yellow-50 p-3 rounded-lg">
                              <h4 className="font-semibold text-yellow-800 mb-2">When to See a Healthcare Provider</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {message.analysis.whenToSeeDoctor.map((condition, index) => (
                                  <li key={index} className="text-yellow-700 text-sm">{condition}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Urgent Warning */}
                          {message.analysis.urgentWarnings.length > 0 && (
                            <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Seek Immediate Medical Care If:
                              </h4>
                              <ul className="list-disc list-inside space-y-1">
                                {message.analysis.urgentWarnings.map((warning, index) => (
                                  <li key={index} className="text-red-700 text-sm font-medium">{warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Generate Report Button */}
                          <div className="pt-4 border-t">
                            <Button
                              onClick={() => {
                                const userMsg = messages.find(m => m.type === 'user' && messages.indexOf(m) < messages.indexOf(message));
                                if (userMsg) {
                                  generateReport(message.analysis!, userMsg.content);
                                }
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Doctor Report (PDF)
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700">{message.content}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start mb-6">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">Analyzing your symptoms...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

        {/* Input Form */}
        <div className="sticky bottom-6">
          <Card className="shadow-xl border-0">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your symptoms... (e.g., 'I have a sore throat and mild fever for two days')"
                  className="flex-1 border-gray-200 focus:border-blue-500"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}