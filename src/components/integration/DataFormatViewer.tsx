import React, { useState } from 'react';
import { DocumentTextIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface DataFormat {
  name: string;
  description: string;
  usage: number;
  sources: string[];
  sampleData: any;
  schema?: any;
  validation?: {
    required: string[];
    optional: string[];
    types: Record<string, string>;
  };
}

interface DataFormatViewerProps {
  formats: DataFormat[];
}

export function DataFormatViewer({ formats }: DataFormatViewerProps) {
  const [expandedFormat, setExpandedFormat] = useState<string | null>(null);
  const [showSchema, setShowSchema] = useState<Record<string, boolean>>({});

  const toggleFormat = (formatName: string) => {
    setExpandedFormat(expandedFormat === formatName ? null : formatName);
  };

  const toggleSchema = (formatName: string) => {
    setShowSchema(prev => ({
      ...prev,
      [formatName]: !prev[formatName]
    }));
  };

  const formatSampleData = (data: any, formatName: string) => {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data, null, 2);
  };

  const getFormatColor = (usage: number) => {
    if (usage >= 40) return 'bg-green-100 text-green-800';
    if (usage >= 20) return 'bg-blue-100 text-blue-800';
    if (usage >= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {formats.map((format, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <div 
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleFormat(format.name)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="font-medium text-gray-900">{format.name}</h3>
                  <p className="text-sm text-gray-500">{format.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFormatColor(format.usage)}`}>
                  {format.usage}% usage
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  {expandedFormat === format.name ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-1">Data Sources:</div>
              <div className="flex flex-wrap gap-1">
                {format.sources.map((source: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {source}
                  </span>
                ))}
              </div>
            </div>

            {/* Usage bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${format.usage}%` }}
              ></div>
            </div>
          </div>

          {expandedFormat === format.name && (
            <div className="border-t bg-gray-50 p-4">
              <div className="space-y-4">
                {/* Sample Data */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Sample Data</h4>
                    {format.schema && (
                      <button
                        onClick={() => toggleSchema(format.name)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {showSchema[format.name] ? 'Hide Schema' : 'Show Schema'}
                      </button>
                    )}
                  </div>
                  <div className="bg-white border rounded p-3 overflow-x-auto">
                    <pre className="text-xs font-mono text-gray-800">
                      {formatSampleData(format.sampleData, format.name)}
                    </pre>
                  </div>
                </div>

                {/* Schema */}
                {format.schema && showSchema[format.name] && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Schema Definition</h4>
                    <div className="bg-white border rounded p-3 overflow-x-auto">
                      <pre className="text-xs font-mono text-gray-800">
                        {JSON.stringify(format.schema, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Validation Rules */}
                {format.validation && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Validation Rules</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Required Fields</div>
                        <ul className="space-y-1">
                          {format.validation.required.map((field, idx) => (
                            <li key={idx} className="text-red-600">• {field}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Optional Fields</div>
                        <ul className="space-y-1">
                          {format.validation.optional.map((field, idx) => (
                            <li key={idx} className="text-gray-600">• {field}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Field Types</div>
                        <ul className="space-y-1">
                          {Object.entries(format.validation.types).map(([field, type], idx) => (
                            <li key={idx} className="text-blue-600">
                              • {field}: <span className="font-mono text-xs">{type}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Format Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{format.sources.length}</div>
                    <div className="text-sm text-gray-600">Sources</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{format.usage}%</div>
                    <div className="text-sm text-gray-600">Usage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {format.validation ? format.validation.required.length : 0}
                    </div>
                    <div className="text-sm text-gray-600">Required Fields</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {format.validation ? Object.keys(format.validation.types).length : 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Fields</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}